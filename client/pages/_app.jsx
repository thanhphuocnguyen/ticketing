import "bootstrap/dist/css/bootstrap.css";
import buildClient from "../src/api/build-client";
import Header from "../src/components/header";

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <Header currentUser={pageProps.currentUser} />
      <div className="container">
        <Component {...pageProps} />
      </div>
    </>
  );
}

MyApp.getInitialProps = async ({ Component, ctx }) => {
  let data = null;
  const client = buildClient(ctx);
  let pageProps = {};

  try {
    const resCurrentUser = await client.get("/api/users/currentUser");
    if (resCurrentUser.status === 200) {
      data = resCurrentUser.data;
    }
    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(
        ctx,
        client,
        data.currentUser
      );
    }
    pageProps["currentUser"] = data.currentUser;
  } catch (error) {
    console.log(error?.response?.data?.error);
  }

  return {
    pageProps,
  };
};
