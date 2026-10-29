const $ = (id) => document.getElementById(id);
let lastResponse = "";
let currentProblemKey = "";

document.addEventListener("DOMContentLoaded", async () => {
  await refreshStats();
  $("settingsBtn").addEventListener("click", () => chrome.runtime.openOptionsPage());
  $("dashboardBtn").addEventListener("click", () => chrome.tabs.create({ url: chrome.runtime.getURL("dashboard.html") }));
  $("copyBtn").addEventListener("click", async () => {
    if (!lastResponse) return;
    try { await navigator.clipboard.writeText(lastResponse); showMessage("Copied response to clipboard."); }
    catch { showMessage("Copy failed. Select the response text and copy it manually.", true); }
  });
  $("markSolvedBtn").addEventListener("click", markSolved);
  document.querySelectorAll("[data-mode]").forEach(button => button.addEventListener("click", () => runMentor(button.dataset.mode, button)));
});

function showMessage(message, isError = false) {
  const el = $("message");
  el.textContent = message;
  el.classList.toggle("error", isError);
  el.classList.remove("hidden");
}
function hideMessage() { $("message").classList.add("hidden"); }
function getProblemKey(problem) {
  return problem.trim().toLowerCase().replace(/\s+/g, " ").slice(0, 160) || "code-practice";
}
async function getStats() {
  const data = await chrome.storage.local.get({ mentorStats: { solved: [], hintsUsed: 0, problems: {} } });
  const s = data.mentorStats;
  if (!Array.isArray(s.solved)) s.solved = [];
  if (!s.problems || typeof s.problems !== "object") s.problems = {};
  if (typeof s.hintsUsed !== "number") s.hintsUsed = 0;
  return s;
}
async function saveStats(stats) { await chrome.storage.local.set({ mentorStats: stats }); }
async function refreshStats() {
  const s = await getStats();
  $("solvedCount").textContent = s.solved.length;
  $("hintCount").textContent = s.hintsUsed;
  $("problemCount").textContent = Object.keys(s.problems).length;
}
function setBusy(button, busy) {
  document.querySelectorAll("[data-mode]").forEach(b => b.disabled = busy);
  if (button) button.dataset.originalText ||= button.innerText;
  if (button && busy) button.querySelector("b").textContent = "Thinking…";
  if (button && !busy) button.querySelector("b").textContent = button.dataset.originalText.split("\n")[0];
}
const modeTitles = { hint: "Progressive hint", explain: "Code explanation", debug: "Debugging help", solution: "Full solution" };

async function runMentor(mode, button) {
  hideMessage();
  const problem = $("problem").value.trim();
  const code = $("code").value.trim();
  const language = $("language").value;
  if (!problem && !code) { showMessage("Enter a problem statement or paste code first.", true); return; }
  const key = getProblemKey(problem || code);
  currentProblemKey = key;
  const stats = await getStats();
  const record = stats.problems[key] || { problem: problem || "Code practice", hintsUsed: 0, modesUsed: [], lastPracticed: null };
  if (mode !== "hint" && !code && mode !== "solution") {
    showMessage("Paste your code first for explanations or debugging.", true); return;
  }
  const prompt = buildPrompt({ mode, problem, code, language, hintNumber: record.hintsUsed + 1 });
  setBusy(button, true);
  $("resultWrap").classList.add("hidden");
  showMessage("The AI mentor is preparing your response…");
  try {
    const response = await chrome.runtime.sendMessage({ type: "GEMINI_REQUEST", prompt });
    if (!response || !response.ok) throw new Error(response?.error || "The request failed.");
    lastResponse = response.text;
    $("resultTitle").textContent = modeTitles[mode];
    const parsedHtml = marked.parse(response.text);
    const safeHtml = parsedHtml
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
      .replace(/javascript\s*:/gi, "");

    $("result").innerHTML = safeHtml;
    $("resultWrap").classList.remove("hidden");
    hideMessage();

    record.problem = problem || record.problem;
    record.hintsUsed = record.hintsUsed || 0;
    record.modesUsed = Array.isArray(record.modesUsed) ? record.modesUsed : [];
    record.modesUsed.push(mode);
    record.lastPracticed = new Date().toISOString();
    if (mode === "hint") { record.hintsUsed++; stats.hintsUsed++; }
    stats.problems[key] = record;
    await saveStats(stats);
    await refreshStats();
  } catch (error) {
    showMessage(error.message || "Something went wrong. Check settings and try again.", true);
  } finally {
    setBusy(button, false);
  }
}
function buildPrompt({ mode, problem, code, language, hintNumber }) {
  const base = `You are a patient, accurate Data Structures and Algorithms (DSA) mentor. Teach clearly and avoid pretending to run code. Language: ${language}.\nProblem statement:\n${problem || "(not supplied)"}\nStudent code or error:\n${code || "(not supplied)"}\n`;
  const instructions = {
    hint: `Give only the next progressive hint (hint ${hintNumber}). Do not reveal the full solution unless this is hint 5 or later and the student explicitly asks. Hint 1: restate the key observation; hint 2: suggest a data structure or algorithm; hint 3: explain the approach; hint 4: give pseudocode; hint 5: provide a small targeted nudge toward implementation. Keep it concise, encourage independent thinking, and finish with one question for the student.`,
    explain: "Explain the student's code in simple language. Describe the purpose of each important line or block, variables, control flow, edge cases, and time/space complexity. Flag uncertainty instead of inventing behavior.",
    debug: "Review the code for likely syntax, runtime, and logical issues. Explain each issue, why it happens, and how to fix it. If code is missing, ask for it. Provide a corrected version only after explaining the cause. Do not claim you executed it.",
    solution: "Provide a complete educational solution. Explain the algorithm first, then give code in the selected language, walk through a small example, and state time and space complexity. Mention important edge cases."
  };
  return `${base}\nTask: ${instructions[mode]}`;
}
async function markSolved() {
  const problem = $("problem").value.trim();
  const code = $("code").value.trim();
  if (!problem && !code) { showMessage("Enter a problem statement or code before marking it solved.", true); return; }
  const key = getProblemKey(problem || code);
  const stats = await getStats();
  if (!stats.solved.includes(key)) stats.solved.push(key);
  if (!stats.problems[key]) stats.problems[key] = { problem: problem || "Code practice", hintsUsed: 0, modesUsed: [], lastPracticed: new Date().toISOString() };
  stats.problems[key].solved = true;
  stats.problems[key].lastPracticed = new Date().toISOString();
  await saveStats(stats);
  await refreshStats();
  showMessage("Problem marked as solved. Keep going!");
}
