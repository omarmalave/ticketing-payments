import { Types } from 'mongoose';
import jwt from 'jsonwebtoken';

const mongoId = () => new Types.ObjectId().toHexString();

const buildCookie = (userId?: string) => {
  const id = userId || mongoId();
  const payload = { id, email: 'test@test.com' };
  const token = jwt.sign(payload, process.env.JWT_KEY!);
  const session = { jwt: token };
  const sessionJson = JSON.stringify(session);
  const base64 = Buffer.from(sessionJson).toString('base64');

  return [`express:sess=${base64}`];
};

export { buildCookie, mongoId };
