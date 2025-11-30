"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { login } from "../utils/auth";

export default function LoginPage() {
  const [loginValue, setLoginValue] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    const res = await login({ login: loginValue, password });
    if (res && res.user) {
      router.push("/");
      router.refresh();
    } else {
      setError(res.error || "Login failed");
    }
  }

  return (
    <main className="flex flex-col items-center pt-[100px] h-[80vh] gap-[40px]">
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
