import {MongoMemoryServer} from 'mongodb-memory-server';
import mongoose from "mongoose";
import request from 'supertest';
import {app} from '../app';

declare global {
    var signin: () => Promise<string[]>;
}

global.signin = async () => {
    const email = 'test@test.com';
    const password = 'password';

    const response = await request(app)
        .post('/api/users/signup')
        .send({
            email,
            password,
        })
        .expect(201);

    return response.get('Set-Cookie');
};


let mongo:any;
beforeAll(async ()=>{
    process.env.JWT_SECRET = 'xiaoxiaoheyufu';
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

afterAll(  done => {
    mongo.stop();
    mongoose.disconnect();
    done();
})