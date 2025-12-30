# ✨ GlowMint Changelog

All notable changes to this project from its inception to the current release on December 30, 2025.

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
