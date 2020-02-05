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

import { push, goBack as back, replace } from 'connected-react-router'
import {
  SELECT_BIRTH_INFORMANT,
  SELECT_DEATH_INFORMANT,
  HOME,
  SEARCH_RESULT,
  DRAFT_BIRTH_PARENT_FORM,
  DRAFT_BIRTH_APPLICANT_FORM,
  DRAFT_DEATH_FORM,
  SELECT_VITAL_EVENT,
  REVIEW_DUPLICATES,
  CERTIFICATE_COLLECTOR,
  REGISTRAR_HOME_TAB,
  FIELD_AGENT_HOME_TAB,
  SEARCH,
  APPLICATION_DETAIL,
  SETTINGS,
  SYS_ADMIN_HOME_TAB,
  CREATE_USER,
  CREATE_USER_SECTION,
  SELECT_BIRTH_PRIMARY_APPLICANT,
  SELECT_BIRTH_MAIN_CONTACT_POINT,
  SELECT_DEATH_MAIN_CONTACT_POINT,
  VERIFY_COLLECTOR,
  REVIEW_CERTIFICATE,
  PRINT_CERTIFICATE_PAYMENT,
  PERFORMANCE_REPORT_LIST,
  PERFORMANCE_REPORT
} from '@client/navigation/routes'
import { loop, Cmd } from 'redux-loop'
import { getCurrentUserScope } from '@client/utils/authUtils'
import { Event } from '@client/forms'
import { PERFORMANCE_REPORT_TYPE_MONTHLY } from '@client/utils/constants'
import { ISearchLocation } from '@opencrvs/components/lib/interface'

export interface IDynamicValues {
  [key: string]: any
}

export function formatUrl(url: string, props: { [key: string]: string }) {
  const formattedUrl = Object.keys(props).reduce(
    (str, key) => str.replace(`:${key}`, props[key]),
    url
  )
  return formattedUrl.endsWith('?') ? formattedUrl.slice(0, -1) : formattedUrl
}

export const GO_TO_PAGE = 'navigation/GO_TO_PAGE'
type GoToPageAction = {
  type: typeof GO_TO_PAGE
  payload: {
    pageRoute: string
    applicationId: string
    pageId: string
    groupId?: string
    event: string
    fieldNameHash?: string
    historyState?: IDynamicValues
  }
}

export const GO_TO_REGISTRAR_HOME = 'navigation/GO_TO_REGISTRAR_HOME'
type GoToRegistrarHome = {
  type: typeof GO_TO_REGISTRAR_HOME
  payload: {
    tabId: string
  }
}

export const GO_TO_FIELD_AGENT_HOME = 'navigation/GO_TO_FIELD_AGENT_HOME'
type GoToFieldAgentHome = {
  type: typeof GO_TO_FIELD_AGENT_HOME
  payload: {
    tabId: string
  }
}

export type Action =
  | GoToPageAction
  | GoToRegistrarHome
  | GoToFieldAgentHome
  | GoToSysAdminHome
export const GO_TO_SYS_ADMIN_HOME = 'navigation/GO_TO_SYS_ADMIN_HOME'
type GoToSysAdminHome = {
  type: typeof GO_TO_SYS_ADMIN_HOME
  payload: {
    tabId: string
  }
}

export function goToBirthInformant(applicationId: string) {
  return push(
    formatUrl(SELECT_BIRTH_INFORMANT, {
      applicationId
    })
  )
}

export function goToDeathInformant(applicationId: string) {
  return push(
    formatUrl(SELECT_DEATH_INFORMANT, {
      applicationId
    })
  )
}

export function goToBirthContactPoint(applicationId: string) {
  return push(
    formatUrl(SELECT_BIRTH_MAIN_CONTACT_POINT, {
      applicationId
    })
  )
}

export function goToDeathContactPoint(applicationId: string) {
  return push(
    formatUrl(SELECT_DEATH_MAIN_CONTACT_POINT, {
      applicationId
    })
  )
}

