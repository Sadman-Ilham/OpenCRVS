/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import * as Hapi from 'hapi'
import {
  createPersonEntry,
  createRelatedPersonEntry,
  createDeathEncounterEntry,
  createBundle,
  createDeathComposition,
  createTaskEntry,
  createDeathObservation,
  getIDFromResponse,
  IIncomingAddress
} from '@bgd-dhis2-mediator/features/fhir/service'
import {
  postBundle,
  // fetchUnionByFullBBSCode,
  getLastRegLocationFromFacility,
  fetchFacilityByHRISCode
} from '@bgd-dhis2-mediator/features/fhir/api'
import {
  RUN_AS_MEDIATOR,
  MEDIATOR_URN,
  FHIR_URL
} from '@bgd-dhis2-mediator/constants'

export interface IDeathNotification {
  dhis2_event: string
  deceased: {
    first_names_en?: [string]
    last_name_en: string
    first_names_bn?: [string]
    last_name_bn: string
    sex?: 'male' | 'female' | 'unknown'
    nid?: string
    nid_spouse?: string
    date_birth: string
  }
  father: {
    first_names_en?: [string]
    last_name_en: string
    first_names_bn?: [string]
    last_name_bn: string
    nid?: string
  }
  mother: {
    first_names_en?: [string]
    last_name_en: string
    first_names_bn?: [string]
    last_name_bn: string
    nid?: string
  }
  permanent_address: IIncomingAddress
  phone_number: string
  death_date: string
  underlying_cause_of_death?: string
  place_of_death?: {
    code: string
    name: string
  }
  union_death_ocurred: {
    id: string
    name: string
  }
}

export async function deathNotificationHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const notification = request.payload as IDeathNotification

  const deceased = await createPersonEntry(
    notification.deceased.nid || null,
    notification.deceased.first_names_bn || null,
    notification.deceased.last_name_bn,
    notification.deceased.first_names_en || null,
    notification.deceased.last_name_en,
    null,
    notification.deceased.sex || 'unknown',
    null,
    notification.deceased.date_birth,
    notification.death_date,
    request.headers.authorization
  )

  // Father is always picked as Informant
  // TODO: may need to change it based on the available data from dhis2
  const informant = await createPersonEntry(
    notification.father.nid || null,
    notification.father.first_names_bn || null,
    notification.father.last_name_bn,
    notification.father.first_names_en || null,
    notification.father.last_name_en,
    notification.permanent_address,
    'male',
    notification.phone_number,
    null,
    null,
    request.headers.authorization
  )
  const relatedPerson = createRelatedPersonEntry('FATHER', informant.fullUrl)

  if (!notification.place_of_death) {
    throw new Error('Could not find any place of death')
  }
  const placeOfDeathFacilityLocation = await fetchFacilityByHRISCode(
    notification.place_of_death.code,
    request.headers.authorization
  )
  if (!placeOfDeathFacilityLocation) {
    throw new Error(
      `CANNOT FIND FACILITY LOCATION FOR DEATH NOTIFICATION: ${JSON.stringify(
        notification
      )}`
    )
  }

  const encounter = createDeathEncounterEntry(
    `Location/${placeOfDeathFacilityLocation.id}`,
    deceased.fullUrl
  )

  const composition = createDeathComposition(
    deceased.fullUrl,
    relatedPerson.fullUrl,
    encounter.fullUrl
  )

  // While DHIS2 has no integration with A2I BBS codes, this process will be temporarily used
  // It uses a hardcoded list of locations that are covered in the pilot to match to Facility api union / municipality name
  // Upazila name will be used to attempt to match union or municipality as a last resort
  // The Upazila name field is the only field that is consistently available in the DHIS2 form
  // for births and deaths in unions and municipalities permanent address

  const lastRegLocation = await getLastRegLocationFromFacility(
    placeOfDeathFacilityLocation,
    notification.permanent_address.upazila.name,
    request.headers.authorization
  )

  /*

  // When DHIS2 is integrated with A2I BBS codes, this process will be correct

  const lastRegLocId = notification.union_death_ocurred.id
  const lastRegLocation = await fetchUnionByFullBBSCode(
    lastRegLocId,
    request.headers.authorization
  )
  
  */

  if (!lastRegLocation) {
    throw new Error(
      `CANNOT FIND UNION OR MUNICIPALITY LOCATION FOR DEATH NOTIFICATION: ${JSON.stringify(
        notification
      )}`
    )
  }

  // Contact type is always passing FATHER
  // TODO: may need to change it based on the available data from dhis2
  const task = await createTaskEntry(
    composition.fullUrl,
    lastRegLocation,
    'DEATH',
    'APPLICANT',
    notification.phone_number,
    notification.dhis2_event,
    request.headers.authorization
  )

  const entries: fhir.BundleEntry[] = []
  entries.push(composition)
  entries.push(task)
  entries.push(deceased)
  entries.push(relatedPerson)
  entries.push(informant)
  entries.push(encounter)
  if (notification.underlying_cause_of_death) {
    entries.push(
      createDeathObservation(
        encounter.fullUrl,
        notification.underlying_cause_of_death,
        deceased.fullUrl,
        notification.death_date
      )
    )
  }

  const bundle = createBundle(entries)

  const startTime = new Date().toISOString()
  const response = await postBundle(bundle, request.headers.authorization)
  const endTime = new Date().toISOString()

  if (RUN_AS_MEDIATOR) {
    return h
      .response({
        'x-mediator-urn': MEDIATOR_URN,
        status: 'Successful',
        response: {
          status: 201,
          body: {
            composition_id: getIDFromResponse(response)
          }
        },
        orchestrations: [
          {
            name: 'Submit converted birth bundle',
            request: {
              path: FHIR_URL,
              method: 'POST',
              timestamp: startTime,
              body: JSON.stringify(bundle)
            },
            response: { status: 200, timestamp: endTime }
          }
        ]
      })
      .code(201)
      .header('Content-Type', 'application/json+openhim')
  }

  return h.response({ composition_id: getIDFromResponse(response) }).code(201)
}
