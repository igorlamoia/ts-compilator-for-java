import { useTheme } from "@/contexts/ThemeContext";
import { Meteors } from "../ui/meteors";
import { Particles } from "@/components/ui/particles";

export function Meteores() {
  const { darkMode } = useTheme();
  const background = darkMode
    ? "radial-gradient(ellipse at bottom, #0d1d31 0%, #0c0d13 100%)"
    : "radial-gradient(ellipse at bottom, #cfddf3 0%, #ffffff 100%)";

  return (
    <div style={{ background }} className="overflow-hidden flex inset-0 fixed">
      <Meteors number={5} />
      <Particles />
    </div>
  );
}
