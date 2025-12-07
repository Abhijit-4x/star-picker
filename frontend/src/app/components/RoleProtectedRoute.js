"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/app/utils/auth";
import toast from "react-hot-toast";
import { AUTH_MESSAGES } from "@/app/constants/messages";

export default function RoleProtectedRoute({
  children,
  requiredRole = "admin",
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const toastShownRef = useRef(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser();
        if (user && user.role === requiredRole) {
          setIsAuthorized(true);
        } else if (user) {
          // User exists but doesn't have required role
          if (!toastShownRef.current) {
            toast.error(AUTH_MESSAGES.ADMIN_REQUIRED);
            toastShownRef.current = true;
          }
          router.push("/");
        } else {
          // User not logged in
          if (!toastShownRef.current) {
            toast.error(AUTH_MESSAGES.LOGIN_REQUIRED);
            toastShownRef.current = true;
          }
          router.push("/login");
        }
      } catch (error) {
        console.error("Auth check error:", error);
        if (!toastShownRef.current) {
          toast.error(AUTH_MESSAGES.LOGIN_REQUIRED);
          toastShownRef.current = true;
        }
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router, requiredRole]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return children;
}
