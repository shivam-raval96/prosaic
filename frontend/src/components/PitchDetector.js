"use client";

import { PitchDetector } from "pitchy";

export const detectPitchAndVolumeFromAudio = async (
  audioBlob,
  sampleRate = 44100
) => {
  try {
    console.log("Starting pitch and volume detection...");

    // Convert audio blob to array buffer
    const arrayBuffer = await audioBlob.arrayBuffer();
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();

    // Decode the audio data
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    const audioData = audioBuffer.getChannelData(0); // Get mono channel

    console.log("Audio duration:", audioBuffer.duration, "seconds");
    console.log("Sample rate:", audioBuffer.sampleRate);
    console.log("Total samples:", audioData.length);

    // Parameters for analysis - match backend settings
    const frameSize = 512; // Match backend FRAME_SIZE
    const hopSize = 512; // Match backend HOP_LENGTH
    const pitchValues = [];
    const volumeValues = [];
    const timestamps = [];

    // Create pitch detector instance
    const detector = PitchDetector.forFloat32Array(frameSize);

    // Analyze pitch and volume frame by frame
    for (let i = 0; i < audioData.length - frameSize; i += hopSize) {
      const frame = audioData.slice(i, i + frameSize);
      const timestamp = i / audioBuffer.sampleRate; // Convert sample index to time

      // Analyze pitch for this frame using the correct API
      const [pitch, clarity] = detector.findPitch(
        frame,
        audioBuffer.sampleRate
      );

      // Calculate amplitude using max amplitude (matching backend)
      const maxAmplitude = Math.max(...frame.map(Math.abs));
      volumeValues.push(maxAmplitude);

      // Only include pitch values with good clarity and within human voice range
      // Match backend pitch range: 50-350 Hz
      if (clarity > 0.8 && pitch >= 50 && pitch <= 350) {
        pitchValues.push(pitch);
      } else {
        pitchValues.push(null); // No pitch detected or outside range
      }

      timestamps.push(timestamp);
    }

    console.log("Pitch and volume detection completed");
    console.log("Total measurements:", pitchValues.length);
    console.log(
      "Valid pitch measurements:",
      pitchValues.filter((p) => p !== null).length
    );

    // Filter out null values and create clean arrays for pitch
    const validPitches = [];
    const validPitchTimestamps = [];

    for (let i = 0; i < pitchValues.length; i++) {
      if (pitchValues[i] !== null) {
        validPitches.push(pitchValues[i]);
        validPitchTimestamps.push(timestamps[i]);
      }
    }

    // Calculate pitch statistics
    const avgPitch =
      validPitches.length > 0
        ? validPitches.reduce((sum, pitch) => sum + pitch, 0) /
          validPitches.length
        : 0;
    const minPitch = validPitches.length > 0 ? Math.min(...validPitches) : 0;
    const maxPitch = validPitches.length > 0 ? Math.max(...validPitches) : 0;

    // Calculate amplitude statistics
    const avgAmplitude =
      volumeValues.reduce((sum, vol) => sum + vol, 0) / volumeValues.length;
    const minAmplitude = Math.min(...volumeValues);
    const maxAmplitude = Math.max(...volumeValues);

    console.log("Pitch statistics:");
    console.log("Average pitch:", avgPitch.toFixed(2), "Hz");
    console.log("Min pitch:", minPitch.toFixed(2), "Hz");
    console.log("Max pitch:", maxPitch.toFixed(2), "Hz");

    console.log("Amplitude statistics:");
    console.log("Average amplitude:", avgAmplitude.toFixed(4));
    console.log("Min amplitude:", minAmplitude.toFixed(4));
    console.log("Max amplitude:", maxAmplitude.toFixed(4));

    return {
      // Pitch data
      pitches: validPitches,
      pitchTimestamps: validPitchTimestamps,
      allPitches: pitchValues, // Include all values (with nulls)
      pitchStatistics: {
        average: avgPitch,
        min: minPitch,
        max: maxPitch,
        totalMeasurements: pitchValues.length,
        validMeasurements: validPitches.length,
      },

      // Amplitude data (using max amplitude like backend)
      volumes: volumeValues,
      volumeTimestamps: timestamps,
      volumeStatistics: {
        average: avgAmplitude,
        min: minAmplitude,
        max: maxAmplitude,
        totalMeasurements: volumeValues.length,
      },

      // Combined data
      timestamps: timestamps,
      statistics: {
        pitch: {
          average: avgPitch,
          min: minPitch,
          max: maxPitch,
          totalMeasurements: pitchValues.length,
          validMeasurements: validPitches.length,
        },
        amplitude: {
          average: avgAmplitude,
          min: minAmplitude,
          max: maxAmplitude,
          totalMeasurements: volumeValues.length,
        },
      },
    };
  } catch (error) {
    console.error("Pitch and volume detection error:", error);
    return null;
  }
};

