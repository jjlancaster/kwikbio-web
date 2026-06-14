import GatewayClient from "@/components/GatewayClient";

export const metadata = {
  title: "Gateway — kwiKBio",
  description: "State B ARS Gateway — natural-language queries against the PRISM-9 knowledge graph.",
};

export default function GatewayPage() {
  return <GatewayClient />;
}
