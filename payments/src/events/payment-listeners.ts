import {
  Listener,
  NotFoundError,
  OrderCancelledEvent,
  OrderCreatedEvent,
  OrderStatus,
  Subjects,
} from "@commonticketservice/common";
import { Message } from "node-nats-streaming";
import Order from "../models/order";
import { queueGroupName } from "./queue-group-name";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
  queueGroupName = queueGroupName;
  async onMessage(data: OrderCreatedEvent["data"], msg: Message) {
    const {
      id,
      ticket: { price },
      userId,
      status,
      version,
    } = data;
    const paymentOrder = Order.build({ id, price, userId, status, version });
    await paymentOrder.save();
    msg.ack();
  }
}
export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
  queueGroupName = queueGroupName;
  async onMessage(data: OrderCancelledEvent["data"], msg: Message) {
    const cancelledOrder = await Order.findByEvent(data);

    if (!cancelledOrder) {
      throw new NotFoundError("order");
    }
    cancelledOrder.set({ status: OrderStatus.Cancelled });
    await cancelledOrder.save();
    msg.ack();
  }
}
