
import {OrderCreatedEvent, Publisher, Subjects} from "@wyf-ticketing/wyf";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
    subject: Subjects.OrderCreated = Subjects.OrderCreated;
}