
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";

import { auth } from "../firebase";

function AdminLogin() {
  const navigate = useNavigate();

  const [isFlipped, setIsFlipped] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // LOGIN WITH FIREBASE
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      // Step 1: Authenticate user with Firebase
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      // Step 2: Get Firebase ID token
      const token = await userCredential.user.getIdToken();

      // Step 3: Verify admin permission with backend
      await axios.post(
        "http://localhost:5000/api/auth/register",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Step 4: Store token and navigate to dashboard
      localStorage.setItem("adminToken", token);

      navigate("/admin/dashboard");
    } catch (err) {
      console.error("Login Error:", err);

      localStorage.removeItem("adminToken");

      setError(
        err.response?.data?.message ||
          err.message ||
          "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  // SIGNUP WITH FIREBASE
  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      // Step 1: Create Firebase account
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        signupEmail.trim(),
        signupPassword
      );

      // Step 2: Get Firebase ID token
      const token = await userCredential.user.getIdToken();

      // Step 3: Verify admin permission with backend
      await axios.post(
        "http://localhost:5000/api/auth/register",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Step 4: Sign out after signup
      // User can now sign in through the login form
      const { signOut } = await import("firebase/auth");
      await signOut(auth);

      setEmail(signupEmail.trim());
      setPassword("");
      setSignupPassword("");
      setSignupEmail("");

      setIsFlipped(false);
      setSuccess("Account created successfully! Please sign in.");
    } catch (err) {
      console.error("Signup Error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Signup failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // PASSWORD EYE ICON
  const EyeIcon = ({ visible }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {visible ? (
        <>
          <path d="M3 3l18 18" />
          <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
          <path d="M9.9 5.2A11 11 0 0 1 12 5c5 0 9 5 10 7a14 14 0 0 1-4 4.5" />
          <path d="M6.2 6.2C3.8 7.7 2.4 10 2 12c1 2 5 7 10 7a10 10 0 0 0 3-.5" />
        </>
      ) : (
        <>
          <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" />
          <circle cx="12" cy="12" r="3" />
        </>
      )}
    </svg>
  );

  return (
    <div className="min-h-screen bg-[#FAF3EA] flex items-center justify-center px-5 py-10 overflow-hidden">

      <style>{`
        .flip-scene {
          perspective: 1200px;
          width: 100%;
          max-width: 420px;
          height: 560px;
        }

        .flip-card {
          width: 100%;
          height: 100%;
          position: relative;
          transform-style: preserve-3d;
          transition: transform 0.8s cubic-bezier(.4,.2,.2,1);
        }

        .flip-card.flipped {
          transform: rotateY(180deg);
        }

        .flip-face {
          position: absolute;
          inset: 0;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          background: #FAF3EA;
          border-radius: 30px;
          box-shadow:
            12px 12px 28px #dfd9d1,
            -12px -12px 28px #ffffff;
        }

        .flip-back {
          transform: rotateY(180deg);
        }

        .soft-input {
          background: #FAF3EA;
          box-shadow:
            inset 5px 5px 10px #dfd9d1,
            inset -5px -5px 10px #ffffff;
        }

        .soft-button {
          background: linear-gradient(145deg, #B96F50, #783F32);
          box-shadow:
            5px 5px 12px #d7c6b9,
            -5px -5px 12px #ffffff;
          transition: all 0.25s ease;
        }

        .soft-button:hover {
          transform: translateY(-2px);
        }

        .soft-button:active {
          transform: scale(.97);
        }

        @media (max-width: 480px) {
          .flip-scene {
            height: 550px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .flip-card {
            transition-duration: 0.01ms;
          }
        }
      `}</style>

      <div className="flip-scene">
        <div className={`flip-card ${isFlipped ? "flipped" : ""}`}>

          {/* LOGIN PAGE */}
          <div className="flip-face p-8 sm:p-11 flex flex-col justify-center">

            <div className="text-center mb-9">
              <div className="mx-auto mb-5 w-16 h-16 rounded-full flex items-center justify-center text-[#783F32] shadow-[6px_6px_12px_#dfd9d1,-6px_-6px_12px_#ffffff]">
                <span className="text-3xl">✦</span>
              </div>

              <h1 className="text-3xl font-bold text-[#783F32]">
                Welcome Back
              </h1>

              <p className="text-sm text-[#9A8175] mt-3">
                Sign in to continue to your journal
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">

              <div>
                <label className="block text-sm font-semibold text-[#783F32] mb-3">
                  Email Address
                </label>

                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="soft-input w-full rounded-xl px-5 py-4 outline-none text-sm text-[#783F32] placeholder:text-[#B9A59A]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#783F32] mb-3">
                  Password
                </label>

                <div className="relative">
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="soft-input w-full rounded-xl px-5 py-4 pr-14 outline-none text-sm text-[#783F32] placeholder:text-[#B9A59A]"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowLoginPassword(!showLoginPassword)
                    }
                    aria-label={
                      showLoginPassword ? "Hide password" : "Show password"
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#B96F50] hover:text-[#783F32]"
                  >
                    <EyeIcon visible={showLoginPassword} />
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-600 text-center">
                  {error}
                </p>
              )}

              {success && (
                <p className="text-sm text-green-700 text-center">
                  {success}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="soft-button w-full rounded-xl py-4 text-white font-semibold tracking-wide disabled:opacity-60"
              >
                {loading ? "PLEASE WAIT..." : "SIGN IN"}
              </button>
            </form>

            <div className="text-center mt-8">
              <p className="text-sm text-[#9A8175]">
                Don't have an account?
              </p>

              <button
                type="button"
                onClick={() => {
                  setError("");
                  setSuccess("");
                  setIsFlipped(true);
                }}
                className="mt-2 text-sm font-bold text-[#B96F50] hover:text-[#783F32]"
              >
                SIGN UP
              </button>
            </div>

            <button
              type="button"
              onClick={() => navigate("/")}
              className="mt-7 text-xs text-[#A18B7F] hover:text-[#783F32]"
            >
              ← Back to Home
            </button>
          </div>

          {/* SIGNUP PAGE */}
          <div className="flip-face flip-back p-8 sm:p-11 flex flex-col justify-center">

            <div className="text-center mb-9">
              <div className="mx-auto mb-5 w-16 h-16 rounded-full flex items-center justify-center text-[#783F32] shadow-[6px_6px_12px_#dfd9d1,-6px_-6px_12px_#ffffff]">
                <span className="text-3xl">✧</span>
              </div>

              <h1 className="text-3xl font-bold text-[#783F32]">
                Create Account
              </h1>

              <p className="text-sm text-[#9A8175] mt-3">
                Join us and start sharing your stories
              </p>
            </div>

            <form onSubmit={handleSignup} className="space-y-6">

              <div>
                <label className="block text-sm font-semibold text-[#783F32] mb-3">
                  Email Address
                </label>

                <input
                  type="email"
                  placeholder="Enter your email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  required
                  className="soft-input w-full rounded-xl px-5 py-4 outline-none text-sm text-[#783F32] placeholder:text-[#B9A59A]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#783F32] mb-3">
                  Password
                </label>

                <div className="relative">
                  <input
                    type={showSignupPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    minLength={8}
                    required
                    className="soft-input w-full rounded-xl px-5 py-4 pr-14 outline-none text-sm text-[#783F32] placeholder:text-[#B9A59A]"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowSignupPassword(!showSignupPassword)
                    }
                    aria-label={
                      showSignupPassword ? "Hide password" : "Show password"
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#B96F50] hover:text-[#783F32]"
                  >
                    <EyeIcon visible={showSignupPassword} />
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-600 text-center">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="soft-button w-full rounded-xl py-4 text-white font-semibold tracking-wide disabled:opacity-60"
              >
                {loading ? "PLEASE WAIT..." : "CREATE ACCOUNT"}
              </button>
            </form>

            <div className="text-center mt-8">
              <p className="text-sm text-[#9A8175]">
                Already have an account?
              </p>

              <button
                type="button"
                onClick={() => {
                  setError("");
                  setIsFlipped(false);
                }}
                className="mt-2 text-sm font-bold text-[#B96F50] hover:text-[#783F32]"
              >
                SIGN IN
              </button>
            </div>

            <button
              type="button"
              onClick={() => navigate("/")}
              className="mt-7 text-xs text-[#A18B7F] hover:text-[#783F32]"
            >
              ← Back to Home
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
