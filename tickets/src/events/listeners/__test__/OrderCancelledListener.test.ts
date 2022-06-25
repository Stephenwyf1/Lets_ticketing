import {natsClient} from "../../../natsClient";
import {OrderCancelledListener} from "../OrderCancelledListener";
import {Ticket} from "../../../models/ticket";
import {OrderCancelledEvent, OrderStatus} from "@wyf-ticketing/wyf";
import mongoose from "mongoose";
import {Message} from "node-nats-streaming";

const setup = async () => {
    // Create an instance of the listener
    const listener = new OrderCancelledListener(natsClient.client);

    const orderId = new mongoose.Types.ObjectId().toHexString();
    // Create and save a ticket
    const ticket = Ticket.build({
        title: 'concert',
        price: 99,
        userId: 'asdf',
    });
    ticket.set({orderId});
    await ticket.save();

    // Create the fake data event
    const data: OrderCancelledEvent['data'] = {
        id: orderId,
        version: 0,
        ticket: {
            id: ticket.id,
        },
    };

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn(),
    };

    return { listener, ticket, data, msg, orderId };
};

it('updates the ticket, publishes an event, and acks', async function () {
    const { listener, data, msg, ticket } = await setup();
    await listener.onMessage(data, msg);

    const updatedTicket = await Ticket.findById(ticket.id);
    expect(updatedTicket!.orderId).not.toBeDefined();
    expect(msg.ack).toHaveBeenCalled();
    expect(natsClient.client.publish).toHaveBeenCalled();

});
