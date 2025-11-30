"use client";

import { useState } from "react";
import StarCard from "./components/StarCard/starcard";
import ProtectedRoute from "./components/ProtectedRoute";

export default function Home() {
  const [star, setStar] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchStar = async () => {
    setLoading(true);
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/random-star`,
      {
        method: "GET",
      }
    );
    const data = await res.json();
    setStar(data);
    setLoading(false);
  };

  return (
    <ProtectedRoute>
      <main className="flex flex-col items-center pt-[100px] h-[80vh] gap-[40px] ">
        <h1 className="text-2xl font-bold text-[1.5em]">
          ⭐ Welcome to Star Picker ⭐
        </h1>
        <button
          onClick={fetchStar}
          className="text-white px-4 py-2 rounded-2xl outline-[2px] hover:bg-(--bg-gradient-left) ease-in duration-300 cursor-pointer min-w-[230px]"
        >
          {loading ? "Picking..." : "Pick a Star"}
        </button>
        {star && (
          <div className="mt-4">
            <StarCard star={star} />
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}
