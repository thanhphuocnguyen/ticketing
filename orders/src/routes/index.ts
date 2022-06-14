import {
  OrderCancelledPublisher,
  OrderCreatedPublisher,
} from "../events/order-publishers";
import {
  BadRequestError,
  isAuth,
  NotAuthorizedError,
  NotFoundError,
  OrderStatus,
  validateRequestcheck,
} from "@commonticketservice/common";
import { Request, Response, Router } from "express";
import { body } from "express-validator";
import { Order } from "../models/order";
import { Ticket } from "../models/ticket";
import { natsWrapper } from "../nats-wrapper";

const EXPIRATION_WINDOW_SECONDS = 15 * 60;

const orderRoute = Router();

orderRoute.post(
  "/api/orders",
  isAuth,
  [
    body("ticketId")
      .notEmpty()
      .withMessage("TickedId is required")
      .isMongoId()
      .withMessage("Invalid id"),
  ],
  validateRequestcheck,
  async function (req: Request, res: Response) {
    const { ticketId } = req.body;
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError("ticket");
    }
    const invalidOrder = await ticket.isReserved();
    if (invalidOrder) {
      throw new BadRequestError("ticket is already reserved");
    }

    let expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);
    const order = Order.build({
      userId: req.currentUser!.id,
      ticket: ticket.id,
      status: OrderStatus.Created,
      expiresAt: expiration,
    });
    await order.save();
    await new OrderCreatedPublisher(natsWrapper.client).publish({
      id: order.id,
      status: order.status,
      expiresAt: order.expiresAt.toISOString(),
      userId: order.userId,
      version: order.version,
      ticket: {
        id: ticket.id,
        price: ticket.price,
      },
    });
    res.status(201).send(order);
  }
);

export default orderRoute;

orderRoute.get("/api/orders", isAuth, async (req: Request, res: Response) => {
  const orders = await Order.find({ userId: req.currentUser?.id }).populate(
    "ticket"
  );
  res.status(200).send(orders);
});

orderRoute.delete(
  "/api/orders/:id",
  isAuth,
  async function (req: Request, res: Response) {
    const { id } = req.params;
    const order = await Order.findById(id).populate("ticket");

    if (!order) {
      throw new NotFoundError("order");
    }
    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }
    order.status = OrderStatus.Cancelled;
    await order.save();
    await new OrderCancelledPublisher(natsWrapper.client).publish({
      id: order.id,
      version: order.version,
      ticket: {
        id: order.ticket.id,
      },
    });
    res.status(204).send(order);
  }
);

orderRoute.get(
  "/api/orders/:id",
  isAuth,
  async (req: Request, res: Response) => {
    const order = await Order.findById(req.params.id).populate("ticket");

    if (!order) {
      throw new NotFoundError("order");
    }
    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }
    res.status(200).send(order);
  }
);
