import AskConsole from "@/components/ask-console.js";

export const metadata = { title: "Ask the Brite Homes Data" };

export default function AskPage() {
  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: "24px 16px" }}>
      <AskConsole />
    </main>
  );
}
