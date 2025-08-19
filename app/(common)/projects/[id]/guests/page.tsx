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
import { guestEndPoint } from "@/utils/apiEndPoints";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AddGuestDialog } from "@/components/project/add_guest";
import { GuestTable } from "@/components/project/guest_table";
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

export default function GuestsPage() {
  const params = useParams();
  const [guests, setGuests] = useState<GetGuestsInterface | null>(null);
  const [guestsLoading, setGuestsLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState("en");

  const fetchGuests = async () => {
    try {
      setGuestsLoading(true);
      const response = await BaseClient.get<GetGuestsInterface>(
        `${guestEndPoint.getProjectGuests}/${params?.id}`,
        {
          params: {
            language: selectedLanguage,
          },
        }
      );

      if (response?.data?.success) {
        // Handle both cases: when guests exist and when the list is empty
        const guestData = response.data.data;
        if (guestData && guestData.rows) {
          setGuests(response.data);
        } else {
          // Set empty guests structure when no guests exist
          setGuests({
            success: true,
            data: { rows: [], count: 0 },
            message: "No guests found",
            code: 200,
          });
        }
      } else {
        console.error("Error fetching guests:", response);
        // Set empty guests structure when API returns success: false
        setGuests({
          success: false,
          data: { rows: [], count: 0 },
          message: "Failed to fetch guests",
          code: 400,
        });
      }
    } catch (error) {
      console.error("Error fetching guests:", error);
      // Set empty guests structure on error
      setGuests({
        success: false,
        data: { rows: [], count: 0 },
        message: "Error fetching guests",
        code: 500,
      });
    } finally {
      setGuestsLoading(false);
    }
  };

  useEffect(() => {
    if (params?.id) {
      fetchGuests();
    }
  }, [params?.id, selectedLanguage]);

  const handleGuestUpdate = () => {
    fetchGuests();
  };

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
  };

  return (
    <div>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center justify-between px-4 w-full">
          <div className="flex items-center gap-2">
            <div className="ml-4"></div>{" "}
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

              {/* Add Guest Dialog - Now includes both manual entry and import functionality */}
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
          ) : guests?.data?.count && guests.data.count > 0 ? (
            <GuestTable
              projectId={Number(params?.id)}
              guests={guests.data.rows}
              onGuestUpdate={handleGuestUpdate}
              language={selectedLanguage}
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
