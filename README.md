
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
-   **🤖 AI Image Generation**: Create stunning images with full aspect ratio control (1:1, 16:9, etc.).
-   **🔍 AI Error Logbook**: Integrated diagnostic system with unique reference IDs for deep technical troubleshooting.
-   **🔄 Smart Retry Mechanism**: One-click recovery for transient API issues like quota limits or network blips.
-   **🧠 Deep Artistic Analysis**: Get professional art critiques powered by Gemini 3 Pro with advanced reasoning.
-   **⚡️ Concurrent Batch Processing**: Process multiple images simultaneously (up to 3 at a time) for rapid workflows.
-   **✂️ Advanced Creative Tools**: Magic Erase, Magic Replace, 3D Photo Effect, Style Remix, and more.
-   **🔄 Robust History Control**: Reliable Undo/Redo tracking for perfect iterative editing.

---

## 📜 Changelog

### [1.9.0] - 2025-12-21

#### ✨ Error Management & Reliability Update
- **AI Error Logbook**: Implemented a centralized diagnostic logbook. Every error now generates a unique `ERR-XXXX` reference ID.
- **Precision Diagnostics**: The error log captures tool-specific metadata, model names, and detailed stack traces for easier debugging.
- **Enhanced Retry Logic**: Added a 'Retry' button that re-triggers the failed operation with original parameters, improving user recovery from transient quota errors.
- **Static Metadata Refresh**: Updated footer and build timestamps to reflect the latest stable build.

### [1.8.1] - 2025-11-12

#### ✨ Performance & Stability Update
- **Concurrent Batch Processing**: Implemented parallel processing for batch mode, allowing up to 3 images to generate simultaneously.
- **Robust History Logic**: Fixed an issue where "Redo" could become unresponsive.
- **Tool Prompt Upgrades**: Enhanced creative prompts for '3D Photo Effect' and 'Comic Book' styles.

---

Distributed under the MIT License. See `LICENSE.md` for more information.
