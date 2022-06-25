import {Publisher,Subjects,TicketCreatedEvent} from '@wyf-ticketing/wyf';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
    readonly subject:Subjects.TicketCreated = Subjects.TicketCreated;
}

