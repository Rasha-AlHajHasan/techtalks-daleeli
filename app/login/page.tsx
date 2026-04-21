'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { type FormEvent, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

type AuthMode = 'signin' | 'forgot' | 'recovery'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<AuthMode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('')

  useEffect(() => {
    let isMounted = true
    const recoveryInUrl =
      window.location.hash.includes('type=recovery') ||
      window.location.search.includes('type=recovery')

    const initializeAuthState = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!isMounted) {
        return
      }

      if (recoveryInUrl) {
        setMode('recovery')
        setMessageType('success')
        setMessage('Enter a new password below to finish resetting your password.')
        return
      }

      if (session) {
        router.replace('/')
      }
    }

    initializeAuthState()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (!isMounted) {
        return
      }

      if (event === 'PASSWORD_RECOVERY') {
        setMode('recovery')
        setMessageType('success')
        setMessage('Enter a new password below to finish resetting your password.')
        return
      }

      if (event === 'SIGNED_IN' && !recoveryInUrl) {
        router.replace('/')
      }
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [router])

  const resetFeedback = () => {
    setMessage('')
    setMessageType('')
  }

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    resetFeedback()

    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setLoading(false)

    if (error) {
      setMessageType('error')
      setMessage(error.message)
      return
    }

    setMessageType('success')
    setMessage('Login successful. Redirecting...')
    router.replace('/')
  }

  const handleForgotPassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    resetFeedback()

    if (!email.trim()) {
      setMessageType('error')
      setMessage('Please enter your email address first.')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    })

    setLoading(false)

    if (error) {
      setMessageType('error')
      setMessage(error.message)
      return
    }

    setMessageType('success')
    setMessage('Password reset instructions have been sent to your email address.')
  }

  const handleUpdatePassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    resetFeedback()

    if (newPassword.trim().length < 6) {
      setMessageType('error')
      setMessage('Your new password must be at least 6 characters long.')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    setLoading(false)

    if (error) {
      setMessageType('error')
      setMessage(error.message)
      return
    }

    setMessageType('success')
    setMessage('Your password has been updated. You can now continue to your account.')
    setNewPassword('')
    router.replace('/')
  }

  const isForgotMode = mode === 'forgot'
  const isRecoveryMode = mode === 'recovery'

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 pt-24">
      <section className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-6xl items-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid w-full grid-cols-1 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)] lg:grid-cols-[0.95fr_1.05fr]">
          <div className="flex flex-col justify-between bg-[#17263f] px-6 py-8 text-white sm:px-8 lg:px-10">
            <div>
              <div className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-100">
                Daleeli
              </div>

              <h1 className="mt-5 max-w-md text-2xl font-bold leading-tight sm:text-3xl">
                Access your account and continue with your syndicate services
              </h1>

              <p className="mt-4 max-w-md text-sm leading-6 text-slate-300">
                Sign in securely to manage your profile, review updates, and access the
                services available to your syndicate membership.
              </p>
            </div>

            <div className="mt-8 space-y-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <h2 className="text-sm font-semibold">Login details</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Use the email address and password linked to your Daleeli account.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <h2 className="text-sm font-semibold">Need a new account?</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Register first to connect your personal account with your syndicate
                  information.
                </p>
                <Link
                  href="/register"
                  className="mt-4 inline-flex rounded-xl bg-white px-4 py-2 text-sm font-semibold text-[#17263f] transition hover:bg-slate-200"
                >
                  Go to Register
                </Link>
              </div>
            </div>
          </div>

          <div className="px-5 py-6 sm:px-8 sm:py-8 lg:px-10">
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                {isRecoveryMode ? 'Reset Password' : isForgotMode ? 'Forgot Password' : 'Login'}
              </p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
                {isRecoveryMode
                  ? 'Choose a new password'
                  : isForgotMode
                    ? 'Reset your password'
                    : 'Welcome back'}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {isRecoveryMode
                  ? 'Set a new password for your Daleeli account.'
                  : isForgotMode
                    ? 'Enter your email address and we will send you password reset instructions.'
                    : 'Sign in with your email and password to continue.'}
              </p>
            </div>

            {isRecoveryMode ? (
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    New Password
                  </label>
                  <input
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#1a2b48] focus:ring-2 focus:ring-slate-200"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter your new password"
                    minLength={6}
                    autoComplete="new-password"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-[#1a2b48] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#142238] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? 'Updating Password...' : 'Update Password'}
                </button>
              </form>
            ) : isForgotMode ? (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Email
                  </label>
                  <input
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#1a2b48] focus:ring-2 focus:ring-slate-200"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    autoComplete="email"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-[#1a2b48] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#142238] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? 'Sending Reset Link...' : 'Send Reset Link'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    resetFeedback()
                    setMode('signin')
                  }}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Back to Login
                </button>
              </form>
            ) : (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Email
                  </label>
                  <input
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#1a2b48] focus:ring-2 focus:ring-slate-200"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    autoComplete="email"
                    required
                  />
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <label className="block text-sm font-semibold text-slate-700">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        resetFeedback()
                        setMode('forgot')
                      }}
                      className="text-sm font-semibold text-[#1a2b48] transition hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <input
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#1a2b48] focus:ring-2 focus:ring-slate-200"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-[#1a2b48] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#142238] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? 'Signing In...' : 'Login'}
                </button>
              </form>
            )}

            {message && (
              <div
                className={`mt-4 rounded-xl border px-4 py-3 text-sm ${
                  messageType === 'success'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-red-200 bg-red-50 text-red-700'
                }`}
              >
                {message}
              </div>
            )}

            {!isRecoveryMode && (
              <p className="mt-5 text-center text-sm text-slate-600">
                Don&apos;t have an account yet?{' '}
                <Link
                  href="/register"
                  className="font-semibold text-[#1a2b48] hover:underline"
                >
                  Register here
                </Link>
              </p>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
