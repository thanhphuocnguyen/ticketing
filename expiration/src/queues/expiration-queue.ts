import Queue from "bull";
import { ExpirationCompletedPublisher } from "../events/publishers/expiration-publishers";
import { natsWrapper } from "../nats-wrapper";

interface DataType {
  orderId: string;
}
const expirationQueue = new Queue<DataType>("order:expiration", {
  redis: {
    host: process.env.REDIS_HOST,
  },
});

expirationQueue.process(async (job) => {
  await new ExpirationCompletedPublisher(natsWrapper.client).publish({
    orderId: job.data.orderId,
  });
});

export { expirationQueue };
