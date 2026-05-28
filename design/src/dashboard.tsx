"use client";

export default function Dashboard() {
  const transactions = [
    { email: "bob@example.com", amount: -150.0, date: "Jun 1, 2024" },
    { email: "alice@example.com", amount: 300.0, date: "May 28, 2024" },
    { email: "carol@example.com", amount: -75.0, date: "May 25, 2024" },
  ];

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "#0D1B3E" }}
    >
      {/* Navbar */}
      <nav
        className="w-full h-16 flex items-center justify-between px-8"
        style={{ backgroundColor: "#152550" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div
            className="w-0.5 h-6"
            style={{ backgroundColor: "rgba(255, 255, 255, 0.4)" }}
          />
          <span className="text-white font-bold text-sm tracking-wider">
            MACCABIM BANK
          </span>
        </div>

        {/* Sign Out Button */}
        <button
          className="px-4 py-2 bg-white font-bold text-sm"
          style={{
            color: "#0D1B3E",
            borderBottom: "2px solid #B8860B",
          }}
        >
          Sign Out
        </button>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="flex gap-8">
          {/* Left Section - Account Balance Card */}
          <div
            className="p-8"
            style={{
              backgroundColor: "#152550",
              minWidth: "320px",
            }}
          >
            <p
              className="text-xs uppercase tracking-widest mb-2"
              style={{ color: "#8899BB" }}
            >
              Account Balance
            </p>
            <p className="text-white font-bold text-5xl mb-1">$4,250.00</p>
            <p className="text-sm mb-6" style={{ color: "#8899BB" }}>
              Available funds
            </p>
            <div
              className="w-full h-px mb-6"
              style={{ backgroundColor: "#B8860B" }}
            />
            <button
              className="w-full py-3 bg-white font-bold text-sm"
              style={{
                color: "#0D1B3E",
                borderBottom: "4px solid #B8860B",
              }}
            >
              Send Money
            </button>
          </div>

          {/* Right Section - Recent Transactions */}
          <div className="flex-1">
            <h2 className="text-white font-bold text-xl mb-3">
              Recent Transactions
            </h2>
            <div
              className="w-16 h-px mb-6"
              style={{ backgroundColor: "rgba(255, 255, 255, 0.3)" }}
            />

            <div className="flex flex-col">
              {transactions.map((tx, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between py-4">
                    <span className="text-white">{tx.email}</span>
                    <span
                      className="font-medium"
                      style={{
                        color: tx.amount < 0 ? "#FF6B6B" : "#6BFF9E",
                      }}
                    >
                      {tx.amount < 0 ? "-" : "+"}$
                      {Math.abs(tx.amount).toFixed(2)}
                    </span>
                    <span className="text-sm" style={{ color: "#8899BB" }}>
                      {tx.date}
                    </span>
                  </div>
                  {index < transactions.length - 1 && (
                    <div
                      className="w-full h-px"
                      style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-sm" style={{ color: "#334466" }}>
        © 2025 Maccabim Bank. All rights reserved.
      </footer>
    </div>
  );
}
