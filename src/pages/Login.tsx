import { useState, type FormEvent } from "react";
import { useAuth } from "../lib/auth";

export function Login() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!login(username, password)) {
      setError(true);
      setPassword("");
    }
  };

  return (
    <div className="login-wrap">
      <form className="login-card" onSubmit={submit}>
        <div className="eyebrow">dMAT Portal</div>
        <h1 style={{ fontSize: "1.5rem", marginBottom: 4 }}>Sign in</h1>
        <p style={{ color: "var(--ink-soft)", fontSize: "0.86rem", margin: "0 0 18px" }}>
          Your syllabus coverage, answers and mock-exam history are tracked per user.
        </p>

        <label className="login-label" htmlFor="u">Username</label>
        <input
          id="u"
          className="login-input mono"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            setError(false);
          }}
          autoComplete="username"
          autoFocus
        />

        <label className="login-label" htmlFor="p">Password</label>
        <input
          id="p"
          className="login-input mono"
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError(false);
          }}
          autoComplete="current-password"
        />

        {error && <div className="login-error">Wrong username or password.</div>}

        <button type="submit" className="btn primary" style={{ width: "100%", justifyContent: "center", marginTop: 14 }}>
          Sign in →
        </button>
      </form>
    </div>
  );
}
