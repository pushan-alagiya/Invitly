/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { Shield, CheckCircle, XCircle, Loader } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { BaseClient } from "@/api/ApiClient";
import { projectEndPoint } from "@/utils/apiEndPoints";

interface AuthState {
  userDetails: {
    user: {
      id: number;
      name: string;
      email: string;
      roles?: string[];
    };
    token: string;
  } | null;
}

export default function JoinProjectPage() {
  const params = useParams();
  const router = useRouter();
  const { userDetails } = useSelector(
    (state: { auth: AuthState }) => state.auth
  );

  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [joining, setJoining] = useState(false);
  const [projectInfo, setProjectInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userDetails) {
      setError("You must be logged in to join a project");
      setLoading(false);
      return;
    }

    joinProject();
  }, [userDetails]);

  const joinProject = async () => {
    try {
      setJoining(true);
      const response = await BaseClient.post(
        `${projectEndPoint.access}/join/${params.code}`
      );

      if ((response?.data as any)?.success) {
        const data = (response?.data as any)?.data;
        setProjectInfo(data);
        toast.success("Successfully joined project!");

        // Redirect to project after a short delay
        setTimeout(() => {
          router.push(`/projects/${data.project_id}`);
        }, 2000);
      } else {
        setError((response?.data as any)?.message || "Failed to join project");
      }
    } catch (error: any) {
      console.error("Error joining project:", error);
      setError(error?.response?.data?.message || "Failed to join project");
    } finally {
      setLoading(false);
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle>Unable to Join Project</CardTitle>
            <CardDescription>
              There was an issue with the access link
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Alert className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button onClick={() => router.push("/projects")} className="w-full">
              Go to Projects
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (projectInfo) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle>Successfully Joined!</CardTitle>
            <CardDescription>
              You now have access to the project
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="space-y-2">
              <h3 className="font-medium">{projectInfo.project_name}</h3>
              <div className="flex items-center justify-center gap-2">
                <Shield className="h-4 w-4" />
                <span className="text-sm text-muted-foreground">
                  {projectInfo.permission_name} Access
                </span>
              </div>
            </div>

            <div className="pt-4">
              <p className="text-sm text-muted-foreground mb-4">
                Redirecting to project...
              </p>
              <Button
                onClick={() =>
                  router.push(`/projects/${projectInfo.project_id}`)
                }
                className="w-full"
              >
                Go to Project Now
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
