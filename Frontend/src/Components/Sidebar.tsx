
import { NavLink } from "react-router-dom";

function Sidebar() {
    return (
        <div className="bg-light border-end p-3 h-100">
            <h6 className="text-secondary mb-3">MENU</h6>

            <div className="nav flex-column gap-2">

                <NavLink
                    to="/"
                    end
                    className={({ isActive }) =>
                        `nav-link ${isActive ? "active bg-primary text-white" : "text-dark"}`
                    }
                >
                    Dashboard
                </NavLink>

                <NavLink
                    to="/rooms"
                    className={({ isActive }) =>
                        `nav-link ${isActive ? "active bg-primary text-white" : "text-dark"}`
                    }
                >
                    Manage Rooms
                </NavLink>

                <NavLink
                    to="/bookings"
                    className={({ isActive }) =>
                        `nav-link ${isActive ? "active bg-primary text-white" : "text-dark"}`
                    }
                >
                    Manage Bookings
                </NavLink>

            </div>
        </div>
    );
}

export default Sidebar;
