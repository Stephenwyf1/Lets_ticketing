import request from 'supertest';
import {app} from "../../app";

it('fails when a email that does not exist is supplied', async ()=>{
    return request(app)
        .post('/api/users/signin')
        .send({
            email:'test@test.com',
            password:'password'
        })
        .expect(400);
});

it('fails when an incorrect password is supplied', async ()=>{

    await global.signin();

    await request(app)
        .post('/api/users/signin')
        .send({
            email:'test@test.com',
            password:'passwordErr'
        })
        .expect(400);
})