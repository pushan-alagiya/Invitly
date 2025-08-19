/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Settings, Shield } from "lucide-react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader } from "@/components/ui/loader";

import { BaseClient } from "@/api/ApiClient";
import { projectEndPoint } from "@/utils/apiEndPoints";

interface Project {
  id: number;
  name: string;
  description: string;
  cover_image?: string;
  status: string;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
  owner: number;
}

export default function ProjectSettingsPage() {
  const params = useParams();
  const router = useRouter();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjectData();
  }, [params.id]);

  const loadProjectData = async () => {
    try {
      setLoading(true);

      const response = await BaseClient.get<any>(
        `${projectEndPoint.getProjectDetails}/${params.id}`
      );

      if (response?.data?.success) {
        const projectData = response?.data?.data;
        setProject(projectData);
      }
    } catch (error: unknown) {
      console.error("Error loading project data:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Please try again later.";
      toast.error("Failed to load project settings", {
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center h-64">
        <Alert className="max-w-md">
          <AlertDescription>
            Project not found or you don&apos;t have permission to access it.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <div className="ml-4"></div>
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href={`/projects/${params?.id}`}>
                  Project
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Settings</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="space-y-6 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* General Settings Card */}
          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() =>
              router.push(`/projects/${params.id}/settings/general`)
            }
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                General Settings
              </CardTitle>
              <CardDescription>
                Manage project details, logo, dates, and status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Update your project name, description, dates, status, and choose
                a project logo.
              </p>
              <Button variant="outline" className="w-full">
                Manage General Settings
              </Button>
            </CardContent>
          </Card>

          {/* Access Settings Card */}
          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() =>
              router.push(`/projects/${params.id}/settings/access`)
            }
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Access Settings
              </CardTitle>
              <CardDescription>
                Manage project access and user permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Control who can access your project and manage their permission
                levels.
              </p>
              <Button variant="outline" className="w-full">
                Manage Access Settings
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
