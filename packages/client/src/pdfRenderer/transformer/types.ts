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
import { IApplication } from '@client/applications'
import { IUserDetails } from '@client/utils/userUtils'
import { IntlShape, MessageDescriptor } from 'react-intl'
import {
  TDocumentDefinitions,
  TFontFamily,
  TFontFamilyTypes
} from 'pdfmake/build/pdfmake'
import { IOfflineData } from '@client/offline/reducer'
import { IAvailableCountries } from '@client/views/PrintCertificate/utils'

export type OptionalData = IAvailableCountries[]

export interface IPDFTemplate {
  definition: TDocumentDefinitions
  fonts: { [language: string]: { [name: string]: TFontFamilyTypes } }
  vfs: TFontFamily
  transformers?: IFieldTransformer[]
}

export type TransformerPayload =
  | IIntLabelPayload
  | IConditionExecutorPayload
  | IApplicantNamePayload
  | IFeildValuePayload
  | IDateFeildValuePayload
  | IFormattedFeildValuePayload
  | INumberFeildConversionPayload
  | IOfflineAddressPayload
  | ILanguagePayload
  | ILocationPayload
  | IPersonIdentifierValuePayload

export interface IFieldTransformer {
  field: string
  operation: string
  parameters?: TransformerPayload
  valueIndex?: number // this will allow us to pick a specific char from the whole result
}

export type TemplateTransformerData = {
  application: IApplication
  userDetails: IUserDetails
  resource: IOfflineData
}

export interface IFunctionTransformer {
  [transformerFunction: string]: (
    data: TemplateTransformerData,
    intl: IntlShape,
    payload?: TransformerPayload,
    optionalData?: OptionalData
  ) => string | null
}
export interface IIntLabelPayload {
  messageDescriptor: MessageDescriptor
  messageValues?: { [valueKey: string]: string }
}

export interface IApplicantNamePayload {
  key: {
    [event: string]: string // data key: data.child || data.deceased
  }
  format: {
    [language: string]: string[] // corresponding field names
  }
  language?: string
  allCapital?: boolean
}

export interface IFeildValuePayload {
  valueKey: string // ex: child.dob
}

export interface IDateFeildValuePayload {
  key?: {
    [event: string]: string // data key: child.dob || deceased.dod
  }
  format: string
  language?: string
  momentLocale?: {
    [language: string]: string // bn: 'locale/bn'
  }
}

export interface IFormattedFeildValuePayload {
  formattedKeys: string // ex: {child.firstName}, {child.lastName}
}

export interface INumberFeildConversionPayload {
  valueKey: string // ex: child.dob
  conversionMap: { [key: string]: string } // { 0: '০', 1: '১'}
}

export interface IOfflineAddressPayload {
  language: string
  conditionalKeys: {
    condition: {
      default?: boolean
      key?: string
      matchValues?: string[]
    }
    addressType: string
    addressKey: string
    addresses: {
      countryCode: string
      localAddress: string
      internationalAddress?: string
    }
  }[]
}

export interface ILanguagePayload {
  language: string
}

export interface ILocationPayload {
  language?: string
  jurisdictionType: string
}

export interface IPersonIdentifierValuePayload {
  idTypeKey: string // ex: mother.iDType
  idTypeValue: string // ex: NATIONAL_ID
  idValueKey: string // ex: mother.iD
}

// Based on the need, add more here
export type ExecutorKey = 'CURRENT_DATE'

export interface IEventWiseKey {
  [event: string]: string // {birth: child.dob}
}
// Based on the need, add more here
export type ConditionType = 'COMPARE_DATE_IN_DAYS'

export interface IConditionExecutorPayload {
  fromKey: IEventWiseKey | ExecutorKey
  toKey: IEventWiseKey | ExecutorKey
  conditions: {
    type: ConditionType
    minDiff: number
    maxDiff: number
    output: IIntLabelPayload // based on the we can add more type here
  }[]
}
