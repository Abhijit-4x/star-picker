import { Search } from "lucide-react";

export default function SearchBar({ searchKey, setSearchKey, onSearchSubmit }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSearchSubmit(searchKey);
  }
  return (
    <div className="w-[600px] max-w-[75vw]">
      <form onSubmit={handleSubmit} className="flex justify-between gap-5 border rounded  focus:ring-2 focus:ring-blue-500 ">
        <div className="p-2">
          <input
            type="text"
            placeholder="Search by name"
            value={searchKey}
            onChange={(e) => setSearchKey(e.target.value)}
            className="focus:outline-none"
          />
        </div>
        <button type="submit" className="w-[90px] cursor-pointer">
          <Search className="m-auto" size={28} />
        </button>
      </form>
    </div>
  );
}
