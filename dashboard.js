const defaults = { mentorStats: { solved: [], hintsUsed: 0, problems: {} } };
async function readStats() {
  const data = await chrome.storage.local.get(defaults);
  return data.mentorStats;
}
function dateLabel(value) {
  if (!value) return "No practice date recorded";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Date unavailable" : date.toLocaleString();
}
async function render() {
  const stats = await readStats();
  const problems = stats.problems || {};
  document.getElementById("solved").textContent = (stats.solved || []).length;
  document.getElementById("hints").textContent = stats.hintsUsed || 0;
  document.getElementById("tracked").textContent = Object.keys(problems).length;
  const history = document.getElementById("history");
  history.replaceChildren();
  const entries = Object.entries(problems).sort((a, b) => (b[1].lastPracticed || "").localeCompare(a[1].lastPracticed || ""));
  if (!entries.length) {
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = "No practice history yet. Open the extension and try your first hint.";
    history.append(empty);
    return;
  }
  for (const [key, item] of entries) {
    const row = document.createElement("article");
    row.className = "item";
    const left = document.createElement("div");
    const title = document.createElement("h3");
    title.textContent = item.problem || key;
    const meta = document.createElement("p");
    meta.textContent = `${item.hintsUsed || 0} hints · ${(item.modesUsed || []).length} AI actions · ${dateLabel(item.lastPracticed)}`;
    left.append(title, meta);
    const pill = document.createElement("span");
    pill.className = "pill";
    pill.textContent = item.solved || (stats.solved || []).includes(key) ? "Solved" : "In progress";
    row.append(left, pill);
    history.append(row);
  }
}
document.getElementById("exportBtn").addEventListener("click", async () => {
  const stats = await readStats();
  const blob = new Blob([JSON.stringify(stats, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "ai-coding-mentor-progress.json"; a.click();
  URL.revokeObjectURL(url);
});
document.getElementById("clearBtn").addEventListener("click", async () => {
  if (!confirm("Delete all saved practice history? This cannot be undone.")) return;
  await chrome.storage.local.set({ mentorStats: { solved: [], hintsUsed: 0, problems: {} } });
  await render();
});
document.addEventListener("DOMContentLoaded", render);
