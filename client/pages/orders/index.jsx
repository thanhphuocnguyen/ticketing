import Link from "next/link";
import React from "react";

const OrderList = ({ orders }) => {
  if (!orders.length)
    return (
      <div className="text-center py-5 font-weight-bold">
        You dont have any order yet
        <Link href="/">
          <a className="text-decoration-underline link-primary">order now!</a>
        </Link>
      </div>
    );

  const orderList = orders.map((order) => (
    <tr key={order.id}>
      <td>{order.ticket.title}</td>
      <td>{order.ticket.price}</td>
      <td>{order.status}</td>
      <td>
        {order.status === "complete" ? (
          "-"
        ) : (
          <Link href="/orders/[orderId]" as={`/orders/${order.id}`}>
            <a className="text-decoration-underline link-primary">Pay now!</a>
          </Link>
        )}
      </td>
    </tr>
  ));

  return (
    <div>
      <h1>Orders</h1>
      <table className="table table-striped">
        <thead className="thead-dark">
          <tr>
            <th>Title ticket</th>
            <th>Price ticket</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>{orderList}</tbody>
      </table>
    </div>
  );
};
OrderList.getInitialProps = async (ctx, client, currentUser) => {
  let orderData = null;
  try {
    const { data } = await client.get("/api/orders");
    orderData = data;
  } catch (error) {
    console.log(error?.response?.data?.erorr);
  }
  return {
    orders: orderData || [],
  };
};
export default OrderList;