// Keep the original function for backward compatibility
export const detectPitchFromAudio = async (audioBlob, sampleRate = 44100) => {
  const result = await detectPitchAndVolumeFromAudio(audioBlob, sampleRate);
  if (result) {
    return {
      pitches: result.pitches,
      timestamps: result.pitchTimestamps,
      allPitches: result.allPitches,
      allTimestamps: result.timestamps,
      statistics: result.pitchStatistics,
    };
  }
  return null;
};

// Alternative function for real-time pitch detection
export const createPitchAnalyzer = (onPitchDetected) => {
  let audioContext = null;
  let analyser = null;
  let microphone = null;
  let isAnalyzing = false;
  let detector = null;

  const startPitchAnalysis = async () => {
    try {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;

      // Create pitch detector instance
      detector = PitchDetector.forFloat32Array(analyser.frequencyBinCount);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      microphone = audioContext.createMediaStreamSource(stream);
      microphone.connect(analyser);

      isAnalyzing = true;
      analyzePitch();
    } catch (error) {
      console.error("Error starting pitch analysis:", error);
    }
  };

  const analyzePitch = () => {
    if (!isAnalyzing || !detector) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Float32Array(bufferLength);
    analyser.getFloatTimeDomainData(dataArray);

    const [pitch, clarity] = detector.findPitch(
      dataArray,
      audioContext.sampleRate
    );

    if (clarity > 0.8 && pitch >= 60 && pitch <= 400) {
      onPitchDetected(pitch, clarity);
    }

    requestAnimationFrame(analyzePitch);
  };

  const stopPitchAnalysis = () => {
    isAnalyzing = false;
    if (microphone) {
      microphone.disconnect();
    }
    if (audioContext) {
      audioContext.close();
    }
    detector = null;
  };

  return {
    start: startPitchAnalysis,
    stop: stopPitchAnalysis,
  };
};

