import {
  Listener,
  OrderCreatedEvent,
  OrderStatus,
  Subjects,
} from "@commonticketservice/common";
import { Message } from "node-nats-streaming";
import { expirationQueue } from "../../queues/expiration-queue";
import { queueGroupName } from "./queuegroupname";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
  queueGroupName = queueGroupName;
  async onMessage(data: OrderCreatedEvent["data"], msg: Message) {
    const delay = new Date(data.expiresAt).getTime() - new Date().getTime();
    // let delay = 60000;
    console.log(
      "waiting for this many miliseconds to process the message broker",
      new Date(delay).toISOString()
    );
    await expirationQueue.add({ orderId: data.id }, { delay });
    msg.ack();
  }
}
