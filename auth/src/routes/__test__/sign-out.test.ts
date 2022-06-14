import request from "supertest";
import app from "../../app";
it("should clear cooke when sign out", async () => {
  await request(app)
    .post("/api/users/sign-up")
    .send({
      email: "test1@test.com",
      password: "Abcdef@1234",
    })
    .expect(201);
  const response = await request(app)
    .post("/api/users/sign-out")
    .send({})
    .expect(200);
  console.log(response.get("Set-Cookie")[0]);
  expect(response.get("Set-Cookie")[0]).toEqual(
    "session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly"
  );
});
