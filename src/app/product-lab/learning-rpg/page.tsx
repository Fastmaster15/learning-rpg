import { LearningRpgClient } from "@/components/product-lab/LearningRpgClient";
import { learningRpgDashboard } from "@/lib/learning-rpg";

export default function LearningRpgPage() {
  return <LearningRpgClient dashboard={learningRpgDashboard} />;
}

