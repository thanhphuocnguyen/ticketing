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
import { PaymentCreatedPublisher } from "../events/payment-publisher";
import Order from "../models/order";
import Payment from "../models/payment";
import { natsWrapper } from "../nats-wrapper";
import { stripe } from "../stripe";
const paymentRouter = Router();

paymentRouter.post(
  "/api/payments",
  isAuth,
  [body("token").notEmpty(), body("orderId").notEmpty()],
  validateRequestcheck,
  async (req: Request, res: Response) => {
    const { token, orderId } = req.body;
    const order = await Order.findById(orderId);

    if (!order) {
      throw new NotFoundError("order not found");
    }
    if (order.userId !== req.currentUser?.id) {
      throw new NotAuthorizedError();
    }
    if (order.status == OrderStatus.Cancelled) {
      throw new BadRequestError(
        "Cant not handle payment for a cancelled order"
      );
    }

    const charge = await stripe.charges.create({
      currency: "usd",
      amount: order.price * 100,
      source: token,
      description: `TEST PAYMENT WITH ${order.id}`,
    });
    const newPayment = Payment.build({
      orderId,
      stripeId: charge.id,
    });
    await newPayment.save();

    await new PaymentCreatedPublisher(natsWrapper.client).publish({
      id: newPayment.id,
      orderId: newPayment.orderId,
      stripeId: newPayment.stripeId,
    });

    res
      .status(201)
      .send({ orderId: newPayment.orderId, stripeId: newPayment.stripeId });
  }
);

export default paymentRouter;
