"use client";
import React, { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store"; // Adjust based on your store setup
import Loader from "./loader";

interface PermissionProps {
  children: ReactNode;
}

// Define the routes that are NOT allowed for each role, including unauthenticated users
const notAllowedRoutes: { [key: string]: string[] } = {
  ADMIN: [], // Super Admin can access all routes
  USER: [],
  GUEST: [],
  MODERATOR: [],
  EDITOR: [],
  PHOTOGRAPHER: [],
  VENDOR: [],
  PREMIUM_USER: [],
  Unauthenticated: ["/dashboard", "/projects"], // Block for unauthenticated users
};

const Permission = ({ children }: PermissionProps) => {
  const [isCheckingPermission, setIsCheckingPermission] = useState(true); // Loading state
  const user = useSelector((state: RootState) => state.auth.userDetails); // Get user details from Redux
  const path = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Determine the user's role or fallback to "Unauthenticated" if no user is present

    const role = user?.user?.role || "Unauthenticated";
    const restrictedRoutes = notAllowedRoutes[role];

    // Check if the current path is restricted for the user's role
    const isRestricted = restrictedRoutes?.some((route: string) => {
      if (route.includes("[id]")) {
        // Handle dynamic route matching (like /orders/[id])
        const dynamicRoute = route.split("[id]")[0]; // Extract the base dynamic route (e.g., '/orders/')
        return path.startsWith(dynamicRoute); // Check if the path starts with the base dynamic route
      }
      return path.startsWith(route); // For non-dynamic routes
    });

    if (isRestricted) {
      // Redirect to a login page or a "not allowed" page if the route is restricted
      const encodedPath = encodeURIComponent(path);

      router.replace(user ? "/not-allowed" : `/login?next=${encodedPath}`);
    } else {
      setIsCheckingPermission(false); // Allow rendering if permission is granted
    }
  }, [user, path, router]);

  if (isCheckingPermission) {
    // Optionally, you can return a loading spinner or a placeholder here
    return (
      <div className="h-screen">
        <Loader />
      </div>
    ); // Or <div>Loading...</div>
  }

  return <>{children}</>; // Render children only after permission check
};

export default Permission;
