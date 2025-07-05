"use client";

import { useState, useEffect } from "react";
import SearchBar from "../components/SearchBar/searchbar";
import StarCard from "../components/StarCard/starcard";
import { searchStars } from "../utils/searchStars";

export default function SearchPage() {
  const [searchKey, setSearchKey] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  // this is temp right now
  const star = {
    starName: "Cas Summer",
    tier: 2,
  };

  const handleSearchSubmit = async (key) => {
    console.log("Received search key:", key);
    const response = await searchStars(key);
    setSearchResults(response);
  };
  // const something = await searchStars(searchKey);
  return (
    <main className="flex flex-col items-center pt-[100px] h-[80vh] gap-[40px]">
      <SearchBar
        searchKey={searchKey}
        setSearchKey={setSearchKey}
        onSearchSubmit={handleSearchSubmit} // Pass the function to handle search
      />
      {searchResults.length > 0 ? (
        <div className="grid grid-cols-1 gap-2 overflow-auto">
          {searchResults.map((star, index) => (
            <StarCard key={index} star={star} />
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
  );
}
