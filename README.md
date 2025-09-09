# ✨ GlowMint - AI Photo Editor

![GlowMint Banner](https://img.shields.io/badge/GlowMint-AI%20Photo%20Editor-14b8a6?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGNsYXNzPSJoLTcgdy03IiBmaWxsPSJub25lIiB2aWV3Qm94PSIwIDAgMjQgMjQiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjEuNSI+PHBhdGggc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBkPSJNOS44MTMgMTUuOTA0TDkgMTguNzVsLS44MTMtMi44NDZhNC41IDQuNSAwIDAwLTMuMDktMy4wOUwyLjI1IDEybDIuODQ2LS44MTNhNC41IDQuNSAwIDAwMy4wOS0zLjA5TDkgNS4yNWwuODEzIDIuODQ2YTQuNSA0LjUgMCAwMDMuMDkgMy4wOUwxNS43NSAxMmwtMi44NDYuODEzYTQuNSA0LjUgMCAwMC0zLjA5IDMuMDl6TTE4LjI1OSA4LjcxNUwxOCAzLjc1bC0uMjU5LTEuMDM1YTMuMzc1IDMuMzc1IDAgMDAtMi40NTUtMi40NTZMMTQuMjUgNmwxLjAzNi0uMjU5YTMuMzc1IDMuMzc1IDAgMDAyLjQ1NS0yLjQ1NkwxOCAyLjI1bC4yNTkgMS4wMzVhMy4zNzUgMy4zNzUgMCAwMDIuNDU2IDIuNDU2TDIxLjc1IDZsLTEuMDM1LjI1OWEzLjM3NSAzLjM3NSAwIDAwLTIuNDU2IDIuNDU2ek0xNi44OTggMjAuNTI4TDE2LjI1IDIyLjVsLS42NDgtMS45NzJhNC41IDQuNSAwIDAxLTMuMDktMy4wOWwtMS45NzItLjY0OCAxLjk3Mi0uNjQ4YTQuNSA0LjUgMCAwMTMuMDktMy4wOWwuNjQ4LTEuOTcyLjY0OCAxLjk3MmE0LjUgNC41IDAgMDEzLjA5IDMuMDlsMS45NzIuNjQ4LTEuOTcyLjY0OGE0LjUgNC41IDAgMDEtMy4wOSAzLjA5eiIgLz48L3N2Zz4=)
[![License: MIT](https://img.shields.io/badge/License-MIT-teal.svg?style=flat-square)](LICENSE.md)
[![React Version](https://img.shields.io/badge/React-^19.1.1-blue.svg?style=flat-square&logo=react)](https://react.dev/)
[![Gemini API](https://img.shields.io/badge/Google-Gemini%20API-4285F4.svg?style=flat-square&logo=google)](https://ai.google.dev/)

**GlowMint** is an AI-powered photo editing application that uses the Google Gemini API (`gemini-2.5-flash-image-preview`) to magically transform your images based on text prompts. From simple enhancements to complex compositions, GlowMint provides a powerful yet intuitive interface for creative photo manipulation.

---

## 🚀 Key Features

- **Prompt-Based Editing**: Describe any edit in natural language, from "add a cat wearing a party hat" to "make this look like a vintage photograph from the 1970s."
- **Multi-Image Composition**: Upload multiple photos and instruct the AI on how to combine them into collages, blends, or composites.
- **One-Click Quick Actions**: Access a library of professionally crafted prompts for common tasks like background removal, colorization, photo restoration, and applying artistic styles.
- **🪄 Magic Erase**: A dedicated inpainting tool that allows you to simply paint over and remove any unwanted objects from your photos.
- **Advanced Controls**: Fine-tune your results with negative prompts to exclude unwanted elements and select from multiple output resolutions (Low, Medium, High).
- **Interactive Comparison**: Use the before-and-after slider to instantly see the impact of your edits.
- **Iterative Workflow**: Use any generated image as the new input for further edits, allowing you to layer effects and refine your creation.
- **Full History**: Never lose your progress with unlimited undo/redo capabilities.

## 🛠️ Technology Stack

- **Frontend**: [React](https://react.dev/) 19, [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS](https://tailwindcss.com/)
- **AI Model**: Google Gemini `gemini-2.5-flash-image-preview`
- **Gemini SDK**: [`@google/genai`](https://www.npmjs.com/package/@google/genai)

## 📖 How to Use

GlowMint is designed to be intuitive. Follow these simple steps to start creating.

### Step 1: Upload Photos

- Click the upload area or drag and drop one or more images (PNG, JPG, WEBP).
- **Single Image**: Best for enhancements, style changes, or object removal.
- **Multiple Images**: Use a text prompt to describe how the AI should combine them.

### Step 2: Choose Your Edit

You have two powerful options for editing your photos:

1.  **Edit with a Prompt**:
    -   Write a detailed description of your desired edit in the main text box. The more specific your prompt, the better the result.
    -   **Example**: Instead of "make it look old," try "Give this photo a vintage look, like a faded polaroid from the 1980s with warm tones and light leaks."
    -   Click the "Try an example ✨" button for inspiration.

2.  **Use Quick Actions**:
    -   For common edits, simply upload a single image and click one of the pre-defined actions like `Enhance`, `Remove BG`, `Colorize`, or `Cartoonify`.
    -   These actions use carefully crafted prompts to deliver consistent, high-quality results instantly.

### Step 3: Generate & Refine

-   Click the **✨ Generate Edit** button to send your request to the AI.
-   Your edited image will appear in the result panel. From there, you can:
    -   **Download** the final image.
    -   **Use as Input** to perform more edits on the new image.
    -   **Compare** the result with the original using an interactive slider.
    -   **Undo/Redo** your edits to experiment freely.

## 💡 Pro Tips

-   **Negative Prompts**: Under "Advanced Options," describe what you *don't* want to see. This is great for removing text, watermarks, or avoiding common AI artifacts like "extra limbs."
-   **Resolution**: Choose your output quality. `High` provides the best detail but takes longer, while `Low` is faster for quick previews and iteration.
-   **Iterate!**: The "Use as Input" button is your key to complex creations. Start with a background removal, then use the result to add a new background, and then apply a color grade.

---

## 📜 Changelog

All notable changes to this project will be documented in this section.

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

---

## 🤝 Contributing

This project is currently maintained by a solo developer, but suggestions and feedback are welcome! Please open an issue to report bugs or request features.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
