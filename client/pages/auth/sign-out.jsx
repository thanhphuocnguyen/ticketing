import { useEffect } from "react";
import { useRouter } from "next/router";
import useRequest from "../../src/hooks/useRequest";

export default function SignOut(props) {
  const router = useRouter();
  const { doRequest, err } = useRequest({
    method: "post",
    url: "/api/users/sign-out",
    body: {},
    onSuccess: () => router.push("/"),
  });
  useEffect(() => {
    doRequest();
  }, []);
  return <div>You are signing out...</div>;
}
