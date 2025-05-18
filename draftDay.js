
export class DraftDay {
    constructor(teams, draftClass, userTeam, currentYear) {
        this.teams = [...teams].sort((a, b) => a.wins - b.wins);
        this.draftClass = draftClass;
        this.userTeam = userTeam;
        this.currentYear = currentYear;
        this.round = 1;
        this.pick = 0;
        this.recap = [];
    }

    getNextTeam() {
        return this.teams[this.pick];
    }

    nextPick() {
        const team = this.getNextTeam();

        if (team === this.userTeam) {
            this.showUserPick();
        } else {
            const pick = this.draftClass.shift();
            this.assignPick(team, pick);
            this.advance();
        }
    }

    showUserPick() {
        const list = document.getElementById('draft-options');
        list.innerHTML = '';
        document.getElementById('draft-round').textContent = this.round;

        this.draftClass.slice(0, 10).forEach((p, i) => {
            const li = document.createElement('li');
            li.innerHTML = `${p.name} - ${p.position} (Scout Grade: ${p.rating + (Math.random() * 10 - 5) | 0})`;
            li.onclick = () => this.userPick(i);
            list.appendChild(li);
        });

        document.getElementById('draft-modal').style.display = 'block';
    }

    userPick(index) {
        const pick = this.draftClass.splice(index, 1)[0];
        this.assignPick(this.userTeam, pick);
        document.getElementById('draft-modal').style.display = 'none';
        this.advance();
    }

    autoPick() {
        const pick = this.draftClass.shift();
        this.assignPick(this.userTeam, pick);
        document.getElementById('draft-modal').style.display = 'none';
        this.advance();
    }

    assignPick(team, player) {
        player.draftedBy = team.id;
        player.draftRound = this.round;
        player.age = 21;
        if (!player.teamHistory) player.teamHistory = [];
        player.teamHistory.push({ year: this.currentYear, team: team.name, event: 'Drafted', round: this.round });
        team.roster.push(player);

        this.recap.push({
            round: this.round,
            team: team.name,
            player: `${player.name} (${player.position})`,
            rating: player.rating
        });
    }

    advance() {
        this.pick++;
        if (this.pick >= this.teams.length) {
            this.pick = 0;
            this.round++;
        }

        if (this.round <= 7 && this.draftClass.length > 0) {
            this.nextPick();
        } else {
            document.getElementById('season-output').innerHTML += '<p>Draft complete!</p>';
        }
    }
}
