import {PaymentCreatedEvent, Publisher, Subjects} from "@wyf-ticketing/wyf";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent>{
    subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
}