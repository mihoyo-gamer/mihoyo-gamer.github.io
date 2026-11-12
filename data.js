/* All media paths are relative for GitHub Pages project repositories.
   Empty src means no recording has been supplied. Paper stills are explicitly labelled.
   Add actual task, checkpoint, playback speed, duration, and intervention information
   to each description when adding the associated recording. */
window.GAMER = {
  teaser: {src: "", poster: "assets/paper/overview.png", captions: ""},
  mainStory: {bilibili: "", bilibiliPage: 1, src: "", poster: "assets/paper/hsr.png", captions: "", details: ""},
  categories: ["Side quests", "Minigames", "Across games"],
  demos: [
    {id:"thief", bilibili:"", bilibiliPage:1, category:"Side quests", title:"Opportunity Makes the Thief I", game:"Honkai: Star Rail", label:"Navigation · Dialogue · Combat · UI", poster:"assets/recordings/thief.jpg?v=20261109-redacted", src:"", localSrc:"videos/side-quests/thief-home-20261109.mp4?v=20261109-quest-home-v2", playbackRate:1, duration:541.333333, description:"A long-horizon side quest with 30 evaluation milestones spanning navigation, dialogue, combat, and UI interaction."},
    {id:"bestial", bilibili:"", bilibiliPage:1, category:"Side quests", title:"Bestial Ferocity", game:"Honkai: Star Rail", label:"Navigation · Dialogue · Combat · Puzzles", poster:"assets/recordings/bestial.jpg?v=20261109-redacted", src:"", localSrc:"videos/side-quests/bestial-home-20261109.mp4?v=20261109-quest-home-v2", playbackRate:1, duration:1278.066667, description:"A long-horizon side quest with 55 evaluation milestones across five interaction types. Reported task-success rates aggregate evaluated milestone executions rather than uninterrupted whole-quest completion."},
    {id:"magflow", category:"Minigames", title:"Magflow Link", game:"Honkai: Star Rail", label:"Logical reasoning", poster:"assets/paper/magflow.png", src:"", description:"Connect the circuit pieces into a continuous path."},
    {id:"compass", category:"Minigames", title:"Navigation Compass", game:"Honkai: Star Rail", label:"Logical reasoning", poster:"assets/paper/compass.png", src:"", description:"Align the markers by rotating the linked rings."},
    {id:"abacus", category:"Minigames", title:"Abacus Circuitry", game:"Honkai: Star Rail", label:"Logical reasoning", poster:"assets/paper/abacus.png", src:"", description:"Rotate the circuit segments to move the tokens into their target positions."},
    {id:"hexanexus", category:"Minigames", title:"Hexanexus", game:"Honkai: Star Rail", label:"Spatial reasoning", poster:"assets/paper/hexanexus.png", src:"", description:"Arrange the 3D blocks so they match the shapes shown from different views."},
    {id:"passage", category:"Minigames", title:"Janus’s Hidden Passage", game:"Honkai: Star Rail", label:"Spatial reasoning", poster:"assets/paper/passage.png", src:"", description:"Find the viewpoint where the fragments line up into a complete pattern."},
    {id:"scapegoat", category:"Minigames", title:"Golden Scapegoat", game:"Honkai: Star Rail", label:"Temporal planning", poster:"assets/paper/scapegoat.png", src:"", description:"Plan a route around a replay of your earlier moves."},
    {id:"maze", category:"Minigames", title:"Janus’ Maze", game:"Honkai: Star Rail", label:"Timing & control", poster:"assets/paper/maze.png", src:"", description:"Rotate the maze and use gravity to reach the goal."},
    {id:"minecraft", category:"Across games", title:"Minecraft", game:"Sandbox & survival", label:"Paper overview · task details forthcoming", poster:"assets/paper/minecraft.png", src:"", description:"A game shown in the paper’s overview. This illustrative screenshot is not an evaluated rollout. A recording, task description, and run details will be added to this slot."},
    {id:"genshin", category:"Across games", title:"Genshin Impact", game:"Open-world RPG", label:"Paper overview · task details forthcoming", poster:"assets/paper/genshin.png", src:"", description:"A game shown in the paper’s overview. This illustrative screenshot does not establish task completion or cross-game transfer. A recording and its task details will be added to this slot."},
    {id:"zzz", category:"Across games", title:"Zenless Zone Zero", game:"Action RPG", label:"Paper overview · task details forthcoming", poster:"assets/paper/zzz.png", src:"", description:"A game shown in the paper’s overview. This illustrative screenshot does not establish task completion or cross-game transfer. A recording and its task details will be added to this slot."}
  ]
};

