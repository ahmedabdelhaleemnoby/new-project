import { Factory, Flame, GlassWater, Layers3, FlaskConical, Zap, type LucideIcon } from "lucide-react";

const icons: Record<string, LucideIcon> = {
  steel: Factory,
  cement: Flame,
  glass: GlassWater,
  aluminium: Layers3,
  chemical: FlaskConical,
  power: Zap,
};

export function IndustryIcon({ type }: { type: string }) {
  const Icon = icons[type] || Factory;
  return <Icon size={34} strokeWidth={1.3} />;
}
