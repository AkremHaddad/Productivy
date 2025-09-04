// src/pages/Account.jsx
import React, { useState, useEffect } from "react";
import Navbar from "../allPages/Navbar";
import Footer from "../allPages/Footer";
import { FcGoogle } from "react-icons/fc";
import { getUser, login, register, logout } from "../../api/auth";

const Account = () => {
  const [activeTab, setActiveTab] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check user session
  const checkUserSession = async () => {
    setLoading(true);
    try {
      const userData = await getUser();
      setUser(userData);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkUserSession();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const userData =
        activeTab === "login"
          ? await login(email, password)
          : await register(username, email, password);

      setUser(userData.user);

      // Reset form after successful signup/login
      setEmail("");
      setPassword("");
      setUsername("");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:5000/api/auth/google";
  };

  const handleLogout = async () => {
    try {
      await logout();
      await checkUserSession();
      setActiveTab("login");
      setEmail("");
      setPassword("");
      setUsername("");
      setError("");
    } catch (err) {
      console.error(err);
      setUser(null);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 min-w-full bg-background-light dark:bg-background-dark p-6 flex items-center justify-center">
        {loading ? (
          <p className="text-lg text-text-light dark:text-text-dark">Loading...</p>
        ) : user ? (
          <div className="flex flex-col items-center justify-center">
            <h1 className="text-2xl font-bold mb-4 text-text-light dark:text-text-dark">
              Welcome, {user.username || user.email}!
            </h1>
            <button
              className="px-4 py-2 bg-gray-700 text-white rounded-md hover:opacity-90 transition"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="bg-ui-light dark:bg-black/40 rounded-lg shadow-lg w-full max-w-md p-6">
            {/* Tabs */}
            <div className="flex justify-around mb-6 border-b border-gray-300 dark:border-gray-600">
              <button
                className={`py-2 px-4 font-semibold transition-colors ${
                  activeTab === "login"
                    ? "border-b-2 border-secondary-dark dark:border-accent text-secondary-dark dark:text-accent"
                    : "text-text-light dark:text-text-dark hover:text-secondary-dark dark:hover:text-accent"
                }`}
                onClick={() => setActiveTab("login")}
              >
                Login
              </button>
              <button
                className={`py-2 px-4 font-semibold transition-colors ${
                  activeTab === "signup"
                    ? "border-b-2 border-secondary-dark dark:border-accent text-secondary-dark dark:text-accent"
                    : "text-text-light dark:text-text-dark hover:text-secondary-dark dark:hover:text-accent"
                }`}
                onClick={() => setActiveTab("signup")}
              >
                Sign Up
              </button>
            </div>

            {/* Form */}
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              {activeTab === "signup" && (
                <div>
                  <label className="block mb-1 text-sm font-medium text-text-light dark:text-text-dark">
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark"
                  />
                </div>
              )}

              <div>
                <label className="block mb-1 text-sm font-medium text-text-light dark:text-text-dark">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark"
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-text-light dark:text-text-dark">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark"
                />
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <button
                type="submit"
                className="w-full bg-secondary-dark dark:bg-accent text-black font-semibold py-2 rounded-md hover:opacity-90 transition"
              >
                {activeTab === "login" ? "Login" : "Sign Up"}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center my-6">
              <div className="flex-grow h-px bg-gray-300 dark:bg-gray-600"></div>
              <span className="mx-4 text-gray-500 text-sm">or</span>
              <div className="flex-grow h-px bg-gray-300 dark:bg-gray-600"></div>
            </div>

            {/* Google OAuth */}
            <button
              type="button"
              className="w-full flex items-center justify-center gap-2 border border-gray-300 dark:border-gray-600 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition bg-white text-gray-700"
              onClick={handleGoogleLogin}
            >
              <FcGoogle size={22} />
              Continue with Google
            </button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Account;
