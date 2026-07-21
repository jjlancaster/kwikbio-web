import { redirect } from "next/navigation";

// Front door → the TREE Navigation Helm. The marketing home lives at /welcome.
export default function Home() {
  redirect("/navigator");
}
