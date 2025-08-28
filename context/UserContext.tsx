import { useRouter } from "expo-router";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from "react";
import { useStorageState } from "../hooks/useStorageState";

export interface User {
  id: string;
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  region: string;
  token: string;
  vehicleCount: number;
}

interface AuthContextType {
  signIn: (token: string) => void;
  signOut: () => void;
  updateUser: (data: Partial<User>) => void;
  refreshSession: () => void;
  session?: string | null;
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  addVehicle: boolean;
  setAddVehicle: (addVehicle: boolean) => void;
}

const AuthContext = createContext<AuthContextType>({
  signIn: () => null,
  signOut: () => null,
  updateUser: () => null,
  refreshSession: () => null,
  session: null,
  user: null,
  isLoading: false,
  setUser: () => null,
  addVehicle: false,
  setAddVehicle: () => null,
});

export function useSession() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useSession must be wrapped in a <SessionProvider />");
  }
  return context;
}
export function SessionProvider({ children }: PropsWithChildren) {
  const [addVehicle, setAddVehicle] = useState(false);
  const [[isLoading, session], setSession] = useStorageState("session");
  const [[_, userData], setUserData] = useStorageState("user");
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  const initializeSession = async () => {
    if (!session) {
      setUser(null);
      return;
    }

    try {
      const res = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}client/me/vehicles/info`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + session,
          },
        }
      );

      const response = await res.json();
      if (!res.ok) {
        setSession(null);
        return;
      }

      const userFromApi: User = {
        id: String(response.data.client.id),
        firstname: response.data.client.firstname,
        lastname: response.data.client.lastname,
        username: response.data.client.username,
        email: response.data.client.email,
        region: response.data.client.region,
        token: session,
        vehicleCount: response.data.vehicleCount,
      };
      setUser(userFromApi);
      const { token, ...userWithoutToken } = userFromApi;
      setUserData(JSON.stringify(userWithoutToken));
      setSession(session);
    } catch (err) {
      console.error(err);
      setSession(null);
    }
  };

  useEffect(() => {
    initializeSession();
  }, [session]);

  const updateUser = (data: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...data };
    setUser(updatedUser);
    const { token, ...userWithoutToken } = updatedUser;
    setUserData(JSON.stringify(userWithoutToken));
  };

  const refreshSession = () => {
    initializeSession();
  };

  const signIn = (token: string) => {
    initializeSession();
    setSession(token);
  };

  const signOut = () => {
    setUser(null);
    setSession(null);
    setUserData(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        signIn,
        signOut,
        updateUser,
        refreshSession,
        session,
        user,
        isLoading: isLoading || false,
        setUser,
        addVehicle,
        setAddVehicle,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
