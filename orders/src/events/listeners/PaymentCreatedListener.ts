import {Listener, PaymentCreatedEvent, Subjects} from "@wyf-ticketing/wyf";
import {Message} from "node-nats-streaming";
import {queueGroupName} from './queue-group-name'
import {Order} from "../../models/order";
import {NotFoundError, OrderStatus} from "@wyf-ticketing/wyf";
export class PaymentCreatedListener extends Listener<PaymentCreatedEvent>{
    subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
    queueGroupName = queueGroupName;
    async onMessage(data:PaymentCreatedEvent['data'], msg:Message){
        const order = await Order.findById(data.orderId);
        if(!order){
            throw new NotFoundError('Order not found');
        }
        order.set({status: OrderStatus.Complete});
        await order.save();

        msg.ack();
    }
}