export function goToEvents() {
  return push(SELECT_VITAL_EVENT)
}

export function goBack() {
  return back()
}

export function goToHome() {
  return push(HOME)
}

export function goToHomeTab(tabId: string, selectorId: string = '') {
  const path = getCurrentUserScope().includes('declare')
    ? FIELD_AGENT_HOME_TAB
    : REGISTRAR_HOME_TAB
  return push(formatUrl(path, { tabId, selectorId }))
}

export function goToPerformanceHome() {
  return push(
    formatUrl(PERFORMANCE_REPORT_LIST, {
      reportType: PERFORMANCE_REPORT_TYPE_MONTHLY
    })
  )
}

export function goToPerformanceReport(
  selectedLocation: ISearchLocation,
  reportType: string,
  eventType: Event,
  timeStart: Date,
  timeEnd: Date
) {
  return push(PERFORMANCE_REPORT, {
    selectedLocation,
    reportType,
    timeRange: { start: timeStart, end: timeEnd },
    eventType
  })
}

export function goToSearchResult(
  searchText: string,
  searchType: string,
  mobile?: boolean
) {
  return mobile
    ? replace(
        formatUrl(SEARCH_RESULT, {
          searchText,
          searchType
        })
      )
    : push(
        formatUrl(SEARCH_RESULT, {
          searchText,
          searchType
        })
      )
}

export function goToSearch() {
  return push(SEARCH)
}

export function goToApplicationDetails(
  applicationId: string,
  forceDetailsQuery?: boolean
) {
  return push(formatUrl(APPLICATION_DETAIL, { applicationId }), {
    forceDetailsQuery
  })
}

export function goToBirthRegistrationAsParent(applicationId: string) {
  return push(
    formatUrl(DRAFT_BIRTH_PARENT_FORM, {
      applicationId: applicationId.toString()
    })
  )
}
export function goToApplicationContact(informant: string) {
  return push(
    formatUrl(DRAFT_BIRTH_APPLICANT_FORM, {
      informant: informant.toString()
    })
  )
}
export function goToPrimaryApplicant(applicationId: string) {
  return push(
    formatUrl(SELECT_BIRTH_PRIMARY_APPLICANT, {
      applicationId
    })
  )
}
export function goToReviewDuplicate(applicationId: string) {
  return push(
    formatUrl(REVIEW_DUPLICATES, { applicationId: applicationId.toString() })
  )
}

export function goToPrintCertificate(
  registrationId: string,
  event: string,
  groupId?: string
) {
  return push(
    formatUrl(CERTIFICATE_COLLECTOR, {
      registrationId: registrationId.toString(),
      eventType: event.toLowerCase().toString(),
      groupId: groupId || 'certCollector'
    })
  )
}

export function goToReviewCertificate(registrationId: string, event: Event) {
  return push(
    formatUrl(REVIEW_CERTIFICATE, {
      registrationId: registrationId.toString(),
      eventType: event
    })
  )
}

export function goToVerifyCollector(
  registrationId: string,
  event: string,
  collector: string
) {
  return push(
    formatUrl(VERIFY_COLLECTOR, {
      registrationId: registrationId.toString(),
      eventType: event.toLowerCase().toString(),
      collector: collector.toLowerCase().toString()
    })
  )
}

export function goToPrintCertificatePayment(
  registrationId: string,
  event: Event
) {
  return push(
    formatUrl(PRINT_CERTIFICATE_PAYMENT, {
      registrationId: registrationId.toString(),
      eventType: event
    })
  )
}

export function goToDeathRegistration(applicationId: string) {
  return push(
    formatUrl(DRAFT_DEATH_FORM, { applicationId: applicationId.toString() })
  )
}

export function goToRegistrarHomeTab(tabId: string, selectorId?: string) {
  return {
    type: GO_TO_REGISTRAR_HOME,
    payload: { tabId, selectorId }
  }
}

export function goToFieldAgentHomeTab(tabId: string) {
  return {
    type: GO_TO_FIELD_AGENT_HOME,
    payload: { tabId }
  }
}

