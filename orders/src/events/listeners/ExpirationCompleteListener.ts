import { Message } from 'node-nats-streaming';
import { Subjects, Listener, ExpirationCompleteEvent, NotFoundError, OrderStatus } from '@wyf-ticketing/wyf'
import { queueGroupName } from './queue-group-name';
import { Order } from "../../models/order";
import { OrderCancelledPublisher } from "../publishers/OrderCancelledPublisher";

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
    subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
    queueGroupName = queueGroupName;

    async onMessage(data: ExpirationCompleteEvent['data'], msg: Message) {
        const order = await Order.findById(data.orderId).populate('ticket');

        if(!order){
            throw new NotFoundError('Order you want does not exist');
        }
        if(order.status === OrderStatus.Complete){
            return msg.ack();
        }
        order.set({
            status: OrderStatus.Cancelled,
        });
        await order.save();

        await new OrderCancelledPublisher(this.client).publish({
            id: order.id,
            version: order.version,
            ticket: {
                id: order.ticket.id
            }
        });
        msg.ack();
    }
}
