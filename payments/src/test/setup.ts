import {MongoMemoryServer} from 'mongodb-memory-server';
import mongoose from "mongoose";
import jwt from 'jsonwebtoken';

declare global {
    var signin: (id?: string) => string;
}

jest.mock('../natsClient')
jest.mock('../stripe');
//    global 关键字的作用，要重新学习
let mongo:any;
beforeAll(async ()=>{
    process.env.JWT_SECRET = 'xiaoxiao';
    process.env.STRIPE_SECRET = 'dawdawggag';
    mongo = await MongoMemoryServer.create();
    const mongoURI = mongo.getUri();
    await mongoose.connect(mongoURI);
});

beforeEach(async ()=> {
    const collections = await mongoose.connection.db.collections();
    for(let collection of collections){
        await collection.deleteMany({});
    }
});

afterAll( async ()=>{
    await mongo.stop();
    await mongoose.connection.close();
})

global.signin = (id?: string) => {
    // Build a JWT payload. {id,email}
    const payload = {
        id: id || new mongoose.Types.ObjectId().toHexString(),
        email: 'wyf@wyf.com',
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET!);
    const session = {jwt:token};
    const sessionJSON = JSON.stringify(session);
    const base64 = Buffer.from(sessionJSON).toString('base64');
    return `session=${base64}==`;
}