// Paper Fig. 19. Entries are measured mean request latencies in milliseconds.
window.GAMER.latency = {
  dense: {
    name: 'Qwen3-VL-8B · Dense',
    A800: [['TP1 · BF16',260.99],['TP1 · INT8 W8A8',219.09],['TP2 · BF16',179.47],['TP2 · INT8 W8A8',154.22],['TP4 · BF16',147.64],['TP4 · INT8 W8A8',156.38]],
    H200: [['TP1 · BF16',107.23],['TP2 · BF16',85.25],['TP2 · FP8 W8A8',83.81],['TP4 · BF16',75.66],['TP4 · FP8 W8A8',74.69]]
  },
  moe: {
    name: 'Qwen3.5-35B-A3B · MoE',
    A800: [['TP1 · BF16',265.48],['TP1 · INT8 W8A8',250.48],['TP2 · BF16',215.63],['TP2 · INT8 W8A8',209.33],['TP4 · BF16',205.77],['TP4 · INT8 W8A8',204.47]],
    H200: [['TP1 · BF16',148.39],['TP2 · BF16',111.94],['TP2 · FP8 W8A8',89.17],['TP4 · BF16',110.08],['TP4 · FP8 W8A8',92.19]]
  }
};
// Paper Table 5. Order: MCU, ViZDoom, OmniGameArena, GameWorld, Average.
window.GAMER.benchmarks = ['Average','MCU','ViZDoom','OmniGameArena','GameWorld'];
window.GAMER.realtime = [
  {name:'GPT-5.6-Sol',rt:[8.7,2.7,14.5,44.3,17.6],delta:[-73.3,-24.0,-31.1,-9.6,-34.5]},
  {name:'GPT-5.6-Luna',rt:[5.3,2.9,13.2,41.6,15.8],delta:[-48.7,-21.2,-13.5,-3.3,-21.6]},
  {name:'Claude-Opus-5.0',rt:[8.7,2.0,16.4,42.0,17.3],delta:[-48.0,-18.8,-28.0,-10.8,-26.4]},
  {name:'GLM-5.3-Flash',rt:[7.3,1.9,12.3,29.6,12.8],delta:[-40.0,-17.0,-11.2,-4.4,-18.1]},
  {name:'DeepSeek-V4-Flash-Vision',rt:[7.3,3.3,11.6,28.5,12.7],delta:[-28.7,-9.7,-15.5,-13.3,-16.8]},
  {name:'Qwen3.5-0.8B',rt:[0.0,1.0,1.8,15.1,4.5],delta:[0.0,0.1,0.1,1.3,0.4]},
  {name:'Qwen3.5-2B',rt:[0.0,1.5,1.7,16.3,4.9],delta:[0.0,0.6,-0.1,-3.5,-0.7]},
  {name:'Qwen3.5-9B',rt:[3.3,3.2,4.1,27.7,9.6],delta:[0.0,0.4,-1.1,-1.5,-0.5]},
  {name:'Qwen3.5-27B',rt:[4.0,2.9,7.6,25.2,9.9],delta:[-5.3,-2.7,-2.1,-4.1,-3.6]},
  {name:'Gamer-8B-CPT',ours:true,rt:[47.7,14.4,21.9,34.0,29.5],delta:[-13.0,-2.2,-3.0,0.7,-4.4]},
  {name:'Gamer-35B-A3B-CPT',ours:true,rt:[65.3,11.9,18.7,30.2,31.5],delta:[18.6,1.7,-6.7,-0.1,3.4]}
];
// Paper Table 6. Each row is Base, CPT, SFT, RL.
window.GAMER.stages = [
  {title:'Opportunity Makes the Thief I',milestones:30,metrics:['Navigation','Dialogue','Combat','UI','Overall'],values:[[0,0,0,0,0],[14.3,50,100,33.3,34.4],[47.6,92.9,100,100,72.2],[69.1,88.1,100,100,80]]},
  {title:'Bestial Ferocity',milestones:55,metrics:['Navigation','Dialogue','Combat','UI','Puzzle','Overall'],values:[[12.5,18.8,33.3,0,0,13.9],[36.5,70.8,100,66.7,0,47.9],[55.2,97.9,100,100,22.2,69.1],[80.2,100,100,100,11.1,83.6]]}
];

