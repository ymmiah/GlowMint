
<!-- HEADER -->
<div align="center">
  <h1 align="center">✨ GlowMint - AI Photo Editor ✨</h1>
  <p align="center">
    A powerful, intuitive, and modern web application for AI-powered photo editing, built with React and the Google Gemini API.
    <br />
    <a href="https://github.com/ymmiah/GlowMint/issues">Report Bug</a>
    ·
    <a href="https://github.com/ymmiah/GlowMint/issues">Request Feature</a>
  </p>

  <!-- BADGES -->
  <p align="center">
    <a href="LICENSE.md"><img src="https://img.shields.io/github/license/ymmiah/GlowMint?style=for-the-badge" alt="License"></a>
    <img src="https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react" alt="React">
    <img src="https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript" alt="TypeScript">
    <img src="https://img.shields.io/badge/Gemini_API-v2.5-4285F4?style=for-the-badge&logo=google" alt="Gemini API">
    <img src="https://img.shields.io/badge/Status-Actively_Maintained-brightgreen?style=for-the-badge" alt="Status">
  </p>
</div>

---

## 🚀 Key Features

-   **🎨 Edit & Generate Modes**: Seamlessly switch between editing photos and generating new ones using Imagen 4.
-   **🪄 Magic Improve Prompt**: Automatically enhance your simple descriptions into professional AI prompts with one click.
-   **🤖 AI Image Generation**: Create stunning images with full aspect ratio control (1:1, 16:9, etc.).
-   **🔍 AI Error Logbook**: Integrated diagnostic system with unique reference IDs for deep technical troubleshooting.
-   **🔄 Smart Retry Mechanism**: One-click recovery for transient API issues like quota limits or network blips.
-   **🧠 Deep Artistic Analysis**: Get professional art critiques powered by Gemini 3 Pro with advanced reasoning.
-   **⚡️ Concurrent Batch Processing**: Process multiple images simultaneously (up to 3 at a time) for rapid workflows.
-   **✂️ Advanced Creative Tools**: Magic Erase, Magic Replace, 3D Photo Effect, Style Remix, and more.
-   **🔄 Robust History Control**: Reliable Undo/Redo tracking for perfect iterative editing.

---

## 📜 Changelog

### [2.0.0] - 2025-12-30

#### ✨ UX & Reliability Update
- **Magic Improve Prompt**: Added a new "Magic Improve" button to the prompt input. It uses Gemini 2.5 Flash Lite to expand basic user prompts into detailed, high-quality artistic instructions.
- **Fixed Generate Mode Downloads**: Resolved a critical bug where generated images couldn't be downloaded because they weren't yet part of the edit history. The download action now correctly targets the active image regardless of its source.
- **UI Refinement**: Updated primary action buttons with more descriptive labels ("Generate Masterpiece" / "Apply AI Edits").
- **Static Metadata Refresh**: Updated footer and build timestamps to reflect the end-of-year stable release.

### [1.9.0] - 2025-12-21

#### ✨ Error Management & Reliability Update
- **AI Error Logbook**: Implemented a centralized diagnostic logbook. Every error now generates a unique `ERR-XXXX` reference ID.
- **Enhanced Retry Logic**: Added a 'Retry' button that re-triggers the failed operation with original parameters.

---

Distributed under the MIT License. See `LICENSE.md` for more information.
