import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import { CurrentUser, ErrorHandler, NotFoundError } from '@om_tickets/common';
import createChargeRouter from './routes/new';

const app = express();
app.set('trust proxy', true);

app.use(json());
app.use(
  cookieSession({
    signed: false,
    secure: false,
  }),
);

app.use(CurrentUser);

app.use(createChargeRouter);

app.all('*', async () => {
  throw new NotFoundError();
});

app.use(ErrorHandler);

export default app;
