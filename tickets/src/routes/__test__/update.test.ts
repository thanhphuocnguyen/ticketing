import mongoose from "mongoose";
import request from "supertest";
import app from "../../app";
import { natsWrapper } from "../../nats-wrapper";

jest.mock("../../nats-wrapper");
it("should return 404 if the provided id does not exist", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put("/api/tickets/" + id)
    .set("Cookie", signin())
    .send({
      title: "fasdkfasdf",
      price: 30,
    })
    .expect(404);
});
it("should return 401 if the user is not authenticated", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put("/api/tickets/" + id)
    .send({
      title: "fasdkfasdf",
      price: 30,
    })
    .expect(401);
});
it("should return 401 if the user does not own the ticket", async () => {
  const res = await request(app)
    .post("/api/tickets")
    .set("Cookie", signin())
    .send({
      title: "asdkfg",
      price: 20,
    });
  await request(app)
    .put("/api/tickets/" + res.body.id)
    .set("Cookie", signin())
    .send({
      title: "fasdkfasdf",
      price: 30,
    })
    .expect(401);
});
it("should return 404 if the user provides an invalid title or price", async () => {
  const cookie = signin();
  const res = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({
      title: "asdkfg",
      price: 20,
    });
  await request(app)
    .put("/api/tickets/" + res.body.id)
    .set("Cookie", cookie)
    .send({
      title: "fasdkfasdf",
      price: -30,
    })
    .expect(400);
  await request(app)
    .put("/api/tickets/" + res.body.id)
    .set("Cookie", cookie)
    .send({
      title: "",
      price: 80,
    })
    .expect(400);
});
it("should update the ticket provide valid input", async () => {
  const cookie = signin();
  const res = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({
      title: "asdkfg",
      price: 20,
    });
  const res2 = await request(app)
    .put("/api/tickets/" + res.body.id)
    .set("Cookie", cookie)
    .send({
      title: "fasdkfasdf",
      price: 70,
    })
    .expect(200);
  expect(res2.body.title).toEqual("fasdkfasdf");
  expect(res2.body.price).toEqual(70);
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it("should invoke event publish when updated", async () => {
  const cookie = signin();
  const res = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({
      title: "asdkfg",
      price: 20,
    });
  const res2 = await request(app)
    .put("/api/tickets/" + res.body.id)
    .set("Cookie", cookie)
    .send({
      title: "fasdkfasdf",
      price: 70,
    })
    .expect(200);
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
