type Enemy = {
  id: string;
};

export function EnemySprite({ enemy }: { enemy: Enemy }) {
  if (enemy.id === "soft_blob") {
    return (
      <svg viewBox="0 0 120 120" className="h-full w-full" aria-hidden="true">
        <rect width="120" height="120" rx="20" fill="#14202b" />
        <ellipse cx="60" cy="68" rx="26" ry="22" fill="#8ce07b" />
        <ellipse cx="46" cy="58" rx="6" ry="8" fill="#dff6d9" />
        <ellipse cx="74" cy="58" rx="6" ry="8" fill="#dff6d9" />
        <circle cx="52" cy="66" r="3" fill="#102018" />
        <circle cx="68" cy="66" r="3" fill="#102018" />
        <path d="M50 77 Q60 84 70 77" stroke="#102018" strokeWidth="4" strokeLinecap="round" fill="none" />
      </svg>
    );
  }

  if (enemy.id === "night_bat") {
    return (
      <svg viewBox="0 0 120 120" className="h-full w-full" aria-hidden="true">
        <rect width="120" height="120" rx="20" fill="#14202b" />
        <path d="M20 64 L42 44 L55 58 L60 42 L65 58 L78 44 L100 64 L76 72 L60 60 L44 72 Z" fill="#5f6a92" />
        <circle cx="60" cy="68" r="12" fill="#d9d3ff" />
        <circle cx="56" cy="66" r="2.5" fill="#102018" />
        <circle cx="64" cy="66" r="2.5" fill="#102018" />
        <path d="M57 73 Q60 75 63 73" stroke="#102018" strokeWidth="3" strokeLinecap="round" fill="none" />
      </svg>
    );
  }

  if (enemy.id === "forest_guardian") {
    return (
      <svg viewBox="0 0 120 120" className="h-full w-full" aria-hidden="true">
        <rect width="120" height="120" rx="20" fill="#112018" />
        <ellipse cx="60" cy="70" rx="30" ry="22" fill="#4f7f52" />
        <ellipse cx="60" cy="50" rx="20" ry="16" fill="#8ed0a0" />
        <rect x="49" y="28" width="22" height="10" rx="5" fill="#9ad38f" />
        <circle cx="52" cy="48" r="3" fill="#102018" />
        <circle cx="68" cy="48" r="3" fill="#102018" />
        <path d="M50 60 Q60 68 70 60" stroke="#102018" strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M32 74 Q24 58 34 44" stroke="#8ed0a0" strokeWidth="8" strokeLinecap="round" fill="none" />
        <path d="M88 74 Q96 58 86 44" stroke="#8ed0a0" strokeWidth="8" strokeLinecap="round" fill="none" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 120 120" className="h-full w-full" aria-hidden="true">
      <rect width="120" height="120" rx="20" fill="#201618" />
      <ellipse cx="60" cy="70" rx="30" ry="20" fill="#9a613a" />
      <ellipse cx="45" cy="58" rx="12" ry="10" fill="#b0784a" />
      <ellipse cx="75" cy="58" rx="12" ry="10" fill="#b0784a" />
      <ellipse cx="60" cy="52" rx="26" ry="16" fill="#b57a4f" />
      <circle cx="52" cy="52" r="3" fill="#201618" />
      <circle cx="68" cy="52" r="3" fill="#201618" />
      <path d="M50 62 Q60 70 70 62" stroke="#201618" strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d="M35 76 Q28 70 26 58" stroke="#d9c1a5" strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d="M85 76 Q92 70 94 58" stroke="#d9c1a5" strokeWidth="4" strokeLinecap="round" fill="none" />
    </svg>
  );
}
