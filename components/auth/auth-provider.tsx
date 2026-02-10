"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

interface User {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: string;
  onboarded: boolean;
  profile?: any;
  preferences?: any;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (emailOrPhone: string, password: string) => Promise<void>;
  signUp: (data: any) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const fetchUser = async () => {
    // Skip auth check for public routes to avoid unnecessary API calls
    const publicRoutes = ["/", "/login", "/signup", "/forgot-password", "/reset-password", "/bdr/login"];
    const isPublicRoute = publicRoutes.some(route => pathname === route || pathname?.startsWith(route + '/'));
    
    if (isPublicRoute) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/me", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        
        // Check if user needs onboarding
        // Allow BDR routes to be accessible even if not onboarded
        if (!data.user.onboarded && pathname !== "/onboarding" && !pathname?.startsWith("/bdr")) {
          router.push("/onboarding");
        }
      } else {
        // If the token is invalid/expired (401) or user not found (404), clear the session
        // to prevent infinite redirects with middleware
        if (response.status === 401 || response.status === 404 || response.status === 403) {
          await fetch("/api/auth/logout", { method: "POST" });
        }
        setUser(null);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [pathname]); // Re-fetch when pathname changes

  const signIn = async (emailOrPhone: string, password: string) => {
    const response = await fetch("/api/auth/signin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ emailOrPhone, password }),
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Sign in failed");
    }

    const data = await response.json();
    setUser(data.user);
    
    // Redirect based on onboarding status
    if (!data.user.onboarded) {
      router.push("/onboarding");
    } else {
      router.push("/dashboard");
    }
  };

  const signUp = async (data: any) => {
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      
      // Provide user-friendly error messages
      let errorMessage = error.error || "Sign up failed";
      
      if (response.status === 409) {
        errorMessage = error.error || "This email or phone number is already registered. Please try signing in instead.";
      } else if (response.status === 400) {
        errorMessage = error.error || "Please check your information and try again.";
      } else if (response.status === 500) {
        errorMessage = error.error || "Something went wrong on our end. Please try again in a moment.";
      }
      
      throw new Error(errorMessage);
    }

    const result = await response.json();
    setUser(result.user);
    
    // After signup, go to onboarding since new users are not onboarded
    router.push("/onboarding");
  };

  const signOut = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    setUser(null);
    router.push("/login");
  };

  const refreshUser = async () => {
    await fetchUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signIn,
        signUp,
        signOut,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}