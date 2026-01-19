
import { useState } from "react";
import { api } from "../api";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [orgName, setOrg] = useState("");

  async function submit(e) {
    e.preventDefault();
    const res = await api("/auth/register", "POST", {
      email,
      password,
      orgName,
    });
    if (res.token) nav("/login");
  }

  return (
    <div className="p-6 max-w-md mx-auto mt-20 bg-white shadow rounded">
      <h1 className="text-xl font-bold mb-4">Register</h1>

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

        <input
          className="border p-2 w-full"
          placeholder="Organization Name"
          value={orgName}
          onChange={(e) => setOrg(e.target.value)}
        />

        <button className="bg-green-600 text-white p-2 rounded w-full">
          Register
        </button>
      </form>

      <p className="mt-3 text-sm">
        Already have an account?{" "}
        <Link to="/login" className="text-blue-500">
          Login
        </Link>
      </p>
    </div>
  );
}
