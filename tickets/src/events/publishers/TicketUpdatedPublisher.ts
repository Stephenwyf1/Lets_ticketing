import {Publisher, Subjects, TicketUpdatedEvent} from '@wyf-ticketing/wyf';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
    readonly subject:Subjects.TicketUpdated = Subjects.TicketUpdated;
}

