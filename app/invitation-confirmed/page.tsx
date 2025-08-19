"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, AlertCircle, Mail } from "lucide-react";
import Link from "next/link";

export default function InvitationConfirmedPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const statusParam = searchParams.get("status");
    setStatus(statusParam || "error");
    setLoading(false);
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Processing your response...</p>
        </div>
      </div>
    );
  }

  const getStatusContent = () => {
    switch (status) {
      case "confirmed":
        return {
          icon: <CheckCircle className="h-16 w-16 text-green-600" />,
          title: "Invitation Confirmed!",
          message:
            "Thank you for confirming your attendance. We're excited to see you at the event!",
          color: "text-green-600",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
        };
      case "declined":
        return {
          icon: <XCircle className="h-16 w-16 text-red-600" />,
          title: "Invitation Declined",
          message:
            "We understand you won't be able to attend. Thank you for letting us know.",
          color: "text-red-600",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
        };
      default:
        return {
          icon: <AlertCircle className="h-16 w-16 text-yellow-600" />,
          title: "Something went wrong",
          message:
            "We couldn't process your response. Please try again or contact the event organizer.",
          color: "text-yellow-600",
          bgColor: "bg-yellow-50",
          borderColor: "border-yellow-200",
        };
    }
  };

  const content = getStatusContent();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">{content.icon}</div>
          <CardTitle className={`text-2xl font-bold ${content.color}`}>
            {content.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <p className="text-gray-600 leading-relaxed">{content.message}</p>

          <div
            className={`p-4 rounded-lg ${content.bgColor} border ${content.borderColor}`}
          >
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <Mail className="h-4 w-4" />
              <span>A confirmation email has been sent to your inbox</span>
            </div>
          </div>

          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/">Return to Home</Link>
            </Button>

            {status === "confirmed" && (
              <p className="text-sm text-gray-500">
                You can add this event to your calendar or contact the organizer
                for more details.
              </p>
            )}

            {status === "declined" && (
              <p className="text-sm text-gray-500">
                If your plans change, please contact the event organizer.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
