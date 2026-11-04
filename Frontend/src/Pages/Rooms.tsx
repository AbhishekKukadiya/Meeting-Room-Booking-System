
import { useEffect, useState } from "react";
import axios from "../Utils/Axios";
import type { Room } from "../Types";
import { toast } from "react-toastify";

function Rooms() {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState("");
    const [location, setLocation] = useState("");
    const [capacity, setCapacity] = useState("");
    const [editId, setEditId] = useState<number | null>(null);

    useEffect(() => {
        getRooms();
    }, []);

    // Get all rooms
    const getRooms = async () => {
        try {
            const response = await axios.get("/rooms");
            setRooms(response.data.data);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to get rooms");
        } finally {
            setLoading(false);
        }
    };

    // Clear form
    const clearForm = () => {
        setName("");
        setLocation("");
        setCapacity("");
        setEditId(null);
    };

    // Add or Update room
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim() || !location.trim() || !capacity) {
            toast.error("Please fill all fields");
            return;
        }

        if (Number(capacity) <= 0 || !Number.isInteger(Number(capacity))) {
            toast.error("Capacity must be a positive whole number");
            return;
        }

        const data = {
            name,
            location,
            capacity: Number(capacity),
        };

        try {
            if (editId) {
                await axios.put(`/rooms/${editId}`, data);
                toast.success("Room updated successfully");
            } else {
                await axios.post("/rooms", data);
                toast.success("Room added successfully");
            }

            clearForm();
            getRooms();

        } catch (error: any) {
            toast.error(error.response?.data?.message || "Something went wrong");
        }
    };

    // Edit room
    const handleEdit = (room: Room) => {
        setEditId(room.id);
        setName(room.name);
        setLocation(room.location);
        setCapacity(String(room.capacity));
    };

    // Delete room
    const handleDelete = async (id: number) => {

        if (!window.confirm("Are you sure you want to delete this room?")) {
            return;
        }

        try {
            await axios.delete(`/rooms/${id}`);
            toast.success("Room deleted successfully");
            getRooms();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Unable to delete room");
        }
    };

    return (
        <div>

            <h3 className="mb-4">Manage Rooms</h3>

            {/* Room Form */}
            <div className="card shadow-sm mb-4">
                <div className="card-body">

                    <h5 className="mb-3">
                        {editId ? "Update Room" : "Add New Room"}
                    </h5>

                    <form onSubmit={handleSubmit}>

                        <div className="row g-3">

                            <div className="col-md-4">
                                <label className="form-label">Room Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Enter room name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="col-md-4">
                                <label className="form-label">Location</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Enter location"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="col-md-4">
                                <label className="form-label">Capacity</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    placeholder="Enter capacity"
                                    min="1"
                                    value={capacity}
                                    onChange={(e) => setCapacity(e.target.value)}
                                    required
                                />
                            </div>

                        </div>

                        <div className="mt-3">
                            <button className="btn btn-primary me-2" type="submit">
                                {editId ? "Update Room" : "Add Room"}
                            </button>

                            {editId && (
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={clearForm}
                                >
                                    Cancel
                                </button>
                            )}
                        </div>

                    </form>
                </div>
            </div>

            {/* Room Table */}
            <div className="card shadow-sm">
                <div className="card-body">

                    <h5 className="mb-3">Room List</h5>

                    {loading ? (
                        <p>Loading rooms...</p>
                    ) : rooms.length === 0 ? (
                        <p className="text-secondary">No rooms available. Add your first room.</p>
                    ) : (

                        <div className="table-responsive">
                            <table className="table table-bordered table-hover">

                                <thead className="table-dark">
                                    <tr>
                                        <th>ID</th>
                                        <th>Room Name</th>
                                        <th>Location</th>
                                        <th>Capacity</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {rooms.map((room) => (
                                        <tr key={room.id}>
                                            <td>{room.id}</td>
                                            <td>{room.name}</td>
                                            <td>{room.location}</td>
                                            <td>{room.capacity}</td>

                                            <td>
                                                <button
                                                    className="btn btn-warning btn-sm me-2"
                                                    onClick={() => handleEdit(room)}
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() => handleDelete(room.id)}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>

                            </table>
                        </div>

                    )}

                </div>
            </div>

        </div>
    );
}

export default Rooms;
