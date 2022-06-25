import express,{Request,Response} from "express";
import {Order,OrderStatus} from "../models/order";
import {NotAuthorizedError, NotFoundError, requireAuth} from "@wyf-ticketing/wyf";
import {OrderCancelledPublisher} from "../events/publishers/OrderCancelledPublisher";
import {natsClient} from "../natsClient";

const router = express.Router();

router.delete('/api/orders/:orderId', requireAuth, async (req:Request,res:Response)=>{

    const {orderId} = req.params;
    const order = await Order.findById(orderId).populate('ticket');

    if(!order){
        throw new NotFoundError('The order you trying to delete does\' t exist');
    }

    if(order.userId !== req.currentUser!.id){
        throw new NotAuthorizedError();
    }

    order.status = OrderStatus.Cancelled;
    await order.save();

    // Publish an event saying that an order was cancelled
    await new OrderCancelledPublisher(natsClient.client).publish({
        id: order.id,
        ticket: {id:order.ticket.id},
        version: order.version
    })
    res.status(204).send(order);
})

export {router as deleteOrderRouter}