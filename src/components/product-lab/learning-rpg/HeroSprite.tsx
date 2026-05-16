import Image from "next/image";

export function HeroSprite() {
  return (
    <div className="absolute inset-1 grid place-items-center">
      <div className="relative h-[88%] w-[88%] overflow-hidden rounded-[8px] border border-[#f3c57a] bg-[#101820] shadow-[0_12px_28px_rgba(0,0,0,0.3)]">
        <Image
          src="/images/hero.jpg"
          alt="主人公"
          fill
          sizes="88vw"
          className="object-cover object-center"
          />
        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#101820]/55 to-transparent" />
      </div>
    </div>
  );
}
