"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState, store } from "@/store/index";
import { Loader2 } from "lucide-react";

interface AdminGuardProps {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const { userDetails } = useSelector((state: RootState) => state.auth);
  const user = userDetails?.user;
  const isAuthenticated = !!userDetails;

  // Check if Redux state is properly loaded
  const [isReduxReady, setIsReduxReady] = useState(false);

  useEffect(() => {
    // Check if userDetails exists in Redux state
    if (userDetails) {
      console.log("AdminGuard - Redux state loaded, userDetails found");
      setIsReduxReady(true);
    } else {
      // If no userDetails, wait a bit and check again
      const timer = setTimeout(() => {
        const currentState = store.getState();
        if (currentState.auth.userDetails) {
          console.log("AdminGuard - Redux state loaded after delay");
          setIsReduxReady(true);
        } else {
          console.log("AdminGuard - No user data found, redirecting to login");
          router.push("/login");
        }
      }, 1500); // Wait 1.5 seconds for Redux to rehydrate

      return () => clearTimeout(timer);
    }
  }, [userDetails, router]);

  useEffect(() => {
    if (!isReduxReady) {
      console.log("AdminGuard - Waiting for Redux to be ready...");
      return;
    }

    console.log("AdminGuard - Checking authentication...");
    console.log("AdminGuard - isAuthenticated:", isAuthenticated);
    console.log("AdminGuard - userDetails:", userDetails);
    console.log("AdminGuard - user:", user);
    console.log("AdminGuard - user roles:", user?.roles);

    if (!isAuthenticated) {
      console.log("AdminGuard - Not authenticated, redirecting to login");
      router.push("/login");
      return;
    }

    // Check if user has admin role, handling both string and object formats
    const isAdmin = user?.roles?.some(
      (role: any) =>
        (typeof role === "string" && role === "ADMIN") ||
        (typeof role === "object" &&
          (role.role === "ADMIN" || role.role_name === "ADMIN"))
    );

    console.log("AdminGuard - isAdmin:", isAdmin);
    console.log(
      "AdminGuard - Role check details:",
      user?.roles?.map((role: any) => ({
        type: typeof role,
        value: role,
        role: typeof role === "object" ? role.role : null,
        role_name: typeof role === "object" ? role.role_name : null,
      }))
    );

    if (!isAdmin) {
      console.log("AdminGuard - Not admin, redirecting to not-allowed");
      router.push("/not-allowed");
      return;
    }

    console.log("AdminGuard - Admin privileges confirmed, allowing access");
    setIsChecking(false);
  }, [isAuthenticated, user, router, isReduxReady]);

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Checking admin privileges...</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
