"use client";

import { type User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import {
  createContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import { createClient } from "~/utils/supabase/client";

const AuthContext = createContext<{
  user: User | null;
  setRememberMe: Dispatch<SetStateAction<boolean>>;
}>({
  user: null,
  setRememberMe: () => {
    return false;
  },
});

type Props = {
  children: ReactNode;
};

export function AuthProvider({ children }: Props) {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const router = useRouter();

  // Listen for token changes
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN") {
          setUser(session?.user ?? null);
          // Optionally, store the token as a cookie here
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          // Optionally, remove the token from the cookie here
          router.push("/auth/login"); // Redirect to login page after sign out
        }
      },
    );

    fetchUser().catch(console.error);

    // Clean up function
    return () => {
      authListener.subscription.unsubscribe(); // Unsubscribe from auth listener
    };
  }, [supabase, router]); // Empty dependency array means this effect runs only once, on mount

  // Force refresh the token every 10 minutes
  useEffect(() => {
    const handle = setInterval(
      async () => {
        await supabase.auth.refreshSession();
      },
      10 * 60 * 1000,
    );

    return () => clearInterval(handle);
  }, []);

  // Function to fetch user data
  const fetchUser = async () => {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        throw error;
      }
      const userData = data?.user ?? null;
      setUser(userData);
    } catch (error: any) {
      setUser(null);
      // Optionally, remove the token from the cookie here
      router.push("/auth/login"); // Redirect to login page after sign out
      console.error("Error fetching user:", error.message);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setRememberMe }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
};
