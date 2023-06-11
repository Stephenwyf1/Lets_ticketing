import {
    TicketUpdatedEvent,
    Subjects,
    Listener,
} from '@wyf-ticketing/wyf';
import { Message } from 'node-nats-streaming';
import {eventEmitter} from "../../eventEmitter";
import { logGroupName } from '../queueGroupName';

export class LogTicketUpdatedListener extends Listener<TicketUpdatedEvent> {
    subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
    queueGroupName = logGroupName;

    async onMessage(data: TicketUpdatedEvent['data'], msg: Message) {
        // console.log("Event Emitted", data);
        eventEmitter.emit('log', data, this.subject);
        msg.ack();
    }
}
