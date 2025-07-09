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
import { toast } from "sonner";
import { BaseClient } from "@/api/ApiClient";
import { guestEndPoint } from "@/utils/apiEndPoints";
import { GuestInterface } from "@/app/(common)/projects/[id]/page";
import { Pencil, Save, X, Trash2, GripVertical } from "lucide-react";

interface GuestTableProps {
  projectId: number;
  guests: GuestInterface[];
  onGuestUpdate: () => void;
}

interface ColumnConfig {
  id: string;
  label: string;
  key: keyof GuestInterface | "actions" | "sr_no";
  width?: string;
}

export function GuestTable({
  projectId,
  guests,
  onGuestUpdate,
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

  // Initialize guest order when guests change
  useEffect(() => {
    setGuestOrder(guests.map((_, index) => index));
  }, [guests]);

  const columns: ColumnConfig[] = [
    { id: "sr_no", label: "Sr. No", key: "sr_no", width: "w-16" },
    { id: "name", label: "Name", key: "name" },
    { id: "email", label: "Email", key: "email" },
    { id: "phone", label: "Phone", key: "phone" },
    { id: "family_members", label: "Family Members", key: "family_members" },
    {
      id: "expected_members",
      label: "Expected Members",
      key: "expected_members",
    },
    { id: "extra_info", label: "Extra Info", key: "extra_info" },
    { id: "actions", label: "Actions", key: "actions", width: "w-32" },
  ];

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
          position: guests.length + 1, // Position at the end
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

  return (
    <div className="overflow-x-auto">
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
                }`}
                draggable
                onDragStart={(e) => handleDragStart(e, key)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, key)}
              >
                <div className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  {getColumnByKey(key)?.label}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {guestOrder.map((originalIndex, displayIndex) => {
            const guest = guests[originalIndex];
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
                  <TableCell key={key} className={getColumnByKey(key)?.width}>
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
    </div>
  );
}
