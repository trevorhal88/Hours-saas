
const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "..", "db.json");

function loadDb() {
  if (!fs.existsSync(DB_PATH)) {
    const initial = { users: [], orgs: [], visits: [] };
    fs.writeFileSync(DB_PATH, JSON.stringify(initial, null, 2));
    return initial;
  }
  const raw = fs.readFileSync(DB_PATH, "utf8");
  try {
    return JSON.parse(raw);
  } catch (e) {
    return { users: [], orgs: [], visits: [] };
  }
}

function saveDb(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

function getDb() {
  return loadDb();
}

module.exports = {
  getDb,
  saveDb,
};
