"use client";

import { useState } from "react";
import StarForm from "../components/StarForms/StarForm";
import addStar from "../utils/addStar";
import toast from "react-hot-toast";
import ProtectedRoute from "../components/ProtectedRoute";

export default function AddStarPage() {
  const [star, setStar] = useState({ starName: "", tier: 0 });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    const loadingToastId = toast.loading("Adding star..."); // Show loading toast
    setLoading(true); // Set loading state to true
    e.preventDefault();
    console.log("Submitting star:", star);
    try {
      const response = await addStar(star);
      const data = await response.json();
      toast.success(`Star "${data.starName}" added successfully!`);
      setStar({ starName: "", tier: 0 });
    } catch (error) {
      console.error("Error in AddStarPage handleSubmit:", error); // Log for debugging
      if (error.statusCode === 409) {
        // Handle conflict error (e.g., duplicate star name)
        toast.error(`Star with name "${star.starName}" already exists.`, {
          id: loadingToastId,
        });
      } else if (error.statusCode === 400) {
        // Handle bad request error
        toast.error("Invalid input. Please check the star name and tier.", {
          id: loadingToastId,
        });
      } else {
        // Handle other errors
        toast.error(error.message || "An unknown error occurred.", {
          id: loadingToastId,
        });
      }
    } finally {
      setLoading(false); // Reset loading state
      console.log("Submission attempt finished"); // Log for debugging
    }
  };

  return (
    <ProtectedRoute>
      <main className="flex flex-col items-center pt-[100px] h-[80vh] gap-[40px] ">
        <h1 className="text-2xl font-bold text-[1.5em]">⭐ Add a Star ⭐</h1>
        <StarForm star={star} setStar={setStar} handleSubmit={handleSubmit} />
      </main>
    </ProtectedRoute>
  );
}
