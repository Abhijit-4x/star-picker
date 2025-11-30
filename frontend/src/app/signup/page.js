"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signup, verifyEmail } from "../utils/auth";
import toast from "react-hot-toast";

function validateEmailDomain(email) {
  const lower = (email || "").toLowerCase();
  return (
    /@gmail\.com$/.test(lower) ||
    /@(outlook|hotmail|live|microsoft)\.com$/.test(lower)
  );
}

export default function SignupPage() {
  const [step, setStep] = useState(1); // Step 1: Register, Step 2: Verify OTP
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleSignup(e) {
    e.preventDefault();
    setError(null);

    if (!validateEmailDomain(email))
      return setError("Email must be a Gmail or Microsoft email");

    setIsLoading(true);
    const loadingToastId = toast.loading("Creating account...");

    try {
      const res = await signup({ username, email, password });
      if (res && res.message) {
        toast.success("Check your email for OTP", { id: loadingToastId });
        setStep(2); // Move to OTP verification step
      } else {
        toast.error(res.error || "Signup failed", { id: loadingToastId });
        setError(res.error || "Signup failed");
      }
    } catch (err) {
      console.error("Signup error:", err);
      toast.error("An error occurred during signup", { id: loadingToastId });
      setError("An error occurred during signup");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleVerifyOtp(e) {
    e.preventDefault();
    setError(null);

    if (!otp || otp.length !== 6) {
      return setError("Please enter a valid 6-digit OTP");
    }

    setIsLoading(true);
    const loadingToastId = toast.loading("Verifying email...");

    try {
      const res = await verifyEmail({ email, otp });
      if (res && res.user) {
        toast.success("Email verified successfully!", { id: loadingToastId });
        router.push("/");
        router.refresh();
      } else {
        toast.error(res.error || "Verification failed", { id: loadingToastId });
        setError(res.error || "Verification failed");
      }
    } catch (err) {
      console.error("Verification error:", err);
      toast.error("An error occurred during verification", {
        id: loadingToastId,
      });
      setError("An error occurred during verification");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex flex-col items-center pt-[100px] h-[80vh] gap-[40px]">
      <h1 className="text-2xl font-bold text-[1.5em]">Sign Up</h1>

      {step === 1 ? (
        <form onSubmit={handleSignup} className="flex flex-col gap-4">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="p-2 border rounded"
            required
          />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="p-2 border rounded"
            required
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            type="password"
            className="p-2 border rounded"
            required
          />
          <button
            disabled={isLoading}
            className="text-white px-4 py-2 rounded-2xl outline-[2px] hover:bg-(--bg-gradient-left) ease-in duration-300 cursor-pointer min-w-[230px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Creating..." : "Sign up"}
          </button>
          {error && <div className="text-red-400 text-center">{error}</div>}
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
          <p className="text-gray-300">Enter the 6-digit OTP sent to:</p>
          <p className="text-amber-300 font-bold text-center">{email}</p>
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
          <button
            disabled={isLoading}
            className="text-white px-4 py-2 rounded-2xl outline-[2px] hover:bg-(--bg-gradient-left) ease-in duration-300 cursor-pointer min-w-[230px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Verifying..." : "Verify Email"}
          </button>
          <button
            type="button"
            onClick={() => {
              setStep(1);
              setOtp("");
              setError(null);
            }}
            className="text-gray-400 hover:text-gray-200 text-sm"
          >
            Back to signup
          </button>
          {error && <div className="text-red-400 text-center">{error}</div>}
        </form>
      )}
    </main>
  );
}
