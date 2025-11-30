"use client";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { getCurrentUser, logout } from "../../utils/auth";
import { useRouter, usePathname } from "next/navigation";
import { CircleUserRound } from "lucide-react";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const menuRef = useRef(null);

  const fetchUser = () => {
    getCurrentUser()
      .then((u) => {
        setUser(u);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchUser();
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowAccountMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    await logout();
    setUser(null);
    setShowAccountMenu(false);
    router.push("/");
  }

  return (
    <nav className="flex items-center justify-between p-[20px]  text-white">
      <Link href="/" className="font-bold rounded-md p-2">
        StarPicker
      </Link>
      <div className="flex gap-[20px] items-center">
        <Link href="/add" className="rounded-md p-2 hover:text-amber-300">
          Add
        </Link>
        <Link href="/update" className="rounded-md p-2 hover:text-amber-300">
          Update
        </Link>
        <Link href="/audit" className="rounded-md p-2 hover:text-amber-300">
          Audit
        </Link>
        <Link href="/search" className="rounded-md p-2 hover:text-amber-300">
          Search
        </Link>
        {user ? (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowAccountMenu(!showAccountMenu)}
              className="p-2 rounded hover:text-amber-300 cursor-pointer"
              title="Account"
            >
              <CircleUserRound className="w-8 h-8" />
            </button>
            {showAccountMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-md shadow-lg py-2 z-50">
                <div className="px-4 py-2 text-sm text-gray-200 border-b border-slate-700">
                  Logged in as{" "}
                  <span className="font-bold">{user.username}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-slate-700 text-red-400 hover:text-red-300 cursor-pointer"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex gap-2">
            <Link href="/login" className="rounded-md p-2 hover:text-amber-300">
              Login
            </Link>
            <Link
              href="/signup"
              className="rounded-md p-2 hover:text-amber-300"
            >
              Sign up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
