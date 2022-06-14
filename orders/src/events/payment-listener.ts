import {
  Listener,
  NotFoundError,
  OrderStatus,
  PaymentCreatedEvent,
  Subjects,
} from "@commonticketservice/common";
import { Message } from "node-nats-streaming";
import { Order } from "../models/order";
import { queGroupName } from "./queue-group-name";

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
  queueGroupName = queGroupName;
  async onMessage(data: PaymentCreatedEvent["data"], msg: Message) {
    const order = await Order.findById(data.orderId);
    if (!order) {
      throw new NotFoundError("order not found");
    }
    order.set({ status: OrderStatus.Complete });
    await order.save();

    msg.ack();
  }
}
