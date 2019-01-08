import {
  IFormSection,
  ViewType,
  SELECT_WITH_OPTIONS,
  PARAGRAPH
} from 'src/forms'
import { defineMessages } from 'react-intl'

const messages = defineMessages({
  payment: {
    id: 'register.workQueue.print.payment',
    defaultMessage: 'Payment',
    description: 'The title for payment section'
  },
  paymentMethod: {
    id: 'register.workQueue.print.paymentMethod',
    defaultMessage: 'Payment method',
    description: 'The label for payment method select'
  },
  manualPaymentMethod: {
    id: 'register.workQueue.print.manualPaymentMethod',
    defaultMessage: 'Manual',
    description: 'The label for select option for manual payment method'
  },
  collectPayment: {
    id: 'register.workQueue.print.collectPayment',
    defaultMessage:
      'Please collect the payment, print the receipt and hand it over to the payee.',
    description: 'The label for collect payment paragraph'
  },
  service: {
    id: 'register.workQueue.print.serviceMonth',
    defaultMessage:
      'Service: <strong>Birth registration after {service, plural, =0 {0 month} one {1 month} other{{service} months}} of D.o.B.</strong><br/>Amount Due:',
    description: 'The label for service paragraph'
  },
  paymentAmount: {
    id: 'register.workQueue.print.paymentAmount',
    defaultMessage: '\u09F3 {paymentAmount}',
    description: 'The label for payment amount subsection'
  }
})
export const paymentFormSection: IFormSection = {
  id: 'payment',
  viewType: 'form' as ViewType,
  name: messages.payment,
  title: messages.payment,
  fields: [
    {
      name: 'paymentMethod',
      type: SELECT_WITH_OPTIONS,
      label: messages.paymentMethod,
      initialValue: 'MANUAL',
      required: true,
      validate: [],
      options: [{ value: 'MANUAL', label: messages.manualPaymentMethod }]
    },
    {
      name: 'collectPayment',
      type: PARAGRAPH,
      label: messages.collectPayment,
      initialValue: '',
      validate: []
    },
    {
      name: 'service',
      type: PARAGRAPH,
      label: messages.service,
      initialValue: '',
      validate: []
    },
    {
      name: 'paymentAmount',
      type: PARAGRAPH,
      label: messages.paymentAmount,
      initialValue: '',
      fontSize: 'h1FontStyle',
      required: false,
      validate: []
    }
  ]
}
