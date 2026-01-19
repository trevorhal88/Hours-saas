
const express = require("express");
const cors = require("cors");
const {
  registerUser,
  loginUser,
  createToken,
  authMiddleware,
  findUserById,
  getOrgMembers,
  getUserVisits,
  startVisit,
  stopVisit,
} = require("./auth");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ ok: true, message: "Hours backend running" });
});

app.post("/auth/register", (req, res) => {
  const { email, password, orgName } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }
  try {
    const user = registerUser(email, password, orgName || null);
    const token = createToken(user);
    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        orgId: user.orgId,
        role: user.role,
      },
      token,
    });
  } catch (e) {
    if (e.message === "User already exists") {
      return res.status(400).json({ error: e.message });
    }
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/auth/login", (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }
  try {
    const user = loginUser(email, password);
    const token = createToken(user);
    res.json({
      user: {
        id: user.id,
        email: user.email,
        orgId: user.orgId,
        role: user.role,
      },
      token,
    });
  } catch (e) {
    if (e.message === "Invalid email or password") {
      return res.status(401).json({ error: e.message });
    }
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/me", authMiddleware, (req, res) => {
  const user = findUserById(req.user.userId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  res.json({
    user: {
      id: user.id,
      email: user.email,
      orgId: user.orgId,
      role: user.role,
    },
  });
});

app.get("/org/members", authMiddleware, (req, res) => {
  if (!req.user.orgId) {
    return res.status(400).json({ error: "User not in an organization" });
  }
  const members = getOrgMembers(req.user.orgId).map((u) => ({
    id: u.id,
    email: u.email,
    role: u.role,
  }));
  res.json({ members });
});

app.get("/hours/visits", authMiddleware, (req, res) => {
  const visits = getUserVisits(req.user.userId);
  res.json({ visits });
});

// Manual clock in/out endpoints, can be driven by GPS or UI later
app.post("/hours/start", authMiddleware, (req, res) => {
  const visit = startVisit(req.user.userId);
  res.json({ visit });
});

app.post("/hours/stop", authMiddleware, (req, res) => {
  const visit = stopVisit(req.user.userId);
  if (!visit) {
    return res.status(400).json({ error: "No open visit" });
  }
  res.json({ visit });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Hours backend listening on port " + PORT);
});
