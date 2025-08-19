/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef } from "react";
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
import { toast } from "sonner";
import { BaseClient } from "@/api/ApiClient";
import { guestEndPoint } from "@/utils/apiEndPoints";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import {
  Upload,
  Users,
  X,
  Info,
  User,
  Mail,
  Phone,
  AlertCircle,
  Edit3,
  Check,
  X as XIcon,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface AddGuestDialogProps {
  projectId: number;
  onGuestAdded: () => void;
}

interface Contact {
  name: string;
  email?: string;
  phone?: string;
  isEditing?: boolean;
  tempEmail?: string;
  tempPhone?: string;
}

const validationSchema = Yup.object({
  name: Yup.string().required("Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  phone: Yup.string().required("Phone is required"),
  family_members: Yup.number()
    .min(0, "Family members count must be 0 or greater")
    .required("Family members count is required"),
  expected_members: Yup.number()
    .min(0, "Expected members count must be 0 or greater")
    .required("Expected members count is required"),
  extra_info: Yup.string(),
});

export function AddGuestDialog({
  projectId,
  onGuestAdded,
}: AddGuestDialogProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isReadingFile, setIsReadingFile] = useState(false);
  const [activeTab, setActiveTab] = useState("manual");
  const [vcfContacts, setVcfContacts] = useState<Contact[]>([]);
  const [importResults, setImportResults] = useState<{
    success: boolean;
    importedGuests: any[];
    errors: string[];
    message: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initialValues = {
    name: "",
    email: "",
    phone: "",
    family_members: 0,
    expected_members: 0,
    extra_info: "",
  };

  const handleSubmit = async (
    values: typeof initialValues,
    { setSubmitting }: any
  ) => {
    try {
      const response = await BaseClient.post<any>(
        `${guestEndPoint.createGuest}/${projectId}`,
        {
          name: values.name,
          email: values.email,
          phone: values.phone,
          family_members: values.family_members,
          expected_members: values.expected_members,
          extra_info: {
            description: values.extra_info,
          },
        }
      );

      if (response?.data?.success) {
        toast.success("Guest added successfully");
        setIsDialogOpen(false);
        onGuestAdded();
      } else {
        toast.error("Failed to add guest");
      }
    } catch (error) {
      console.error("Error adding guest:", error);
      toast.error("Failed to add guest");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const fileExtension = file.name.toLowerCase().split(".").pop();
      if (fileExtension === "vcf" || fileExtension === "csv") {
        setSelectedFile(file);
        setIsReadingFile(true);

        try {
          // Read file content
          const text = await file.text();
          console.log("File content preview:", text.substring(0, 500));

          const contacts = parseFileContent(text, fileExtension);
          console.log("Parsed contacts:", contacts);

          setVcfContacts(contacts);
        } catch (error) {
          console.error("Error reading file:", error);
          toast.error("Failed to read file");
        } finally {
          setIsReadingFile(false);
        }
      } else {
        toast.error("Please select a VCF or CSV file");
        event.target.value = "";
      }
    }
  };

  const parseFileContent = (content: string, fileType: string): Contact[] => {
    if (fileType === "vcf") {
      return parseVcfContent(content);
    } else if (fileType === "csv") {
      return parseCsvContent(content);
    }
    return [];
  };

  const parseVcfContent = (content: string): Contact[] => {
    const contacts: Contact[] = [];
    const vcfEntries = content.split("BEGIN:VCARD");

    vcfEntries.forEach((entry) => {
      if (!entry.trim()) return;

      const lines = entry.split("\n");
      const contact: Contact = { name: "" };

      lines.forEach((line) => {
        const trimmedLine = line.trim();

        // Extract name (FN field)
        if (trimmedLine.startsWith("FN:")) {
          contact.name = trimmedLine.substring(3).trim();
        }
        // Extract email (EMAIL field) - handle different formats
        else if (
          trimmedLine.startsWith("EMAIL") ||
          trimmedLine.startsWith("email")
        ) {
          const emailMatch = trimmedLine.match(/EMAIL[^:]*:(.+)/i);
          if (emailMatch) {
            const email = emailMatch[1].trim();
            // Basic email validation
            if (email.includes("@") && email.includes(".")) {
              contact.email = email;
            }
          }
        }
        // Extract phone (TEL field) - handle different formats
        else if (
          trimmedLine.startsWith("TEL") ||
          trimmedLine.startsWith("tel")
        ) {
          const telMatch = trimmedLine.match(/TEL[^:]*:(.+)/i);
          if (telMatch) {
            const phone = telMatch[1].trim();
            // Basic phone validation - should contain digits
            if (/\d/.test(phone)) {
              contact.phone = phone;
            }
          }
        }
        // Handle multi-line values (folded lines)
        else if (
          trimmedLine.startsWith(" ") &&
          (contact.email || contact.phone)
        ) {
          // This is a continuation line
          const value = trimmedLine.trim();
          if (!contact.email && value.includes("@") && value.includes(".")) {
            contact.email = value;
          } else if (!contact.phone && /\d/.test(value)) {
            contact.phone = value;
          }
        }
      });

      // Add all contacts with names, even if they don't have email or phone
      if (contact.name) {
        contacts.push(contact);
      }
    });

    return contacts;
  };

  const parseCsvContent = (content: string): Contact[] => {
    const contacts: Contact[] = [];
    const lines = content.split("\n").filter((line) => line.trim());

    if (lines.length < 2) return contacts;

    // Try to detect header row and column positions
    const headerRow = lines[0].toLowerCase();
    const nameIndex = headerRow.includes("name")
      ? headerRow.indexOf("name")
      : 0;
    const emailIndex = headerRow.includes("email")
      ? headerRow.indexOf("email")
      : 1;
    const phoneIndex =
      headerRow.includes("phone") || headerRow.includes("tel")
        ? headerRow.includes("phone")
          ? headerRow.indexOf("phone")
          : headerRow.indexOf("tel")
        : 2;

    // Skip header row and process data rows
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Handle CSV with potential quotes and commas
      const columns = parseCsvLine(line);

      if (columns.length >= Math.max(nameIndex, emailIndex, phoneIndex) + 1) {
        const name = columns[nameIndex]?.trim() || "";
        const email = columns[emailIndex]?.trim() || "";
        const phone = columns[phoneIndex]?.trim() || "";

        // Validate email and phone
        const isValidEmail =
          email && email.includes("@") && email.includes(".");
        const isValidPhone = phone && /\d/.test(phone);

        // Add all contacts with names, even if they don't have valid email or phone
        if (name) {
          contacts.push({
            name,
            email: isValidEmail ? email : undefined,
            phone: isValidPhone ? phone : undefined,
          });
        }
      }
    }

    return contacts;
  };

  const parseCsvLine = (line: string): string[] => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }

    result.push(current.trim());
    return result;
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setVcfContacts([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleEditContact = (index: number) => {
    setVcfContacts((prev) =>
      prev.map((contact, i) =>
        i === index
          ? {
              ...contact,
              isEditing: true,
              tempEmail: contact.email || "",
              tempPhone: contact.phone || "",
            }
          : contact
      )
    );
  };

  const handleSaveContact = (index: number) => {
    setVcfContacts((prev) =>
      prev.map((contact, i) =>
        i === index
          ? {
              ...contact,
              isEditing: false,
              email: contact.tempEmail || contact.email,
              phone: contact.tempPhone || contact.phone,
              tempEmail: undefined,
              tempPhone: undefined,
            }
          : contact
      )
    );
  };

  const handleCancelEdit = (index: number) => {
    setVcfContacts((prev) =>
      prev.map((contact, i) =>
        i === index
          ? {
              ...contact,
              isEditing: false,
              tempEmail: undefined,
              tempPhone: undefined,
            }
          : contact
      )
    );
  };

  const handleUpdateContactField = (
    index: number,
    field: "tempEmail" | "tempPhone",
    value: string
  ) => {
    setVcfContacts((prev) =>
      prev.map((contact, i) =>
        i === index ? { ...contact, [field]: value } : contact
      )
    );
  };

  const handleImportGuests = async () => {
    if (!selectedFile) {
      toast.error("Please select a file first");
      return;
    }

    // Filter contacts that have valid email or phone for import
    const validContacts = vcfContacts.filter(
      (contact) => contact.email || contact.phone
    );

    if (validContacts.length === 0) {
      toast.error(
        "No valid contacts found. Each contact must have either an email or phone number."
      );
      return;
    }

    setIsImporting(true);
    try {
      // Send JSON data instead of file
      const contactsData = validContacts.map((contact) => ({
        name: contact.name,
        email: contact.email || "",
        phone: contact.phone || "",
        family_members: 0,
        expected_members: 0,
        extra_info: {
          description: "",
        },
      }));

      const response = await BaseClient.post<any>(
        `${guestEndPoint.importGuests}/${projectId}`,
        {
          contacts: contactsData,
        }
      );

      if (response?.data?.success) {
        const { data: importedGuests, errors, message } = response.data;

        // Store import results for detailed view
        setImportResults({
          success: true,
          importedGuests: importedGuests || [],
          errors: errors || [],
          message: message,
        });

        // Show success message with details
        if (errors && errors.length > 0) {
          // Some guests imported with errors
          toast.success(
            `${message} (${importedGuests?.length || 0} imported, ${
              errors.length
            } failed)`,
            {
              duration: 5000,
            }
          );
        } else {
          // All guests imported successfully
          toast.success(
            `Successfully imported ${
              importedGuests?.length || validContacts.length
            } guests`
          );
        }

        setIsDialogOpen(false);
        setSelectedFile(null);
        setVcfContacts([]);
        onGuestAdded();
      } else {
        toast.error("Failed to import guests");
      }
    } catch (error: any) {
      // Handle different types of errors
      if (error.response?.data?.errors) {
        // Backend returned specific errors
        const errors = error.response.data.errors;
        const errorMessage = Array.isArray(errors)
          ? errors.slice(0, 3).join("\n") +
            (errors.length > 3
              ? `\n... and ${errors.length - 3} more errors`
              : "")
          : errors;

        toast.error(`Import failed:\n${errorMessage}`, {
          duration: 8000,
        });
      } else {
        // Generic error
        const errorMessage =
          error.response?.data?.message || "Failed to import guests";
        toast.error(errorMessage);
      }
    } finally {
      setIsImporting(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setVcfContacts([]);
    setActiveTab("manual");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <>
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            resetForm();
          }
        }}
      >
        <DialogTrigger asChild>
          <Button variant="outline">Add Guest</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Guest</DialogTitle>
            <DialogDescription>
              Add guests manually or import from VCF/CSV file.
            </DialogDescription>
          </DialogHeader>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="manual" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Manual Entry
              </TabsTrigger>
              <TabsTrigger value="import" className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Import File
              </TabsTrigger>
            </TabsList>

            <TabsContent value="manual" className="space-y-4">
              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({
                  values,
                  errors,
                  touched,
                  handleChange,
                  handleBlur,
                  isSubmitting,
                }) => (
                  <Form className="space-y-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">
                        Name
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        value={values.name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className="col-span-3"
                      />
                      {touched.name && errors.name && (
                        <div className="text-red-500 text-sm col-span-4">
                          {errors.name}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="email" className="text-right">
                        Email
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={values.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className="col-span-3"
                      />
                      {touched.email && errors.email && (
                        <div className="text-red-500 text-sm col-span-4">
                          {errors.email}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="phone" className="text-right">
                        Phone
                      </Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={values.phone}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className="col-span-3"
                      />
                      {touched.phone && errors.phone && (
                        <div className="text-red-500 text-sm col-span-4">
                          {errors.phone}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="family_members" className="text-left ">
                        Family Members
                      </Label>
                      <Input
                        id="family_members"
                        name="family_members"
                        type="number"
                        value={values.family_members}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className="col-span-3"
                      />
                      {touched.family_members && errors.family_members && (
                        <div className="text-red-500 text-sm col-span-4">
                          {errors.family_members}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="expected_members" className="text-left">
                        Expected Members
                      </Label>
                      <Input
                        id="expected_members"
                        name="expected_members"
                        type="number"
                        value={values.expected_members}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className="col-span-3"
                      />
                      {touched.expected_members && errors.expected_members && (
                        <div className="text-red-500 text-sm col-span-4">
                          {errors.expected_members}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="extra_info" className="text-right">
                        Extra Info
                      </Label>
                      <Textarea
                        id="extra_info"
                        name="extra_info"
                        value={values.extra_info}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className="col-span-3"
                        placeholder="Any additional information about the guest..."
                      />
                      {touched.extra_info && errors.extra_info && (
                        <div className="text-red-500 text-sm col-span-4">
                          {errors.extra_info}
                        </div>
                      )}
                    </div>

                    <DialogFooter>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Adding..." : "Add Guest"}
                      </Button>
                    </DialogFooter>
                  </Form>
                )}
              </Formik>
            </TabsContent>

            <TabsContent value="import" className="space-y-6">
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
                          importable
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
                            number will be imported. Both fields are not
                            required, but at least one is mandatory for
                            successful import.
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
                          <TableHead className="w-[100px]">Status</TableHead>
                          <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {vcfContacts.map((contact, index) => {
                          const hasValidContact =
                            contact.email || contact.phone;
                          return (
                            <TableRow
                              key={index}
                              className={!hasValidContact ? "bg-red-50" : ""}
                            >
                              <TableCell className="font-medium">
                                {index + 1}
                              </TableCell>
                              <TableCell className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                {contact.name}
                              </TableCell>
                              <TableCell>
                                {contact.isEditing ? (
                                  <Input
                                    value={contact.tempEmail || ""}
                                    onChange={(e) =>
                                      handleUpdateContactField(
                                        index,
                                        "tempEmail",
                                        e.target.value
                                      )
                                    }
                                    placeholder="Enter email"
                                    className="h-8 text-xs"
                                  />
                                ) : contact.email ? (
                                  <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-green-600" />
                                    {contact.email}
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2 text-muted-foreground">
                                    <AlertCircle className="h-4 w-4" />
                                    <span className="text-xs">Missing</span>
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>
                                {contact.isEditing ? (
                                  <Input
                                    value={contact.tempPhone || ""}
                                    onChange={(e) =>
                                      handleUpdateContactField(
                                        index,
                                        "tempPhone",
                                        e.target.value
                                      )
                                    }
                                    placeholder="Enter phone"
                                    className="h-8 text-xs"
                                  />
                                ) : contact.phone ? (
                                  <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-green-600" />
                                    {contact.phone}
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2 text-muted-foreground">
                                    <AlertCircle className="h-4 w-4" />
                                    <span className="text-xs">Missing</span>
                                  </div>
                                )}
                              </TableCell>
                              <TableCell className="text-center">
                                {hasValidContact ? (
                                  <CheckCircle className="h-5 w-5 text-green-600 mx-auto" />
                                ) : (
                                  <XCircle className="h-5 w-5 text-red-600 mx-auto" />
                                )}
                              </TableCell>
                              <TableCell>
                                {contact.isEditing ? (
                                  <div className="flex items-center gap-1">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleSaveContact(index)}
                                      className="h-6 w-6 p-0"
                                    >
                                      <Check className="h-3 w-3 text-green-600" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleCancelEdit(index)}
                                      className="h-6 w-6 p-0"
                                    >
                                      <XIcon className="h-3 w-3 text-red-600" />
                                    </Button>
                                  </div>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleEditContact(index)}
                                    className="h-6 w-6 p-0"
                                  >
                                    <Edit3 className="h-3 w-3 text-blue-600" />
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setSelectedFile(null);
                    setVcfContacts([]);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleImportGuests}
                  disabled={
                    !selectedFile ||
                    isImporting ||
                    isReadingFile ||
                    vcfContacts.filter((c) => c.email || c.phone).length === 0
                  }
                >
                  {isImporting
                    ? "Uploading..."
                    : `Import ${
                        vcfContacts.filter((c) => c.email || c.phone).length
                      } Guests`}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Import Results Modal */}
      <Dialog
        open={!!importResults}
        onOpenChange={() => setImportResults(null)}
      >
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Import Results</DialogTitle>
            <DialogDescription>{importResults?.message}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Summary */}
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-800">
                  Successfully Imported:{" "}
                  {importResults?.importedGuests.length || 0} guests
                </span>
              </div>
              {importResults?.errors && importResults.errors.length > 0 && (
                <div className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-600" />
                  <span className="font-medium text-red-800">
                    Failed: {importResults.errors.length} contacts
                  </span>
                </div>
              )}
            </div>

            {/* Imported Guests */}
            {importResults?.importedGuests &&
              importResults.importedGuests.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-medium text-sm">Imported Guests:</h3>
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
                        {importResults.importedGuests.map((guest, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">
                              {index + 1}
                            </TableCell>
                            <TableCell className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              {guest.name}
                            </TableCell>
                            <TableCell>
                              {guest.email ? (
                                <div className="flex items-center gap-2">
                                  <Mail className="h-4 w-4 text-green-600" />
                                  {guest.email}
                                </div>
                              ) : (
                                <span className="text-muted-foreground text-xs">
                                  -
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              {guest.phone ? (
                                <div className="flex items-center gap-2">
                                  <Phone className="h-4 w-4 text-green-600" />
                                  {guest.phone}
                                </div>
                              ) : (
                                <span className="text-muted-foreground text-xs">
                                  -
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

            {/* Errors */}
            {importResults?.errors && importResults.errors.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium text-sm text-red-700">
                  Failed to Import:
                </h3>
                <div className="border border-red-200 rounded-md p-3 bg-red-50">
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {importResults.errors.map((error, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-2 text-sm"
                      >
                        <XCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <span className="text-red-700">{error}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button onClick={() => setImportResults(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
