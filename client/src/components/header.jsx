import Link from "next/link";

const Header = (props) => {
  const { currentUser } = props;
  const links = [
    !currentUser && { label: "Sign up", href: "/auth/sign-up" },
    !currentUser && { label: "Sign in", href: "/auth/sign-in" },
    currentUser && { label: "Sale new ticket", href: "/tickets/new" },
    currentUser && { label: "Order detail", href: "/orders" },
    currentUser && { label: "Sign out", href: "/auth/sign-out" },
  ]
    .filter((e) => e)
    .map((e, idx) => (
      <li
        key={idx}
        style={{ fontSize: "14px" }}
        className="btn btn-light px-2 nav-item"
      >
        <Link href={e.href}>
          <a className="text-decoration-none">{e.label}</a>
        </Link>
      </li>
    ));
  return (
    <nav className="navbar px-3 navbar-light bg-light">
      <Link href="/">
        <a className="navbar-brand badge badge-primary">GitTix</a>
      </Link>
      <div className="d-flex justify-content-end">
        <ul className="nav d-flex align-items-center">{links}</ul>
      </div>
    </nav>
  );
};
export default Header;
