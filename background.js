
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type !== "GEMINI_REQUEST") return;

  (async () => {
    try {
      const { geminiApiKey, geminiModel } =
        await chrome.storage.local.get({
          geminiApiKey: "",
          geminiModel: "gemini-3.8-flash"
        });

      if (!geminiApiKey || !geminiApiKey.trim()) {
        throw new Error(
          "No Gemini API key saved. Open Settings and add your key."
        );
      }

      const model = (
        geminiModel || "gemini-3.8-flash"
      ).trim();

      const url =
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(geminiApiKey.trim())}`;

      const controller = new AbortController();

      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 90000);

      let response;

      try {
        response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: String(message.prompt || "") }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.4,
              maxOutputTokens: 1800
            }
          }),
          signal: controller.signal
        });
      } finally {
        clearTimeout(timeoutId);
      }

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const apiMessage =
          data?.error?.message ||
          `Gemini API returned HTTP ${response.status}.`;

        throw new Error(apiMessage);
      }

      const text = data?.candidates?.[0]?.content?.parts
        ?.map(part => part.text || "")
        .join("")
        .trim();

      if (!text) {
        throw new Error(
          "Gemini returned an empty response. Check the model name or try again."
        );
      }

      sendResponse({ ok: true, text });

    } catch (error) {
      const errorMessage =
        error.name === "AbortError"
          ? "Gemini request timed out after 30 seconds. Check your connection and try again."
          : error.message || "Gemini request failed.";

      sendResponse({
        ok: false,
        error: errorMessage
      });
    }
  })();

  return true;
});
