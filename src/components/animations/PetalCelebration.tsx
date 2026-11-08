import { FlowerPetal } from "./FlowerPetal";
import type { PetalAnimationSpec } from "@/lib/animations/petal-presets";

type PetalCelebrationProps = {
  petals: PetalAnimationSpec[];
  variant?: "fullscreen" | "local";
};

export function PetalCelebration({ petals, variant = "fullscreen" }: PetalCelebrationProps) {
  if (!petals.length) {
    return null;
  }

  return (
    <div className={`petal-celebration petal-celebration--${variant}`} aria-hidden="true">
      {petals.map((petal) => (
        <FlowerPetal
          key={petal.id}
          color={petal.color}
          size={petal.size}
          opacity={petal.opacity}
          duration={petal.duration}
          delay={petal.delay}
          drift={petal.drift}
          rotation={petal.rotation}
          left={petal.left}
          scale={petal.scale}
        />
      ))}
    </div>
  );
}
