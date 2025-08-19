"use client";
import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { usePermissions } from "@/hooks/usePermissions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Crown,
  Shield,
  Settings,
  Edit,
  LogOut,
} from "lucide-react";
import { PremiumBadge } from "./premium-features";
import { logoutUser } from "@/store/slices/auth";
import { store } from "@/store";
import { useRouter } from "next/navigation";

export const UserProfile: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.userDetails);
  const { userRoles, userPermissions, isPremium, isAdmin } = usePermissions();
  const router = useRouter();

  if (!user?.user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Profile</CardTitle>
          <CardDescription>Please log in to view your profile</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const handleLogout = async () => {
    await store.dispatch(logoutUser());
    router.push("/login");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const groupedPermissions = userPermissions.reduce((acc, permission) => {
    if (!acc[permission.resource]) {
      acc[permission.resource] = [];
    }
    acc[permission.resource].push(permission.action);
    return acc;
  }, {} as Record<string, string[]>);

  return (
    <div className="space-y-6">
      {/* User Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.user.profile_picture} />
              <AvatarFallback className="text-lg">
                {getInitials(user.user.name || "User")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <CardTitle className="text-2xl">{user.user.name}</CardTitle>
                <PremiumBadge />
                {isAdmin() && (
                  <Badge variant="destructive">
                    <Shield className="h-3 w-3 mr-1" />
                    Admin
                  </Badge>
                )}
              </div>
              <CardDescription className="text-base">
                {user.user.email}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Phone:</span>
                <span>{user.user.phone_number || "Not provided"}</span>
              </div>
              {user.user.address && (
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <span className="text-muted-foreground">Address:</span>
                    <div>{user.user.address}</div>
                    {user.user.city && user.user.state && (
                      <div className="text-muted-foreground">
                        {user.user.city}, {user.user.state} {user.user.zip_code}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Status:</span>
                <Badge
                  variant={
                    user.user.status === "active" ? "default" : "secondary"
                  }
                >
                  {user.user.status}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Verified:</span>
                <Badge
                  variant={user.user.is_verified ? "default" : "secondary"}
                >
                  {user.user.is_verified ? "Yes" : "No"}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Roles Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Roles
          </CardTitle>
          <CardDescription>
            Your assigned roles and their permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {userRoles.map((role) => (
                <Badge key={role} variant="outline" className="text-sm">
                  {role}
                </Badge>
              ))}
            </div>
            {isPremium() && (
              <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg">
                <Crown className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Premium User</span>
                <span className="text-sm text-muted-foreground">
                  - Access to all premium features
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Permissions Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Permissions
          </CardTitle>
          <CardDescription>
            Your permissions organized by resource
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(groupedPermissions).map(([resource, actions]) => (
              <div key={resource} className="space-y-2">
                <h4 className="font-medium capitalize">{resource}</h4>
                <div className="flex flex-wrap gap-1">
                  {actions.map((action) => (
                    <Badge key={action} variant="secondary" className="text-xs">
                      {action}
                    </Badge>
                  ))}
                </div>
                <Separator />
              </div>
            ))}
            {userPermissions.length === 0 && (
              <p className="text-muted-foreground text-sm">
                No permissions assigned
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
