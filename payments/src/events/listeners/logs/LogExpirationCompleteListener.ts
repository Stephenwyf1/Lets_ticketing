import {
    ExpirationCompleteEvent,
    Subjects,
    Listener,
} from '@wyf-ticketing/wyf';
import { Message } from 'node-nats-streaming';
import {eventEmitter} from "../../eventEmitter";
import { logGroupName } from '../queueGroupName';

export class LogExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
    subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
    queueGroupName = logGroupName;

    async onMessage(data: ExpirationCompleteEvent['data'], msg: Message) {
        // console.log("Event Emitted", data);
        eventEmitter.emit('log', data, this.subject);
        msg.ack();
    }
}
