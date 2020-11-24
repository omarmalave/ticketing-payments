import { Document, model, Model, Schema } from 'mongoose';

interface PaymentAttrs {
  orderId: string;
  stripeId: string;
}

interface PaymentDoc extends Document {
  orderId: string;
  stripeId: string;
}

interface PaymentModel extends Model<PaymentDoc> {
  build(attrs: PaymentAttrs): PaymentDoc;
}

const paymentSchema = new Schema(
  {
    orderId: {
      required: true,
      type: String,
    },
    stripeId: {
      required: true,
      type: String,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        return { id: ret._id, orderId: ret.orderId, stripeId: ret.stripeId };
      },
    },
  },
);

paymentSchema.statics.build = function build(attrs: PaymentAttrs) {
  return new this(attrs);
};

const Payment = model<PaymentDoc, PaymentModel>('Payment', paymentSchema);

export default Payment;
