import request from "supertest";
import app from "../server.js"; // importa il server express

describe("POST /users", () => {
  it("should create a new user", async () => {
    const res = await request(app)
      .post("/users")
      .send({
        username: "test",
        email: "test@example.com",
        role: "base"
      });

    expect(res.status).toBe(201);
    expect(res.body.email).toBe("test@example.com");
  });
});
