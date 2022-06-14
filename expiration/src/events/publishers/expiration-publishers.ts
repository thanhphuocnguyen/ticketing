import {
  ExpirationCompletedEvent,
  Publisher,
  Subjects,
} from "@commonticketservice/common";

export class ExpirationCompletedPublisher extends Publisher<ExpirationCompletedEvent> {
  readonly subject = Subjects.ExpirationComplete;
}
