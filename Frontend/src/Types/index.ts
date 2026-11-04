
export interface Room {
    id: number;
    name: string;
    location: string;
    capacity: number;
}

export interface Booking {
    id: number;
    roomId: number;
    roomName: string;
    roomLocation: string;
    roomCapacity: number;
    organizerName: string;
    meetingTitle: string;
    bookingDate: string;
    startTime: string;
    endTime: string;
    attendeeCount: number;
    status: "active" | "cancelled";
}

export interface DashboardData {
    totalRooms: number;
    todaysActiveBookings: number;
    today: string;
    bookings: {
        id: number;
        meetingTitle: string;
        organizerName: string;
        startTime: string;
        endTime: string;
        attendeeCount: number;
        roomName: string;
        roomLocation: string;
    }[];
}
