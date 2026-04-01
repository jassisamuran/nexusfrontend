import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, register } from "../api";
const LoginPage = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState("login");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [regForm, setRegForm] = useState({
    username: "",
    email: "",
    password: "",
  });
  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(loginForm.email, loginForm.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(regForm.username, regForm.email, regForm.password);
      setSuccess("Account created! Signign you in ...");
      await login(regForm.email, regForm.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div></div>
      <h1>Nexus</h1>
      <p>Autonomous AI software Engineering</p>

      <div>
        {["login", "register"].map((t) => (
          <button
            key={t}
            onClick={() => {
              setTab(t);
              setError;
            }}
          >
            {t == "login" ? "Sign In" : "Create Account"}
          </button>
        ))}
      </div>

      {error & <div>{error}</div>}
      {success && <div>{success}</div>}

      {tab == "login" ? (
        <form onSubmit={handleLogin}>
          <div>
            <label>Email</label>
            <input
              type="email"
              value={loginForm.email}
              onChange={(e) =>
                setLoginForm((p) => ({ ...p, email: e.target.value }))
              }
              required
            />
          </div>
          <div>
            <label>Password</label>
            <input
              type="password"
              value={loginForm.password}
              onChange={(e) =>
                setLoginForm((p) => ({ ...p, password: e.target.value }))
              }
              required
            />
          </div>
          <button disabled={loading} type="submit">
            {loading ? "Signing in...." : "Sign In"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleRegister}>
          <div>
            <label>Username</label>
            <input
              type="text"
              placeholder="your_username"
              value={regForm.username}
              onChange={(e) =>
                setRegForm((p) => ({ ...p, username: e.target.value }))
              }
              required
            />
          </div>
          <div>
            <label>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={regForm.email}
              onChange={(e) =>
                setRegForm((p) => ({ ...p, email: e.target.value }))
              }
              required
            />
          </div>
          <div>
            <label>Password</label>
            <input
              type="password"
              placeholder="Min. 8 characters"
              value={regForm.password}
              onChange={(e) =>
                setRegForm((p) => ({ ...p, password: e.target.value }))
              }
              required
            />
          </div>
          <button disabled={loading} type="submit">
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>
      )}
    </div>
  );
};

export default LoginPage;
