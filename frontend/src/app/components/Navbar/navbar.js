import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between p-[20px]  text-white">
      <Link href="/" className="font-bold rounded-md p-2">
        StarPicker
      </Link>
      <div className="flex gap-[20px]">
        <Link href="/add" className="rounded-md p-2 hover:text-amber-300">
          Add
        </Link>
        <Link href="/update" className="rounded-md p-2 hover:text-amber-300">
          Update
        </Link>
        <Link href="/audit" className="rounded-md p-2 hover:text-amber-300">
          Audit
        </Link>
        <Link href="/search" className="rounded-md p-2 hover:text-amber-300">
          Search
        </Link>
        {/* Add more navigation links here */}
      </div>
    </nav>
  );
}