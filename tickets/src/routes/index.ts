import { body, param } from "express-validator";
import {
  BadRequestError,
  isAuth,
  NotAuthorizedError,
  NotFoundError,
  RequestValidationError,
  validateRequestcheck,
} from "@commonticketservice/common";
import { NextFunction, Request, Response, Router } from "express";
import { Ticket } from "../models/ticket";
import {
  TicketCreatedPublisher,
  TicketUpdatedPublisher,
} from "../events/ticket-publishers";
import { natsWrapper } from "../nats-wrapper";

const ticketRoute = Router();

ticketRoute.post(
  "/api/tickets",
  isAuth,
  [
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("price")
      .isNumeric()
      .isFloat({ gt: 0 })
      .withMessage("Must be greater than 0"),
  ],
  validateRequestcheck,
  async (req: Request, res: Response) => {
    const { title, price } = req.body;
    const ticket = Ticket.build({
      title,
      price,
      userId: req.currentUser!.id,
    });
    await ticket.save();
    const ticketPublisher = new TicketCreatedPublisher(natsWrapper.client);
    await ticketPublisher.publish({
      id: ticket.id,
      price: ticket.price,
      title: ticket.title,
      userId: ticket.userId,
      version: ticket.version,
    });
    res.status(201).send(ticket);
  }
);
ticketRoute.get(
  "/api/tickets/:id",
  async (req: Request, res: Response, next) => {
    const ticket = await Ticket.findById(req.params.id);
    if (ticket) {
      res.status(200).send(ticket);
    } else {
      throw new NotFoundError("ticket");
    }
  }
);

ticketRoute.get(
  "/api/tickets",
  async (req: Request, res: Response, next: NextFunction) => {
    const tickets = await Ticket.find({ orderId: undefined });
    if (!tickets.length) {
      throw new NotFoundError("tickets");
    }
    res.status(200).send(tickets);
  }
);

ticketRoute.put(
  "/api/tickets/:id",
  isAuth,
  [
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("price")
      .isNumeric()
      .isFloat({ gt: 0 })
      .withMessage("Must be greater than 0"),
  ],
  validateRequestcheck,
  async (req: Request, res: Response, next: NextFunction) => {
    const ticketUpdate = await Ticket.findById(req.params.id);
    if (!ticketUpdate) {
      throw new NotFoundError("ticket");
    }
    if (ticketUpdate.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    if (ticketUpdate.orderId) {
      throw new BadRequestError("ticket is reserved");
    }
    const { title, price } = req.body;
    ticketUpdate.set({ title, price });
    await ticketUpdate.save();
    await new TicketUpdatedPublisher(natsWrapper.client).publish({
      id: ticketUpdate.id,
      price: ticketUpdate.price,
      title: ticketUpdate.title,
      userId: ticketUpdate.userId,
      version: ticketUpdate.version,
    });
    res.status(200).send(ticketUpdate);
  }
);

export default ticketRoute;
