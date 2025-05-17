
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js');
}

function startNewGame() {
  document.getElementById("main-menu").style.display = "none";
  document.getElementById("game-screen").style.display = "block";
  showCharacterCreation();
}

function showCharacterCreation() {
  document.getElementById("game-screen").innerHTML = `
    <h2>Create Your Player</h2>
    <input id="name" placeholder="Name" /><br/>
    <input id="position" placeholder="Position" /><br/>
    <input id="hometown" placeholder="Hometown" /><br/>
    <button onclick="createPlayer()">Continue</button>
  `;
}

function createPlayer() {
  const name = document.getElementById("name").value;
  const pos = document.getElementById("position").value;
  const town = document.getElementById("hometown").value;

  document.getElementById("game-screen").innerHTML = `
    <h2>${name} | ${pos} from ${town}</h2>
    <p>Athleticism: 70</p>
    <p>Football IQ: 65</p>
    <p>Work Ethic: 68</p>
    <p>Popularity: 50</p>
    <p>Health: 100</p>
    <p>Mental Toughness: 66</p>
    <button onclick="alert('Gameplay continues...')">Start High School</button>
  `;
}
