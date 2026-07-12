"use client"

import { signIn, useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

type MainTab = "signin" | "register"
type SignInMethod = "google" | "credentials"
type PasswordStrength = "weak" | "fair" | "strong" | "very-strong" | null

function getPasswordStrength(pwd: string): PasswordStrength {
  if (!pwd) return null
  let score = 0
  if (pwd.length >= 8) score++
  if (pwd.length >= 12) score++
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++
  if (/\d/.test(pwd)) score++
  if (/[^A-Za-z0-9]/.test(pwd)) score++
  if (score <= 1) return "weak"
  if (score === 2) return "fair"
  if (score === 3) return "strong"
  return "very-strong"
}

const strengthLabel: Record<NonNullable<PasswordStrength>, string> = {
  weak: "Weak",
  fair: "Fair",
  strong: "Strong",
  "very-strong": "Very Strong",
}

const strengthColor: Record<NonNullable<PasswordStrength>, string> = {
  weak: "bg-error",
  fair: "bg-secondary-container",
  strong: "bg-on-tertiary-container",
  "very-strong": "bg-on-tertiary-container",
}

const strengthWidth: Record<NonNullable<PasswordStrength>, string> = {
  weak: "w-1/4",
  fair: "w-2/4",
  strong: "w-3/4",
  "very-strong": "w-full",
}

export default function LoginPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [mainTab, setMainTab] = useState<MainTab>("signin")
  const [signInMethod, setSignInMethod] = useState<SignInMethod>("google")

  // Credentials sign-in state
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [credError, setCredError] = useState("")
  const [credLoading, setCredLoading] = useState(false)

  // Register state
  const [regName, setRegName] = useState("")
  const [regEmail, setRegEmail] = useState("")
  const [regPhone, setRegPhone] = useState("")
  const [regPassword, setRegPassword] = useState("")
  const [regConfirmPassword, setRegConfirmPassword] = useState("")
  const [regShowPassword, setRegShowPassword] = useState(false)
  const [regRole, setRegRole] = useState<"OFFICER" | "CONTRACTOR">("OFFICER")
  const [regError, setRegError] = useState("")
  const [regSuccess, setRegSuccess] = useState(false)
  const [regLoading, setRegLoading] = useState(false)

  const regPasswordStrength = getPasswordStrength(regPassword)

  // Redirect already-authenticated users to their dashboard
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const userStatus = (session.user as any).status as string | undefined
      const role = (session.user as any).role as string | undefined

      if (userStatus === "PENDING_APPROVAL") {
        router.replace("/pending-approval")
        return
      }
      if (userStatus === "SUSPENDED") {
        setCredError("Your account has been suspended. Please contact the administrator.")
        return
      }
      if (role === "ADMIN") router.replace("/admin")
      else if (role === "OFFICER") router.replace("/officer")
      else if (role === "CONTRACTOR") router.replace("/contractor")
      else router.replace("/admin")
    }
  }, [status, session, router])

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-surface">
        <span className="text-on-surface-variant text-sm">Loading...</span>
      </div>
    )
  }

  const handleGoogleSignIn = () => {
    // callbackUrl goes back to /login so the useEffect can redirect based on role/status
    signIn("google", { callbackUrl: "/login" })
  }

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setCredError("")
    setCredLoading(true)

    try {
      const result = await signIn("credentials", {
        identifier,
        password,
        redirect: false,
      })

      if (result?.error) {
        setCredError("Invalid credentials. Please check your email/phone and password.")
      } else if (result?.ok) {
        // Session will update and useEffect will redirect
      }
    } catch {
      setCredError("An error occurred. Please try again.")
    } finally {
      setCredLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setRegError("")

    if (!regEmail && !regPhone) {
      setRegError("Please provide at least an email address or mobile number.")
      return
    }
    if (regPassword.length < 8) {
      setRegError("Password must be at least 8 characters.")
      return
    }
    if (regPassword !== regConfirmPassword) {
      setRegError("Passwords do not match.")
      return
    }

    setRegLoading(true)

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: regName,
          email: regEmail || undefined,
          phone: regPhone || undefined,
          password: regPassword,
          requestedRole: regRole,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setRegError(data.error || "Failed to submit request.")
      } else {
        setRegSuccess(true)
        // Reset form
        setRegName("")
        setRegEmail("")
        setRegPhone("")
        setRegPassword("")
        setRegConfirmPassword("")
        setRegRole("OFFICER")
      }
    } catch {
      setRegError("An error occurred. Please try again.")
    } finally {
      setRegLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
      {/* Left Side: Branding Hero */}
      <div className="relative hidden lg:flex flex-col justify-between p-xl overflow-hidden bg-primary">
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center mix-blend-overlay opacity-40"
          style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB29woBKx2zvZ35EsjEtbGo0o0MSc38oNq9AmqPqebOJOyENN0vUfh7LI0-STDTLaJ0FTC4OQTiHxSdsiF6UNLlMXDn5YRHXL2sirUMvdd_KnjQ5thg16bc_i2Q035MAWzBthUVNnXDmaP3d4Huw-jWt1uIW9SuEIGlvMPhc492fDFzcPjBGs4F9rqFmLf79E5DgmnZj0LXv0j6ibbTuoZCxumGH_RHHSwP-JmjaXS1NzcKFUsig0l2AFvfe8DDYT0K7jfry5To1w')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/80 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-transparent"></div>

        <div className="relative z-10 flex flex-col items-start gap-md mt-xl">
          <div className="flex gap-2 mb-sm">
            <div className="w-12 h-1 bg-secondary-container rounded-full"></div>
            <div className="w-4 h-1 bg-tertiary-fixed-dim rounded-full"></div>
          </div>
          <div className="bg-surface/10 backdrop-blur-md p-sm rounded-lg border border-surface/20 inline-flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="NIRMAAN Logo"
              className="h-24 w-auto object-contain drop-shadow-md"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuByyJ7xYLb9uzMxMCbnpc6HZWc6lE5564hI04IexbvqVtY7aR8JOuSzZDfH2gJHFbM6zVxl9wJcXVzfTnT5_0XX3ZPZZnf_B23RJEhFdEjw7XR5GH4gTa1MXAAgjmwhQHSNFVP06GEju49_D0K2DsFHBjZAzUqK5wNb02ipP9YIV3M-E2NbTGD99P_pvjF3n2RQatvTMVZDcmypCTF_TKgbj4Tlhrg9NSMui7XbnhvQRSstaeu17opOh8dsWmwJA2eC3sXl00AVvg"
            />
          </div>
          <div className="mt-lg">
            <h1 className="font-display-lg text-4xl text-on-primary tracking-tight font-bold">NIRMAAN</h1>
            <p className="font-body-lg text-lg text-primary-fixed-dim mt-xs max-w-[28rem]">
              Government Project Management System
            </p>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-sm text-primary-fixed-dim font-label-sm text-xs uppercase tracking-wider mt-auto mb-8">
          <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>shield_lock</span>
          <span>Classified &amp; Secure Infrastructure Gateway</span>
        </div>
      </div>

      {/* Right Side: Auth Panel */}
      <div className="flex flex-col justify-center items-center p-margin-mobile sm:p-md lg:p-xl bg-surface relative">
        {/* Mobile logo */}
        <div className="lg:hidden flex flex-col items-center mb-lg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="NIRMAAN Logo"
            className="h-16 w-auto object-contain mb-sm"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuByyJ7xYLb9uzMxMCbnpc6HZWc6lE5564hI04IexbvqVtY7aR8JOuSzZDfH2gJHFbM6zVxl9wJcXVzfTnT5_0XX3ZPZZnf_B23RJEhFdEjw7XR5GH4gTa1MXAAgjmwhQHSNFVP06GEju49_D0K2DsFHBjZAzUqK5wNb02ipP9YIV3M-E2NbTGD99P_pvjF3n2RQatvTMVZDcmypCTF_TKgbj4Tlhrg9NSMui7XbnhvQRSstaeu17opOh8dsWmwJA2eC3sXl00AVvg"
          />
          <h1 className="font-headline-lg-mobile text-2xl text-primary tracking-tight font-bold">NIRMAAN</h1>
        </div>

        <div className="w-full max-w-[28rem] bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 overflow-hidden relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-secondary-container"></div>

          {/* Main Tab Bar */}
          <div className="flex border-b border-outline-variant/30">
            <button
              onClick={() => setMainTab("signin")}
              className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                mainTab === "signin"
                  ? "text-primary border-b-2 border-primary bg-surface-container-lowest"
                  : "text-on-surface-variant hover:text-on-surface bg-surface-container-low"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMainTab("register"); setRegSuccess(false) }}
              className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                mainTab === "register"
                  ? "text-primary border-b-2 border-primary bg-surface-container-lowest"
                  : "text-on-surface-variant hover:text-on-surface bg-surface-container-low"
              }`}
            >
              Request Access
            </button>
          </div>

          <div className="p-lg">
            {/* ─── SIGN IN TAB ─── */}
            {mainTab === "signin" && (
              <div className="space-y-md">
                <div>
                  <h2 className="font-headline-lg-mobile lg:font-headline-lg text-2xl font-bold text-on-surface">
                    Secure Login
                  </h2>
                  <p className="font-body-md text-sm text-on-surface-variant mt-xs">
                    Access the project management portal.
                  </p>
                </div>

                {/* Sign-in method pills */}
                <div className="flex gap-xs">
                  <button
                    onClick={() => setSignInMethod("google")}
                    className={`flex-1 py-1.5 px-3 rounded-full text-xs font-semibold border transition-colors ${
                      signInMethod === "google"
                        ? "bg-primary text-on-primary border-primary"
                        : "bg-transparent text-on-surface-variant border-outline-variant hover:border-outline"
                    }`}
                  >
                    Google
                  </button>
                  <button
                    onClick={() => setSignInMethod("credentials")}
                    className={`flex-1 py-1.5 px-3 rounded-full text-xs font-semibold border transition-colors ${
                      signInMethod === "credentials"
                        ? "bg-primary text-on-primary border-primary"
                        : "bg-transparent text-on-surface-variant border-outline-variant hover:border-outline"
                    }`}
                  >
                    Credentials
                  </button>
                </div>

                {/* Google Sign-in */}
                {signInMethod === "google" && (
                  <div className="space-y-md">
                    <div className="space-y-sm">
                      <label className="font-label-sm text-xs font-semibold text-on-surface-variant uppercase">
                        Role Reference
                      </label>
                      <div className="grid grid-cols-3 gap-xs">
                        <div className="flex flex-col items-center justify-center p-sm border border-outline-variant/50 rounded-lg text-on-surface-variant">
                          <span className="material-symbols-outlined mb-xs text-outline">admin_panel_settings</span>
                          <span className="font-label-sm text-xs font-medium">Admin</span>
                        </div>
                        <div className="flex flex-col items-center justify-center p-sm border border-outline-variant/50 rounded-lg text-on-surface-variant">
                          <span className="material-symbols-outlined mb-xs text-outline">badge</span>
                          <span className="font-label-sm text-xs font-medium">Officer</span>
                        </div>
                        <div className="flex flex-col items-center justify-center p-sm border border-outline-variant/50 rounded-lg text-on-surface-variant">
                          <span className="material-symbols-outlined mb-xs text-outline">engineering</span>
                          <span className="font-label-sm text-xs font-medium text-center">Contractor</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={handleGoogleSignIn}
                      className="w-full flex justify-center items-center gap-2 bg-primary text-on-primary font-title-md font-semibold py-3 px-4 rounded transition-all active:scale-[0.98] shadow-sm hover:bg-primary/90"
                      type="button"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="https://www.google.com/favicon.ico"
                        alt="Google"
                        className="w-5 h-5 bg-white rounded-full p-0.5"
                      />
                      <span>Sign in with Google</span>
                    </button>
                  </div>
                )}

                {/* Credentials Sign-in */}
                {signInMethod === "credentials" && (
                  <form onSubmit={handleCredentialsSignIn} className="space-y-sm">
                    <div>
                      <label className="block font-label-sm text-xs text-on-surface-variant mb-1 uppercase">
                        Email or Mobile Number
                      </label>
                      <input
                        type="text"
                        placeholder="Email or phone number"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        required
                        className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded focus:border-primary-container focus:ring-1 focus:ring-primary-container/50 font-body-md text-sm text-on-surface placeholder:text-outline transition-colors outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-label-sm text-xs text-on-surface-variant mb-1 uppercase">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="w-full px-3 py-2 pr-10 bg-surface-container-low border border-outline-variant rounded focus:border-primary-container focus:ring-1 focus:ring-primary-container/50 font-body-md text-sm text-on-surface placeholder:text-outline transition-colors outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface-variant"
                          tabIndex={-1}
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            {showPassword ? "visibility_off" : "visibility"}
                          </span>
                        </button>
                      </div>
                    </div>

                    {credError && (
                      <p className="text-sm text-error bg-error/5 border border-error/20 rounded px-3 py-2">
                        {credError}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={credLoading}
                      className="w-full bg-primary text-on-primary font-title-md font-semibold py-3 px-4 rounded transition-all active:scale-[0.98] shadow-sm hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {credLoading ? "Signing in..." : "Sign In"}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* ─── REGISTER TAB ─── */}
            {mainTab === "register" && (
              <div className="space-y-md">
                <div>
                  <h2 className="font-headline-lg-mobile lg:font-headline-lg text-2xl font-bold text-on-surface">
                    Request Access
                  </h2>
                  <p className="font-body-md text-sm text-on-surface-variant mt-xs">
                    Submit a registration request. An admin will review and approve your access.
                  </p>
                </div>

                {regSuccess ? (
                  <div className="bg-on-tertiary-container/10 border border-on-tertiary-container/30 rounded-lg p-4 flex items-start gap-3">
                    <span className="material-symbols-outlined text-on-tertiary-container mt-0.5">check_circle</span>
                    <p className="text-sm text-on-tertiary-container font-medium">
                      Request submitted! The system administrator will review and approve your access. You will be notified once approved.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleRegister} className="space-y-sm">
                    {/* Full Name */}
                    <div>
                      <label className="block font-label-sm text-xs text-on-surface-variant mb-1 uppercase">
                        Full Name <span className="text-error">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Your full name"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        required
                        className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded focus:border-primary-container focus:ring-1 focus:ring-primary-container/50 font-body-md text-sm text-on-surface placeholder:text-outline transition-colors outline-none"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block font-label-sm text-xs text-on-surface-variant mb-1 uppercase">
                        Email Address
                      </label>
                      <input
                        type="email"
                        placeholder="your@email.com (optional if phone provided)"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded focus:border-primary-container focus:ring-1 focus:ring-primary-container/50 font-body-md text-sm text-on-surface placeholder:text-outline transition-colors outline-none"
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block font-label-sm text-xs text-on-surface-variant mb-1 uppercase">
                        Mobile Number
                      </label>
                      <input
                        type="tel"
                        placeholder="Phone number (optional if email provided)"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded focus:border-primary-container focus:ring-1 focus:ring-primary-container/50 font-body-md text-sm text-on-surface placeholder:text-outline transition-colors outline-none"
                      />
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block font-label-sm text-xs text-on-surface-variant mb-1 uppercase">
                        Password <span className="text-error">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={regShowPassword ? "text" : "password"}
                          placeholder="Min. 8 characters"
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          required
                          minLength={8}
                          className="w-full px-3 py-2 pr-10 bg-surface-container-low border border-outline-variant rounded focus:border-primary-container focus:ring-1 focus:ring-primary-container/50 font-body-md text-sm text-on-surface placeholder:text-outline transition-colors outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setRegShowPassword((v) => !v)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface-variant"
                          tabIndex={-1}
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            {regShowPassword ? "visibility_off" : "visibility"}
                          </span>
                        </button>
                      </div>
                      {regPasswordStrength && (
                        <div className="mt-1.5 space-y-0.5">
                          <div className="h-1 w-full bg-surface-container rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${strengthColor[regPasswordStrength]} ${strengthWidth[regPasswordStrength]}`}
                            />
                          </div>
                          <p className="text-xs text-on-surface-variant">
                            Strength: <span className="font-medium">{strengthLabel[regPasswordStrength]}</span>
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block font-label-sm text-xs text-on-surface-variant mb-1 uppercase">
                        Confirm Password <span className="text-error">*</span>
                      </label>
                      <input
                        type={regShowPassword ? "text" : "password"}
                        placeholder="Re-enter your password"
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        required
                        className={`w-full px-3 py-2 bg-surface-container-low border rounded focus:ring-1 focus:ring-primary-container/50 font-body-md text-sm text-on-surface placeholder:text-outline transition-colors outline-none ${
                          regConfirmPassword && regPassword !== regConfirmPassword
                            ? "border-error focus:border-error"
                            : "border-outline-variant focus:border-primary-container"
                        }`}
                      />
                      {regConfirmPassword && regPassword !== regConfirmPassword && (
                        <p className="text-xs text-error mt-1">Passwords do not match</p>
                      )}
                    </div>

                    {/* Requested Role */}
                    <div>
                      <label className="block font-label-sm text-xs text-on-surface-variant mb-2 uppercase">
                        Requested Role <span className="text-error">*</span>
                      </label>
                      <div className="grid grid-cols-2 gap-xs">
                        {(["OFFICER", "CONTRACTOR"] as const).map((role) => (
                          <button
                            key={role}
                            type="button"
                            onClick={() => setRegRole(role)}
                            className={`flex flex-col items-center justify-center p-sm border rounded-lg transition-colors ${
                              regRole === role
                                ? "border-primary bg-primary/5 text-primary"
                                : "border-outline-variant/50 text-on-surface-variant hover:border-outline"
                            }`}
                          >
                            <span className="material-symbols-outlined mb-xs">
                              {role === "OFFICER" ? "badge" : "engineering"}
                            </span>
                            <span className="font-label-sm text-xs font-medium">{role === "OFFICER" ? "Officer" : "Contractor"}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {regError && (
                      <p className="text-sm text-error bg-error/5 border border-error/20 rounded px-3 py-2">
                        {regError}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={regLoading}
                      className="w-full bg-primary text-on-primary font-title-md font-semibold py-3 px-4 rounded transition-all active:scale-[0.98] shadow-sm hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {regLoading ? "Submitting..." : "Submit Request"}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-xl flex flex-col items-center justify-center gap-xs text-center mt-12">
          <p className="font-label-sm text-xs text-on-surface-variant/80 uppercase tracking-widest flex items-center gap-2">
            <span className="w-6 h-[1px] bg-outline-variant/50"></span>
            Digital India Initiative
            <span className="w-6 h-[1px] bg-outline-variant/50"></span>
          </p>
          <p className="font-label-sm text-xs text-outline">Ministry of Infrastructure &amp; Development</p>
        </div>
      </div>
    </div>
  )
}
