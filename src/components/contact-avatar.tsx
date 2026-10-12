import { getAvatarHue, getInitials } from "@/lib/format";
import { cn } from "@/lib/utils";

const sizes = {
  md: "size-10 text-sm",
  lg: "size-16 text-xl",
} as const;

export function ContactAvatar({
  name,
  size = "md",
  className,
}: {
  name: string;
  size?: keyof typeof sizes;
  className?: string;
}) {
  const hue = getAvatarHue(name);

  return (
    <span
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-medium tracking-wide select-none",
        sizes[size],
        className,
      )}
      style={{
        backgroundColor: `oklch(0.925 0.042 ${hue})`,
        color: `oklch(0.4 0.085 ${hue})`,
      }}
    >
      {getInitials(name)}
    </span>
  );
}
