import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  profile: Profile | null;
  signOut: () => Promise<void>;
};

type Profile = {
  id: string;
  user_id: string;
  full_name: string;
  grade: number | null;
  track: string | null;
  avatar_url: string | null;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  isAdmin: false,
  profile: null,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Fetch profile
          const { data: profileData } = await supabase
            .from("profiles")
            .select("*")
            .eq("user_id", session.user.id)
            .single();
          setProfile(profileData as Profile | null);

          // Check admin role
          const { data: roles } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", session.user.id);
          setIsAdmin(roles?.some((r: any) => r.role === "admin") ?? false);
        } else {
          setProfile(null);
          setIsAdmin(false);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, isAdmin, profile, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
