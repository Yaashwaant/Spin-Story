"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { isTokenComplete } from "@/lib/auth-client";

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
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const fetchUser = async (forceRefresh = false) => {
    // Skip auth check for public routes to avoid unnecessary API calls
    const publicRoutes = ["/", "/login", "/signup", "/forgot-password", "/reset-password", "/bdr/login"];
    const isPublicRoute = publicRoutes.some(route => pathname === route || pathname?.startsWith(route + '/'));
    
    if (isPublicRoute && !forceRefresh) {
      setIsLoading(false);
      return;
    }

    try {
      console.log("Auth provider - fetching user data, pathname:", pathname);
      console.log("Auth provider - cookies:", document.cookie);
      
      // Check if current token is complete - if not, auth me endpoint will auto-refresh it
      const currentToken = document.cookie.split('; ').find(row => row.startsWith('auth-token='))?.split('=')[1];
      if (currentToken) {
        const isComplete = isTokenComplete(currentToken);
        console.log("Auth provider - token complete:", isComplete);
        if (!isComplete) {
          console.log("Auth provider - token incomplete, will be refreshed by server");
        }
      }
      
      const response = await fetch(`/api/auth/me?t=${Date.now()}`, {
        credentials: "include",
      });
      console.log("Auth provider - response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("Auth provider - user data fetched:", data.user);
        console.log("Auth provider - onboarded status:", data.user.onboarded);
        setUser(data.user);
        
        // Check if user needs onboarding
        // Allow BDR routes to be accessible even if not onboarded
        // Special case: if we just came from onboarding and user is now onboarded, don't redirect back
        const justCompletedOnboarding = pathname === "/dashboard" && 
          (typeof document !== "undefined" && document.referrer.includes("/onboarding"));
        
        if (!data.user.onboarded && pathname !== "/onboarding" && !pathname?.startsWith("/bdr") && !justCompletedOnboarding) {
          console.log("Auth provider - redirecting to onboarding because user not onboarded");
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
    await fetchUser(true); // Force refresh to get latest data
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
        setUser,
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