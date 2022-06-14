import axios from "axios";
import { useState } from "react";

const useRequest = ({ method = "post", url, body, onSuccess }) => {
  const [err, setErr] = useState("");
  const doRequest = async (props = {}) => {
    try {
      const res = await axios[method](url, { ...body, ...props });
      setErr("");
      if (onSuccess) {
        onSuccess(res.data);
      }
      return res.data;
    } catch (error) {
      console.log(error);
      setErr(
        <ul>
          {error?.response?.data?.error?.map((e, idx) => (
            <li key={idx.toString()} className="alert alert-danger">
              {e.message}
              {e.field ? " - field " + e.field : ""}
            </li>
          ))}
        </ul>
      );
      throw error;
    }
  };
  return { doRequest, err };
};
export default useRequest;
