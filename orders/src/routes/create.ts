import express, {Request, Response} from "express";
import {BadRequestError, NotFoundError, OrderStatus, requestValidator, requireAuth} from "@wyf-ticketing/wyf";
import {body} from "express-validator";
import {Ticket} from "../models/ticket";
import mongoose from "mongoose";
import {Order} from "../models/order";
import {natsClient} from "../natsClient";
import {OrderCreatedPublisher} from "../events/publishers/OrderCreatedPublisher";

const router = express.Router();

const EXPIRATION_WINDOW_SECONDS = 300;

router.post(
    '/api/orders',
    [
        body('ticketId')
            .not()
            .isEmpty()
            .withMessage('TicketId must be provided')
            .custom((input:string)=>mongoose.Types.ObjectId.isValid(input))
            .withMessage('TicketId must be valid')
    ],
    requireAuth,
    requestValidator,
    async (req:Request,res:Response)=>{
        const {ticketId} = req.body;

        // Find the ticket the user is trying to order int the DB
        const ticket = await Ticket.findById(ticketId);

        if(!ticket){
            throw new NotFoundError("the ticket you want doesn\'t exist");
        }

        // Make Sure this ticket is not being reserved by other order
        // Run query to look at all orders. Find an order where the ticket
        // is the ticket we just found and the order status is not cancelled.
        const isReserved = await ticket.isReserved();
        if(isReserved){
            throw new BadRequestError("the ticket is already reserved");
        }

        // Calculate an expiration date for this order
        const expiration = new Date();
        expiration.setSeconds(expiration.getSeconds()+EXPIRATION_WINDOW_SECONDS);

        // Build the order and save it to the DB
        const order = Order.build({
            userId: req.currentUser!.id,
            status: OrderStatus.Created,
            expiresAt: expiration,
            ticket
        });

        await order.save();

        // Publish an event saying that an order was created
        await new OrderCreatedPublisher(natsClient.client).publish({
            userId: order.userId,
            id: order.id,
            version: order.version,
            status: order.status,
            expiresAt: order.expiresAt.toISOString(),
            ticket: {id: ticket.id, price: ticket.price}
        });

        res.status(201).send(order);
    }
)

export {router as createOrderRouter}