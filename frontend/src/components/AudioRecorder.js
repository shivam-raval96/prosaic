"use client";

import React, { useState, useRef } from "react";
import { Button } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { pipeline } from "@xenova/transformers";
import {
  detectPitchAndVolumeFromAudio,
  createWordAnalysisArray,
  convertToAudioFormat,
  exportToCSV,
} from "./PitchDetector";

const AudioRecorder = ({ onRecordingComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isDetectingPitch, setIsDetectingPitch] = useState(false);
  const [isDetectingVolume, setIsDetectingVolume] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/wav",
        });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioURL(audioUrl);

        // Transcribe the audio and detect pitch/volume in parallel
        const [transcription, audioData] = await Promise.all([
          transcribeAudio(audioBlob),
          detectPitchAndVolume(audioBlob),
        ]);

        // Create word-level analysis array
        const wordAnalysisArray = createWordAnalysisArray(
          transcription,
          audioData
        );

        // Convert to audio format for visualization
        const audioFormat = convertToAudioFormat(wordAnalysisArray);

        // Export to CSV
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const filename = `word_analysis_${timestamp}.csv`;
        exportToCSV(wordAnalysisArray, filename);

        // Call the original callback with audio blob, transcription, audio analysis data, word analysis, and audio format
        onRecordingComplete(
          audioBlob,
          transcription,
          audioData,
          wordAnalysisArray,
          audioFormat
        );

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Error accessing microphone. Please check permissions.");
    }
  };

  const transcribeAudio = async (audioBlob) => {
    try {
      setIsTranscribing(true);
      console.log("Starting transcription...");

      // Create a URL for the audio blob
      const audioUrl = URL.createObjectURL(audioBlob);

      // Initialize the transcriber
      const transcriber = await pipeline(
        "automatic-speech-recognition",
        "Xenova/whisper-base.en"
      );

      // Transcribe the audio
      const output = await transcriber(audioUrl, { return_timestamps: "word" });

      console.log("Transcription completed:");
      console.log("Full text:", output.text);
      console.log("Chunks with timestamps:", output.chunks);

      // Clean up the audio URL
      URL.revokeObjectURL(audioUrl);

      setIsTranscribing(false);

      // Return the transcription data
      return {
        text: output.text,
        chunks: output.chunks,
      };
    } catch (error) {
      console.error("Transcription error:", error);
      setIsTranscribing(false);
      return null;
    }
  };

  const detectPitchAndVolume = async (audioBlob) => {
    try {
      setIsDetectingPitch(true);
      setIsDetectingVolume(true);
      console.log("Starting pitch and volume detection...");

      const audioData = await detectPitchAndVolumeFromAudio(audioBlob);

      console.log("Pitch and volume detection completed:");
      console.log("Audio data:", audioData);

      setIsDetectingPitch(false);
      setIsDetectingVolume(false);

      return audioData;
    } catch (error) {
      console.error("Pitch and volume detection error:", error);
      setIsDetectingPitch(false);
      setIsDetectingVolume(false);
      return null;
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div>
      <Button
        variant="contained"
        color={
          isRecording
            ? "secondary"
            : isTranscribing || isDetectingPitch || isDetectingVolume
            ? "warning"
            : "primary"
        }
        onClick={handleClick}
        startIcon={<CloudUploadIcon />}
        disabled={isTranscribing || isDetectingPitch || isDetectingVolume}
      >
        {isRecording
          ? "Stop Recording"
          : isTranscribing
          ? "Transcribing..."
          : isDetectingPitch || isDetectingVolume
          ? "Analyzing Audio..."
          : "Record Audio"}
      </Button>
      {isTranscribing && (
        <div style={{ marginTop: "10px", color: "#f57c00", fontSize: "14px" }}>
          Transcribing audio... This may take a few seconds.
        </div>
      )}
      {isDetectingPitch && (
        <div style={{ marginTop: "10px", color: "#f57c00", fontSize: "14px" }}>
          Analyzing audio... Detecting pitch and volume.
        </div>
      )}
      {audioURL && (
        <audio controls src={audioURL} style={{ marginTop: "10px" }} />
      )}
    </div>
  );
};

export default AudioRecorder;
