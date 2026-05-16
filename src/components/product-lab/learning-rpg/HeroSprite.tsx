export function HeroSprite() {
  return (
    <div className="absolute inset-1 grid place-items-center">
      <div className="relative grid h-[78%] w-[78%] place-items-center rounded-[5px] border border-[#f3c57a] bg-[linear-gradient(180deg,#1d2630_0%,#101820_100%)] shadow-[0_10px_24px_rgba(0,0,0,0.28)]">
        <div className="absolute inset-x-2 top-2 h-1 rounded-full bg-[#f3c57a]/35" />
        <div className="absolute inset-x-3 bottom-2 h-1 rounded-full bg-black/35" />
        <div className="grid h-8 w-8 place-items-center rounded-full border border-[#f3c57a]/70 bg-[#d8c48d] text-sm font-black text-[#16222d]">
          勇
        </div>
      </div>
    </div>
  );
}
