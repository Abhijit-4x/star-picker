"use client";

import { useState, useEffect } from "react";
import SearchBar from "../components/SearchBar/searchbar";
import StarCard from "../components/StarCard/starcard";
import searchStars from "../utils/searchStars";
import ProtectedRoute from "../components/ProtectedRoute";

export default function SearchPage() {
  const [searchKey, setSearchKey] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const handleSearchSubmit = async (key) => {
    console.log("Received search key:", key);
    const response = await searchStars(key);
    setSearchResults(response);
  };

  const handleRemoveStar = (deletedId) => {
    setSearchResults((prev) => prev.filter((star) => star._id !== deletedId));
  };

  return (
    <ProtectedRoute>
      <main className="flex flex-col items-center pt-[100px] h-[80vh] gap-[34px]">
        <SearchBar
          searchKey={searchKey}
          setSearchKey={setSearchKey}
          onSearchSubmit={handleSearchSubmit}
        />
        {searchResults.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 overflow-auto px-4 pt-4">
            {searchResults.map((star) => (
              <StarCard
                key={star._id}
                star={star}
                onRemove={handleRemoveStar}
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-500">
            {searchKey
              ? "No stars around here with that name!"
              : "Let's find the star you're looking for!"}
          </p>
        )}
      </main>
    </ProtectedRoute>
  );
}
