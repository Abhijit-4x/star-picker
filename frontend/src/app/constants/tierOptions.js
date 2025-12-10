import { convertTierToString } from "@/app/utils/tierConverter";

export const TIER_OPTIONS = [
  { value: 1, label: convertTierToString(1) }, // S+
  { value: 2, label: convertTierToString(2) }, // S
  { value: 3, label: convertTierToString(3) }, // A
  { value: 4, label: convertTierToString(4) }, // B
  { value: 5, label: convertTierToString(5) }, // C
];
