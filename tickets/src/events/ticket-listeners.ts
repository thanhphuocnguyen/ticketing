import {
  Listener,
  NotFoundError,
  OrderCancelledEvent,
  OrderCreatedEvent,
  OrderStatus,
  Subjects,
} from "@commonticketservice/common";
import { Message } from "node-nats-streaming";
import { Ticket } from "../models/ticket";
import { natsWrapper } from "../nats-wrapper";
import {
  TicketCreatedPublisher,
  TicketUpdatedPublisher,
} from "./ticket-publishers";
import { queGroupName } from "./types";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
  queueGroupName = queGroupName;
  async onMessage(data: OrderCreatedEvent["data"], msg: Message) {
    const reserveTicket = await Ticket.findById(data.ticket.id);
    if (!reserveTicket) {
      throw new NotFoundError("ticket");
    }
    reserveTicket.set({ orderId: data.id });

    await reserveTicket.save();

    await new TicketUpdatedPublisher(this.client).publish({
      id: reserveTicket.id,
      price: reserveTicket.price,
      title: reserveTicket.title,
      userId: reserveTicket.userId,
      version: reserveTicket.version,
      orderId: reserveTicket.orderId,
    });

    msg.ack();
  }
}

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
  queueGroupName = queGroupName;
  async onMessage(data: OrderCancelledEvent["data"], msg: Message) {
    const cancelledTicket = await Ticket.findById(data.ticket.id);
    if (!cancelledTicket) {
      throw new NotFoundError("ticket");
    }
    cancelledTicket.set({ orderId: undefined });
    await cancelledTicket.save();

    await new TicketUpdatedPublisher(this.client).publish({
      id: cancelledTicket.id,
      price: cancelledTicket.price,
      title: cancelledTicket.title,
      userId: cancelledTicket.userId,
      version: cancelledTicket.version,
      orderId: cancelledTicket.orderId,
    });

    msg.ack();
  }
}
