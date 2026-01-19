
import { useContext, useEffect, useState } from "react";
import { api } from "../api";
import { AuthContext } from "../context/AuthContext";

export default function Employees() {
  const { token } = useContext(AuthContext);
  const [members, setMembers] = useState([]);

  useEffect(() => {
    async function load() {
      const res = await api("/org/members", "GET", null, token);
      setMembers(res.members || []);
    }
    load();
  }, []);

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Employees</h1>

      <div className="bg-white shadow rounded p-4">
        {members.map((m) => (
          <div key={m.id} className="border-b py-2">
            {m.email} — {m.role}
          </div>
        ))}
      </div>
    </div>
  );
}
