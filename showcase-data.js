// Supplementary paper data for the showcase components.
// Sources: Gamer paper (Oct 31, 2026 draft) — Fig. 1, Table 1, Table 3, Table 11, Table 13, Table 14, Fig. 16, Fig. 17, Sec. 2.1–2.2.
window.GAMER = window.GAMER || {};
window.GAMER.showcase = {
  // Fig. 1 — the 48 games shown in the paper overview, with their genres.
  games: [
    ['Genshin Impact','Open-world RPG'],['Honkai: Star Rail','Turn-based RPG'],['Zenless Zone Zero','Action RPG'],['Honkai Impact 3rd','Action RPG'],
    ['Tears of Themis','Detective & Narrative'],['Minecraft','Sandbox & Survival'],['Terraria','Sandbox & Survival'],["No Man's Sky",'Space Exploration'],
    ['Subnautica','Survival & Exploration'],['Stardew Valley','Farming & Life Sim'],['Satisfactory','Crafting & Automation'],['Elden Ring','Open-world Action RPG'],
    ['The Witcher 3','Open-world RPG'],['Cyberpunk 2077','Open-world RPG'],['Red Dead Redemption 2','Open-world Adventure'],['Black Myth: Wukong','Action RPG'],
    ['Hades','Action Roguelike'],['Dead Cells','Roguelike Platformer'],['Apex Legends','Battle Royale'],['DOOM Eternal','First-person Shooter'],
    ['Hollow Knight','Exploration & Platforming'],['Ori and the Will of the Wisps','Exploration & Platforming'],['Fortnite','Battle Royale'],['Counter-Strike 2','Tactical Shooter'],
    ['Celeste','Precision Platformer'],['It Takes Two','Cooperative Adventure'],['Portal 2','Spatial Puzzles'],['Stray','Exploration & Puzzles'],
    ['Rocket League','Vehicle Sports'],['Forza Horizon 5','Open-world Racing'],['F1 24','Racing Simulation'],['EA SPORTS FC 25','Football Simulation'],
    ['Civilization VI','Turn-based Strategy'],['Age of Empires IV','Real-time Strategy'],['Cities: Skylines','City Management'],['Planet Zoo','Management Sim'],
    ['Factorio','Crafting & Automation'],['Euro Truck Simulator 2','Driving Simulation'],['Slay the Spire','Deck-building Roguelike'],['Balatro','Card Strategy']
  ],
  // Table 1 — representative game agents.
  agents: {
    columns: ['Method','Initialization','Training recipe','Training data','Real-time','Open-source'],
    rows: [
      ['VPT','From scratch','BC + RL','Minecraft',true,true],
      ['Open-P2P','From scratch','BC','Diverse',true,true],
      ['NitroGen','From scratch','BC','Diverse',false,true],
      ['Game-TARS','Seed-VL-1.5','CPT + SFT','Diverse',false,false],
      ['Lumine','Qwen2-VL','CPT + SFT','Genshin Impact',true,false],
      ['SIMA 2','Gemini 2.5 Pro + Flash-Lite','SFT + RL','Diverse',false,false],
      ['Gamer (ours)','Qwen3.5 / Qwen3-VL','CPT + SFT + RL','Diverse',true,true]
    ]
  },
  // Table 11 — composition-aware CPT scaling relation. L = E + C_N/N^a + C_D·q^η/D^b + C_q/(q+ε)^c
  scalingLaw: {
    grid: {sizes:[0.8,2,9,27], hours:[50,100,200,400,800,1600], mixtures:[['S1',1.0],['S2',0.514],['S3',0.271],['S4',0.028],['S5',0.0]]},
    minecraft: {label:'Minecraft validation loss', q:'wMC', E:0.047, CN:0.019, a:0.15, CD:0.106, b:0.16, eta:0.24, Cq:0.0987, c:0.13, eps:0.011, r2:0.982},
    training:  {label:'Training-game validation loss', q:'1 − wMC', E:0.136, CN:0.014, a:0.17, CD:0.078, b:0.14, eta:0.10, Cq:0.0031, c:1.00, eps:0.039, r2:0.995}
  },
  // Tables 13 & 14 — milestone protocols. type: N navigation, D dialogue, C combat, U UI, P puzzle. s: configured budget in seconds.
  quests: {
    thief: {title:'Opportunity Makes the Thief (Part I)', total:1800, parentSteps:22, video:'thief', milestones:[
      ['1','Follow the quest marker to locate Pela.','N',60],['2','Talk to Pela and transition into the museum.','D',60],['3','Continue the conversation with Pela inside the museum.','D',60],
      ['4','Follow Pela to the exhibit.','N',120],['5','Complete the conversation and transition to the Underworld.','D',60],['6','Finish the current conversation.','D',60],
      ['7','Follow the quest marker to locate Swetta.','N',60],['8','Complete the conversation with Swetta.','D',60],
      ['9.1a','Find the little girl and listen to the conversation.','N',60],['9.1b','Complete the associated dialogue.','D',30],
      ['9.2a','Locate and inspect the poster.','N',180],['9.2b','Advance the dialogue associated with the poster.','D',30],
      ['9.3a','Approach the robot guards.','N',180],['9.3b','Advance the dialogue until combat begins.','D',30],['9.3c','Defeat the robot guards.','C',120],
      ['9.3d','Locate the crate containing a clue.','N',30],['9.3e','Complete the dialogue associated with the crate.','D',30],
      ['10','Follow the quest marker to locate Pela.','N',120],['11','Advance the dialogue until the phone message interface opens.','D',30],
      ['12','Complete the conversation in the phone message interface.','U',30],['13','Finish the subsequent conversation.','D',30],
      ['14','Open the map and teleport to the next quest location.','N',60],['15','Locate and enter the cheap room.','N',30],['16','Interact with the clue inside the room.','N',30],
      ['17','Complete the associated dialogue.','D',30],['18','Teleport back to the Administrative District.','N',60],['19','Locate the museum ticket inspector.','N',60],
      ['20','Complete the conversation and enter the museum.','D',30],['21','Reach the target location and return the Meteor Stone fragment.','N',30],['22','Complete the final dialogue and finish the mission.','D',30]
    ]},
    bestial: {title:'Bestial Ferocity', total:6040, parentSteps:40, video:'bestial', milestones:[
      ['1','Locate the unidentified NPC in Central Starskiff Haven.','N',90],['2','Complete the initial NPC dialogue.','D',90],['3','Teleport to Exalting Sanctum.','N',90],
      ['4','Enter the Realm-Keeping Commission Chancery.','N',90],['5','Locate Jingyan.','N',90],['6','Complete the dialogue with Jingyan.','D',120],
      ['7','Teleport to Scalegorge Waterscape.','N',90],['8','Reach the marked quest destination.','N',90],['9','Activate the Diting tracking trail.','N',10],
      ['10','Follow the blue trail to the enemies.','N',180],['11','Advance the dialogue and defeat the enemies.','C',180],['12','Complete the post-encounter dialogue.','D',90],
      ['13','Teleport to the Alchemy Commission.','N',90],['14','Reach Zhongshan and complete the dialogue.','N',90],['15','Talk to Zhongshan again.','D',120],
      ['16','Reach the highlighted quest location.','N',120],['17','Open the phone and finish the messages.','U',90],['18','Find Zhongshan and continue the dialogue.','N',90],
      ['19.1a','Approach Heathmann to hear his request.','N',90],['19.1b','Complete the dialogue with Heathmann.','D',90],['19.2a','Approach Tonya to hear her request.','N',90],
      ['19.2b','Complete the dialogue with Tonya.','D',90],['19.3a','Approach Benna to hear her request.','N',90],['19.3b','Complete the dialogue with Benna.','D',90],
      ['20','Finish the remaining Zhongshan dialogue.','D',120],['21','Teleport to the Silvermane Guard Restricted Zone.','N',90],['22','Locate Serval.','N',120],
      ['23','Complete the dialogue with Serval.','D',120],['24','Repair the Automaton Grizzly.','P',180],['25','Repair the Automaton Spider.','P',180],['26','Repair the Automaton Direwolf.','P',180],
      ['27','Return to Scalegorge Waterscape.','N',90],['28','Follow the quest marker to Zhongshan.','N',120],['29','Complete the dialogue with Zhongshan.','D',120],
      ['30.1a','Approach Benna to discuss the mechanical creatures.','N',90],['30.1b','Complete the dialogue with Benna.','D',90],['30.2a','Approach Heathmann to discuss the mechanical creatures.','N',90],
      ['30.2b','Complete the dialogue with Heathmann.','D',90],['30.3a','Approach Tonya to discuss the mechanical creatures.','N',90],['30.3b','Complete the battle and its preceding and following dialogues.','C',180],
      ['31','Reach Zhongshan and initiate dialogue.','N',120],['32','Complete the group dialogue.','N',180],['33','Complete the text-message conversation.','U',180],
      ['34','Reach Nannan and initiate dialogue.','N',120],['35','Complete the Nannan and Zhongshan dialogue.','N',120],['36.1a','Visit Benna to check on her situation.','N',90],
      ['36.1b','Complete the dialogue with Benna.','D',90],['36.2a','Visit Tonya to check on her situation.','N',90],['36.2b','Complete the dialogue with Tonya.','D',90],
      ['36.3a','Visit Heathmann to check on his situation.','N',90],['36.3b','Complete the dialogue with Heathmann.','D',90],['37','Complete the dialogue with Zhongshan.','N',180],
      ['38','Re-enter the Realm-Keeping Commission Chancery.','N',90],['39','Locate Jingyan.','N',90],['40','Complete the final dialogue with Jingyan.','D',120]
    ]}
  },
  // Sec. 2.1 / Fig. 3 — illustrative action packets for the control-interface demo (schematic, not a logged trajectory).
  actionDemo: [
    {think:'', mouse:[0,0,0], blocks:[['W'],['W'],['W'],['W'],['W'],['W']], note:'Held movement: six identical key blocks without explicit reasoning'},
    {think:'', mouse:[-38,4,0], blocks:[['W'],['W'],['W','A'],['W','A'],['W'],['W']], note:'Strafe while turning: mouse ΔX turns the camera'},
    {think:'The marker is behind the pillar; I should go around to the left and interact with the NPC.', mouse:[-120,0,0], blocks:[[],[],['A'],['A'],['A'],[]], note:'Decision point: brief explicit reasoning before action execution'},
    {think:'', mouse:[0,0,0], blocks:[['W'],['W'],['W'],[],[],['F']], note:'Approach and press F: a tap takes a single 33 ms block'},
    {think:'', mouse:[0,0,0], blocks:[['Space'],[],[],[],[],[]], note:'Advance dialogue: a brief tap, then wait'},
    {think:'', mouse:[12,-6,-1], blocks:[[],['LMB'],['LMB'],[],[],[]], note:'Mouse buttons use the same action blocks as keyboard inputs'}
  ],
  stats: {
    repeatShare: 85, observationHz: 5, controlHz: 30, blockMs: 33, gamma: 0.9
  }
};
