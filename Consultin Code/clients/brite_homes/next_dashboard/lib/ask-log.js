// Structured JSON logging for the Ask endpoint (Vercel/console-friendly).
// Never throws and never logs credentials.
export function logEvent(record) {
  try {
    console.log(JSON.stringify({ ts: new Date().toISOString(), source: "ask", ...record }));
  } catch {
    // logging must never break a request
  }
}
