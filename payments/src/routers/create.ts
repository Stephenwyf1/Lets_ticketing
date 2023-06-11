import {
    requireAuth,
    requestValidator,
    NotFoundError,
    NotAuthorizedError,
    OrderStatus,
    BadRequestError
} from "@wyf-ticketing/wyf";
import {Order} from "../models/order";
import express, {Response, Request} from "express";
import {body} from "express-validator";
import {stripe} from "../stripe";
import {Payment} from "../models/payment";
import {PaymentCreatedPublisher} from "../events/publishers/PaymentCreatedPublisher";
import {natsClient} from "../natsClient";

const router = express.Router();

router.post(
    "/api/payments/create",
    requireAuth,
    [
        body("token").not().isEmpty(),
        body("orderId").not().isEmpty()
    ],
    requestValidator,
    async (req: Request, res: Response) => {
        const {token, orderId} = req.body;

        const order = await Order.findById(orderId);

        if (!order) {
            throw new NotFoundError("Not Found");
        }
        if (order.userId !== req.currentUser!.id) {
            throw new NotAuthorizedError();
        }
        if (order.status === OrderStatus.Cancelled) {
            throw new BadRequestError("Cannot pay for an cancelled order");
        }

        const charge = await stripe.charges.create({
            currency: "usd",
            amount: order.price * 100,
            source: token,
        });
        const payment = Payment.build({
            orderId,
            stripeId: charge.id,
        });
        await payment.save();
        await new PaymentCreatedPublisher(natsClient.client).publish({
            id: payment.id,
            orderId: payment.orderId,
            stripeId: payment.stripeId,
        });

        res.status(201).send({id: payment.id});
    }
);

export {router as createChargeRouter};