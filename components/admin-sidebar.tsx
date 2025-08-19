"use client";

import * as React from "react";
import {
  BarChart3,
  Users,
  Settings,
  Activity,
  Database,
  Shield,
  FileText,
  Calendar,
  Mail,
  TrendingUp,
  Globe,
  Server,
  Zap,
  AlertTriangle,
  CheckCircle,
  Home,
  Building2,
  UserPlus,
  CreditCard,
  PieChart,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { usePathname } from "next/navigation";

interface AdminSidebarProps {
  variant?: "default" | "inset";
}

export function AdminSidebar({
  variant = "default",
  ...props
}: AdminSidebarProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const pathName = usePathname();
  const { userDetails } = useSelector((state: RootState) => state.auth);
  const user = userDetails?.user;

  const adminNavItems = [
    {
      title: "Dashboard",
      url: "/admin",
      icon: Home,
      isActive: pathName === "/admin",
    },
    {
      title: "Analytics",
      url: "/admin/analytics",
      icon: BarChart3,
      isActive: pathName?.includes("/admin/analytics"),
    },
    {
      title: "User Management",
      url: "/admin/users",
      icon: Users,
      isActive: pathName?.includes("/admin/users"),
      items: [
        {
          title: "All Users",
          url: "/admin/users",
        },
        {
          title: "User Roles",
          url: "/admin/users/roles",
        },
        {
          title: "User Activity",
          url: "/admin/users/activity",
        },
      ],
    },
    {
      title: "Project Management",
      url: "/admin/projects",
      icon: Building2,
      isActive: pathName?.includes("/admin/projects"),
      items: [
        {
          title: "All Projects",
          url: "/admin/projects",
        },
        {
          title: "Project Analytics",
          url: "/admin/projects/analytics",
        },
        {
          title: "Project Access",
          url: "/admin/projects/access",
        },
      ],
    },
    {
      title: "Event Management",
      url: "/admin/events",
      icon: Calendar,
      isActive: pathName?.includes("/admin/events"),
      items: [
        {
          title: "All Events",
          url: "/admin/events",
        },
        {
          title: "Event Analytics",
          url: "/admin/events/analytics",
        },
        {
          title: "Event Templates",
          url: "/admin/events/templates",
        },
      ],
    },
    {
      title: "Guest Management",
      url: "/admin/guests",
      icon: UserPlus,
      isActive: pathName?.includes("/admin/guests"),
      items: [
        {
          title: "All Guests",
          url: "/admin/guests",
        },
        {
          title: "Guest Analytics",
          url: "/admin/guests/analytics",
        },
        {
          title: "Invitation Status",
          url: "/admin/guests/invitations",
        },
      ],
    },
    {
      title: "Email Management",
      url: "/admin/emails",
      icon: Mail,
      isActive: pathName?.includes("/admin/emails"),
      items: [
        {
          title: "Email Templates",
          url: "/admin/emails/templates",
        },
        {
          title: "Email Analytics",
          url: "/admin/emails/analytics",
        },
        {
          title: "Email Settings",
          url: "/admin/emails/settings",
        },
      ],
    },
    {
      title: "System Health",
      url: "/admin/system",
      icon: Server,
      isActive: pathName?.includes("/admin/system"),
      items: [
        {
          title: "Database Status",
          url: "/admin/system/database",
        },
        {
          title: "Email Service",
          url: "/admin/system/email",
        },
        {
          title: "Storage Status",
          url: "/admin/system/storage",
        },
        {
          title: "System Logs",
          url: "/admin/system/logs",
        },
      ],
    },
    {
      title: "Reports",
      url: "/admin/reports",
      icon: FileText,
      isActive: pathName?.includes("/admin/reports"),
      items: [
        {
          title: "User Reports",
          url: "/admin/reports/users",
        },
        {
          title: "Project Reports",
          url: "/admin/reports/projects",
        },
        {
          title: "Event Reports",
          url: "/admin/reports/events",
        },
        {
          title: "Financial Reports",
          url: "/admin/reports/financial",
        },
      ],
    },
    {
      title: "Settings",
      url: "/admin/settings",
      icon: Settings,
      isActive: pathName?.includes("/admin/settings"),
      items: [
        {
          title: "General Settings",
          url: "/admin/settings/general",
        },
        {
          title: "Security Settings",
          url: "/admin/settings/security",
        },
        {
          title: "Email Settings",
          url: "/admin/settings/email",
        },
        {
          title: "System Settings",
          url: "/admin/settings/system",
        },
      ],
    },
  ];

  const userObj = {
    name: user?.name || "Admin",
    email: user?.email || "",
    avatar: "/avatars/admin.jpg",
  };

  return (
    <div className="flex relative">
      <SidebarProvider
        defaultOpen={true}
        open={!isCollapsed}
        onOpenChange={(open) => setIsCollapsed(!open)}
      >
        <Sidebar collapsible="icon" {...props}>
          <SidebarHeader>
            <div className="flex items-center justify-center h-16">
              <Shield className="h-8 w-8 text-primary" />
              <span className="ml-2 font-bold text-lg">Admin Panel</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <NavMain items={adminNavItems} />
          </SidebarContent>
          <SidebarFooter>
            <NavUser user={userObj} />
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>
      </SidebarProvider>

      {/* Toggle Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="h-8 w-8 p-0 border-l-0 rounded-l-none hover:bg-gray-100 absolute backdrop-blur-xs top-3 bg-primary/10 right-0 z-10 translate-x-8"
        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
