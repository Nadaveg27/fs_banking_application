"use client";

import { useState } from "react";

export default function SendMoneyForm() {
  const [recipientEmail, setRecipientEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle send money logic
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "#0D1B3E" }}
    >
      {/* Header */}
      <header className="p-8">
        <div className="flex items-center gap-3">
          <div
            className="w-[2px] h-8"
            style={{ backgroundColor: "rgba(255, 255, 255, 0.4)" }}
          />
          <span className="text-white font-bold text-lg tracking-wider">
            MACCABIM BANK
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* Heading */}
          <div className="mb-8">
            <h1
              className="text-white font-bold mb-3"
              style={{ fontSize: "40px" }}
            >
              Make a Transfer
            </h1>
            <div
              className="mb-3"
              style={{
                width: "64px",
                height: "2px",
                backgroundColor: "rgba(255, 255, 255, 0.3)",
              }}
            />
            <p style={{ color: "#8899BB", fontSize: "13px" }}>
              Transfer funds to another Maccabim Bank account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Recipient Email */}
            <div>
              <label
                className="block text-xs font-medium tracking-wider mb-2"
                style={{ color: "#8899BB" }}
              >
                RECIPIENT EMAIL
              </label>
              <input
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="Enter recipient's email address"
                className="w-full px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-white/30"
                style={{
                  backgroundColor: "#152550",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                }}
              />
            </div>

            {/* Amount */}
            <div>
              <label
                className="block text-xs font-medium tracking-wider mb-2"
                style={{ color: "#8899BB" }}
              >
                AMOUNT
              </label>
              <input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-white/30"
                style={{
                  backgroundColor: "#152550",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                }}
              />
            </div>

            {/* Reason */}
            <div>
              <label
                className="block text-xs font-medium tracking-wider mb-2"
                style={{ color: "#8899BB" }}
              >
                REASON (OPTIONAL)
              </label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="What's this transfer for?"
                className="w-full px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-white/30"
                style={{
                  backgroundColor: "#152550",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                }}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 font-semibold text-sm tracking-wide transition-opacity hover:opacity-90"
              style={{
                backgroundColor: "#FFFFFF",
                color: "#0D1B3E",
                borderBottom: "4px solid #B8860B",
              }}
            >
              Submit Transfer
            </button>

            {/* Cancel Link */}
            <div className="text-center pt-2">
              <button
                type="button"
                className="underline text-sm"
                style={{ color: "#6677AA" }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-8 text-center">
        <p className="text-sm" style={{ color: "#334466" }}>
          © 2025 Maccabim Bank. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
