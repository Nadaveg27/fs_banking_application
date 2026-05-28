"use client";

export default function CheckEmailPage() {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "#0D1B3E" }}
    >
      {/* Header */}
      <div className="p-8">
        <div className="flex items-center gap-3">
          <div
            className="w-px h-6"
            style={{ backgroundColor: "rgba(255, 255, 255, 0.4)" }}
          />
          <span className="text-white font-bold text-sm tracking-widest">
            MACCABIM BANK
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center text-center">
          {/* Envelope Icon */}
          <svg
            width="64"
            height="64"
            viewBox="0 0 64 64"
            fill="none"
            stroke="white"
            strokeWidth="2"
            className="mb-8"
          >
            <rect x="4" y="12" width="56" height="40" rx="0" />
            <polyline points="4,12 32,36 60,12" />
          </svg>

          {/* Title */}
          <h1 className="text-white font-bold text-[40px] mb-4">
            Check Your Email
          </h1>

          {/* Accent Line */}
          <div
            className="h-px mb-6"
            style={{
              width: "64px",
              backgroundColor: "rgba(255, 255, 255, 0.3)",
            }}
          />

          {/* Subtitle */}
          <p
            className="text-[14px] mb-8 max-w-[480px]"
            style={{ color: "#8899BB" }}
          >
            We&apos;ve sent a verification link to your email address. Click the
            link in the email to activate your account.
          </p>

          {/* Resend Link */}
          <p className="text-[14px]">
            <span style={{ color: "#6677AA" }}>
              Didn&apos;t receive an email?
            </span>{" "}
            <button
              className="underline bg-transparent border-none cursor-pointer text-white text-[14px]"
              onClick={() => {}}
            >
              Resend
            </button>
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="p-8 text-center">
        <p className="text-[13px]" style={{ color: "#334466" }}>
          © 2025 Maccabim Bank. All rights reserved.
        </p>
      </div>
    </div>
  );
}