import * as React from 'react'
import { injectIntl, InjectedIntlProps, defineMessages } from 'react-intl'
import styled from '../../styled-components'
import { Modal } from '@opencrvs/components/lib/interface'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'

const PreviewButton = styled.a`
  text-decoration: underline;
  color: ${({ theme }) => theme.colors.primary};
`

export const messages = defineMessages({
  preview: {
    id: 'review.edit.modal.preview',
    defaultMessage: 'Back to Preview',
    description: 'Preview button on edit modal'
  },
  submitButton: {
    id: 'review.edit.modal.editButton',
    defaultMessage: 'Edit',
    description: 'Edit button on edit modal'
  }
})

interface IProps {
  show: boolean
  handleEdit: () => void
  handleClose: () => void
}

const EditConfirmationComponent = ({
  show,
  handleEdit,
  handleClose,
  intl
}: IProps & InjectedIntlProps) => {
  return (
    <Modal
      title="Are you sure you want to edit the application?"
      actions={[
        <PrimaryButton key="edit" id="edit_confirm" onClick={handleEdit}>
          {intl.formatMessage(messages.submitButton)}
        </PrimaryButton>,
        <PreviewButton key="preview" id="preview_back" onClick={handleClose}>
          {intl.formatMessage(messages.preview)}
        </PreviewButton>
      ]}
      show={show}
      handleClose={handleClose}
    >
      <></>
    </Modal>
  )
}

export const EditConfirmation = injectIntl(EditConfirmationComponent)