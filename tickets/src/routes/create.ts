import express, { Request, Response} from "express";
import {body} from "express-validator";
import {requireAuth, requestValidator} from '@wyf-ticketing/wyf';
import {Ticket} from "../models/ticket";
import {TicketCreatedPublisher} from "../events/publishers/TicketCreatedPublisher";
import {natsClient} from "../natsClient";

const router = express.Router();

router.post('/api/tickets', requireAuth,[
    body('title')
        .not()
        .isEmpty()
        .withMessage('Title is required')
    ,
    body('price')
        .isFloat({gt: 0})
        .withMessage('Price must be greater than 0')
],
    requestValidator,
    async (req:Request,res:Response)=>{
        const {title,price} = req.body;
        const ticket = Ticket.build({
            title,
            price,
            userId:req.currentUser!.id
        });
        await ticket.save();
        await new TicketCreatedPublisher(natsClient.client).publish({
            id: ticket.id,
            version:ticket.version,
            title: ticket.title,
            price: ticket.price,
            userId: ticket.userId
        });
        res.status(201).send(ticket);
    }
);

export { router as createTicketRouter }