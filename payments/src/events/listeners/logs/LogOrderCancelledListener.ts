import {
    OrderCancelledEvent,
    Subjects,
    Listener,
} from '@wyf-ticketing/wyf';
import { Message } from 'node-nats-streaming';
import {eventEmitter} from "../../eventEmitter";
import { logGroupName } from '../queueGroupName';

export class LogOrderCancelledListener extends Listener<OrderCancelledEvent> {
    subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
    queueGroupName = logGroupName;

    async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
        // console.log("Event Emitted", data);
        eventEmitter.emit('log', data, this.subject);
        msg.ack();
    }
}
