import { Message } from 'node-nats-streaming';
import { Subjects, Listener, OrderCreatedEvent } from '@wyf-ticketing/wyf'
import { queueGroupName } from './queueGroupName'
import {Ticket} from "../../models/ticket";
import {TicketUpdatedPublisher} from "../publishers/TicketUpdatedPublisher";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {

  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    // Find the ticket that the order is reserving
    const ticket = await Ticket.findById(data.ticket.id);

    // if not ticket, throw error
    if(!ticket){
      throw new Error('Ticket not found');
    }

    // Mark the ticket as being reserved by setting its orderId property
    ticket.set({orderId:data.id});

    // console.log("Listener:",ticket.orderId);
    // Save the ticket
    await ticket.save();
    await new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      orderId: ticket.orderId,
      price: ticket.price,
      title: ticket.title,
      userId: ticket.userId,
      version: ticket.version,
    });
    // ack the message
    msg.ack();
  }
}
