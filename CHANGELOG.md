# ✨ GlowMint Changelog

All notable changes to this project from its inception to the current release on March 31, 2026.

## [2.6.0] - 2026-03-31
### ✨ Advanced Text & Fullscreen Interactions
- **Text Resizing**: Added a drag handle to the bottom-right corner of text overlays, allowing users to dynamically scale text size up and down.
- **Fullscreen Text Editing**: Upgraded the Fullscreen Modal so that "Intelligent Text" overlays remain fully interactive. You can now move, resize, edit, and delete text while viewing the image in full screen.

### 🛠️ Layout & Scaling Fixes
- **Responsive Image Display**: Fixed a major flexbox overflow bug where large images would stretch the screen. Images now perfectly scale down (`object-fit: contain`) to fit the available workspace while maintaining their aspect ratio.
- **Shrink-wrapped Overlays**: Ensured the text overlay container perfectly matches the scaled image dimensions so text doesn't float outside the image boundaries.

## [2.5.1] - 2025-12-30
### 🩹 Critical Fix: Identity Preservation
- **"Collage Strategy" Implementation**: Resolved a major bug where the Merger tool would hallucinate new people instead of using the second image. The system now stitches the two input images into a single side-by-side composite before sending it to the AI. This forces the model to recognize both subjects as "existing pixels" that must be edited, rather than generated from scratch.

## [2.5.0] - 2025-12-30
### 🔄 Complete Merger Overhaul
- **Simplified Workflow**: The "Picture Merger" tool no longer asks for separate uploads. It now intelligently uses the two images already present in your workspace.
- **Strict Logic**: The tool is now only available when exactly two images are uploaded, removing confusion about inputs.
- **Improved Blending**: The AI instructions have been rewritten to strictly enforce the creation of a *single* cohesive image containing subjects from both sources, rather than independent generations.

## [2.4.0] - 2025-12-30
### 🔄 Merger Engine Update
- **Adaptive Merging**: The Picture Merger now intelligently handles single-image inputs.
    - **2 Images**: Performs a classic merge (Subject -> Background).
    - **1 Image**: Switches to "Generative Background" mode, extracting the subject and creating a new background via AI.
- **Enhanced Logic**: Fixed data flow issues where merging two distinct images might fail or produce random results. The system now explicitly identifies "Subject Reference" vs "Target Background" for the AI model.

## [2.3.0] - 2025-12-30
### ✨ New Power Feature: Picture Merger
- **Advanced Composition**: Added a new "Merger" tool that allows combining subjects from one photo with environments from another.
- **Identity Preservation**: The merger engine is specifically prompted to <span class="text-[--color-primary]">100% preserve face, body, and clothing</span> while blending them into new backgrounds.
- **Intelligent Blending**: Automatic analysis of lighting, shadows, and perspective for both images to ensure a photorealistic result.

## [2.2.0] - 2025-12-30
### 🛠️ Bug Fixes & Contextual Intelligence
- **Magic Improve Fix**: Resolved an issue where "Magic Improve" ignored the uploaded image context, leading to random results.
- **Multimodal Intelligence**: The prompt improver now uses `gemini-2.5-flash` to analyze the source image before suggesting edits, ensuring all improvements align perfectly with the original composition and subject.

## [2.1.0] - 2025-12-30
### ✨ Documentation & Maintenance
- **Documentation Architecture**: Separated detailed version history into this `CHANGELOG.md` to keep the main README focused on product features.
- **Versioning**: Established a formal version control tracking system for future scalability.

## [2.0.0] - 2025-12-30
### ✨ UX & Reliability Update
- **Magic Improve Prompt**: Added a new "Magic Improve" button to the prompt input. It uses Gemini 2.5 Flash Lite to expand basic user prompts into detailed, high-quality artistic instructions.
- **Fixed Generate Mode Downloads**: Resolved a critical bug where generated images couldn't be downloaded because they weren't yet part of the edit history. The download action now correctly targets the active image regardless of its source.
- **UI Refinement**: Updated primary action buttons with more descriptive labels ("Generate Masterpiece" / "Apply AI Edits").
- **Static Metadata Refresh**: Updated footer and build timestamps to reflect the end-of-year stable release.

## [1.9.0] - 2025-12-21
### ✨ Error Management & Reliability
- **AI Error Logbook**: Implemented a centralized diagnostic logbook. Every error now generates a unique `ERR-XXXX` reference ID.
- **Precision Diagnostics**: The error log captures tool-specific metadata, model names, and detailed stack traces for easier debugging.
- **Enhanced Retry Logic**: Added a 'Retry' button that re-triggers the failed operation with original parameters, improving user recovery from transient quota errors.

## [1.8.1] - 2025-11-12
### ✨ Performance & Stability
- **Concurrent Batch Processing**: Implemented parallel processing for batch mode, allowing up to 3 images to generate simultaneously.
- **Robust History Logic**: Fixed an issue where "Redo" could become unresponsive due to closure stale states.
- **Tool Prompt Upgrades**: Enhanced the creative prompts for '3D Photo Effect' and 'Comic Book' styles for significantly more professional outputs.
- **Deep Analysis Refinement**: Optimized the art critic prompt and ensured maximum thinking budget allocation for Pro models.

## [1.8.0] - 2025-11-11
### ✨ Major Feature Expansion
- **New "Generate" Mode**: Integrated `imagen-4.0-generate-001` for high-quality text-to-image workflows.
- **Aspect Ratio Control**: Added UI for common ratios (1:1, 16:9, 3:4, etc.).
- **New "AI Insights" Tools**: Added Quick and Deep image analysis powered by Gemini 3 Pro.
- **IndexedDB Caching**: Optimized result retrieval through localized browser storage.

## [1.0.0] - 2025-10-01
### 🚀 Initial Release
- **Core Features**: Basic AI photo editing using Gemini Nano Banana.
- **Interactive Tools**: Magic Erase, Magic Replace, and Background Removal.
- **Theming**: Support for multiple UI themes (Slate, Sky, Rose, Light).
