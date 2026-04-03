export default function Home() {
  return (
    <main
      style={{
        fontFamily: "system-ui, sans-serif",
        padding: "2rem",
        maxWidth: 520,
        lineHeight: 1.5,
      }}
    >
      <h1 style={{ fontSize: "1.5rem" }}>Tap2Mine — API</h1>
      <p>
        <strong>GET</strong>{" "}
        <code style={{ background: "#eee", padding: "0.1rem 0.35rem" }}>
          /api/btc-price
        </code>
        {" — "}
        BTC reference price in USD (CoinGecko with a local fallback).
      </p>
      <p style={{ color: "#555" }}>Development server: port 3001.</p>
    </main>
  );
}
