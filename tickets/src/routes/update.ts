import express, { Request, Response} from "express";
import {NotFoundError, requireAuth, NotAuthorizedError, BadRequestError} from '@wyf-ticketing/wyf';
import {TicketUpdatedPublisher} from "../events/publishers/TicketUpdatedPublisher";
import {natsClient} from "../natsClient";

import {Ticket} from "../models/ticket";
import {body} from "express-validator";

const router = express.Router();

router.put('/api/tickets/:id', requireAuth,[
    body('title')
        .not()
        .isEmpty()
        .withMessage('Title is required')
    ,
    body('price')
        .isFloat({gt: 0})
        .withMessage('Price must be greater than 0')
],
    async (req:Request,res:Response)=>{
        const ticket = await Ticket.findById(req.params.id);
        if(!ticket) throw new NotFoundError("Sorry, the ticket you want doesn\'t exist");
        if(ticket.orderId) throw new BadRequestError('Ticket reserved can not be modified');
        if(ticket.userId!==req.currentUser!.id){
            // console.log(`currentUserId:${req.currentUser!.id}, ticketUserId:${ticket.userId}`);
            throw new NotAuthorizedError();
        }
        ticket.set({
            title:req.body.title,
            price:req.body.price
        });
        await ticket.save();
        await new TicketUpdatedPublisher(natsClient.client).publish({
            id: ticket.id,
            version:ticket.version,
            title: ticket.title,
            price: ticket.price,
            userId: ticket.userId,
            orderId: ticket.orderId
        })
        res.send(ticket);
});

export {router as updateTicketRouter}