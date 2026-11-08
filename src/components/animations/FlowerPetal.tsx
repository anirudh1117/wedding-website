type FlowerPetalProps = {
  color: string;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
  drift: number;
  rotation: number;
  left: number;
  scale: number;
};

export function FlowerPetal({
  color,
  size,
  opacity,
  duration,
  delay,
  drift,
  rotation,
  left,
  scale,
}: FlowerPetalProps) {
  return (
    <span
      className="floral-petal"
      style={{
        left: `${left}%`,
        width: `${size}px`,
        height: `${size * 1.7}px`,
        opacity,
        animationDuration: `${duration}s`,
        animationDelay: `${delay}s`,
        background: `linear-gradient(170deg, ${color} 0%, rgba(255,255,255,0.05) 24%, ${color} 60%, rgba(112,60,70,0.34) 100%)`,
        border: "1px solid rgba(112, 60, 70, 0.28)",
        transform: `scale(${scale}) rotate(${rotation}deg)`,
        ['--petal-drift' as string]: `${drift}px`,
        ['--petal-rotation' as string]: `${rotation}deg`,
      }}
    />
  );
}
