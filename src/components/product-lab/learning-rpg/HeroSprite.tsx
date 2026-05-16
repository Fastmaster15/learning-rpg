import Image from "next/image";

export type HeroFacing = "up" | "down" | "left" | "right";

export function HeroSprite({ facing = "down", walking = false }: { facing?: HeroFacing; walking?: boolean }) {
  const facingClassName =
    facing === "left"
      ? "scale-x-[-1] -rotate-1"
      : facing === "right"
        ? "rotate-1"
        : facing === "up"
          ? "scale-[0.97] brightness-75 saturate-90"
          : "scale-[1.01]";

  const frameClassName =
    facing === "up"
      ? "translate-y-[-2%]"
      : facing === "down"
        ? "translate-y-[2%]"
        : "translate-y-0";

  const bobClassName = walking ? "animate-[hero-step_0.22s_ease-out_1]" : "animate-[hero-bob_2.8s_ease-in-out_infinite]";
  const shadowClassName =
    facing === "up"
      ? "left-1/2 top-[64%] h-6 w-14 -translate-x-1/2 bg-[#0f1820]/60 blur-xl"
      : facing === "down"
        ? "left-1/2 top-[68%] h-7 w-16 -translate-x-1/2 bg-[#0f1820]/50 blur-xl"
        : "left-1/2 top-[66%] h-6 w-16 -translate-x-1/2 bg-[#0f1820]/52 blur-xl";

  return (
    <>
      <div className="absolute inset-1 grid place-items-center">
        <div className={`relative h-[90%] w-[90%] ${bobClassName}`}>
          <div className={`absolute ${shadowClassName} rounded-full`} />
          <div className={`relative h-full w-full overflow-hidden rounded-[8px] border border-[#f3c57a] bg-[#101820] shadow-[0_12px_28px_rgba(0,0,0,0.3)] ${frameClassName}`}>
            <Image
              src="/images/hero.jpg"
              alt="主人公"
              fill
              sizes="88vw"
              className={`object-cover object-center transition-[transform,filter,opacity] duration-150 ${facingClassName}`}
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_24%,rgba(255,255,255,0.18),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.05)_0%,transparent_28%,rgba(9,14,20,0.1)_62%,rgba(9,14,20,0.42)_100%)]" />
            {facing === "up" ? <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,12,18,0.18)_0%,rgba(8,12,18,0.42)_38%,rgba(8,12,18,0.1)_100%)]" /> : null}
            {facing === "left" ? <div className="absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-[#f3c57a]/10 to-transparent" /> : null}
            {facing === "right" ? <div className="absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-[#f3c57a]/10 to-transparent" /> : null}
            <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#101820]/55 to-transparent" />
            {walking ? <div className="absolute inset-x-1/2 bottom-3 h-3 w-3 -translate-x-1/2 rounded-full bg-[#f3c57a]/35 blur-sm animate-[hero-dust_0.22s_ease-out_1]" /> : null}
          </div>
        </div>
      </div>
      <style jsx global>{`
        @keyframes hero-bob {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-4px);
          }
        }
        @keyframes hero-step {
          0% {
            transform: translateY(0) scale(1);
          }
          35% {
            transform: translateY(-3px) scale(1.015);
          }
          70% {
            transform: translateY(1px) scale(0.992);
          }
          100% {
            transform: translateY(0) scale(1);
          }
        }
        @keyframes hero-dust {
          0% {
            opacity: 0;
            transform: translate(-50%, 0) scale(0.7);
          }
          45% {
            opacity: 1;
            transform: translate(-50%, -2px) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -4px) scale(1.25);
          }
        }
      `}</style>
    </>
  );
}
