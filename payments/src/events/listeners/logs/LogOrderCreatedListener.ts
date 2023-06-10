import {
    OrderCreatedEvent,
    Subjects,
    Listener,
} from '@wyf-ticketing/wyf';
import { Message } from 'node-nats-streaming';
import {eventEmitter} from "../../eventEmitter";
import { logGroupName } from '../queueGroupName';

export class LogOrderCreatedListener extends Listener<OrderCreatedEvent> {
    subject: Subjects.OrderCreated = Subjects.OrderCreated;
    queueGroupName = logGroupName;

    async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
        // console.log("Event Emitted", data);
        eventEmitter.emit('log', data, this.subject);
        msg.ack();
    }
}
