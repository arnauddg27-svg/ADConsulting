import AskConsole from "@/components/ask-console.js";

export const metadata = { title: "Ask the Brite Homes Data" };

export default function AskPage() {
  // The dashboard's root layout is dark-themed (data-theme="dark") and sets
  // `html { overflow: hidden }`. Make /ask a self-contained, scrollable light surface
  // so text is readable and long answers scroll.
  return (
    <div style={{ height: "100vh", overflowY: "auto", background: "#ffffff", color: "#1f2430" }}>
      <main style={{ maxWidth: 960, margin: "0 auto", padding: "24px 16px" }}>
        <AskConsole />
      </main>
    </div>
  );
}
