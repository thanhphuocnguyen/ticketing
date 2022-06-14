import { useRouter } from "next/router";
import React from "react";
import useRequest from "../../src/hooks/useRequest";

const TicketShow = ({ ticket }) => {
  const router = useRouter();
  const { doRequest, err } = useRequest({
    method: "post",
    body: {
      ticketId: ticket.id,
    },
    onSuccess: (order) => {
      router.push("/orders/[orderId]", `/orders/${order.id}`);
    },
    url: "/api/orders",
  });
  return (
    <>
      <h1 className="mt-5">{ticket.title}</h1>
      <h4 className="mt-4">{ticket.price}</h4>
      <div className="my-2">{err}</div>
      <button onClick={() => doRequest()} className="btn btn-warning mt-3">
        Purshase
      </button>
    </>
  );
};

TicketShow.getInitialProps = async (ctx, client, currentUser) => {
  const { ticketId } = ctx.query;
  const { data } = await client.get("/api/tickets/" + ticketId);
  return { ticket: data };
};
export default TicketShow;
