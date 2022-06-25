import Queue from 'bull'
import {ExpirationCompletePublisher} from "../events/publishers/ExpirationCompletePublisher";
import {natsClient} from "../natsClient";

interface Payload{
    orderId: string
}

const expirationQueue = new Queue<Payload>('order:expiration',{
    redis:{
        host: process.env.Redis_Host
    }
});

expirationQueue.process( async (job) => {
    await new ExpirationCompletePublisher(natsClient.client).publish({
            orderId: job.data.orderId
        }
    )
    console.log('publish an expiration for order:',job.data.orderId);
});

export {expirationQueue};