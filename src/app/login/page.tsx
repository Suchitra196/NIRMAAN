"use client"

import { signIn, useSession } from "next-auth/react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  // Redirect already-authenticated users to their dashboard
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const role = (session.user as any).role as string | undefined
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
    // Role is determined from the DB after login, not from the selector.
    // The selector is informational/UX only — the actual role comes from the
    // user's record in the database (assigned by Admin).
    signIn("google", { callbackUrl: "/admin" })
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

      {/* Right Side: Login Panel */}
      <div className="flex flex-col justify-center items-center p-margin-mobile sm:p-md lg:p-xl bg-surface relative">
        <div className="lg:hidden flex flex-col items-center mb-lg">
          <img
            alt="NIRMAAN Logo"
            className="h-16 w-auto object-contain mb-sm"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuByyJ7xYLb9uzMxMCbnpc6HZWc6lE5564hI04IexbvqVtY7aR8JOuSzZDfH2gJHFbM6zVxl9wJcXVzfTnT5_0XX3ZPZZnf_B23RJEhFdEjw7XR5GH4gTa1MXAAgjmwhQHSNFVP06GEju49_D0K2DsFHBjZAzUqK5wNb02ipP9YIV3M-E2NbTGD99P_pvjF3n2RQatvTMVZDcmypCTF_TKgbj4Tlhrg9NSMui7XbnhvQRSstaeu17opOh8dsWmwJA2eC3sXl00AVvg"
          />
          <h1 className="font-headline-lg-mobile text-2xl text-primary tracking-tight font-bold">NIRMAAN</h1>
        </div>

        <div className="w-full max-w-[28rem] bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 overflow-hidden relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-secondary-container"></div>
          <div className="p-lg">
            <div className="mb-lg">
              <h2 className="font-headline-lg-mobile lg:font-headline-lg text-2xl lg:text-3xl font-bold text-on-surface">
                Secure Login
              </h2>
              <p className="font-body-md text-base text-on-surface-variant mt-xs">
                Access the project management portal. Your role is assigned by the system administrator.
              </p>
            </div>

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

              {/* Login Button */}
              <div className="pt-sm space-y-4 mt-8">
                <button
                  onClick={handleGoogleSignIn}
                  className="w-full flex justify-center items-center gap-2 bg-primary text-on-primary font-title-md font-semibold py-3 px-4 rounded transition-all active:scale-[0.98] shadow-sm hover:bg-primary/90 relative overflow-hidden"
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
            </div>
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
