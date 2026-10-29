const apiKey = document.getElementById("apiKey");
const model = document.getElementById("model");
const status = document.getElementById("status");
document.addEventListener("DOMContentLoaded", async () => {
  const saved = await chrome.storage.local.get({ geminiApiKey: "", geminiModel: "gemini-2.5-flash" });
  apiKey.value = saved.geminiApiKey;
  model.value = saved.geminiModel;
});
document.getElementById("showKey").addEventListener("change", (event) => {
  apiKey.type = event.target.checked ? "text" : "password";
});
document.getElementById("saveBtn").addEventListener("click", async () => {
  const key = apiKey.value.trim();
  const selectedModel = model.value.trim() || "gemini-2.5-flash";
  if (!key) {
    status.textContent = "Please enter a Gemini API key.";
    status.style.color = "#ffc8d0";
    return;
  }
  await chrome.storage.local.set({ geminiApiKey: key, geminiModel: selectedModel });
  status.textContent = "Settings saved in this browser.";
  status.style.color = "#a7f3d0";
});
