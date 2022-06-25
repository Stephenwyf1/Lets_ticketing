import request from 'supertest';
import {app} from "../../app";

it('clears the cookie after signing out', async ()=>{
    await global.signin();

    const res = request(app)
        .post('/api/users/signout')
        .send({})
        .expect(200);

    expect(res.get('Set-Cookie')).toBeUndefined()

});

