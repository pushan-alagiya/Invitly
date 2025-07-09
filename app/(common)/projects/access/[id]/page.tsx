/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { BaseClient } from "@/api/ApiClient";
import { projectEndPoint } from "@/utils/apiEndPoints";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function Page() {
  const params = useParams();
  const router = useRouter();

  const [token, setToken] = useState<string | null>(
    typeof params.id === "string" ? params.id : ""
  );
  const [LinkLoading, setLinkLoading] = useState(false);

  useEffect(() => {
    setToken(typeof params?.id === "string" ? params.id : "");
  }, [params]);

  useEffect(() => {
    const verifyLink = async (token: string) => {
      try {
        setLinkLoading(true);
        const response = await BaseClient.post<any>(
          `${projectEndPoint.addUserAccess}/add-user-permission`,
          {
            token: token,
          }
        );

        if (response?.data?.success) {
          toast.success("Invite link verified successfully");
          router.push("/projects");
        } else {
          if (response?.data?.code === 401) {
            toast.error("User is not logged in");
            router.push("/login");
          } else {
            toast.error(
              response?.data?.message || "Failed to verify invite link"
            );
          }
        }
      } catch (error: any) {
        toast.error(error?.data?.message || "Failed to generate invite link");
        router.push("/projects");
      } finally {
        setLinkLoading(false);
      }
    };

    verifyLink(token || "");
  }, [token]);

  return (
    <div>
      <div className="flex w-full h-full justify-center items-center gap-4 p-4 pt-0 text-gray-300 text-4xl ">
        {LinkLoading ? "Verifying Access...." : "Access Granted"}
      </div>
    </div>
  );
}
