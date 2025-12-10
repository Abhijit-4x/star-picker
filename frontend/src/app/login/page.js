"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { login } from "../utils/auth";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [loginValue, setLoginValue] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [requiresVerification, setRequiresVerification] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoadingResend, setIsLoadingResend] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    const res = await login({ login: loginValue, password });
    if (res && res.user) {
      router.push("/");
      router.refresh();
    } else if (res && res.requiresVerification) {
      // User exists but email not verified
      setRequiresVerification(true);
      setUnverifiedEmail(res.email);
      setError(null);
    } else {
      setError(res.error || "Login failed");
    }
  }

  async function handleResendOtp() {
    setIsLoadingResend(true);
    const toastId = toast.loading("Resending OTP...");
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/resend-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: unverifiedEmail }),
          credentials: "include",
        }
      );
      const data = await response.json();
      if (response.ok) {
        toast.success("OTP sent to your email", { id: toastId });
        setError(null);
      } else {
        toast.error(data.error || "Failed to resend OTP", { id: toastId });
      }
    } catch (err) {
      toast.error("Failed to resend OTP", { id: toastId });
    } finally {
      setIsLoadingResend(false);
    }
  }

  async function handleVerifyOtp(e) {
    e.preventDefault();
    setError(null);
    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    const toastId = toast.loading("Verifying OTP...");
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/verify-email`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: unverifiedEmail, otp }),
          credentials: "include",
        }
      );
      const data = await response.json();
      if (response.ok) {
        toast.success("Email verified! Logging in...", { id: toastId });
        setRequiresVerification(false);
        setOtp("");
        setLoginValue("");
        setPassword("");
        router.push("/");
        router.refresh();
      } else {
        toast.error(data.error || "Invalid OTP", { id: toastId });
        setError(data.error || "Invalid OTP");
      }
    } catch (err) {
      toast.error("Verification failed", { id: toastId });
      setError("Verification failed");
    }
  }

  if (requiresVerification) {
    return (
      <main className="flex flex-col items-center pt-[80px] h-[80vh] gap-[40px]">
        <h1 className="text-2xl font-bold text-[1.5em]">Verify Email</h1>
        <div className="flex flex-col gap-4">
          <p className="text-gray-300 text-center">
            Your email is not verified yet.
          </p>
          <p className="text-gray-300 text-center">Enter the OTP sent to:</p>
          <p className="text-amber-300 font-bold text-center">
            {unverifiedEmail}
          </p>
          <p className="text-gray-400 text-sm text-center">
            OTP expires in 10 minutes
          </p>

          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
            <input
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              placeholder="000000"
              maxLength="6"
              className="p-2 border rounded text-center text-2xl tracking-widest"
              required
            />
            <button className="text-white px-4 py-2 rounded-2xl outline-[2px] hover:bg-(--bg-gradient-left) ease-in duration-300 cursor-pointer min-w-[230px]">
              Verify Email
            </button>
            {error && <div className="text-red-400 text-center">{error}</div>}
          </form>

          <button
            onClick={handleResendOtp}
            disabled={isLoadingResend}
            className="text-amber-300 hover:text-amber-200 text-sm disabled:opacity-50"
          >
            {isLoadingResend ? "Resending..." : "Didn't receive OTP? Resend"}
          </button>

          <button
            onClick={() => {
              setRequiresVerification(false);
              setOtp("");
              setError(null);
              setUnverifiedEmail("");
              setLoginValue("");
              setPassword("");
            }}
            className="text-gray-400 hover:text-gray-200 text-sm"
          >
            Back to login
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col items-center pt-[80px] h-[80vh] gap-[40px]">
      <h1 className="text-2xl font-bold text-[1.5em]">Login</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          value={loginValue}
          onChange={(e) => setLoginValue(e.target.value)}
          placeholder="Username or Email"
          className="p-2 border rounded"
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          type="password"
          className="p-2 border rounded"
        />
        <button className="text-white px-4 py-2 rounded-2xl outline-[2px] hover:bg-(--bg-gradient-left) ease-in duration-300 cursor-pointer min-w-[230px]">
          Login
        </button>
        {error && <div className="text-red-400 text-center">{error}</div>}
      </form>
      <div className="text-gray-400">
        Don't have an account?{" "}
        <Link
          href="/signup"
          className="text-amber-300 hover:text-amber-200 font-bold"
        >
          Sign up here
        </Link>
      </div>
    </main>
  );
}
