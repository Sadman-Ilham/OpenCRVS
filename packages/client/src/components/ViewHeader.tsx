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
import * as React from 'react'

import { Header } from '@opencrvs/components/lib/interface'
import { ActionList } from '@opencrvs/components/lib/buttons'
import styled from '@client/styledComponents'
import { TopMenu } from '@client/components/TopMenu'
import { Logo } from '@opencrvs/components/lib/icons'
import { ViewHeading, IViewHeadingProps } from '@client/components/ViewHeading'
import ConnectivityStatus from '@client/components/ConnectivityStatus'
import { BodyContent } from '@opencrvs/components/lib/layout'

const HeaderWarapper = styled(Header)`
  display: block;
  justify-content: flex-end;
  padding-bottom: 50px;

  /* stylelint-disable */
  + ${ActionList} {
    /* stylelint-enable */
    margin-top: -50px;
  }
`

export class ViewHeader extends React.Component<IViewHeadingProps> {
  render() {
    const {
      title,
      description,
      breadcrumb,
      hideBackButton,
      id,
      ...otherProps
    } = this.props

    return (
      <HeaderWarapper {...otherProps}>
        <BodyContent>
          <ConnectivityStatus />
          {hideBackButton && <Logo />}
          <TopMenu hideBackButton={hideBackButton} />
          <ViewHeading {...{ title, description, breadcrumb, id }} />
          {this.props.children}
        </BodyContent>
      </HeaderWarapper>
    )
  }
}