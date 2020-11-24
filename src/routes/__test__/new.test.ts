import request from 'supertest';
import OrderStatus from '@om_tickets/common/build/messaging/types/order-status';
import app from '../../app';
import { buildCookie, mongoId } from '../../test/util';
import Order from '../../models/order';
import stripe from '../../stripe';
import Payment from '../../models/payment';

it('returns a 404 when purchasing an order that does not exist', async () => {
  await request(app)
    .post('/api/payments')
    .set('Cookie', buildCookie())
    .send({
      token: 'blabla',
      orderId: mongoId(),
    })
    .expect(404);
});

it('returns a 401 when purchasing an order that does not belong the user', async () => {
  const order = Order.build({
    id: mongoId(),
    userId: mongoId(),
    version: 0,
    price: 10,
    status: OrderStatus.Created,
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', buildCookie())
    .send({
      token: 'blabla',
      orderId: order.id,
    })
    .expect(401);
});

it('returns a 400 when purchasing a cancelled order', async () => {
  const userId = mongoId();

  const order = Order.build({
    id: mongoId(),
    userId,
    version: 0,
    price: 10,
    status: OrderStatus.Cancelled,
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', buildCookie(userId))
    .send({
      token: 'blabla',
      orderId: order.id,
    })
    .expect(400);
});

it('returns a 204 with valid inputs', async () => {
  const userId = mongoId();
  const price = Math.floor(Math.random() * 100000);

  const order = Order.build({
    id: mongoId(),
    userId,
    version: 0,
    price,
    status: OrderStatus.Created,
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', buildCookie(userId))
    .send({
      token: 'tok_visa',
      orderId: order.id,
    })
    .expect(201);

  const stripeCharges = await stripe.charges.list({ limit: 50 });
  const stripeCharge = stripeCharges.data.find((charge) => charge.amount === price * 100);
  expect(stripeCharge).toBeDefined();

  const payment = await Payment.findOne({
    orderId: order.id,
    stripeId: stripeCharge!.id,
  });
  expect(payment).not.toBeNull();
});
