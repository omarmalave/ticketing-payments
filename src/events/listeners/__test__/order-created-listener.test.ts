import { OrderCreatedEvent } from '@om_tickets/common';
import OrderStatus from '@om_tickets/common/build/messaging/types/order-status';
import { Message } from 'node-nats-streaming';
import OrderCreatedListener from '../order-created-listener';
import natsWrapper from '../../../nats-wrapper';
import { mongoId } from '../../../test/util';
import Order from '../../../models/order';

const setup = async () => {
  const listener = new OrderCreatedListener(natsWrapper.client);

  const data: OrderCreatedEvent['data'] = {
    id: mongoId(),
    version: 0,
    expiresAt: new Date().toISOString(),
    userId: mongoId(),
    status: OrderStatus.Created,
    ticket: {
      id: mongoId(),
      price: 10,
    },
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg };
};

it('replicates the order info', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const order = await Order.findById(data.id);

  expect(order!.price).toEqual(data.ticket.price);
});

it('acks the message', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
