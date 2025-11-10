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

**GlowMint** is a sophisticated, AI-driven photo editing application that leverages the power of Google's Gemini API (`gemini-2.5-flash-image`) to magically transform images based on natural language prompts. Featuring a clean, professional two-column layout, GlowMint provides a powerful, beautiful, and intuitive interface for next-generation photo manipulation.

Whether you're a creative professional looking for a rapid prototyping tool or a hobbyist wanting to explore the frontiers of AI-art, GlowMint is your canvas for digital creativity.

---

<!-- KEY FEATURES -->
## 🚀 Key Features

-   **✨ Modern Two-Column Layout**: A professional UI that separates editing controls from the live result panel for an intuitive and focused workflow.
-   **🤖 Intuitive Prompt-Based Editing**: Describe any edit in plain English. Your imagination is the only limit.
-   **⚡️ One-Click Quick Actions**: A library of professionally crafted prompts for common tasks like background removal, colorization, and artistic styling.
-   **✂️ Advanced Editing Suite**:
    -   **Magic Erase**: Seamlessly paint over and remove unwanted objects.
    -   **Magic Replace**: Select an area and replace it with anything you can imagine.
    -   **Style Remix**: Transfer the complete artistic style of one image onto another.
    -   **Intelligent Text**: Add text to your images with AI-powered style and placement.
    -   **AI GIF Creator**: Generate short, looping animations from a single photo and a prompt.
    -   **3D Photo Effect**: Create a mesmerizing 3D parallax effect from any 2D image.
    -   **Comic Book Effect**: Turn photos into vibrant comic book panels.
    -   **Line Art**: Convert photos into high-quality, clean black & white line drawings.
    -   **AI Backgrounds, Filters, Cropping & more!**
-   **🖼️ Powerful Batch Processing**: Apply the same edit to multiple images at once, with a progress bar and an easy-to-navigate results carousel.
-   **↔️ Versatile Comparison Tools**: A dedicated results panel featuring **Toggle** and **Slider** views for clear before-and-after comparison.
-   **🧠 Smart Caching & Pre-fetching**: An intelligent caching layer that instantly loads previous edits and pre-fetches higher resolutions in the background for a lightning-fast experience.
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
*   **[IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)**: For robust client-side caching of generated images.
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

1.  **Upload**: Click or drag-and-drop one or more images into the uploader on the left.
2.  **Choose Mode**: Select 'Single' for detailed work or 'Batch' for applying one edit to many photos.
3.  **Instruct**:
    -   Write a detailed prompt describing your desired edit.
    -   *or* click a **Quick Action** for a pre-defined effect.
4.  **Generate**: Hit the '✨ Generate' button and watch the AI work.
5.  **Review & Refine**: Your masterpiece appears in the results panel on the right. Use the comparison tools, download your result, or use it as input for your next creative iteration.

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

### [1.7.0] - 2025-11-10

#### ✨ Major UI/UX Overhaul & Performance Tuning
- **UI/UX Redesign**: Overhauled the entire application layout into a professional and intuitive two-column design. Controls are now neatly organized on the left, with the image results panel on the right, creating a cleaner and more efficient workflow.
- **Performance Optimization**: Systematically reviewed and optimized all editing tools to reduce latency wherever possible, resulting in a faster and more responsive user experience.
- **Code Refinements**: Conducted a thorough code review to improve stability and maintainability following the layout changes.

### [1.6.1] - 2025-10-27

#### ✨ More Tools Restored
- **Welcome Back Creative Tools**: Re-introduced more fan-favorite Quick Actions based on user feedback.
- **New 3D Photo Effect**: Added a tool to create a mesmerizing 3D parallax effect from any 2D image, outputting an 8-frame filmstrip.
- **New Comic Book Effect**: Added a one-click action to transform photos into vibrant comic book panels.
- **New Line Art Tool**: Added a tool to convert photos into clean, high-quality black & white line drawings.

### [1.6.0] - 2025-10-26

#### ✨ Feature Restoration & Expansion
- **Restored Quick Actions**: Re-introduced and expanded the Quick Actions panel based on user feedback.
- **New Artistic Styles**: Added a new section for one-click artistic transformations, including 'Sketch', 'Cartoon', 'Impressionist', and 'Pixel Art'.
- **New Portrait Tools**: Added a 'Portrait Touch-up' section with tools to 'Smooth Skin', 'Fix Blemishes', 'Brighten Eyes', and 'Whiten Teeth'. These tools are context-aware and will only apply changes if a face is detected.
- **UI Refinements**: The new Portrait tools are automatically disabled in Batch mode to prevent incorrect edits.

### [1.5.0] - 2025-10-24

#### ✨ UI Overhaul & Creative Suite Expansion
- **Complete UI/UX Redesign**: Revamped the entire application layout into a professional and intuitive two-column design, separating controls from the results panel for a cleaner workflow.
- **New Creative Tools**: Integrated three new powerful editing tools:
  - **Artistic Remix**: Transfer the style from a source image onto your content.
  - **Intelligent Text**: Add context-aware text overlays with various styling options.
  - **AI GIF Creator**: Generate an 8-frame filmstrip to visualize a short animation based on a prompt.
- **Performance Caching**: Implemented a robust client-side caching system using IndexedDB. Edits are saved locally, providing instant results for repeated requests and reducing API calls.
- **Cache-Aware UI**: The Resolution Selector is now smarter, indicating which output qualities (Low, Medium, High) are already cached and available instantly with a ✨ icon.
- **Code Refinements**: Conducted a thorough code review, fixing minor bugs, improving component styling for consistency, and making all new and existing features theme-aware.

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