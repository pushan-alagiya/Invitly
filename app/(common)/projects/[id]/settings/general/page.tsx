/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "sonner";
import { Settings, Plus } from "lucide-react";
import { useFormik, FormikHelpers } from "formik";
import * as Yup from "yup";
import EmojiPicker from "emoji-picker-react";

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
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date_picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader } from "@/components/ui/loader";

import { BaseClient } from "@/api/ApiClient";
import { projectEndPoint } from "@/utils/apiEndPoints";
import { projectChange } from "@/store/slices/project";

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

interface ProjectFormValues {
  name: string;
  description: string;
  start_date: Date | undefined;
  end_date: Date | undefined;
  status: string;
}

export default function GeneralSettingsPage() {
  const params = useParams();
  const dispatch = useDispatch();
  const { userDetails } = useSelector(
    (state: { auth: AuthState }) => state.auth
  );

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasEditPermission, setHasEditPermission] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState<string>("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  const formik = useFormik<ProjectFormValues>({
    initialValues: {
      name: "",
      description: "",
      start_date: new Date(),
      end_date: new Date(),
      status: "planning",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Project name is required"),
      description: Yup.string().required("Description is required"),
      start_date: Yup.date().required("Start date is required"),
      end_date: Yup.date()
        .required("End date is required")
        .min(Yup.ref("start_date"), "End date must be after start date"),
    }),
    onSubmit: async (
      values: ProjectFormValues,
      helpers: FormikHelpers<ProjectFormValues>
    ) => {
      try {
        const response = await BaseClient.put(
          `${projectEndPoint?.updateProject}/${params?.id}`,
          {
            name: values.name,
            description: values.description,
            start_date: values.start_date,
            end_date: values.end_date,
            cover_image: selectedEmoji || "",
            status: values.status,
          }
        );

        if ((response?.data as any)?.success) {
          toast.success("Project Updated successfully", {});
          dispatch(projectChange());
          loadProjectData(); // Reload data
        }
      } catch (error) {
        console.log("Error:", error);
        toast.error("Failed to update project");
      } finally {
        helpers.setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    loadProjectData();
  }, [params.id]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const loadProjectData = async () => {
    try {
      setLoading(true);

      const response = await BaseClient.get<any>(
        `${projectEndPoint.getProjectDetails}/${params.id}`
      );

      if (response?.data?.success) {
        const projectData = response?.data?.data;
        setProject(projectData);
        setSelectedEmoji(projectData.cover_image || "");

        // Update formik values
        formik.setValues({
          name: projectData.name || "",
          description: projectData.description || "",
          start_date: projectData.start_date
            ? new Date(projectData.start_date)
            : undefined,
          end_date: projectData.end_date
            ? new Date(projectData.end_date)
            : undefined,
          status: projectData.status || "planning",
        });

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
        <div className="flex items-center gap-2 ml-2 px-4">
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
                <BreadcrumbPage>General</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="space-y-6 p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              General Settings
            </CardTitle>
            <CardDescription>
              Update your project details and basic information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={formik.handleSubmit} className="space-y-6">
              {/* Project Logo/Emoji */}
              <div className="grid grid-cols-8 items-center gap-4">
                <Label className="text-right">Project Logo</Label>
                <div className="col-span-3 flex items-center gap-2">
                  <div className="relative">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="h-10 w-10 p-0"
                      disabled={!hasEditPermission}
                    >
                      {selectedEmoji ? (
                        <span className="text-2xl">{selectedEmoji}</span>
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                    </Button>
                    {showEmojiPicker && (
                      <div ref={emojiPickerRef} className="absolute z-50 mt-2">
                        <EmojiPicker
                          onEmojiClick={(emojiObject) => {
                            setSelectedEmoji(emojiObject.emoji);
                            setShowEmojiPicker(false);
                          }}
                        />
                      </div>
                    )}
                  </div>
                  {selectedEmoji && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedEmoji("")}
                      disabled={!hasEditPermission}
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </div>

              {/* Project Name */}
              <div className="grid grid-cols-8 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Project Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  className="col-span-3"
                  disabled={!hasEditPermission}
                />
                {formik.touched.name && formik.errors.name && (
                  <div className="text-red-500 text-sm col-span-4">
                    {formik.errors.name}
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="grid grid-cols-8 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  className="col-span-3"
                  disabled={!hasEditPermission}
                />
                {formik.touched.description && formik.errors.description && (
                  <div className="text-red-500 text-sm col-span-4">
                    {formik.errors.description}
                  </div>
                )}
              </div>

              {/* Start Date */}
              <div className="grid grid-cols-8 items-center gap-4">
                <Label className="text-right">Start Date</Label>
                <DatePicker
                  selected={formik.values.start_date}
                  onChange={(date: Date) =>
                    formik.setFieldValue("start_date", date)
                  }
                />
                {formik.touched.start_date && formik.errors.start_date && (
                  <div className="text-red-500 text-sm col-span-4">
                    {formik.errors.start_date}
                  </div>
                )}
              </div>

              {/* End Date */}
              <div className="grid grid-cols-8 items-center gap-4">
                <Label className="text-right">End Date</Label>
                <DatePicker
                  selected={formik.values.end_date}
                  onChange={(date: Date) =>
                    formik.setFieldValue("end_date", date)
                  }
                />
                {formik.touched.end_date && formik.errors.end_date && (
                  <div className="text-red-500 text-sm col-span-4">
                    {formik.errors.end_date}
                  </div>
                )}
              </div>

              {/* Status */}
              <div className="grid grid-cols-8 items-center gap-4">
                <Label className="text-right">Status</Label>
                <Select
                  value={formik.values.status}
                  onValueChange={(value) =>
                    formik.setFieldValue("status", value)
                  }
                  disabled={!hasEditPermission}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select status">
                      {formik.values.status === "planning"
                        ? "Planning"
                        : "Completed"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planning">Planning</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Submit Button */}
              {hasEditPermission && (
                <div className="flex justify-end">
                  <Button type="submit" disabled={formik.isSubmitting}>
                    {formik.isSubmitting ? (
                      <>
                        <Loader className="h-4 w-4 mr-2" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
