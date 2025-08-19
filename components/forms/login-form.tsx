/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "sonner";
import { loginDetails } from "@/store/slices/auth";
import { useRouter } from "next/navigation";
import { store } from "@/store";

const LoginSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().required("Password is required"),
});

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter();

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: LoginSchema,
    onSubmit: async (values, { setSubmitting, setErrors }) => {
      // Check if user is already logged in and has admin privileges
      const currentState = store.getState();
      if (currentState.auth.userDetails) {
        const currentUserRoles =
          currentState.auth.userDetails?.user?.roles || [];
        const isCurrentUserAdmin = currentUserRoles.some(
          (role: any) =>
            (typeof role === "string" && role === "ADMIN") ||
            (typeof role === "object" &&
              (role.role === "ADMIN" || role.role_name === "ADMIN"))
        );

        if (isCurrentUserAdmin) {
          console.log(
            "User already logged in as admin, redirecting to admin panel"
          );
          router.push("/admin");
          return;
        }
      }
      try {
        const response = await store.dispatch(
          loginDetails({
            email: values.email,
            password: values.password,
            rememberMe: false,
          })
        );

        console.log("Login response:", response);
        console.log("Response payload:", response?.payload);
        console.log("Response data:", response?.payload?.data);
        console.log(
          "Full response structure:",
          JSON.stringify(response, null, 2)
        );
        console.log("Response.data:", response?.data);
        console.log("Response.data.code:", response?.data?.code);
        console.log("Response.data.success:", response?.data?.success);

        // Check for successful response (backend returns code: 200, not status: 200)
        if (response?.data?.code === 200 || response?.data?.success === true) {
          toast.success("Login successful", {
            description: "Welcome back!",
          });

          // Wait a moment for Redux state to update, then check admin privileges
          setTimeout(() => {
            const state = store.getState();
            console.log("Login - Redux state after login:", state.auth);
            console.log("Login - userDetails:", state.auth.userDetails);
            console.log(
              "Login - user roles:",
              state.auth.userDetails?.user?.roles
            );

            const userRoles = state.auth.userDetails?.user?.roles || [];
            const isAdmin = userRoles.some(
              (role: any) =>
                (typeof role === "string" && role === "ADMIN") ||
                (typeof role === "object" &&
                  (role.role === "ADMIN" || role.role_name === "ADMIN"))
            );

            console.log("Login - isAdmin check result:", isAdmin);
            console.log(
              "Login - Role check details:",
              userRoles.map((role: any) => ({
                type: typeof role,
                value: role,
                role: typeof role === "object" ? role.role : null,
                role_name: typeof role === "object" ? role.role_name : null,
              }))
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
            "Login failed";
          toast.error("Login Failed", {
            description: errorMessage,
          });
        }
      } catch (error) {
        console.error("Login error:", error);
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
          toast.error("Failed to Login", {
            description: firstErrorMessage || "Invalid email or password",
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
        <h1 className="text-2xl font-bold">Login to your account</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Enter your email below to login to your account
        </p>
      </div>
      <div className="grid gap-6">
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
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
            <a
              href="#"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Forgot your password?
            </a>
          </div>
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
          Login
        </Button>
      </div>
      <div className="text-center text-sm">
        Don&apos;t have an account?{" "}
        <a href="/signup" className="underline underline-offset-4">
          Sign up
        </a>
      </div>
    </form>
  );
}
