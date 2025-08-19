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
import { Switch } from "@/components/ui/switch";
import {
  Users,
  Search,
  Filter,
  MoreHorizontal,
  UserPlus,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  Shield,
  Mail,
  Phone,
  Loader,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface User {
  id: number;
  name: string;
  email: string;
  phone_number?: string;
  is_verified: boolean;
  status: string;
  created_at: string;
  updated_at: string;
  roles?: Array<{
    id: number;
    role_name: string;
    description: string;
  }>;
}

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  pendingUsers: number;
  adminUsers: number;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface Role {
  id: number;
  role_name: string;
  description: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [pagination, setPagination] = useState<Pagination | null>(null);

  // Filters and search
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("created_at");
  const [sortOrder, setSortOrder] = useState<string>("DESC");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Dialog states
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

  // Form states
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone_number: "",
    status: "active",
    is_verified: false,
    roleId: "",
  });

  const [addForm, setAddForm] = useState({
    name: "",
    email: "",
    phone_number: "",
    password: "",
    status: "active",
    is_verified: false,
    roleId: "",
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [
    currentPage,
    itemsPerPage,
    searchTerm,
    roleFilter,
    statusFilter,
    sortBy,
    sortOrder,
  ]);

  // Handle clicking outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest("[data-dropdown]")) {
        setOpenDropdownId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [statsResponse, rolesResponse] = await Promise.all([
        BaseClient.get<any>(adminEndPoint.getUserStats),
        BaseClient.get<any>(adminEndPoint.getRoles),
      ]);

      if (statsResponse?.data?.code === 200) {
        setStats(statsResponse?.data?.data);
      }

      if (rolesResponse?.data?.code === 200) {
        setRoles(rolesResponse?.data?.data);
      }
    } catch (error) {
      console.error("Error fetching initial data:", error);
      toast.error("Failed to load initial data");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        search: searchTerm,
        role: roleFilter,
        status: statusFilter,
        sortBy,
        sortOrder,
      });

      const response = await BaseClient.get<any>(
        `${adminEndPoint.getUsers}?${params}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response?.data?.code === 200) {
        setUsers(response?.data?.data?.users);
        setPagination(response?.data?.data?.pagination);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    try {
      const response = await BaseClient.delete(
        adminEndPoint.deleteUser(userId.toString())
      );

      if ((response?.data as any)?.code === 200) {
        toast.success("User deleted successfully");
        setIsDeleteDialogOpen(false);
        fetchUsers(); // Refresh the list
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user");
    }
  };

  const handleEditUser = async () => {
    if (!selectedUser) return;

    try {
      const response = await BaseClient.put(
        adminEndPoint.updateUser(selectedUser.id.toString()),
        {
          name: editForm.name,
          email: editForm.email,
          phone_number: editForm.phone_number,
          status: editForm.status,
          is_verified: editForm.is_verified,
          roleId: editForm.roleId,
        }
      );

      if ((response?.data as any)?.code === 200) {
        toast.success("User updated successfully");
        setIsEditDialogOpen(false);
        fetchUsers(); // Refresh the list
      }
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update user");
    }
  };

  const handleAddUser = async () => {
    try {
      const response = await BaseClient.post(adminEndPoint.createUser, {
        name: addForm.name,
        email: addForm.email,
        phone_number: addForm.phone_number,
        password: addForm.password,
        status: addForm.status,
        is_verified: addForm.is_verified,
        roleId: addForm.roleId,
      });

      if ((response?.data as any)?.code === 200) {
        toast.success("User created successfully");
        setIsAddDialogOpen(false);
        setAddForm({
          name: "",
          email: "",
          phone_number: "",
          password: "",
          status: "active",
          is_verified: false,
          roleId: "",
        });
        fetchUsers(); // Refresh the list
      }
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error("Failed to create user");
    }
  };

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      phone_number: user.phone_number || "",
      status: user.status,
      is_verified: user.is_verified,
      roleId: user.roles?.[0]?.id?.toString() || "",
    });
    setIsEditDialogOpen(true);
  };

  const openAddDialog = () => {
    setAddForm({
      name: "",
      email: "",
      phone_number: "",
      password: "",
      status: "active",
      is_verified: false,
      roleId: "",
    });
    setIsAddDialogOpen(true);
  };

  const getStatusColor = (user: User) => {
    if (!user.is_verified) {
      return "bg-yellow-50 text-yellow-700 border-yellow-200";
    }

    if (user.status === "active") {
      return "bg-green-50 text-green-700 border-green-200";
    }

    return "bg-gray-50 text-gray-700 border-gray-200";
  };

  const getStatusText = (user: User) => {
    if (!user.is_verified) {
      return "Pending";
    }

    if (user.status === "active") {
      return "Active";
    }

    return "Inactive";
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleFilterChange = (filterType: string, value: string) => {
    switch (filterType) {
      case "role":
        setRoleFilter(value === "all" ? "" : value);
        break;
      case "status":
        setStatusFilter(value === "all" ? "" : value);
        break;
      case "sortBy":
        setSortBy(value);
        break;
      case "sortOrder":
        setSortOrder(value);
        break;
    }
    setCurrentPage(1); // Reset to first page when filtering
  };

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
              User Management
            </h1>
            <p className="text-gray-600 mt-2">
              Manage all users and their permissions
            </p>
          </div>
          <Button className="flex items-center gap-2" onClick={openAddDialog}>
            <UserPlus className="h-4 w-4" />
            Add User
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="px-4 lg:px-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
              <p className="text-xs text-muted-foreground">Registered users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Users
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats?.activeUsers || 0}
              </div>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Users
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {stats?.pendingUsers || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Awaiting verification
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats?.adminUsers || 0}
              </div>
              <p className="text-xs text-muted-foreground">Administrators</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="px-4 lg:px-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 h-10"
                />
              </div>

              {/* Filters Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Role</Label>
                  <Select
                    value={roleFilter}
                    onValueChange={(value) => handleFilterChange("role", value)}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="All Roles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.role_name}>
                          {role.role_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Status</Label>
                  <Select
                    value={statusFilter}
                    onValueChange={(value) =>
                      handleFilterChange("status", value)
                    }
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="verified">Verified</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Sort By</Label>
                  <Select
                    value={sortBy}
                    onValueChange={(value) =>
                      handleFilterChange("sortBy", value)
                    }
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="created_at">Created Date</SelectItem>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Order</Label>
                  <Select
                    value={sortOrder}
                    onValueChange={(value) =>
                      handleFilterChange("sortOrder", value)
                    }
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Order" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DESC">Descending</SelectItem>
                      <SelectItem value="ASC">Ascending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Active Filters Display */}
              {(searchTerm || roleFilter || statusFilter) && (
                <div className="flex flex-wrap gap-2 pt-2 border-t">
                  <span className="text-sm text-muted-foreground">
                    Active filters:
                  </span>
                  {searchTerm && (
                    <Badge variant="secondary" className="text-xs">
                      Search: {searchTerm}
                      <button
                        onClick={() => handleSearch("")}
                        className="ml-1 hover:text-destructive"
                      >
                        ×
                      </button>
                    </Badge>
                  )}
                  {roleFilter && (
                    <Badge variant="secondary" className="text-xs">
                      Role: {roleFilter}
                      <button
                        onClick={() => handleFilterChange("role", "all")}
                        className="ml-1 hover:text-destructive"
                      >
                        ×
                      </button>
                    </Badge>
                  )}
                  {statusFilter && (
                    <Badge variant="secondary" className="text-xs">
                      Status: {statusFilter}
                      <button
                        onClick={() => handleFilterChange("status", "all")}
                        className="ml-1 hover:text-destructive"
                      >
                        ×
                      </button>
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchTerm("");
                      setRoleFilter("");
                      setStatusFilter("");
                      setSortBy("created_at");
                      setSortOrder("DESC");
                    }}
                    className="text-xs h-6 px-2"
                  >
                    Clear All
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <div className="px-4 lg:px-6">
        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>
              {pagination
                ? `${pagination.totalItems} users found`
                : "Loading users..."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingUsers ? (
              <div className="flex items-center justify-center py-8">
                <Loader className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-muted-foreground">
                              ID: {user.id}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {user.email}
                            </div>
                            {user.phone_number && (
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Phone className="h-3 w-3" />
                                {user.phone_number}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {user.roles?.[0]?.role_name || "No Role"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={getStatusColor(user)}
                          >
                            {getStatusText(user)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {new Date(user.created_at).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu
                            open={openDropdownId === user.id}
                            onOpenChange={(open) => {
                              setOpenDropdownId(open ? user.id : null);
                            }}
                          >
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 p-0"
                                data-dropdown
                              >
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="w-48 z-50"
                              data-dropdown
                              onCloseAutoFocus={(e) => e.preventDefault()}
                            >
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setOpenDropdownId(null);
                                  setSelectedUser(user);
                                  setIsViewDialogOpen(true);
                                }}
                                className="cursor-pointer"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setOpenDropdownId(null);
                                  openEditDialog(user);
                                }}
                                className="cursor-pointer"
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit User
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600 cursor-pointer"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setOpenDropdownId(null);
                                  setSelectedUser(user);
                                  setIsDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {pagination && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-muted-foreground">
                      Showing{" "}
                      {(pagination.currentPage - 1) * pagination.itemsPerPage +
                        1}{" "}
                      to{" "}
                      {Math.min(
                        pagination.currentPage * pagination.itemsPerPage,
                        pagination.totalItems
                      )}{" "}
                      of {pagination.totalItems} results
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handlePageChange(pagination.currentPage - 1)
                        }
                        disabled={!pagination.hasPrevPage}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <div className="text-sm">
                        Page {pagination.currentPage} of {pagination.totalPages}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handlePageChange(pagination.currentPage + 1)
                        }
                        disabled={!pagination.hasNextPage}
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* View User Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              Detailed information about the selected user
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Name</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedUser.name}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedUser.email}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Phone</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedUser.phone_number || "Not provided"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Role</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedUser.roles?.[0]?.role_name || "No role assigned"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email Verified</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedUser.is_verified ? "Yes" : "No"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedUser.status}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Joined</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedUser.created_at).toLocaleString()}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Last Updated</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedUser.updated_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsViewDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and permissions
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name" className="text-sm font-medium">
                  Name
                </Label>
                <Input
                  id="edit-name"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email" className="text-sm font-medium">
                  Email
                </Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone" className="text-sm font-medium">
                  Phone
                </Label>
                <Input
                  id="edit-phone"
                  value={editForm.phone_number}
                  onChange={(e) =>
                    setEditForm({ ...editForm, phone_number: e.target.value })
                  }
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status" className="text-sm font-medium">
                  Status
                </Label>
                <Select
                  value={editForm.status}
                  onValueChange={(value) =>
                    setEditForm({ ...editForm, status: value })
                  }
                >
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-role" className="text-sm font-medium">
                  Role
                </Label>
                <Select
                  value={editForm.roleId}
                  onValueChange={(value) =>
                    setEditForm({ ...editForm, roleId: value })
                  }
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id.toString()}>
                        {role.role_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Email Verification
                </Label>
                <div className="flex items-center space-x-2 pt-2">
                  <Switch
                    id="edit-verified"
                    checked={editForm.is_verified}
                    onCheckedChange={(checked: boolean) =>
                      setEditForm({ ...editForm, is_verified: checked })
                    }
                  />
                  <Label htmlFor="edit-verified" className="text-sm">
                    {editForm.is_verified ? "Verified" : "Not Verified"}
                  </Label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleEditUser}>Update User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add User Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>Create a new user account</DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-name" className="text-sm font-medium">
                  Name
                </Label>
                <Input
                  id="add-name"
                  value={addForm.name}
                  onChange={(e) =>
                    setAddForm({ ...addForm, name: e.target.value })
                  }
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-email" className="text-sm font-medium">
                  Email
                </Label>
                <Input
                  id="add-email"
                  type="email"
                  value={addForm.email}
                  onChange={(e) =>
                    setAddForm({ ...addForm, email: e.target.value })
                  }
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-phone" className="text-sm font-medium">
                  Phone
                </Label>
                <Input
                  id="add-phone"
                  value={addForm.phone_number}
                  onChange={(e) =>
                    setAddForm({ ...addForm, phone_number: e.target.value })
                  }
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-password" className="text-sm font-medium">
                  Password
                </Label>
                <Input
                  id="add-password"
                  type="password"
                  value={addForm.password}
                  onChange={(e) =>
                    setAddForm({ ...addForm, password: e.target.value })
                  }
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-status" className="text-sm font-medium">
                  Status
                </Label>
                <Select
                  value={addForm.status}
                  onValueChange={(value) =>
                    setAddForm({ ...addForm, status: value })
                  }
                >
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-role" className="text-sm font-medium">
                  Role
                </Label>
                <Select
                  value={addForm.roleId}
                  onValueChange={(value) =>
                    setAddForm({ ...addForm, roleId: value })
                  }
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id.toString()}>
                        {role.role_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Email Verification
                </Label>
                <div className="flex items-center space-x-2 pt-2">
                  <Switch
                    id="add-verified"
                    checked={addForm.is_verified}
                    onCheckedChange={(checked: boolean) =>
                      setAddForm({ ...addForm, is_verified: checked })
                    }
                  />
                  <Label htmlFor="add-verified" className="text-sm">
                    {addForm.is_verified ? "Verified" : "Not Verified"}
                  </Label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddUser}>Create User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedUser && handleDeleteUser(selectedUser.id)}
            >
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
