import { TIER_OPTIONS } from "@/app/constants/tierOptions";

export default function TierFilter({ selectedTier, setSelectedTier }) {
  const handleChange = (e) => {
    const value = e.target.value;
    setSelectedTier(value === "" ? "" : parseInt(value));
  };

  return (
    <select
      value={selectedTier}
      onChange={handleChange}
      className="px-3 py-[0.57rem] border rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <option value="">All Tiers</option>
      {TIER_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
