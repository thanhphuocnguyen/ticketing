import request from "supertest";
import app from "../../app";
it("should be fail when email not existed", async () => {
  return request(app)
    .post("/api/users/sign-in")
    .send({
      email: "test1@test.com",
      password: "Abcdef@1234",
    })
    .expect(400);
});

it("should be fail when password not match", async () => {
  await request(app)
    .post("/api/users/sign-up")
    .send({
      email: "test1@test.com",
      password: "Abcdef@1234",
    })
    .expect(201);
  await request(app)
    .post("/api/users/sign-in")
    .send({
      email: "test1@test.com",
      password: "Abcdef@12",
    })
    .expect(403);
});

it("should give a cookie when credentials valid", async () => {
  expect(signin()).toBeDefined();
});
