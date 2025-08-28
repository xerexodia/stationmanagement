import { useSession } from "../context/UserContext";

interface Reservation {
  id: number;
  startsAt: string;
  expiresAt: string;
  estimatedPrice: number;
  status: "UPCOMING" | "COMPLETED" | "CANCELED";
  review: any;
   session: any;
  reservationConfig: {
    id: number;
    tolerance: number;
    maxReservation: number;
    minNoticePeriod: number;
    cancellationPolicy: string;
    nreservation: number;
  };
  penalty: any;
}

export const useReservationService = () => {
  const { session } = useSession();

  const fetchReservations = async (status: string) => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}client/reservations/me/reservations?status=${status}`,
        {
          headers: {
            Authorization: `Bearer ${session}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error(`Error fetching ${status} reservations:`, error);
      return [];
    }
  };

  const fetchAllReservations = async () => {
    try {
      const [UPCOMING, COMPLETED, CANCELED] = await Promise.all([
        fetchReservations("UPCOMING"),
        fetchReservations("COMPLETED"),
        fetchReservations("CANCELED"),
      ]);

      return {
        UPCOMING,
        COMPLETED,
        CANCELED,
      };
    } catch (error) {
      console.error("Error fetching all reservations:", error);
      return {
        UPCOMING: [],
        COMPLETED: [],
        CANCELED: [],
      };
    }
  };

  const startChargingSession = async (reservationId: number) => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}client/sessions/start?reservationId=${reservationId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to start session: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error starting charging session:", error);
      throw error;
    }
  };

  const cancelReservation = async (reservationId: number) => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}client/reservations/${reservationId}/cancel`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${session}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to cancel reservation: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error canceling reservation:", error);
      throw error;
    }
  };
  const fetchActiveSession = async (): Promise<Reservation | null> => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}client/reservations/me/reservations?status=IN_PROGRESS`,
        {
          headers: {
            Authorization: `Bearer ${session}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data?.data?.[0] || null
    } catch (error) {
      console.error("Error fetching active session:", error);
      throw error;
    }
  };

  const endChargingSession = async (sessionId: number, energyKWh: number) => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}client/sessions/end/${sessionId}?energyKWh=${energyKWh}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${session}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        console.log(sessionId)
        throw new Error(`Failed to end session: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error ending charging session:", error);
      throw error;
    }
  };
  return {
    fetchActiveSession,
    endChargingSession,
    fetchAllReservations,
    startChargingSession,
    cancelReservation,
  };
};
