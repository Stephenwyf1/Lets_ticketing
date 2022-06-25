import mongoose from 'mongoose';
import {DatabaseConnectionError} from '@wyf-ticketing/wyf';
import {app} from "./app";
import {natsClient} from "./natsClient";
import {OrderCreatedListener} from "./events/listeners/OrderCreatedListener";
import {OrderCancelledListener} from "./events/listeners/OrderCancelledListener";

const start = async () => {
    if(!process.env.JWT_SECRET)
        throw new Error('Secret doesn\'t exist');

    if(!process.env.Mongo_URI){
        throw new Error("Mongo Uri must be defined");
    }
    if(!process.env.Nats_Client_Id){
        throw new Error("Nats Client Id  must be defined");
    }
    if(!process.env.Nats_URL){
        throw new Error("Nats URL must be defined");
    }
    if(!process.env.Nats_Cluster_Id){
        throw new Error("Nats Cluster Id must be defined");
    }

    try{
        await natsClient.connect(
            process.env.Nats_Cluster_Id,
            process.env.Nats_Client_Id,
            process.env.Nats_URL
        );

        natsClient.client.on('close',()=>{
            console.log('NATS connection closed');
            process.exit();
        });

        process.on('SIGINT',()=>natsClient.client.close());
        process.on('SIGTERM',()=>natsClient.client.close());

        new OrderCancelledListener(natsClient.client);
        new OrderCreatedListener(natsClient.client);

        await mongoose.connect(process.env.Mongo_URI);
        console.log('Connected to MongoDB');

    }catch (err) {
        console.error(err);
        throw new DatabaseConnectionError('Error Connecting to MongoDB');
    }
}
app.listen(3000,()=>{
    console.log(('Listening on port 3000!!!'));
});

start();