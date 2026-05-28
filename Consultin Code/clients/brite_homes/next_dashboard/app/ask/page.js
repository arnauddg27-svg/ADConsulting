import AskConsole from "@/components/ask-console.js";

export const metadata = {
  title: "Ask the Brite Homes Data",
  description: "Natural-language answers from the live BigQuery warehouse.",
};

// The console renders its own themed shell on top of the dashboard's html overflow:hidden,
// so we don't wrap anything here — the page IS the shell.
export default function AskPage() {
  return <AskConsole />;
}
