import { useSelector } from "react-redux";
import { RootState } from "@/store";

interface Permission {
  resource: string;
  action: string;
  description: string;
}

export const usePermissions = () => {
  const user = useSelector((state: RootState) => state.auth.userDetails);
  const userPermissions = user?.user?.permissions || [];
  const userRoles = user?.user?.roles || [];

  // Check if user has a specific permission
  const hasPermission = (resource: string, action: string): boolean => {
    return userPermissions.some(
      (permission: Permission) =>
        permission.resource === resource && permission.action === action
    );
  };

  // Check if user has any of the required permissions
  const hasAnyPermission = (
    permissions: { resource: string; action: string }[]
  ): boolean => {
    return permissions.some(({ resource, action }) =>
      hasPermission(resource, action)
    );
  };

  // Check if user has all required permissions
  const hasAllPermissions = (
    permissions: { resource: string; action: string }[]
  ): boolean => {
    return permissions.every(({ resource, action }) =>
      hasPermission(resource, action)
    );
  };

  // Check if user has a specific role
  const hasRole = (role: string): boolean => {
    return userRoles.includes(role);
  };

  // Check if user has any of the required roles
  const hasAnyRole = (roles: string[]): boolean => {
    return roles.some((role) => hasRole(role));
  };

  // Check if user is premium
  const isPremium = (): boolean => {
    return hasRole("PREMIUM_USER");
  };

  // Check if user is admin
  const isAdmin = (): boolean => {
    return hasRole("ADMIN");
  };

  // Get all permissions for a specific resource
  const getPermissionsForResource = (resource: string): Permission[] => {
    return userPermissions.filter(
      (permission: Permission) => permission.resource === resource
    );
  };

  // Get all unique resources
  const getUniqueResources = (): string[] => {
    return [
      ...new Set(
        userPermissions.map((permission: Permission) => permission.resource)
      ),
    ];
  };

  // Check if user can perform CRUD operations on a resource
  const canCreate = (resource: string): boolean =>
    hasPermission(resource, "create");
  const canRead = (resource: string): boolean =>
    hasPermission(resource, "read");
  const canUpdate = (resource: string): boolean =>
    hasPermission(resource, "update");
  const canDelete = (resource: string): boolean =>
    hasPermission(resource, "delete");

  // Check if user can manage a resource (has all CRUD permissions)
  const canManage = (resource: string): boolean => {
    return (
      canCreate(resource) &&
      canRead(resource) &&
      canUpdate(resource) &&
      canDelete(resource)
    );
  };

  return {
    userPermissions,
    userRoles,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    isPremium,
    isAdmin,
    getPermissionsForResource,
    getUniqueResources,
    canCreate,
    canRead,
    canUpdate,
    canDelete,
    canManage,
  };
};
