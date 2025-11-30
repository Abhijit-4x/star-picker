"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/app/utils/auth";
import toast from "react-hot-toast";

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const toastShownRef = useRef(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          setIsAuthorized(true);
        } else {
          if (!toastShownRef.current) {
            toast.error("You need to login first");
            toastShownRef.current = true;
          }
          router.push("/login");
        }
      } catch (error) {
        console.error("Auth check error:", error);
        if (!toastShownRef.current) {
          toast.error("You need to login first");
          toastShownRef.current = true;
        }
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

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
