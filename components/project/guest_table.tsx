/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { BaseClient } from "@/api/ApiClient";
import { guestEndPoint } from "@/utils/apiEndPoints";
import { GuestInterface } from "@/app/(common)/projects/[id]/page";
import {
  Pencil,
  Save,
  X,
  Trash2,
  GripVertical,
  Mail,
  Phone,
  Users,
  Info,
  Search,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Loader2,
} from "lucide-react";

interface GuestTableProps {
  projectId: number;
  guests: GuestInterface[];
  onGuestUpdate: () => void;
  language?: string;
}

interface ColumnConfig {
  id: string;
  label: string;
  key: keyof GuestInterface | "actions" | "sr_no";
  width?: string;
  sortable?: boolean;
}

export function GuestTable({
  projectId,
  guests,
  onGuestUpdate,
  language,
}: GuestTableProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingData, setEditingData] = useState<{
    name: string;
    email: string;
    phone: string;
    family_members: number;
    expected_members: number;
    extra_info: string;
  }>({
    name: "",
    email: "",
    phone: "",
    family_members: 0,
    expected_members: 0,
    extra_info: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  // New guest creation state
  const [newGuest, setNewGuest] = useState<{
    name: string;
    email: string;
    phone: string;
    family_members: number;
    expected_members: number;
    extra_info: string;
  }>({
    name: "",
    email: "",
    phone: "",
    family_members: 0,
    expected_members: 0,
    extra_info: "",
  });
  const [isCreating, setIsCreating] = useState(false);

  // Search and sort state
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("position");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("ASC");
  const [filteredGuests, setFilteredGuests] = useState<GuestInterface[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Drag and drop state
  const [draggedColumn, setDraggedColumn] = useState<string | null>(null);
  const [columnOrder, setColumnOrder] = useState<string[]>([
    "sr_no",
    "name",
    "email",
    "phone",
    "family_members",
    "expected_members",
    "extra_info",
    "actions",
  ]);

  // Row drag and drop state
  const [draggedRow, setDraggedRow] = useState<number | null>(null);
  const [guestOrder, setGuestOrder] = useState<number[]>([]);

  const columns: ColumnConfig[] = [
    { id: "sr_no", label: "Sr. No", key: "sr_no", width: "w-16" },
    { id: "name", label: "Name", key: "name", sortable: true },
    { id: "email", label: "Email", key: "email", sortable: true },
    { id: "phone", label: "Phone", key: "phone", sortable: true },
    {
      id: "family_members",
      label: "Family Members",
      key: "family_members",
      sortable: true,
    },
    {
      id: "expected_members",
      label: "Expected Members",
      key: "expected_members",
      sortable: true,
    },
    {
      id: "extra_info",
      label: "Extra Info",
      key: "extra_info",
      sortable: true,
    },
    { id: "actions", label: "Actions", key: "actions", width: "w-32" },
  ];

  // Initialize guest order when guests change
  useEffect(() => {
    if (guests && Array.isArray(guests)) {
      // Only update if there's no active search or language
      if (!debouncedSearchTerm && !language) {
        setFilteredGuests(guests);
        setGuestOrder(guests.map((_, index) => index));
        setCurrentPage(1);
        setHasMore(guests.length >= 20);
      }
    } else {
      setFilteredGuests([]);
      setGuestOrder([]);
      setCurrentPage(1);
      setHasMore(false);
    }
  }, [guests, debouncedSearchTerm, language]);

  // Reset pagination when language changes
  useEffect(() => {
    if (language) {
      setCurrentPage(1);
    }
  }, [language]);

  // Debounce search term
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Handle search and sort
  useEffect(() => {
    const performSearchAndSort = async () => {
      setIsSearching(true);
      try {
        const params = new URLSearchParams();
        if (debouncedSearchTerm) params.append("search", debouncedSearchTerm);
        if (sortBy) params.append("sortBy", sortBy);
        if (sortOrder) params.append("sortOrder", sortOrder);
        if (language) params.append("language", language);
        params.append("page", currentPage.toString());
        params.append("limit", "20");

        const response = await BaseClient.get(
          `${guestEndPoint.getProjectGuests}/${projectId}?${params.toString()}`
        );

        if ((response?.data as any)?.success) {
          const guestData = (response?.data as any)?.data;
          if (guestData && guestData.rows) {
            if (currentPage === 1) {
              // First page - replace data
              setFilteredGuests(guestData.rows);
              setGuestOrder(
                guestData.rows.map((_: any, index: number) => index)
              );
            } else {
              // Subsequent pages - append data
              setFilteredGuests((prev) => [...prev, ...guestData.rows]);
              setGuestOrder((prev) => [
                ...prev,
                ...guestData.rows.map(
                  (_: any, index: number) => prev.length + index
                ),
              ]);
            }

            // Update pagination info
            if (guestData.pagination) {
              setHasMore(guestData.pagination.hasNextPage);
            } else {
              setHasMore(guestData.rows.length === 20);
            }
          } else {
            if (currentPage === 1) {
              setFilteredGuests([]);
              setGuestOrder([]);
            }
            setHasMore(false);
          }
        }
      } catch (error) {
        console.error("Error searching/sorting guests:", error);
        // Fallback to client-side filtering if API fails
        if (guests && Array.isArray(guests)) {
          let filtered = [...guests];

          // Client-side search
          if (debouncedSearchTerm) {
            filtered = filtered.filter(
              (guest) =>
                guest.name
                  .toLowerCase()
                  .includes(debouncedSearchTerm.toLowerCase()) ||
                guest.email
                  .toLowerCase()
                  .includes(debouncedSearchTerm.toLowerCase()) ||
                guest.phone
                  .toLowerCase()
                  .includes(debouncedSearchTerm.toLowerCase()) ||
                (guest.extra_info?.description || "")
                  .toLowerCase()
                  .includes(debouncedSearchTerm.toLowerCase())
            );
          }

          // Client-side sorting
          filtered.sort((a, b) => {
            let aVal, bVal;

            switch (sortBy) {
              case "name":
                aVal = a.name.toLowerCase();
                bVal = b.name.toLowerCase();
                break;
              case "email":
                aVal = a.email.toLowerCase();
                bVal = b.email.toLowerCase();
                break;
              case "phone":
                aVal = a.phone.toLowerCase();
                bVal = b.phone.toLowerCase();
                break;
              case "family_members":
                aVal = a.family_members;
                bVal = b.family_members;
                break;
              case "expected_members":
                aVal = a.expected_members;
                bVal = b.expected_members;
                break;
              case "extra_info":
                aVal = (a.extra_info?.description || "").toLowerCase();
                bVal = (b.extra_info?.description || "").toLowerCase();
                break;
              default:
                aVal = a.family_members;
                bVal = b.family_members;
            }

            if (sortOrder === "ASC") {
              return aVal > bVal ? 1 : -1;
            } else {
              return aVal < bVal ? 1 : -1;
            }
          });

          if (currentPage === 1) {
            setFilteredGuests(filtered);
            setGuestOrder(filtered.map((_, index) => index));
          } else {
            setFilteredGuests((prev) => [...prev, ...filtered]);
            setGuestOrder((prev) => [
              ...prev,
              ...filtered.map((_, index) => prev.length + index),
            ]);
          }
          setHasMore(false);
        }
      } finally {
        setIsSearching(false);
        setIsLoadingMore(false);
      }
    };

    performSearchAndSort();
  }, [
    debouncedSearchTerm,
    sortBy,
    sortOrder,
    projectId,
    currentPage,
    language,
  ]);

  const handleShowMore = () => {
    setIsLoadingMore(true);
    setCurrentPage((prev) => prev + 1);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setCurrentPage(1);
    // Reset to show all guests in current language
    if (guests && Array.isArray(guests)) {
      setFilteredGuests(guests);
      setGuestOrder(guests.map((_, index) => index));
      setHasMore(guests.length >= 20);
    }
  };

  const handleSort = (columnKey: string) => {
    const column = columns.find((col) => col.id === columnKey);
    if (!column?.sortable) return;

    if (sortBy === columnKey) {
      setSortOrder(sortOrder === "ASC" ? "DESC" : "ASC");
    } else {
      setSortBy(columnKey);
      setSortOrder("ASC");
    }
  };

  const getSortIcon = (columnKey: string) => {
    if (sortBy !== columnKey) {
      return <ChevronsUpDown className="h-4 w-4" />;
    }
    return sortOrder === "ASC" ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    );
  };

  const getColumnByKey = (key: string) => columns.find((col) => col.id === key);

  const handleEdit = (guest: GuestInterface) => {
    setEditingId(guest.id);
    setEditingData({
      name: guest.name,
      email: guest.email,
      phone: guest.phone,
      family_members: guest.family_members,
      expected_members: guest.expected_members,
      extra_info: guest.extra_info?.description || "",
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingData({
      name: "",
      email: "",
      phone: "",
      family_members: 0,
      expected_members: 0,
      extra_info: "",
    });
  };

  const handleSave = async () => {
    if (!editingId) return;

    setIsLoading(true);
    try {
      const response = await BaseClient.put<any>(
        `${guestEndPoint.updateGuest}/${projectId}/${editingId}`,
        {
          name: editingData.name,
          email: editingData.email,
          phone: editingData.phone,
          family_members: editingData.family_members,
          expected_members: editingData.expected_members,
          extra_info: {
            description: editingData.extra_info,
          },
        }
      );

      if (response?.data?.success) {
        toast.success("Guest updated successfully");
        setEditingId(null);
        setEditingData({
          name: "",
          email: "",
          phone: "",
          family_members: 0,
          expected_members: 0,
          extra_info: "",
        });
        onGuestUpdate();
      } else {
        toast.error("Failed to update guest");
      }
    } catch (error) {
      console.error("Error updating guest:", error);
      toast.error("Failed to update guest");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (guestId: number) => {
    if (!confirm("Are you sure you want to delete this guest?")) return;

    setIsLoading(true);
    try {
      const response = await BaseClient.delete<any>(
        `${guestEndPoint.deleteGuest}/${projectId}/${guestId}`
      );

      if (response?.data?.success) {
        toast.success("Guest deleted successfully");
        onGuestUpdate();
      } else {
        toast.error("Failed to delete guest");
      }
    } catch (error) {
      console.error("Error deleting guest:", error);
      toast.error("Failed to delete guest");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    field: keyof typeof editingData,
    value: string | number
  ) => {
    setEditingData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNewGuestInputChange = (
    field: keyof typeof newGuest,
    value: string | number
  ) => {
    setNewGuest((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCreateGuest = async () => {
    if (!newGuest.name || !newGuest.email || !newGuest.phone) {
      toast.error("Name, email, and phone are required");
      return;
    }

    setIsCreating(true);
    try {
      const response = await BaseClient.post<any>(
        `${guestEndPoint.createGuest}/${projectId}`,
        {
          name: newGuest.name,
          email: newGuest.email,
          phone: newGuest.phone,
          family_members: newGuest.family_members,
          expected_members: newGuest.expected_members,
          extra_info: {
            description: newGuest.extra_info,
          },
          position: guests.length + 1, // Position at the end of all guests
        }
      );

      if (response?.data?.success) {
        toast.success("Guest added successfully");
        setNewGuest({
          name: "",
          email: "",
          phone: "",
          family_members: 0,
          expected_members: 0,
          extra_info: "",
        });
        onGuestUpdate();
      } else {
        toast.error("Failed to add guest");
      }
    } catch (error) {
      console.error("Error adding guest:", error);
      toast.error("Failed to add guest");
    } finally {
      setIsCreating(false);
    }
  };

  const resetNewGuestForm = () => {
    setNewGuest({
      name: "",
      email: "",
      phone: "",
      family_members: 0,
      expected_members: 0,
      extra_info: "",
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isCreating) {
      e.preventDefault();
      handleCreateGuest();
    } else if (e.key === "Escape") {
      e.preventDefault();
      resetNewGuestForm();
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, columnId: string) => {
    setDraggedColumn(columnId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();
    if (draggedColumn && draggedColumn !== targetColumnId) {
      const newOrder = [...columnOrder];
      const draggedIndex = newOrder.indexOf(draggedColumn);
      const targetIndex = newOrder.indexOf(targetColumnId);

      newOrder.splice(draggedIndex, 1);
      newOrder.splice(targetIndex, 0, draggedColumn);

      setColumnOrder(newOrder);
    }
    setDraggedColumn(null);
  };

  // Row drag and drop handlers
  const handleRowDragStart = (e: React.DragEvent, rowIndex: number) => {
    setDraggedRow(rowIndex);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", rowIndex.toString());
  };

  const handleRowDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleRowDrop = async (e: React.DragEvent, targetRowIndex: number) => {
    e.preventDefault();
    if (draggedRow !== null && draggedRow !== targetRowIndex) {
      const newOrder = [...guestOrder];
      const draggedIndex = newOrder.indexOf(draggedRow);
      const targetIndex = newOrder.indexOf(targetRowIndex);

      newOrder.splice(draggedIndex, 1);
      newOrder.splice(targetIndex, 0, draggedRow);

      setGuestOrder(newOrder);

      // Update positions in backend
      try {
        const reorderedGuests = newOrder.map(
          (originalIndex) => guests[originalIndex]
        );

        // Create positions array for backend
        const positions = reorderedGuests.map((guest, newIndex) => ({
          id: guest.id,
          position: newIndex + 1,
        }));

        // Send single API call with positions array
        const response = await BaseClient.put<any>(
          `${guestEndPoint.updateGuestPosition}/update-position/${projectId}`,
          { positions }
        );

        if (response?.data?.success) {
          toast.success("Guest order updated successfully");
          onGuestUpdate(); // Refresh the guest list
        } else {
          toast.error("Failed to update guest order");
          // Revert the order if update failed
          setGuestOrder(guests.map((_, index) => index));
        }
      } catch (error) {
        console.error("Error updating guest positions:", error);
        toast.error("Failed to update guest order");
        // Revert the order if update failed
        setGuestOrder(guests.map((_, index) => index));
      }
    }
    setDraggedRow(null);
  };

  const renderCell = (guest: GuestInterface, key: string, index: number) => {
    switch (key) {
      case "sr_no":
        return (
          <div className="flex items-center gap-2">
            <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
            <span className="font-medium">{index + 1}</span>
          </div>
        );

      case "name":
        if (editingId === guest.id) {
          return (
            <Input
              value={editingData.name || ""}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="w-full"
            />
          );
        }
        return (
          <div className="flex flex-col gap-1">
            <span
              className="cursor-pointer"
              onDoubleClick={() => handleEdit(guest)}
              title="Double-click to edit"
            >
              {guest?.translated_name ? guest?.translated_name : guest.name}
            </span>
            {/* Translated Name */}
            <span className="text-xs text-muted-foreground">
              {guest?.translated_name ? guest.name : ``}
            </span>
          </div>
        );

      case "email":
        if (editingId === guest.id) {
          return (
            <Input
              value={editingData.email || ""}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="w-full"
            />
          );
        }
        return (
          <span
            className="cursor-pointer"
            onDoubleClick={() => handleEdit(guest)}
            title="Double-click to edit"
          >
            {guest.email}
          </span>
        );

      case "phone":
        if (editingId === guest.id) {
          return (
            <Input
              value={editingData.phone || ""}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              className="w-full"
            />
          );
        }
        return (
          <span
            className="cursor-pointer"
            onDoubleClick={() => handleEdit(guest)}
            title="Double-click to edit"
          >
            {guest.phone}
          </span>
        );

      case "family_members":
        if (editingId === guest.id) {
          return (
            <Input
              type="number"
              value={editingData.family_members || 0}
              min={0}
              onChange={(e) =>
                handleInputChange(
                  "family_members",
                  parseInt(e.target.value) || 0
                )
              }
              className="w-full"
            />
          );
        }
        return (
          <span
            className="cursor-pointer"
            onDoubleClick={() => handleEdit(guest)}
            title="Double-click to edit"
          >
            {guest.family_members}
          </span>
        );

      case "expected_members":
        if (editingId === guest.id) {
          return (
            <Input
              type="number"
              value={editingData.expected_members || 0}
              min={0}
              onChange={(e) =>
                handleInputChange(
                  "expected_members",
                  parseInt(e.target.value) || 0
                )
              }
              className="w-full"
            />
          );
        }
        return (
          <span
            className="cursor-pointer"
            onDoubleClick={() => handleEdit(guest)}
            title="Double-click to edit"
          >
            {guest.expected_members}
          </span>
        );

      case "extra_info":
        if (editingId === guest.id) {
          return (
            <Input
              value={editingData.extra_info || ""}
              onChange={(e) => handleInputChange("extra_info", e.target.value)}
              className="w-full"
            />
          );
        }
        return (
          <span
            className="cursor-pointer"
            onDoubleClick={() => handleEdit(guest)}
            title="Double-click to edit"
          >
            {guest.extra_info?.description || "No extra info"}
          </span>
        );

      case "actions":
        if (editingId === guest.id) {
          return (
            <div className="flex gap-1">
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isLoading}
                className="h-8 w-8 p-0"
              >
                <Save className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancel}
                disabled={isLoading}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          );
        }
        return (
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleEdit(guest)}
              disabled={isLoading}
              className="h-8 w-8 p-0"
              title="Edit"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleDelete(guest.id)}
              disabled={isLoading}
              className="h-8 w-8 p-0"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  const renderNewGuestCell = (key: string) => {
    switch (key) {
      case "sr_no":
        return <span className="font-medium"></span>;

      case "name":
        return (
          <Input
            placeholder="Enter name"
            value={newGuest.name}
            onChange={(e) => handleNewGuestInputChange("name", e.target.value)}
            onKeyDown={handleKeyPress}
            className="w-full"
          />
        );

      case "email":
        return (
          <Input
            placeholder="Enter email"
            type="email"
            value={newGuest.email}
            onChange={(e) => handleNewGuestInputChange("email", e.target.value)}
            onKeyDown={handleKeyPress}
            className="w-full"
          />
        );

      case "phone":
        return (
          <Input
            placeholder="Enter phone"
            value={newGuest.phone}
            onChange={(e) => handleNewGuestInputChange("phone", e.target.value)}
            onKeyDown={handleKeyPress}
            className="w-full"
          />
        );

      case "family_members":
        return (
          <Input
            placeholder="0"
            type="number"
            value={newGuest.family_members}
            min={0}
            onChange={(e) =>
              handleNewGuestInputChange(
                "family_members",
                parseInt(e.target.value) || 0
              )
            }
            onKeyDown={handleKeyPress}
            className="w-full"
          />
        );

      case "expected_members":
        return (
          <Input
            placeholder="0"
            type="number"
            value={newGuest.expected_members}
            min={0}
            onChange={(e) =>
              handleNewGuestInputChange(
                "expected_members",
                parseInt(e.target.value) || 0
              )
            }
            onKeyDown={handleKeyPress}
            className="w-full"
          />
        );

      case "extra_info":
        return (
          <Input
            placeholder="Enter extra info"
            value={newGuest.extra_info}
            onChange={(e) =>
              handleNewGuestInputChange("extra_info", e.target.value)
            }
            onKeyDown={handleKeyPress}
            className="w-full"
          />
        );

      case "actions":
        return (
          <div className="flex gap-1">
            <Button
              size="sm"
              onClick={handleCreateGuest}
              disabled={
                isCreating ||
                !newGuest.name ||
                !newGuest.email ||
                !newGuest.phone
              }
              className="h-8 px-3"
            >
              {isCreating ? "Adding..." : "Add"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={resetNewGuestForm}
              disabled={isCreating}
              className="h-8 px-3"
            >
              Clear
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  // Render guest card for mobile/tablet view
  const renderGuestCard = (guest: GuestInterface, index: number) => {
    const isEditing = editingId === guest.id;

    return (
      <Card
        key={guest.id}
        className={`mb-4 transition-all duration-200 hover:shadow-md ${
          draggedRow === index ? "opacity-50 bg-muted" : ""
        }`}
        draggable
        onDragStart={(e) => handleRowDragStart(e, index)}
        onDragOver={handleRowDragOver}
        onDrop={(e) => handleRowDrop(e, index)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
              <Badge variant="outline" className="text-xs">
                #{index + 1}
              </Badge>
            </div>
            {!isEditing && (
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(guest)}
                  disabled={isLoading}
                  className="h-8 w-8 p-0"
                  title="Edit"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(guest.id)}
                  disabled={isLoading}
                  className="h-8 w-8 p-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Name */}
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Name
            </label>
            {isEditing ? (
              <Input
                value={editingData.name || ""}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="mt-1"
              />
            ) : (
              <div className="mt-1">
                <p className="font-medium">
                  {guest?.translated_name ? guest?.translated_name : guest.name}
                </p>
                {guest?.translated_name && (
                  <p className="text-sm text-muted-foreground">{guest.name}</p>
                )}
              </div>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Mail className="h-3 w-3" />
              Email
            </label>
            {isEditing ? (
              <Input
                value={editingData.email || ""}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="mt-1"
              />
            ) : (
              <p className="mt-1 text-sm">{guest.email}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Phone className="h-3 w-3" />
              Phone
            </label>
            {isEditing ? (
              <Input
                value={editingData.phone || ""}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className="mt-1"
              />
            ) : (
              <p className="mt-1 text-sm">{guest.phone}</p>
            )}
          </div>

          {/* Members Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="h-3 w-3" />
                Family Members
              </label>
              {isEditing ? (
                <Input
                  type="number"
                  value={editingData.family_members || 0}
                  min={0}
                  onChange={(e) =>
                    handleInputChange(
                      "family_members",
                      parseInt(e.target.value) || 0
                    )
                  }
                  className="mt-1"
                />
              ) : (
                <p className="mt-1 text-sm font-medium">
                  {guest.family_members}
                </p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Expected Members
              </label>
              {isEditing ? (
                <Input
                  type="number"
                  value={editingData.expected_members || 0}
                  min={0}
                  onChange={(e) =>
                    handleInputChange(
                      "expected_members",
                      parseInt(e.target.value) || 0
                    )
                  }
                  className="mt-1"
                />
              ) : (
                <p className="mt-1 text-sm font-medium">
                  {guest.expected_members}
                </p>
              )}
            </div>
          </div>

          {/* Extra Info */}
          <div>
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Info className="h-3 w-3" />
              Extra Info
            </label>
            {isEditing ? (
              <Input
                value={editingData.extra_info || ""}
                onChange={(e) =>
                  handleInputChange("extra_info", e.target.value)
                }
                className="mt-1"
              />
            ) : (
              <p className="mt-1 text-sm text-muted-foreground">
                {guest.extra_info?.description || "No extra info"}
              </p>
            )}
          </div>

          {/* Edit Actions */}
          {isEditing && (
            <div className="flex gap-2 pt-2 border-t">
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isLoading}
                className="flex-1"
              >
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancel}
                disabled={isLoading}
                className="flex-1"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  // Render new guest card
  const renderNewGuestCard = () => (
    <Card className="mb-4 border-dashed border-2 border-muted-foreground/30">
      <CardHeader>
        <CardTitle className="text-lg">Add New Guest</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Name *
            </label>
            <Input
              placeholder="Enter name"
              value={newGuest.name}
              onChange={(e) =>
                handleNewGuestInputChange("name", e.target.value)
              }
              onKeyDown={handleKeyPress}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Email *
            </label>
            <Input
              placeholder="Enter email"
              type="email"
              value={newGuest.email}
              onChange={(e) =>
                handleNewGuestInputChange("email", e.target.value)
              }
              onKeyDown={handleKeyPress}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Phone *
            </label>
            <Input
              placeholder="Enter phone"
              value={newGuest.phone}
              onChange={(e) =>
                handleNewGuestInputChange("phone", e.target.value)
              }
              onKeyDown={handleKeyPress}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Family Members
            </label>
            <Input
              placeholder="0"
              type="number"
              value={newGuest.family_members}
              min={0}
              onChange={(e) =>
                handleNewGuestInputChange(
                  "family_members",
                  parseInt(e.target.value) || 0
                )
              }
              onKeyDown={handleKeyPress}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Expected Members
            </label>
            <Input
              placeholder="0"
              type="number"
              value={newGuest.expected_members}
              min={0}
              onChange={(e) =>
                handleNewGuestInputChange(
                  "expected_members",
                  parseInt(e.target.value) || 0
                )
              }
              onKeyDown={handleKeyPress}
              className="mt-1"
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-muted-foreground">
              Extra Info
            </label>
            <Input
              placeholder="Enter extra info"
              value={newGuest.extra_info}
              onChange={(e) =>
                handleNewGuestInputChange("extra_info", e.target.value)
              }
              onKeyDown={handleKeyPress}
              className="mt-1"
            />
          </div>
        </div>
        <div className="flex gap-2 pt-2 border-t">
          <Button
            onClick={handleCreateGuest}
            disabled={
              isCreating || !newGuest.name || !newGuest.email || !newGuest.phone
            }
            className="flex-1"
          >
            {isCreating ? "Adding..." : "Add Guest"}
          </Button>
          <Button
            variant="outline"
            onClick={resetNewGuestForm}
            disabled={isCreating}
            className="flex-1"
          >
            Clear
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div>
      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search guests by name, email, phone, or extra info..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
              onClick={handleClearSearch}
              disabled={isLoading}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        {!filteredGuests || filteredGuests.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">
                {isSearching
                  ? "Searching..."
                  : searchTerm
                  ? "No guests found matching your search."
                  : "No guests found. Add your first guest using the form below."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                {columnOrder.map((key) => (
                  <TableHead
                    key={key}
                    className={`${
                      getColumnByKey(key)?.width
                    } cursor-move select-none ${
                      draggedColumn === key ? "opacity-50" : ""
                    } ${
                      getColumnByKey(key)?.sortable
                        ? "cursor-pointer hover:bg-muted/50"
                        : ""
                    }`}
                    draggable={!getColumnByKey(key)?.sortable}
                    onDragStart={
                      !getColumnByKey(key)?.sortable
                        ? (e) => handleDragStart(e, key)
                        : undefined
                    }
                    onDragOver={
                      !getColumnByKey(key)?.sortable
                        ? handleDragOver
                        : undefined
                    }
                    onDrop={
                      !getColumnByKey(key)?.sortable
                        ? (e) => handleDrop(e, key)
                        : undefined
                    }
                    onClick={
                      getColumnByKey(key)?.sortable
                        ? () => handleSort(key)
                        : undefined
                    }
                  >
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                      {getColumnByKey(key)?.label}
                      {getColumnByKey(key)?.sortable && getSortIcon(key)}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {guestOrder.map((originalIndex, displayIndex) => {
                const guest = filteredGuests[originalIndex];
                if (!guest) return null;

                return (
                  <TableRow
                    key={guest.id}
                    className={`cursor-move ${
                      draggedRow === originalIndex ? "opacity-50 bg-muted" : ""
                    }`}
                    draggable
                    onDragStart={(e) => handleRowDragStart(e, originalIndex)}
                    onDragOver={handleRowDragOver}
                    onDrop={(e) => handleRowDrop(e, originalIndex)}
                  >
                    {columnOrder.map((key) => (
                      <TableCell
                        key={key}
                        className={getColumnByKey(key)?.width}
                      >
                        {renderCell(guest, key, displayIndex)}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })}
              {/* New Guest Creation Row */}
              <TableRow className="bg-muted/30">
                {columnOrder.map((key) => (
                  <TableCell key={key} className={getColumnByKey(key)?.width}>
                    {renderNewGuestCell(key)}
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        )}
        {isLoadingMore && (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
        {hasMore && (
          <div className="flex justify-center py-4">
            <Button
              onClick={handleShowMore}
              disabled={isLoadingMore}
              className="h-10 px-6"
            >
              {isLoadingMore ? "Loading..." : "Show More"}
            </Button>
          </div>
        )}
      </div>

      {/* Mobile/Tablet Card View */}
      <div className="lg:hidden">
        {/* Search Bar for Mobile */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search guests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                onClick={handleClearSearch}
                disabled={isLoading}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* New Guest Card */}
        {renderNewGuestCard()}

        {/* Guest Cards */}
        {guestOrder.map((originalIndex, displayIndex) => {
          const guest = filteredGuests[originalIndex];
          if (!guest) return null;
          return renderGuestCard(guest, displayIndex);
        })}

        {/* Show message when no guests */}
        {(!filteredGuests || filteredGuests.length === 0) && (
          <Card className="mb-4">
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">
                {isSearching
                  ? "Searching..."
                  : searchTerm
                  ? "No guests found matching your search."
                  : "No guests found. Add your first guest above."}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Show More Button for Mobile */}
        {isLoadingMore && (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
        {hasMore && (
          <div className="flex justify-center py-4">
            <Button
              onClick={handleShowMore}
              disabled={isLoadingMore}
              className="w-full"
            >
              {isLoadingMore ? "Loading..." : "Show More"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
