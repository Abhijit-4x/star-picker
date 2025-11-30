"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signup } from "../utils/auth";

function validateEmailDomain(email) {
  const lower = (email || "").toLowerCase();
  return (
    /@gmail\.com$/.test(lower) ||
    /@(outlook|hotmail|live|microsoft)\.com$/.test(lower)
  );
}

export default function SignupPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    if (!validateEmailDomain(email))
      return setError("Email must be a Gmail or Microsoft email");
    const res = await signup({ username, email, password });
    if (res && res.user) {
      router.push("/");
    } else {
      setError(res.error || "Signup failed");
    }
  }

  return (
    <main className="flex flex-col items-center pt-[100px] h-[80vh] gap-[40px]">
      <h1 className="text-2xl font-bold text-[1.5em]">Sign Up</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          className="p-2 border rounded"
        />
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
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
          Sign up
        </button>
        {error && <div className="text-red-400 text-center">{error}</div>}
      </form>
    </main>
  );
}
