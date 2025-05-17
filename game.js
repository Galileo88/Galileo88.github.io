
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js');
}

let player = {};
let week = 1, collegeWeek = 1, nflWeek = 1, nflSeason = 1, totalSeasons = 0;
let injuryStatus = false;
let draftStock = 50, combineScore = 0, draftRound = 0;
let careerStats = { seasons: 0, proBowls: 0, mvps: 0, superBowls: 0, popularity: 0 };
let nflTeam = "", offers = [];

function startNewGame() {
  player = {};
  document.getElementById("main-menu").style.display = "none";
  document.getElementById("game-screen").style.display = "block";
  showCharacterCreation();
}

function showCharacterCreation() {
  const html = \`
    <h2>Create Your Player</h2>
    <label>Name: <input id="name" /></label><br/>
    <label>Position:
      <select id="position">
        <option value="QB">QB</option>
        <option value="RB">RB</option>
        <option value="WR">WR</option>
        <option value="LB">LB</option>
        <option value="CB">CB</option>
      </select>
    </label><br/>
    <label>Hometown: <input id="hometown" /></label><br/>
    <button onclick="createPlayer()">Continue</button>
  \`;
  document.getElementById("game-screen").innerHTML = html;
}

function createPlayer() {
  player.name = document.getElementById("name").value;
  player.position = document.getElementById("position").value;
  player.hometown = document.getElementById("hometown").value;
  player.stats = {
    athleticism: rand(60, 80),
    iq: rand(60, 80),
    workEthic: rand(60, 80),
    popularity: 50,
    health: 100,
    toughness: rand(60, 80)
  };
  showStatsScreen();
}

function showStatsScreen() {
  const s = player.stats;
  const html = \`
    <h2>\${player.name} | \${player.position} from \${player.hometown}</h2>
    <p>Athleticism: \${s.athleticism}</p>
    <p>Football IQ: \${s.iq}</p>
    <p>Work Ethic: \${s.workEthic}</p>
    <p>Popularity: \${s.popularity}</p>
    <p>Health: \${s.health}</p>
    <p>Mental Toughness: \${s.toughness}</p>
    <button onclick="beginHighSchool()">Start High School Career</button>
  \`;
  document.getElementById("game-screen").innerHTML = html;
}

function beginHighSchool() {
  week = 1;
  nextHighSchoolWeek();
}

function nextHighSchoolWeek() {
  if (week > 5) return chooseCollege();
  const html = \`
    <h2>High School Week \${week}</h2>
    <button onclick="makeChoice('train')">Train</button>
    <button onclick="makeChoice('study')">Film Study</button>
    <button onclick="makeChoice('social')">Socialize</button>
  \`;
  document.getElementById("game-screen").innerHTML = html;
}

function makeChoice(choice) {
  let log = '';
  if (choice === 'train') { player.stats.athleticism += rand(1, 3); log = "Trained hard."; }
  if (choice === 'study') { player.stats.iq += rand(1, 3); log = "Studied film."; }
  if (choice === 'social') { player.stats.popularity += rand(2, 4); log = "Got popular."; }
  week++;
  document.getElementById("game-screen").innerHTML = \`
    <p>\${log}</p><button onclick="nextHighSchoolWeek()">Next Week</button>
  \`;
}

function chooseCollege() {
  offers = ["Metro State", "Northern U", "Western Tech"];
  let html = "<h2>Choose a College</h2>";
  offers.forEach(c => {
    html += \`<button onclick="selectCollege('\${c}')">\${c}</button><br/>\`;
  });
  document.getElementById("game-screen").innerHTML = html;
}

function selectCollege(college) {
  player.college = college;
  player.year = 1;
  draftStock = 50;
  startCollegeSeason();
}

function startCollegeSeason() {
  collegeWeek = 1;
  collegeLoop();
}

function collegeLoop() {
  if (collegeWeek > 5) {
    if (player.year >= 3) return beginDraft();
    player.year++;
    return startCollegeSeason();
  }
  document.getElementById("game-screen").innerHTML = \`
    <h2>College Year \${player.year} Week \${collegeWeek}</h2>
    <button onclick="collegeChoice('train')">Train</button>
    <button onclick="collegeChoice('study')">Film Room</button>
    <button onclick="collegeChoice('promo')">Media Appearance</button>
  \`;
}

function collegeChoice(action) {
  if (action === 'train') player.stats.athleticism += rand(1, 3);
  if (action === 'study') player.stats.iq += rand(1, 3);
  if (action === 'promo') player.stats.popularity += rand(2, 4);
  draftStock += rand(1, 5);
  collegeWeek++;
  collegeLoop();
}

function beginDraft() {
  draftRound = Math.floor(100 - draftStock) / 20 + 1;
  nflTeam = ["Sharks", "Guardians", "Stallions", "Cyclones"][rand(0, 3)];
  document.getElementById("game-screen").innerHTML = \`
    <h2>NFL Draft</h2>
    <p>Drafted in Round \${Math.ceil(draftRound)} by the \${nflTeam}</p>
    <button onclick="startNFLCareer()">Start NFL Career</button>
  \`;
}

function startNFLCareer() {
  nflSeason = 1;
  nflWeek = 1;
  playNFLWeek();
}

function playNFLWeek() {
  if (nflWeek > 5) return endNFLSeason();
  const perf = Math.floor((player.stats.athleticism + player.stats.iq + player.stats.workEthic) / 3 + rand(0, 10));
  player.stats.popularity += Math.floor(perf / 20);
  if (rand(0, 100) < 10) {
    player.stats.health -= rand(5, 20);
    injuryStatus = true;
  }
  nflWeek++;
  document.getElementById("game-screen").innerHTML = \`
    <h2>NFL Week \${nflWeek - 1}</h2>
    <p>Performance: \${perf}</p>
    <p>Health: \${player.stats.health}</p>
    <button onclick="playNFLWeek()">Next Week</button>
  \`;
}

function endNFLSeason() {
  totalSeasons++;
  player.stats.health -= rand(1, 5);
  document.getElementById("game-screen").innerHTML = \`
    <h2>Season \${nflSeason} Complete</h2>
    <p>Total Seasons Played: \${totalSeasons}</p>
    <button onclick="retirePlayer()">Retire</button>
    <button onclick="startNFLCareer()">Play Another Season</button>
  \`;
}

function retirePlayer() {
  const hof = totalSeasons >= 3 && player.stats.popularity > 80;
  document.getElementById("game-screen").innerHTML = \`
    <h2>Retired at Age \${22 + player.year + totalSeasons}</h2>
    <p>Seasons: \${totalSeasons}, Popularity: \${player.stats.popularity}</p>
    <h3>\${hof ? 'You made the Hall of Fame!' : 'Great career!'}</h3>
    <button onclick="location.reload()">Main Menu</button>
  \`;
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
