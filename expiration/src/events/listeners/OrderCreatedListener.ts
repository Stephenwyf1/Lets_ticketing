import {Listener, OrderCreatedEvent, Subjects} from "@wyf-ticketing/wyf";
import {queueGroupName} from "./queue-group-name";
import {Message} from "node-nats-streaming";
import {expirationQueue} from "../../queues/expirationQueue";

export class OrderCreatedListener extends Listener<OrderCreatedEvent>{

    queueGroupName = queueGroupName;
    subject: Subjects.OrderCreated = Subjects.OrderCreated;
    
    async onMessage(data: OrderCreatedEvent["data"], msg: Message){

        const expire = new Date(data.expiresAt).getTime();
        const now = new Date().getTime();
        console.log('Delay:',expire - now);

        await expirationQueue.add(
            {orderId:data.id},
            {delay: expire - now}
        );

        msg.ack();
    }

}