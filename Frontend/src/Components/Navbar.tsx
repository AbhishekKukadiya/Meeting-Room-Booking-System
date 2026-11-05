
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar navbar-dark bg-dark px-4 justify-content-center">
      <Link className="navbar-brand fw-bold mb-0 me-0" to="/">
        Meeting Room Booking
      </Link>
    </nav>
  );
}

export default Navbar;
