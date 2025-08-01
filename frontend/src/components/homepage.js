// src/App.js
import React, { useState, useEffect, useRef } from "react";
import CurveRender from "./curverender";
import Legend from "./legend";
import AudioRecorder from "./AudioRecorder";

import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
//import data3 from "../data/obama_speech.csv"; //k0jJL_YFyIU //Barack Obama's final speech as president – video highlights
//import data3 from "/data/martin_hbs2.csv"; //O_JAZNbj8Pg //Augmenting Human and Machine Intelligence with Data Visualization (Martin Wattenberg)
//import data3 from "../data/TranscribedAudio1.csv";
//import data3 from "../data/finale.csv"; //4lIr8rgo5zE
//import data2 from "/data/fernanda_hbs2.csv"; //u5JV88yPoGc //Augmenting Human and Machine Intelligence with Data Visualization (Fernanda Viégas)
//import data2 from "../data/TranscribedAudio2.csv";
//import data2 from "../data/obama_interview.csv"; //x3zgCVqqf3Q //Obama: War in Ukraine 'a wake-up call to Europe' and democracies around the world

// TODO: Replace with frontend-only implementation
// import { AudioVisualizer, LiveAudioVisualizer } from "react-audio-visualize";
// TODO: Replace with frontend-only implementation
// import { AudioRecorder, useAudioRecorder } from "react-audio-voice-recorder";
// TODO: Replace with frontend-only implementation
// import axios from "axios";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import SendIcon from "@mui/icons-material/Send";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import Slider from "@mui/material/Slider";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import CloseIcon from "@mui/icons-material/Close";

//import TextRender from './components/textrender';
import * as d3 from "d3";
// TODO: Replace with frontend-only implementation
// const localDevURL = "http://127.0.0.1:8000/";

