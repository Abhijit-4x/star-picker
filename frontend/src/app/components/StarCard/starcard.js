import { convertTierToString, convertTierToStyle } from "@/app/utils/tierConverter";

export default function StarCard({ star }) {
    const starName = star.starName;
    const tier = star.tier;
    const style = convertTierToStyle(tier);
    const stringTier = convertTierToString(tier);
    console.log(`StarCard: ${starName} - Tier: ${tier} - Style: ${style}`);
    
  return (
    <div className={`flex items-center justify-around w-[800px] h-[75px] max-w-[75vw] rounded-2xl border-4 bg-(--bg-gradient-right) ${style}`}>
        <p>{stringTier}</p>
        <p>{starName}</p>
        <a>ED</a> 
        <a>LO</a>
        {/*
        //TODO : Implement link to edit star details
        //TODO : Implement link out to site 0_0
        //TODO : Implement delete button on star card
        */}
    </div>
  );
}
