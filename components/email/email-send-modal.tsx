"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Mail,
  Users,
  Smartphone,
  Monitor,
  Tablet,
  Send,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface Guest {
  id: number;
  name: string;
  email: string;
  phone?: string;
  family_members?: number;
}

interface Event {
  id: number;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  location?: string;
  type?: string;
}

interface EmailSendModalProps {
  isOpen: boolean;
  onClose: () => void;
  guests: Guest[];
  event: Event;
  onSend: (
    emailData: EmailData
  ) => Promise<{ successful: number; failed: number }>;
  templateData?: string;
}

interface EmailData {
  subject: string;
  customMessage: string;
  guests: Guest[];
  event: Event;
  templateData?: string;
}

export function EmailSendModal({
  isOpen,
  onClose,
  guests,
  event,
  onSend,
  templateData,
}: EmailSendModalProps) {
  const [subject, setSubject] = useState(`You're invited to ${event.name}!`);
  const [customMessage, setCustomMessage] = useState(
    `Dear {{name}},\n\nWe're excited to invite you to our special event. Please join us for an unforgettable experience.\n\nBest regards,\nThe Event Team`
  );
  const [sending, setSending] = useState(false);
  const [previewGuest, setPreviewGuest] = useState<Guest>(
    guests[0] || {
      id: 0,
      name: "John Doe",
      email: "john@example.com",
    }
  );
  const [previewView, setPreviewView] = useState("desktop");

  // Dynamic variables available for use in custom message
  const dynamicVariables = [
    { variable: "{{name}}", description: "Guest's full name" },
    { variable: "{{email}}", description: "Guest's email address" },
    { variable: "{{phone}}", description: "Guest's phone number" },
    { variable: "{{family_members}}", description: "Number of family members" },
    { variable: "{{event_name}}", description: "Event name" },
    { variable: "{{event_date}}", description: "Event date" },
    { variable: "{{event_time}}", description: "Event time" },
    { variable: "{{event_location}}", description: "Event location" },
  ];

  // Replace dynamic variables in message
  const replaceVariables = (message: string, guest: Guest) => {
    return message
      .replace(/\{\{name\}\}/g, guest.name)
      .replace(/\{\{email\}\}/g, guest.email)
      .replace(/\{\{phone\}\}/g, guest.phone || "Not provided")
      .replace(
        /\{\{family_members\}\}/g,
        (guest.family_members || 0).toString()
      )
      .replace(/\{\{event_name\}\}/g, event.name)
      .replace(
        /\{\{event_date\}\}/g,
        new Date(event.start_date).toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      )
      .replace(
        /\{\{event_time\}\}/g,
        new Date(event.start_date).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        })
      )
      .replace(/\{\{event_location\}\}/g, event.location || "TBD");
  };

  // Generate preview HTML
  const generatePreviewHTML = (guest: Guest) => {
    const processedMessage = replaceVariables(customMessage, guest);
    const eventDate = new Date(event.start_date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const eventTime = new Date(event.start_date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8fafc;
          }
          
          .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
          }
          
          .header h1 {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 10px;
            letter-spacing: -0.5px;
          }
          
          .header p {
            font-size: 16px;
            opacity: 0.9;
          }
          
          .content {
            padding: 40px 30px;
          }
          
          .greeting {
            font-size: 18px;
            color: #374151;
            margin-bottom: 30px;
          }
          
          .custom-message {
            background: #f8fafc;
            border-radius: 8px;
            padding: 25px;
            margin-bottom: 30px;
            border-left: 4px solid #667eea;
            white-space: pre-wrap;
            line-height: 1.6;
            word-wrap: break-word;
            overflow-wrap: break-word;
          }
          
          .event-details {
            background: #f8fafc;
            border-radius: 8px;
            padding: 25px;
            margin-bottom: 30px;
            border-left: 4px solid #667eea;
          }
          
          .event-name {
            font-size: 24px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 15px;
            word-wrap: break-word;
            overflow-wrap: break-word;
          }
          
          .event-description {
            color: #6b7280;
            margin-bottom: 20px;
            line-height: 1.6;
            word-wrap: break-word;
            overflow-wrap: break-word;
          }
          
          .event-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 20px;
          }
          
          .info-item {
            display: flex;
            align-items: center;
            gap: 8px;
            flex-wrap: wrap;
          }
          
          .info-label {
            font-weight: 600;
            color: #374151;
            font-size: 14px;
            white-space: nowrap;
          }
          
          .info-value {
            color: #6b7280;
            font-size: 14px;
            word-wrap: break-word;
            overflow-wrap: break-word;
          }
          
          .template-content {
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 30px;
          }
          
          .template-content h3 {
            color: #1f2937;
            margin-bottom: 15px;
            font-size: 18px;
          }
          
          .action-buttons {
            text-align: center;
            margin-bottom: 30px;
          }
          
          .btn {
            display: inline-block;
            padding: 14px 28px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            font-size: 16px;
            margin: 0 10px;
            transition: all 0.3s ease;
            word-wrap: break-word;
            overflow-wrap: break-word;
          }
          
          .btn-confirm {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
          }
          
          .btn-decline {
            background: #f3f4f6;
            color: #6b7280;
            border: 2px solid #e5e7eb;
          }
          
          .footer {
            background: #f9fafb;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
          }
          
          .footer p {
            color: #6b7280;
            font-size: 14px;
            margin-bottom: 10px;
            word-wrap: break-word;
            overflow-wrap: break-word;
          }
          
          .footer .year {
            color: #9ca3af;
            font-size: 12px;
          }
          
          @media (max-width: 600px) {
            .email-container {
              margin: 10px;
              border-radius: 8px;
            }
            
            .header {
              padding: 30px 20px;
            }
            
            .header h1 {
              font-size: 24px;
            }
            
            .content {
              padding: 30px 20px;
            }
            
            .event-info {
              grid-template-columns: 1fr;
            }
            
            .btn {
              display: block;
              margin: 10px 0;
              width: 100%;
            }
            
            .custom-message {
              padding: 20px;
              font-size: 14px;
            }
            
            .event-name {
              font-size: 20px;
            }
            
            .greeting {
              font-size: 16px;
            }
          }
          
          @media (max-width: 480px) {
            .header {
              padding: 25px 15px;
            }
            
            .header h1 {
              font-size: 20px;
            }
            
            .header p {
              font-size: 14px;
            }
            
            .content {
              padding: 25px 15px;
            }
            
            .custom-message {
              padding: 15px;
              font-size: 13px;
            }
            
            .event-name {
              font-size: 18px;
            }
            
            .greeting {
              font-size: 15px;
            }
            
            .info-item {
              flex-direction: column;
              align-items: flex-start;
              gap: 4px;
            }
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <h1>🎉 You're Invited!</h1>
            <p>We're excited to have you join us for this special event</p>
          </div>
          
          <div class="content">
            <div class="greeting">
              Dear <strong>${guest.name}</strong>,
            </div>
            
            <div class="custom-message">
              ${processedMessage}
            </div>
            
            <div class="event-details">
              <div class="event-name">${event.name}</div>
              <div class="event-description">${event.description}</div>
              
              <div class="event-info">
                <div class="info-item">
                  <span class="info-label">📅 Date:</span>
                  <span class="info-value">${eventDate}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">🕒 Time:</span>
                  <span class="info-value">${eventTime}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">📍 Location:</span>
                  <span class="info-value">${event.location || "TBD"}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">🏷️ Type:</span>
                  <span class="info-value">${event.type || "Event"}</span>
                </div>
              </div>
            </div>
            
            ${
              templateData
                ? `
            <div class="template-content">
              <h3>Event Details</h3>
              <div>${templateData}</div>
            </div>
            `
                : ""
            }
            
            <div class="action-buttons">
              <a href="#" class="btn btn-confirm">
                ✅ Confirm Attendance
              </a>
              <a href="#" class="btn btn-decline">
                ❌ Decline Invitation
              </a>
            </div>
            
            <p style="text-align: center; color: #6b7280; font-size: 14px;">
              Please click one of the buttons above to confirm or decline your attendance.
              <br>
              We look forward to your response!
            </p>
          </div>
          
          <div class="footer">
            <p>This invitation was sent by Invity Events</p>
            <p>If you have any questions, please contact the event organizer</p>
            <p class="year">© ${new Date().getFullYear()} Invity Events. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const handleSend = async () => {
    if (!subject.trim()) {
      toast.error("Please enter a subject for the email");
      return;
    }

    if (!customMessage.trim()) {
      toast.error("Please enter a custom message");
      return;
    }

    setSending(true);
    try {
      const emailData: EmailData = {
        subject: subject.trim(),
        customMessage: customMessage.trim(),
        guests,
        event,
        templateData,
      };

      const result = await onSend(emailData);
      toast.success(
        `Invitations sent successfully! ${result.successful} delivered, ${result.failed} failed.`
      );
      onClose();
    } catch (error) {
      console.error("Error sending invitations:", error);
      toast.error("Failed to send invitations. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById(
      "custom-message"
    ) as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = customMessage;
      const before = text.substring(0, start);
      const after = text.substring(end);
      const newText = before + variable + after;
      setCustomMessage(newText);

      // Set cursor position after the inserted variable
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(
          start + variable.length,
          start + variable.length
        );
      }, 0);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="min-w-[90vw] lg:min-w-[80vw] xl:min-w-[70vw] max-w-none max-h-[95vh] overflow-y-auto p-0">
        <DialogHeader className="p-6">
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Mail className="h-5 w-5" />
            Send Email Invitations
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            Customize your email invitation and preview how it will look to
            recipients.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 lg:gap-6 xl:grid-cols-2 px-6 h-[calc(100vh-350px)] overflow-y-auto">
          {/* Email Configuration */}
          <div className="space-y-4 lg:space-y-6 min-w-0 h-full">
            <div className="space-y-3 lg:space-y-4">
              <div>
                <Label htmlFor="subject" className="text-sm font-medium">
                  Email Subject
                </Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Enter email subject..."
                  className="mt-1 w-full"
                />
              </div>

              <div>
                <Label htmlFor="custom-message" className="text-sm font-medium">
                  Custom Message
                </Label>
                <Textarea
                  id="custom-message"
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Enter your custom message..."
                  rows={6}
                  className="mt-1 w-full resize-none"
                />
              </div>

              <div>
                <Label className="text-sm font-medium">Dynamic Variables</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-2 mt-2">
                  {dynamicVariables.map((variable) => (
                    <Button
                      key={variable.variable}
                      variant="outline"
                      size="sm"
                      onClick={() => insertVariable(variable.variable)}
                      className="text-xs justify-start h-auto py-2 px-3 w-full"
                    >
                      <code className="mr-2 text-xs whitespace-nowrap">
                        {variable.variable}
                      </code>
                      <span className="text-muted-foreground text-xs truncate">
                        {variable.description}
                      </span>
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Recipients */}
            <div>
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Users className="h-4 w-4" />
                Recipients ({guests.length})
              </Label>
              <div className="mt-2 max-h-[20vh] overflow-y-auto space-y-2 border rounded-md p-2">
                {guests.map((guest) => (
                  <div
                    key={guest.id}
                    className="flex items-center justify-between p-2 border rounded text-sm"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate">{guest.name}</div>
                      <div className="text-muted-foreground text-xs truncate">
                        {guest.email}
                      </div>
                    </div>
                    <Badge variant="outline" className="ml-2 text-xs shrink-0">
                      {guest.family_members || 0} members
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Preview Guest Selector */}
            <div>
              <Label className="text-sm font-medium">Preview as Guest</Label>
              <select
                value={previewGuest.id}
                onChange={(e) => {
                  const guest = guests.find(
                    (g) => g.id === Number(e.target.value)
                  );
                  if (guest) setPreviewGuest(guest);
                }}
                className="w-full mt-2 p-2 border rounded text-sm"
              >
                {guests.map((guest) => (
                  <option key={guest.id} value={guest.id}>
                    {guest.name} ({guest.email})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Email Preview */}
          <div className="space-y-4 min-w-0 h-full flex flex-col">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <Tabs
                value={previewView}
                onValueChange={setPreviewView}
                className="w-full h-full flex flex-col "
              >
                <TabsList className="grid w-full grid-cols-3 h-10">
                  <TabsTrigger
                    value="desktop"
                    className="flex items-center gap-1 text-xs"
                  >
                    <Monitor className="h-3 w-3" />
                    <span className="text-xs">Desktop</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="tablet"
                    className="flex items-center gap-1 text-xs"
                  >
                    <Tablet className="h-3 w-3" />
                    <span className="text-xs">Tablet</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="mobile"
                    className="flex items-center gap-1 text-xs"
                  >
                    <Smartphone className="h-3 w-3" />
                    <span className="text-xs">Mobile</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="desktop" className="mt-4 flex-1 h-full">
                  <div className="border rounded-lg overflow-hidden bg-gray-50 h-full flex flex-col">
                    <div className="bg-gray-100 p-2 text-xs text-gray-600 sticky top-0 z-10">
                      Desktop View (600px)
                    </div>
                    <div className="flex justify-center bg-white py-2 flex-1 h-full overflow-auto">
                      <div
                        className="bg-white shadow-lg h-full"
                        style={{
                          minWidth: "600px",
                          maxWidth: "100%",
                          transform: "scale(0.75)",
                          transformOrigin: "top center",
                        }}
                      >
                        <iframe
                          srcDoc={generatePreviewHTML(previewGuest)}
                          className="w-full"
                          style={{ height: "635px", border: "none" }}
                          title="Email Preview"
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="tablet" className="mt-4 flex-1 h-full">
                  <div className="border rounded-lg overflow-hidden bg-gray-50 h-full flex flex-col">
                    <div className="bg-gray-100 p-2 text-xs text-gray-600 sticky top-0 z-10">
                      Tablet View (768px)
                    </div>
                    <div className="flex justify-center bg-white py-2 flex-1 overflow-auto">
                      <div
                        className="bg-white shadow-lg"
                        style={{
                          minWidth: "768px",
                          maxWidth: "100%",
                          transform: "scale(0.65)",
                          transformOrigin: "top center",
                        }}
                      >
                        <iframe
                          srcDoc={generatePreviewHTML(previewGuest)}
                          className="w-full"
                          style={{ height: "600px", border: "none" }}
                          title="Email Preview"
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="mobile" className="mt-4 flex-1 h-full">
                  <div className="border rounded-lg overflow-hidden bg-gray-50 h-full flex flex-col">
                    <div className="bg-gray-100 p-2 text-xs text-gray-600 sticky top-0 z-10">
                      Mobile View (375px)
                    </div>
                    <div className="flex justify-center bg-white py-2 flex-1 overflow-auto">
                      <div
                        className="bg-white shadow-lg"
                        style={{
                          minWidth: "375px",
                          maxWidth: "100%",
                          transform: "scale(0.85)",
                          transformOrigin: "top center",
                        }}
                      >
                        <iframe
                          srcDoc={generatePreviewHTML(previewGuest)}
                          className="w-full"
                          style={{ height: "600px", border: "none" }}
                          title="Email Preview"
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-4 border-t mt-6 p-6">
          <div className="flex flex-col sm:flex-row gap-2 w-full">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={sending}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSend}
              disabled={sending}
              className="w-full sm:w-auto"
            >
              {sending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Invitations
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
