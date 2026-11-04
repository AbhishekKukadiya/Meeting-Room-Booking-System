
import { Link } from "react-router-dom";

function Navbar() {
    return (
        <nav className="navbar navbar-dark bg-dark px-4">
            <Link className="navbar-brand fw-bold" to="/">
                Meeting Room Booking
            </Link>

            <span className="text-white">
                Admin Dashboard
            </span>
        </nav>
    );
}

export default Navbar;
