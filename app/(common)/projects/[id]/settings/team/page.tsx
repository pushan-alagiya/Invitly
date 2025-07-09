/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BaseClient } from "@/api/ApiClient";
import { projectEndPoint } from "@/utils/apiEndPoints";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Formik, Form } from "formik";
import { GrantLinkAccessDialog } from "@/components/project/create_project_access_link";

interface PermissionInterface {
  id: number;
  permission_name: string;
  description?: string;
}

interface ProjectAccessInterface {
  id: number;
  name: string;
  email: string;
  permissions: PermissionInterface[];
}

interface GetProjectAccessResponse {
  success: boolean;
  data: {
    accesslist: ProjectAccessInterface[];
    projectOwner: number;
  };
  code: number;
  message: string;
}

export default function Page() {
  const params = useParams();
  const [projectAccess, setProjectAccess] = useState<ProjectAccessInterface[]>(
    []
  );
  const [availablePermissions, setAvailablePermissions] = useState<
    PermissionInterface[]
  >([
    { id: 1, permission_name: "Read", description: "Allows reading access" },
    { id: 2, permission_name: "Write", description: "Allows writing access" },
    { id: 3, permission_name: "Edit", description: "Allows editing access" },
    {
      id: 4,
      permission_name: "Add Member",
      description: "Allows adding members",
    },
    { id: 5, permission_name: "Delete", description: "Allows deletion access" },
    {
      id: 6,
      permission_name: "Manage Roles",
      description: "Allows managing roles",
    },
  ]);

  const [projectOwner, setProjectOwner] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [linkPermission, setLinkPermission] = useState<number>(1);
  const [generatedLink, setGeneratedLink] = useState<string>("");
  const [LinkLoading, setLinkLoading] = useState(false);

  useEffect(() => {
    const fetchProjectAccess = async () => {
      try {
        const response = await BaseClient.get<GetProjectAccessResponse>(
          `${projectEndPoint.getProjectAccess}/${params?.id}/access`
        );

        if (response?.data?.success) {
          setProjectAccess(response?.data?.data?.accesslist);
          setProjectOwner(response?.data?.data?.projectOwner);
        } else {
          toast.error("Failed to fetch project access details");
        }
      } catch (error) {
        console.error("Error fetching project access:", error);
        toast.error("Failed to fetch project access details");
      }
    };

    fetchProjectAccess();
  }, [params?.id]);

  const handleAddPermission = async (userId: number, permissionId: number) => {
    try {
      await BaseClient.post(
        `${projectEndPoint.addProjectAccess}/${params?.id}/access`,
        {
          userId: userId,
          permissionId: permissionId,
        }
      );
      setProjectAccess((prev) =>
        prev.map((user) =>
          user.id === userId
            ? {
                ...user,
                permissions: [
                  ...user.permissions,
                  availablePermissions.find((p) => p.id === permissionId)!,
                ],
              }
            : user
        )
      );

      toast.success("Permission added successfully");
    } catch (error) {
      console.error("Error adding permission:", error);
      toast.error("Failed to add permission");
    }
  };

  const handleDeletePermission = async (
    userId: number,
    permissionId: number
  ) => {
    try {
      await BaseClient.put(
        `${projectEndPoint.removeProjectAccess}/${params?.id}/access`,
        {
          userId: userId,
          permissionId: permissionId,
        }
      );
      setProjectAccess((prev) =>
        prev.map((user) =>
          user.id === userId
            ? {
                ...user,
                permissions: user.permissions.filter(
                  (p) => p.id !== permissionId
                ),
              }
            : user
        )
      );

      toast.success("Permission removed successfully");
    } catch (error) {
      console.error("Error removing permission:", error);
      toast.error("Failed to remove permission");
    }
  };

  const generateLink = async (permission: string) => {
    try {
      setLinkLoading(true);
      const response = await BaseClient.post<any>(
        `${projectEndPoint.projectAccessLink}/${params?.id}/access-link`,
        {
          permissionId: Number(permission),
        }
      );

      if (response?.data?.success) {
        return response?.data?.data || "";
      } else {
        toast.error("Failed to generate invite link");
        return "";
      }
    } catch (error) {
      toast.error("Failed to generate invite link");
      return "";
    } finally {
      setLinkLoading(false);
    }
  };

  return (
    <div>
      <header className="flex h-16 items-center justify-between px-4">
        <div className="flex gap-2 items-center">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href={`/projects/${params?.id}`}>
                  Project
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Access Settings</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <GrantLinkAccessDialog
          onGenerate={generateLink}
          setPermission={setLinkPermission}
          linkLoading={LinkLoading}
        />
      </header>
      <div className="flex flex-col gap-4 p-4 w-6/8 pt-4">
        <Formik initialValues={{}} onSubmit={() => {}}>
          <Form className="space-y-6">
            {projectAccess.map(
              (user) =>
                user.permissions.length > 0 && (
                  <div key={user.id} className="flex flex-col gap-4 p-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-lg font-medium">{user.name}</Label>
                      {user.permissions.length ===
                        availablePermissions.length ||
                      user.id === projectOwner ? (
                        <span className="text-sm font-medium text-gray-500">
                          {user.id === projectOwner
                            ? "Project Owner (All actions disabled)"
                            : "All permissions granted"}
                        </span>
                      ) : (
                        <Select
                          onValueChange={(value) =>
                            handleAddPermission(user.id, Number(value))
                          }
                        >
                          <SelectTrigger className="w-48">
                            <SelectValue placeholder="Add Permission" />
                          </SelectTrigger>
                          <SelectContent>
                            {availablePermissions
                              .filter(
                                (perm) =>
                                  !user.permissions.some(
                                    (userPerm) => userPerm.id === perm.id
                                  )
                              )
                              .map((perm) => (
                                <SelectItem
                                  key={perm.id}
                                  value={String(perm.id)}
                                >
                                  {perm.permission_name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
                      {user.permissions.map((permission) => (
                        <div
                          key={permission.id}
                          className="flex items-center justify-between rounded-md border p-2"
                        >
                          <span className="text-sm font-medium">
                            {permission.permission_name}
                          </span>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() =>
                              handleDeletePermission(user.id, permission.id)
                            }
                            disabled={user.id === projectOwner}
                          >
                            Delete
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )
            )}
          </Form>
        </Formik>
      </div>
    </div>
  );
}
