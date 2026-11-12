// Benchmark recordings for the RT vs TP comparison, from the CPT evaluation runs.
// Games are ones with a large RT - TP gap, except ViZDoom Defend the Center (8B, where RT is lower).
// Each clip is a median run of the named model in its mode, and "mean" averages that model's runs.
// MCU: success or fail per run, "mean" is the success rate over five runs (RT clip succeeds, TP clip fails).
// ViZDoom: episode score. OGA / GameWorld: task progress (0-1).
window.GAMER = window.GAMER || {};
window.GAMER.benchVideos = {
 "mcu": [
  {
   "game": "Kill Slime",
   "model": "Gamer-8B-CPT",
   "rt": {
    "src": "videos/bench/mcu-kill-slime-rt.mp4?v=20261109-web-compact",
    "success": true,
    "mean": 0.8,
    "wins": 4,
    "runs": 5,
    "duration": 71.45
   },
   "tp": {
    "src": "videos/bench/mcu-kill-slime-tp.mp4?v=20261109-web-compact",
    "success": false,
    "mean": 0.6,
    "wins": 3,
    "runs": 5,
    "duration": 30.05
   },
   "crop": [
    0,
    0,
    472,
    316
   ]
  },
  {
   "game": "Craft Paper",
   "model": "Gamer-35B-A3B-CPT",
   "rt": {
    "src": "videos/bench/mcu-craft-paper-rt.mp4?v=20261109-redacted",
    "success": true,
    "mean": 0.8,
    "wins": 4,
    "runs": 5,
    "duration": 30.2
   },
   "tp": {
    "src": "videos/bench/mcu-craft-paper-tp.mp4?v=20261109-redacted",
    "success": false,
    "mean": 0.4,
    "wins": 2,
    "runs": 5,
    "duration": 30.85
   },
   "crop": [
    0,
    0,
    472,
    316
   ]
  }
 ],
 "vizdoom": [
  {
   "game": "Defend the Center",
   "model": "Gamer-8B-CPT",
   "rt": {
    "src": "videos/bench/vizdoom-defend-the-center-rt.mp4?v=20261109-web-compact",
    "score": 12.0,
    "mean": 11.4,
    "runs": 10,
    "success": false,
    "duration": 7.13
   },
   "tp": {
    "src": "videos/bench/vizdoom-defend-the-center-tp.mp4?v=20261109-web-compact",
    "score": 14.0,
    "mean": 13.6,
    "runs": 10,
    "success": false,
    "duration": 7.83
   }
  },
  {
   "game": "Defend the Line",
   "model": "Gamer-35B-A3B-CPT",
   "rt": {
    "src": "videos/bench/vizdoom-defend-the-line-rt.mp4?v=20261109-web-compact",
    "score": 29.0,
    "mean": 29.3,
    "runs": 10,
    "success": false,
    "duration": 7.43
   },
   "tp": {
    "src": "videos/bench/vizdoom-defend-the-line-tp.mp4?v=20261109-web-compact",
    "score": 23.0,
    "mean": 21.6,
    "runs": 10,
    "success": false,
    "duration": 6.4
   }
  }
 ],
 "oga": [
  {
   "game": "Monster Shoot",
   "model": "Gamer-8B-CPT",
   "rt": {
    "src": "videos/bench/oga-monster-shoot-rt.mp4?v=20261109-web-compact",
    "score": 0.72,
    "mean": 0.758,
    "runs": 10,
    "success": false,
    "duration": 9.2
   },
   "tp": {
    "src": "videos/bench/oga-monster-shoot-tp.mp4?v=20261109-web-compact",
    "score": 0.54,
    "mean": 0.518,
    "runs": 10,
    "success": false,
    "duration": 10.1
   },
   "crop": [
    0,
    0,
    1280,
    720
   ]
  },
  {
   "game": "Scene Escape",
   "model": "Gamer-35B-A3B-CPT",
   "crop": [
    0,
    0,
    1280,
    720
   ],
   "rt": {
    "src": "videos/bench/oga-scene-escape-rt.mp4?v=20261109-web-compact",
    "score": 0.4,
    "mean": 0.25,
    "runs": 10,
    "success": false,
    "duration": 17.73
   },
   "tp": {
    "src": "videos/bench/oga-scene-escape-tp.mp4?v=20261109-web-compact",
    "score": 0.2,
    "mean": 0.16,
    "runs": 10,
    "success": false,
    "duration": 24.17
   }
  }
 ],
 "gameworld": [
  {
   "game": "Hextris",
   "model": "Gamer-8B-CPT",
   "rt": {
    "src": "videos/bench/gameworld-hextris-rt.mp4?v=20261109-redacted",
    "score": 0.588,
    "mean": 0.568,
    "runs": 5,
    "success": false,
    "duration": 16.67
   },
   "tp": {
    "src": "videos/bench/gameworld-hextris-tp.mp4?v=20261109-redacted",
    "score": 0.192,
    "mean": 0.238,
    "runs": 5,
    "success": false,
    "duration": 16.67
   },
   "crop": [
    0,
    0,
    600,
    370
   ]
  },
  {
   "game": "Edge Surf",
   "model": "Gamer-35B-A3B-CPT",
   "rt": {
    "src": "videos/bench/gameworld-edge-surf-rt.mp4?v=20261109-redacted",
    "score": 1.0,
    "mean": 0.776,
    "runs": 5,
    "success": true,
    "duration": 3.83
   },
   "tp": {
    "src": "videos/bench/gameworld-edge-surf-tp.mp4?v=20261109-redacted",
    "score": 0.40625,
    "mean": 0.577,
    "runs": 5,
    "success": false,
    "duration": 16.67
   },
   "crop": [
    0,
    0,
    600,
    370
   ]
  }
 ]
};
