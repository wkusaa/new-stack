"use client";

import { type User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { createClient } from "~/utils/supabase/client";

const AuthContext = createContext<{
  isLoading: boolean;
  user: User | null;
  setRememberMe: Dispatch<SetStateAction<boolean>>;
}>({
  isLoading: true,
  user: null,
  setRememberMe: () => {
    return false;
  },
});

type Props = {
  children: ReactNode;
};

export function AuthProvider({ children }: Props) {
  const [supabase] = useState(() => createClient());
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const router = useRouter();

  // Listen for token changes
  useEffect(() => {
    // Function to fetch user data
    const fetchUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) {
          throw error;
        }
        console.log("user", data);
        const userData = data?.user ?? null;
        setUser(userData);
        setIsLoading(false);
      } catch (error: any) {
        setUser(null);
        setIsLoading(false);
        // Optionally, remove the token from the cookie here
        router.push("/auth/login"); // Redirect to login page after sign out
        console.error("Error fetching user:", error.message);
      }
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(event, session);
      if (event === "SIGNED_IN") {
        setUser(session?.user ?? null);
        setIsLoading(false);
        // Optionally, store the token as a cookie here
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setIsLoading(false);
        // Optionally, remove the token from the cookie here
        router.push("/auth/login"); // Redirect to login page after sign out
      }
    });

    fetchUser();

    // Clean up function
    return () => {
      subscription.unsubscribe(); // Unsubscribe from auth listener
    };
  }, [supabase]); // Empty dependency array means this effect runs only once, on mount

  return (
    <AuthContext.Provider value={{ user, isLoading, setRememberMe }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
};
