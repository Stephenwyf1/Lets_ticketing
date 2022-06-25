import {OrderCancelledEvent, Publisher, Subjects} from "@wyf-ticketing/wyf";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
    subject:Subjects.OrderCancelled = Subjects.OrderCancelled;
}
