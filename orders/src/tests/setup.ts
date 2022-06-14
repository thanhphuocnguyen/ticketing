import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
let mongo: any;

declare global {
  var signin: () => string[];
}
jest.mock("../nats-wrapper");
beforeAll(async () => {
  process.env.JWT_KEY = "afdef";

  mongo = await MongoMemoryServer.create();

  const mongoUri = await mongo.getUri();
  await mongoose.connect(mongoUri);
});

beforeEach(async () => {
  jest.clearAllMocks();
  const collections = await mongoose.connection.db.collections();

  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongo.stop();
});

global.signin = () => {
  const email = "test1@test.com";
  const id = new mongoose.Types.ObjectId().toHexString();
  const token = jwt.sign({ email, id }, process.env.JWT_KEY!);
  const session = { jwt: token };
  const ssJson = JSON.stringify(session);
  const base64 = Buffer.from(ssJson).toString("base64");
  return [`session=${base64}`];
};
