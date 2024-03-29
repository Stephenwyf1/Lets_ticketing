import mongoose from "mongoose";
import {Ticket} from "../../../models/ticket";
import {TicketUpdatedEvent} from "@wyf-ticketing/wyf";
import {TicketUpdatedListener} from "../TicketUpdatedListener";
import {natsClient} from "../../../natsClient";

const setup = async () => {
  // Create a listener
  const listener = new TicketUpdatedListener(natsClient.client);

  // Create and save a ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20,
  });
  await ticket.save();

  // Create a fake data object
  const data: TicketUpdatedEvent['data'] = {
    id: ticket.id,
    version: ticket.version + 1,
    title: 'new concert',
    price: 999,
    userId: 'ablskdjf',
    orderId: 'dawdwagagfadawd'
  };

  // Create a fake msg object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  // return all of this stuff
  return { msg, data, ticket, listener };
};

it('finds, updates, and saves a ticket', async () => {
  const { msg, data, ticket, listener } = await setup();

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.title).toEqual(data.title);
  expect(updatedTicket!.price).toEqual(data.price);
  expect(updatedTicket!.version).toEqual(data.version);
});

it('acks the message', async () => {
  const { msg, data, listener } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it('does not call ack if the event has a skipped version number', async () => {
  const {msg, data, ticket, listener} = await setup();
  data.version = 10;
  try {
    await listener.onMessage(data, msg)
  } catch (err) {}
  expect(msg.ack).not.toHaveBeenCalled();
})