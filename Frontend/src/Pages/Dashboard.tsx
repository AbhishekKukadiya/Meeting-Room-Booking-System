
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import type { DashboardData } from "../Types";
import api from "../Utils/Axios";

function Dashboard() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [currentTime, setCurrentTime] = useState("");

  // Get current India time
  const getIndiaTime = () => {
    return new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).format(new Date());
  };

  // Load dashboard data from backend
  const getDashboard = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await api.get("/dashboard");
      setDashboard(response.data.data);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Unable to load dashboard"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load data when page opens and update time every minute
  useEffect(() => {
    getDashboard();

    setCurrentTime(getIndiaTime());

    const timer = setInterval(() => {
      setCurrentTime(getIndiaTime());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Today's bookings
  const todaysBookings = dashboard?.bookings || [];

  // Search meetings
  const filteredBookings = todaysBookings.filter((booking) => {
    const value = search.toLowerCase();

    return (
      booking.meetingTitle.toLowerCase().includes(value) ||
      booking.organizerName.toLowerCase().includes(value) ||
      booking.roomName.toLowerCase().includes(value) ||
      booking.roomLocation.toLowerCase().includes(value)
    );
  });

  // Count meetings currently running
  const inProgressCount = todaysBookings.filter(
    (booking) =>
      booking.startTime.slice(0, 5) <= currentTime &&
      currentTime < booking.endTime.slice(0, 5)
  ).length;

  // Count upcoming meetings
  const upcomingCount = todaysBookings.filter(
    (booking) => booking.startTime.slice(0, 5) > currentTime
  ).length;

  // Count total attendees
  const attendeeCount = todaysBookings.reduce(
    (total, booking) => total + booking.attendeeCount,
    0
  );

  // Find next meeting
  const nextMeeting = todaysBookings.find(
    (booking) => booking.startTime.slice(0, 5) > currentTime
  );

  // Loading screen
  if (loading) {
    return <p className="text-center py-5">Loading dashboard...</p>;
  }

  // Error or empty data
  if (!dashboard) {
    return (
      <div className="alert alert-warning">
        Dashboard data not available.
        <button
          className="btn btn-primary btn-sm ms-3"
          onClick={() => getDashboard()}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Dashboard Header */}
      <div className="d-flex justify-content-between align-items-center flex-wrap mb-4">
        <div>
          <h3>Dashboard</h3>
          <p className="text-secondary mb-0">
            Meeting Room Overview | India Time: {currentTime}
          </p>
        </div>

        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-secondary"
            onClick={() => getDashboard(true)}
            disabled={refreshing}
          >
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>

          <Link to="/bookings" className="btn btn-primary">
            Create Booking
          </Link>
        </div>
      </div>

      {/* Dashboard Cards */}
      <div className="row g-3 mb-4">

        <div className="col-md-3">
          <div className="card shadow-sm">
            <div className="card-body">
              <p className="text-secondary">Total Rooms</p>
              <h2>{dashboard.totalRooms}</h2>
              <Link to="/rooms">Manage Rooms</Link>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow-sm">
            <div className="card-body">
              <p className="text-secondary">Meetings Today</p>
              <h2>{dashboard.todaysActiveBookings}</h2>
              <small>{upcomingCount} Upcoming</small>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow-sm">
            <div className="card-body">
              <p className="text-secondary">Rooms In Use Now</p>
              <h2>{inProgressCount}</h2>
              <small>
                {Math.max(dashboard.totalRooms - inProgressCount, 0)} Available
              </small>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow-sm">
            <div className="card-body">
              <p className="text-secondary">Today's Attendees</p>
              <h2>{attendeeCount}</h2>
              <small>Across today's meetings</small>
            </div>
          </div>
        </div>

      </div>

      {/* Next Meeting */}
      {nextMeeting && (
        <div className="card shadow-sm mb-4 border-primary">
          <div className="card-body">
            <h5 className="text-primary">Up Next</h5>

            <h5>{nextMeeting.meetingTitle}</h5>

            <p className="mb-2">
              Room: {nextMeeting.roomName} |
              Time: {nextMeeting.startTime.slice(0, 5)} |
              Organizer: {nextMeeting.organizerName}
            </p>

            <Link to="/bookings" className="btn btn-outline-primary btn-sm">
              View Bookings
            </Link>
          </div>
        </div>
      )}

      {/* Today's Meetings */}
      <div className="card shadow-sm">
        <div className="card-body">

          <div className="d-flex justify-content-between align-items-center flex-wrap mb-3">
            <h5>Today's Meetings</h5>

            <div className="d-flex gap-2">
              <input
                type="text"
                className="form-control"
                placeholder="Search meetings..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <Link to="/bookings" className="btn btn-outline-primary">
                Bookings
              </Link>
            </div>
          </div>

          {filteredBookings.length === 0 ? (
            <p className="text-secondary text-center py-4">
              {todaysBookings.length === 0
                ? "No meetings scheduled for today."
                : "No meetings found."}
            </p>
          ) : (
            <div className="table-responsive">
              <table className="table table-bordered table-hover">
                <thead className="table-dark">
                  <tr>
                    <th>Meeting</th>
                    <th>Room</th>
                    <th>Time</th>
                    <th>Organizer</th>
                    <th>Attendees</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredBookings.map((booking) => {
                    const start = booking.startTime.slice(0, 5);
                    const end = booking.endTime.slice(0, 5);

                    let status = "Upcoming";
                    let badge = "bg-primary";

                    if (currentTime >= end) {
                      status = "Completed";
                      badge = "bg-secondary";
                    } else if (currentTime >= start) {
                      status = "In progress";
                      badge = "bg-success";
                    }

                    return (
                      <tr key={booking.id}>
                        <td>{booking.meetingTitle}</td>

                        <td>
                          {booking.roomName}
                          <br />
                          <small className="text-secondary">
                            {booking.roomLocation}
                          </small>
                        </td>

                        <td>{start} - {end}</td>

                        <td>{booking.organizerName}</td>

                        <td>{booking.attendeeCount}</td>

                        <td>
                          <span className={`badge ${badge}`}>
                            {status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default Dashboard;
