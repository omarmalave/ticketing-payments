import { Listener, OrderCancelledEvent, OrderStatus, Subjects } from '@om_tickets/common';
import { Message } from 'node-nats-streaming';
import queueGroupName from './queue-group-name';
import Order from '../../models/order';

export default class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;

  queueGroupName = queueGroupName;

  async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
    const order = await Order.findOne({ _id: data.id, version: data.version - 1 }); // todo: created method in model

    if (!order) {
      throw new Error('Order not found');
    }

    order.set({ status: OrderStatus.Cancelled });
    await order.save();

    msg.ack();
  }
}
