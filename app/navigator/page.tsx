import type { Metadata } from "next";
import NavigatorHelm from "@/components/navigator/NavigatorHelm";

export const metadata: Metadata = {
  title: "Navigator — FastScience!",
  description: "TREE Navigation Helm — Level-governed research navigator over the ARS knowledge graph.",
};

export default function NavigatorPage() {
  return <NavigatorHelm />;
}
