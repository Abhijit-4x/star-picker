import { Search } from "lucide-react";
import { useRef, useEffect } from "react";
import { convertTierToString } from "@/app/utils/tierConverter";

export default function RealtimeSearchBar({
  searchKey,
  setSearchKey,
  onSearchChange,
  searchResults = [],
  onResultSelect,
}) {
  const dropdownRef = useRef(null);

  const handleChange = (e) => {
    const value = e.target.value;
    setSearchKey(value);

    // Trigger search on every change except when empty
    if (value.trim() !== "") {
      onSearchChange(value);
    } else {
      onSearchChange(""); // Clear results when empty
    }
  };

  const handleClear = () => {
    setSearchKey("");
    onSearchChange("");
    console.log("Search cleared");
  };

  const handleResultClick = (star) => {
    onResultSelect(star);
    setSearchKey("");
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        // Don't close, let it be controlled by the parent
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="w-[600px] max-w-[75vw] relative" ref={dropdownRef}>
      <div className="flex gap-4">
        <div className="flex justify-between gap-5 border rounded focus:ring-2 focus:ring-blue-500 flex-1 relative">
          <div className="p-2 flex-1">
            <input
              type="text"
              placeholder="Search by name"
              value={searchKey}
              onChange={handleChange}
              className="focus:outline-none w-full"
            />
          </div>
          <button className="w-[90px] cursor-pointer">
            <Search className="m-auto" size={28} />
          </button>

          {/* Dropdown Results */}
          {searchResults.length > 0 && searchKey.trim() !== "" && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded shadow-lg z-50 max-h-60 overflow-y-auto">
              {searchResults.map((star, index) => (
                <button
                  key={index}
                  onClick={() => handleResultClick(star)}
                  className="w-full px-4 py-3 text-left hover:bg-slate-700 border-b border-slate-700 last:border-b-0 text-white transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{star.starName}</span>
                    <span className="font-medium">
                      {convertTierToString(star.tier)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          className="text-black active:scale-80 duration-300 ease-in-out text-[0.75em] cursor-pointer bg-white rounded-l p-2"
          onClick={handleClear}
        >
          Clear
        </button>
      </div>
    </div>
  );
}

//TODO: Add filter/fetch by tier functionality
