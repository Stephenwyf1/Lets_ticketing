import mongoose from 'mongoose';
import {DatabaseConnectionError} from '@wyf-ticketing/wyf';
import {app} from "./app";

const start = async () => {

    console.log('Starting Up')
    if(!process.env.JWT_SECRET)
        throw new Error('Secret doesn\'t exist');
    if(!process.env.Mongo_URI){
        throw new Error("Mongo Uri must be defined");
    }

    try{
        await mongoose.connect(process.env.Mongo_URI);
        console.log('Connected to MongoDB');
    }catch (err) {
        console.error(err);
        throw new DatabaseConnectionError('Error Connecting to MongoDB');
    }
    console.log()
}
app.listen(3000,()=>{
    console.log(('Listening on port 3000!!!'));
});

start();