export function goToSysAdminHomeTab(tabId: string) {
  return {
    type: GO_TO_SYS_ADMIN_HOME,
    payload: { tabId }
  }
}

export function goToSettings() {
  return push(SETTINGS)
}

export function goToCreateNewUser() {
  return push(CREATE_USER)
}

export const GO_TO_CREATE_USER_SECTION = 'navigation/GO_TO_CREATE_USER_SECTION'
type GoToCreateUserSection = {
  type: typeof GO_TO_CREATE_USER_SECTION
  payload: {
    sectionId: string
    nextGroupId: string
    userFormFieldNameHash?: string
    formHistoryState?: IDynamicValues
  }
}

export function goToCreateUserSection(
  sectionId: string,
  nextGroupId: string,
  fieldNameHash?: string,
  historyState?: IDynamicValues
): GoToCreateUserSection {
  return {
    type: GO_TO_CREATE_USER_SECTION,
    payload: {
      sectionId,
      nextGroupId,
      userFormFieldNameHash: fieldNameHash,
      formHistoryState: historyState
    }
  }
}

export function goToPageGroup(
  pageRoute: string,
  applicationId: string,
  pageId: string,
  groupId: string,
  event: string,
  fieldNameHash?: string,
  historyState?: IDynamicValues
) {
  return {
    type: GO_TO_PAGE,
    payload: {
      applicationId,
      pageId,
      groupId,
      event,
      fieldNameHash,
      pageRoute,
      historyState
    }
  }
}

export function goToPage(
  pageRoute: string,
  applicationId: string,
  pageId: string,
  event: string,
  fieldNameHash?: string,
  historyState?: IDynamicValues
) {
  return {
    type: GO_TO_PAGE,
    payload: {
      applicationId,
      pageId,
      event,
      fieldNameHash,
      pageRoute,
      historyState
    }
  }
}

export type INavigationState = undefined

export function navigationReducer(state: INavigationState, action: any) {
  switch (action.type) {
    case GO_TO_PAGE:
      const {
        fieldNameHash,
        applicationId,
        pageId,
        groupId,
        event,
        pageRoute,
        historyState
      } = action.payload
      return loop(
        state,
        Cmd.action(
          push(
            formatUrl(pageRoute, {
              applicationId: applicationId.toString(),
              pageId,
              groupId,
              event
            }) + (fieldNameHash ? `#${fieldNameHash}` : ''),
            historyState
          )
        )
      )
    case GO_TO_REGISTRAR_HOME:
      const {
        tabId: RegistrarHomeTabId,
        selectorId: RegistrarHomeSelectorId = ''
      } = action.payload
      return loop(
        state,
        Cmd.action(
          push(
            formatUrl(REGISTRAR_HOME_TAB, {
              tabId: RegistrarHomeTabId,
              selectorId: RegistrarHomeSelectorId
            })
          )
        )
      )
    case GO_TO_FIELD_AGENT_HOME:
      const { tabId: FieldAgentHomeTabId } = action.payload
      return loop(
        state,
        Cmd.action(
          push(formatUrl(FIELD_AGENT_HOME_TAB, { tabId: FieldAgentHomeTabId }))
        )
      )
    case GO_TO_SYS_ADMIN_HOME:
      const { tabId: SysAdminHomeTabId } = action.payload
      return loop(
        state,
        Cmd.action(
          push(formatUrl(SYS_ADMIN_HOME_TAB, { tabId: SysAdminHomeTabId }))
        )
      )
    case GO_TO_CREATE_USER_SECTION:
      const {
        sectionId,
        nextGroupId,
        userFormFieldNameHash,
        formHistoryState
      } = action.payload
      return loop(
        state,
        Cmd.action(
          push(
            formatUrl(CREATE_USER_SECTION, {
              sectionId,
              groupId: nextGroupId
            }) + (userFormFieldNameHash ? `#${userFormFieldNameHash}` : ''),
            formHistoryState
          )
        )
      )
  }
}
