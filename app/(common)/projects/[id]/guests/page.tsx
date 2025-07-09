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
import { guestEndPoint } from "@/utils/apiEndPoints";
import { useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { AddGuestDialog } from "@/components/project/add_guest";
import { GuestTable } from "@/components/project/guest_table";
import { Upload, X, User, Mail, Phone, AlertCircle, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type GuestInterface = {
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
  translated_name: string;
  created_at: string;
  updated_at: string;
};

interface GetGuestsInterface {
  success: boolean;
  data: {
    rows: GuestInterface[];
    count: number;
  };
  message: string;
  code: number;
}

interface VcfContact {
  name: string;
  email?: string;
  phone?: string;
}

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
  { value: "ny", label: "Chichewa" },
  { value: "zh-cn", label: "Chinese Simplified" },
  { value: "zh-tw", label: "Chinese Traditional" },
  { value: "co", label: "Corsican" },
  { value: "hr", label: "Croatian" },
  { value: "cs", label: "Czech" },
  { value: "da", label: "Danish" },
  { value: "nl", label: "Dutch" },
  { value: "eo", label: "Esperanto" },
  { value: "et", label: "Estonian" },
  { value: "tl", label: "Filipino" },
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
  { value: "iw", label: "Hebrew" },
  { value: "hmn", label: "Hmong" },
  { value: "hu", label: "Hungarian" },
  { value: "is", label: "Icelandic" },
  { value: "ig", label: "Igbo" },
  { value: "id", label: "Indonesian" },
  { value: "ga", label: "Irish" },
  { value: "it", label: "Italian" },
  { value: "ja", label: "Japanese" },
  { value: "jw", label: "Javanese" },
  { value: "kn", label: "Kannada" },
  { value: "kk", label: "Kazakh" },
  { value: "km", label: "Khmer" },
  { value: "ko", label: "Korean" },
  { value: "ku", label: "Kurdish (Kurmanji)" },
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
  { value: "ps", label: "Pashto" },
  { value: "fa", label: "Persian" },
  { value: "pl", label: "Polish" },
  { value: "pt", label: "Portuguese" },
  { value: "ma", label: "Punjabi" },
  { value: "ro", label: "Romanian" },
  { value: "ru", label: "Russian" },
  { value: "sm", label: "Samoan" },
  { value: "gd", label: "Scots Gaelic" },
  { value: "sr", label: "Serbian" },
  { value: "st", label: "Sesotho" },
  { value: "sn", label: "Shona" },
  { value: "sd", label: "Sindhi" },
  { value: "si", label: "Sinhala" },
  { value: "sk", label: "Slovak" },
  { value: "sl", label: "Slovenian" },
  { value: "so", label: "Somali" },
  { value: "es", label: "Spanish" },
  { value: "su", label: "Sundanese" },
  { value: "sw", label: "Swahili" },
  { value: "sv", label: "Swedish" },
  { value: "tg", label: "Tajik" },
  { value: "ta", label: "Tamil" },
  { value: "te", label: "Telugu" },
  { value: "th", label: "Thai" },
  { value: "tr", label: "Turkish" },
  { value: "uk", label: "Ukrainian" },
  { value: "ur", label: "Urdu" },
  { value: "uz", label: "Uzbek" },
  { value: "vi", label: "Vietnamese" },
  { value: "cy", label: "Welsh" },
  { value: "xh", label: "Xhosa" },
  { value: "yi", label: "Yiddish" },
  { value: "yo", label: "Yoruba" },
  { value: "zu", label: "Zulu" },
];

export default function GuestsPage() {
  const params = useParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isVcfModalOpen, setIsVcfModalOpen] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [vcfContacts, setVcfContacts] = useState<VcfContact[]>([]);
  const [isReadingFile, setIsReadingFile] = useState<boolean>(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("en");

  const [guests, setGuests] = useState<{
    rows: GuestInterface[];
    count: number;
  }>({
    rows: [],
    count: 0,
  });

  const [guestsLoading, setGuestsLoading] = useState<boolean>(false);

  const fetchGuests = async () => {
    try {
      setGuestsLoading(true);
      const response = await BaseClient.get<GetGuestsInterface>(
        `${guestEndPoint.getProjectGuests}/${params?.id}?language=${selectedLanguage}`
      );

      if (response?.data?.success) {
        setGuests({
          rows: response?.data?.data?.rows,
          count: response?.data?.data?.count,
        });
      } else {
        console.error("Error fetching guests: ", response);
      }
    } catch (error) {
      console.error("Error fetching guests: ", error);
    } finally {
      setGuestsLoading(false);
    }
  };

  useEffect(() => {
    fetchGuests();
  }, [params?.id, selectedLanguage]);

  const handleGuestUpdate = () => {
    fetchGuests();
  };

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const fileExtension = file.name.toLowerCase().split(".").pop();
      if (fileExtension === "vcf" || fileExtension === "csv") {
        setSelectedFile(file);
        if (fileExtension === "vcf") {
          parseVcfFile(file);
        }
      } else {
        alert("Please select a VCF or CSV file");
      }
    }
  };

  const parseVcfFile = async (file: File) => {
    setIsReadingFile(true);
    try {
      const text = await file.text();
      const contacts: VcfContact[] = [];

      // Split by BEGIN:VCARD to get individual contacts
      const vcardBlocks = text
        .split("BEGIN:VCARD")
        .filter((block) => block.trim());

      vcardBlocks.forEach((block) => {
        const contact: VcfContact = { name: "" };

        // Extract name (FN field)
        const fnMatch = block.match(/FN:(.+)/);
        if (fnMatch) {
          contact.name = fnMatch[1].trim();
        }

        // Extract email (EMAIL field)
        const emailMatch = block.match(/EMAIL[^:]*:(.+)/);
        if (emailMatch) {
          contact.email = emailMatch[1].trim();
        }

        // Extract phone (TEL field)
        const telMatch = block.match(/TEL[^:]*:(.+)/);
        if (telMatch) {
          contact.phone = telMatch[1].trim();
        }

        // Only add contact if it has a name
        if (contact.name) {
          contacts.push(contact);
        }
      });

      setVcfContacts(contacts);
    } catch (error) {
      console.error("Error parsing VCF file:", error);
      alert("Error reading VCF file. Please try again.");
    } finally {
      setIsReadingFile(false);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("projectId", params?.id as string);

      // TODO: Replace with actual API endpoint
      const response = await BaseClient.post<any>(
        "/api/guests/import",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response?.data?.success) {
        setIsVcfModalOpen(false);
        setSelectedFile(null);
        setVcfContacts([]);
        handleGuestUpdate(); // Refresh the guests list
      } else {
        alert("Failed to import guests. Please try again.");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Error uploading file. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setVcfContacts([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center justify-between px-4 w-full">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/projects">Projects</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href={`/projects/${params?.id}`}>
                    {params?.id}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Guests</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>
      </header>

      {/* Import Guests Modal */}
      <Dialog open={isVcfModalOpen} onOpenChange={setIsVcfModalOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Import Guests</DialogTitle>
            <DialogDescription>
              Upload a VCF or CSV file to import guests to your project.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="file-upload">Select File</Label>
              <Input
                id="file-upload"
                ref={fileInputRef}
                type="file"
                accept=".vcf,.csv"
                onChange={handleFileSelect}
                className="cursor-pointer"
              />
              <p className="text-xs text-muted-foreground">
                Supported formats: VCF (.vcf), CSV (.csv)
              </p>
            </div>

            {selectedFile && (
              <div className="flex items-center justify-between p-3 rounded-md bg-primary/10">
                <div className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {selectedFile.name}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveFile}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Contacts Table */}
            {isReadingFile && (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  <span className="text-sm text-muted-foreground">
                    Reading contacts...
                  </span>
                </div>
              </div>
            )}

            {vcfContacts.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">
                    Found {vcfContacts.length} contacts
                  </h3>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Badge variant="secondary" className="cursor-help">
                        {vcfContacts.filter((c) => c.email || c.phone).length}{" "}
                        complete
                        <Info className="h-3 w-3 ml-1" />
                      </Badge>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">
                          Import Requirements
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          Only contacts with either an email address or phone
                          number will be imported. Both fields are not required,
                          but at least one is mandatory for successful import.
                        </p>
                        <div className="text-xs text-muted-foreground">
                          <p>
                            • Contacts with email:{" "}
                            {vcfContacts.filter((c) => c.email).length}
                          </p>
                          <p>
                            • Contacts with phone:{" "}
                            {vcfContacts.filter((c) => c.phone).length}
                          </p>
                          <p>
                            • Contacts with both:{" "}
                            {
                              vcfContacts.filter((c) => c.email && c.phone)
                                .length
                            }
                          </p>
                          <p>
                            • Contacts with neither:{" "}
                            {
                              vcfContacts.filter((c) => !c.email && !c.phone)
                                .length
                            }
                          </p>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">#</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {vcfContacts.map((contact, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {index + 1}
                          </TableCell>
                          <TableCell className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            {contact.name}
                          </TableCell>
                          <TableCell>
                            {contact.email ? (
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-green-600" />
                                {contact.email}
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <AlertCircle className="h-4 w-4" />
                                <span className="text-xs">Not available</span>
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            {contact.phone ? (
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-green-600" />
                                {contact.phone}
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <AlertCircle className="h-4 w-4" />
                                <span className="text-xs">Not available</span>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsVcfModalOpen(false);
                  setSelectedFile(null);
                  setVcfContacts([]);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleFileUpload}
                disabled={!selectedFile || isUploading || isReadingFile}
              >
                {isUploading ? "Uploading..." : "Import Guests"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex flex-1 flex-col gap-4 p-4 md:p-6 pt-2">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Project Guests</h2>
            <div className="flex gap-2 items-center">
              {/* Language Selection */}
              <Select
                value={selectedLanguage}
                onValueChange={handleLanguageChange}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Select Language" />
                </SelectTrigger>
                <SelectContent>
                  {languageOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Import Guests from Contact file - VCF */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // open a modal to upload a vcf file
                  setIsVcfModalOpen(true);
                }}
              >
                Import Guests
              </Button>
              <AddGuestDialog
                projectId={Number(params?.id)}
                onGuestAdded={handleGuestUpdate}
              />
            </div>
          </div>

          {guestsLoading ? (
            <div className="flex flex-col items-center justify-center h-40">
              <p className="text-lg font-semibold text-muted">
                Loading guests...
              </p>
            </div>
          ) : guests?.count > 0 ? (
            <GuestTable
              projectId={Number(params?.id)}
              guests={guests.rows}
              onGuestUpdate={handleGuestUpdate}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-40">
              <p className="text-lg font-semibold text-muted">
                No guests found
              </p>
              <p className="text-sm text-muted-foreground">
                Add your first guest using the button above
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
