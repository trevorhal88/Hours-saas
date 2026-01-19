
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { api } from "../api";

export default function Dashboard() {
  const { token, logout } = useContext(AuthContext);
  const [visits, setVisits] = useState([]);

  useEffect(() => {
    async function load() {
      const v = await api("/hours/visits", "GET", null, token);
      setVisits(v.visits || []);
    }
    load();
  }, []);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

      <button
        onClick={logout}
        className="bg-red-500 text-white px-3 py-1 rounded"
      >
        Logout
      </button>

      <div className="mt-4 flex gap-2">
        <ClockButton token={token} />
      </div>

      <h2 className="text-xl mt-6 mb-2 font-semibold">Hours History</h2>

      <div className="bg-white shadow p-4 rounded">
        {visits.map((v) => (
          <div key={v.id} className="border-b py-2">
            <p>
              <strong>Start:</strong>{" "}
              {new Date(v.startTime).toLocaleString()}
            </p>
            {v.endTime && (
              <p>
                <strong>End:</strong> {new Date(v.endTime).toLocaleString()}
              </p>
            )}
            {v.durationMinutes && (
              <p>
                <strong>Total Minutes:</strong> {v.durationMinutes}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ClockButton({ token }) {
  const [open, setOpen] = useState(false);
  const [lastMsg, setLastMsg] = useState("");

  async function clockIn() {
    const res = await api("/hours/start", "POST", {}, token);
    setOpen(true);
    setLastMsg("Started at " + new Date(res.visit.startTime).toLocaleTimeString());
  }

  async function clockOut() {
    const res = await api("/hours/stop", "POST", {}, token);
    setOpen(false);
    setLastMsg(
      "Stopped at " +
        new Date(res.visit.endTime).toLocaleTimeString() +
        " (" +
        res.visit.durationMinutes +
        " min)",
    );
  }

  return (
    <div>
      {open ? (
        <button
          onClick={clockOut}
          className="bg-yellow-500 text-white px-3 py-1 rounded mr-2"
        >
          Clock Out
        </button>
      ) : (
        <button
          onClick={clockIn}
          className="bg-green-600 text-white px-3 py-1 rounded mr-2"
        >
          Clock In
        </button>
      )}
      {lastMsg && <p className="text-sm mt-1">{lastMsg}</p>}
    </div>
  );
}
