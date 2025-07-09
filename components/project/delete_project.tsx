/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
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
import { BaseClient } from "@/api/ApiClient";
import { projectEndPoint } from "@/utils/apiEndPoints";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { projectChange } from "@/store/slices/project";
import { Trash2 } from "lucide-react";

interface DeleteProjectDialogProps {
  projectId: number;
}

export function DeleteProjectDialog({ projectId }: DeleteProjectDialogProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const dispatch = useDispatch();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await BaseClient.delete<any>(
        `${projectEndPoint?.deleteProject}/${projectId}`
      );

      if (response.data.success) {
        toast.success("Project deleted successfully", {});
        dispatch(projectChange());
        setIsDialogOpen(false); // Close the dialog
      }
    } catch (error) {
      console.log("Error:", error);
      toast.error("Failed to delete project");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
          <Trash2 size={16} className="text-red-700" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Delete Project</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this project? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsDialogOpen(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
