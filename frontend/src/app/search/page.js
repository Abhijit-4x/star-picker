"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import SearchBar from "../components/SearchBar/searchbar";
import TierFilter from "../components/TierFilter/TierFilter";
import StarCard from "../components/StarCard/starcard";
import searchStars from "../utils/searchStars";
import ProtectedRoute from "../components/ProtectedRoute";

export default function SearchPage() {
  const [searchKey, setSearchKey] = useState("");
  const [selectedTier, setSelectedTier] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearchSubmit = async (key) => {
    // Validation: at least one filter must be selected
    if ((!key || key.trim() === "") && !selectedTier) {
      toast.error("Please enter a name or select a tier filter");
      return;
    }

    console.log("Searching with key:", key, "and tier:", selectedTier);
    try {
      const tierArray = selectedTier ? [selectedTier] : [];
      const response = await searchStars(key, tierArray);
      setSearchResults(response);
      setHasSearched(true);
    } catch (error) {
      toast.error("Failed to search stars");
      console.error("Search error:", error);
    }
  };

  const handleClear = () => {
    setSearchKey("");
    setSelectedTier("");
    setSearchResults([]);
    setHasSearched(false);
  };

  const handleRemoveStar = (deletedId) => {
    setSearchResults((prev) => prev.filter((star) => star._id !== deletedId));
  };

  return (
    <ProtectedRoute>
      <main className="flex flex-col items-center pt-[80px] h-[80vh] gap-[34px]">
        <div className="flex gap-4 items-center">
          <TierFilter
            selectedTier={selectedTier}
            setSelectedTier={setSelectedTier}
          />
          <SearchBar
            searchKey={searchKey}
            setSearchKey={setSearchKey}
            onSearchSubmit={handleSearchSubmit}
            onClear={handleClear}
          />
        </div>
        {searchResults.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 overflow-auto px-4 pt-4">
            {searchResults.map((star) => (
              <StarCard
                key={star._id}
                star={star}
                onDelete={handleRemoveStar}
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-500">
            {hasSearched
              ? "No stars around here with that name!"
              : "Let's find the star you're looking for!"}
          </p>
        )}
      </main>
    </ProtectedRoute>
  );
}
