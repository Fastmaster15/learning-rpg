import { LearningRpgClient } from "@/components/product-lab/LearningRpgClient";
import { learningRpgDashboard } from "@/lib/learning-rpg";

export default function LearningRpgPage({ searchParams }: { searchParams?: { theme?: string } }) {
  return <LearningRpgClient dashboard={learningRpgDashboard} initialThemeId={searchParams?.theme} />;
}
