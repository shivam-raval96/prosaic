# Prosaic Frontend

This is a frontend-only version of the prosody-viz speech visualization tool, built with Next.js and React.

## ✅ Current Status: WORKING

The application is now fully functional with all components migrated and working properly.

## Features

- Speech visualization using D3.js
- Audio recording and playback (Web Audio API)
- File upload capabilities
- YouTube video integration
- Real-time audio processing (placeholder functions for frontend-only implementation)
- Responsive design with Material-UI components

## Setup

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Troubleshooting

### Hydration Warnings

If you see hydration warnings in the console, these are caused by browser extensions (like Grammarly) and don't affect functionality. The app includes `suppressHydrationWarning` to handle these.

### Component Import Issues

All components have been properly migrated and should work without issues. If you encounter import errors, ensure you're running from the `frontend` directory.

## Project Structure

- `src/app/` - Next.js app router pages
- `src/components/` - React components
- `src/data/` - CSV data files (moved to public/data/)
- `public/data/` - Static CSV files served by Next.js

## Components

- `Homepage` - Main application interface
- `CurveRender` - D3.js visualization component
- `Legend` - Color legend for pitch visualization
- `Navigation` - App navigation
- `AboutPage` - About page
- `AudioRecorder` - Custom Web Audio API recorder
- `ClientOnly` - Wrapper to prevent hydration issues

## Backend Integration

The original prosody-viz had Python backend calls for:

- Audio transcription
- DTW (Dynamic Time Warping) matching
- File processing

In this frontend-only version, these calls have been replaced with placeholder functions that can be implemented with:

- Web Audio API for audio processing
- WebAssembly for DTW algorithms
- Client-side transcription services
- Browser-based file processing

## TODO

- Implement frontend-only audio transcription
- Add WebAssembly-based DTW matching
- Implement client-side file processing
- Add more visualization options
- Improve error handling
- Add unit tests

## Dependencies

- Next.js 15.4.5
- React 18.2.0
- D3.js 7.8.5
- Material-UI 5.15.3
- Bootstrap 5.3.2
- Math.js 12.3.0

## Migration Notes

- Successfully migrated from Create React App to Next.js
- Replaced React Router with Next.js App Router
- Fixed all React compatibility issues
- Implemented custom audio recording with Web Audio API
- Added proper client-side rendering for components that need browser APIs
