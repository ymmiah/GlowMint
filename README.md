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

<!-- DEMO GIF PLACEHOLDER -->
<div align="center">
  <!-- TODO: Replace this with a stunning demo GIF showcasing GlowMint's features in action -->
  <p><em>(Imagine a stunning demo GIF here showcasing GlowMint's features in action)</em></p>
</div>

---

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li><a href="#about-the-project">About The Project</a></li>
    <li><a href="#-key-features">Key Features</a></li>
    <li><a href="#-built-with">Built With</a></li>
    <li><a href="#-getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation--configuration">Installation & Configuration</a></li>
      </ul>
    </li>
    <li><a href="#-usage">Usage</a></li>
    <li><a href="#-contributing">Contributing</a></li>
    <li><a href="#-license">License</a></li>
    <li><a href="#-changelog">Changelog</a></li>
  </ol>
</details>

---

<!-- ABOUT THE PROJECT -->
## About The Project

**GlowMint** is a sophisticated, AI-driven photo editing application that leverages the power of Google's Gemini API (`gemini-2.5-flash-image`) to magically transform images based on natural language prompts. Whether you're a creative professional looking for a rapid prototyping tool or a hobbyist wanting to explore the frontiers of AI-art, GlowMint provides a powerful, beautiful, and intuitive interface for next-generation photo manipulation.

From simple one-click enhancements to complex, multi-image compositions and interactive tools like Magic Erase, GlowMint is your canvas for digital creativity.

---

<!-- KEY FEATURES -->
## 🚀 Key Features

-   **🤖 Intuitive Prompt-Based Editing**: Describe any edit in plain English. Your imagination is the only limit.
-   **⚡️ One-Click Quick Actions**: A library of professionally crafted prompts for common tasks like background removal, colorization, and artistic styling.
-   **✂️ Advanced Editing Suite**:
    -   **Magic Erase**: Seamlessly paint over and remove unwanted objects.
    -   **Magic Replace**: Select an area and replace it with anything you can imagine.
    -   **Style Remix**: Transfer the complete artistic style of one image onto another.
    -   **AI Backgrounds, Filters, Cropping & more!**
-   **🖼️ Powerful Batch Processing**: Apply the same edit to multiple images at once, with a progress bar and an easy-to-navigate results carousel.
-   **↔️ Versatile Comparison Tools**: A unified display with **Toggle**, **Slider**, and **Side-by-Side** views for clear before-and-after comparison.
-   **🔄 Iterative Workflow**: Use any edited image as the new input for further edits, allowing you to layer effects and refine your creations.
-   **🎨 Customizable UI Themes**: Personalize your editing environment with multiple color palettes (including light and dark modes).
-   **💾 Full History Control**: Never lose your progress in single-edit mode with unlimited undo/redo.

---

<!-- BUILT WITH -->
## 🛠️ Built With

This project is built on a modern, robust, and scalable frontend stack.

*   **[React](https://react.dev/)**: The core UI library for building a fast and interactive user interface.
*   **[TypeScript](https://www.typescriptlang.org/)**: For static typing, improved developer experience, and more maintainable code.
*   **[Tailwind CSS](https://tailwindcss.com/)**: A utility-first CSS framework for rapid and consistent styling.
*   **[@google/genai](https://www.npmjs.com/package/@google/genai)**: The official Google SDK for interacting with the Gemini API.
*   **Centralized Theming System**: A custom, dynamic theming engine located in the `/theme` directory for easy customization.

---

<!-- GETTING STARTED -->
## 🏁 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

Make sure you have Node.js and npm (or your favorite package manager) installed on your machine.
*   **npm**
    ```sh
    npm install npm@latest -g
    ```

### Installation & Configuration

1.  **Get a Gemini API Key**
    -   You'll need an API key from [Google AI Studio](https://ai.google.dev/).

2.  **Clone the repository**
    ```sh
    git clone https://github.com/ymmiah/GlowMint.git
    cd GlowMint
    ```

3.  **Install NPM packages**
    ```sh
    npm install
    ```

4.  **Set up environment variables**
    -   Create a file named `.env` in the root of the project.
    -   Add your API key to this file:
        ```env
        # .env
        API_KEY="YOUR_GEMINI_API_KEY"
        ```

5.  **Run the application**
    ```sh
    npm start
    ```
    The application should now be running on your local server!

---

<!-- USAGE -->
## 📖 Usage

GlowMint is designed to be intuitive from the start.

1.  **Upload**: Click or drag-and-drop one or more images.
2.  **Choose Mode**: Select 'Single' for detailed work or 'Batch' for applying one edit to many photos.
3.  **Instruct**:
    -   Write a detailed prompt describing your desired edit.
    -   *or* click a **Quick Action** for a pre-defined effect.
4.  **Generate**: Hit the '✨ Generate' button and watch the AI work.
5.  **Review & Refine**: Use the comparison tools, download your result, or use it as input for your next creative iteration.

For a more detailed walkthrough, check out the **"How to Use GlowMint"** tutorial available in the application's footer.

---

<!-- CONTRIBUTING -->
## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

Don't forget to give the project a star! Thanks again!

---

<!-- LICENSE -->
## 📄 License

Distributed under the MIT License. See `LICENSE.md` for more information.

---

## 📜 Changelog

All notable changes to this project will be documented in this section.

### [1.4.1] - 2025-10-11

#### 🐛 Bug Fixes
- **Download Functionality**: Fixed a bug where the download button would open the image in a new tab instead of saving the file. The download logic now directly converts the image data to a Blob to ensure consistent download behavior across all browsers.

### [1.4.0] - 2025-10-10

#### ✨ New Features
- **Enhanced Image Uploader**: Added robust drag-and-drop functionality to upload multiple images simultaneously. The uploader now displays individual progress for each file and shows clear error states for failed uploads, such as exceeding the file size limit.

### [1.3.0] - 2025-10-09

#### 🏗️ Architecture & Refactoring
- **Centralized Theming System**: Refactored the entire UI theming system into a dedicated `/theme` directory. All theme variables and logic are now centralized in TypeScript, removing hardcoded styles from `index.html`. This makes adding or modifying themes significantly easier and more maintainable.
- **Dynamic Style Injection**: The application now dynamically generates and injects the theme stylesheet, ensuring a clean separation of concerns.

### [1.2.1] - 2025-10-03

#### ✨ New Features
- **Artistic Remix**: Added the "Style Remix" tool, allowing users to apply the complete artistic style of one image to another. The feature includes a dedicated modal for uploading a style image and an **optional prompt** to give the AI specific instructions, like 'only apply the color palette' or 'focus on the brush stroke texture'.
- **Sticker-fy**: Introduced the "Sticker-fy" quick action, which automatically isolates the main subject of a photo, adds a a white outline and drop shadow, and provides a final image with a transparent background.

### [1.2.0] - 2025-09-29

#### ✨ UI Overhaul & Batch Processing
- **Unified Display Area**: Replaced the previous side-by-side layout with a single, large, focused display area for viewing original and edited images, creating a cleaner and more immersive experience.
- **New View Modes**: Introduced flexible ways to compare images within the unified viewer:
    - **Toggle View**: A simple "Original" / "Edited" toggle to quickly switch between the two versions.
    - **Slider View**: An interactive slider for precise, pixel-level comparison.
    - **Side-by-Side View**: A classic two-panel view for a direct look at both images.
- **Streamlined Controls**: Organized all result-related actions (Download, Use as Input, View Mode selection) into a single, intuitive control bar below the display area.
- **Batch Processing Mode**: Added a powerful 'Batch' mode to apply the same edit to multiple images at once, complete with a progress bar and easy navigation through the results carousel.

### [1.1.1] - 2025-09-18

#### ✨ Feature Refinement: Paper Photo Fix

-   **Prompt Engineering**: Overhauled the "Paper Fix" quick action with a highly detailed, multi-stage "Digital Restoration Specialist" prompt.
-   **Improved Accuracy**: The new prompt forces the AI to follow a strict 4-stage process (Analysis, Plan, Execution, Verification) to ensure consistent, high-quality results.
-   **Advanced Flaw Removal**: Explicitly targets and removes common issues like glare, reflections, and motion blur.
-   **Smarter Object Removal**: Implemented non-negotiable logic for the AI to remove a person *and* the fingers covering them, preventing leftover artifacts.
-   **"Perfect Scan" Goal**: The entire process is now geared towards producing a result that is indistinguishable from a high-resolution flatbed scan.

### [1.1.0] - 2025-09-10

#### ✨ Feature Update: Power Tools

-   **New Features**:
    -   **"Magic Replace" Tool**: Added a new modal for selecting an area and replacing it with AI-generated content based on a text prompt.
    -   **"AI Background" Tool**: Implemented a feature to automatically isolate the subject and replace the background with an AI-generated scene. Includes AI-powered suggestions.
    -   **"Filters" Tool**: Introduced a gallery of artistic filters with live AI-generated previews.
    -   **"Crop & Rotate" Tool**: Added a comprehensive cropping and rotation tool with aspect ratio locks, freeform rotation, and an AI-powered auto-straighten feature.

### [1.0.0] - 2025-09-09

#### ✨ Initial Release

-   **Core Functionality**:
    -   Single and multi-image upload via click or drag-and-drop.
    -   Prompt-based image editing powered by `gemini-2.5-flash-image-preview`.
    -   Output resolution selection (Low, Medium, High).
    -   Advanced options with negative prompting.
-   **Features**:
    -   Library of "Quick Actions" for one-click edits (Enhance, Remove BG, Colorize, Styles, etc.).
    -   "Magic Erase" tool with a dedicated modal for inpainting, featuring brush/eraser tools, zoom/pan, and history.
    -   Interactive "Compare" slider for before-and-after viewing.
    -   Undo/Redo functionality for edit history.
    -   Ability to use the generated image as a new input for iterative editing.
    -   Fullscreen image viewer and a comprehensive "How to Use" tutorial modal.
-   **UI/UX**:
    -   Fully responsive, dark-mode UI built with React and Tailwind CSS.
    -   Loading states, error handling, and animated transitions for a smooth user experience.