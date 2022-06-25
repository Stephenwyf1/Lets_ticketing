import request from "supertest";
import {app} from "../../app";
import {Ticket} from "../../models/ticket";
import {Order} from "../../models/order";
import {OrderStatus} from "@wyf-ticketing/wyf";
import {natsClient} from "../../natsClient";
import mongoose from "mongoose";

it('makes an order as cancelled', async function () {

    // create a ticket with Ticket Model
    const ticket = Ticket.build({
        title: 'concert',
        price: 20,
        id: new mongoose.Types.ObjectId().toHexString()
    });
    await ticket.save();
    const user = global.signin();

    // make a request to create an order
    const {body:order} = await request(app)
        .post('/api/orders')
        .set('Cookie',user)
        .send({ticketId: ticket.id})
        .expect(201);

    // make a request to cancel the order
    await request(app)
        .delete(`/api/orders/${order.id}`)
        .set('Cookie',user)
        .send({ticketId: ticket.id})
        .expect(204);

    // expectation to make sure the thing is cancelled
    const updatedOrder = await Order.findById(order.id);

    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);

});

it('emits a order cancelled event',async function (){
    const ticket = Ticket.build({
        title: 'concert',
        price: 20,
        id: new mongoose.Types.ObjectId().toHexString()
    });
    await ticket.save();

    await request(app)
        .post('/api/orders')
        .set('Cookie',global.signin())
        .send({ticketId:ticket.id})
        .expect(201);

    expect(natsClient.client.publish).toHaveBeenCalled();

});