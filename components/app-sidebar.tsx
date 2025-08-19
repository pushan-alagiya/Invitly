/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import {
  BookOpen,
  Bot,
  Codesandbox,
  Frame,
  Map,
  PieChart,
  Settings2,
  CalendarDays,
  Users,
  ChevronLeft,
  ChevronRight,
  Shield,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
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
import { useEffect, useState } from "react";
import { BaseClient } from "@/api/ApiClient";
import { eventEndPoint, projectEndPoint } from "@/utils/apiEndPoints";
import { usePathname } from "next/navigation";
import { useParams } from "next/navigation";
import { resetProject } from "@/store/slices/project";
import { useDispatch } from "react-redux";
import { Skeleton } from "./ui/skeleton";
import { eventChange } from "@/store/slices/event";

// =================================================================

interface ProjectInterface {
  id: number;
  name: string;
  description: string;
  cover_image: string | null;
}

interface GetRecentProject {
  success: boolean;
  data: {
    rows: ProjectInterface[];
    count: number;
  };
  message: string;
  code: number;
}

interface ProjectDetailsInterace {
  id: number;
  name: string;
  description: string;
  owner: number;
  start_date: string;
  end_date: string;
  cover_image: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  accessUsers: {
    user_id: number;
    permission: {
      id: number;
      permission_name: string;
      description: string;
    };
  }[];
}

interface getProjectDetails {
  success: boolean;
  data: ProjectDetailsInterace;
  message: string;
  code: number;
}

interface EventInterface {
  id: number;
  project_id: number;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  location: string | null;
  logo: string | null;
  type: string | null;
  status: string | null;
  createdAt: string;
  updatedAt: string;
}

interface getEventDetails {
  success: boolean;
  data: {
    rows: EventInterface[];
    count: number;
  };
  message: string;
  code: number;
}

//=================================================================

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = useSelector(
    (state: RootState) => state?.auth?.userDetails?.user
  );

  const params = useParams();
  const dispatch = useDispatch();
  const pathName = usePathname();

  // Add state for sidebar collapse
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Check if we're in the template creator
  const isTemplateCreator = pathName?.includes("/template-creator");

  // Auto-collapse when template creator is open
  useEffect(() => {
    if (isTemplateCreator) {
      setIsCollapsed(true);
    }
  }, [isTemplateCreator]);

  const [projectDetails, setProjectDetails] = useState<ProjectDetailsInterace>({
    id: 0,
    name: "",
    description: "",
    owner: 0,
    start_date: "",
    end_date: "",
    cover_image: "",
    status: "",
    created_at: "",
    updated_at: "",
    deleted_at: "",
    accessUsers: [],
  });

  const hasReadPermission =
    projectDetails.accessUsers?.some(
      (accessUser) =>
        accessUser.user_id === user?.id && accessUser.permission?.id === 1
    ) || false;

  const hasWritePermission =
    projectDetails.accessUsers?.some(
      (accessUser) =>
        accessUser.user_id === user?.id && accessUser.permission?.id === 2
    ) || false;

  const hasEditPermission =
    projectDetails.accessUsers?.some(
      (accessUser) =>
        accessUser.user_id === user?.id && accessUser.permission?.id === 3
    ) || false;

  const hasAddMemberPermission =
    projectDetails.accessUsers?.some(
      (accessUser) =>
        accessUser.user_id === user?.id && accessUser.permission?.id === 4
    ) || false;

  const hasDeletePermission =
    projectDetails.accessUsers?.some(
      (accessUser) =>
        accessUser.user_id === user?.id && accessUser.permission?.id === 5
    ) || false;

  const hasManageRolesPermission =
    projectDetails.accessUsers?.some(
      (accessUser) =>
        accessUser.user_id === user?.id && accessUser.permission?.id === 6
    ) || false;

  const [projects, setProjects] = useState<{
    rows: ProjectInterface[];
    count: number;
  }>({
    rows: [],
    count: 0,
  });

  const [events, setEvents] = useState<{
    rows: EventInterface[];
    count: number;
  }>({
    rows: [],
    count: 0,
  });

  const { projectChanged: isProjectChanged } = useSelector(
    (state: RootState) => state?.project
  );

  // Check if current page is a settings page
  const isSettingsPage = pathName?.includes("/settings");

  const [projectLoading, setProjectLoading] = useState(false);
  const [eventLoading, setEventLoading] = useState(false);

  const fetchProjects = async () => {
    setProjectLoading(true);
    try {
      const projects = await BaseClient.get<GetRecentProject>(
        `${projectEndPoint.getRecentProject}`
      );

      if (projects?.data?.success) {
        setProjects(projects?.data?.data);
      } else {
        console.error("Error fetching projects: ", projects);
      }
    } catch (error) {
      console.error("Error fetching projects: ", error);
    } finally {
      setProjectLoading(false);
    }
  };

  const fetchProjectDetails = async (projectId: number) => {
    try {
      const response = await BaseClient.get<getProjectDetails>(
        `${projectEndPoint.getProjectDetails}/${projectId}`
      );

      if (response?.data?.success) {
        setProjectDetails(response?.data?.data);
      } else {
        console.error("Error fetching project details: ", response);
      }
    } catch (error) {
      console.error("Error fetching project details: ", error);
    } finally {
    }
  };

  const fetchEvents = async (projectId: number) => {
    setEventLoading(true);
    try {
      console.log("fetchEvents called with projectId:", projectId);
      console.log("Using endpoint:", `${eventEndPoint.getEvents}/${projectId}`);

      const response = await BaseClient.get<getEventDetails>(
        `${eventEndPoint.getEvents}/${projectId}`
      );

      console.log("Events API response:", response);

      if (response?.data?.success) {
        setEvents(response?.data?.data);
        console.log("Events set successfully:", response?.data?.data);
      } else {
        console.error(
          "Error fetching events - API returned failure:",
          response?.data
        );
        setEvents({ rows: [], count: 0 });
      }

      dispatch(eventChange());
    } catch (error) {
      console.error("Error fetching events:", error);
      setEvents({ rows: [], count: 0 });
    } finally {
      setEventLoading(false);
    }
  };

  // fetch the projects
  useEffect(() => {
    if (pathName?.startsWith("/projects/access/")) return;
    else {
      fetchProjects();
      if (params?.id) {
        fetchEvents(params.id ? parseInt(params.id as string, 10) : 0);
      }
    }

    if (params.id && typeof params.id === "string") {
      const projectId = parseInt(params.id, 10);

      if (!isNaN(projectId)) {
        fetchProjectDetails(projectId);
      } else {
        console.error("Invalid project ID:", params.id);
      }
    }

    dispatch(resetProject());
  }, [isProjectChanged, dispatch, pathName, params.id]);

  // This is sample data.
  const data = {
    user: {
      name: "shadcn",
      email: "m@example.com",
      avatar: "/avatars/shadcn.jpg",
    },
    navMain: [
      // Add admin navigation for admin users
      ...(user?.roles?.some(
        (role: string | { role?: string; role_name?: string }) =>
          (typeof role === "string" && role === "ADMIN") ||
          (typeof role === "object" &&
            (role.role === "ADMIN" || role.role_name === "ADMIN"))
      )
        ? [
            {
              title: "Admin Panel",
              url: "/admin",
              icon: Shield,
              isActive: pathName?.includes("/admin"),
            },
          ]
        : []),
      ...(params?.id
        ? [
            {
              title: "Events",
              url: `/projects/${params.id}`,
              icon: CalendarDays,
              isActive:
                pathName?.includes(`/projects/${params.id}`) &&
                !pathName?.includes("/guests") &&
                !pathName?.includes("/settings") &&
                !pathName?.includes("/template-creator"),
              items: events?.rows?.map((event) => ({
                title: event?.name,
                url: `/projects/${event?.project_id}/events/${event?.id}`,
                logo: event?.logo ?? undefined,
                isActive: pathName?.includes(`/events/${event?.id}`),
              })),
            },
            {
              title: "Guests",
              url: `/projects/${params.id}/guests`,
              icon: Users,
              isActive: pathName?.includes("/guests"),
            },
          ]
        : []),

      {
        title: "Documentation",
        url: "#",
        icon: BookOpen,
        isActive: false, // Keep documentation collapsed when on settings
        items: [
          {
            title: "Introduction",
            url: "#",
          },
          {
            title: "Get Started",
            url: "#",
          },
          {
            title: "Tutorials",
            url: "#",
          },
          {
            title: "Changelog",
            url: "#",
          },
        ],
      },
      ...(params?.id
        ? [
            {
              title: "Settings",
              url: `/projects/${params.id}/settings`,
              icon: Settings2,
              isActive: isSettingsPage, // Expand settings when on settings page
              items: [
                {
                  title: "General Settings",
                  url: `/projects/${params.id}/settings/general`,
                },
                {
                  title: "Access Settings",
                  url: `/projects/${params.id}/settings/access`,
                },
              ],
            },
          ]
        : []),
    ],
    projects: projects.rows.map((project) => ({
      name: project.name,
      url: `/projects/${project.id}`,
      icon: Frame,
    })),
  };

  const userObj = {
    name: user?.name || "shadcn",
    email: user?.email || "",
    avatar: "/avatars/shadcn.jpg",
  };

  return (
    <div className="flex relative">
      <SidebarProvider
        defaultOpen={!isTemplateCreator}
        open={!isCollapsed}
        onOpenChange={(open) => setIsCollapsed(!open)}
      >
        <Sidebar collapsible="icon" {...props}>
          {pathName?.startsWith("/projects/") ? (
            <SidebarHeader>
              <TeamSwitcher teams={projects?.rows || []} />
            </SidebarHeader>
          ) : (
            <Codesandbox className="h-16 py-4 text-center w-full text-primary-500" />
          )}
          <SidebarContent>
            {params?.id ? (
              <NavMain items={data?.navMain} />
            ) : (
              <NavProjects projects={projects.rows} />
            )}
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
