import { generateTeams } from './league.js';
import { generateRoster } from './players.js';
import { generateSchedule } from './schedule.js';
import { Season } from './season.js';
import { simulateGame, simulateGameWithLog } from './simulateGame.js';
import { trainPlayers, assignUDFAsToTeams, runDraft, generateDraftClass, agePlayers, getUDFAPool, fillFreeAgents, resetTeamRecords, advanceContracts } from './offseason.js';
import { Playoffs } from './playoffs.js';
import { getTeamSalary, canSign, assignContract } from './contracts.js';
import { getDepthChart } from './depthChart.js';

export let teams = generateTeams();
export let schedule = generateSchedule(teams);
export let season = new Season(teams, schedule);
export let freeAgents = [];
export let playoffs = null;
export let hallOfFame = [];
export let currentYear = 2025;
export let userTeam = null;

// Initialize rosters and coaches
teams.forEach(team => {
    team.roster = generateRoster();
    team.coach = {
        name: `Coach ${team.name.split(' ')[2]}`,
        offenseSkill: Math.floor(Math.random() * 20) + 80,
        defenseSkill: Math.floor(Math.random() * 20) + 80,
        style: Math.random() < 0.5 ? 'Aggressive' : 'Conservative'
    };
});

// UI bindings
window.simulateWeek = function () {
    const results = season.simulateWeek();
    if (!results) {
        document.getElementById('season-output').innerHTML += '<p>Season complete!</p>';
        return;
    }
    results.forEach(result => {
        document.getElementById('season-output').innerHTML += `<div>${result.home} ${result.scoreA} - ${result.away} ${result.scoreB} (${result.winner})</div>`;
    });
};

window.showStandings = function () {
    const standings = season.getStandings();
    const html = standings.map(t => `<div>${t.name}: ${t.wins}-${t.losses}</div>`).join('');
    document.getElementById('season-output').innerHTML += `<h3>Standings</h3>${html}`;
};

window.startPlayoffs = function () {
    playoffs = new Playoffs(teams);
    document.getElementById('season-output').innerHTML += '<h3>Playoffs started!</h3>';
};

window.advancePlayoffs = function () {
    if (!playoffs || playoffs.isComplete()) return;
    playoffs.simulateNextRound(simulateGame);
    document.getElementById('season-output').innerHTML += `<div>Playoff round advanced.</div>`;
};

window.runOffseason = function () {
    agePlayers(teams);
    advanceContracts(teams);
    const draftClass = generateDraftClass(300);
    runDraft(teams, draftClass);
    assignUDFAsToTeams(teams, 3);
    fillFreeAgents(teams);
    trainPlayers(teams);
    resetTeamRecords(teams);
    schedule = generateSchedule(teams);
    season = new Season(teams, schedule);
    playoffs = null;
    currentYear++;
    document.getElementById('season-output').innerHTML += '<p>Offseason complete.</p>';
};

window.signFreeAgents = function () {
    teams.forEach(team => {
        const needed = 20 - team.roster.length;
        for (let i = 0; i < needed && freeAgents.length > 0; i++) {
            const fa = freeAgents.shift();
            if (canSign(team, 1)) {
                assignContract(fa, 1, 1);
                team.roster.push(fa);
                fa.freeAgent = false;
            }
        }
    });
    document.getElementById('season-output').innerHTML += '<p>Free agents signed.</p>';
};

window.saveGame = function () {
    const data = {
        teams,
        schedule,
        seasonState: {
            currentWeek: season.currentWeek,
            results: season.results
        },
        freeAgents,
        currentYear
    };
    localStorage.setItem('gridironSave', JSON.stringify(data));
    alert('Game saved!');
};

window.loadGame = function () {
    const save = localStorage.getItem('gridironSave');
    if (!save) {
        alert('No saved game found.');
        return;
    }
    const data = JSON.parse(save);
    teams = data.teams;
    schedule = data.schedule;
    season = new Season(teams, schedule);
    season.currentWeek = data.seasonState.currentWeek;
    season.results = data.seasonState.results;
    freeAgents = data.freeAgents;
    currentYear = data.currentYear;
    alert('Game loaded!');
};

window.viewMatch = function () {
    const tA = teams[0], tB = teams[1];
    const result = simulateGameWithLog(tA, tB);
    document.getElementById('match-log').innerHTML = result.log.map(line => `<div>${line}</div>`).join('');
};

window.showHOF = function () {
    document.getElementById('hof-output').innerHTML = hallOfFame.map(p =>
        `<div>${p.name}, ${p.position}, Age ${p.age}, Final OVR: ${p.rating}</div>`
    ).join('');
};

window.setUserTeam = function () {
    const name = document.getElementById('user-team-select').value;
    userTeam = teams.find(t => t.name === name);
    alert(`Controlling: ${userTeam.name}`);
};

window.backToTeams = function () {
    document.getElementById('roster-view').style.display = 'none';
    document.getElementById('team-list').style.display = 'block';
};

const teamListEl = document.getElementById('teams');
const rosterView = document.getElementById('roster-view');
const teamNameEl = document.getElementById('team-name');
const rosterEl = document.getElementById('roster');

teams.forEach(team => {
    team.roster = generateRoster();
    const li = document.createElement('li');
    li.textContent = team.name;
    li.onclick = () => showRoster(team);
    teamListEl.appendChild(li);

    const opt = document.createElement('option');
    opt.value = team.name;
    opt.textContent = team.name;
    document.getElementById('user-team-select').appendChild(opt);
});

function showRoster(team) {
    const capSpace = 100 - getTeamSalary(team);
    teamNameEl.innerHTML = `${team.name} | Cap Space: $${capSpace}M`;
    rosterEl.innerHTML = '';

    team.roster.forEach(player => {
        const contractText = player.contract
            ? ` | ${player.contract.currentYear}/${player.contract.years} yrs @ $${player.contract.salary}M`
            : player.freeAgent ? ' | Free Agent' : '';

        const status = player.injured ? ' [Injured]' : '';
        const history = player.teamHistory?.map(h =>
            `${h.year}: ${h.event} (${h.team}${h.round ? ', Round ' + h.round : ''})`
        ).join(' | ') || '';

        const li = document.createElement('li');
        li.innerHTML = `
            ${player.position} - ${player.name} (OVR: ${player.rating})${status}<br/>
            ${contractText}<br/>
            <small>${history}</small>
        `;
        rosterEl.appendChild(li);
    });

    const chart = getDepthChart(team);
    rosterEl.innerHTML += `<h3>Depth Chart</h3>`;
    for (let pos in chart) {
        const starters = chart[pos].slice(0, 2).map(p => `${p.name} (${p.rating})`).join(', ');
        rosterEl.innerHTML += `<div>${pos}: ${starters}</div>`;
    }

    document.getElementById('team-list').style.display = 'none';
    rosterView.style.display = 'block';
}