// Function to create comprehensive word-level analysis array
export const createWordAnalysisArray = (transcription, audioData) => {
  try {
    console.log("Creating word-level analysis array...");

    if (!transcription || !transcription.chunks || !audioData) {
      console.error("Missing transcription chunks or audio data");
      return [];
    }

    const wordAnalysisArray = [];
    const { chunks } = transcription;
    const { volumes, volumeTimestamps, pitches, pitchTimestamps } = audioData;

    console.log("Processing", chunks.length, "word chunks");
    console.log("Available amplitude measurements:", volumes.length);
    console.log("Available pitch measurements:", pitches.length);

    // Calculate global averages for normalization (matching backend approach)
    const avgAmplitude =
      volumes.reduce((sum, vol) => sum + vol, 0) / volumes.length;
    const validPitches = pitches.filter((p) => p !== null && !isNaN(p));
    const avgPitch =
      validPitches.length > 0
        ? validPitches.reduce((sum, p) => sum + p, 0) / validPitches.length
        : 0;

    console.log(
      "Global averages - Amplitude:",
      avgAmplitude.toFixed(4),
      "Pitch:",
      avgPitch.toFixed(2)
    );

    // Create resampled timestamps (matching backend: 100 points per second)
    const maxTime = Math.max(...chunks.map((chunk) => chunk.timestamp[1]));
    const stepNum = Math.floor(maxTime * 100); // 100 points per second like backend
    const resampledTimestamps = Array.from(
      { length: stepNum },
      (_, i) => i / 100
    );

    // Resample amplitude and pitch data using spline interpolation
    const resampledAmplitudes = resampleWithSpline(
      volumeTimestamps,
      volumes,
      resampledTimestamps
    );
    const resampledPitches = resampleWithSpline(
      pitchTimestamps,
      pitches,
      resampledTimestamps
    );

    console.log("Resampled data points:", resampledTimestamps.length);

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const word = chunk.text.trim();
      const startTime = chunk.timestamp[0];
      const endTime = chunk.timestamp[1];

      // Calculate basic word properties
      const length = word.length;
      const timeSpent = endTime - startTime;
      const stdTimeSpent = timeSpent / length;
      const speed = length / timeSpent;

      // Calculate post_space (gap to next word)
      let postSpace = 0;
      if (i < chunks.length - 1) {
        const nextChunk = chunks[i + 1];
        postSpace = nextChunk.timestamp[0] - endTime;
      }

      // Find indices for this word's time period in resampled data
      const startIdx = Math.floor(startTime * 100);
      const endIdx = Math.floor(endTime * 100);

      // Extract amplitude data for this word (matching backend approach)
      const wordAmplitudes = resampledAmplitudes.slice(startIdx, endIdx + 1);
      const wordPitches = resampledPitches.slice(startIdx, endIdx + 1);

      // Calculate average amplitude for this word (matching backend)
      const amplitude =
        wordAmplitudes.length > 0
          ? wordAmplitudes.reduce((sum, amp) => sum + amp, 0) /
            wordAmplitudes.length
          : 0;

      // Normalize amplitude by global average (matching backend)
      const normAmplitude = avgAmplitude > 0 ? amplitude / avgAmplitude : 0;

      // Calculate average pitch for this word (matching backend)
      const validWordPitches = wordPitches.filter(
        (p) => p !== null && !isNaN(p) && p > 0
      );
      const pitch =
        validWordPitches.length > 0
          ? validWordPitches.reduce((sum, p) => sum + p, 0) /
            validWordPitches.length
          : 0;

      // Normalize pitch by global average (matching backend)
      const normPitch = avgPitch > 0 ? pitch / avgPitch : 0;

      // Create word analysis object (matching backend structure)
      const wordAnalysis = {
        Word: word,
        Start: startTime,
        End: endTime,
        length: length,
        time_spent: timeSpent,
        std_time_spent: stdTimeSpent,
        speed: speed,
        post_space: postSpace,
        amplitude: normAmplitude, // Normalized amplitude
        pitch: normPitch, // Normalized pitch
        time: startTime + (endTime - startTime) / 2, // Center time like backend
        raw_amplitude: amplitude, // Raw amplitude for reference
        raw_pitch: pitch, // Raw pitch for reference
      };

      wordAnalysisArray.push(wordAnalysis);

      // Log detailed analysis for debugging
      console.log(`Word "${word}":`, {
        start: startTime.toFixed(3),
        end: endTime.toFixed(3),
        length,
        timeSpent: timeSpent.toFixed(3),
        rawAmplitude: amplitude.toFixed(4),
        normAmplitude: normAmplitude.toFixed(4),
        rawPitch: pitch.toFixed(2),
        normPitch: normPitch.toFixed(4),
        amplitudeSamples: wordAmplitudes.length,
        pitchSamples: validWordPitches.length,
      });
    }

    console.log(
      "Word analysis array created with",
      wordAnalysisArray.length,
      "entries"
    );

    return wordAnalysisArray;
  } catch (error) {
    console.error("Error creating word analysis array:", error);
    return [];
  }
};

// Function to convert word analysis array to audio format for visualization
export const convertToAudioFormat = (wordAnalysisArray) => {
  try {
    console.log("Converting word analysis to audio format...");

    if (!wordAnalysisArray || wordAnalysisArray.length === 0) {
      console.error("No word analysis data to convert");
      return [];
    }

    const audioFormat = [];

    for (const wordAnalysis of wordAnalysisArray) {
      // Create audio format entry matching backend structure
      const audioEntry = {
        Word: wordAnalysis.Word,
        Start: wordAnalysis.Start,
        End: wordAnalysis.End,
        length: wordAnalysis.length,
        time_spent: wordAnalysis.time_spent,
        std_time_spent: wordAnalysis.std_time_spent,
        speed: wordAnalysis.speed,
        post_space: wordAnalysis.post_space,
        amplitude: wordAnalysis.amplitude, // Already normalized
        pitch: wordAnalysis.pitch, // Already normalized
        time: wordAnalysis.time,
      };

      audioFormat.push(audioEntry);
    }

    console.log("Converted", audioFormat.length, "entries to audio format");
    return audioFormat;
  } catch (error) {
    console.error("Error converting to audio format:", error);
    return [];
  }
};

