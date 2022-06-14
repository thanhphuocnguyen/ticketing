import request from "supertest";
import app from "../../app";
it("return 201 on successfull sign up", async () => {
  return request(app)
    .post("/api/users/sign-up")
    .send({
      email: "test1@test.com",
      password: "Abcdef@1234",
    })
    .expect(201);
});

it("return a 400 with a invalid password", async () => {
  await request(app)
    .post("/api/users/sign-up")
    .send({
      email: "test1@test.com",
      password: "Abcdef",
    })
    .expect(400);

  await request(app)
    .post("/api/users/sign-up")
    .send({
      email: "test1@",
      password: "Abcdef@1234",
    })
    .expect(400);
});
it("should not allow a existed email", async () => {
  await request(app)
    .post("/api/users/sign-up")
    .send({
      email: "test1@test.com",
      password: "Abcdef@1234",
    })
    .expect(201);

  await request(app)
    .post("/api/users/sign-up")
    .send({
      email: "test1@test.com",
      password: "Abcdef@1234",
    })
    .expect(400);
});

it("set a cookie after succesfull sign up", async () => {
  expect(signin()).toBeDefined();
});

it("should be give user info", async () => {
  const cookie = await signin();
  const response = await request(app)
    .get("/api/users/currentUser")
    .set("Cookie", cookie)
    .send()
    .expect(200);
  expect(response.body.currentUser.email).toEqual("test1@test.com");
});

it("should return null if not authenticated", async () => {
  const response = await request(app)
    .get("/api/users/currentUser")
    .send()
    .expect(200);
  expect(response.body.currentUser).toEqual(null);
});
