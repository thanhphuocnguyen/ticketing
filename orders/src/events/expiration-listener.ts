import { queGroupName } from "./queue-group-name";
import {
  ExpirationCompletedEvent,
  Listener,
  NotFoundError,
  OrderStatus,
  Subjects,
} from "@commonticketservice/common";
import { Message } from "node-nats-streaming";
import { Order } from "../models/order";
import { OrderCancelledPublisher } from "./order-publishers";

export class ExpirationCompleteListener extends Listener<ExpirationCompletedEvent> {
  readonly subject = Subjects.ExpirationComplete;
  queueGroupName = queGroupName;
  async onMessage(data: ExpirationCompletedEvent["data"], msg: Message) {
    const order = await Order.findById(data.orderId).populate("ticket");
    if (!order) {
      throw new NotFoundError("order");
    }
    if (order.status === OrderStatus.Complete) {
      return msg.ack();
    }
    order.set({
      status: OrderStatus.Cancelled,
    });
    await order.save();

    //run after version change!!
    await new OrderCancelledPublisher(this.client).publish({
      id: order.id,
      ticket: {
        id: order.ticket.id,
      },
      version: order.version,
    });
    msg.ack();
  }
}
