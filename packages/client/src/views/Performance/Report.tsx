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
import {
  ICON_ALIGNMENT,
  TertiaryButton
} from '@opencrvs/components/lib/buttons'
import { BackArrow } from '@opencrvs/components/lib/icons'
import { buttonMessages } from '@client/i18n/messages'
import { goBack } from '@client/navigation'
import styled from '@client/styledComponents'
import { PERFORMANCE_REPORT_TYPE_MONTHLY } from '@client/utils/constants'
import { Header } from '@client/views/Performance/utils'
import React, { useState } from 'react'
import { injectIntl, WrappedComponentProps } from 'react-intl'
import { connect } from 'react-redux'
import { RouteComponentProps } from 'react-router'
import { PerformanceContentWrapper } from './PerformanceContentWrapper'
import { NoResultMessage } from './NoResultMessage'
import { generateLocations } from '@client/utils/locationUtils'
import {
  LocationSearch,
  ISearchLocation
} from '@opencrvs/components/lib/interface'
import { getOfflineData } from '@client/offline/selectors'
import { IOfflineData } from '@client/offline/reducer'
import { IStoreState } from '@client/store'
import { Query } from '@client/components/Query'
import { PERFORMANCE_METRICS } from '@client/views/Performance/metricsQuery'
import {
  GQLCertificationPaymentMetrics,
  GQLRegistrationMetrics,
  GQLRegistrationGenderBasisMetrics,
  GQLRegistrationTimeFrameMetrics
} from '@opencrvs/gateway/src/graphql/schema'
import { ApolloError } from 'apollo-client'
import {
  TimeFrameReports,
  GenderBasisReports,
  CertificationPaymentReports
} from '@client/views/Performance/reports'
import moment from 'moment'
import { Event } from '@client/forms'
import { isEmpty, get } from 'lodash'

const BackButton = styled(TertiaryButton)`
  margin-top: 24px;
`

const ReportWrapper = styled.div`
  margin-top: 16px;
`

interface ReportProps {
  selectedLocation: ISearchLocation
  timeRange: { start: Date; end: Date }
  reportType: string
  eventType: Event
  goBack: typeof goBack
  offlineResources: IOfflineData
}

interface IMetricsQueryResult {
  fetchRegistrationMetrics: GQLRegistrationMetrics
}

type Props = ReportProps &
  WrappedComponentProps &
  RouteComponentProps<
    {},
    {},
    {
      selectedLocation: ISearchLocation
      reportType: string
      eventType: Event
      timeRange: { start: Date; end: Date }
    }
  >

function ReportComponent(props: Props) {
  const [selectedLocation, setSelectedLocation] = useState<ISearchLocation>(
    props.selectedLocation
  )

  const { reportType, timeRange, intl, eventType } = props
  const { start, end } = timeRange

  const title = moment(start).format('MMMM YYYY')
  return (
    <PerformanceContentWrapper tabId={reportType}>
      <BackButton
        align={ICON_ALIGNMENT.LEFT}
        icon={() => <BackArrow />}
        onClick={props.goBack}
      >
        {intl.formatMessage(buttonMessages.back)}
      </BackButton>
      <Header>{title}</Header>
      <LocationSearch
        locationList={generateLocations(props.offlineResources.locations)}
        selectedLocation={selectedLocation}
        searchHandler={item => {
          setSelectedLocation(item)
        }}
      />
      <Query
        query={PERFORMANCE_METRICS}
        variables={{
          event: eventType,
          timeStart: start.toISOString(),
          timeEnd: end.toISOString(),
          locationId: selectedLocation.id
        }}
      >
        {({
          loading,
          error,
          data
        }: {
          loading: boolean
          error?: ApolloError
          data?: IMetricsQueryResult
        }) => {
          if (
            !loading &&
            isEmpty(get(data, 'fetchRegistrationMetrics.timeFrames.details')) &&
            isEmpty(
              get(data, 'fetchRegistrationMetrics.genderBasisMetrics.details')
            ) &&
            isEmpty(get(data, 'fetchRegistrationMetrics.payments.details'))
          ) {
            return (
              <NoResultMessage
                id="reports"
                searchedLocation={selectedLocation.displayLabel}
              />
            )
          } else {
            return (
              <ReportWrapper>
                <GenderBasisReports
                  eventType={eventType}
                  loading={loading}
                  genderBasisMetrics={
                    (data &&
                      (data.fetchRegistrationMetrics &&
                        (data.fetchRegistrationMetrics
                          .genderBasisMetrics as GQLRegistrationGenderBasisMetrics))) ||
                    {}
                  }
                />
                <TimeFrameReports
                  eventType={eventType}
                  loading={loading}
                  data={
                    (data &&
                      (data.fetchRegistrationMetrics &&
                        (data.fetchRegistrationMetrics
                          .timeFrames as GQLRegistrationTimeFrameMetrics))) ||
                    {}
                  }
                />
                <CertificationPaymentReports
                  eventType={eventType}
                  loading={loading}
                  data={
                    (data &&
                      (data.fetchRegistrationMetrics &&
                        (data.fetchRegistrationMetrics
                          .payments as GQLCertificationPaymentMetrics))) ||
                    {}
                  }
                />
              </ReportWrapper>
            )
          }
        }}
      </Query>
    </PerformanceContentWrapper>
  )
}

function mapStateToProps(state: IStoreState, props: Props) {
  return {
    reportType:
      (props.location.state && props.location.state.reportType) ||
      PERFORMANCE_REPORT_TYPE_MONTHLY,
    eventType: props.location.state && props.location.state.eventType,
    timeRange: (props.location.state && props.location.state.timeRange) || {
      start: new Date(),
      end: new Date()
    },
    selectedLocation: props.location.state!.selectedLocation,
    offlineResources: getOfflineData(state)
  }
}

export const Report = connect(
  mapStateToProps,
  { goBack }
)(injectIntl(ReportComponent))
