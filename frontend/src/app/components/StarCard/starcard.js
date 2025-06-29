import { convertTierToString } from "@/app/utils/tierConverter";

export default function StarCard({ star }) {
    const starName = star.starName;
    let tier = star.tier;
    tier = convertTierToString(tier);
  return (
    <div className="flex items-center justify-around w-[800px] h-[75px] max-w-[75vw] rounded-2xl border-2 bg-(--bg-gradient-right)">
        <p>{tier}</p>
        <p>{starName}</p>
        <a>ED</a> 
        <a>LO</a>
        {/* //TODO : Implement link to edit star details
        //TODO : Implement link out to site 0_0
        //TODO : Implement color functionlity based on tier, border with lighter shade + text with darker shade */}
    </div>
  );
}
