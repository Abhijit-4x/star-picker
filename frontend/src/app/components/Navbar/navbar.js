"use client";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { getCurrentUser, logout, getUserStats } from "../../utils/auth";
import { useRouter, usePathname } from "next/navigation";
import { CircleUserRound } from "lucide-react";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [userStats, setUserStats] = useState(null);
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

  const fetchUserStats = async () => {
    try {
      const stats = await getUserStats();
      setUserStats(stats);
    } catch (error) {
      console.error("Failed to fetch user stats:", error);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [pathname]);

  useEffect(() => {
    // Listen for custom event to clear user stats
    const handleClearStats = () => {
      setUserStats(null);
    };
    window.addEventListener("clearUserStats", handleClearStats);
    return () => window.removeEventListener("clearUserStats", handleClearStats);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowAccountMenu(false);
        //TODO: for admin users, show an option to view all users details.
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAccountMenuClick = () => {
    setShowAccountMenu(!showAccountMenu);
    if (!showAccountMenu) {
      fetchUserStats();
    }
  };

  async function handleLogout() {
    await logout();
    setUser(null);
    setShowAccountMenu(false);
    setUserStats(null);
    router.push("/login");
    router.refresh();
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
        <Link href="/audit" className="rounded-md p-2 hover:text-amber-300">
          Audit
        </Link>
        {user?.role === "admin" && (
          <>
            <Link
              href="/update"
              className="rounded-md p-2 hover:text-amber-300"
            >
              Update
            </Link>
          </>
        )}
        <Link href="/search" className="rounded-md p-2 hover:text-amber-300">
          Search
        </Link>
        {user ? (
          <div className="relative" ref={menuRef}>
            <button
              onClick={handleAccountMenuClick}
              className="p-2 rounded hover:text-amber-300 cursor-pointer"
              title="Account"
            >
              <CircleUserRound className="w-8 h-8" />
            </button>
            {showAccountMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-slate-800 rounded-md shadow-lg py-2 z-50">
                <div className="px-4 py-2 text-sm text-gray-200 border-b border-slate-700">
                  Logged in as{" "}
                  <span className="font-bold">{user.username}</span>
                </div>
                {userStats && (
                  <div className="px-4 py-3 border-b border-slate-700 space-y-2">
                    <div className="text-sm text-gray-300">
                      <div>
                        Total Stars:{" "}
                        <span className="font-semibold">
                          {userStats.totalStars}
                        </span>
                      </div>
                      <div>
                        Cached Stars:{" "}
                        <span className="font-semibold">
                          {userStats.cachedStars}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        router.push("/cached-stars");
                        setShowAccountMenu(false);
                      }}
                      className="w-full px-3 py-1 text-sm bg-amber-600 hover:bg-amber-700 rounded transition-colors text-white cursor-pointer"
                    >
                      View Cached Stars
                    </button>
                  </div>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-slate-700 text-red-400 hover:text-red-300 cursor-pointer"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </nav>
  );
}
