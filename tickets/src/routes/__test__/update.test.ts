import request from "supertest";
import {app} from "../../app";
import mongoose from "mongoose";
import {natsClient} from "../../natsClient";
import {Ticket} from "../../models/ticket";

it('returns 404 if the provided id does not exist', function () {
    const id = new mongoose.Types.ObjectId().toHexString();
    request(app)
        .put(`/api/tickets/${id}`)
        .set('Cookie', global.signin())
        .send({
            title:'adwagaga',
            price: 20
        })
        .expect(404);
});

it('returns 401 if the user is not authenticated', function () {
    const id = new mongoose.Types.ObjectId().toHexString();
    request(app)
        .put(`/api/tickets/${id}`)
        .send({
            title:'adwagaga',
            price: 20
        })
        .expect(401);
});

it('returns 401 if the user does not own the ticket', async function () {
    const res = await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title:'adwagaga',
            price: 20
        })
        .expect(201);

    request(app)
        .put(`/api/tickets/${res.body.id}`)
        .set('Cookie', global.signin())
        .send({
            title:'adwagaasdadga',
            price: 220
        })
        .expect(401)

});

it('returns a 400 if the user provides an invalid title or pirce',async function (){
    const cookie = global.signin();

    const res = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title:'adwagaga',
            price: 20
        })
        .expect(201);

    request(app)
        .put(`/api/tickets/${res.body.id}`)
        .set('Cookie', cookie)
        .send({
            title:'',
            price: 20
        })
        .expect(400)

    request(app)
        .put(`/api/tickets/${res.body.id}`)
        .set('Cookie', cookie)
        .send({
            title:'asdawavaGV',
            price: -20
        })
        .expect(400)

});

it('updates the ticket provided valid inputs',async function (){
    const cookie = global.signin();

    const res = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title:'adwagaga',
            price: 20
        })
        .expect(201);;

    await request(app)
        .put(`/api/tickets/${res.body.id}`)
        .set('Cookie', cookie)
        .send({
            title:'new title',
            price: 100
        })
        .expect(200);

    const ticketRes = await request(app)
        .get(`/api/tickets/${res.body.id}`)
        .send()

    expect(ticketRes.body.title).toEqual('new title');
    expect(ticketRes.body.price).toEqual(100);
});

it('publishes an event', async () => {
    const cookie = global.signin();

    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: 'asldkfj',
            price: 20,
        });

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: 'new title',
            price: 100,
        })
        .expect(200);

    expect(natsClient.client.publish).toHaveBeenCalled();
});

it('reject updates if the ticket is reserved', async () => {
    const cookie = global.signin();

    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: 'asldkfj',
            price: 20,
        })
        .expect(201);

    const ticket = await Ticket.findById(response.body.id);
    ticket!.set({orderId:new mongoose.Types.ObjectId().toHexString()});
    await ticket!.save();

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: 'new title',
            price: 100,
        })
        .expect(400);

});