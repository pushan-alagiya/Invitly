"use client";

import { useState } from "react";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Mail,
  Plus,
  MoreHorizontal,
  Send,
  FileText,
  Settings,
  BarChart3,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";

interface EmailTemplate {
  id: number;
  name: string;
  subject: string;
  description: string;
  category: string;
  isDefault: boolean;
  isActive: boolean;
  usageCount: number;
  lastUsed: string;
  createdAt: string;
}

interface EmailStats {
  totalSent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  spamReports: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
}

const mockTemplates: EmailTemplate[] = [
  {
    id: 1,
    name: "Event Invitation",
    subject: "You're invited to {{event_name}}",
    description: "Standard invitation template for events",
    category: "Invitation",
    isDefault: true,
    isActive: true,
    usageCount: 1250,
    lastUsed: "2024-03-15",
    createdAt: "2024-01-01",
  },
  {
    id: 2,
    name: "Welcome Email",
    subject: "Welcome to {{project_name}}",
    description: "Welcome email for new project members",
    category: "Onboarding",
    isDefault: false,
    isActive: true,
    usageCount: 450,
    lastUsed: "2024-03-10",
    createdAt: "2024-01-15",
  },
  {
    id: 3,
    name: "Reminder Email",
    subject: "Reminder: {{event_name}} is tomorrow",
    description: "Event reminder template",
    category: "Reminder",
    isDefault: false,
    isActive: true,
    usageCount: 320,
    lastUsed: "2024-03-12",
    createdAt: "2024-02-01",
  },
  {
    id: 4,
    name: "Thank You Email",
    subject: "Thank you for attending {{event_name}}",
    description: "Post-event thank you template",
    category: "Follow-up",
    isDefault: false,
    isActive: false,
    usageCount: 180,
    lastUsed: "2024-02-28",
    createdAt: "2024-02-15",
  },
];

const mockEmailStats: EmailStats = {
  totalSent: 2200,
  delivered: 2156,
  opened: 1724,
  clicked: 431,
  bounced: 44,
  spamReports: 2,
  deliveryRate: 98.0,
  openRate: 80.0,
  clickRate: 25.0,
};

