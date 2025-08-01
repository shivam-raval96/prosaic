# Prosaic - Speech Analysis Tool

A web-based tool for analyzing speech patterns, pitch, volume, and word-level metrics using client-side processing.

## Features

- **Audio Recording**: Record audio directly in the browser
- **Speech-to-Text**: Automatic transcription using Whisper
- **Pitch Detection**: Real-time pitch analysis using pitchy
- **Volume Analysis**: Amplitude measurement and variance
- **Word-Level Analysis**: Comprehensive metrics per word
- **Data Export**: CSV export with detailed analysis
- **Visualization**: D3.js-based speech pattern visualization

## Live Demo

Visit the live application: [https://shivam-raval96.github.io/prosaic/](https://shivam-raval96.github.io/prosaic/)

## Local Development

1. Clone the repository:

```bash
git clone https://github.com/shivam-raval96/prosaic.git
cd prosaic/frontend
```

2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

The application is automatically deployed to GitHub Pages using GitHub Actions. Any push to the `main` branch will trigger a deployment.

### Manual Deployment

If you need to deploy manually:

1. Build the application:

```bash
cd frontend
npm run build
```

2. The static files will be generated in the `out` directory.

## Technology Stack

- **Frontend**: Next.js 15, React 18
- **Audio Processing**: Web Audio API, pitchy
- **Speech Recognition**: @xenova/transformers (Whisper)
- **Visualization**: D3.js
- **UI Components**: Material-UI
- **Deployment**: GitHub Pages

## License

MIT License
