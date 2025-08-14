"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import { useLoginMutation } from "@/store/auth/authApiSlice";
import { setCredentials, setLoading, setError } from "@/store/auth/authSlice";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import Image from "next/image";
import csalogo from "../../../public/assets/csa-logo.jpg";
import { Button } from "@/components/ui/button";
import toast, { Toaster } from "react-hot-toast";

interface LoginFormInputs {
  email: string;
  password: string;
}

const schema = Yup.object({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string().required("Password is required"),
});

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAppSelector(
    (state) => state.auth
  );
  const [login, { isLoading }] = useLoginMutation();

  // Redirect if already logged in
  useEffect(() => {
    if (user && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [user, isAuthenticated, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({ resolver: yupResolver(schema) });

  const onSubmit = async (data: LoginFormInputs) => {
    dispatch(setLoading(true));
    const toastId = toast.loading("Logging in...");

    try {
      console.log("Attempting login with:", { email: data.email });

      const response = await login({
        email: data.email.trim(),
        password: data.password,
      }).unwrap();

      console.log("Login response:", response);

      if (!response?.token) {
        console.error("No token in response");
        throw {
          status: 401,
          message: "Authentication failed: No token received",
        };
      }

      if (!response.user) {
        console.error("No user data in response");
        throw {
          status: 500,
          message: "Authentication failed: Incomplete user data",
        };
      }

      // Ensure user has a role
      const userWithRole = {
        ...response.user,
        role: response.user.role || "user",
      };

      dispatch(
        setCredentials({
          token: response.token,
          user: userWithRole,
          isAuthenticated: true,
        })
      );

      // Ensure auth state is settled and loading cleared before navigating
      dispatch(setLoading(false));

      toast.success("Welcome back! Redirecting...", { id: toastId });

      // Give React a short tick to render the logged-in state, then navigate
      setTimeout(() => {
        try {
          router.replace("/dashboard");
        } catch (e) {
          console.error("Router replace failed after login:", e);
        }
      }, 150);
    } catch (err: any) {
      console.error("Login error:", err);

      let errorMessage = "Login failed. Please try again.";

      // Handle different error structures
      if (err?.data?.message) {
        errorMessage = err.data.message;
      } else if (err?.error) {
        errorMessage = err.error;
      } else if (err?.message) {
        errorMessage = err.message;
      } else if (err?.status === "FETCH_ERROR") {
        errorMessage =
          "Unable to connect to the server. Please check your internet connection.";
      } else if (err?.status === 401) {
        errorMessage = "Invalid email or password. Please try again.";
      } else if (err?.originalStatus === 401) {
        errorMessage = "Invalid email or password. Please try again.";
      } else if (err?.status) {
        errorMessage = `Server error (${err.status}). Please try again later.`;
      }

      console.error("Login error message:", errorMessage);
      toast.error(errorMessage, {
        id: toastId,
        duration: 5000, // Show for 5 seconds
      });

      dispatch(setError(errorMessage));
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#fff",
            color: "#1f2937",
            borderRadius: "0.5rem",
            padding: "1rem",
          },
        }}
      />

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 p-4">
        <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md">
          {/* Logo & Title */}
          <div className="flex flex-col items-center mb-8">
            <Image
              src={csalogo}
              alt="CSA Logo"
              width={100}
              height={100}
              className="mb-4"
            />
            <p className="text-2xl font-bold text-gray-900 text-center">
              CSA Attendance Management System
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="Enter your email"
                {...register("email")}
                className={`block w-full px-4 py-3 border ${
                  errors.email ? "border-red-300" : "border-gray-300"
                } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                disabled={isLoading || loading}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                {...register("password")}
                className={`block w-full px-4 py-3 border ${
                  errors.password ? "border-red-300" : "border-gray-300"
                } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                disabled={isLoading || loading}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading || loading}
              className="w-full flex justify-center"
            >
              {isLoading || loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 
                      0 0 5.373 0 12h4zm2 5.291A7.962 
                      7.962 0 014 12H0c0 3.042 1.135 
                      5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}
