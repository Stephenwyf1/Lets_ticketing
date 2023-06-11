import {
    PaymentCreatedEvent,
    Subjects,
    Listener,
} from '@wyf-ticketing/wyf';
import { Message } from 'node-nats-streaming';
import {eventEmitter} from "../../eventEmitter";
import { logGroupName } from '../queueGroupName';

export class LogPaymentCreatedListener extends Listener<PaymentCreatedEvent> {
    subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
    queueGroupName = logGroupName;

    async onMessage(data: PaymentCreatedEvent['data'], msg: Message) {
        // console.log("Event Emitted", data);
        eventEmitter.emit('log', data, this.subject);
        msg.ack();
    }
}
