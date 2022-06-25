import express, {Request, Response} from "express";
import {NotFoundError} from '@wyf-ticketing/wyf';
import {Ticket} from "../models/ticket";

const router = express.Router();

router.get('/api/tickets/:id', async (req:Request,res:Response)=>{
    const ticket = await Ticket.findById(req.params.id);
    if(!ticket){
        return new NotFoundError("Sorry, the ticket you want doesn\'t exist");
    }
    res.send(ticket);
});

export {router as showTicketRouter}