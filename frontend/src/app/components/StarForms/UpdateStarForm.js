import { convertTierToString } from "@/app/utils/tierConverter";

export default function UpdateStarForm({
  star,
  setStar,
  handleSubmit,
  isLoading,
}) {
  const tierOptions = [
    { value: 1, label: convertTierToString(1) }, // S+
    { value: 2, label: convertTierToString(2) }, // S
    { value: 3, label: convertTierToString(3) }, // A
    { value: 4, label: convertTierToString(4) }, // B
    { value: 5, label: convertTierToString(5) }, // C
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStar((prevStar) => ({
      ...prevStar,
      [name]: name === "tier" ? parseInt(value) : value,
    }));
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 w-[600px] max-w-[75vw]"
    >
      <input
        type="text"
        name="starName"
        placeholder="Full Name"
        autoComplete="off"
        className="p-2 border rounded"
        value={star.starName}
        onChange={handleChange}
        required
      />
      <select
        name="tier"
        value={star.tier}
        onChange={handleChange}
        className="p-2 border rounded bg-gray-700 text-white focus:outline-none"
        required
      >
        <option value={0} disabled>
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
        disabled={isLoading}
        className="text-white px-4 py-2 rounded-2xl outline-[2px] hover:bg-(--bg-gradient-left) ease-in duration-300 cursor-pointer min-w-[230px] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}
