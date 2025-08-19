"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Shield,
  ShieldCheck,
  ShieldX,
  Eye,
  Users,
  Search,
  Settings,
  CheckSquare,
  Square,
} from "lucide-react";

interface Permission {
  id: number;
  resource: string;
  action: string;
  description: string;
  created_at: string;
}

interface RoleForm {
  role_name: string;
  description: string;
  is_premium: boolean;
  permissions: number[];
}

interface RoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: RoleForm) => void;
  permissions: Permission[];
  initialData?: RoleForm;
  mode: "create" | "edit";
  loading?: boolean;
}

export default function RoleModal({
  isOpen,
  onClose,
  onSubmit,
  permissions,
  initialData,
  mode,
  loading = false,
}: RoleModalProps) {
  const [roleForm, setRoleForm] = useState<RoleForm>({
    role_name: "",
    description: "",
    is_premium: false,
    permissions: [],
  });
  const [permissionSearch, setPermissionSearch] = useState("");
  const [filteredPermissions, setFilteredPermissions] = useState<Permission[]>(
    []
  );

  // Initialize form with initial data when editing
  useEffect(() => {
    if (initialData && mode === "edit") {
      setRoleForm(initialData);
    } else {
      setRoleForm({
        role_name: "",
        description: "",
        is_premium: false,
        permissions: [],
      });
    }
  }, [initialData, mode, isOpen]);

  // Filter permissions based on search
  useEffect(() => {
    if (permissionSearch.trim()) {
      const filtered = permissions.filter(
        (permission) =>
          permission.resource
            .toLowerCase()
            .includes(permissionSearch.toLowerCase()) ||
          permission.action
            .toLowerCase()
            .includes(permissionSearch.toLowerCase()) ||
          permission.description
            .toLowerCase()
            .includes(permissionSearch.toLowerCase())
      );
      setFilteredPermissions(filtered);
    } else {
      setFilteredPermissions(permissions);
    }
  }, [permissions, permissionSearch]);

  const handlePermissionToggle = (permissionId: number) => {
    setRoleForm((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter((id) => id !== permissionId)
        : [...prev.permissions, permissionId],
    }));
  };

  const handleSelectAll = () => {
    const allPermissionIds = filteredPermissions.map((p) => p.id);
    const currentSelected = roleForm.permissions;

    // If all filtered permissions are selected, deselect them
    const allSelected = allPermissionIds.every((id) =>
      currentSelected.includes(id)
    );

    if (allSelected) {
      // Deselect all filtered permissions
      setRoleForm((prev) => ({
        ...prev,
        permissions: prev.permissions.filter(
          (id) => !allPermissionIds.includes(id)
        ),
      }));
    } else {
      // Select all filtered permissions (add to existing selections)
      setRoleForm((prev) => ({
        ...prev,
        permissions: [...new Set([...prev.permissions, ...allPermissionIds])],
      }));
    }
  };

  const handleSelectAllRead = () => {
    const readPermissions = permissions
      .filter((p) => p.action === "read")
      .map((p) => p.id);
    setRoleForm((prev) => ({
      ...prev,
      permissions: [...new Set([...prev.permissions, ...readPermissions])],
    }));
  };

  const handleSelectAllUsers = () => {
    const userPermissions = permissions
      .filter((p) => p.resource === "users")
      .map((p) => p.id);
    setRoleForm((prev) => ({
      ...prev,
      permissions: [...new Set([...prev.permissions, ...userPermissions])],
    }));
  };

  const handleClearAll = () => {
    setRoleForm((prev) => ({ ...prev, permissions: [] }));
  };

  const isAllSelected =
    filteredPermissions.length > 0 &&
    filteredPermissions.every((p) => roleForm.permissions.includes(p.id));

  const isIndeterminate =
    filteredPermissions.some((p) => roleForm.permissions.includes(p.id)) &&
    !filteredPermissions.every((p) => roleForm.permissions.includes(p.id));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {mode === "create" ? "Add New Role" : "Edit Role"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Create a new role with specific permissions and access controls"
              : "Update role information and permissions"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 h-[calc(95vh-200px)] overflow-hidden">
          {/* Left Column - Basic Information */}
          <div className="space-y-6 overflow-y-auto pr-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Basic Information</CardTitle>
                <CardDescription>
                  Define the role&apos;s core details and purpose
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="role-name" className="text-sm font-medium">
                    Role Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="role-name"
                    value={roleForm.role_name}
                    onChange={(e) =>
                      setRoleForm({ ...roleForm, role_name: e.target.value })
                    }
                    placeholder="e.g., Project Manager, Content Moderator"
                    className="h-10"
                  />
                  <p className="text-xs text-muted-foreground">
                    Use a clear, descriptive name that reflects the role&apos;s
                    purpose
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role-type" className="text-sm font-medium">
                    Role Type
                  </Label>
                  <Select
                    value={roleForm.is_premium ? "premium" : "standard"}
                    onValueChange={(value) =>
                      setRoleForm({
                        ...roleForm,
                        is_premium: value === "premium",
                      })
                    }
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="h-4 w-4 text-green-600" />
                          <span>Standard</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="premium">
                        <div className="flex items-center gap-2">
                          <ShieldX className="h-4 w-4 text-blue-600" />
                          <span>Premium</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Premium roles have access to advanced features and
                    capabilities
                  </p>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="role-description"
                    className="text-sm font-medium"
                  >
                    Description
                  </Label>
                  <Textarea
                    id="role-description"
                    value={roleForm.description}
                    onChange={(e) =>
                      setRoleForm({ ...roleForm, description: e.target.value })
                    }
                    placeholder="Describe the role's responsibilities, scope, and what users with this role can do..."
                    rows={4}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    Provide a clear description to help users understand this
                    role
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
                <CardDescription>
                  Common permission sets for quick setup
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAllRead}
                    className="justify-start"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Select All Read Permissions
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAllUsers}
                    className="justify-start"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Select All User Permissions
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearAll}
                    className="justify-start"
                  >
                    <ShieldX className="h-4 w-4 mr-2" />
                    Clear All Permissions
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Permissions */}
          <div className="space-y-6 overflow-y-auto pr-2">
            <Card className="h-full flex flex-col">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Permissions</CardTitle>
                    <CardDescription>
                      Select the permissions this role should have
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">
                    {roleForm.permissions.length} selected
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col min-h-0">
                {/* Permission Search */}
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search permissions..."
                      value={permissionSearch}
                      onChange={(e) => setPermissionSearch(e.target.value)}
                      className="pl-10 h-9"
                    />
                  </div>
                </div>

                {/* Select All Checkbox */}
                {filteredPermissions.length > 0 && (
                  <div className="mb-4 p-3 bg-gray-50 border rounded-md">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="select-all-permissions"
                        checked={isAllSelected}
                        ref={(el) => {
                          if (el) {
                            el.indeterminate = isIndeterminate;
                          }
                        }}
                        onCheckedChange={handleSelectAll}
                      />
                      <Label
                        htmlFor="select-all-permissions"
                        className="text-sm font-medium cursor-pointer"
                      >
                        {isAllSelected ? "Deselect All" : "Select All"}
                        {permissionSearch &&
                          ` (${filteredPermissions.length} filtered)`}
                      </Label>
                    </div>
                  </div>
                )}

                {/* Permissions List */}
                <div className="flex-1 overflow-y-auto border rounded-md">
                  {filteredPermissions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Settings className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>
                        {permissionSearch
                          ? "No permissions match your search"
                          : "No permissions available"}
                      </p>
                      <p className="text-sm">
                        {permissionSearch
                          ? "Try adjusting your search terms"
                          : "Create permissions first to assign them to roles"}
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 space-y-3">
                      {filteredPermissions.map((permission) => (
                        <div
                          key={permission.id}
                          className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors ${
                            roleForm.permissions.includes(permission.id)
                              ? "bg-blue-50 border-blue-200"
                              : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                          }`}
                        >
                          <Checkbox
                            id={`permission-${permission.id}`}
                            checked={roleForm.permissions.includes(
                              permission.id
                            )}
                            onCheckedChange={() =>
                              handlePermissionToggle(permission.id)
                            }
                            className="mt-1"
                          />
                          <div className="flex-1 min-w-0">
                            <Label
                              htmlFor={`permission-${permission.id}`}
                              className="text-sm font-medium cursor-pointer"
                            >
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {permission.resource}
                                </Badge>
                                <span className="text-muted-foreground">:</span>
                                <Badge variant="outline" className="text-xs">
                                  {permission.action}
                                </Badge>
                              </div>
                            </Label>
                            {permission.description && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {permission.description}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Permission Summary */}
                {roleForm.permissions.length > 0 && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                    <div className="flex items-center gap-2 mb-2">
                      <ShieldCheck className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">
                        Permission Summary
                      </span>
                    </div>
                    <div className="text-xs text-green-700">
                      This role will have access to{" "}
                      {roleForm.permissions.length} permission(s)
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <DialogFooter className="border-t pt-4">
          <div className="flex items-center justify-between w-full">
            <div className="text-sm text-muted-foreground">
              {roleForm.role_name && (
                <span>
                  {mode === "create" ? "Creating" : "Updating"} role:{" "}
                  <strong>{roleForm.role_name}</strong>
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button
                onClick={() => onSubmit(roleForm)}
                disabled={!roleForm.role_name.trim() || loading}
                className="min-w-[100px]"
              >
                {loading
                  ? "Loading..."
                  : roleForm.role_name.trim()
                  ? mode === "create"
                    ? "Create Role"
                    : "Update Role"
                  : "Enter Role Name"}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


