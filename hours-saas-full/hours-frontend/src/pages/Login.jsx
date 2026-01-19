
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { api } from "../api";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const { login } = useContext(AuthContext);
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function submit(e) {
    e.preventDefault();
    const res = await api("/auth/login", "POST", { email, password });
    if (res.token) {
      login(res.token);
      nav("/");
    }
  }

  return (
    <div className="p-6 max-w-md mx-auto mt-20 bg-white shadow rounded">
      <h1 className="text-xl font-bold mb-4">Login</h1>
      <form onSubmit={submit} className="space-y-3">
        <input
          className="border p-2 w-full"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="border p-2 w-full"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="bg-blue-600 text-white p-2 rounded w-full">
          Login
        </button>
      </form>

      <p className="mt-3 text-sm">
        No account?{" "}
        <Link to="/register" className="text-blue-500">
          Register
        </Link>
      </p>
    </div>
  );
}
