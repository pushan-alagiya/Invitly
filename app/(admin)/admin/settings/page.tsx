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
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Settings,
  Shield,
  Mail,
  Server,
  Save,
  RefreshCw,
  Globe,
  Lock,
  Bell,
  Database,
  HardDrive,
  Zap,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState("general");
  const [isSaving, setIsSaving] = useState(false);

  // General Settings
  const [generalSettings, setGeneralSettings] = useState({
    siteName: "Invity Platform",
    siteDescription: "Professional event management platform",
    timezone: "UTC",
    language: "en",
    maintenanceMode: false,
    debugMode: false,
  });

  // Security Settings
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: true,
    sessionTimeout: 30,
    passwordPolicy: "strong",
    maxLoginAttempts: 5,
    ipWhitelist: "",
    sslEnforcement: true,
  });

  // Email Settings
  const [emailSettings, setEmailSettings] = useState({
    smtpHost: "smtp.gmail.com",
    smtpPort: 587,
    smtpUser: "noreply@invity.com",
    smtpPassword: "********",
    fromEmail: "noreply@invity.com",
    fromName: "Invity Platform",
    emailVerification: true,
    emailNotifications: true,
  });

  // System Settings
  const [systemSettings, setSystemSettings] = useState({
    maxFileSize: 10,
    allowedFileTypes: "jpg,jpeg,png,pdf,doc,docx",
    backupFrequency: "daily",
    logRetention: 30,
    cacheEnabled: true,
    compressionEnabled: true,
  });

  const handleSave = async (settingsType: string) => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsSaving(false);
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          {/* Header */}
          <div className="px-4 lg:px-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  System Settings
                </h1>
                <p className="text-gray-600 mt-2">
                  Configure platform settings and preferences
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="bg-green-50 text-green-700 border-green-200"
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  All Settings Saved
                </Badge>
              </div>
            </div>
          </div>

          {/* Settings Tabs */}
          <div className="px-4 lg:px-6">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="space-y-6"
            >
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger
                  value="general"
                  className="flex items-center gap-2"
                >
                  <Globe className="h-4 w-4" />
                  General
                </TabsTrigger>
                <TabsTrigger
                  value="security"
                  className="flex items-center gap-2"
                >
                  <Shield className="h-4 w-4" />
                  Security
                </TabsTrigger>
                <TabsTrigger value="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </TabsTrigger>
                <TabsTrigger value="system" className="flex items-center gap-2">
                  <Server className="h-4 w-4" />
                  System
                </TabsTrigger>
              </TabsList>

              {/* General Settings Tab */}
              <TabsContent value="general" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      General Settings
                    </CardTitle>
                    <CardDescription>
                      Configure basic platform settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="siteName">Site Name</Label>
                        <Input
                          id="siteName"
                          value={generalSettings.siteName}
                          onChange={(e) =>
                            setGeneralSettings({
                              ...generalSettings,
                              siteName: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="timezone">Timezone</Label>
                        <Select
                          value={generalSettings.timezone}
                          onValueChange={(value) =>
                            setGeneralSettings({
                              ...generalSettings,
                              timezone: value,
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="UTC">UTC</SelectItem>
                            <SelectItem value="EST">Eastern Time</SelectItem>
                            <SelectItem value="PST">Pacific Time</SelectItem>
                            <SelectItem value="GMT">GMT</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="siteDescription">Site Description</Label>
                      <Textarea
                        id="siteDescription"
                        value={generalSettings.siteDescription}
                        onChange={(e) =>
                          setGeneralSettings({
                            ...generalSettings,
                            siteDescription: e.target.value,
                          })
                        }
                        rows={3}
                      />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="language">Default Language</Label>
                        <Select
                          value={generalSettings.language}
                          onValueChange={(value) =>
                            setGeneralSettings({
                              ...generalSettings,
                              language: value,
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="es">Spanish</SelectItem>
                            <SelectItem value="fr">French</SelectItem>
                            <SelectItem value="de">German</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Maintenance Mode</Label>
                          <p className="text-sm text-muted-foreground">
                            Enable maintenance mode to restrict access
                          </p>
                        </div>
                        <Switch
                          checked={generalSettings.maintenanceMode}
                          onCheckedChange={(checked) =>
                            setGeneralSettings({
                              ...generalSettings,
                              maintenanceMode: checked,
                            })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Debug Mode</Label>
                          <p className="text-sm text-muted-foreground">
                            Enable debug mode for development
                          </p>
                        </div>
                        <Switch
                          checked={generalSettings.debugMode}
                          onCheckedChange={(checked) =>
                            setGeneralSettings({
                              ...generalSettings,
                              debugMode: checked,
                            })
                          }
                        />
                      </div>
                    </div>
                    <Button
                      onClick={() => handleSave("general")}
                      disabled={isSaving}
                      className="flex items-center gap-2"
                    >
                      <Save className="h-4 w-4" />
                      {isSaving ? "Saving..." : "Save General Settings"}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Security Settings Tab */}
              <TabsContent value="security" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Security Settings
                    </CardTitle>
                    <CardDescription>
                      Configure security and authentication settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Two-Factor Authentication</Label>
                          <p className="text-sm text-muted-foreground">
                            Require 2FA for all users
                          </p>
                        </div>
                        <Switch
                          checked={securitySettings.twoFactorAuth}
                          onCheckedChange={(checked) =>
                            setSecuritySettings({
                              ...securitySettings,
                              twoFactorAuth: checked,
                            })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>SSL Enforcement</Label>
                          <p className="text-sm text-muted-foreground">
                            Force HTTPS connections
                          </p>
                        </div>
                        <Switch
                          checked={securitySettings.sslEnforcement}
                          onCheckedChange={(checked) =>
                            setSecuritySettings({
                              ...securitySettings,
                              sslEnforcement: checked,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="sessionTimeout">
                          Session Timeout (minutes)
                        </Label>
                        <Input
                          id="sessionTimeout"
                          type="number"
                          value={securitySettings.sessionTimeout}
                          onChange={(e) =>
                            setSecuritySettings({
                              ...securitySettings,
                              sessionTimeout: parseInt(e.target.value),
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="maxLoginAttempts">
                          Max Login Attempts
                        </Label>
                        <Input
                          id="maxLoginAttempts"
                          type="number"
                          value={securitySettings.maxLoginAttempts}
                          onChange={(e) =>
                            setSecuritySettings({
                              ...securitySettings,
                              maxLoginAttempts: parseInt(e.target.value),
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="passwordPolicy">Password Policy</Label>
                      <Select
                        value={securitySettings.passwordPolicy}
                        onValueChange={(value) =>
                          setSecuritySettings({
                            ...securitySettings,
                            passwordPolicy: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weak">
                            Weak (6+ characters)
                          </SelectItem>
                          <SelectItem value="medium">
                            Medium (8+ characters, mixed case)
                          </SelectItem>
                          <SelectItem value="strong">
                            Strong (10+ characters, symbols)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ipWhitelist">
                        IP Whitelist (optional)
                      </Label>
                      <Textarea
                        id="ipWhitelist"
                        value={securitySettings.ipWhitelist}
                        onChange={(e) =>
                          setSecuritySettings({
                            ...securitySettings,
                            ipWhitelist: e.target.value,
                          })
                        }
                        placeholder="Enter IP addresses, one per line"
                        rows={3}
                      />
                    </div>
                    <Button
                      onClick={() => handleSave("security")}
                      disabled={isSaving}
                      className="flex items-center gap-2"
                    >
                      <Save className="h-4 w-4" />
                      {isSaving ? "Saving..." : "Save Security Settings"}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Email Settings Tab */}
              <TabsContent value="email" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="h-5 w-5" />
                      Email Settings
                    </CardTitle>
                    <CardDescription>
                      Configure email server and notification settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="smtpHost">SMTP Host</Label>
                        <Input
                          id="smtpHost"
                          value={emailSettings.smtpHost}
                          onChange={(e) =>
                            setEmailSettings({
                              ...emailSettings,
                              smtpHost: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="smtpPort">SMTP Port</Label>
                        <Input
                          id="smtpPort"
                          type="number"
                          value={emailSettings.smtpPort}
                          onChange={(e) =>
                            setEmailSettings({
                              ...emailSettings,
                              smtpPort: parseInt(e.target.value),
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="smtpUser">SMTP Username</Label>
                        <Input
                          id="smtpUser"
                          value={emailSettings.smtpUser}
                          onChange={(e) =>
                            setEmailSettings({
                              ...emailSettings,
                              smtpUser: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="smtpPassword">SMTP Password</Label>
                        <Input
                          id="smtpPassword"
                          type="password"
                          value={emailSettings.smtpPassword}
                          onChange={(e) =>
                            setEmailSettings({
                              ...emailSettings,
                              smtpPassword: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="fromEmail">From Email</Label>
                        <Input
                          id="fromEmail"
                          value={emailSettings.fromEmail}
                          onChange={(e) =>
                            setEmailSettings({
                              ...emailSettings,
                              fromEmail: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="fromName">From Name</Label>
                        <Input
                          id="fromName"
                          value={emailSettings.fromName}
                          onChange={(e) =>
                            setEmailSettings({
                              ...emailSettings,
                              fromName: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Email Verification</Label>
                          <p className="text-sm text-muted-foreground">
                            Require email verification for new users
                          </p>
                        </div>
                        <Switch
                          checked={emailSettings.emailVerification}
                          onCheckedChange={(checked) =>
                            setEmailSettings({
                              ...emailSettings,
                              emailVerification: checked,
                            })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Email Notifications</Label>
                          <p className="text-sm text-muted-foreground">
                            Send system notifications via email
                          </p>
                        </div>
                        <Switch
                          checked={emailSettings.emailNotifications}
                          onCheckedChange={(checked) =>
                            setEmailSettings({
                              ...emailSettings,
                              emailNotifications: checked,
                            })
                          }
                        />
                      </div>
                    </div>
                    <Button
                      onClick={() => handleSave("email")}
                      disabled={isSaving}
                      className="flex items-center gap-2"
                    >
                      <Save className="h-4 w-4" />
                      {isSaving ? "Saving..." : "Save Email Settings"}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* System Settings Tab */}
              <TabsContent value="system" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Server className="h-5 w-5" />
                      System Settings
                    </CardTitle>
                    <CardDescription>
                      Configure system performance and storage settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="maxFileSize">Max File Size (MB)</Label>
                        <Input
                          id="maxFileSize"
                          type="number"
                          value={systemSettings.maxFileSize}
                          onChange={(e) =>
                            setSystemSettings({
                              ...systemSettings,
                              maxFileSize: parseInt(e.target.value),
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="logRetention">
                          Log Retention (days)
                        </Label>
                        <Input
                          id="logRetention"
                          type="number"
                          value={systemSettings.logRetention}
                          onChange={(e) =>
                            setSystemSettings({
                              ...systemSettings,
                              logRetention: parseInt(e.target.value),
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="allowedFileTypes">
                        Allowed File Types
                      </Label>
                      <Input
                        id="allowedFileTypes"
                        value={systemSettings.allowedFileTypes}
                        onChange={(e) =>
                          setSystemSettings({
                            ...systemSettings,
                            allowedFileTypes: e.target.value,
                          })
                        }
                        placeholder="jpg,jpeg,png,pdf,doc,docx"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="backupFrequency">Backup Frequency</Label>
                      <Select
                        value={systemSettings.backupFrequency}
                        onValueChange={(value) =>
                          setSystemSettings({
                            ...systemSettings,
                            backupFrequency: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hourly">Hourly</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Cache Enabled</Label>
                          <p className="text-sm text-muted-foreground">
                            Enable system caching for better performance
                          </p>
                        </div>
                        <Switch
                          checked={systemSettings.cacheEnabled}
                          onCheckedChange={(checked) =>
                            setSystemSettings({
                              ...systemSettings,
                              cacheEnabled: checked,
                            })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Compression Enabled</Label>
                          <p className="text-sm text-muted-foreground">
                            Enable GZIP compression for faster loading
                          </p>
                        </div>
                        <Switch
                          checked={systemSettings.compressionEnabled}
                          onCheckedChange={(checked) =>
                            setSystemSettings({
                              ...systemSettings,
                              compressionEnabled: checked,
                            })
                          }
                        />
                      </div>
                    </div>
                    <Button
                      onClick={() => handleSave("system")}
                      disabled={isSaving}
                      className="flex items-center gap-2"
                    >
                      <Save className="h-4 w-4" />
                      {isSaving ? "Saving..." : "Save System Settings"}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
