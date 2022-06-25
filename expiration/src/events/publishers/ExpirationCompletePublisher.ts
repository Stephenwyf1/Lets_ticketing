import {ExpirationCompleteEvent, Publisher, Subjects} from "@wyf-ticketing/wyf";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent>{
    subject:Subjects.ExpirationComplete = Subjects.ExpirationComplete

}