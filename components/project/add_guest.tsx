/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { BaseClient } from "@/api/ApiClient";
import { guestEndPoint } from "@/utils/apiEndPoints";
import { Formik, Form } from "formik";
import * as Yup from "yup";

interface AddGuestDialogProps {
  projectId: number;
  onGuestAdded: () => void;
}

const validationSchema = Yup.object({
  name: Yup.string().required("Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  phone: Yup.string().required("Phone is required"),
  family_members: Yup.number()
    .min(0, "Family members count must be 0 or greater")
    .required("Family members count is required"),
  expected_members: Yup.number()
    .min(0, "Expected members count must be 0 or greater")
    .required("Expected members count is required"),
  extra_info: Yup.string(),
});

export function AddGuestDialog({
  projectId,
  onGuestAdded,
}: AddGuestDialogProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const initialValues = {
    name: "",
    email: "",
    phone: "",
    family_members: 0,
    expected_members: 0,
    extra_info: "",
  };

  const handleSubmit = async (
    values: typeof initialValues,
    { setSubmitting }: any
  ) => {
    try {
      const response = await BaseClient.post<any>(
        `${guestEndPoint.createGuest}/${projectId}`,
        {
          name: values.name,
          email: values.email,
          phone: values.phone,
          family_members: values.family_members,
          expected_members: values.expected_members,
          extra_info: {
            description: values.extra_info,
          },
        }
      );

      if (response?.data?.success) {
        toast.success("Guest added successfully");
        setIsDialogOpen(false);
        onGuestAdded();
      } else {
        toast.error("Failed to add guest");
      }
    } catch (error) {
      console.error("Error adding guest:", error);
      toast.error("Failed to add guest");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Add Guest</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Guest</DialogTitle>
          <DialogDescription>
            Enter guest details below. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            isSubmitting,
          }) => (
            <Form className="space-y-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={values.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="col-span-3"
                />
                {touched.name && errors.name && (
                  <div className="text-red-500 text-sm col-span-4">
                    {errors.name}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="col-span-3"
                />
                {touched.email && errors.email && (
                  <div className="text-red-500 text-sm col-span-4">
                    {errors.email}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">
                  Phone
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  value={values.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="col-span-3"
                />
                {touched.phone && errors.phone && (
                  <div className="text-red-500 text-sm col-span-4">
                    {errors.phone}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="family_members" className="text-left ">
                  Family Members
                </Label>
                <Input
                  id="family_members"
                  name="family_members"
                  type="number"
                  value={values.family_members}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="col-span-3"
                />
                {touched.family_members && errors.family_members && (
                  <div className="text-red-500 text-sm col-span-4">
                    {errors.family_members}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="expected_members" className="text-left">
                  Expected Members
                </Label>
                <Input
                  id="expected_members"
                  name="expected_members"
                  type="number"
                  value={values.expected_members}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="col-span-3"
                />
                {touched.expected_members && errors.expected_members && (
                  <div className="text-red-500 text-sm col-span-4">
                    {errors.expected_members}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="extra_info" className="text-right">
                  Extra Info
                </Label>
                <Textarea
                  id="extra_info"
                  name="extra_info"
                  value={values.extra_info}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="col-span-3"
                  placeholder="Any additional information about the guest..."
                />
                {touched.extra_info && errors.extra_info && (
                  <div className="text-red-500 text-sm col-span-4">
                    {errors.extra_info}
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Adding..." : "Add Guest"}
                </Button>
              </DialogFooter>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
}
