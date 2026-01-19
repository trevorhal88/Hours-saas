
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const { getDb, saveDb } = require("./db");

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

function findUserByEmail(email) {
  const db = getDb();
  return db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

function findUserById(id) {
  const db = getDb();
  return db.users.find((u) => u.id === id);
}

function registerUser(email, password, orgName) {
  const db = getDb();
  if (findUserByEmail(email)) {
    throw new Error("User already exists");
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const userId = uuidv4();
  let orgId = null;

  if (orgName) {
    orgId = uuidv4();
    const org = {
      id: orgId,
      name: orgName,
      createdAt: new Date().toISOString(),
    };
    db.orgs.push(org);
  }

  const user = {
    id: userId,
    email,
    passwordHash,
    orgId,
    role: orgId ? "OWNER" : "USER",
    createdAt: new Date().toISOString(),
  };

  db.users.push(user);
  saveDb(db);
  return user;
}

function loginUser(email, password) {
  const user = findUserByEmail(email);
  if (!user) {
    throw new Error("Invalid email or password");
  }

  const ok = bcrypt.compareSync(password, user.passwordHash);
  if (!ok) {
    throw new Error("Invalid email or password");
  }

  return user;
}

function createToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      orgId: user.orgId || null,
      role: user.role || "USER",
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"] || "";
  const [, token] = authHeader.split(" ");

  if (!token) {
    return res.status(401).json({ error: "Missing token" });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

function getOrgMembers(orgId) {
  const db = getDb();
  return db.users.filter((u) => u.orgId === orgId);
}

function getUserVisits(userId) {
  const db = getDb();
  return db.visits.filter((v) => v.userId === userId);
}

function startVisit(userId) {
  const db = getDb();
  const open = db.visits.find((v) => v.userId === userId && !v.endTime);
  if (open) return open;

  const visit = {
    id: uuidv4(),
    userId,
    startTime: new Date().toISOString(),
    endTime: null,
    durationMinutes: null,
  };
  db.visits.push(visit);
  saveDb(db);
  return visit;
}

function stopVisit(userId) {
  const db = getDb();
  const visit = db.visits.find((v) => v.userId === userId && !v.endTime);
  if (!visit) return null;

  visit.endTime = new Date().toISOString();
  const start = new Date(visit.startTime);
  const end = new Date(visit.endTime);
  const diffMs = end - start;
  visit.durationMinutes = Math.round(diffMs / 60000);
  saveDb(db);
  return visit;
}

module.exports = {
  registerUser,
  loginUser,
  createToken,
  authMiddleware,
  findUserById,
  getOrgMembers,
  getUserVisits,
  startVisit,
  stopVisit,
};
