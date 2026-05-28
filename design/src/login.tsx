"use client"

import { useState } from "react"

function MaccabimLogo() {
  return (
    <div className="flex items-center gap-3">
      <div className="w-[2px] h-9 bg-white/40" />
      <span className="text-white font-bold text-xl tracking-tight uppercase">
        Maccabim Bank
      </span>
    </div>
  )
}

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Login attempt:", { email, password })
  }

  return (
    <div className="min-h-screen bg-[#0D1B3E] flex flex-col">
      {/* Header with logo */}
      <header className="p-8">
        <MaccabimLogo />
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          {/* Sign In heading */}
          <div className="mb-10">
            <h1 className="text-white text-[40px] font-bold">Sign In</h1>
            <div className="w-16 h-[2px] bg-white/30 mt-4 mb-4" />
            <p className="text-[#8899BB] text-[13px]">
              Please enter your credentials to continue
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email field */}
            <div>
              <label
                htmlFor="email"
                className="block text-white text-[11px] font-bold uppercase tracking-widest mb-2"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-3 border border-white/20 bg-[#152550] text-white placeholder:text-white/40 focus:outline-none focus:border-white/40 transition-colors"
              />
            </div>

            {/* Password field */}
            <div>
              <label
                htmlFor="password"
                className="block text-white text-[11px] font-bold uppercase tracking-widest mb-2"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3 border border-white/20 bg-[#152550] text-white placeholder:text-white/40 focus:outline-none focus:border-white/40 transition-colors"
              />
            </div>

            {/* Sign In button */}
            <button
              type="submit"
              className="w-full bg-white text-[#0D1B3E] font-bold py-3.5 border-b-[2px] border-[#B8860B] hover:bg-gray-100 transition-colors mt-2"
            >
              Sign In
            </button>
          </form>

          {/* Register link */}
          <p className="text-center mt-10 text-[#6677AA] text-sm">
            {"Don't have an account? "}
            <a href="#" className="text-white underline hover:text-gray-200">
              Register
            </a>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center">
        <p className="text-[#334466] text-xs">
          © 2025 Maccabim Bank. All rights reserved.
        </p>
      </footer>
    </div>
  )
}
