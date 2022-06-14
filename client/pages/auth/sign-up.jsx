import { useState } from "react";
import useRequest from "../../src/hooks/useRequest";
import { Router, useRouter } from "next/router";
export default function SignUpForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { doRequest, err } = useRequest({
    method: "post",
    url: "/api/users/sign-up",
    body: {
      email,
      password,
    },
    onSuccess: () => router.push("/"),
  });
  const onSubmit = async (event) => {
    event.preventDefault();
    await doRequest();
  };
  return (
    <form className="" onSubmit={onSubmit}>
      <h1>Sign up</h1>
      <div className="form-group">
        <label>Email Address</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="form-control"
        />
      </div>
      <div className="form-group">
        <label>Password</label>
        <input
          type={"password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="form-control"
        />
      </div>
      <div className="form-group">{err}</div>
      <button className="btn btn-primary mt-2">Sign up</button>
    </form>
  );
}
