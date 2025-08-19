# Frontend Permission System Documentation

## Overview

The frontend has been updated to work with the new resource-action based permission system and role-based premium access. This document outlines the key changes and how to use the new system.

## Key Changes

### 1. Updated User Structure

The user object now includes:

- `roles`: Array of role names (e.g., `["USER", "PREMIUM_USER"]`)
- `permissions`: Array of permission objects with resource-action format
- Removed `subscription_status` field

```typescript
interface IUserDetails {
  user: {
    id?: number;
    name?: string;
    email: string;
    phone_number?: string;
    roles?: string[];
    permissions?: IPermission[];
    status?: string;
    profile_picture?: string;
    // ... other fields
  };
  token: string;
}

interface IPermission {
  resource: string;
  action: string;
  description: string;
}
```

### 2. Updated Auth Slice

The Redux auth slice has been updated to handle the new user structure:

```typescript
// New actions
updateUserPermissions: (state, action) => {
  /* ... */
};
updateUserRoles: (state, action) => {
  /* ... */
};

// New thunk
registerUser: (payload) => {
  /* ... */
};
```

### 3. Permission Component

The `Permission` component now supports:

- Multiple roles per user
- Resource-action based permission checking
- Dynamic route restrictions
- Permission-based route access

```typescript
// Role-based restrictions
const notAllowedRoutes: { [key: string]: string[] } = {
  GUEST: ["/dashboard", "/projects/create", "/projects/[id]/settings"],
  Unauthenticated: ["/dashboard", "/projects", "/profile"],
};

// Permission-based restrictions
const permissionBasedRoutes: {
  [key: string]: { resource: string; action: string }[];
} = {
  "/projects/create": [{ resource: "project", action: "create" }],
  "/projects/[id]/settings": [{ resource: "project", action: "update" }],
};
```

### 4. usePermissions Hook

A custom hook for easy permission checking throughout the application:

```typescript
const {
  userPermissions,
  userRoles,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  hasRole,
  hasAnyRole,
  isPremium,
  isAdmin,
  canCreate,
  canRead,
  canUpdate,
  canDelete,
  canManage,
} = usePermissions();

// Usage examples
if (hasPermission("project", "create")) {
  // User can create projects
}

if (isPremium()) {
  // User has premium access
}

if (canManage("event")) {
  // User has full CRUD access to events
}
```

### 5. Premium Features Components

Components for handling premium feature access:

```typescript
// Wrap premium features
<PremiumFeature>
  <AdvancedAnalytics />
</PremiumFeature>

// Show premium features list
<PremiumFeaturesList />

// Show premium badge
<PremiumBadge />
```

### 6. User Profile Component

A comprehensive user profile component that displays:

- User information
- Assigned roles
- Permissions organized by resource
- Premium status

```typescript
<UserProfile />
```

## Usage Examples

### 1. Checking Permissions in Components

```typescript
import { usePermissions } from "@/hooks/usePermissions";

const MyComponent = () => {
  const { hasPermission, isPremium, canCreate } = usePermissions();

  return (
    <div>
      {hasPermission("project", "create") && <Button>Create Project</Button>}

      {isPremium() && (
        <PremiumFeature>
          <AdvancedFeature />
        </PremiumFeature>
      )}

      {canCreate("event") && <Button>Create Event</Button>}
    </div>
  );
};
```

### 2. Conditional Rendering Based on Roles

```typescript
import { usePermissions } from "@/hooks/usePermissions";

const AdminPanel = () => {
  const { isAdmin, hasRole } = usePermissions();

  if (!isAdmin()) {
    return <AccessDenied />;
  }

  return (
    <div>
      <h1>Admin Panel</h1>
      {/* Admin content */}
    </div>
  );
};
```

### 3. Premium Feature Protection

```typescript
import { PremiumFeature } from "@/components/premium-features";

const ProjectList = () => {
  return (
    <div>
      <h1>My Projects</h1>

      {/* Free features */}
      <BasicProjectList />

      {/* Premium features */}
      <PremiumFeature>
        <AdvancedProjectAnalytics />
      </PremiumFeature>

      <PremiumFeature fallback={<UpgradePrompt />}>
        <BulkOperations />
      </PremiumFeature>
    </div>
  );
};
```

### 4. Route Protection

