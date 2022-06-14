import { useRouter } from "next/router";
import React, { useState } from "react";
import useRequest from "../../src/hooks/useRequest";

const NewTicket = (props) => {
  const router = useRouter();
  const [data, setData] = useState({
    title: "",
    price: "",
  });

  const { doRequest, err } = useRequest({
    method: "post",
    url: "/api/tickets",
    body: {
      title: data.title,
      price: data.price,
    },
    onSuccess: (ticket) => {
      console.log(ticket);
      router.push("/");
    },
  });

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    await doRequest();
    console.log(data);
  };

  const handleProcessPrice = () => {
    const value = parseFloat(data.price);
    if (isNaN(value)) {
      return;
    }
    setData({ ...data, price: value.toFixed(2) });
  };

  return (
    <div className="">
      <h1>Create a Ticket</h1>
      <form onSubmit={handleCreateTicket}>
        <div className="form-group">
          <label>Title</label>
          <input
            className="form-control"
            value={data.title}
            onChange={(e) => {
              setData({ ...data, title: e.target.value });
            }}
          />
        </div>
        <div className="form-group">
          <label>Price</label>
          <input
            className="form-control"
            value={data.price}
            onBlur={handleProcessPrice}
            onChange={(e) => {
              setData({ ...data, price: e.target.value });
            }}
          />
        </div>
        <div className="form-group">{err}</div>
        <button type="submit" className="btn btn-success mt-2">
          Create
        </button>
      </form>
    </div>
  );
};

export default NewTicket;
