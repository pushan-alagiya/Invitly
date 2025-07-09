/* eslint-disable @typescript-eslint/no-explicit-any */
import { useFormik, FormikHelpers } from "formik";
import * as Yup from "yup";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date_picker";
import { BaseClient } from "@/api/ApiClient";
import { projectEndPoint } from "@/utils/apiEndPoints";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { projectChange } from "@/store/slices/project";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import EmojiPicker from "emoji-picker-react";
import { Pencil, Plus } from "lucide-react";
import { NetworkUtils } from "@/api/helper";

interface ProjectFormValues {
  name: string;
  description: string;
  start_date: Date | null;
  end_date: Date | null;
  status: string;
}

interface createProjectProps {
  isEditing?: boolean;
  id?: number;
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

export function AddProjectDialog({
  isEditing = false,
  id,
}: createProjectProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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
        if (!isEditing) {
          const response = await BaseClient.post<any>(
            `${projectEndPoint?.createProject}`,
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
            toast.success("Project added successfully", {});
            dispatch(projectChange());
            setIsDialogOpen(false); // Close the dialog
          }
        } else {
          const response = await BaseClient.put<any>(
            `${projectEndPoint?.updateProject}/${id}`,
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
            setIsDialogOpen(false); // Close the dialog
          }
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
          `${projectEndPoint.getProjectDetails}/${id}`
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
    if (id !== undefined && isDialogOpen) {
      getProjectDetails();
    }
  }, [id, isDialogOpen]);

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
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        {isEditing ? (
          <div
            onClick={() => setIsDialogOpen(true)}
            className="rounded-md bg-black px-3 flex justify-center items-center"
          >
            <Pencil size={16} className="text-white" />
          </div>
        ) : (
          <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
            Create Project
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] pb-2">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Project" : "Add New Project"}
          </DialogTitle>
          <DialogDescription>
            Enter project details below. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={formik.handleSubmit} className="grid gap-4 py-4">
          <div className="flex flex-col items-center gap-4 mb-6 relative">
            {/* <EmojiPickerPopover /> */}
            <div
              className="h-20 w-20 bg-accent rounded-full flex justify-center items-center text-gray-500 cursor-pointer relative"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              {(selectedEmoji && (
                <>
                  <div
                    className="top-0 right-0 rounded-full bg-red-600 z-[999] absolute"
                    onClick={() => {
                      setSelectedEmoji("");
                    }}
                  >
                    <Plus size={16} className="rotate-45 text-white" />
                  </div>
                  <div className="text-4xl">{selectedEmoji}</div>
                </>
              )) ||
                "Logo"}
            </div>

            {showEmojiPicker && (
              <div className="z-[999] absolute top-20" ref={emojiPickerRef}>
                <EmojiPicker
                  onEmojiClick={handleEmojiClick}
                  emojiStyle="native"
                />
              </div>
            )}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
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
          <div className="grid grid-cols-4 items-center gap-4">
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

          <div className="grid grid-cols-4 items-center gap-4">
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

          <div className="grid grid-cols-4 items-center gap-4">
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
          <div className="grid grid-cols-4 items-center gap-4">
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
          <DialogFooter>
            <Button type="submit" disabled={formik.isSubmitting}>
              {formik.isSubmitting
                ? "Saving..."
                : isEditing
                ? "Save Changes"
                : "Save Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
