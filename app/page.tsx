import Prism9Entry from "@/components/Prism9Entry";

export const metadata = {
  title: "kwiKBio — Prism9 Live Research",
  description:
    "Enter any biological topic, disease, gene, or concept — Prism9 builds a live causal graph across Normal, Dysfunction, Fix, and Cope dimensions.",
};

// Front door: Prism9 live keyword entry. Marketing home → /welcome; ARS Navigator → /navigator.
export default function Home() {
  return <Prism9Entry />;
}
