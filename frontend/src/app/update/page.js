"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import RealtimeSearchBar from "../components/SearchBar/realtimesearchbar";
import UpdateStarForm from "../components/StarForms/UpdateStarForm";
import searchStars from "../utils/searchStars";
import updateStar from "../utils/updateStar";
import toast from "react-hot-toast";

export default function UpdatePage() {
  const searchParams = useSearchParams();
  const [searchKey, setSearchKey] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedStar, setSelectedStar] = useState(null);
  const [formData, setFormData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check if star data is passed via URL params
  useEffect(() => {
    const starParam = searchParams.get("star");
    if (starParam) {
      try {
        const starData = JSON.parse(decodeURIComponent(starParam));
        setSelectedStar(starData);
        setFormData({
          starName: starData.starName,
          tier: starData.tier,
        });
      } catch (error) {
        console.error("Error parsing star data from URL:", error);
      }
    }
  }, [searchParams]);

  const handleSearchChange = async (key) => {
    if (key.trim() === "") {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      console.log("Searching for:", key);
      const response = await searchStars(key);
      setSearchResults(response);
    } catch (error) {
      console.error("Error searching stars:", error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResultSelect = (star) => {
    console.log("Selected star:", star);
    setSelectedStar(star);
    setFormData({
      starName: star.starName,
      tier: star.tier,
    });
    setSearchKey("");
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStar || !formData) return;

    setIsLoading(true);
    const loadingToastId = toast.loading("Updating star...");

    try {
      await updateStar(selectedStar._id, formData);
      toast.success(`Star "${formData.starName}" updated successfully!`, {
        id: loadingToastId,
      });
      setSelectedStar(null);
      setFormData(null);
    } catch (error) {
      console.error("Error updating star:", error);
      if (error.statusCode === 409) {
        toast.error(`Star with name "${formData.starName}" already exists.`, {
          id: loadingToastId,
        });
      } else if (error.statusCode === 400) {
        toast.error("Invalid input. Please check the star name and tier.", {
          id: loadingToastId,
        });
      } else {
        toast.error(error.message || "An error occurred while updating.", {
          id: loadingToastId,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center pt-[100px] h-[80vh] gap-[34px]">
      <h1 className="text-2xl font-bold text-[1.5em]">Update Star</h1>

      {!selectedStar ? (
        <>
          <RealtimeSearchBar
            searchKey={searchKey}
            setSearchKey={setSearchKey}
            onSearchChange={handleSearchChange}
            searchResults={searchResults}
            onResultSelect={handleResultSelect}
          />
          <p className="text-gray-500">Search and select a star to update</p>
        </>
      ) : (
        <>
          <div className="text-gray-200">
            Editing:{" "}
            <span className="font-bold text-amber-300">
              {selectedStar.starName}
            </span>
          </div>
          {formData && (
            <UpdateStarForm
              star={formData}
              setStar={setFormData}
              handleSubmit={handleFormSubmit}
              isLoading={isLoading}
            />
          )}
          <button
            onClick={() => {
              setSelectedStar(null);
              setFormData(null);
            }}
            className="text-gray-400 hover:text-gray-200 text-sm"
          >
            Back to search
          </button>
        </>
      )}
    </main>
  );
}
