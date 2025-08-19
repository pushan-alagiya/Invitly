/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { Shield, ArrowLeft, Plus, Trash2, Copy, Mail } from "lucide-react";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader } from "@/components/ui/loader";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

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

interface ProjectAccess {
  id: number;
  user_id: number;
  project_id: number;
  permission_level: number;
  granted_by: number;
  granted_at: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

interface AccessLink {
  id: string;
  project_id: number;
  permission_level: number;
  created_by: number;
  created_at: string;
  expires_at: string;
  is_active: boolean;
  access_code: string;
}

const PERMISSION_LEVELS = {
  1: "READ",
  2: "WRITE",
  3: "EDIT",
  4: "ADD_MEMBER",
  5: "DELETE",
  6: "MANAGE_ROLES",
  7: "OWNER",
};

export default function AccessSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const { userDetails } = useSelector(
    (state: { auth: AuthState }) => state.auth
  );

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasEditPermission, setHasEditPermission] = useState(false);
  const [projectUsers, setProjectUsers] = useState<ProjectAccess[]>([]);
  const [myAccess, setMyAccess] = useState<ProjectAccess | null>(null);
  const [accessLinks, setAccessLinks] = useState<AccessLink[]>([]);
  const [selectedPermissionLevel, setSelectedPermissionLevel] = useState("1");
  const [generatingLink, setGeneratingLink] = useState(false);
  const [sendEmail, setSendEmail] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    loadProjectData();
    loadProjectUsers();
    loadMyAccess();
    loadAccessLinks();
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

        // Check if user has edit permission (owner or admin)
        setHasEditPermission(
          projectData.owner === userDetails?.user?.id ||
            userDetails?.user?.roles?.includes("ADMIN") ||
            false
        );
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

  const loadProjectUsers = async () => {
    try {
      const response = await BaseClient.get<any>(
        `${projectEndPoint.access}/users/${params.id}`
      );

      if (response?.data?.success) {
        setProjectUsers(response?.data?.data || []);
      }
    } catch (error) {
      console.error("Error loading project users:", error);
    }
  };

  const loadMyAccess = async () => {
    try {
      console.log("Loading my access for project:", params.id);
      const response = await BaseClient.get<any>(
        `${projectEndPoint.access}/my-access/${params.id}`
      );

      console.log("My access response:", response);

      if (response?.data?.success) {
        const data = response?.data?.data;
        console.log("My access data:", data);
        setMyAccess(data);
      } else {
        console.error("Failed to load my access:", response);
      }
    } catch (error) {
      console.error("Error loading my access:", error);
    }
  };

  const loadAccessLinks = async () => {
    try {
      const response = await BaseClient.get<any>(
        `${projectEndPoint.access}/links/${params.id}`
      );

      if (response?.data?.success) {
        setAccessLinks(response?.data?.data || []);
      }
    } catch (error) {
      console.error("Error loading access links:", error);
    }
  };

  const generateAccessLink = async () => {
    try {
      setGeneratingLink(true);
      const response = await BaseClient.post<any>(
        `${projectEndPoint.access}/generate-link`,
        {
          project_id: params.id,
          permission_level: parseInt(selectedPermissionLevel),
          send_email: sendEmail,
          user_email: sendEmail ? userEmail : undefined,
        }
      );

      if (response?.data?.success) {
        const linkData = response?.data?.data;
        toast.success("Access link generated successfully");

        // Copy link to clipboard
        const accessUrl = `${window.location.origin}/join-project/${linkData.access_code}`;
        await navigator.clipboard.writeText(accessUrl);
        toast.success("Access link copied to clipboard");

        // Reset form
        setSelectedPermissionLevel("1");
        setSendEmail(false);
        setUserEmail("");

        // Reload access links
        loadAccessLinks();
      } else {
        toast.error(
          response?.data?.message || "Failed to generate access link"
        );
      }
    } catch (error: any) {
      console.error("Error generating access link:", error);
      toast.error(
        error?.response?.data?.message || "Failed to generate access link"
      );
    } finally {
      setGeneratingLink(false);
    }
  };

  const copyAccessLink = async (accessCode: string) => {
    try {
      const accessUrl = `${window.location.origin}/join-project/${accessCode}`;
      await navigator.clipboard.writeText(accessUrl);
      toast.success("Access link copied to clipboard");
    } catch (error) {
      console.error("Error copying access link:", error);
      toast.error("Failed to copy link to clipboard");
    }
  };

  const revokeAccessLink = async (linkId: string) => {
    try {
      console.log("Attempting to revoke access link:", linkId);
      const response = await BaseClient.delete<any>(
        `${projectEndPoint.access}/revoke-link/${linkId}`
      );

      console.log("Revoke response:", response);

      if (response?.data?.success) {
        toast.success("Access link revoked successfully");
        loadAccessLinks();
      } else {
        toast.error(response?.data?.message || "Failed to revoke access link");
      }
    } catch (error: any) {
      console.error("Error revoking access link:", error);
      console.error("Error response:", error?.response);
      toast.error(
        error?.response?.data?.message || "Failed to revoke access link"
      );
    }
  };

  const revokeAccess = async (userId: number) => {
    try {
      const response = await BaseClient.delete<any>(
        `${projectEndPoint.access}/revoke/${params.id}/${userId}`
      );

      if (response?.data?.success) {
        toast.success("Access revoked successfully");
        loadProjectUsers();
      } else {
        toast.error(response?.data?.message || "Failed to revoke access");
      }
    } catch (error: any) {
      console.error("Error revoking access:", error);
      toast.error(error?.response?.data?.message || "Failed to revoke access");
    }
  };

  const updateAccess = async (userId: number, permissionLevel: number) => {
    try {
      const response = await BaseClient.put<any>(
        `${projectEndPoint.access}/update`,
        {
          project_id: params.id,
          user_id: userId,
          permission_level: permissionLevel,
        }
      );

      if (response?.data?.success) {
        toast.success("Access updated successfully");
        loadProjectUsers();
      } else {
        toast.error(response?.data?.message || "Failed to update access");
      }
    } catch (error: any) {
      console.error("Error updating access:", error);
      toast.error(error?.response?.data?.message || "Failed to update access");
    }
  };

  const getPermissionName = (level: number) => {
    return (
      PERMISSION_LEVELS[level as keyof typeof PERMISSION_LEVELS] || "UNKNOWN"
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const isLinkExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
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
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
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
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href={`/projects/${params?.id}/settings`}>
                  Settings
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Access</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="space-y-6 p-6">
        {/* My Access Level */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              My Access Level
            </CardTitle>
            <CardDescription>
              Your current permission level for this project
            </CardDescription>
          </CardHeader>
          <CardContent>
            {myAccess ? (
              <div className="flex items-center gap-4">
                <Badge variant="default" className="text-sm">
                  {getPermissionName(myAccess.permission_level)}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Granted on {formatDate(myAccess.granted_at)}
                </span>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Loading your access level...
              </p>
            )}
          </CardContent>
        </Card>

        {/* Generate Access Link */}
        {hasEditPermission && (
          <Card>
            <CardHeader>
              <CardTitle>Generate Access Link</CardTitle>
              <CardDescription>
                Create a shareable link to grant access to this project
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="permission">Permission Level</Label>
                  <Select
                    value={selectedPermissionLevel}
                    onValueChange={setSelectedPermissionLevel}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select permission" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">READ</SelectItem>
                      <SelectItem value="2">WRITE</SelectItem>
                      <SelectItem value="3">EDIT</SelectItem>
                      <SelectItem value="4">ADD_MEMBER</SelectItem>
                      <SelectItem value="5">DELETE</SelectItem>
                      <SelectItem value="6">MANAGE_ROLES</SelectItem>
                      <SelectItem value="7">OWNER</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={generateAccessLink}
                    disabled={generatingLink}
                    className="w-full"
                  >
                    {generatingLink ? (
                      <>
                        <Loader className="h-4 w-4 mr-2" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Generate Access Link
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="sendEmail"
                    checked={sendEmail}
                    onCheckedChange={(checked) =>
                      setSendEmail(checked as boolean)
                    }
                  />
                  <Label
                    htmlFor="sendEmail"
                    className="flex items-center gap-2"
                  >
                    <Mail className="h-4 w-4" />
                    Send email notification to user
                  </Label>
                </div>

                {sendEmail && (
                  <div>
                    <Label htmlFor="userEmail">User Email</Label>
                    <Input
                      id="userEmail"
                      type="email"
                      placeholder="Enter user email to notify"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Access Links */}
        {hasEditPermission && (
          <Card>
            <CardHeader>
              <CardTitle>Active Access Links</CardTitle>
              <CardDescription>
                Manage generated access links for this project
              </CardDescription>
            </CardHeader>
            <CardContent>
              {accessLinks.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Permission Level</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accessLinks.map((link) => (
                      <TableRow key={link.id}>
                        <TableCell>
                          <Badge variant="outline">
                            {getPermissionName(link.permission_level)}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(link.created_at)}</TableCell>
                        <TableCell>{formatDate(link.expires_at)}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              isLinkExpired(link.expires_at)
                                ? "destructive"
                                : "default"
                            }
                          >
                            {isLinkExpired(link.expires_at)
                              ? "Expired"
                              : "Active"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyAccessLink(link.access_code)}
                              disabled={isLinkExpired(link.expires_at)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => revokeAccessLink(link.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No access links generated yet.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Team Management */}
        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>
              Current project members and their permission levels
            </CardDescription>
          </CardHeader>
          <CardContent>
            {projectUsers.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Permission Level</TableHead>
                    <TableHead>Granted</TableHead>
                    {hasEditPermission && <TableHead>Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projectUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.user.name}</TableCell>
                      <TableCell>{user.user.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getPermissionName(user.permission_level)}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(user.granted_at)}</TableCell>
                      {hasEditPermission && (
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Select
                              value={user.permission_level.toString()}
                              onValueChange={(value) =>
                                updateAccess(user.user_id, parseInt(value))
                              }
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">READ</SelectItem>
                                <SelectItem value="2">WRITE</SelectItem>
                                <SelectItem value="3">EDIT</SelectItem>
                                <SelectItem value="4">ADD_MEMBER</SelectItem>
                                <SelectItem value="5">DELETE</SelectItem>
                                <SelectItem value="6">MANAGE_ROLES</SelectItem>
                                <SelectItem value="7">OWNER</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => revokeAccess(user.user_id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No users have access to this project yet.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Permission Levels Guide */}
        <Card>
          <CardHeader>
            <CardTitle>Permission Levels Guide</CardTitle>
            <CardDescription>
              Understanding what each permission level allows
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium">READ</h4>
                  <p className="text-sm text-muted-foreground">
                    Can view project details, events, and guest lists
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">WRITE</h4>
                  <p className="text-sm text-muted-foreground">
                    Can create and edit events, add guests
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">EDIT</h4>
                  <p className="text-sm text-muted-foreground">
                    Can modify project settings and manage all content
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">ADD_MEMBER</h4>
                  <p className="text-sm text-muted-foreground">
                    Can invite new users to the project
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">DELETE</h4>
                  <p className="text-sm text-muted-foreground">
                    Can delete events and remove content
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">MANAGE_ROLES</h4>
                  <p className="text-sm text-muted-foreground">
                    Can change permission levels of other users
                  </p>
                </div>
                <div className="md:col-span-2">
                  <h4 className="font-medium">OWNER</h4>
                  <p className="text-sm text-muted-foreground">
                    Full control over the project, including deletion and
                    ownership transfer
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
