'use client'

import { useState } from 'react';

export default function Home() {
  const [star, setStar] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchStar = async () => {
    setLoading(true);
    const res = await fetch('http://localhost:5000/api/random-star'); // assuming your Express server
    const data = await res.json();
    setStar(data);
    setLoading(false);
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-4 p-4">
      <h1 className="text-2xl font-bold">⭐ Star Picker</h1>
      <button
        onClick={fetchStar}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {loading ? 'Picking...' : 'Pick a Star'}
      </button>
      {star && (
        <div className="mt-4 text-lg">
          <strong>Random Star:</strong> {star.name}
        </div>
      )}
    </main>
  );
}
