import mongoose from "mongoose";
import request from "supertest";
import app from "../../app";

jest.mock("../../nats-wrapper")
it("should be return a 404 if the ticket not found", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  const res = await request(app)
    .get("/api/tickets/" + id)
    .send()
    .expect(404);
});
it("should be return ticket if the ticket is found", async () => {
  const title = "concert",
    price = 20;
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", signin())
    .send({ title, price })
    .expect(201);
  const resTicket = await request(app)
    .get("/api/tickets/" + response.body.id)
    .set("Cookie", signin())
    .send()
    .expect(200);
  expect(resTicket.body.title).toEqual(title);
  expect(resTicket.body.price).toEqual(price);
});
async function createTicket(cookie: string[]) {
  const title = "concert",
    price = 20;
  const response1 = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({ title, price });
}
it("should fetch all the tickets in db", async () => {
  const cookie = signin();
  createTicket(cookie);
  createTicket(cookie);
  createTicket(cookie);
  const res = await request(app)
    .get("/api/tickets")
    .set("Cookie", cookie)
    .send()
    .expect(200);
  expect(res.body.length).toEqual(3);
});
