import Image from "next/image";
import { learningRpgAssetPaths } from "@/lib/learning-rpg-assets";

export function BossSprite({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={
        compact
          ? "relative h-full w-full overflow-hidden rounded-[10px] border border-[#5b7547] bg-[#101820] shadow-[0_14px_30px_rgba(0,0,0,0.28)]"
          : "relative h-full w-full overflow-hidden rounded-[12px] border border-[#5b7547] bg-[#101820] shadow-[0_18px_42px_rgba(0,0,0,0.34)]"
      }
    >
      <Image
        src={learningRpgAssetPaths.forestLord}
        alt="森の主"
        fill
        sizes="(max-width: 768px) 70vw, 520px"
        className={compact ? "object-cover object-[center_24%]" : "object-cover object-center"}
      />
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#101820]/55 to-transparent" />
    </div>
  );
}
