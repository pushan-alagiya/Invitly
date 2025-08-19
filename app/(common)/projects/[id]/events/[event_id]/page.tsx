/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { BaseClient } from "@/api/ApiClient";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useParams } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Calendar,
  MapPin,
  Users,
  UserPlus,
  UserMinus,
  Search,
  Clock,
  Tag,
  BarChart3,
  TrendingUp,
  Users2,
  CheckCircle,
  XCircle,
  AlertCircle,
  List,
  FileText,
  Edit3,
  Star,
  Plus,
  Trash2,
  X,
  Mail,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  eventEndPoint,
  guestEndPoint,
  templateEndPoint,
} from "@/utils/apiEndPoints";
import { AddEventDialog } from "@/components/project/create_event";
import { EmailSendModal } from "@/components/email/email-send-modal";

// Types
interface EventDetails {
  id: number;
  project_id: number;
  name: string;
  description: string;
  long_description: string;
  start_date: string;
  end_date: string;
  location?: string | null;
  logo: string | null;
  type: string | null;
  status: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Guest {
  id: number;
  project_id: number;
  name: string;
  email: string;
  phone: string;
  family_members: number;
  expected_members: number;
  extra_info: {
    description: string;
  };
  created_at: string;
  updated_at: string;
  translated_name?: string;
}

interface EventGuestResponse {
  id: number;
  event_id: number;
  guest_id: number;
  expected_members: number;
  status: string | null;
  created_at: string;
  guest: {
    id: number;
    position: string | null;
    project_id: number;
    name: string;
    email: string;
    phone: string;
    family_members: number;
    expected_members: number;
    extra_info: {
      description: string;
    };
    created_at: string;
    updated_at: string;
    translated_name?: string;
  };
}

interface Template {
  id: number;
  project_id: number;
  event_id: number;
  name: string;
  template_data: any;
  version: string;
  status: string;
  is_default: boolean;
  created_by: number;
  updated_by: number;
  created_at: string;
  updated_at: string;
  creator?: {
    id: number;
    name: string;
    email: string;
  };
  updater?: {
    id: number;
    name: string;
    email: string;
  };
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  code: number;
}

export default function Page() {
  const params = useParams();
  const [eventDetails, setEventDetails] = useState<EventDetails | null>(null);
  const [projectGuests, setProjectGuests] = useState<Guest[]>([]);
  const [eventGuests, setEventGuests] = useState<EventGuestResponse[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [transferring, setTransferring] = useState<number | null>(null);
  const [movingAllGuests, setMovingAllGuests] = useState(false);
  const [sendingInvitations, setSendingInvitations] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [searchProject, setSearchProject] = useState("");
  const [searchEvent, setSearchEvent] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTemplates, setSearchTemplates] = useState("");
  const [showDeleteTemplateDialog, setShowDeleteTemplateDialog] =
    useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<Template | null>(
    null
  );
  const [deletingTemplate, setDeletingTemplate] = useState(false);
  const [settingDefaultTemplate, setSettingDefaultTemplate] = useState<
    number | null
  >(null);
  const [updatingGuest, setUpdatingGuest] = useState<number | null>(null);
  const [guestDataVersion, setGuestDataVersion] = useState(0);

  // PDF Generation state
  const [showPDFDialog, setShowPDFDialog] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [pdfOptions, setPdfOptions] = useState({
    includePhone: false,
    includeEmail: false,
    customColumns: [] as string[],
    showTranslatedNames: true,
  });
  const [newCustomColumn, setNewCustomColumn] = useState("");

  // Language selection state
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [pdfLanguage, setPdfLanguage] = useState("en"); // Separate language for PDF
  const languageOptions = [
    { value: "en", label: "English" },
    { value: "hi", label: "Hindi" },
    { value: "gu", label: "Gujarati" },
    { value: "af", label: "Afrikaans" },
    { value: "sq", label: "Albanian" },
    { value: "am", label: "Amharic" },
    { value: "ar", label: "Arabic" },
    { value: "hy", label: "Armenian" },
    { value: "az", label: "Azerbaijani" },
    { value: "eu", label: "Basque" },
    { value: "be", label: "Belarusian" },
    { value: "bn", label: "Bengali" },
    { value: "bs", label: "Bosnian" },
    { value: "bg", label: "Bulgarian" },
    { value: "ca", label: "Catalan" },
    { value: "ceb", label: "Cebuano" },
    { value: "zh-CN", label: "Chinese (Simplified)" },
    { value: "zh-TW", label: "Chinese (Traditional)" },
    { value: "co", label: "Corsican" },
    { value: "hr", label: "Croatian" },
    { value: "cs", label: "Czech" },
    { value: "da", label: "Danish" },
    { value: "nl", label: "Dutch" },
    { value: "eo", label: "Esperanto" },
    { value: "et", label: "Estonian" },
    { value: "fi", label: "Finnish" },
    { value: "fr", label: "French" },
    { value: "fy", label: "Frisian" },
    { value: "gl", label: "Galician" },
    { value: "ka", label: "Georgian" },
    { value: "de", label: "German" },
    { value: "el", label: "Greek" },
    { value: "ht", label: "Haitian Creole" },
    { value: "ha", label: "Hausa" },
    { value: "haw", label: "Hawaiian" },
    { value: "he", label: "Hebrew" },
    { value: "hmn", label: "Hmong" },
    { value: "hu", label: "Hungarian" },
    { value: "is", label: "Icelandic" },
    { value: "ig", label: "Igbo" },
    { value: "id", label: "Indonesian" },
    { value: "ga", label: "Irish" },
    { value: "it", label: "Italian" },
    { value: "ja", label: "Japanese" },
    { value: "jv", label: "Javanese" },
    { value: "kn", label: "Kannada" },
    { value: "kk", label: "Kazakh" },
    { value: "km", label: "Khmer" },
    { value: "ko", label: "Korean" },
    { value: "ku", label: "Kurdish" },
    { value: "ky", label: "Kyrgyz" },
    { value: "lo", label: "Lao" },
    { value: "la", label: "Latin" },
    { value: "lv", label: "Latvian" },
    { value: "lt", label: "Lithuanian" },
    { value: "lb", label: "Luxembourgish" },
    { value: "mk", label: "Macedonian" },
    { value: "mg", label: "Malagasy" },
    { value: "ms", label: "Malay" },
    { value: "ml", label: "Malayalam" },
    { value: "mt", label: "Maltese" },
    { value: "mi", label: "Maori" },
    { value: "mr", label: "Marathi" },
    { value: "mn", label: "Mongolian" },
    { value: "my", label: "Myanmar (Burmese)" },
    { value: "ne", label: "Nepali" },
    { value: "no", label: "Norwegian" },
    { value: "ny", label: "Nyanja (Chichewa)" },
    { value: "or", label: "Odia (Oriya)" },
    { value: "om", label: "Oromo" },
    { value: "ps", label: "Pashto" },
    { value: "fa", label: "Persian" },
    { value: "pl", label: "Polish" },
    { value: "pt", label: "Portuguese" },
    { value: "pa", label: "Punjabi" },
    { value: "ro", label: "Romanian" },
    { value: "ru", label: "Russian" },
    { value: "sm", label: "Samoan" },
    { value: "gd", label: "Scots Gaelic" },
    { value: "sr", label: "Serbian" },
    { value: "st", label: "Sesotho" },
    { value: "sn", label: "Shona" },
    { value: "sd", label: "Sindhi" },
    { value: "si", label: "Sinhala (Sinhalese)" },
    { value: "sk", label: "Slovak" },
    { value: "sl", label: "Slovenian" },
    { value: "so", label: "Somali" },
    { value: "es", label: "Spanish" },
    { value: "su", label: "Sundanese" },
    { value: "sw", label: "Swahili" },
    { value: "sv", label: "Swedish" },
    { value: "tg", label: "Tajik" },
    { value: "ta", label: "Tamil" },
    { value: "tt", label: "Tatar" },
    { value: "te", label: "Telugu" },
    { value: "th", label: "Thai" },
    { value: "tr", label: "Turkish" },
    { value: "tk", label: "Turkmen" },
    { value: "uk", label: "Ukrainian" },
    { value: "ur", label: "Urdu" },
    { value: "ug", label: "Uyghur" },
    { value: "uz", label: "Uzbek" },
    { value: "vi", label: "Vietnamese" },
    { value: "cy", label: "Welsh" },
    { value: "xh", label: "Xhosa" },
    { value: "yi", label: "Yiddish" },
    { value: "yo", label: "Yoruba" },
    { value: "zu", label: "Zulu" },
  ];

  // Fetch event details
  const fetchEventDetails = async () => {
    try {
      const response = await BaseClient.get<ApiResponse<EventDetails>>(
        `${eventEndPoint.getEventDetails}/${params.event_id}`
      );
      if (response?.data?.success) {
        setEventDetails(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching event details:", error);
      toast.error("Failed to load event details");
    }
  };

  // Fetch project guests
  const fetchProjectGuests = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (selectedLanguage && selectedLanguage !== "en") {
        queryParams.append("language", selectedLanguage);
      }

      const response = await BaseClient.get<
        ApiResponse<{ rows: Guest[]; count: number }>
      >(
        `${guestEndPoint.getProjectGuests}/${
          params.id
        }?${queryParams.toString()}`
      );
      if (response?.data?.success) {
        setProjectGuests(response.data.data.rows);
      }
    } catch (error) {
      console.error("Error fetching project guests:", error);
      toast.error("Failed to load project guests");
    }
  };

  // Fetch event guests
  const fetchEventGuests = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (selectedLanguage && selectedLanguage !== "en") {
        queryParams.append("language", selectedLanguage);
      }

      console.log("Fetching event guests with language:", selectedLanguage);
      console.log("Query params:", queryParams.toString());

      const response = await BaseClient.get<
        ApiResponse<{
          count: number;
          rows: EventGuestResponse[];
        }>
      >(
        `${eventEndPoint.getEventGuests}/${
          params.event_id
        }/get-event-guests?${queryParams.toString()}`
      );

      console.log("Event guests API response:", response?.data);

      if (response?.data?.success) {
        const eventGuestsData = response.data.data.rows;
        console.log("Event guests data:", eventGuestsData);

        // Log each guest's translation status
        eventGuestsData.forEach((eventGuest, index) => {
          console.log(`Guest ${index + 1}:`, {
            originalName: eventGuest.guest.name,
            translatedName: eventGuest.guest.translated_name,
            hasTranslation: !!eventGuest.guest.translated_name,
          });
        });

        setEventGuests(eventGuestsData);
      }
    } catch (error) {
      console.error("Error fetching event guests:", error);
      toast.error("Failed to load event guests");
    }
  };

  // Fetch templates
  const fetchTemplates = async () => {
    try {
      const response = await BaseClient.get<ApiResponse<Template[]>>(
        `${templateEndPoint.getEventTemplates}/${params.event_id}`
      );
      if (response?.data?.success) {
        setTemplates(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
      toast.error("Failed to load templates");
    }
  };

  // Delete template
  const deleteTemplate = async () => {
    if (!templateToDelete) return;

    setDeletingTemplate(true);
    try {
      const response = await BaseClient.delete<any>(
        `${templateEndPoint.deleteTemplate}/${templateToDelete.id}`
      );
      if (response?.data?.success) {
        toast.success("Template deleted successfully");
        await fetchTemplates();
        setShowDeleteTemplateDialog(false);
        setTemplateToDelete(null);
      }
    } catch (error) {
      console.error("Error deleting template:", error);
      toast.error("Failed to delete template");
    } finally {
      setDeletingTemplate(false);
    }
  };

  // Set template as default
  const setDefaultTemplate = async (templateId: number) => {
    setSettingDefaultTemplate(templateId);
    try {
      const response = await BaseClient.patch<any>(
        `${templateEndPoint.setDefaultTemplate}/${templateId}/set-default`
      );
      if (response?.data?.success) {
        toast.success("Template set as default successfully");
        await fetchTemplates();
      }
    } catch (error) {
      console.error("Error setting default template:", error);
      toast.error("Failed to set default template");
    } finally {
      setSettingDefaultTemplate(null);
    }
  };

  // Add guest to event
  const addGuestToEvent = async (guestId: number) => {
    setTransferring(guestId);
    try {
      const response = await BaseClient.post<any>(
        `${eventEndPoint.addGuestToEvent}/add-event-guest/${guestId}`,
        {
          id: params.event_id,
        }
      );
      if (response?.data?.success) {
        toast.success("Guest added to event successfully");
        // Refresh both guest lists to update analytics
        await Promise.all([fetchEventGuests(), fetchProjectGuests()]);
        setGuestDataVersion((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error adding guest to event:", error);
      toast.error("Failed to add guest to event");
    } finally {
      setTransferring(null);
    }
  };

  // Remove guest from event
  const removeGuestFromEvent = async (guestId: number) => {
    setTransferring(guestId);
    try {
      const response = await BaseClient.post<any>(
        `${eventEndPoint.removeGuestFromEvent}/remove-event-guest/${guestId}`,
        {
          id: params.event_id,
        }
      );
      if (response?.data?.success) {
        toast.success("Guest removed from event successfully");
        // Refresh both guest lists to update analytics
        await Promise.all([fetchEventGuests(), fetchProjectGuests()]);
        setGuestDataVersion((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error removing guest from event:", error);
      toast.error("Failed to remove guest from event");
    } finally {
      setTransferring(null);
    }
  };

  // Move all project guests to event
  const moveAllGuestsToEvent = async () => {
    setMovingAllGuests(true);
    try {
      // Get all available project guests (those not already in the event)
      const availableGuests = projectGuests.filter(
        (guest) =>
          !eventGuests.some((eventGuest) => eventGuest.guest.id === guest.id)
      );

      if (availableGuests.length === 0) {
        toast.info("All project guests are already in the event");
        return;
      }

      // Add all available guests to the event
      const addPromises = availableGuests.map((guest) =>
        BaseClient.post<any>(
          `${eventEndPoint.addGuestToEvent}/add-event-guest/${guest.id}`,
          {
            id: params.event_id,
          }
        )
      );

      const results = await Promise.allSettled(addPromises);

      // Count successful additions
      const successful = results.filter(
        (result) => result.status === "fulfilled" && result.value?.data?.success
      ).length;

      const failed = results.length - successful;

      if (successful > 0) {
        toast.success(
          `Successfully added ${successful} guest${
            successful > 1 ? "s" : ""
          } to the event${failed > 0 ? ` (${failed} failed)` : ""}`
        );
        // Refresh both guest lists to update analytics
        await Promise.all([fetchEventGuests(), fetchProjectGuests()]);
        setGuestDataVersion((prev) => prev + 1);
      } else {
        toast.error("Failed to add any guests to the event");
      }
    } catch (error) {
      console.error("Error moving all guests to event:", error);
      toast.error("Failed to move guests to event");
    } finally {
      setMovingAllGuests(false);
    }
  };

  // Generate PDF report
  const generatePDFReport = async () => {
    setGeneratingPDF(true);
    try {
      const response = (await BaseClient.post(
        `${eventEndPoint.generateGuestReport}/${params.event_id}/generate-guest-report`,
        {
          ...pdfOptions,
          language: pdfLanguage,
        }
      )) as any;

      console.log("PDF generation response:", response?.data);

      if (response?.data?.success) {
        const pdfData = response.data.data;

        // Create download link using the provided download URL
        const downloadUrl = `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
        }/api${pdfData.downloadUrl}`;

        console.log("Download URL:", downloadUrl);

        // Create a temporary link and trigger download
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = pdfData.filename;
        link.target = "_blank";

        // Add authorization header to the link
        const token = localStorage.getItem("token");
        if (token) {
          link.setAttribute("data-token", token);
        }

        // Append to body, click, and cleanup
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success("PDF report generated successfully!");
        setShowPDFDialog(false);

        // Log file info for debugging
        console.log("PDF saved to:", pdfData.filePath);
        console.log("PDF size:", pdfData.size, "bytes");
      } else {
        throw new Error("Failed to generate PDF");
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF report. Please try again.");
    } finally {
      setGeneratingPDF(false);
    }
  };

  // Send invitations to all event guests
  const sendInvitations = async (emailData: {
    subject: string;
    customMessage: string;
    guests: any[];
    event: any;
    templateData?: string;
  }) => {
    setSendingInvitations(true);
    try {
      const response = await BaseClient.post<any>(
        `${eventEndPoint.sendInvitations}/${params.event_id}/send-invitations`,
        emailData
      );

      if (response?.data?.success) {
        const result = response.data.data;
        toast.success(
          `Invitations sent successfully! ${result.successful} delivered, ${result.failed} failed.`
        );

        // Refresh event guests to update status
        await fetchEventGuests();
        setGuestDataVersion((prev) => prev + 1);
        return result;
      } else {
        toast.error("Failed to send invitations");
        throw new Error("Failed to send invitations");
      }
    } catch (error) {
      console.error("Error sending invitations:", error);
      toast.error("Failed to send invitations. Please try again.");
      throw error;
    } finally {
      setSendingInvitations(false);
    }
  };

  // Add custom column
  const addCustomColumn = () => {
    if (newCustomColumn.trim()) {
      setPdfOptions((prev) => ({
        ...prev,
        customColumns: [...prev.customColumns, newCustomColumn.trim()],
      }));
      setNewCustomColumn("");
    }
  };

  // Remove custom column
  const removeCustomColumn = (index: number) => {
    setPdfOptions((prev) => ({
      ...prev,
      customColumns: prev.customColumns.filter((_, i) => i !== index),
    }));
  };

  // Initialize data
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      await Promise.all([
        fetchEventDetails(),
        fetchProjectGuests(),
        fetchEventGuests(),
        fetchTemplates(),
      ]);
      setLoading(false);
    };

    if (params.event_id) {
      initializeData();
    }
  }, [params.event_id]);

  // Refetch project guests when language changes
  useEffect(() => {
    if (params.event_id) {
      fetchProjectGuests();
      fetchEventGuests();
    }
  }, [selectedLanguage]);

  // Filtered templates
  const filteredTemplates = templates.filter((template) =>
    template.name.toLowerCase().includes(searchTemplates.toLowerCase())
  );

  // Filtered guests
  const filteredProjectGuests = projectGuests.filter((guest) => {
    // Check if guest is already added to the event
    const isAlreadyInEvent = eventGuests.some(
      (eventGuest) => eventGuest.guest.id === guest.id
    );

    // Only show guests who are not already in the event
    if (isAlreadyInEvent) return false;

    // Apply search filter
    return (
      (guest.name?.toLowerCase() || "").includes(searchProject.toLowerCase()) ||
      (guest.email?.toLowerCase() || "").includes(searchProject.toLowerCase())
    );
  });

  const filteredEventGuests = eventGuests.filter((eventGuest) => {
    const matchesSearch =
      (eventGuest.guest.name?.toLowerCase() || "").includes(
        searchEvent.toLowerCase()
      ) ||
      (eventGuest.guest.email?.toLowerCase() || "").includes(
        searchEvent.toLowerCase()
      );
    // Note: RSVP status is not in the current API response, so we'll show all as pending for now
    const matchesFilter = filterStatus === "all" || filterStatus === "pending";
    return matchesSearch && matchesFilter;
  });

  // Analytics - Move these calculations to useMemo for better performance and accuracy
  const analytics = useMemo(() => {
    const totalGuests = eventGuests.length;
    const confirmedGuests = eventGuests.filter(
      (eventGuest) => eventGuest.status === "CONFIRMED"
    ).length;
    const pendingGuests = eventGuests.filter(
      (eventGuest) => eventGuest.status === "PENDING"
    ).length;
    const declinedGuests = eventGuests.filter(
      (eventGuest) => eventGuest.status === "DECLINED"
    ).length;
    const totalExpectedMembers = eventGuests.reduce(
      (sum, eventGuest) => sum + eventGuest.expected_members,
      0
    );

    return {
      totalGuests,
      confirmedGuests,
      pendingGuests,
      declinedGuests,
      totalExpectedMembers,
    };
  }, [eventGuests, guestDataVersion]);

  // Destructure analytics for easier use
  const {
    totalGuests,
    confirmedGuests,
    pendingGuests,
    declinedGuests,
    totalExpectedMembers,
  } = analytics;

  if (loading) {
    return (
      <div>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Skeleton className="h-4 w-48" />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <Skeleton className="h-auto w-auto rounded-xl" />
            <div className="bg-muted/50 aspect-video rounded-xl" />
            <div className="bg-muted/50 aspect-video rounded-xl" />
          </div>
          <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center justify-between px-4 w-full">
          <div className="flex items-center gap-2">
            {/* <SidebarTrigger className="-ml-1" /> */}
            <div className="ml-4"></div>
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href={`/projects/${params?.id}`}>
                    {params?.id}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>
                    {eventDetails?.name || "Event Details"}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="flex items-center gap-2">
            <AddEventDialog
              isEditing={true}
              id={Number(params.event_id)}
              projectId={Number(params.id)}
              onUpdate={fetchEventDetails}
            />
          </div>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6">
        {/* Event Information */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Event Details Card */}
          <Card className="md:col-span-2 ">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  {eventDetails?.logo ? (
                    <Avatar className="h-16 w-16 ">
                      <AvatarImage
                        src={eventDetails.logo}
                        alt={eventDetails.name}
                      />
                      <AvatarFallback className="text-2xl bg-primary/5">
                        {eventDetails?.logo ||
                          eventDetails.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                      <Calendar className="h-8 w-8 text-primary" />
                    </div>
                  )}
                  <div>
                    <CardTitle className="text-2xl">
                      {eventDetails?.name}
                    </CardTitle>
                    <CardDescription className="text-base">
                      {eventDetails?.description || "No description available"}
                    </CardDescription>
                  </div>
                </div>
                <Badge
                  className="bg-primary/10"
                  variant={
                    eventDetails?.status === "active" ? "default" : "secondary"
                  }
                >
                  {eventDetails?.status || "Unknown"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Event Date</p>
                    <p className="text-sm text-muted-foreground">
                      {eventDetails?.start_date &&
                        new Date(eventDetails.start_date).toLocaleDateString()}
                      {eventDetails?.end_date &&
                        eventDetails.end_date !== eventDetails.start_date &&
                        ` - ${new Date(
                          eventDetails.end_date
                        ).toLocaleDateString()}`}
                    </p>
                  </div>
                </div>
                {eventDetails?.location && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Location</p>
                      <p className="text-sm text-muted-foreground">
                        {eventDetails.location}
                      </p>
                    </div>
                  </div>
                )}

                {eventDetails?.type && (
                  <div className="flex items-center gap-3">
                    <Tag className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Type</p>
                      <p className="text-sm text-muted-foreground">
                        {eventDetails.type}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Created</p>
                    <p className="text-sm text-muted-foreground">
                      {eventDetails?.createdAt &&
                        new Date(eventDetails.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {eventDetails?.long_description && (
                  <div className="flex items-center gap-3 col-span-2">
                    <List className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Event Details</p>
                      <p className="text-sm text-muted-foreground">
                        {typeof eventDetails.long_description === "string"
                          ? eventDetails.long_description
                          : typeof eventDetails.long_description === "object"
                          ? JSON.stringify(
                              eventDetails.long_description,
                              null,
                              2
                            )
                          : String(eventDetails.long_description)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Analytics Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Event Analytics
                {(transferring !== null || updatingGuest !== null) && (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-2">
                    <Users2 className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">Total Guests</span>
                  </div>
                  <span className="text-lg font-bold text-blue-600">
                    {totalGuests}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Confirmed</span>
                  </div>
                  <span className="text-lg font-bold text-green-600">
                    {confirmedGuests}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium">Pending</span>
                  </div>
                  <span className="text-lg font-bold text-yellow-600">
                    {pendingGuests}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium">Declined</span>
                  </div>
                  <span className="text-lg font-bold text-red-600">
                    {declinedGuests}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium">
                      Expected Members
                    </span>
                  </div>
                  <span className="text-lg font-bold text-purple-600">
                    {totalExpectedMembers}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Templates Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                <CardTitle>Templates</CardTitle>
              </div>
              <Button
                onClick={() => {
                  window.location.href = `/projects/${params.id}/events/${params.event_id}/template-creator`;
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Template
              </Button>
            </div>
            <CardDescription>
              Manage your invitation templates for this event.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search templates..."
                  value={searchTemplates}
                  onChange={(e) => setSearchTemplates(e.target.value)}
                  className="pl-10"
                />
              </div>

              {filteredTemplates.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredTemplates.map((template) => (
                    <Card key={template.id} className="relative group ">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <CardTitle className="text-base">
                                {template.name}
                              </CardTitle>
                              <CardDescription className="text-xs">
                                Version {template.version}
                              </CardDescription>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {template.is_default && (
                              <Badge variant="default" className="text-xs">
                                <Star className="h-3 w-3 mr-1" />
                                Default
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-xs">
                              {template.status}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-3">
                          <div className="text-xs text-muted-foreground">
                            <div>
                              Pages:{" "}
                              {template.template_data?.pages?.length || 0}
                            </div>
                            <div>
                              Objects:{" "}
                              {template.template_data?.pages?.reduce(
                                (total: number, page: any) =>
                                  total + (page.objects?.length || 0),
                                0
                              ) || 0}
                            </div>
                            <div>
                              Created:{" "}
                              {new Date(
                                template.created_at
                              ).toLocaleDateString()}
                            </div>
                            {template.creator && (
                              <div>By: {template.creator.name}</div>
                            )}
                          </div>

                          <div className="flex items-center gap-2 pt-2">
                            <Button
                              size="sm"
                              className="flex-1"
                              onClick={() => {
                                // Pass template ID in URL and redirect to editor
                                window.location.href = `/projects/${params.id}/events/${params.event_id}/template-creator?templateId=${template.id}`;
                              }}
                            >
                              <Edit3 className="h-3 w-3 mr-1" />
                              Edit
                            </Button>

                            {!template.is_default && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setDefaultTemplate(template.id)}
                                disabled={
                                  settingDefaultTemplate === template.id
                                }
                                title="Set as default template"
                              >
                                {settingDefaultTemplate === template.id ? (
                                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                ) : (
                                  <Star className="h-3 w-3" />
                                )}
                              </Button>
                            )}

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setTemplateToDelete(template);
                                setShowDeleteTemplateDialog(true);
                              }}
                              className="text-failure hover:text-failure/80 hover:bg-failure/10"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-medium mb-2">No templates yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first invitation template to get started.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Guest Transfer Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <CardTitle>Guest Management</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setShowEmailModal(true)}
                  disabled={eventGuests.length === 0}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {sendingInvitations ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      Send Invitations
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => setShowPDFDialog(true)}
                  disabled={eventGuests.length === 0}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Generate PDF Report
                </Button>
              </div>
            </div>
            <CardDescription>
              Transfer guests between project and event. Drag and drop or use
              the transfer buttons.
            </CardDescription>
            {/* Language Selector */}
            <div className="flex items-center gap-2 mt-4">
              <label className="text-sm font-medium text-muted-foreground">
                Language:
              </label>
              <Select
                value={selectedLanguage}
                onValueChange={setSelectedLanguage}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languageOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Project Guests */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Project Guests</h3>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {filteredProjectGuests.length} available
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={moveAllGuestsToEvent}
                      disabled={
                        movingAllGuests || filteredProjectGuests.length === 0
                      }
                      className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                    >
                      {movingAllGuests ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent mr-2" />
                          Moving...
                        </>
                      ) : (
                        <>
                          <Users className="h-4 w-4 mr-2" />
                          Move All Guests
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search project guests..."
                    value={searchProject}
                    onChange={(e) => setSearchProject(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="h-96 overflow-y-auto rounded-lg border">
                  {filteredProjectGuests.length > 0 ? (
                    <div className="space-y-2 p-4">
                      {filteredProjectGuests.map((guest) => (
                        <div
                          key={guest.id}
                          className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData(
                              "text/plain",
                              guest.id.toString()
                            );
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src="" alt={guest.name} />
                              <AvatarFallback className="text-xs">
                                {(guest.name || "U")
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">
                                {guest?.translated_name
                                  ? guest?.translated_name
                                  : guest.name || "Unnamed Guest"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {guest.email || "No email"}
                              </p>
                              {/* Show original name if translated */}
                              {guest?.translated_name && (
                                <p className="text-xs text-muted-foreground">
                                  {guest.name}
                                </p>
                              )}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => addGuestToEvent(guest.id)}
                            disabled={transferring === guest.id}
                            className="ml-2"
                          >
                            {transferring === guest.id ? (
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                            ) : (
                              <UserPlus className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      No project guests available
                    </div>
                  )}
                </div>
              </div>

              {/* Event Guests */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Event Guests</h3>
                  <div className="flex items-center gap-2">
                    <Select
                      value={filterStatus}
                      onValueChange={setFilterStatus}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="declined">Declined</SelectItem>
                      </SelectContent>
                    </Select>
                    <Badge variant="outline">
                      {filteredEventGuests.length} guests
                    </Badge>
                  </div>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search event guests..."
                    value={searchEvent}
                    onChange={(e) => setSearchEvent(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div
                  className="h-96 overflow-y-auto rounded-lg border border-dashed border-muted-foreground/25"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const guestId = parseInt(
                      e.dataTransfer.getData("text/plain")
                    );
                    addGuestToEvent(guestId);
                  }}
                >
                  {filteredEventGuests.length > 0 ? (
                    <div className="space-y-2 p-4">
                      {filteredEventGuests.map((eventGuest) => (
                        <div
                          key={eventGuest.id}
                          className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src="" alt={eventGuest.guest.name} />
                              <AvatarFallback className="text-xs">
                                {(eventGuest.guest.name || "U")
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-sm">
                                  {eventGuest.guest?.translated_name
                                    ? eventGuest.guest?.translated_name
                                    : eventGuest.guest.name || "Unnamed Guest"}
                                </p>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {eventGuest.guest.email || "No email"}
                              </p>
                              {/* Show original name if translated */}
                              {eventGuest.guest?.translated_name && (
                                <p className="text-xs text-muted-foreground">
                                  {eventGuest.guest.name}
                                </p>
                              )}
                              {eventGuest.guest.expected_members > 1 && (
                                <p className="text-xs text-muted-foreground">
                                  +{eventGuest.guest.expected_members - 1}{" "}
                                  family members
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Select
                                value={eventGuest.status || "PENDING"}
                                onValueChange={async (newStatus) => {
                                  setUpdatingGuest(eventGuest.guest_id);
                                  try {
                                    const response = await BaseClient.post<any>(
                                      `${eventEndPoint.updateEventExpectedMembers}/${eventDetails?.id}`,
                                      {
                                        guestId: eventGuest.guest_id,
                                        status: newStatus,
                                      }
                                    );
                                    if (response?.data?.success) {
                                      toast.success(
                                        "Guest status updated successfully"
                                      );
                                      // Refresh event guests to update analytics
                                      await fetchEventGuests();
                                      setGuestDataVersion((prev) => prev + 1);
                                    }
                                  } catch (error) {
                                    console.error(
                                      "Error updating guest status:",
                                      error
                                    );
                                    toast.error(
                                      "Failed to update guest status"
                                    );
                                  } finally {
                                    setUpdatingGuest(null);
                                  }
                                }}
                                disabled={updatingGuest === eventGuest.guest_id}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="PENDING">
                                    Pending
                                  </SelectItem>
                                  <SelectItem value="CONFIRMED">
                                    Confirmed
                                  </SelectItem>
                                  <SelectItem value="DECLINED">
                                    Declined
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="flex items-center h-8 gap-2 shadow-full rounded-md ">
                              <Input
                                type="number"
                                min={1}
                                max={eventGuest.guest.family_members + 1}
                                defaultValue={eventGuest.guest.expected_members}
                                onChange={(e) => {
                                  const updatedValue = parseInt(
                                    e.target.value,
                                    10
                                  );
                                  if (
                                    !isNaN(updatedValue) &&
                                    updatedValue > 0
                                  ) {
                                    eventGuest.guest.expected_members =
                                      updatedValue;
                                  }
                                }}
                                className="w-20 border-0 shadow-unset focus:ring-0"
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 border-0 shadow-unset focus:ring-0"
                                onClick={async () => {
                                  setUpdatingGuest(eventGuest.guest_id);
                                  try {
                                    const response = await BaseClient.post<any>(
                                      `${eventEndPoint.updateEventExpectedMembers}/${eventDetails?.id}`,
                                      {
                                        guestId: eventGuest.guest_id,
                                        expectedMembers:
                                          eventGuest.guest.expected_members,
                                      }
                                    );
                                    if (response?.data?.success) {
                                      toast.success(
                                        "Expected members updated successfully"
                                      );
                                      // Refresh event guests to update analytics
                                      await fetchEventGuests();
                                      setGuestDataVersion((prev) => prev + 1);
                                    }
                                  } catch (error) {
                                    console.error(
                                      "Error updating expected members:",
                                      error
                                    );
                                    toast.error(
                                      "Failed to update expected members"
                                    );
                                  } finally {
                                    setUpdatingGuest(null);
                                  }
                                }}
                                disabled={updatingGuest === eventGuest.guest_id}
                              >
                                {updatingGuest === eventGuest.guest_id ? (
                                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                ) : (
                                  "Edit"
                                )}
                              </Button>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                removeGuestFromEvent(eventGuest.guest_id)
                              }
                              disabled={transferring === eventGuest.guest_id}
                            >
                              {transferring === eventGuest.guest_id ? (
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                              ) : (
                                <UserMinus className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <Users className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
                        <p>No event guests yet</p>
                        <p className="text-sm">
                          Drag guests from the left or use the transfer buttons
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Template Dialog */}
      <Dialog
        open={showDeleteTemplateDialog}
        onOpenChange={setShowDeleteTemplateDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Template</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {templateToDelete?.name}? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteTemplateDialog(false);
                setTemplateToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={deleteTemplate}
              disabled={deletingTemplate}
            >
              {deletingTemplate ? "Deleting..." : "Delete Template"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PDF Generation Dialog */}
      <Dialog open={showPDFDialog} onOpenChange={setShowPDFDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Generate PDF Report</DialogTitle>
            <DialogDescription>
              Customize your guest report PDF with the options below.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Include Contact Information */}
            <div className="space-y-2">
              <h4 className="font-medium">Contact Information</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="includePhone"
                    checked={pdfOptions.includePhone}
                    onChange={(e) =>
                      setPdfOptions((prev) => ({
                        ...prev,
                        includePhone: e.target.checked,
                      }))
                    }
                    className="rounded"
                  />
                  <label htmlFor="includePhone" className="text-sm">
                    Include Phone Numbers
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="includeEmail"
                    checked={pdfOptions.includeEmail}
                    onChange={(e) =>
                      setPdfOptions((prev) => ({
                        ...prev,
                        includeEmail: e.target.checked,
                      }))
                    }
                    className="rounded"
                  />
                  <label htmlFor="includeEmail" className="text-sm">
                    Include Email Addresses
                  </label>
                </div>
              </div>
            </div>

            {/* Translation Options */}
            <div className="space-y-2">
              <h4 className="font-medium">Translation</h4>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="showTranslatedNames"
                  checked={pdfOptions.showTranslatedNames}
                  onChange={(e) =>
                    setPdfOptions((prev) => ({
                      ...prev,
                      showTranslatedNames: e.target.checked,
                    }))
                  }
                  className="rounded"
                />
                <label htmlFor="showTranslatedNames" className="text-sm">
                  Show Translated Names
                </label>
              </div>
              {pdfOptions.showTranslatedNames && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Translation Language:
                  </label>
                  <Select value={pdfLanguage} onValueChange={setPdfLanguage}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languageOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Current language:{" "}
                {languageOptions.find((l) => l.value === pdfLanguage)?.label}
              </p>
            </div>

            {/* Custom Columns */}
            <div className="space-y-2">
              <h4 className="font-medium">Custom Columns</h4>
              <div className="flex space-x-2">
                <Input
                  placeholder="Add custom column name..."
                  value={newCustomColumn}
                  onChange={(e) => setNewCustomColumn(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addCustomColumn()}
                  className="flex-1"
                />
                <Button onClick={addCustomColumn} size="sm">
                  Add
                </Button>
              </div>

              {pdfOptions.customColumns.length > 0 && (
                <div className="space-y-1">
                  {pdfOptions.customColumns.map((column, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-muted p-2 rounded"
                    >
                      <span className="text-sm">{column}</span>
                      <Button
                        onClick={() => removeCustomColumn(index)}
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPDFDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={generatePDFReport}
              disabled={generatingPDF}
              className="bg-green-600 hover:bg-green-700"
            >
              {generatingPDF ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Generate PDF
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Email Send Modal */}
      <EmailSendModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        onSend={sendInvitations}
        guests={eventGuests.map((eg) => ({
          id: eg.guest.id,
          name: eg.guest.name,
          email: eg.guest.email,
          phone: eg.guest.phone,
          family_members: eg.guest.family_members,
        }))}
        event={
          eventDetails
            ? {
                id: eventDetails.id,
                name: eventDetails.name,
                description: eventDetails.description,
                start_date: eventDetails.start_date,
                end_date: eventDetails.end_date,
                location: eventDetails.location || undefined,
                type: eventDetails.type || undefined,
              }
            : {
                id: 0,
                name: "",
                description: "",
                start_date: "",
                end_date: "",
                location: "",
                type: "",
              }
        }
        templateData={templates.find((t) => t.is_default)?.template_data}
      />
    </div>
  );
}
