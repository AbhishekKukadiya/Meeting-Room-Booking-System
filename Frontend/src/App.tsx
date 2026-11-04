
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./Components/Navbar";
import Sidebar from "./Components/Sidebar";

import Dashboard from "./Pages/Dashboard";
import Rooms from "./Pages/Rooms";
import Bookings from "./Pages/Bookings";

function App() {

    return (
        <BrowserRouter>

            <Navbar />

            <div className="container-fluid">
                <div className="row">

                    {/* Sidebar */}
                    <div className="col-md-2 p-0">
                        <Sidebar />
                    </div>

                    {/* Main Content */}
                    <div className="col-md-10 p-4">

                        <Routes>

                            <Route path="/" element={<Dashboard />} />

                            <Route path="/rooms" element={<Rooms />} />

                            <Route path="/bookings" element={<Bookings />} />

                        </Routes>

                    </div>

                </div>
            </div>

        </BrowserRouter>
    );
}

export default App;
