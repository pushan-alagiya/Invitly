/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "sonner";
import { registerUser } from "@/store/slices/auth";
import { useRouter } from "next/navigation";
import { store } from "@/store";

const SignUpSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Name must be at least 2 characters")
    .required("Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .matches(/[a-zA-Z]/, "Password must contain at least one letter")
    .matches(/[0-9]/, "Password must contain at least one number")
    .matches(
      /[^a-zA-Z0-9]/,
      "Password must contain at least one special character"
    )
    .required("Password is required"),
});

export function SignUpForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter();

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
    },
    validationSchema: SignUpSchema,
    onSubmit: async (values, { setSubmitting, setErrors }) => {
      try {
        const response = await store.dispatch(
          registerUser({
            name: values.name,
            email: values.email,
            password: values.password,
          })
        );

        // Check for successful response (backend returns code: 200, not status: 200)
        if (response?.data?.code === 200 || response?.data?.success === true) {
          toast.success("Registration successful", {
            description: "User registered successfully.",
          });

          // Wait a moment for Redux state to update, then check admin privileges
          setTimeout(() => {
            const state = store.getState();
            const userRoles = state.auth.userDetails?.user?.roles || [];
            const isAdmin = userRoles.some(
              (role: any) =>
                (typeof role === "string" && role === "ADMIN") ||
                (typeof role === "object" &&
                  (role.role === "ADMIN" || role.role_name === "ADMIN"))
            );

            if (isAdmin) {
              console.log("Admin user detected, redirecting to admin panel");
              router.push("/admin");
            } else {
              console.log("Regular user, redirecting to projects");
              router.push("/projects");
            }
          }, 100);
        } else {
          // Handle error response
          const errorMessage =
            response?.data?.message ||
            response?.data?.errors?.default ||
            "Registration failed";
          toast.error("Registration Failed", {
            description: errorMessage,
          });
        }
      } catch (error) {
        console.error("Registration error:", error);
        if (error instanceof Yup.ValidationError) {
          const errors: { [key: string]: string } = {};
          error.inner.forEach((err) => {
            if (err.path) errors[err.path] = err.message;
          });
          setErrors(errors);
        } else {
          const firstErrorKey = Object.keys(
            (error as any)?.data?.errors || {}
          )[0];
          const firstErrorMessage = (error as any)?.data?.errors?.[
            firstErrorKey
          ];
          toast.error("Failed to Register", {
            description: firstErrorMessage || "Failed to register user",
          });
        }
      }

      setSubmitting(false);
    },
  });

  return (
    <form
      onSubmit={formik.handleSubmit}
      className={cn("flex flex-col gap-6", className)}
      {...props}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Register your account</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Enter your information below to register your account
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="Pushan Alagiya"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.name}
          />
          {formik.touched.name && formik.errors.name && (
            <p className="text-red-500 text-sm">{formik.errors.name}</p>
          )}
        </div>
        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="m@example.com"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.email}
          />
          {formik.touched.email && formik.errors.email && (
            <p className="text-red-500 text-sm">{formik.errors.email}</p>
          )}
        </div>
        <div className="grid gap-3">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.password}
          />
          {formik.touched.password && formik.errors.password && (
            <p className="text-red-500 text-sm">{formik.errors.password}</p>
          )}
        </div>
        <Button type="submit" className="w-full">
          Sign Up
        </Button>
      </div>
      <div className="text-center text-sm">
        Already have an account?{" "}
        <a href="/login" className="underline underline-offset-4">
          Login
        </a>
      </div>
    </form>
  );
}
