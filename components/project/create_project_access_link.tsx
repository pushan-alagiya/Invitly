/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Separator } from "../ui/separator";
import { Check } from "lucide-react";
import { set } from "date-fns";

interface GrantLinkAccessDialogProps {
  onGenerate: (permission: string) => any;
  setPermission: (permission: number) => void;
  linkLoading?: boolean;
}

export function GrantLinkAccessDialog({
  onGenerate,
  setPermission,
  linkLoading,
}: GrantLinkAccessDialogProps) {
  const [accessType, setAccessType] = useState<string>("1");
  const [generatedLink, setGeneratedLink] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLinkGenerated, setIsLinkGenerated] = useState(false);

  const generateLink = async () => {
    setPermission(Number(accessType));
    try {
      const link = await onGenerate(accessType);
      setIsLinkGenerated(true);
      setGeneratedLink(link);
    } catch (error) {
      toast.error("Failed to generate link");
      setIsLinkGenerated(false);
    }
  };

  const copyToClipboard = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      toast.success("Link copied to clipboard");
    }
  };

  useEffect(() => {
    setGeneratedLink("");
    setIsLinkGenerated(false);
  }, [accessType]);

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="default">Grant Link Access</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Grant Access</DialogTitle>
          <DialogDescription>
            Select access permissions and generate a link to share.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex justify-between items-center ">
            <div className="flex gap-2 items-center">
              <Label htmlFor="access" className="text-right">
                Access:
              </Label>
              <Select
                value={accessType}
                onValueChange={(value) => {
                  setAccessType(value);
                  setPermission(Number(value));
                }}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select access" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Read</SelectItem>
                  <SelectItem value="2">Write</SelectItem>
                  <SelectItem value="3">Edit</SelectItem>
                  <SelectItem value="7">Add Guests</SelectItem>
                  <SelectItem value="9">Delete Guests</SelectItem>
                  <SelectItem value="10">Manage Events</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={generateLink} disabled={linkLoading}>
              Generate Link
              {isLinkGenerated && <Check className="ml-2" />}
            </Button>
          </div>

          {generatedLink && <Separator />}
          {generatedLink && (
            <div className="flex items-center gap-2">
              <Input value={generatedLink} readOnly className="flex-1" />
              <Button onClick={copyToClipboard}>Copy</Button>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            variant="secondary"
            onClick={() => {
              // Close the dialog
              setIsDialogOpen(false);
            }}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
