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
import { eventEndPoint } from "@/utils/apiEndPoints";
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
import EmojiPicker, { EmojiStyle } from "emoji-picker-react";
import { Pencil, Plus } from "lucide-react";
import { NetworkUtils } from "@/api/helper";

interface EventFormValues {
  name: string;
  description: string;
  long_description: string;
  start_date: Date | null;
  end_date: Date | null;
  location: string;
  type: string;
  status: string;
}

interface createEventProps {
  isEditing?: boolean;
  id?: number;
  projectId: number;
  onUpdate?: () => void;
}

interface GetEventInterface {
  success: boolean;
  data: EventDataInterface;
  code: number;
  message: string;
}

interface EventDataInterface {
  id: number;
  project_id: number;
  name: string;
  description: string;
  long_description: string;
  start_date: string;
  end_date: string;
  location: string;
  logo: string;
  type: string;
  status: string;
}

export function AddEventDialog({
  isEditing = false,
  id,
  projectId,
  onUpdate,
}: createEventProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState<string>("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const dispatch = useDispatch();
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  const formik = useFormik<EventFormValues>({
    initialValues: {
      name: "",
      description: "",
      long_description: "",
      start_date: new Date(),
      end_date: new Date(),
      location: "",
      type: "meeting",
      status: "planned",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Event name is required"),
      description: Yup.string(),
      long_description: Yup.string().optional(),
      start_date: Yup.date().required("Start date is required"),
      end_date: Yup.date()
        .required("End date is required")
        .min(Yup.ref("start_date"), "End date must be after start date"),
      location: Yup.string(),
      type: Yup.string(),
      status: Yup.string(),
    }),
    onSubmit: async (
      values: EventFormValues,
      helpers: FormikHelpers<EventFormValues>
    ) => {
      try {
        if (!isEditing) {
          const response = await BaseClient.post<any>(
            `${eventEndPoint?.createEvent}/${projectId}`,
            {
              name: values.name,
              description: values.description,
              long_description: values.long_description || "",
              start_date: values.start_date,
              end_date: values.end_date,
              location: values.location,
              logo: selectedEmoji || "",
              type: values.type,
              status: values.status,
            }
          );

          if (response.data.success) {
            toast.success("Event added successfully", {});
            dispatch(projectChange());
            setIsDialogOpen(false);
          }
        } else {
          const response = await BaseClient.put<any>(
            `${eventEndPoint?.updateEvent}/${id}`,
            {
              project_id: projectId,
              name: values.name,
              description: values.description,
              long_description: values.long_description || "",
              start_date: values.start_date,
              end_date: values.end_date,
              location: values.location,
              logo: selectedEmoji || "",
              type: values.type,
              status: values.status,
            }
          );

          if (response.data.success) {
            toast.success("Event Updated successfully", {});
            dispatch(projectChange());
            setIsDialogOpen(false);
            if (onUpdate) {
              onUpdate();
            }
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
    const getEventDetails = async () => {
      try {
        const response = await BaseClient.get<GetEventInterface>(
          `${eventEndPoint.getEventDetails}/${id}`
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
            location: response?.data?.data?.location,
            type: response?.data?.data?.type,
            status: response?.data?.data?.status,
            long_description: response?.data?.data?.long_description || "",
          });

          setSelectedEmoji(response?.data?.data?.logo);
        } else {
          toast.error("Failed to fetch event details");
        }
      } catch (error) {
        console.log("Error:", error);
        toast.error("Failed to fetch event details");
      }
    };
    if (id !== undefined && isDialogOpen) {
      getEventDetails();
    }
  }, [id, isDialogOpen]);

  const handleEmojiClick = (emojiData: any) => {
    setSelectedEmoji(emojiData.emoji);
    setShowEmojiPicker(false);
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
            className="rounded-md bg-transparent border-2 border-primary px-3 h-8 flex justify-center items-center"
          >
            <Pencil size={16} className="text-primary" />
          </div>
        ) : (
          <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
            Create Event
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-semibold">
            {isEditing ? "Edit Event" : "Add New Event"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {isEditing
              ? "Update the event details below. Click save when you're done."
              : "Enter event details below. Click save when you're done."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={formik.handleSubmit} className="space-y-6">
          {/* Logo/Emoji Section */}
          <div className="flex flex-col items-center gap-4 pb-4 border-b">
            <div className="relative">
              <div
                className="h-24 w-24 bg-accent rounded-full flex justify-center items-center text-gray-500 cursor-pointer hover:bg-accent/80 transition-colors"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                {selectedEmoji ? (
                  <>
                    <div
                      className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-red-600 flex items-center justify-center cursor-pointer hover:bg-red-700 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEmoji("");
                      }}
                    >
                      <Plus size={12} className="rotate-45 text-white" />
                    </div>
                    <div className="text-5xl">{selectedEmoji}</div>
                  </>
                ) : (
                  <div className="text-center">
                    <div className="text-2xl mb-1">📅</div>
                    <div className="text-xs text-muted-foreground">
                      Add Logo
                    </div>
                  </div>
                )}
              </div>
            </div>

            {showEmojiPicker && (
              <div className="absolute z-[999] top-32" ref={emojiPickerRef}>
                <EmojiPicker
                  onEmojiClick={handleEmojiClick}
                  emojiStyle={EmojiStyle.NATIVE}
                />
              </div>
            )}
          </div>

          {/* Basic Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground">
              Basic Information
            </h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Event Name *
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  placeholder="Enter event name"
                  className="w-full"
                />
                {formik.touched.name && formik.errors.name && (
                  <div className="text-red-500 text-sm">
                    {formik.errors.name}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  Short Description
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  placeholder="Brief description of the event"
                  className="w-full min-h-[80px]"
                />
                {formik.touched.description && formik.errors.description && (
                  <div className="text-red-500 text-sm">
                    {formik.errors.description}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="long_description"
                  className="text-sm font-medium"
                >
                  Detailed Description
                </Label>
                <Textarea
                  id="long_description"
                  name="long_description"
                  value={formik.values.long_description || ""}
                  onChange={formik.handleChange}
                  placeholder="Detailed information about the event"
                  className="w-full min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="text-sm font-medium">
                  Location
                </Label>
                <Input
                  id="location"
                  name="location"
                  value={formik.values.location}
                  onChange={formik.handleChange}
                  placeholder="Event location or venue"
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Event Details Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground">
              Event Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Event Type</Label>
                <Select
                  value={formik.values.type}
                  onValueChange={(value) => formik.setFieldValue("type", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="celebration">Celebration</SelectItem>
                    <SelectItem value="ceremony">Ceremony</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Status</Label>
                <Select
                  value={formik.values.status}
                  onValueChange={(value) =>
                    formik.setFieldValue("status", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planned">Planned</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Date & Time Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground">Date & Time</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Start Date *</Label>
                <DatePicker
                  selected={formik.values.start_date || undefined}
                  onChange={(date: Date) =>
                    formik.setFieldValue("start_date", date)
                  }
                />
                {formik.touched.start_date && formik.errors.start_date && (
                  <div className="text-red-500 text-sm">
                    {formik.errors.start_date}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">End Date *</Label>
                <DatePicker
                  selected={formik.values.end_date || undefined}
                  onChange={(date: Date) =>
                    formik.setFieldValue("end_date", date)
                  }
                />
                {formik.touched.end_date && formik.errors.end_date && (
                  <div className="text-red-500 text-sm">
                    {formik.errors.end_date}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <DialogFooter className="pt-6 border-t">
            <div className="flex gap-3 w-full">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={formik.isSubmitting}
                className="flex-1"
              >
                {formik.isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Saving...
                  </div>
                ) : isEditing ? (
                  "Save Changes"
                ) : (
                  "Create Event"
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