The `Permission` component automatically protects routes based on:

- User authentication status
- Role-based restrictions
- Permission-based restrictions

```typescript
// In layout.tsx
<Permission>{children}</Permission>
```

## API Endpoints

Updated API endpoints for the new system:

```typescript
const authEndPoint = {
  login: "/auth/login",
  register: "/auth/register",
  // ... other auth endpoints
};

const permissionEndPoint = {
  getPermissions: "/permissions",
  createPermission: "/permissions",
  // ... other permission endpoints
};

const roleEndPoint = {
  getRoles: "/roles",
  createRole: "/roles",
  // ... other role endpoints
};

const premiumEndPoint = {
  getPremiumUsers: "/premium/users",
  grantPremiumAccess: "/premium/users",
  // ... other premium endpoints
};
```

## Migration Guide

### 1. Update Existing Components

Replace old permission checks:

```typescript
// Old
if (user.role === "ADMIN") {
  /* ... */
}

// New
const { isAdmin } = usePermissions();
if (isAdmin()) {
  /* ... */
}
```

### 2. Update Subscription Checks

Replace subscription status checks:

```typescript
// Old
if (user.subscription_status === "active") {
  /* ... */
}

// New
const { isPremium } = usePermissions();
if (isPremium()) {
  /* ... */
}
```

### 3. Update Permission Checks

Replace old permission checks:

```typescript
// Old
if (user.permissions.includes("MANAGE_USERS")) {
  /* ... */
}

// New
const { hasPermission } = usePermissions();
if (hasPermission("user", "create")) {
  /* ... */
}
```

## Best Practices

### 1. Use the usePermissions Hook

Always use the `usePermissions` hook instead of directly accessing user data:

```typescript
// ✅ Good
const { hasPermission } = usePermissions();
if (hasPermission("project", "create")) {
  /* ... */
}

// ❌ Bad
if (
  user.permissions.some(
    (p) => p.resource === "project" && p.action === "create"
  )
) {
  /* ... */
}
```

### 2. Check Permissions at Component Level

Check permissions at the component level rather than just at the route level:

```typescript
const ProjectActions = () => {
  const { canCreate, canUpdate, canDelete } = usePermissions();

  return (
    <div>
      {canCreate("project") && <CreateButton />}
      {canUpdate("project") && <EditButton />}
      {canDelete("project") && <DeleteButton />}
    </div>
  );
};
```

### 3. Use PremiumFeature Component

Wrap premium features with the `PremiumFeature` component:

```typescript
<PremiumFeature>
  <AdvancedAnalytics />
</PremiumFeature>
```

### 4. Provide Fallbacks

Always provide fallbacks for premium features:

```typescript
<PremiumFeature fallback={<UpgradePrompt />}>
  <PremiumFeature />
</PremiumFeature>
```

## Testing

### 1. Test Permission Checks

```typescript
import { renderHook } from "@testing-library/react";
import { usePermissions } from "@/hooks/usePermissions";

test("should check permissions correctly", () => {
  const { result } = renderHook(() => usePermissions());

  expect(result.current.hasPermission("project", "create")).toBe(true);
  expect(result.current.isPremium()).toBe(false);
});
```

### 2. Test Premium Features

```typescript
test("should show premium overlay for non-premium users", () => {
  render(
    <PremiumFeature>
      <AdvancedFeature />
    </PremiumFeature>
  );

  expect(screen.getByText("Premium Feature")).toBeInTheDocument();
  expect(screen.getByText("Upgrade to Premium")).toBeInTheDocument();
});
```

## Troubleshooting

### Common Issues

1. **Permissions not loading**: Check if the user object is properly structured
2. **Premium features not working**: Verify the user has the `PREMIUM_USER` role
3. **Route access denied**: Check the permission-based route restrictions

### Debug Commands

```typescript
// Log user permissions
console.log("User permissions:", userPermissions);
console.log("User roles:", userRoles);

// Check specific permission
console.log("Can create project:", hasPermission("project", "create"));
console.log("Is premium:", isPremium());
```

## Conclusion

The new permission system provides:

- Better organization with resource-action format
- Role-based premium access
- Flexible permission checking
- Easy-to-use hooks and components
- Comprehensive user profile management

This system is more maintainable, scalable, and provides better user experience for both free and premium users.
