import { HeroButton } from "@/components/buttons/hero";

export function SocialLogin({ fullWidth = false }: { fullWidth?: boolean }) {
  return (
    <div className={`grid grid-cols-2 gap-4 ${fullWidth ? "w-full" : ""}`}>
      <HeroButton
        variant="outline"
        className="dark:bg-white/5 bg-white/5 border font-medium"
        type="button"
      >
        Google
      </HeroButton>
      <HeroButton
        variant="outline"
        className="dark:bg-white/5 bg-white/5 border font-medium"
        type="button"
      >
        GitHub
      </HeroButton>
    </div>
  );
}
