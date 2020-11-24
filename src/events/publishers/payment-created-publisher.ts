import { PaymentCreatedEvent, Publisher, Subjects } from '@om_tickets/common';

export default class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
}
