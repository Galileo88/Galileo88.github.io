
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').then(() =>
    console.log('Service Worker registered'));
}

let player = {};

function startNewGame() {
  player = {};
  document.getElementById('main-menu').style.display = 'none';
  document.getElementById('game-screen').style.display = 'block';
  showCharacterCreation();
}

function showCharacterCreation() {
  const html = `
    <h2>Create Your Player</h2>
    <label>Name: <input id="name" /></label><br/>
    <label>Position:
      <select id="position">
        <option>QB</option>
        <option>RB</option>
        <option>WR</option>
        <option>LB</option>
        <option>CB</option>
      </select>
    </label><br/>
    <label>Hometown: <input id="hometown" /></label><br/>
    <button onclick="createPlayer()">Continue</button>
  `;
  document.getElementById('game-screen').innerHTML = html;
}

function createPlayer() {
  player.name = document.getElementById('name').value;
  player.position = document.getElementById('position').value;
  player.hometown = document.getElementById('hometown').value;
  showStatsScreen();
}

function showStatsScreen() {
  const html = `
    <h2>${player.name} | ${player.position} from ${player.hometown}</h2>
    <p>Athleticism: 70</p>
    <p>Football IQ: 65</p>
    <p>Work Ethic: 68</p>
    <p>Popularity: 50</p>
    <p>Health: 100</p>
    <p>Mental Toughness: 66</p>
    <button onclick="alert('High school season coming soon!')">Start High School Career</button>
  `;
  document.getElementById('game-screen').innerHTML = html;
}
