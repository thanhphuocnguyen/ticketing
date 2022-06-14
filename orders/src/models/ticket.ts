import { OrderStatus } from "@commonticketservice/common";
import mongoose, { version } from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";
import { Order } from "./order";

interface TicketAttrs {
  id: string;
  title: string;
  price: number;
}

export interface TicketDoc extends mongoose.Document {
  title: string;
  price: number;
  version: number;
  isReserved(): Promise<boolean>;
}

interface TicketModel extends mongoose.Model<TicketDoc> {
  build(attrs: TicketAttrs): TicketDoc;
  findByEvent(data: { id: string; version: number }): Promise<TicketDoc | null>;
}

const ticketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

ticketSchema.set("versionKey", "version");
ticketSchema.plugin(updateIfCurrentPlugin);
// ticketSchema.pre("save", function (done) {
//   // @ts-ignore
//   this.$where = {
//     version: this.get("version") - 1,
//   };
//   done();
// });
ticketSchema.statics.build = (attrs: TicketAttrs) => {
  return new Ticket({ title: attrs.title, _id: attrs.id, price: attrs.price });
};
ticketSchema.statics.findByEvent = (data: { id: string; version: number }) => {
  return Ticket.findOne({
    _id: data.id,
    version: data.version - 1,
  });
};
ticketSchema.methods.isReserved = async function () {
  const invalidOrder = await Order.findOne({
    ticket: this as any,
    status: {
      $in: [
        OrderStatus.Created,
        OrderStatus.Complete,
        OrderStatus.AwatingPayment,
      ],
    },
  });
  return !!invalidOrder;
};
const Ticket = mongoose.model<TicketDoc, TicketModel>("ticket", ticketSchema);
export { Ticket };
