import express,{Request,Response} from "express";
import {NotAuthorizedError, NotFoundError, requireAuth} from "@wyf-ticketing/wyf";
import {Order} from "../models/order";
import {body, check} from "express-validator";
import mongoose from "mongoose";

const router = express.Router();

router.get('/api/orders/:orderId'
    ,requireAuth,
    [
        check('orderId')
            .custom((input => mongoose.Types.ObjectId.isValid(input)))
            .withMessage("The id of the Order is inValid")
    ],
    async (req:Request,res:Response)=>{
    const order = await Order.findById(req.params.orderId).populate('ticket');
    if(!order){
        throw new NotFoundError('The order doesn\'t exist');
    }
    if(order.userId !== req.currentUser!.id){
        throw new NotAuthorizedError();
    }
    res.send(order);
})

export {router as showOrderRouter}