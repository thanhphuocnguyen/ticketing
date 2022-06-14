import { OrderStatus } from "@commonticketservice/common";
import mongoose from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

interface OrderAttr {
  id: string;
  version: number;
  userId: string;
  price: number;
  status: OrderStatus;
}

interface OrderDoc extends mongoose.Document {
  version: number;
  userId: string;
  price: number;
  status: OrderStatus;
}

interface OrderModel extends mongoose.Model<OrderDoc> {
  build(attr: OrderAttr): OrderDoc;
  findByEvent(data: { id: string; version: number }): Promise<OrderDoc | null>;
}

const orderSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    price: { type: Number, required: true },
    status: {
      type: String,
      required: true,
      enum: Object.values(OrderStatus),
      default: OrderStatus.Created,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);
orderSchema.set("versionKey", "version");
orderSchema.plugin(updateIfCurrentPlugin);

orderSchema.statics.findByEvent = (data: { id: string; version: number }) => {
  return Order.findOne({
    _id: data.id,
    version: data.version - 1,
  });
};

orderSchema.statics.build = (attr: OrderAttr) => {
  return new Order({
    _id: attr.id,
    version: attr.version,
    userId: attr.userId,
    price: attr.price,
    status: attr.status,
  });
};

const Order = mongoose.model<OrderDoc, OrderModel>("order", orderSchema);

export default Order;
