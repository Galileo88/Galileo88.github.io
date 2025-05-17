
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').then(() =>
    console.log('Service Worker registered'));
}

let player = {};
let week = 1, collegeWeek = 1, nflWeek = 1, nflSeason = 1, totalSeasons = 0;
let injuryStatus = false;
let careerStats = { seasons: 0, proBowls: 0, mvps: 0, superBowls: 0, popularity: 0 };
let offers = [], combineScore = 0, draftRound = 0, nflTeam = '';

function startNewGame() {
  player = {};
  week = 1; collegeWeek = 1; nflWeek = 1; nflSeason = 1;
  totalSeasons = 0; injuryStatus = false;
  player.retired = false;
  document.getElementById('main-menu').style.display = 'none';
  document.getElementById('game-screen').style.display = 'block';
  showCharacterCreation();
}

function loadGame() {
  const saved = localStorage.getItem('gridironSave');
  if (!saved) {
    alert("No saved game found.");
    return;
  }
  const data = JSON.parse(saved);
  player = data.player;
  week = data.week;
  collegeWeek = data.collegeWeek;
  nflWeek = data.nflWeek;
  nflSeason = data.nflSeason;
  injuryStatus = data.injuryStatus;
  totalSeasons = data.totalSeasons;
  careerStats = data.careerStats || { seasons: 0, proBowls: 0, mvps: 0, superBowls: 0, popularity: 0 };
  document.getElementById('main-menu').style.display = 'none';
  document.getElementById('game-screen').style.display = 'block';
  if (player.retired) showCareerSummary();
  else if (player.contract) playNFLWeek();
  else if (player.college) showCollegeWeek();
  else showWeeklyChoices();
}

function saveGame() {
  const gameData = {
    player, week, collegeWeek, nflWeek, nflSeason, injuryStatus, totalSeasons, careerStats
  };
  localStorage.setItem('gridironSave', JSON.stringify(gameData));
  console.log("Game saved.");
}

function deleteSave() {
  localStorage.removeItem('gridironSave');
  alert("Saved game deleted.");
}

// Previous game functions from character creation to retirement (condensed)
// [The rest of game logic from earlier phases would be inserted here — to save space, we're skipping literal duplication here.]

function viewHallOfFame() {
  const fameList = JSON.parse(localStorage.getItem("hallOfFame") || "[]");
  if (fameList.length === 0) {
    document.getElementById("game-screen").innerHTML = '<h2>Hall of Fame</h2><p>No legends yet.</p><button onclick="returnToMenu()">Back</button>';
    document.getElementById("main-menu").style.display = "none";
    document.getElementById("game-screen").style.display = "block";
    return;
  }
  let html = "<h2>Hall of Fame</h2>";
  fameList.forEach(p => {
    html += `<p><strong>${p.name}</strong> (${p.position}) - ${p.team}<br/>Age: ${p.age}, Seasons: ${p.seasons}, SBs: ${p.superBowls}, MVPs: ${p.mvps}, PBs: ${p.proBowls}, Pop: ${p.popularity}</p><hr/>`;
  });
  html += '<button onclick="returnToMenu()">Back</button>';
  document.getElementById("game-screen").innerHTML = html;
  document.getElementById("main-menu").style.display = "none";
  document.getElementById("game-screen").style.display = "block";
}
