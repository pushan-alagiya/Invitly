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

import { useFormik, FormikHelpers } from "formik";
import * as Yup from "yup";
import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date_picker";
import { BaseClient } from "@/api/ApiClient";
import { projectEndPoint } from "@/utils/apiEndPoints";
import { toast } from "sonner";
import { projectChange } from "@/store/slices/project";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import EmojiPicker from "emoji-picker-react";
import { Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { NetworkUtils } from "@/api/helper";

interface ProjectFormValues {
  name: string;
  description: string;
  start_date: Date | null;
  end_date: Date | null;
  status: string;
}

interface GetProjectsInterface {
  success: boolean;
  data: ProjectDataInterface;
  code: number;
  message: string;
}

interface ProjectDataInterface {
  id: number;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  cover_image: string;
  status: string;
}

export default function Page() {
  const params = useParams();

  const [selectedEmoji, setSelectedEmoji] = useState<string>(""); // State to store selected emoji
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const dispatch = useDispatch();
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
        const response = await BaseClient.put<any>(
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

        if (response.data.success) {
          toast.success("Project Updated successfully", {});
          dispatch(projectChange());
        }
      } catch (error) {
        console.log("Error:", error);
      } finally {
        helpers.setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    const getProjectDetails = async () => {
      try {
        const response = await BaseClient.get<GetProjectsInterface>(
          `${projectEndPoint.getProjectDetails}/${params?.id}`
        );

        if (response?.data?.success) {
          formik.setValues({
            name: response?.data?.data?.name,
            description: response?.data?.data?.description,
            start_date: NetworkUtils.convertUTCtoLocal(
              new Date(response?.data?.data?.start_date)
            ),
            end_date: NetworkUtils.convertUTCtoLocal(
              new Date(response?.data?.data?.end_date)
            ),
            status: response?.data?.data?.status,
          });

          setSelectedEmoji(response?.data?.data?.cover_image);
        } else {
          toast("Failed to fetch project details");
        }
      } catch (error) {
        console.log("Error:", error);
        toast("Failed to fetch project details");
      }
    };

    getProjectDetails();
  }, [params?.id]);

  const handleEmojiClick = (emojiData: any) => {
    setSelectedEmoji(emojiData.emoji); // Store the selected emoji in state
    setShowEmojiPicker(false); // Optionally close the picker after selection
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
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
                <BreadcrumbPage>General Settings</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 px-8 pt-8">
        <form onSubmit={formik.handleSubmit} className="grid gap-4 py-4">
          <div className="flex flex-col  gap-4 mb-6 relative">
            {/* <EmojiPickerPopover /> */}
            <div
              className="h-32 w-32 bg-accent rounded-full flex justify-center items-center text-gray-500 cursor-pointer relative"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              {(selectedEmoji && (
                <>
                  <div
                    className="top-0 right-0 rounded-full bg-red-600 z-[9] absolute"
                    onClick={() => {
                      setSelectedEmoji("");
                    }}
                  >
                    <Plus size={20} className="rotate-45 text-white" />
                  </div>
                  <div className="text-6xl">{selectedEmoji}</div>
                </>
              )) ||
                "Logo"}
            </div>

            {showEmojiPicker && (
              <div className="z-[9] absolute top-32" ref={emojiPickerRef}>
                <EmojiPicker
                  onEmojiClick={handleEmojiClick}
                  emojiStyle="native"
                />
              </div>
            )}
          </div>
          <div className="grid grid-cols-8 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              className="col-span-3"
            />
            {formik.touched.name && formik.errors.name && (
              <div className="text-red-500 text-sm col-span-4">
                {formik.errors.name}
              </div>
            )}
          </div>
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
            />
            {formik.touched.description && formik.errors.description && (
              <div className="text-red-500 text-sm col-span-4">
                {formik.errors.description}
              </div>
            )}
          </div>

          <div className="grid grid-cols-8 items-center gap-4">
            <Label className="text-right">Status</Label>
            <Select
              value={formik.values.status}
              onValueChange={(value) => formik.setFieldValue("status", value)}
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

          <div className="grid grid-cols-8 items-center gap-4">
            <Label className="text-right">Start Date</Label>
            <DatePicker
              selected={formik.values.start_date || undefined}
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
          <div className="grid grid-cols-8 items-center gap-4">
            <Label className="text-right">End Date</Label>
            <DatePicker
              selected={formik.values.end_date || undefined}
              onChange={(date: Date) => formik.setFieldValue("end_date", date)}
            />
            {formik.touched.end_date && formik.errors.end_date && (
              <div className="text-red-500 text-sm col-span-4">
                {formik.errors.end_date}
              </div>
            )}
          </div>

          <div className="grid grid-cols-8 items-center gap-4">
            <Button type="submit" disabled={formik.isSubmitting}>
              {formik.isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
