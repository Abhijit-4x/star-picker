"use client";

import { useState } from "react";
import { convertTierToString } from "../utils/tierConverter";

export default function AddStarPage() {
    const [tier, setTier] = useState("");
  const tierOptions = [
    { value: 1, label: convertTierToString(1) }, // S+
    { value: 2, label: convertTierToString(2) }, // S
    { value: 3, label: convertTierToString(3) }, // A
    { value: 4, label: convertTierToString(4) }, // B
    { value: 5, label: convertTierToString(5) }, // C
  ];

  return (
    <main className="flex flex-col items-center pt-[100px] h-[80vh] gap-[40px] ">
      <h1 className="text-2xl font-bold text-[1.5em]">⭐ Add a Star ⭐</h1>
      <form className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="First Name"
          className="p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Last Name"
          className="p-2 border rounded"
        />
        <select
          value={tier}
          onChange={(e) => setTier(e.target.value)}
          className="p-2 border rounded bg-gray-700 text-white focus:outline-none "
          required
        >
          <option value="" disabled>
            Select Tier
          </option>
          {tierOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.value} - {option.label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="text-white px-4 py-2 rounded-2xl outline-[2px] hover:bg-(--bg-gradient-left) ease-in duration-300 cursor-pointer min-w-[230px]"
        >
          Add Star
        </button>
      </form>
    </main>
  );
}
