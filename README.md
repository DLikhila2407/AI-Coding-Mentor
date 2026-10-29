# AI Coding Mentor 🚀

An AI-powered Chrome extension that helps developers understand coding problems, debug code, and learn algorithms using AI-generated hints and explanations.

## Overview

Solving programming problems can be challenging when learners get stuck or struggle to understand errors. AI Coding Mentor provides guided hints, code explanations, debugging assistance, and complete solutions to support learning and encourage independent problem-solving.

## Features

- **Progressive Hints:** Get hints before revealing the complete solution.
- **Code Explanation:** Understand code logic, syntax, and algorithms.
- **Debugging Assistance:** Identify potential errors and explore possible fixes.
- **Full Solutions:** Generate code solutions with step-by-step explanations.
- **Learning Dashboard:** Review practice activity and learning statistics.
- **Local Activity Tracking:** Store learning data using Chrome Storage.
- **JSON Export:** Export recorded learning statistics.

## Tech Stack

- HTML5
- CSS3
- JavaScript
- Chrome Extensions API (Manifest V3)
- Google Gemini API
- Chrome Storage API

## Project Structure

```text
ai-coding-mentor/
├── manifest.json
├── popup.html
├── popup.css
├── popup.js
├── background.js
├── options.html
├── options.css
├── options.js
├── dashboard.html
├── dashboard.css
├── dashboard.js
├── .gitignore
└── README.md
```

## Installation

1. Clone or download this repository.
2. Open Google Chrome and navigate to `chrome://extensions`.
3. Enable **Developer mode**.
4. Click **Load unpacked**.
5. Select the project folder containing `manifest.json`.

## Gemini API Setup

1. Obtain an API key from [Google AI Studio](https://aistudio.google.com/apikey).
2. Open the extension's Settings page.
3. Enter your Gemini API key.
4. Select a supported Gemini model.
5. Save the settings and test the extension.

**Security:** Never commit your API key or other credentials to GitHub. This prototype stores the key in Chrome extension storage, which is not appropriate for protecting a production application's secret.

## How to Use

1. Open AI Coding Mentor from the Chrome toolbar.
2. Enter a coding problem or paste a code snippet.
3. Request progressive hints, code explanations, debugging help, or a full solution.
4. Mark completed problems as solved.
5. Open the Learning Dashboard to review recorded activity.

## Future Improvements

- Integration with coding practice platforms.
- Personalized learning recommendations.
- Support for additional AI models.
- Improved Markdown rendering and syntax highlighting.
- Automated testing and better error handling.
- Secure backend-based API key management.

## Project Status

**Status:** Personal portfolio project — under development.