export default function AdminEmailsPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>(mockTemplates);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    subject: "",
    description: "",
    category: "",
    content: "",
  });

  const filteredTemplates = templates.filter(
    (template) =>
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateTemplate = () => {
    const template: EmailTemplate = {
      id: Math.max(...templates.map((t) => t.id)) + 1,
      name: newTemplate.name,
      subject: newTemplate.subject,
      description: newTemplate.description,
      category: newTemplate.category,
      isDefault: false,
      isActive: true,
      usageCount: 0,
      lastUsed: "",
      createdAt: new Date().toISOString().split("T")[0],
    };

    setTemplates([...templates, template]);
    setNewTemplate({
      name: "",
      subject: "",
      description: "",
      category: "",
      content: "",
    });
    setIsCreateDialogOpen(false);
  };

  const toggleTemplateStatus = (templateId: number) => {
    setTemplates(
      templates.map((template) =>
        template.id === templateId
          ? { ...template, isActive: !template.isActive }
          : template
      )
    );
  };

  const setDefaultTemplate = (templateId: number) => {
    setTemplates(
      templates.map((template) =>
        template.id === templateId
          ? { ...template, isDefault: true }
          : { ...template, isDefault: false }
      )
    );
  };

  const totalTemplates = templates.length;
  const activeTemplates = templates.filter((t) => t.isActive).length;
  const totalUsage = templates.reduce((sum, t) => sum + t.usageCount, 0);

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      {/* Header */}
      <div className="px-4 lg:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Email Management
            </h1>
            <p className="text-gray-600 mt-2">
              Manage email templates and monitor delivery analytics
            </p>
          </div>
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Email Template</DialogTitle>
                <DialogDescription>
                  Create a new email template for your campaigns
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="template-name">Template Name</Label>
                  <Input
                    id="template-name"
                    placeholder="e.g., Event Invitation"
                    value={newTemplate.name}
                    onChange={(e) =>
                      setNewTemplate((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="template-subject">Subject Line</Label>
                  <Input
                    id="template-subject"
                    placeholder="e.g., You're invited to {{event_name}}"
                    value={newTemplate.subject}
                    onChange={(e) =>
                      setNewTemplate((prev) => ({
                        ...prev,
                        subject: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="template-category">Category</Label>
                  <Select
                    value={newTemplate.category}
                    onValueChange={(value) =>
                      setNewTemplate((prev) => ({ ...prev, category: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Invitation">Invitation</SelectItem>
                      <SelectItem value="Onboarding">Onboarding</SelectItem>
                      <SelectItem value="Reminder">Reminder</SelectItem>
                      <SelectItem value="Follow-up">Follow-up</SelectItem>
                      <SelectItem value="Notification">Notification</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="template-description">Description</Label>
                  <Textarea
                    id="template-description"
                    placeholder="Describe the purpose of this template..."
                    value={newTemplate.description}
                    onChange={(e) =>
                      setNewTemplate((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="template-content">Email Content</Label>
                  <Textarea
                    id="template-content"
                    placeholder="Enter the email content with {{variables}}..."
                    value={newTemplate.content}
                    onChange={(e) =>
                      setNewTemplate((prev) => ({
                        ...prev,
                        content: e.target.value,
                      }))
                    }
                    className="min-h-[200px]"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateTemplate}
                  disabled={!newTemplate.name || !newTemplate.subject}
                >
                  Create Template
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Email Analytics */}
      <div className="px-4 lg:px-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Email Analytics
            </CardTitle>
            <CardDescription>
              Performance metrics for email campaigns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="text-sm font-medium">Total Sent</p>
                  <p className="text-2xl font-bold">
                    {mockEmailStats.totalSent.toLocaleString()}
                  </p>
                </div>
                <Send className="h-8 w-8 text-blue-500" />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="text-sm font-medium">Delivery Rate</p>
                  <p className="text-2xl font-bold text-green-600">
                    {mockEmailStats.deliveryRate}%
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="text-sm font-medium">Open Rate</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {mockEmailStats.openRate}%
                  </p>
                </div>
                <Eye className="h-8 w-8 text-blue-500" />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="text-sm font-medium">Click Rate</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {mockEmailStats.clickRate}%
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Template Statistics */}
      <div className="px-4 lg:px-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Templates
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTemplates}</div>
              <p className="text-xs text-muted-foreground">
                Available templates
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Templates
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {activeTemplates}
              </div>
              <p className="text-xs text-muted-foreground">Currently in use</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalUsage.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Times sent</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {(
                  (mockEmailStats.bounced / mockEmailStats.totalSent) *
                  100
                ).toFixed(1)}
                %
              </div>
              <p className="text-xs text-muted-foreground">Failed deliveries</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="px-4 lg:px-6">
        <Card>
          <CardHeader>
            <CardTitle>Search Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Invitation">Invitation</SelectItem>
                  <SelectItem value="Onboarding">Onboarding</SelectItem>
                  <SelectItem value="Reminder">Reminder</SelectItem>
                  <SelectItem value="Follow-up">Follow-up</SelectItem>
                  <SelectItem value="Notification">Notification</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Templates Table */}
      <div className="px-4 lg:px-6">
        <Card>
          <CardHeader>
            <CardTitle>Email Templates</CardTitle>
            <CardDescription>
              {filteredTemplates.length} templates found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Template Name</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Last Used</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTemplates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{template.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {template.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm max-w-xs truncate">
                        {template.subject}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{template.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={template.isActive}
                          onCheckedChange={() =>
                            toggleTemplateStatus(template.id)
                          }
                        />
                        <span className="text-sm">
                          {template.isActive ? "Active" : "Inactive"}
                        </span>
                        {template.isDefault && (
                          <Badge variant="secondary" className="text-xs">
                            Default
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">
                          {template.usageCount.toLocaleString()}
                        </div>
                        <div className="text-muted-foreground">times sent</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {template.lastUsed
                          ? new Date(template.lastUsed).toLocaleDateString()
                          : "Never"}
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
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Template
                          </DropdownMenuItem>
                          {!template.isDefault && (
                            <DropdownMenuItem
                              onClick={() => setDefaultTemplate(template.id)}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Set as Default
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem>
                            <Send className="h-4 w-4 mr-2" />
                            Send Test
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Template
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
    </div>
  );
}
