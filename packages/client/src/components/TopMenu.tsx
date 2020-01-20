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
import {
  defineMessages,
  WrappedComponentProps as IntlShapeProps,
  injectIntl,
  MessageDescriptor
} from 'react-intl'
import { connect } from 'react-redux'
import { Scope } from '@client/utils/authUtils'
import { ArrowBack } from '@opencrvs/components/lib/icons'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'
import { getScope } from '@client/profile/profileSelectors'
import styled from '@client/styledComponents'
import {
  goBack as goBackAction,
  goToHome as goToHomeAction,
  goToPerformanceHome as goToPerformanceAction
} from '@client/navigation'
import { redirectToAuthentication } from '@client/profile/profileActions'
import { getLanguages } from '@client/i18n/selectors'
import { IStoreState } from '@client/store'
import { IntlState } from '@client/i18n/reducer'
import { changeLanguage as changeLanguageAction } from '@client/i18n/actions'
import { HamburgerMenu } from '@opencrvs/components/lib/interface'

const messages: {
  [key: string]: MessageDescriptor
} = defineMessages({
  back: {
    id: 'buttons.back',
    defaultMessage: 'Back',
    description: 'Back button in the menu'
  },
  menu: {
    id: 'buttons.menu',
    defaultMessage: 'Menu',
    description: 'Menu'
  },
  homepage: {
    id: 'buttons.homepage',
    defaultMessage: 'Homepage',
    description: 'Menu item homepage'
  },
  performance: {
    id: 'constants.performance',
    defaultMessage: 'Performance',
    description: 'Menu item performance'
  },
  register: {
    id: 'buttons.register',
    defaultMessage: 'Register',
    description: 'Menu item register'
  },
  drafts: {
    id: 'buttons.drafts',
    defaultMessage: 'Drafts',
    description: 'Menu item drafts'
  },
  settings: {
    id: 'buttons.settings',
    defaultMessage: 'Settings',
    description: 'Menu item settings'
  },
  logout: {
    id: 'buttons.logout',
    defaultMessage: 'Log out',
    description: 'Menu item logout'
  },
  changeLanguage: {
    id: 'buttons.changeLanguage',
    defaultMessage: 'Change Language',
    description: 'Menu item changeLanguage'
  },
  english: {
    id: 'languages.english',
    defaultMessage: 'English',
    description: 'Menu item english'
  },
  bengali: {
    id: 'languages.bengali',
    defaultMessage: 'Bengali',
    description: 'Menu item bengali'
  }
})

const TopMenuContainer = styled.div`
  height: 90px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const BackButtonContainer = styled.div`
  cursor: pointer;
  margin-left: ${({ theme }) => theme.grid.margin}px;
`

const BackButton = styled(PrimaryButton)`
  width: 69px;
  height: 42px;
  background: ${({ theme }) => theme.colors.primary};
  justify-content: center;
  border-radius: 21px;
`

const BackButtonText = styled.span`
  ${({ theme }) => theme.fonts.bodyBoldStyle};
  text-transform: capitalize;
  margin-left: 14px;
`

type Props = {
  hideBackButton?: true | false | undefined | null
  goBack: typeof goBackAction
  goToHome: typeof goToHomeAction
  goToPerformance: typeof goToPerformanceAction
  changeLanguage: typeof changeLanguageAction
  redirectToAuthentication: typeof redirectToAuthentication
  languages: IntlState['languages']
  userScope: Scope | null
}

interface IState {
  showLogoutModal: boolean
}
type IFullProps = Props & IntlShapeProps

class TopMenuComponent extends React.Component<IFullProps, IState> {
  goToPerformance = () => {
    this.props.goToPerformance()
  }
  goToHome = () => {
    this.props.goToHome()
  }
  render() {
    const { intl, goBack, hideBackButton, userScope } = this.props

    const menuItems = [
      {
        title: intl.formatMessage(messages.changeLanguage),
        key: 'change-language',
        isSubMenu: true,
        menuItems: [
          {
            title: 'English',
            key: 'english',
            onClick: this.props.changeLanguage.bind(null, { language: 'en' })
          },
          {
            title: 'বাংলা',
            key: 'bengali',
            onClick: this.props.changeLanguage.bind(null, { language: 'bn' })
          }
        ]
      },
      {
        title: intl.formatMessage(messages.homepage),
        key: 'homepage',
        onClick: this.goToHome
      },
      {
        title: intl.formatMessage(messages.logout),
        key: 'logout',
        onClick: this.props.redirectToAuthentication
      }
    ]
    if ((userScope && userScope.indexOf('performance')) !== -1) {
      menuItems
        .splice(2, 0, {
          title: intl.formatMessage(messages.performance),
          key: 'performance',
          onClick: this.goToPerformance
        })
        .join()
    }

    return (
      <TopMenuContainer>
        {!hideBackButton && (
          <BackButtonContainer onClick={goBack}>
            <BackButton icon={() => <ArrowBack />} />
            <BackButtonText>{intl.formatMessage(messages.back)}</BackButtonText>
          </BackButtonContainer>
        )}
        <HamburgerMenu
          menuItems={menuItems}
          menuTitle={intl.formatMessage(messages.menu)}
        />
      </TopMenuContainer>
    )
  }
}

export const TopMenu = connect(
  (state: IStoreState) => ({
    languages: getLanguages(state),
    userScope: getScope(state),
    language: state.i18n.language
  }),
  {
    goToHome: goToHomeAction,
    goToPerformance: goToPerformanceAction,
    goBack: goBackAction,
    changeLanguage: changeLanguageAction,
    redirectToAuthentication
  }
)(injectIntl<'intl', IFullProps>(TopMenuComponent))