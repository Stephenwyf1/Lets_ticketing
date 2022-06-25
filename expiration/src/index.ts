import {natsClient} from "./natsClient";
import {OrderCreatedListener} from "./events/listeners/OrderCreatedListener";

const start = async () => {

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

        new OrderCreatedListener(natsClient.client).listen();

    }catch (err) {
        console.error(err);
    }
}

start();