// Main-story clips. Fill src and poster to replace a placeholder with a playable card.
// duration is the actual source duration in seconds; an empty src remains a reserved slot.
window.GAMER.mainStory.chapters = [
  {id:'jarilo', chapter:'Chapter I', title:'Jarilo-VI', clips:[
    {id:'jarilo-01', name:'Snowfield Exploration', caption:'Locate and follow Sampo to search for signs of civilization.', title:'Clip 01', src:'videos/main-story/think-reviewed-20261109/jarilo-01.mp4?v=20261111-speed-badge', poster:'assets/main-story/think-reviewed-20261109/jarilo-01.jpg?v=20261111-speed-badge', duration:49.133333},
    {id:'jarilo-03', name:'Mine Exploration', caption:'Clear obstacles and advance the narrative to explore deeper into the Great Mine.', title:'Clip 03', src:'videos/main-story/think-reviewed-20261109/jarilo-03.mp4?v=20261111-speed-badge', poster:'assets/main-story/think-reviewed-20261109/jarilo-03.jpg?v=20261111-speed-badge', duration:127.533333},
    {id:'jarilo-04', name:'Hotel Rest', caption:'Navigate back to the Administrative District and return to the guest room.', title:'Clip 04', src:'videos/main-story/think-reviewed-20261109/jarilo-04.mp4?v=20261111-speed-badge', poster:'assets/main-story/think-reviewed-20261109/jarilo-04.jpg?v=20261111-speed-badge', duration:43.166667},
    {id:'jarilo-06', name:'Boss Battle', caption:'Defeat Cocolia in combat.', title:'Clip 06', src:'videos/main-story/think-reviewed-20261109/jarilo-06.mp4?v=20261111-speed-badge', poster:'assets/main-story/think-reviewed-20261109/jarilo-06.jpg?v=20261111-speed-badge', duration:60.000000},
    {id:'jarilo-07', name:'Meeting Serval', caption:'Seek Serval’s assistance and navigate to the Silvermane Guard Restricted Zone.', title:'Clip 07', src:'videos/main-story/additions-20261111/jarilo-07.mp4?v=20261111-speed-badge', poster:'assets/main-story/additions-20261111/jarilo-07.jpg?v=20261111-speed-badge', duration:101.933333},
    {id:'jarilo-08', name:'Journey to Rivet Town', caption:'Reach Rivet Town and trigger the next main-story sequence.', title:'Clip 08', src:'videos/main-story/additions-20261111/jarilo-08.mp4?v=20261111-speed-badge', poster:'assets/main-story/additions-20261111/jarilo-08.jpg?v=20261111-speed-badge', duration:171.466667}
  ]},
  {id:'xianzhou', chapter:'Chapter II', title:'The Xianzhou Luofu', clips:[
    {id:'xianzhou-07', name:'Crossing Cloudford', caption:'Catch up with the Trailblaze team and investigate Tingyun’s whereabouts.', title:'Clip 07', src:'videos/main-story/additions-20261111/xianzhou-07.mp4?v=20261111-speed-badge', poster:'assets/main-story/additions-20261111/xianzhou-07.jpg?v=20261111-speed-badge', duration:232.000000},
    {id:'xianzhou-01', name:'A Visitor on the Express', caption:'Complete Kafka’s visit sequence to advance the Xianzhou storyline.', title:'Clip 01', src:'videos/main-story/think-reviewed-20261109/xianzhou-01.mp4?v=20261111-speed-badge', poster:'assets/main-story/think-reviewed-20261109/xianzhou-01.jpg?v=20261111-speed-badge', duration:60.000000},
    {id:'xianzhou-05', name:'Journey to Petrichor Inn', caption:'Follow Tingyun, switch to Dan Heng’s perspective, and catch up with the Trailblaze team.', title:'Clip 05', src:'videos/main-story/think-reviewed-20261109/xianzhou-05.mp4?v=20261111-speed-badge', poster:'assets/main-story/think-reviewed-20261109/xianzhou-05.jpg?v=20261111-speed-badge', duration:53.000000},
    {id:'xianzhou-06', name:'Phantylia Showdown', caption:'Defeat Phantylia, claim rewards, and unlock the subsequent main-story sequence.', title:'Clip 06', src:'videos/main-story/think-reviewed-20261109/xianzhou-06.mp4?v=20261111-speed-badge', poster:'assets/main-story/think-reviewed-20261109/xianzhou-06.jpg?v=20261111-speed-badge', duration:60.000000}
  ]},
  {id:'penacony', chapter:'Chapter III', title:'Penacony', clips:[
    {id:'penacony-01', name:'Hotel Check-in', caption:'Reach the hotel, reunite with the Astral Express crew, and complete the reception sequence.', title:'Clip 01', src:'videos/main-story/think-reviewed-20261109/penacony-01.mp4?v=20261111-speed-badge', poster:'assets/main-story/think-reviewed-20261109/penacony-01.jpg?v=20261111-speed-badge', duration:60.000000},
    {id:'penacony-02', name:'Dream Exploration', caption:'Follow Acheron through an unfamiliar dreamscape, then exit and return to the Express.', title:'Clip 02', src:'videos/main-story/think-reviewed-20261109/penacony-02.mp4?v=20261111-speed-badge', poster:'assets/main-story/think-reviewed-20261109/penacony-02.jpg?v=20261111-speed-badge', duration:58.000000},
    {id:'penacony-04', name:'Audition Advancement', caption:'Reach the third stage and win the Superstar Showdown.', title:'Clip 04', src:'videos/main-story/think-reviewed-20261109/penacony-04.mp4?v=20261111-speed-badge', poster:'assets/main-story/think-reviewed-20261109/penacony-04.jpg?v=20261111-speed-badge', duration:60.000000},
    {id:'penacony-05', name:'Meeting Firefly', caption:'Follow Firefly and navigate across areas to reunite with her.', title:'Clip 05', src:'videos/main-story/think-reviewed-20261109/penacony-05.mp4?v=20261111-speed-badge', poster:'assets/main-story/think-reviewed-20261109/penacony-05.jpg?v=20261111-speed-badge', duration:62.900000},
    {id:'penacony-06', name:'The Great Septimus Battle', caption:'Defeat the Great Septimus and complete the subsequent narrative sequence.', title:'Clip 06', src:'videos/main-story/think-reviewed-20261109/penacony-06.mp4?v=20261111-speed-badge', poster:'assets/main-story/think-reviewed-20261109/penacony-06.jpg?v=20261111-speed-badge', duration:140.000000},
    {id:'penacony-07', name:'Sampo’s Guidance', caption:'Follow Sampo to the Pepeshi Salon and complete Hanu’s challenge.', title:'Clip 07', src:'videos/main-story/additions-20261111/penacony-07.mp4?v=20261111-speed-badge', poster:'assets/main-story/additions-20261111/penacony-07.jpg?v=20261111-speed-badge', duration:133.400000},
    {id:'penacony-08', name:'Dreamscape Reunion', caption:'Follow Aventurine, complete the dialogue, and reunite with the Express crew.', title:'Clip 08', src:'videos/main-story/additions-20261111/penacony-08.mp4?v=20261111-speed-badge', poster:'assets/main-story/additions-20261111/penacony-08.jpg?v=20261111-speed-badge', duration:236.866667},
    {id:'penacony-09', name:'Audition Navigation', caption:'Reach the Scorchsand Audition Venue and participate in the trials.', title:'Clip 09', src:'videos/main-story/additions-20261111/penacony-09.mp4?v=20261111-speed-badge', poster:'assets/main-story/additions-20261111/penacony-09.jpg?v=20261111-speed-badge', duration:239.866667},
    {id:'penacony-10', name:'Choosing Fate', caption:'Complete Sunday’s question-and-answer sequence.', title:'Clip 10', src:'videos/main-story/additions-20261111/penacony-10.mp4?v=20261111-speed-badge', poster:'assets/main-story/additions-20261111/penacony-10.jpg?v=20261111-speed-badge', duration:128.233333},
  ]}
];

// Long gameplay stays on its original drive in the LAN preview.
window.GAMER.mainStory.longVideo = {"id": "story-long", "src": "", "localSrc": "videos/main-story/story-long.mp4?v=20261111-prompt-hidden", "poster": "assets/main-story/story-long.jpg?v=20261111-prompt-hidden", "duration": 1731.212993, "playbackRate": 1};