function Homepage() {
  const [loading1, setLoading1] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [tiled, setTiled] = useState(false);
  const [error, setError] = useState();

  const [file, setFile] = useState();
  const [uploadedFile, setUploadedFile] = useState();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFileURL, setUploadedFileURL] = useState();

  const [presetNumber, setPresetNumber] = useState(0);

  const [speaker1, setData] = useState(null);
  const [speaker2, setData2] = useState(null);

  const [speaker1url, setSpeaker1url] = useState("O_JAZNbj8Pg");
  const [speaker2url, setSpeaker2url] = useState("u5JV88yPoGcls");

  const [videotitle1, setVideoTitle1] = useState("");
  //const [videotitle1, setVideoTitle1] = useState("The Possibility of Explanation | Finale Doshi-Velez | TEDxBoston");
  const [videotitle2, setVideoTitle2] = useState("");

  const [pauseCheck, pauseCheckStatus] = useState(false);
  const [caedenceCheck, setcaedenceCheck] = useState(false);

  const [normalCheck, setNormalStatus] = useState(false);
  const [wordDensityCheck, setWordDensityCheck] = useState(false);
  const [pauseSlider, setPauseSlider] = useState(1.0);

  const [amplitudeScale, setAmplitudeScale] = useState(1.0); // New state for amplitude scale
  const [speedSlider, setSpeedSlider] = useState(0.03);
  const [timeSlider, setTimeSlider] = useState(30);
  const [speedvalue, setValue] = React.useState([0, 0]);

  const [phraseMatches1, setPhraseMatches1] = useState([[]]); //index -> audio 1, value -> audio2 ; searching from audio 1 is O(1), searching from audio 2 is O(n)
  const [phraseMatches2, setPhraseMatches2] = useState([[]]); //index -> audio 1, value -> audio2 ; searching from audio 1 is O(1), searching from audio 2 is O(n)

  const [blob, setBlob] = useState(null);
  const [blob2, setBlob2] = useState(null);

  const [audioUrl, setAudioUrl] = useState(null);
  const [audioUrl2, setAudioUrl2] = useState(null);

  const [averageAmplitude1, setAverageAmplitude1] = useState(0);
  const [averageSpeed1, setAverageSpeed1] = useState(0);
  const [averagePitch1, setAveragePitch1] = useState(0);

  const [averageAmplitude2, setAverageAmplitude2] = useState(0);
  const [averageSpeed2, setAverageSpeed2] = useState(0);
  const [averagePitch2, setAveragePitch2] = useState(0);

  const [phraseStart1, setPhraseStart1] = useState([]);
  const [phraseStart2, setPhraseStart2] = useState([]);

  const [phraseEnd1, setPhraseEnd1] = useState([]);
  const [phraseEnd2, setPhraseEnd2] = useState([]);
  // TODO: Replace with frontend-only implementation
  // const recorder = useAudioRecorder();
  //  const recorder2 = useAudioRecorder();

  const [legendOpen, setLegendOpen] = useState(true);

  const [videoPlaybackEnabled, setVideoPlaybackEnabled] = useState(false);
  const [showVideo, setShowVideo] = useState(true);
  const [videoTime, setVideoTime] = useState(0);
  const [videoId, setVideoId] = useState(null);

  const [dtwData1, setDtwData1] = useState(-1);
  const [dtwData2, setDtwData2] = useState(-1);

  const urlOptions = [
    [
      { name: "Alex Poem - Dynamic", url: "data/alex_poem_dynamic.csv" },
      { name: "Alex Poem - Monotone", url: "data/alex_poem_monotone.csv" },
      { name: "Ivy Poem - Dynamic", url: "data/ivy_poem_dynamic.csv" },
      { name: "Ivy Poem - Monotone", url: "data/ivy_poem_monotone.csv" },
      { name: "Test 1", url: "data/test1.csv" },
      { name: "Test 2", url: "data/test2.csv" },
    ],
    [
      { name: "Martin HBS2", url: "data/martin_hbs2.csv" },
      { name: "Fernanda HBS2", url: "data/fernanda_hbs2.csv" },
      { name: "Finale", url: "data/finale.csv" },
      { name: "Obama Speech", url: "data/obama_speech.csv" },
      { name: "Obama Interview", url: "data/obama_interview.csv" },
    ],
    [
      { name: "Alex Poem - Dynamic", url: "data/alex_poem_dynamic.csv" },
      { name: "Alex Poem - Monotone", url: "data/alex_poem_monotone.csv" },
      { name: "Ivy Poem - Dynamic", url: "data/ivy_poem_dynamic.csv" },
      { name: "Ivy Poem - Monotone", url: "data/ivy_poem_monotone.csv" },
      { name: "Test 1", url: "data/test1.csv" },
      { name: "Test 2", url: "data/test2.csv" },
    ],
  ];

  const [selectedUrl, setSelectedUrl] = useState(urlOptions[0][0]);

  // Load initial CSV data for speaker2
  useEffect(() => {
    if (selectedUrl && selectedUrl.url) {
      setLoading2(true);
      grabData(selectedUrl.url, setData2, setLoading2);
      setVideoTitle2(selectedUrl.name);
    }
  }, []);

  // Reset selected URL when preset changes
  useEffect(() => {
    if (urlOptions[presetNumber] && urlOptions[presetNumber][0]) {
      setSelectedUrl(urlOptions[presetNumber][0]);
      setSpeaker2url(urlOptions[presetNumber][0].url);
      setVideoTitle2(urlOptions[presetNumber][0].name);
      setLoading2(true);
      grabData(urlOptions[presetNumber][0].url, setData2, setLoading2);
    }
  }, [presetNumber]);

  const VisuallyHiddenInput = styled("input")({
    clip: "rect(0 0 0 0)",
    clipPath: "inset(50%)",
    height: 1,
    overflow: "hidden",
    position: "absolute",
    bottom: 0,
    left: 0,
    whiteSpace: "nowrap",
    width: 1,
  });

  const handleVideoChange = (time, id, doesShowVideo = true) => {
    setVideoTime(time);
    setVideoId(id);
    setShowVideo(doesShowVideo);
  };

  const handleVideoChangeOne = (time, id, doesShowVideo = true) => {
    setVideoTime(time);
    setVideoId(id);
    setShowVideo(doesShowVideo);
  };

  const highlightDTWMatch = (i, isOne) => {
    if (isOne) {
      setDtwData1(i);
    } else {
      setDtwData2(i);
    }
  };

  const toggle = (event) => {
    pauseCheckStatus(!pauseCheck);
  };

  const toggleVideo = (event) => {
    setVideoPlaybackEnabled(!videoPlaybackEnabled);
  };

  const toggleCaedence = (event) => {
    setcaedenceCheck(!caedenceCheck);
  };

  const toggleTiled = (event) => {
    setTiled(!tiled);
  };

  const normalToggle = (event) => {
    setNormalStatus(!normalCheck);
  };

  const densityToggle = (event) => {
    setWordDensityCheck(!wordDensityCheck);
  };

  const pauseSlide = (event) => {
    setPauseSlider(event.target.value);
    document.querySelector("#pauseRange").innerHTML =
      "Pause Length: " + event.target.value + " seconds";
  };

  const speedSlide = (event) => {
    setSpeedSlider(event.target.value);
    document.querySelector("#speedRange").innerHTML =
      "Speed: " + event.target.value + " seconds per word";
  };

  // TODO: Replace with frontend-only implementation
  const handleUpload = async (event, callback, callback2, callback3, isOne) => {
    const file = event.target.files[0];

    console.log("isOne" + isOne);
    callback3(true);
    if (file) {
      console.log("File uploaded:", file.name);
      // TODO: Implement frontend-only file processing
      // For now, just simulate loading
      setTimeout(() => {
        callback3(false);
        // TODO: Process file and call callback with processed data
      }, 2000);
    }
    if (!file) {
      alert("Please select a file first!");
      return;
    }

    // TODO: Replace with frontend-only implementation
    // const formData = new FormData();
    // formData.append('file', file);
    // formData.append("isOne",isOne?"1":"0");

    // try {
    //   console.log("Upload Started");
    //   const response = await axios.post(localDevURL + "upload-transcribe", formData, {
    //     headers: {
    //       'Content-Type': 'multipart/form-data'
    //     }
    //   });
    //   // ... rest of the backend logic
    // } catch (error) {
    //   console.error('Error:', error);
    //   callback3(false);
    // }
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const timeSlide = (event) => {
    setTimeSlider(event.target.value);

    document.querySelector("#timeRange").innerHTML =
      "Each line represents " + event.target.value + " seconds of speaking";
    // You might want to update the data or do something else when the toggle is hit
  };

  // TODO: Replace with frontend-only implementation
  const sendAudioToTranscribe = async (
    audioBlob,
    filename,
    callback,
    callback2,
    callback3,
    isOne
  ) => {
    callback3(true);
    // TODO: Implement frontend-only audio processing
    // For now, just simulate loading
    setTimeout(() => {
      callback3(false);
      // TODO: Process audio and call callback with processed data
    }, 2000);

    // TODO: Replace with frontend-only implementation
    // const formData = new FormData();
    // formData.append("file", audioBlob, filename);
    // formData.append("isOne",isOne?"1":"0");

    // try {
    //     const response = await axios.post(localDevURL + "rec-transcribe", formData, {
    //         headers: {
    //             'Content-Type': 'multipart/form-data'
    //         }
    //     });
    //     // ... rest of the backend logic
    // } catch (error) {
    //     console.error('Error:', error);
    //     callback3(false);
    // }
  };

  // TODO: Replace with frontend-only implementation
  const handleSend = async (
    filename,
    url,
    callback,
    callback2,
    callback3,
    isOne
  ) => {
    callback3(true);
    // TODO: Implement frontend-only URL processing
    // For now, just simulate loading
    setTimeout(() => {
      callback3(false);
      // TODO: Process URL and call callback with processed data
    }, 2000);

    // TODO: Replace with frontend-only implementation
    // try {
    //     const response = await axios.post(localDevURL + "transcribe", {
    //       filename: filename,
    //       url: url,
    //       isOne: isOne
    //     });
    //     // ... rest of the backend logic
    // } catch (error) {
    //     console.error('Error:', error);
    //     callback3(false)
    // }
  };

  // prepare data using d3
  useEffect(() => {
    // Load data using fetch instead of direct imports
    setLoading1(true);
    setLoading2(true);
    grabData("data/martin_hbs2.csv", setData, setLoading1);
    grabData("data/fernanda_hbs2.csv", setData2, setLoading2);
  }, []);

  useEffect(() => {
    if (blob) {
      sendAudioToTranscribe(
        blob,
        "rec1.wav",
        setData,
        setVideoTitle1,
        setLoading1,
        true
      );
      const newAudioUrl = URL.createObjectURL(blob);
      setAudioUrl(newAudioUrl);
      setSpeaker1url("Enter YouTube link");
      setVideoTitle1("Audio Recording");
      // Clean up
      return () => {
        URL.revokeObjectURL(newAudioUrl);
      };
    }
  }, [blob]);

  useEffect(() => {
    if (blob2) {
      sendAudioToTranscribe(
        blob2,
        "rec2.wav",
        setData2,
        setVideoTitle2,
        setLoading2,
        false
      );
      const newAudioUrl2 = URL.createObjectURL(blob2);
      setAudioUrl2(newAudioUrl2);
      setSpeaker2url("Enter YouTube link");
      setVideoTitle2("Audio Recording");

      // Clean up
      return () => {
        URL.revokeObjectURL(newAudioUrl2);
      };
    }
  }, [blob2]);

  //if (speaker1.length === 0 || speaker2.length === 0) {
  //  return <div>Loading...</div>;
  // }

  return (
    <>
      <div className="container-fluid">
        <div className="row no-gutters">
          <div className="col-lg-2">
            <div className="upload2"></div>
            <button
              onClick={() => setLegendOpen(true)}
              className={`btn btn-square ${"btn-outline-secondary"}`}
              style={{ width: "100%", marginBottom: "10px" }}
            >
              Show Legend
            </button>
            <div className="container-fluid" style={{ width: "100%" }}>
              <div className="row no-gutters">
                <div className="card">
                  <h3 className="card-header bg-white">Presets</h3>
                  <div className="card-body">
                    <div
                      className="btn-group"
                      role="group"
                      aria-label="Preset Buttons"
                      style={{ display: "flex", justifyContent: "center" }}
                    >
                      <button
                        className={`btn btn-square ${
                          presetNumber === 0
                            ? "btn-secondary"
                            : "btn-outline-secondary"
                        }`}
                        style={{ width: "50%", flex: 1, padding: "4px" }}
                        onClick={() => setPresetNumber(0)}
                      >
                        Poems
                      </button>
                      <button
                        className={`btn btn-square ${
                          presetNumber === 1
                            ? "btn-secondary"
                            : "btn-outline-secondary"
                        }`}
                        style={{ width: "50%", flex: 1, padding: "8px" }}
                        onClick={() => setPresetNumber(1)}
                      >
                        Talks
                      </button>
                      <button
                        className={`btn btn-square ${
                          presetNumber === 2
                            ? "btn-secondary"
                            : "btn-outline-secondary"
                        }`}
                        style={{ width: "50%", flex: 1, padding: "6px" }}
                        onClick={() => setPresetNumber(2)}
                      >
                        Mixed
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="row no-gutters">
                <div className="card">
                  <h3 className="card-header bg-white">Controls</h3>
                  <div className="form-check form-switch">
                    <Tooltip title="Video playback on click">
                      <input
                        className="form-check-input"
                        checked={videoPlaybackEnabled}
                        onChange={toggleVideo}
                        type="checkbox"
                        id="videoSwitch"
                      />
                      <label className="form-check-label" htmlFor="videoSwitch">
                        Show Video Playback
                      </label>
                    </Tooltip>
                  </div>
                  <div className="form-check form-switch">
                    <Tooltip title="Only depicts pauses">
                      <input
                        className="form-check-input"
                        checked={pauseCheck}
                        onChange={toggle}
                        type="checkbox"
                        id="pauseSwitch"
                      />
                      <label className="form-check-label" htmlFor="pauseSwitch">
                        View Only Pauses
                      </label>
                    </Tooltip>
                  </div>
                  <div className="form-check form-switch">
                    <Tooltip title="Forces a new line at each pause.">
                      <input
                        className="form-check-input"
                        checked={caedenceCheck}
                        onChange={toggleCaedence}
                        type="checkbox"
                        id="caedenceSwitch"
                      />
                      <label
                        className="form-check-label"
                        htmlFor="caedenceSwitch"
                      >
                        Cut off at Pauses
                      </label>
                    </Tooltip>
                  </div>
                  <div className="form-check form-switch">
                    <Tooltip title="Separates amplitude and pitch visualizations.">
                      <input
                        className="form-check-input"
                        checked={tiled}
                        onChange={toggleTiled}
                        type="checkbox"
                        id="tiledSwitch"
                      />
                      <label className="form-check-label" htmlFor="tiledSwitch">
                        Tiled View
                      </label>
                    </Tooltip>
                  </div>
                  <div className="form-check form-switch">
                    <Tooltip title="Normalized pitch coloring for individual audio clips.">
                      <input
                        className="form-check-input"
                        checked={normalCheck}
                        onChange={normalToggle}
                        type="checkbox"
                        id="normalSwitch"
                      />
                      <label
                        className="form-check-label"
                        htmlFor="normalSwitch"
                      >
                        Normalize
                      </label>
                    </Tooltip>
                  </div>
                  <div className="form-check form-switch">
                    <Tooltip title="Adds additional visualizations for distinct words.">
                      <input
                        className="form-check-input"
                        checked={wordDensityCheck}
                        onChange={densityToggle}
                        type="checkbox"
                        id="normalSwitch"
                      />
                      <label
                        className="form-check-label"
                        htmlFor="normalSwitch"
                      >
                        View Word Density
                      </label>
                    </Tooltip>
                  </div>
                  <hr />
                  <label
                    htmlFor="customRange3"
                    id="pauseRange"
                    className="form-label"
                  >
                    Pause Length: 1.0 seconds
                  </label>
                  <input
                    onChange={pauseSlide}
                    type="range"
                    className="form-range"
                    min="0.2"
                    max="2"
                    step="0.1"
                    value={pauseSlider}
                    id="customRange3"
                  ></input>
                  <hr />

                  {/* <Tooltip title="Depicts words with lengths within this range.">
              <label htmlFor="customRange4" id="speedRange" className="form-label">Show emphasized words</label>
              
              </Tooltip>
              <Slider
                  value={speedvalue}
                  onChange={handleChange}
                  valueLabelDisplay="auto"
                  step={0.01}
                  min={0.02}
                  max={0.12}
                /> */}
                  <label
                    htmlFor="customRange5"
                    id="timeRange"
                    className="form-label"
                  >
                    Each line represents 30 seconds of speaking
                  </label>
                  <input
                    onChange={timeSlide}
                    type="range"
                    className="form-range"
                    min="10"
                    max="90"
                    step="10"
                    value={timeSlider}
                    id="customRange5"
                  ></input>
                  <hr />
                  {/* <label htmlFor="amplitudeRange" id="amplitudeRange" className="form-label">
                  Amplitude Scale: {amplitudeScale.toFixed(2)}
                </label>
                <input
                  onChange={(e) => setAmplitudeScale(parseFloat(e.target.value))}
                  type="range"
                  className="form-range"
                  min="0.5"
                  max="3"
                  step="0.1"
                  value={amplitudeScale}
                  id="amplitudeRange"
                />
              <hr/> */}
                </div>

                <Dialog
                  open={legendOpen}
                  onClose={() => setLegendOpen(false)}
                  maxWidth="sm"
                  fullWidth
                >
                  <DialogTitle>Legend</DialogTitle>
                  <DialogContent dividers>
                    <div className="legend">
                      <Legend
                        width={"100%"}
                        height={40}
                        pauseStatus={pauseCheck}
                        normalizeStatus={normalCheck}
                      />
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <b>Low Pitch</b>
                      <b>High Pitch</b>
                    </div>
                    <hr />
                    Volume is shown by width.
                    <hr />
                    Click on the graph to view the audio component.
                  </DialogContent>
                  <DialogActions>
                    <Button
                      onClick={() => setLegendOpen(false)}
                      color="primary"
                    >
                      Close
                    </Button>
                  </DialogActions>
                </Dialog>
              </div>
            </div>
          </div>
          <div id="tooltip"></div>
          <div
            className="rec1"
            style={{
              width: "700px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <Button
              component="label"
              role={undefined}
              variant="contained"
              tabIndex={-1}
              startIcon={<CloudUploadIcon sx={{ border: "none" }} />}
            >
              Upload file
              <VisuallyHiddenInput
                type="file"
                accept=".wav,video/mp4/mp3"
                onChange={(event) =>
                  handleUpload(
                    event,
                    setData,
                    setVideoTitle1,
                    setLoading1,
                    true
                  )
                }
              />
            </Button>
            <AudioRecorder
              onRecordingComplete={(
                audioBlob,
                transcription,
                audioData,
                wordAnalysisArray,
                audioFormat
              ) => {
                // Simulate upload similar to handleUpload
                sendAudioToTranscribe(
                  audioBlob,
                  "rec1.wav",
                  setData,
                  setVideoTitle1,
                  setLoading1,
                  true
                );
                const newAudioUrl = URL.createObjectURL(audioBlob);
                setAudioUrl(newAudioUrl);
                setSpeaker1url("Enter YouTube link");
                setVideoTitle1("Audio Recording");

                // Log transcription data
                if (transcription) {
                  console.log("=== TRANSCRIPTION DATA ===");
                  console.log("Full transcription:", transcription.text);
                  console.log("Timestamped chunks:", transcription.chunks);
                  console.log("=== END TRANSCRIPTION ===");
                }

                // Log pitch and volume data
                if (audioData) {
                  console.log("=== PITCH DATA ===");
                  console.log("Pitch values (Hz):", audioData.pitches);
                  console.log(
                    "Pitch timestamps (seconds):",
                    audioData.pitchTimestamps
                  );
                  console.log("Pitch statistics:", audioData.pitchStatistics);
                  console.log(
                    "Average pitch:",
                    audioData.pitchStatistics.average.toFixed(2),
                    "Hz"
                  );
                  console.log(
                    "Pitch range:",
                    audioData.pitchStatistics.min.toFixed(2),
                    "-",
                    audioData.pitchStatistics.max.toFixed(2),
                    "Hz"
                  );
                  console.log("=== END PITCH DATA ===");

                  console.log("=== VOLUME DATA ===");
                  console.log(
                    "Volume values (normalized 0-1):",
                    audioData.volumes
                  );
                  console.log(
                    "Volume timestamps (seconds):",
                    audioData.volumeTimestamps
                  );
                  console.log("Volume statistics:", audioData.volumeStatistics);
                  console.log(
                    "Average volume:",
                    audioData.volumeStatistics.average.toFixed(4)
                  );
                  console.log(
                    "Volume range:",
                    audioData.volumeStatistics.min.toFixed(4),
                    "-",
                    audioData.volumeStatistics.max.toFixed(4)
                  );
                  console.log("=== END VOLUME DATA ===");
                }

                // Log word analysis array
                if (wordAnalysisArray && wordAnalysisArray.length > 0) {
                  console.log("=== WORD ANALYSIS ARRAY ===");
                  console.log(
                    "Total words analyzed:",
                    wordAnalysisArray.length
                  );
                  console.log("Word analysis data:", wordAnalysisArray);

                  // Log sample entries
                  console.log("Sample word entries:");
                  wordAnalysisArray.slice(0, 3).forEach((word, index) => {
                    console.log(`Word ${index + 1}: "${word.Word}"`, {
                      start: word.Start.toFixed(3),
                      end: word.End.toFixed(3),
                      length: word.length,
                      timeSpent: word.time_spent.toFixed(3),
                      speed: word.speed.toFixed(2),
                      amplitude: word.amplitude.toFixed(4),
                      pitch: word.pitch.toFixed(2),
                      postSpace: word.post_space.toFixed(3),
                    });
                  });

                  // Log summary statistics
                  const avgSpeed =
                    wordAnalysisArray.reduce(
                      (sum, word) => sum + word.speed,
                      0
                    ) / wordAnalysisArray.length;
                  const avgAmplitude =
                    wordAnalysisArray.reduce(
                      (sum, word) => sum + word.amplitude,
                      0
                    ) / wordAnalysisArray.length;
                  const avgPitch =
                    wordAnalysisArray.reduce(
                      (sum, word) => sum + word.pitch,
                      0
                    ) / wordAnalysisArray.length;

                  console.log("Summary statistics:");
                  console.log(
                    "Average speed:",
                    avgSpeed.toFixed(2),
                    "characters/second"
                  );
                  console.log("Average amplitude:", avgAmplitude.toFixed(4));
                  console.log("Average pitch:", avgPitch.toFixed(2), "Hz");
                  console.log("=== END WORD ANALYSIS ARRAY ===");
                }

                // Update left visual with the new audio format
                if (audioFormat) {
                  console.log("=== UPDATING LEFT VISUAL ===");
                  console.log("Audio format for visualization:", audioFormat);

                  // Update the left pane data
                  setData(audioFormat);
                  setVideoTitle1("Recorded Audio Analysis");
                  setSpeaker1url("Audio Recording");

                  console.log("Left visual updated with recorded audio data");
                  console.log("=== END LEFT VISUAL UPDATE ===");
                }

                // Clear the loading state after all processing is complete
                setLoading1(false);
              }}
            />
            {/* <div>
            {audioUrl && <audio controls style={{marginLeft: 'auto'}} className="player1" src={audioUrl} style={{transform: 'translateX(50%)',}}></audio>}
            </div> */}

            <IconButton aria-label="send" sx={{ border: "none" }}>
              {loading1 ? (
                <CircularProgress
                  sx={{ border: "none" }}
                  size="1.5rem"
                  color="inherit"
                  style={{}}
                />
              ) : (
                <SendIcon
                  sx={{ border: "none" }}
                  onClick={() =>
                    handleSend(
                      "rec1.wav",
                      speaker1url,
                      setData,
                      setVideoTitle1,
                      setLoading1,
                      true
                    )
                  }
                />
              )}
            </IconButton>
          </div>

          <div className="url2" style={{ width: "300px", marginLeft: "-60px" }}>
            <Select
              value={selectedUrl.url} // Use the `url` property of the selected option
              onChange={(e) => {
                console.log("SELECTED NEW CSV: " + e.target.value);
                const selectedOption = urlOptions[presetNumber].find(
                  (option) => option.url === e.target.value
                );
                setSelectedUrl(selectedOption); // Update the selected option
                setSpeaker2url(e.target.value); // Update speaker2url with the selected CSV path
                setVideoTitle2(selectedOption.name); // Update video title with the CSV name
                setLoading2(true); // Show loading state

                // Load CSV data directly
                grabData(e.target.value, setData2, setLoading2);
              }}
              size="small"
              sx={{ width: "300px", float: "right" }} // Adjust width as needed
            >
              {urlOptions[presetNumber].map((option, index) => (
                <MenuItem key={index} value={option.url}>
                  {option.name}
                </MenuItem>
              ))}
            </Select>
          </div>
          <div className="col-lg-5 speaker1">
            {speaker1 && (
              <>
                <CurveRender
                  videoHandler={handleVideoChangeOne}
                  wordDensityToggle={wordDensityCheck}
                  audio={speaker1}
                  width={window.innerWidth / 2}
                  height={window.innerHeight * 0.8}
                  caedenceStatus={caedenceCheck}
                  pauseStatus={pauseCheck}
                  normalizeStatus={normalCheck}
                  tiledStatus={tiled}
                  name="speaker1"
                  pauseSlider={pauseSlider}
                  speedSlider={speedvalue}
                  timeSlider={timeSlider}
                  videoID={speaker1url}
                  videoTime={videoTime}
                  averageAmplitude={averageAmplitude1}
                  averageSpeed={averageSpeed1}
                  averagePitch={averagePitch1}
                  phraseStart={phraseStart1}
                  phraseEnd={phraseEnd1}
                  isOne={true}
                  dtwCallback={highlightDTWMatch}
                  dtwData={dtwData1}
                  amplitudeScale={amplitudeScale}
                  isLoading={loading1}
                />
                {/* <Ticks width={window.innerWidth / 2.6} timeSlider={timeSlider} /> */}
              </>
            )}
          </div>
          <div className="col-lg-5 speaker2">
            {speaker2 && (
              <>
                <CurveRender
                  videoHandler={handleVideoChange}
                  wordDensityToggle={wordDensityCheck}
                  audio={speaker2}
                  width={window.innerWidth / 2}
                  height={window.innerHeight * 0.8}
                  caedenceStatus={caedenceCheck}
                  pauseStatus={pauseCheck}
                  normalizeStatus={normalCheck}
                  tiledStatus={tiled}
                  name="speaker2"
                  pauseSlider={pauseSlider}
                  speedSlider={speedvalue}
                  timeSlider={timeSlider}
                  videoID={speaker2url}
                  videoTime={videoTime}
                  averageAmplitude={averageAmplitude2}
                  averageSpeed={averageSpeed2}
                  averagePitch={averagePitch2}
                  phraseStart={phraseStart2}
                  phraseEnd={phraseEnd2}
                  isOne={false}
                  dtwCallback={highlightDTWMatch}
                  dtwData={dtwData2}
                  amplitudeScale={amplitudeScale}
                  isLoading={loading2}
                />
                {/* <Ticks width={window.innerWidth / 2.6} timeSlider={timeSlider} /> */}
              </>
            )}
          </div>
          {showVideo && videoId && (
            <div className="videoPlayerContainer">
              <button
                onClick={() => setShowVideo(false)}
                className="btn dismiss-button"
                style={{
                  zIndex: 2,
                }}
              >
                Dismiss
              </button>
              <iframe
                id="ytplayer"
                type="text/html"
                width="250"
                height="200"
                // &start=${videoTime}
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&start=${videoTime}`}
                className="videoPlayer"
                style={{ zIndex: 1 }}
              ></iframe>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function grabData(data2, set_Data, setLoading = null) {
  d3.csv(data2, function (d) {
    return {
      word: d.Word,
      start: +d.Start,
      end: +d.End,
      pitch: +d.pitch,
      vol: +d.amplitude,
    };
  })
    .then((loadedData) => {
      let audio = {
        time: [],
        start: [],
        end: [],
        word: [],
        amp: [],
        pitch: [],
        iskeyword: [],
        min_var_pitch: [],
        avg_var_pitch: [],
        max_var_pitch: [],
      };
      for (let i = 0; i < loadedData.length; i++) {
        audio.time.push(loadedData[i].start);
        audio.start.push(loadedData[i].start);
        audio.end.push(loadedData[i].end);
        audio.word.push(loadedData[i].word);
        audio.amp.push(loadedData[i].vol);
        audio.pitch.push(loadedData[i].pitch);
        audio.min_var_pitch.push(loadedData[i][12]);
        audio.avg_var_pitch.push(loadedData[i][13]);
        audio.max_var_pitch.push(loadedData[i][14]);
      }
      audio.amp = movingAverage(audio.amp, 5);
      audio.pitch = movingAverage(audio.pitch, 3);
      set_Data(audio);
      // Turn off loading state if setter is provided
      if (setLoading) {
        setLoading(false);
      }
    })
    .catch((error) => {
      console.error("Error loading the CSV file:", error);
      // Turn off loading state on error if setter is provided
      if (setLoading) {
        setLoading(false);
      }
    });
}

function movingAverage(data, windowSize) {
  let result = [];
  for (let i = 0; i < data.length; i++) {
    let start = Math.max(0, i - Math.floor(windowSize / 2));
    let end = Math.min(data.length, i + Math.floor(windowSize / 2) + 1);

    let sum = 0;
    for (let j = start; j < end; j++) {
      sum += data[j];
    }
    result.push(sum / (end - start));
  }
  return result;
}
function roundToThreeSignificantDigits(num) {
  if (num === 0) return 0;

  const absNum = Math.abs(num);
  const sign = Math.sign(num);
  const log10 = Math.floor(Math.log10(absNum));
  const scale = Math.pow(10, log10 - 2); // Scale to bring three significant digits to the integer part

  const rounded = Math.round(absNum / scale) * scale;

  return sign * rounded;
}

function Ticks({ width, timeSlider, marginLeft = 11 }) {
  const interval = 5; // Interval between tick marks (seconds)
  const maxValue = Math.ceil(timeSlider / interval) * interval; // Ensure the highest tick aligns with the interval
  const numTicks = maxValue / interval; // Total number of ticks
  const tickSpacing = width / numTicks; // Spacing between ticks

  return (
    <svg
      width={width}
      height={30}
      style={{
        display: "block",
        marginLeft: `${marginLeft}px`, // Adjust alignment
      }}
    >
      {/* Base Line */}
      <line x1="0" y1="10" x2={width} y2="10" stroke="black" strokeWidth="1" />
      {/* Tick marks and labels */}
      {Array.from({ length: numTicks + 1 }).map((_, index) => {
        const x = index * tickSpacing; // Position of the tick
        const timeLabel = index * interval; // Tick label value
        return (
          <g key={index} transform={`translate(${x}, 10)`}>
            {/* Tick */}
            <line y1="0" y2="8" stroke="black" />
            {/* Label */}
            <text
              y="20"
              x="0"
              textAnchor="middle"
              style={{
                fontSize: "10px",
                fontFamily: "Arial, sans-serif",
                fill: "black",
              }}
            >
              {timeLabel}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default Homepage;
