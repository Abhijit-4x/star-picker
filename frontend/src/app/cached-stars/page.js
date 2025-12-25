"use client";
import { useEffect, useState } from "react";
import { getCachedStars, removeFromCache } from "../utils/auth";
import StarCard from "../components/StarCard/starcard";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

export default function CachedStarsPage() {
  const [cachedStars, setCachedStars] = useState([]);
  const [filteredStars, setFilteredStars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchKey, setSearchKey] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchCachedStars();
  }, []);

  useEffect(() => {
    // Filter cached stars based on search key
    if (searchKey.trim() === "") {
      setFilteredStars(cachedStars);
    } else {
      const filtered = cachedStars.filter((star) =>
        star.starName.toLowerCase().includes(searchKey.toLowerCase())
      );
      setFilteredStars(filtered);
    }
  }, [searchKey, cachedStars]);

  const fetchCachedStars = async () => {
    try {
      setLoading(true);
      const data = await getCachedStars();
      if (data && data.cachedStars) {
        setCachedStars(data.cachedStars);
      } else {
        setError("Failed to load cached stars");
      }
    } catch (err) {
      console.error("Error fetching cached stars:", err);
      setError("Failed to load cached stars");
      toast.error("Failed to load cached stars");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromCache = async (starId) => {
    try {
      await removeFromCache(starId);
      setCachedStars((prev) => prev.filter((star) => star._id !== starId));
      toast.success("Star removed from cache");
    } catch (err) {
      console.error("Error removing from cache:", err);
      toast.error(err.message || "Failed to remove from cache");
    }
  };

  return (
    <main className="flex flex-col items-center pt-[80px] h-[80vh] gap-[20px]">
      {/* Back Button */}
      <div className="w-full px-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-slate-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
      </div>

      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold">Your Cached Stars</h1>
        <p className="text-gray-400">
          {cachedStars.length} star{cachedStars.length !== 1 ? "s" : ""} in your
          cache
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-300"></div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-900 bg-opacity-50 border border-red-700 rounded-md p-4 text-red-200">
          {error}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && cachedStars.length === 0 && (
        <div className="text-gray-400">No cached stars yet</div>
      )}

      {/* Search Filter and List Container */}
      {!loading && !error && cachedStars.length > 0 && (
        <div className="flex flex-col items-center gap-2 w-[900px] max-w-[90vw] flex-1 overflow-hidden">
          {/* Search Input */}
          <input
            type="text"
            placeholder="Search cached stars..."
            value={searchKey}
            onChange={(e) => setSearchKey(e.target.value)}
            className="w-full px-4 py-2 rounded-md bg-slate-700 text-white placeholder-gray-400 focus:outline-none border-2 border-slate-700 focus:border-white transition-colors"
          />

          {/* Filtered Results Count */}
          <p className="text-gray-400 text-xs">
            {filteredStars.length} of {cachedStars.length} star
            {cachedStars.length !== 1 ? "s" : ""}
          </p>

          {/* Cached Stars List */}
          {filteredStars.length > 0 ? (
            <div className="flex flex-col items-center gap-4 overflow-y-auto w-full flex-1 pt-4">
              {[...filteredStars].reverse().map((star) => (
                <StarCard
                  key={star._id}
                  star={star}
                  onDelete={handleRemoveFromCache}
                  hideEditAudit={true}
                  isCacheView={true}
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-400">
              No stars match your search: &quot;{searchKey}&quot;
            </p>
          )}
        </div>
      )}
    </main>
  );
}
