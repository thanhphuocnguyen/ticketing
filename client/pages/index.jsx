import Link from "next/link";
import React, { useState } from "react";
const LandingPage = ({ currentUser, tickets }) => {
  const ticketList = tickets.map((e, idx) => (
    <tr key={e.id}>
      <td>{e.title}</td>
      <td>{e.price}</td>
      <td>
        <Link href="/tickets/[ticketId]" as={`/tickets/${e.id}`}>
          <a className="text-decoration-underline link-primary">detail</a>
        </Link>
      </td>
    </tr>
  ));
  return (
    <>
      {!tickets.length ? (
        <div className="justify-content-center m-auto align-content-center">
          No ticket for sale yet!
        </div>
      ) : (
        <>
          <h1>Tickets</h1>
          <table className="table table-striped">
            <thead className="thead-dark">
              <tr>
                <th>Title</th>
                <th>Price</th>
                <th>Link</th>
              </tr>
            </thead>
            <tbody>{ticketList}</tbody>
          </table>
        </>
      )}
    </>
  );
};
LandingPage.getInitialProps = async (ctx, client, curentUser) => {
  let dataProps;
  try {
    const { data } = await client.get("/api/tickets");
    dataProps = data;
  } catch (error) {
    console.log(error?.response?.data?.error?.message);
  }
  return { tickets: dataProps || [] };
};
export default LandingPage;
