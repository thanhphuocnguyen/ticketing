import React, { useEffect, useState } from "react";
import StripCheckout from "react-stripe-checkout";
import useRequest from "../../src/hooks/useRequest";
import { useRouter } from "next/router";

const OrderShow = ({ order, currentUser }) => {
  const [time, setTime] = useState(0);
  const router = useRouter();

  const { doRequest, err } = useRequest({
    method: "post",
    body: {
      orderId: order.id,
    },
    url: "/api/payments",
    onSuccess: (payment) => {
      console.log(payment);
      router.push("/orders");
    },
  });

  useEffect(() => {
    const findTimeLeft = () => {
      const timeLeft = new Date(order.expiresAt) - new Date();
      setTime(Math.floor(timeLeft / 1000 / 60));
    };
    const timeId = setInterval(() => {
      findTimeLeft();
    }, 1000);
    return () => {
      clearInterval(timeId);
    };
  }, []);

  if (time < 0) {
    return <div className="py-5 text-center">Order expired</div>;
  }
  return (
    <div className="py-5 d-flex flex-column justify-content-center ">
      <div className="text-center">
        You have {time} min until the order expires
      </div>
      <div className="my-3">{err}</div>
      <div className="m-auto w-50 mt-5 d-flex justify-content-center">
        <StripCheckout
          token={(token) => {
            doRequest({ token: token.id });
          }}
          stripeKey={process.env.NEXT_PUBLIC_STRIPE_KEY}
          amount={order.ticket.price * 100}
          email={currentUser.email}
        />
      </div>
    </div>
  );
};
OrderShow.getInitialProps = async (context, client, currentUser) => {
  let dataOrder = null;
  console.log(currentUser);
  const { orderId } = context.query;
  try {
    const { data } = await client.get("/api/orders/" + orderId);
    dataOrder = data;
  } catch (error) {
    console.log(error?.response?.data?.error);
  }
  return {
    order: dataOrder,
    currentUser,
  };
};
export default OrderShow;