// Function to export word analysis array to CSV
export const exportToCSV = (
  wordAnalysisArray,
  filename = "word_analysis.csv"
) => {
  try {
    console.log("Exporting word analysis to CSV...");

    if (!wordAnalysisArray || wordAnalysisArray.length === 0) {
      console.error("No word analysis data to export");
      return;
    }

    // Define CSV headers
    const headers = [
      "Word",
      "Start",
      "End",
      "length",
      "time_spent",
      "std_time_spent",
      "speed",
      "post_space",
      "amplitude",
      "pitch",
      "time",
      "var_amplitude",
      "var_pitch",
    ];

    // Create CSV content
    let csvContent = headers.join(",") + "\n";

    wordAnalysisArray.forEach((word) => {
      const row = [
        `"${word.Word}"`, // Wrap in quotes to handle commas in words
        word.Start.toFixed(6),
        word.End.toFixed(6),
        word.length,
        word.time_spent.toFixed(6),
        word.std_time_spent.toFixed(6),
        word.speed.toFixed(6),
        word.post_space.toFixed(6),
        word.amplitude.toFixed(6),
        word.pitch.toFixed(6),
        word.time.toFixed(6),
        word.var_amplitude.toFixed(6),
        word.var_pitch.toFixed(6),
      ];
      csvContent += row.join(",") + "\n";
    });

    // Create and download the file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      console.log("CSV file downloaded successfully:", filename);
    } else {
      console.error("Download not supported in this browser");
    }
  } catch (error) {
    console.error("Error exporting to CSV:", error);
  }
};

// Spline interpolation functions to match backend implementation
function splineInterpolation(x, y, xNew) {
  // Simple cubic spline interpolation
  const n = x.length;
  if (n < 2) return xNew.map(() => y[0] || 0);

  // Calculate second derivatives for cubic spline
  const h = [];
  const b = [];
  const u = [];
  const v = [];

  for (let i = 0; i < n - 1; i++) {
    h[i] = x[i + 1] - x[i];
    b[i] = 6 * ((y[i + 1] - y[i]) / h[i]);
  }

  // Solve tridiagonal system for second derivatives
  u[1] = 2 * (h[0] + h[1]);
  v[1] = b[1] - b[0];

  for (let i = 2; i < n - 1; i++) {
    u[i] = 2 * (h[i - 1] + h[i]) - (h[i - 1] * h[i - 1]) / u[i - 1];
    v[i] = b[i] - b[i - 1] - (h[i - 1] * v[i - 1]) / u[i - 1];
  }

  const z = new Array(n).fill(0);
  for (let i = n - 2; i > 0; i--) {
    z[i] = (v[i] - h[i] * z[i + 1]) / u[i];
  }

  // Evaluate spline at new points
  const result = [];
  for (let i = 0; i < xNew.length; i++) {
    const xi = xNew[i];

    // Find interval containing xi
    let j = 0;
    for (let k = 0; k < n - 1; k++) {
      if (xi >= x[k] && xi <= x[k + 1]) {
        j = k;
        break;
      }
    }

    const dx = xi - x[j];
    const a = (z[j + 1] - z[j]) / (6 * h[j]);
    const b_val = z[j] / 2;
    const c = (y[j + 1] - y[j]) / h[j] - (h[j] * (2 * z[j] + z[j + 1])) / 6;
    const d = y[j];

    result.push(a * dx * dx * dx + b_val * dx * dx + c * dx + d);
  }

  return result;
}

// Function to resample data using spline interpolation (matching backend)
function resampleWithSpline(timestamps, values, targetTimestamps) {
  // Filter out NaN values
  const validIndices = [];
  const validTimestamps = [];
  const validValues = [];

  for (let i = 0; i < values.length; i++) {
    if (!isNaN(values[i]) && values[i] !== null) {
      validIndices.push(i);
      validTimestamps.push(timestamps[i]);
      validValues.push(values[i]);
    }
  }

  if (validValues.length < 2) {
    return targetTimestamps.map(() => 0);
  }

  return splineInterpolation(validTimestamps, validValues, targetTimestamps);
}
