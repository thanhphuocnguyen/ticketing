import {
  Listener,
  NotFoundError,
  Subjects,
  TicketCreatedEvent,
  TicketUpdatedEvent,
} from "@commonticketservice/common";
import { Message } from "node-nats-streaming";
import { Ticket } from "../models/ticket";
import { queGroupName } from "./queue-group-name";

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
  queueGroupName = queGroupName;

  async onMessage(data: TicketCreatedEvent["data"], msg: Message) {
    const { id, title, price } = data;
    const newTicket = Ticket.build({ title, price, id });
    await newTicket.save();

    msg.ack();
  }
}

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
  queueGroupName = queGroupName;
  async onMessage(data: TicketUpdatedEvent["data"], msg: Message) {
    const { title, price } = data;
    const updateTicket = await Ticket.findByEvent(data);
    if (updateTicket) {
      updateTicket.set({
        title,
        price,
      });
      await updateTicket.save();
      msg.ack();
    } else {
      throw new NotFoundError("ticket");
    }
  }
}
