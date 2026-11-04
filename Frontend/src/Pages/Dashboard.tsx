import { useCallback, useEffect, useMemo, useState } from "react";
import { isAxiosError } from "axios";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import type { DashboardData } from "../Types";
import api from "../Utils/Axios";

function getIndiaTime() {
    return new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
    }).format(new Date());
}

function formatTime(time: string) {
    const [hours = "0", minutes = "00"] = time.slice(0, 5).split(":");
    const date = new Date(`1970-01-01T${hours}:${minutes}:00+05:30`);
    return new Intl.DateTimeFormat(undefined, {
        hour: "numeric",
        minute: "2-digit",
        timeZone: "Asia/Kolkata",
    }).format(date);
}

function Dashboard() {
    const [dashboard, setDashboard] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");
    const [currentTime, setCurrentTime] = useState(getIndiaTime);
    const [search, setSearch] = useState("");

    const loadDashboard = useCallback(async (isRefresh = false) => {
        if (isRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }

        try {
            const response = await api.get<{ data: DashboardData }>("/dashboard");
            setDashboard(response.data.data);
            setError("");
        } catch (requestError: unknown) {
            const message = isAxiosError<{ message?: string }>(requestError)
                ? requestError.response?.data?.message || "Unable to connect to the dashboard service."
                : "Unable to load dashboard.";
            setError(message);
            if (isRefresh) {
                toast.error(message);
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        void loadDashboard();
        const timer = window.setInterval(() => setCurrentTime(getIndiaTime()), 60_000);
        return () => window.clearInterval(timer);
    }, [loadDashboard]);

    const todaysBookings = dashboard?.bookings ?? [];
    const visibleBookings = useMemo(() => {
        const normalizedSearch = search.trim().toLowerCase();
        if (!normalizedSearch) {
            return todaysBookings;
        }

        return todaysBookings.filter((booking) =>
            [booking.meetingTitle, booking.organizerName, booking.roomName, booking.roomLocation]
                .some((value) => value.toLowerCase().includes(normalizedSearch)),
        );
    }, [search, todaysBookings]);

    const inProgressCount = todaysBookings.filter(
        (booking) => booking.startTime.slice(0, 5) <= currentTime && currentTime < booking.endTime.slice(0, 5),
    ).length;
    const upcomingCount = todaysBookings.filter(
        (booking) => booking.startTime.slice(0, 5) > currentTime,
    ).length;
    const attendeeCount = todaysBookings.reduce((total, booking) => total + booking.attendeeCount, 0);
    const nextMeeting = todaysBookings.find((booking) => booking.startTime.slice(0, 5) > currentTime);

    if (loading) {
        return (
            <div className="d-flex align-items-center justify-content-center py-5" role="status">
                <span className="spinner-border spinner-border-sm text-primary me-2" aria-hidden="true" />
                Loading dashboard...
            </div>
        );
    }

    if (!dashboard && error) {
        return (
            <div className="card border-0 shadow-sm">
                <div className="card-body p-4">
                    <h1 className="h4">Dashboard unavailable</h1>
                    <p className="text-secondary mb-3">{error}</p>
                    <button className="btn btn-primary" onClick={() => void loadDashboard()}>
                        Try again
                    </button>
                </div>
            </div>
        );
    }

    if (!dashboard) {
        return <div className="alert alert-warning">No dashboard data is available.</div>;
    }

    return (
        <main>
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
                <div>
                    <p className="text-primary fw-semibold text-uppercase small mb-1">Meeting room overview</p>
                    <h1 className="h3 mb-1">Dashboard</h1>
                    <p className="text-secondary mb-0">
                        {new Intl.DateTimeFormat(undefined, {
                            dateStyle: "full",
                            timeZone: "Asia/Kolkata",
                        }).format(new Date())}
                        {" · "}
                        India time {currentTime}
                    </p>
                </div>
                <div className="d-flex flex-wrap gap-2">
                    <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => void loadDashboard(true)}
                        disabled={refreshing}
                    >
                        {refreshing ? "Refreshing..." : "Refresh"}
                    </button>
                    <Link className="btn btn-primary" to="/bookings">
                        Create booking
                    </Link>
                </div>
            </div>

            {error && (
                <div className="alert alert-warning d-flex justify-content-between align-items-center gap-3" role="alert">
                    <span>{error} Showing the last loaded data.</span>
                    <button className="btn btn-sm btn-outline-dark flex-shrink-0" onClick={() => void loadDashboard(true)}>
                        Retry
                    </button>
                </div>
            )}

            <section className="row g-3 mb-4" aria-label="Today's statistics">
                <div className="col-12 col-sm-6 col-xl-3">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                            <p className="text-secondary mb-2">Total rooms</p>
                            <p className="display-6 fw-semibold mb-0">{dashboard.totalRooms}</p>
                            <Link className="small" to="/rooms">Manage rooms</Link>
                        </div>
                    </div>
                </div>
                <div className="col-12 col-sm-6 col-xl-3">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                            <p className="text-secondary mb-2">Meetings today</p>
                            <p className="display-6 fw-semibold mb-0">{dashboard.todaysActiveBookings}</p>
                            <span className="small text-secondary">{upcomingCount} upcoming</span>
                        </div>
                    </div>
                </div>
                <div className="col-12 col-sm-6 col-xl-3">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                            <p className="text-secondary mb-2">Rooms in use now</p>
                            <p className="display-6 fw-semibold mb-0">{inProgressCount}</p>
                            <span className="small text-secondary">
                                {Math.max(dashboard.totalRooms - inProgressCount, 0)} available by schedule
                            </span>
                        </div>
                    </div>
                </div>
                <div className="col-12 col-sm-6 col-xl-3">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                            <p className="text-secondary mb-2">Today's attendees</p>
                            <p className="display-6 fw-semibold mb-0">{attendeeCount}</p>
                            <span className="small text-secondary">Across active meetings</span>
                        </div>
                    </div>
                </div>
            </section>

            {nextMeeting && (
                <section className="card border-primary-subtle bg-primary-subtle border-0 mb-4">
                    <div className="card-body d-flex flex-wrap align-items-center justify-content-between gap-3">
                        <div>
                            <p className="small text-primary fw-semibold text-uppercase mb-1">Up next</p>
                            <h2 className="h5 mb-1">{nextMeeting.meetingTitle}</h2>
                            <p className="mb-0 text-secondary">
                                {nextMeeting.roomName} · {formatTime(nextMeeting.startTime)} · {nextMeeting.organizerName}
                            </p>
                        </div>
                        <Link className="btn btn-outline-primary" to="/bookings">View all bookings</Link>
                    </div>
                </section>
            )}

            <section className="card border-0 shadow-sm">
                <div className="card-body">
                    <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
                        <div>
                            <h2 className="h5 mb-1">Today's meetings</h2>
                            <p className="text-secondary small mb-0">
                                {todaysBookings.length} active {todaysBookings.length === 1 ? "meeting" : "meetings"}
                            </p>
                        </div>
                        <div className="d-flex flex-wrap gap-2">
                            <input
                                type="search"
                                className="form-control"
                                placeholder="Search meetings"
                                aria-label="Search today's meetings"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                style={{ maxWidth: "240px" }}
                            />
                            <Link className="btn btn-outline-primary" to="/bookings">Booking schedule</Link>
                        </div>
                    </div>

                    {visibleBookings.length === 0 ? (
                        <div className="text-center py-5">
                            <p className="text-secondary mb-3">
                                {todaysBookings.length === 0
                                    ? "There are no meetings scheduled for today."
                                    : "No meetings match your search."}
                            </p>
                            {todaysBookings.length === 0 && (
                                <Link className="btn btn-primary" to="/bookings">Book a room</Link>
                            )}
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead>
                                    <tr>
                                        <th scope="col">Meeting</th>
                                        <th scope="col">Room</th>
                                        <th scope="col">Time</th>
                                        <th scope="col">Organizer</th>
                                        <th scope="col">Attendees</th>
                                        <th scope="col">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {visibleBookings.map((booking) => {
                                        const start = booking.startTime.slice(0, 5);
                                        const end = booking.endTime.slice(0, 5);
                                        const status = start <= currentTime && currentTime < end
                                            ? "In progress"
                                            : currentTime >= end ? "Completed" : "Upcoming";
                                        const badge = status === "In progress"
                                            ? "text-bg-success"
                                            : status === "Upcoming" ? "text-bg-primary" : "text-bg-secondary";

                                        return (
                                            <tr key={booking.id}>
                                                <td className="fw-semibold">{booking.meetingTitle}</td>
                                                <td>
                                                    <div>{booking.roomName}</div>
                                                    <small className="text-secondary">{booking.roomLocation}</small>
                                                </td>
                                                <td>{formatTime(start)} – {formatTime(end)}</td>
                                                <td>{booking.organizerName}</td>
                                                <td>{booking.attendeeCount}</td>
                                                <td><span className={`badge ${badge}`}>{status}</span></td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}

export default Dashboard;
