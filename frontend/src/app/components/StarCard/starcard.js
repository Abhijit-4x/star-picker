import {
  convertTierToString,
  convertTierToStyle,
} from "@/app/utils/tierConverter";
import { useRouter } from "next/navigation";
import { SquarePen } from "lucide-react";

export default function StarCard({ star }) {
  const starName = star.starName;
  const tier = star.tier;
  const style = convertTierToStyle(tier);
  const stringTier = convertTierToString(tier);
  const router = useRouter();
  console.log(`StarCard: ${starName} - Tier: ${tier} - Style: ${style}`);

  const handleEdit = () => {
    // Pass star data via URL params or state
    const starData = encodeURIComponent(
      JSON.stringify({
        _id: star._id,
        starName: star.starName,
        tier: star.tier,
      })
    );
    router.push(`/update?star=${starData}`);
  };

  return (
    <div
      className={`flex items-center justify-around w-[800px] h-[75px] max-w-[75vw] rounded-2xl border-4 bg-(--bg-gradient-right) ${style}`}
    >
      <p>{stringTier}</p>
      <p>{starName}</p>
      <button
        onClick={handleEdit}
        className="cursor-pointer hover:text-amber-300 transition-colors"
      >
        <SquarePen size={20} />
      </button>
      <a>LO</a>
      {/*
        //TODO : Implement link to edit star details
        //TODO : Implement link out to site 0_0
        //TODO : Implement delete button on star card
        */}
    </div>
  );
}
