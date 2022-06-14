import {
  PaymentCreatedEvent,
  Publisher,
  Subjects,
} from "@commonticketservice/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
}
