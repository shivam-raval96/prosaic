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

    // Parameters for analysis
    const frameSize = 2048; // Number of samples per analysis frame
    const hopSize = 512; // Number of samples to advance between frames
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

      // Calculate volume (RMS - Root Mean Square) for this frame
      const rms = Math.sqrt(
        frame.reduce((sum, sample) => sum + sample * sample, 0) / frame.length
      );
      const volumeDb = 20 * Math.log10(Math.max(rms, 1e-10)); // Convert to dB
      const volumeNormalized = Math.max(0, (volumeDb + 60) / 60); // Normalize to 0-1 range

      // Only include pitch values with good clarity and within human voice range
      if (clarity > 0.6 && pitch >= 60 && pitch <= 350) {
        pitchValues.push(pitch);
      } else {
        pitchValues.push(null); // No pitch detected or outside range
      }

      volumeValues.push(volumeNormalized);
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

    // Calculate volume statistics
    const avgVolume =
      volumeValues.reduce((sum, vol) => sum + vol, 0) / volumeValues.length;
    const minVolume = Math.min(...volumeValues);
    const maxVolume = Math.max(...volumeValues);

    console.log("Pitch statistics:");
    console.log("Average pitch:", avgPitch.toFixed(2), "Hz");
    console.log("Min pitch:", minPitch.toFixed(2), "Hz");
    console.log("Max pitch:", maxPitch.toFixed(2), "Hz");

    console.log("Volume statistics:");
    console.log("Average volume:", avgVolume.toFixed(4));
    console.log("Min volume:", minVolume.toFixed(4));
    console.log("Max volume:", maxVolume.toFixed(4));

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

      // Volume data
      volumes: volumeValues,
      volumeTimestamps: timestamps,
      volumeStatistics: {
        average: avgVolume,
        min: minVolume,
        max: maxVolume,
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
        volume: {
          average: avgVolume,
          min: minVolume,
          max: maxVolume,
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

    if (clarity > 0.8 && pitch >= 60 && pitch <= 300) {
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
    console.log("Available volume measurements:", volumes.length);
    console.log("Available pitch measurements:", pitches.length);

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

      // Calculate average amplitude for this word's time period
      let wordAmplitudes = [];
      for (let j = 0; j < volumeTimestamps.length; j++) {
        const timestamp = volumeTimestamps[j];
        if (timestamp >= startTime && timestamp <= endTime) {
          wordAmplitudes.push(volumes[j]);
        }
      }
      const amplitude =
        wordAmplitudes.length > 0
          ? wordAmplitudes.reduce((sum, amp) => sum + amp, 0) /
            wordAmplitudes.length
          : 0;

      // Calculate variance of amplitude
      const varAmplitude =
        wordAmplitudes.length > 1
          ? wordAmplitudes.reduce(
              (sum, amp) => sum + Math.pow(amp - amplitude, 2),
              0
            ) /
            (wordAmplitudes.length - 1)
          : 0;

      // Calculate average pitch for this word's time period
      let wordPitches = [];
      for (let j = 0; j < pitchTimestamps.length; j++) {
        const timestamp = pitchTimestamps[j];
        if (timestamp >= startTime && timestamp <= endTime) {
          wordPitches.push(pitches[j]);
        }
      }
      const pitch =
        wordPitches.length > 0
          ? wordPitches.reduce((sum, p) => sum + p, 0) / wordPitches.length
          : 0;

      // Calculate variance of pitch
      const varPitch =
        wordPitches.length > 1
          ? wordPitches.reduce((sum, p) => sum + Math.pow(p - pitch, 2), 0) /
            (wordPitches.length - 1)
          : 0;

      // Create word analysis object
      const wordAnalysis = {
        Word: word,
        Start: startTime,
        End: endTime,
        length: length,
        time_spent: timeSpent,
        std_time_spent: stdTimeSpent,
        speed: speed,
        post_space: postSpace,
        amplitude: amplitude,
        pitch: pitch,
        time: startTime, // Using start time as reference
        var_amplitude: varAmplitude,
        var_pitch: varPitch,
      };

      wordAnalysisArray.push(wordAnalysis);

      // Log detailed analysis for debugging
      console.log(`Word "${word}":`, {
        start: startTime.toFixed(3),
        end: endTime.toFixed(3),
        length,
        timeSpent: timeSpent.toFixed(3),
        amplitude: amplitude.toFixed(4),
        pitch: pitch.toFixed(2),
        amplitudeSamples: wordAmplitudes.length,
        pitchSamples: wordPitches.length,
      });
    }

    console.log(
      "Word analysis array created with",
      wordAnalysisArray.length,
      "entries"
    );
    console.log("Sample entry:", wordAnalysisArray[0]);

    return wordAnalysisArray;
  } catch (error) {
    console.error("Error creating word analysis array:", error);
    return [];
  }
};

// Function to convert word analysis array to audio format for visualization
export const convertToAudioFormat = (wordAnalysisArray) => {
  try {
    console.log(
      "Converting word analysis to audio format for visualization..."
    );

    if (!wordAnalysisArray || wordAnalysisArray.length === 0) {
      console.error("No word analysis data to convert");
      return null;
    }

    const audio = {
      word: [],
      start: [],
      end: [],
      amp: [],
      pitch: [],
      time: [],
    };

    // Convert each word analysis entry to the expected format
    wordAnalysisArray.forEach((wordData) => {
      audio.word.push(wordData.Word);
      audio.start.push(wordData.Start);
      audio.end.push(wordData.End);
      audio.amp.push(wordData.amplitude);
      audio.pitch.push(wordData.pitch);
      audio.time.push(wordData.time);
    });

    console.log("Audio format conversion completed");
    console.log("Total words:", audio.word.length);
    console.log("Sample audio data:", {
      word: audio.word.slice(0, 3),
      start: audio.start.slice(0, 3),
      end: audio.end.slice(0, 3),
      amp: audio.amp.slice(0, 3),
      pitch: audio.pitch.slice(0, 3),
    });

    return audio;
  } catch (error) {
    console.error("Error converting to audio format:", error);
    return null;
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
