/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { BaseClient } from "@/api/ApiClient";
import { adminEndPoint } from "@/utils/apiEndPoints";
import { toast } from "sonner";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import RoleModal from "@/components/admin/role-modal";
import {
  Shield,
  ShieldCheck,
  ShieldX,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Loader,
  Search,
  Filter,
  Key,
} from "lucide-react";

interface Role {
  id: number;
  role_name: string;
  description: string;
  is_premium: boolean;
  created_at: string;
  permissions?: Permission[];
}

interface Permission {
  id: number;
  resource: string;
  action: string;
  description: string;
  created_at: string;
}

interface RoleStats {
  totalRoles: number;
  activeRoles: number;
  premiumRoles: number;
  totalPermissions: number;
}

export default function AdminRolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [stats, setStats] = useState<RoleStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingRoles, setLoadingRoles] = useState(false);

  // Dialog states
  const [isAddRoleDialogOpen, setIsAddRoleDialogOpen] = useState(false);
  const [isEditRoleDialogOpen, setIsEditRoleDialogOpen] = useState(false);
  const [isDeleteRoleDialogOpen, setIsDeleteRoleDialogOpen] = useState(false);
  const [isAddPermissionDialogOpen, setIsAddPermissionDialogOpen] =
    useState(false);
  const [isEditPermissionDialogOpen, setIsEditPermissionDialogOpen] =
    useState(false);
  const [isDeletePermissionDialogOpen, setIsDeletePermissionDialogOpen] =
    useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedPermission, setSelectedPermission] =
    useState<Permission | null>(null);
  const [roleModalLoading, setRoleModalLoading] = useState(false);

  // Form states
  const [permissionForm, setPermissionForm] = useState({
    resource: "",
    action: "",
    description: "",
  });

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [searchTerm, filterType]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [statsResponse, permissionsResponse] = await Promise.all([
        BaseClient.get<any>(adminEndPoint.getRoleStats),
        BaseClient.get<any>(adminEndPoint.getPermissions),
      ]);

      if (statsResponse?.data?.code === 200) {
        setStats(statsResponse?.data?.data);
      }

      if (permissionsResponse?.data?.code === 200) {
        setPermissions(permissionsResponse?.data?.data);
      }
    } catch (error) {
      console.error("Error fetching initial data:", error);
      toast.error("Failed to load initial data");
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      setLoadingRoles(true);
      const response = await BaseClient.get<any>(adminEndPoint.getRoles);

      if (response?.data?.code === 200) {
        let filteredRoles = response?.data?.data;

        // Apply search filter
        if (searchTerm) {
          filteredRoles = filteredRoles.filter(
            (role: Role) =>
              role.role_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              role.description.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }

        // Apply type filter
        if (filterType === "premium") {
          filteredRoles = filteredRoles.filter((role: Role) => role.is_premium);
        } else if (filterType === "active") {
          filteredRoles = filteredRoles.filter(
            (role: Role) => !role.is_premium
          );
        }

        setRoles(filteredRoles);
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
      toast.error("Failed to load roles");
    } finally {
      setLoadingRoles(false);
    }
  };

  const handleCreateRole = async (formData: any) => {
    try {
      setRoleModalLoading(true);
      const response = await BaseClient.post(
        adminEndPoint.createRole,
        formData
      );

      if ((response?.data as any)?.code === 201) {
        toast.success("Role created successfully");
        setIsAddRoleDialogOpen(false);
        fetchRoles();
      }
    } catch (error) {
      console.error("Error creating role:", error);
      toast.error("Failed to create role");
    } finally {
      setRoleModalLoading(false);
    }
  };

  const handleUpdateRole = async (formData: any) => {
    if (!selectedRole) return;

    try {
      setRoleModalLoading(true);
      const response = await BaseClient.put(
        adminEndPoint.updateRole(selectedRole.id.toString()),
        formData
      );

      if ((response?.data as any)?.code === 200) {
        toast.success("Role updated successfully");
        setIsEditRoleDialogOpen(false);
        fetchRoles();
      }
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("Failed to update role");
    } finally {
      setRoleModalLoading(false);
    }
  };

  const handleDeleteRole = async () => {
    if (!selectedRole) return;

    try {
      const response = await BaseClient.delete(
        adminEndPoint.deleteRole(selectedRole.id.toString())
      );

      if ((response?.data as any)?.code === 200) {
        toast.success("Role deleted successfully");
        setIsDeleteRoleDialogOpen(false);
        fetchRoles();
      }
    } catch (error) {
      console.error("Error deleting role:", error);
      toast.error("Failed to delete role");
    }
  };

  const handleCreatePermission = async () => {
    try {
      const response = await BaseClient.post(
        adminEndPoint.createPermission,
        permissionForm
      );

      if ((response?.data as any)?.code === 201) {
        toast.success("Permission created successfully");
        setIsAddPermissionDialogOpen(false);
        setPermissionForm({
          resource: "",
          action: "",
          description: "",
        });
        fetchInitialData(); // Refresh permissions list
      }
    } catch (error) {
      console.error("Error creating permission:", error);
      toast.error("Failed to create permission");
    }
  };

  const handleUpdatePermission = async () => {
    if (!selectedPermission) return;

    try {
      const response = await BaseClient.put(
        adminEndPoint.updatePermission(selectedPermission.id.toString()),
        permissionForm
      );

      if ((response?.data as any)?.code === 200) {
        toast.success("Permission updated successfully");
        setIsEditPermissionDialogOpen(false);
        fetchInitialData(); // Refresh permissions list
      }
    } catch (error) {
      console.error("Error updating permission:", error);
      toast.error("Failed to update permission");
    }
  };

  const handleDeletePermission = async () => {
    if (!selectedPermission) return;

    try {
      const response = await BaseClient.delete(
        adminEndPoint.deletePermission(selectedPermission.id.toString())
      );

      if ((response?.data as any)?.code === 200) {
        toast.success("Permission deleted successfully");
        setIsDeletePermissionDialogOpen(false);
        fetchInitialData(); // Refresh permissions list
      }
    } catch (error) {
      console.error("Error deleting permission:", error);
      toast.error("Failed to delete permission");
    }
  };

  const openEditRoleDialog = (role: Role) => {
    setSelectedRole(role);
    setIsEditRoleDialogOpen(true);
  };

  const openAddRoleDialog = () => {
    setIsAddRoleDialogOpen(true);
  };

  const openAddPermissionDialog = () => {
    setPermissionForm({
      resource: "",
      action: "",
      description: "",
    });
    setIsAddPermissionDialogOpen(true);
  };

  const openEditPermissionDialog = (permission: Permission) => {
    setSelectedPermission(permission);
    setPermissionForm({
      resource: permission.resource,
      action: permission.action,
      description: permission.description,
    });
    setIsEditPermissionDialogOpen(true);
  };

  // Remove this function as it's now handled in the modal component

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      {/* Header */}
      <div className="px-4 lg:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Roles & Permissions
            </h1>
            <p className="text-gray-600 mt-2">
              Manage user roles and their associated permissions
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={openAddPermissionDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add Permission
            </Button>
            <Button onClick={openAddRoleDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add Role
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="px-4 lg:px-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Roles</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalRoles || 0}</div>
              <p className="text-xs text-muted-foreground">All roles</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Roles
              </CardTitle>
              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats?.activeRoles || 0}
              </div>
              <p className="text-xs text-muted-foreground">Standard roles</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Premium Roles
              </CardTitle>
              <ShieldX className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats?.premiumRoles || 0}
              </div>
              <p className="text-xs text-muted-foreground">Premium features</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Permissions
              </CardTitle>
              <Key className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {stats?.totalPermissions || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Available permissions
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="px-4 lg:px-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Search & Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search roles by name or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="active">Active Roles</SelectItem>
                  <SelectItem value="premium">Premium Roles</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Roles Table */}
      <div className="px-4 lg:px-6">
        <Card>
          <CardHeader>
            <CardTitle>All Roles</CardTitle>
            <CardDescription>{roles.length} roles found</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingRoles ? (
              <div className="flex items-center justify-center py-8">
                <Loader className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell>
                        <div className="font-medium">{role.role_name}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {role.description || "No description"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={role.is_premium ? "default" : "secondary"}
                        >
                          {role.is_premium ? "Premium" : "Standard"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {role.permissions?.length || 0} permissions
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {new Date(role.created_at).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => openEditRoleDialog(role)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Role
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => {
                                setSelectedRole(role);
                                setIsDeleteRoleDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Role
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Permissions Table */}
      <div className="px-4 lg:px-6">
        <Card>
          <CardHeader>
            <CardTitle>All Permissions</CardTitle>
            <CardDescription>
              {permissions.length} permissions available
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Resource</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {permissions.map((permission) => (
                  <TableRow key={permission.id}>
                    <TableCell>
                      <div className="font-medium">{permission.resource}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{permission.action}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {permission.description || "No description"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {new Date(permission.created_at).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => openEditPermissionDialog(permission)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Permission
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => {
                              setSelectedPermission(permission);
                              setIsDeletePermissionDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Permission
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Role Modal Component */}
      <RoleModal
        isOpen={isAddRoleDialogOpen}
        onClose={() => setIsAddRoleDialogOpen(false)}
        onSubmit={handleCreateRole}
        permissions={permissions}
        mode="create"
        loading={roleModalLoading}
      />

      <RoleModal
        isOpen={isEditRoleDialogOpen}
        onClose={() => setIsEditRoleDialogOpen(false)}
        onSubmit={handleUpdateRole}
        permissions={permissions}
        initialData={
          selectedRole
            ? {
                role_name: selectedRole.role_name,
                description: selectedRole.description,
                is_premium: selectedRole.is_premium,
                permissions: selectedRole.permissions?.map((p) => p.id) || [],
              }
            : undefined
        }
        mode="edit"
        loading={roleModalLoading}
      />

      {/* Delete Role Dialog */}
      <Dialog
        open={isDeleteRoleDialogOpen}
        onOpenChange={setIsDeleteRoleDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Role</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this role? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteRoleDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteRole}>
              Delete Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Permission Dialog */}
      <Dialog
        open={isAddPermissionDialogOpen}
        onOpenChange={setIsAddPermissionDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Permission</DialogTitle>
            <DialogDescription>
              Create a new permission for role assignment
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="permission-resource">Resource</Label>
                <Input
                  id="permission-resource"
                  value={permissionForm.resource}
                  onChange={(e) =>
                    setPermissionForm({
                      ...permissionForm,
                      resource: e.target.value,
                    })
                  }
                  placeholder="e.g., users, projects"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="permission-action">Action</Label>
                <Input
                  id="permission-action"
                  value={permissionForm.action}
                  onChange={(e) =>
                    setPermissionForm({
                      ...permissionForm,
                      action: e.target.value,
                    })
                  }
                  placeholder="e.g., read, write, delete"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="permission-description">Description</Label>
              <Textarea
                id="permission-description"
                value={permissionForm.description}
                onChange={(e) =>
                  setPermissionForm({
                    ...permissionForm,
                    description: e.target.value,
                  })
                }
                placeholder="Describe what this permission allows"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddPermissionDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreatePermission}>Create Permission</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Permission Dialog */}
      <Dialog
        open={isEditPermissionDialogOpen}
        onOpenChange={setIsEditPermissionDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Permission</DialogTitle>
            <DialogDescription>Update permission details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-permission-resource">Resource</Label>
                <Input
                  id="edit-permission-resource"
                  value={permissionForm.resource}
                  onChange={(e) =>
                    setPermissionForm({
                      ...permissionForm,
                      resource: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-permission-action">Action</Label>
                <Input
                  id="edit-permission-action"
                  value={permissionForm.action}
                  onChange={(e) =>
                    setPermissionForm({
                      ...permissionForm,
                      action: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-permission-description">Description</Label>
              <Textarea
                id="edit-permission-description"
                value={permissionForm.description}
                onChange={(e) =>
                  setPermissionForm({
                    ...permissionForm,
                    description: e.target.value,
                  })
                }
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditPermissionDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdatePermission}>Update Permission</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Permission Dialog */}
      <Dialog
        open={isDeletePermissionDialogOpen}
        onOpenChange={setIsDeletePermissionDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Permission</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this permission? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeletePermissionDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeletePermission}>
              Delete Permission
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
