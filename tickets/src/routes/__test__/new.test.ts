import request from "supertest";
import app from "../../app";
import { Ticket } from "../../models/ticket";
import { natsWrapper } from "../../nats-wrapper";

jest.mock("../../nats-wrapper");

it("should have a route handler listening to /api/tickets for post request =)))", async () => {
  const res = await request(app).post("/api/tickets").send({});
  expect(res.status).not.toEqual(404);
});
it("can only be accessed if the user is signed in", async () => {
  await request(app).post("/api/tickets").send({}).expect(401);
});
it("should return other status if the user is signed in", async () => {
  const res = await request(app)
    .post("/api/tickets")
    .set("Cookie", signin())
    .send({});
  expect(res.status).not.toEqual(401);
});
it("should return an error if an invalid title", async () => {
  await request(app)
    .post("/api/tickets")
    .set("Cookie", signin())
    .send({
      title: "",
      price: 10,
    })
    .expect(400);
});

it("should return an error if an invalid price is provided", async () => {
  await request(app)
    .post("/api/tickets")
    .set("Cookie", signin())
    .send({
      title: "fdsaf",
      price: -100,
    })
    .expect(400);

  await request(app)
    .post("/api/tickets")
    .set("Cookie", signin())
    .send({
      title: "fdsaf",
      price: "sdfasdf",
    })
    .expect(400);
});
it("should create a ticket with valid inputs", async () => {
  let tickets = await Ticket.find({});
  expect(tickets.length).toEqual(0);
  const res = await request(app)
    .post("/api/tickets")
    .set("Cookie", signin())
    .send({
      title: "asdkfg",
      price: 20,
    })
    .expect(201);
  tickets = await Ticket.find({});
  expect(tickets.length).toEqual(1);
  expect(tickets[0].price).toEqual(20);
  expect(tickets[0].title).toEqual("asdkfg");
});

it("shoul invoke the event publish", async () => {
  const res = await request(app)
    .post("/api/tickets")
    .set("Cookie", signin())
    .send({
      title: "asdkfg",
      price: 20,
    })
    .expect(201);
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
