"use client";
import React, { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import Loader from "./loader";

interface PermissionProps {
  children: ReactNode;
}

// Define the routes that are NOT allowed for each role, including unauthenticated users
const notAllowedRoutes: { [key: string]: string[] } = {
  ADMIN: [], // Super Admin can access all routes
  USER: [], // Regular users can access most routes
  GUEST: [
    "/dashboard",
    "/projects/create",
    "/projects/[id]/settings",
    "/projects/[id]/delete",
  ],
  MODERATOR: [],
  EDITOR: [],
  PHOTOGRAPHER: [],
  VENDOR: [],
  PREMIUM_USER: [],
  Unauthenticated: ["/dashboard", "/projects", "/profile", "/projects/create"], // Block for unauthenticated users
};

// Define permission-based route restrictions for USER role
const userPermissionRoutes: {
  [key: string]: { resource: string; action: string }[];
} = {
  "/projects/create": [{ resource: "project", action: "create" }],
  "/projects/[id]/settings": [{ resource: "project", action: "update" }],
  "/projects/[id]/delete": [{ resource: "project", action: "delete" }],
  "/events/create": [{ resource: "event", action: "create" }],
  "/guests/create": [{ resource: "guest", action: "create" }],
  "/vendors/create": [{ resource: "vendor", action: "create" }],
  "/users/manage": [{ resource: "user", action: "read" }],
};

// Default permissions for USER role
const defaultUserPermissions = [
  {
    resource: "user",
    action: "read",
    description: "Can view user information",
  },
  {
    resource: "user",
    action: "update",
    description: "Can update user information",
  },
  { resource: "project", action: "create", description: "Can create projects" },
  { resource: "project", action: "read", description: "Can view projects" },
  { resource: "project", action: "update", description: "Can update projects" },
  { resource: "project", action: "delete", description: "Can delete projects" },
  { resource: "event", action: "create", description: "Can create events" },
  { resource: "event", action: "read", description: "Can view events" },
  { resource: "event", action: "update", description: "Can update events" },
  {
    resource: "invitation",
    action: "create",
    description: "Can create invitations",
  },
  {
    resource: "invitation",
    action: "read",
    description: "Can view invitations",
  },
  {
    resource: "invitation",
    action: "update",
    description: "Can update invitations",
  },
  { resource: "photo", action: "read", description: "Can view photos" },
  { resource: "photo", action: "create", description: "Can upload photos" },
  { resource: "guest", action: "read", description: "Can view guest list" },
  { resource: "guest", action: "create", description: "Can add guests" },
  { resource: "vendor", action: "read", description: "Can view vendors" },
  { resource: "vendor", action: "create", description: "Can add vendors" },
];

const Permission = ({ children }: PermissionProps) => {
  const [isCheckingPermission, setIsCheckingPermission] = useState(true);
  const user = useSelector((state: RootState) => state.auth.userDetails);
  const path = usePathname();
  const router = useRouter();

  // Helper function to check if user has permission
  const hasPermission = (
    requiredPermissions: { resource: string; action: string }[]
  ) => {
    // For now, use default permissions for USER role
    const userPermissions = user?.user?.permissions || defaultUserPermissions;

    if (!userPermissions || !Array.isArray(userPermissions)) return false;

    return requiredPermissions.every((required) =>
      userPermissions.some(
        (permission) =>
          permission.resource === required.resource &&
          permission.action === required.action
      )
    );
  };

  useEffect(() => {
    // Determine the user's roles or fallback to "Unauthenticated" if no user is present
    const roles = user?.user?.roles || [];
    const isAuthenticated = user && user.user;

    console.log("Permission check - User roles:", roles);
    console.log("Permission check - Current path:", path);
    console.log("Permission check - Is authenticated:", isAuthenticated);

    // ADMIN users have full access - bypass ALL checks immediately
    const hasAdminRole = roles.some(
      (role: any) =>
        (typeof role === "string" && role === "ADMIN") ||
        (typeof role === "object" &&
          (role.role === "ADMIN" || role.role_name === "ADMIN"))
    );

    if (isAuthenticated && hasAdminRole) {
      console.log("ADMIN user detected - granting full access");

      // If admin user is on login page, redirect to admin dashboard
      if (path === "/login") {
        console.log("Admin user on login page, redirecting to admin dashboard");
        router.replace("/admin");
        return;
      }

      setIsCheckingPermission(false);
      return;
    }

    if (!isAuthenticated) {
      // Check if current path is restricted for unauthenticated users
      const restrictedRoutes = notAllowedRoutes["Unauthenticated"];
      const isRestricted = restrictedRoutes?.some((route: string) => {
        if (route.includes("[id]")) {
          const dynamicRoute = route.split("[id]")[0];
          return path.startsWith(dynamicRoute);
        }
        return path.startsWith(route);
      });

      if (isRestricted) {
        const encodedPath = encodeURIComponent(path);
        router.replace(`/login?next=${encodedPath}`);
        return;
      }
    } else {
      // Check role-based restrictions (only for non-ADMIN users)
      let isRoleRestricted = false;

      for (const role of roles) {
        // Handle both string and object role formats
        const roleName =
          typeof role === "string" ? role : role.role || role.role_name;
        const restrictedRoutes = notAllowedRoutes[roleName] || [];
        const isRestricted = restrictedRoutes?.some((route: string) => {
          if (route.includes("[id]")) {
            const dynamicRoute = route.split("[id]")[0];
            return path.startsWith(dynamicRoute);
          }
          return path.startsWith(route);
        });

        if (isRestricted) {
          isRoleRestricted = true;
          break;
        }
      }

      if (isRoleRestricted) {
        console.log("Role restricted - redirecting to not-allowed");
        router.replace("/not-allowed");
        return;
      }

      // Check permission-based restrictions (only for USER role, not ADMIN)
      const hasUserRole = roles.some(
        (role: any) =>
          (typeof role === "string" && role === "USER") ||
          (typeof role === "object" &&
            (role.role === "USER" || role.role_name === "USER"))
      );

      if (hasUserRole) {
        console.log("Checking USER permissions for path:", path);
        for (const [routePattern, requiredPermissions] of Object.entries(
          userPermissionRoutes
        )) {
          if (routePattern.includes("[id]")) {
            const dynamicRoute = routePattern.split("[id]")[0];
            if (path.startsWith(dynamicRoute)) {
              console.log("Checking dynamic route:", dynamicRoute);
              if (!hasPermission(requiredPermissions)) {
                console.log("Permission denied for dynamic route");
                router.replace("/not-allowed");
                return;
              }
            }
          } else if (path === routePattern) {
            console.log("Checking exact route:", routePattern);
            if (!hasPermission(requiredPermissions)) {
              console.log("Permission denied for exact route");
              router.replace("/not-allowed");
              return;
            }
          }
        }
      }
    }

    console.log("Permission check passed - allowing access");
    setIsCheckingPermission(false);
  }, [user, path, router]);

  if (isCheckingPermission) {
    return (
      <div className="h-screen">
        <Loader />
      </div>
    );
  }

  return <>{children}</>;
};

export default Permission;
