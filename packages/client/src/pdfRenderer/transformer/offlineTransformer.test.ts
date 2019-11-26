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
  mockApplicationData,
  userDetails,
  mockOfflineData
} from '@client/tests/util'
import { offlineTransformers } from '@client/pdfRenderer/transformer/offlineTransformer'
import { createIntl } from 'react-intl'
import { Event } from '@client/forms'
import { TemplateTransformerData } from './types'

describe('PDF template offline data related field transformer tests', () => {
  const data: TemplateTransformerData = {
    application: {
      id: 'sample',
      data: mockApplicationData,
      event: Event.BIRTH
    },
    userDetails,
    resource: mockOfflineData
  }
  describe('OfflineAddress transformer tests', () => {
    it('Returns right offline address', () => {
      const intl = createIntl({
        locale: 'en'
      })

      const transformedValue = offlineTransformers.OfflineAddress(
        data,
        intl,
        {
          language: 'en',
          conditionalKeys: [
            {
              condition: {
                key: 'child.placeOfBirth',
                matchValues: ['HEALTH_FACILITY']
              },
              addressType: 'facilities',
              addressKey: 'name',
              addresses: {
                countryCode: 'BGD',
                localAddress: '{child.birthLocation}'
              }
            },
            {
              condition: {
                key: 'child.placeOfBirth',
                matchValues: ['PRIVATE_HOME', 'OTHER']
              },
              addressType: 'locations',
              addressKey: 'name',
              addresses: {
                countryCode: 'child.country',
                localAddress:
                  '{child.addressLine4}, {child.district}, {child.state}, {child.country}'
              }
            }
          ]
        },
        [
          {
            language: 'en',
            countries: [
              {
                value: 'BGD',
                name: 'Bangladesh'
              }
            ]
          }
        ]
      )
      expect(transformedValue).toEqual(
        'Shaheed Taj Uddin Ahmad Medical College'
      )
    })
    it('Returns default offline address with running any condition', () => {
      const intl = createIntl({
        locale: 'en'
      })

      const transformedValue = offlineTransformers.OfflineAddress(
        data,
        intl,
        {
          language: 'en',
          conditionalKeys: [
            {
              condition: {
                default: true
              },
              addressType: 'facilities',
              addressKey: 'name',
              addresses: {
                countryCode: 'BGD',
                localAddress: '{child.birthLocation}'
              }
            }
          ]
        },
        [
          {
            language: 'en',
            countries: [
              {
                value: 'BGD',
                name: 'Bangladesh'
              }
            ]
          }
        ]
      )
      expect(transformedValue).toEqual(
        'Shaheed Taj Uddin Ahmad Medical College'
      )
    })
    it('Throws exception if parameter is missing', () => {
      const intl = createIntl({
        locale: 'en'
      })

      expect(() => offlineTransformers.OfflineAddress(data, intl)).toThrowError(
        'No payload found for this transformer'
      )
    })
    it('Throws exception if parameter is missing for wrong payload', () => {
      const intl = createIntl({
        locale: 'en'
      })

      expect(() =>
        offlineTransformers.OfflineAddress(
          data,
          intl,
          {
            language: 'en',
            conditionalKeys: [
              {
                condition: {
                  default: false
                },
                addressType: 'facilities',
                addressKey: 'name',
                addresses: {
                  countryCode: 'BGD',
                  localAddress: '{child.birthLocation}'
                }
              }
            ]
          },
          [
            {
              language: 'en',
              countries: [
                {
                  value: 'BGD',
                  name: 'Bangladesh'
                }
              ]
            }
          ]
        )
      ).toThrowError('No condition has matched for this transformer')
    })
    it('Throws exception if no condition matches', () => {
      const intl = createIntl({
        locale: 'en'
      })

      expect(() =>
        offlineTransformers.OfflineAddress(
          data,
          intl,
          {
            language: 'en',
            conditionalKeys: [
              {
                condition: {
                  key: 'child.placeOfBirth',
                  matchValues: ['INVALID']
                },
                addressType: 'locations',
                addressKey: 'name',
                addresses: {
                  countryCode: 'child.country',
                  localAddress:
                    '{child.addressLine4}, {child.district}, {child.state}, {child.country}'
                }
              },
              {
                condition: {
                  key: 'child.invalid',
                  matchValues: ['INVALID']
                },
                addressType: 'facilities',
                addressKey: 'name',
                addresses: {
                  countryCode: 'BGD',
                  localAddress: '{child.birthLocation}'
                }
              }
            ]
          },
          [
            {
              language: 'en',
              countries: [
                {
                  value: 'BGD',
                  name: 'Bangladesh'
                }
              ]
            }
          ]
        )
      ).toThrowError('No condition has matched for this transformer')
    })
    it('Returns the expected output when no key is defined to replace as param', () => {
      const intl = createIntl({
        locale: 'en'
      })

      const transformedValue = offlineTransformers.OfflineAddress(
        data,
        intl,
        {
          language: 'en',
          conditionalKeys: [
            {
              condition: {
                key: 'child.placeOfBirth',
                matchValues: ['HEALTH_FACILITY']
              },
              addressType: 'facilities',
              addressKey: 'name',
              addresses: {
                countryCode: 'BGD',
                localAddress: 'Dummy output'
              }
            }
          ]
        },
        [
          {
            language: 'en',
            countries: [
              {
                value: 'BGD',
                name: 'Bangladesh'
              }
            ]
          }
        ]
      )
      expect(transformedValue).toEqual('Dummy output')
    })
  })
  it('Returns address and country', () => {
    const intl = createIntl({
      locale: 'en'
    })
    const otherPlaceOfBirth = { ...data }
    otherPlaceOfBirth.application.data.child.placeOfBirth = 'PRIVATE_HOME'
    otherPlaceOfBirth.application.data.child.country = 'BGD'
    otherPlaceOfBirth.application.data.child.state =
      '65cf62cb-864c-45e3-9c0d-5c70f0074cb4'
    otherPlaceOfBirth.application.data.child.district =
      'bc4b9f99-0db3-4815-926d-89fd56889407'

    const transformedValue = offlineTransformers.OfflineAddress(
      otherPlaceOfBirth,
      intl,
      {
        language: 'en',
        conditionalKeys: [
          {
            condition: {
              key: 'child.placeOfBirth',
              matchValues: ['HEALTH_FACILITY']
            },
            addressType: 'facilities',
            addressKey: 'name',
            addresses: {
              countryCode: 'BGD',
              localAddress: '{child.birthLocation}'
            }
          },
          {
            condition: {
              key: 'child.placeOfBirth',
              matchValues: ['PRIVATE_HOME', 'OTHER']
            },
            addressType: 'locations',
            addressKey: 'name',
            addresses: {
              countryCode: 'child.country',
              localAddress: '{child.district}, {child.state}, {child.country}',
              internationalAddress:
                '{child.internationalDistrict}, {child.internationalState}, {child.country}'
            }
          }
        ]
      },
      [
        {
          language: 'en',
          countries: [
            {
              value: 'BGD',
              name: 'Bangladesh'
            }
          ]
        }
      ]
    )
    expect(transformedValue).toEqual('BARGUNA, Barisal, Bangladesh')
  })
  it('Returns international address', () => {
    const intl = createIntl({
      locale: 'en'
    })
    const internationalPlaceOfBirth = { ...data }
    internationalPlaceOfBirth.application.data.child.placeOfBirth =
      'PRIVATE_HOME'
    internationalPlaceOfBirth.application.data.child.country = 'ARB'
    internationalPlaceOfBirth.application.data.child.state = ''
    //@ts-ignore
    internationalPlaceOfBirth.application.data.child.district = undefined
    internationalPlaceOfBirth.application.data.child.internationalState =
      'My state'
    internationalPlaceOfBirth.application.data.child.internationalDistrict =
      'My district'

    const transformedValue = offlineTransformers.OfflineAddress(
      internationalPlaceOfBirth,
      intl,
      {
        language: 'en',
        conditionalKeys: [
          {
            condition: {
              key: 'child.placeOfBirth',
              matchValues: ['HEALTH_FACILITY']
            },
            addressType: 'facilities',
            addressKey: 'name',
            addresses: {
              countryCode: 'BGD',
              localAddress: '{child.birthLocation}'
            }
          },
          {
            condition: {
              key: 'child.placeOfBirth',
              matchValues: ['PRIVATE_HOME', 'OTHER']
            },
            addressType: 'locations',
            addressKey: 'name',
            addresses: {
              countryCode: 'child.country',
              localAddress:
                '{child.addressLine4}, {child.district}, {child.state}, {child.country}',
              internationalAddress:
                '{child.internationalDistrict}, {child.internationalState}, {child.country}'
            }
          }
        ]
      },
      [
        {
          language: 'en',
          countries: [
            {
              value: 'BGD',
              name: 'Bangladesh'
            },
            {
              value: 'ARB',
              name: 'Aruba'
            }
          ]
        }
      ]
    )
    expect(transformedValue).toEqual('My district, My state, Aruba')
  })
})
