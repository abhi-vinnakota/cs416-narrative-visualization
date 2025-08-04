let currentScene = 0;
let f1Data = [];
let driverStandings = [];
let teamStandings = [];
let isExplorationMode = false;

const scenes = [
    {
        title: "Welcome to the 2024 F1 Championship",
        description: "The 2024 Formula 1 season was filled with crazy moments and intense rivalries between drivers, teams, and team principals. There were 24 races this season in places around the world, with drivers fighting to secure points for themselves and their teams. In this project, we'll explore the story of this season by diving into the results of the season.",
        visualization: "overview",
        allowInteraction: false
    },
    {
        title: "The Driver Championship Battle",
        description: "Max Verstappen was dominant this season and earned himself the Driver's Championship with 19 wins. However, the battle for the remaining top spots was also fierce. Charles Leclerc, Lando Norris, Oscar Piastri, and Carlos Sainz were competing with each other to the very end. This season was definitely one of the most exciting and competitive seasons in the history of F1.",
        visualization: "driver_championship",
        allowInteraction: false
    },
    {
        title: "The Constructors' Cup",
        description: "Red Bull may have won the Driver's Championship, but they were actually out of the running for the Constructors' Championship. McLaren ended up winning the Constructors' cup, but Ferrari was a very close second. Red Bull came in third, but Ferrari was ahead by a pretty wide margin. McLaren ended up winning the prestigious Constructors' Cup for the 9th time in their history!",
        visualization: "team_championship",
        allowInteraction: false
    },
    {
        title: "Explore the Season Yourself",
        description: "On this scene, you can explore all of the data from the season yourself. On the graph below, you can hover over a driver to see more stats such as the points earned on the race, what their position was, and whether they were the fastest lap. You can also filter to explore data for specific races or teams.",
        visualization: "exploration",
        allowInteraction: true
    }
];

const teamColors = {
    'Red Bull Racing Honda RBPT': '#3671C6',
    'Ferrari': '#F91536',
    'Mercedes': '#6CD3BF',
    'McLaren Mercedes': '#FF8700',
    'Aston Martin Aramco Mercedes': '#358C75',
    'Alpine Renault': '#2293D1',
    'Williams Mercedes': '#37BEDD',
    'RB Honda RBPT': '#5E8FAA',
    'Haas Ferrari': '#B6BABD',
    'Kick Sauber Ferrari': '#52E252'
};

const driverWikiLinks = {
    'Max Verstappen': 'https://en.wikipedia.org/wiki/Max_Verstappen',
    'Sergio Perez': 'https://en.wikipedia.org/wiki/Sergio_P%C3%A9rez',
    'Charles Leclerc': 'https://en.wikipedia.org/wiki/Charles_Leclerc',
    'Carlos Sainz': 'https://en.wikipedia.org/wiki/Carlos_Sainz_Jr.',
    'Lando Norris': 'https://en.wikipedia.org/wiki/Lando_Norris',
    'George Russell': 'https://en.wikipedia.org/wiki/George_Russell_(racing_driver)',
    'Lewis Hamilton': 'https://en.wikipedia.org/wiki/Lewis_Hamilton',
    'Oscar Piastri': 'https://en.wikipedia.org/wiki/Oscar_Piastri',
    'Fernando Alonso': 'https://en.wikipedia.org/wiki/Fernando_Alonso',
    'Lance Stroll': 'https://en.wikipedia.org/wiki/Lance_Stroll',
    'Daniel Ricciardo': 'https://en.wikipedia.org/wiki/Daniel_Ricciardo',
    'Yuki Tsunoda': 'https://en.wikipedia.org/wiki/Yuki_Tsunoda',
    'Alexander Albon': 'https://en.wikipedia.org/wiki/Alexander_Albon',
    'Nico Hulkenberg': 'https://en.wikipedia.org/wiki/Nico_H%C3%BClkenberg',
    'Esteban Ocon': 'https://en.wikipedia.org/wiki/Esteban_Ocon',
    'Pierre Gasly': 'https://en.wikipedia.org/wiki/Pierre_Gasly',
    'Valtteri Bottas': 'https://en.wikipedia.org/wiki/Valtteri_Bottas',
    'Guanyu Zhou': 'https://en.wikipedia.org/wiki/Guanyu_Zhou',
    'Kevin Magnussen': 'https://en.wikipedia.org/wiki/Kevin_Magnussen'
};

const teamWikiLinks = {
    'Red Bull Racing Honda RBPT': 'https://en.wikipedia.org/wiki/Red_Bull_Racing',
    'Ferrari': 'https://en.wikipedia.org/wiki/Scuderia_Ferrari',
    'Mercedes': 'https://en.wikipedia.org/wiki/Mercedes_AMG_Petronas_F1_Team',
    'McLaren Mercedes': 'https://en.wikipedia.org/wiki/McLaren_F1_Team',
    'Aston Martin Aramco Mercedes': 'https://en.wikipedia.org/wiki/Aston_Martin_F1_Team',
    'Alpine Renault': 'https://en.wikipedia.org/wiki/Alpine_F1_Team',
    'Williams Mercedes': 'https://en.wikipedia.org/wiki/Williams_Grand_Prix_Engineering',
    'RB Honda RBPT': 'https://en.wikipedia.org/wiki/RB_F1_Team',
    'Haas Ferrari': 'https://en.wikipedia.org/wiki/Haas_F1_Team',
    'Kick Sauber Ferrari': 'https://en.wikipedia.org/wiki/Stake_F1_Team_Kick_Sauber'
};

async function init() {
    try {
        const response = await fetch('f1_2024_results.csv');
        const csvText = await response.text();
        f1Data = d3.csvParse(csvText);
        
        f1Data.forEach(d => {
            d.Points = +d.Points || 0;
            d.Position = +d.Position || 0;
            d.Laps = +d.Laps || 0;
        });
        
        calculateDriverStandings();
        calculateTeamStandings();
        showScene(0);
        
    } catch (error) {
        console.error('Error loading data:', error);
        document.getElementById('scene-content').innerHTML = 
            '<div class="scene-title">Error Loading Data</div>' +
            '<div class="scene-description">Please ensure the CSV file is available and try refreshing the page.</div>';
    }
}

function calculateDriverStandings() {
    const driverPoints = {};
    
    f1Data.forEach(race => {
        if (race.Driver && race.Points > 0) {
            if (!driverPoints[race.Driver]) {
                driverPoints[race.Driver] = {
                    name: race.Driver,
                    team: race.Team,
                    totalPoints: 0,
                    wins: 0,
                    podiums: 0,
                    fastestLaps: 0,
                    races: 0
                };
            }
            driverPoints[race.Driver].totalPoints += race.Points;
            driverPoints[race.Driver].races += 1;
            
            if (race.Position === 1) driverPoints[race.Driver].wins += 1;
            if (race.Position <= 3) driverPoints[race.Driver].podiums += 1;
            if (race['Set Fastest Lap'] === 'Yes') driverPoints[race.Driver].fastestLaps += 1;
        }
    });
    
    driverStandings = Object.values(driverPoints)
        .sort((a, b) => b.totalPoints - a.totalPoints)
        .slice(0, 10);
}

function calculateTeamStandings() {
    const teamPoints = {};
    
    f1Data.forEach(race => {
        if (race.Team && race.Points > 0) {
            if (!teamPoints[race.Team]) {
                teamPoints[race.Team] = {
                    name: race.Team,
                    totalPoints: 0,
                    wins: 0,
                    podiums: 0,
                    fastestLaps: 0,
                    races: 0
                };
            }
            teamPoints[race.Team].totalPoints += race.Points;
            teamPoints[race.Team].races += 1;
            
            if (race.Position === 1) teamPoints[race.Team].wins += 1;
            if (race.Position <= 3) teamPoints[race.Team].podiums += 1;
            if (race['Set Fastest Lap'] === 'Yes') teamPoints[race.Team].fastestLaps += 1;
        }
    });
    
    teamStandings = Object.values(teamPoints)
        .sort((a, b) => b.totalPoints - a.totalPoints);
}

function showScene(sceneIndex) {
    currentScene = sceneIndex;
    const scene = scenes[sceneIndex];
    
    updateNavigation();
    
    const content = document.getElementById('scene-content');
    content.innerHTML = '';
    
    content.innerHTML = `
        <div class="scene-title">${scene.title}</div>
        <div class="scene-description">${scene.description}</div>
        <div class="visualization" id="visualization"></div>
    `;
    
    switch(scene.visualization) {
        case 'overview':
            createOverviewVisualization();
            break;
        case 'driver_championship':
            createDriverChampionshipVisualization();
            break;
        case 'team_championship':
            createTeamChampionshipVisualization();
            break;
        case 'exploration':
            createExplorationVisualization();
            break;
    }
}

function updateNavigation() {
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const progressFill = document.getElementById('progress-fill');
    const sceneCounter = document.getElementById('scene-counter');
    
    prevBtn.disabled = currentScene === 0;
    nextBtn.textContent = currentScene === scenes.length - 1 ? 'Finish' : 'Next';
    
    const progress = ((currentScene + 1) / scenes.length) * 100;
    progressFill.style.width = progress + '%';
    
    sceneCounter.textContent = `Scene ${currentScene + 1} of ${scenes.length}`;
}

function nextScene() {
    if (currentScene < scenes.length - 1) {
        showScene(currentScene + 1);
    }
}

function previousScene() {
    if (currentScene > 0) {
        showScene(currentScene - 1);
    }
}

function createOverviewVisualization() {
    const container = document.getElementById('visualization');
    const width = 800;
    const height = 500;
    
    const svg = d3.select(container)
        .append('svg')
        .attr('width', width)
        .attr('height', height);
    
    const totalRaces = new Set(f1Data.map(d => d.Track)).size;
    const totalDrivers = new Set(f1Data.map(d => d.Driver)).size;
    const totalTeams = new Set(f1Data.map(d => d.Team)).size;
    const totalPoints = d3.sum(f1Data, d => d.Points);
    
    const stats = svg.append('g')
        .attr('transform', `translate(${width/2}, 150)`);
    
    const statData = [
        { label: 'Races', value: totalRaces, color: '#1e3c72' },
        { label: 'Drivers', value: totalDrivers, color: '#2a5298' },
        { label: 'Teams', value: totalTeams, color: '#3671C6' },
        { label: 'Total Points', value: totalPoints, color: '#F91536' }
    ];
    
    const statSize = 150;
    const statSpacing = 180;
    
    statData.forEach((stat, i) => {
        const x = (i % 2) * statSpacing - statSpacing/2;
        const y = Math.floor(i / 2) * statSpacing - statSpacing/2;
        
        const statGroup = stats.append('g')
            .attr('transform', `translate(${x}, ${y})`);
        
        statGroup.append('text')
            .attr('class', 'stat-number')
            .attr('text-anchor', 'middle')
            .attr('dy', '-20')
            .style('font-size', '36px')
            .style('font-weight', 'bold')
            .style('fill', stat.color)
            .text(stat.value);
        
        statGroup.append('text')
            .attr('class', 'stat-label')
            .attr('text-anchor', 'middle')
            .attr('dy', '10')
            .style('font-size', '16px')
            .style('fill', '#666')
            .text(stat.label);
    });
    
    const teamLogos = [
        { name: 'Red Bull', logo: '🏎️', color: '#3671C6', imageUrl: 'redbull-logo.png' },
        { name: 'Ferrari', logo: '🐎', color: '#F91536', imageUrl: 'ferrari-logo.png' },
        { name: 'Mercedes', logo: '⭐', color: '#6CD3BF', imageUrl: 'mercedes-logo.png' },
        { name: 'McLaren', logo: '🏁', color: '#FF8700', imageUrl: 'mclaren-logo.png' },
        { name: 'Aston Martin', logo: '🟢', color: '#358C75', imageUrl: null },
        { name: 'Alpine', logo: '🔵', color: '#2293D1', imageUrl: 'alpine-logo.svg' },
        { name: 'Williams', logo: '🔷', color: '#37BEDD', imageUrl: 'williams-logo.png' },
        { name: 'RB', logo: '🔶', color: '#5E8FAA', imageUrl: 'rb-logo.png' },
        { name: 'Haas', logo: '⚫', color: '#B6BABD', imageUrl: 'haas-logo.png' },
        { name: 'Sauber', logo: '🟢', color: '#52E252', imageUrl: 'sauber-logo.png' }
    ];
    
    const logoGroup = svg.append('g')
        .attr('transform', `translate(${width/2}, 350)`);
    
    const logoSpacing = 90;
    const logosPerRow = 5;
    
    teamLogos.forEach((team, i) => {
        const row = Math.floor(i / logosPerRow);
        const col = i % logosPerRow;
        const x = (col - 2) * logoSpacing;
        const y = row * 70;
        
        const teamGroup = logoGroup.append('g')
            .attr('transform', `translate(${x}, ${y})`);
        
        if (team.imageUrl) {
            teamGroup.append('image')
                .attr('href', team.imageUrl)
                .attr('width', 50)
                .attr('height', 50)
                .attr('x', -25)
                .attr('y', -25);
        } else {
            teamGroup.append('text')
                .attr('text-anchor', 'middle')
                .attr('dy', '0.35em')
                .style('font-size', '30px')
                .text(team.logo);
        }
        
        teamGroup.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '35')
            .style('font-size', '11px')
            .style('fill', team.color)
            .style('font-weight', 'bold')
            .text(team.name);
    });
}

function createDriverChampionshipVisualization() {
    const container = document.getElementById('visualization');
    const width = 800;
    const height = 500;
    const margin = {top: 20, right: 30, bottom: 120, left: 80};
    
    const svg = d3.select(container)
        .append('svg')
        .attr('width', width)
        .attr('height', height);
    
    const tooltip = d3.select('body')
        .append('div')
        .attr('class', 'driver-tooltip')
        .style('opacity', 0);
    
    const topDrivers = driverStandings.slice(0, 8);
    
    const x = d3.scaleBand()
        .domain(topDrivers.map(d => d.name))
        .range([margin.left, width - margin.right])
        .padding(0.2);
    
    const y = d3.scaleLinear()
        .domain([0, d3.max(topDrivers, d => d.totalPoints)])
        .range([height - margin.bottom, margin.top]);
    
    svg.selectAll('.bar')
        .data(topDrivers)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', d => x(d.name))
        .attr('y', d => y(d.totalPoints))
        .attr('width', x.bandwidth())
        .attr('height', d => height - margin.bottom - y(d.totalPoints))
        .attr('fill', d => teamColors[d.team] || '#666')
        .attr('opacity', 0.8)
        .attr('stroke', '#333')
        .attr('stroke-width', 1)
        .style('cursor', 'pointer')
        .on('mouseover', function(event, d) {
            d3.select(this)
                .attr('opacity', 1)
                .attr('stroke-width', 2);
            
            tooltip.transition()
                .duration(200)
                .style('opacity', .9);
            
            const wikiLink = driverWikiLinks[d.name] ? 
                `<br/><a href="${driverWikiLinks[d.name]}" target="_blank" style="color: #4CAF50;">📖 View Wikipedia</a>` : '';
            
            tooltip.html(`
                <strong>${d.name}</strong><br/>
                <strong>${d.team}</strong><br/>
                Points: ${d.totalPoints}<br/>
                Wins: ${d.wins} 🏆<br/>
                Podiums: ${d.podiums} 🥉<br/>
                Fastest Laps: ${d.fastestLaps} 🏁<br/>
                Races: ${d.races}${wikiLink}
            `)
                .style('left', (event.pageX + 10) + 'px')
                .style('top', (event.pageY - 28) + 'px');
        })
        .on('mouseout', function() {
            d3.select(this)
                .attr('opacity', 0.8)
                .attr('stroke-width', 1);
            
            tooltip.transition()
                .duration(500)
                .style('opacity', 0);
        });
    
    svg.selectAll('.points-label')
        .data(topDrivers)
        .enter()
        .append('text')
        .attr('class', 'points-label')
        .attr('x', d => x(d.name) + x.bandwidth() / 2)
        .attr('y', d => y(d.totalPoints) - 10)
        .text(d => d.totalPoints);
    
    svg.append('g')
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x))
        .selectAll('text')
        .attr('transform', 'rotate(-45)')
        .style('text-anchor', 'end');
    
    svg.append('g')
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(y));
    

}

function createTeamChampionshipVisualization() {
    const container = document.getElementById('visualization');
    const width = 800;
    const height = 500;
    const margin = {top: 20, right: 30, bottom: 120, left: 80};
    
    const svg = d3.select(container)
        .append('svg')
        .attr('width', width)
        .attr('height', height);
    
    const tooltip = d3.select('body')
        .append('div')
        .attr('class', 'driver-tooltip')
        .style('opacity', 0);
    
    const teams = teamStandings;
    
    const x = d3.scaleBand()
        .domain(teams.map(d => d.name))
        .range([margin.left, width - margin.right])
        .padding(0.2);
    
    const y = d3.scaleLinear()
        .domain([0, d3.max(teams, d => d.totalPoints)])
        .range([height - margin.bottom, margin.top]);
    
    svg.selectAll('.bar')
        .data(teams)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', d => x(d.name))
        .attr('y', d => y(d.totalPoints))
        .attr('width', x.bandwidth())
        .attr('height', d => height - margin.bottom - y(d.totalPoints))
        .attr('fill', d => teamColors[d.name] || '#666')
        .attr('opacity', 0.8)
        .attr('stroke', '#333')
        .attr('stroke-width', 1)
        .style('cursor', 'pointer')
        .on('mouseover', function(event, d) {
            d3.select(this)
                .attr('opacity', 1)
                .attr('stroke-width', 2);
            
            tooltip.transition()
                .duration(200)
                .style('opacity', .9);
            
            const wikiLink = teamWikiLinks[d.name] ? 
                `<br/><a href="${teamWikiLinks[d.name]}" target="_blank" style="color: #4CAF50;">📖 View Wikipedia</a>` : '';
            
            tooltip.html(`
                <strong>${d.name}</strong><br/>
                Points: ${d.totalPoints}<br/>
                Wins: ${d.wins} 🏆<br/>
                Podiums: ${d.podiums} 🥉<br/>
                Fastest Laps: ${d.fastestLaps} 🏁<br/>
                Races: ${d.races}${wikiLink}
            `)
                .style('left', (event.pageX + 10) + 'px')
                .style('top', (event.pageY - 28) + 'px');
        })
        .on('mouseout', function() {
            d3.select(this)
                .attr('opacity', 0.8)
                .attr('stroke-width', 1);
            
            tooltip.transition()
                .duration(500)
                .style('opacity', 0);
        });
    
    svg.selectAll('.points-label')
        .data(teams)
        .enter()
        .append('text')
        .attr('class', 'points-label')
        .attr('x', d => x(d.name) + x.bandwidth() / 2)
        .attr('y', d => y(d.totalPoints) - 10)
        .text(d => d.totalPoints);
    
    svg.append('g')
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x))
        .selectAll('text')
        .attr('transform', 'rotate(-45)')
        .style('text-anchor', 'end');
    
    svg.append('g')
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(y));
    

}

function createExplorationVisualization() {
    const container = document.getElementById('visualization');
    
    container.innerHTML = `
        <div class="exploration-notice">
            🏎️ Hover over points to see data about specific drivers/teams. Use the filters below to select specific races or teams you want to look at.
        </div>
    `;
    
    const filterContainer = document.createElement('div');
    filterContainer.className = 'filter-container';
    filterContainer.innerHTML = `
        <div style="display: inline-block; margin: 0 20px;">
            <label for="race-filter" style="font-weight: bold; margin-right: 10px;">Filter by Race:</label>
            <select id="race-filter">
                <option value="all">All Races</option>
            </select>
        </div>
        <div style="display: inline-block; margin: 0 20px;">
            <label for="team-filter" style="font-weight: bold; margin-right: 10px;">Filter by Team:</label>
            <select id="team-filter">
                <option value="all">All Teams</option>
            </select>
        </div>
        <button id="reset-filters">Reset Filters</button>
    `;
    container.appendChild(filterContainer);
    
    const width = 800;
    const height = 600;
    
    const svg = d3.select(container)
        .append('svg')
        .attr('width', width)
        .attr('height', height);
    
    svg.append('text')
        .attr('x', width - 10)
        .attr('y', 20)
        .attr('text-anchor', 'end')
        .style('font-size', '12px')
        .style('fill', '#1e3c72')
        .style('font-weight', 'bold')
        .text('💡 Hover over points for details');
    
    const tooltip = d3.select('body')
        .append('div')
        .attr('class', 'driver-tooltip')
        .style('opacity', 0);
    
    const margin = {top: 20, right: 30, bottom: 40, left: 60};
    
    const tracks = [...new Set(f1Data.map(d => d.Track))].sort();
    const teams = [...new Set(f1Data.map(d => d.Team))].sort();
    
    const raceFilter = document.getElementById('race-filter');
    const teamFilter = document.getElementById('team-filter');
    
    tracks.forEach(track => {
        const option = document.createElement('option');
        option.value = track;
        option.textContent = track;
        raceFilter.appendChild(option);
    });
    
    teams.forEach(team => {
        const option = document.createElement('option');
        option.value = team;
        option.textContent = team;
        teamFilter.appendChild(option);
    });
    
    const x = d3.scaleBand()
        .domain(tracks)
        .range([margin.left, width - margin.right])
        .padding(0.1);
    
    const y = d3.scaleLinear()
        .domain([0, d3.max(f1Data, d => d.Points)])
        .range([height - margin.bottom, margin.top]);
    
    let points = svg.selectAll('.point')
        .data(f1Data.filter(d => d.Points > 0))
        .enter()
        .append('circle')
        .attr('class', 'point')
        .attr('cx', d => x(d.Track) + x.bandwidth() / 2)
        .attr('cy', d => y(d.Points))
        .attr('r', 6)
        .attr('fill', d => teamColors[d.Team] || '#666')
        .attr('opacity', 0.8)
        .attr('stroke', '#fff')
        .attr('stroke-width', 2)
        .style('cursor', 'pointer')
        .on('mouseover', function(event, d) {
            d3.select(this)
                .attr('opacity', 1)
                .attr('r', 8)
                .attr('stroke-width', 3);
            
            tooltip.transition()
                .duration(200)
                .style('opacity', .9);
            
            tooltip.html(`
                <strong>${d.Driver}</strong><br/>
                <strong>${d.Team}</strong><br/>
                Race: ${d.Track}<br/>
                Position: ${d.Position}<br/>
                Points: ${d.Points}<br/>
                ${d['Set Fastest Lap'] === 'Yes' ? '🏁 Fastest Lap' : ''}
            `)
                .style('left', (event.pageX + 10) + 'px')
                .style('top', (event.pageY - 28) + 'px');
        })
        .on('mouseout', function() {
            d3.select(this)
                .attr('opacity', 0.8)
                .attr('r', 6)
                .attr('stroke-width', 2);
            
            tooltip.transition()
                .duration(500)
                .style('opacity', 0);
        });
    
    function updateVisualization() {
        const selectedRace = raceFilter.value;
        const selectedTeam = teamFilter.value;
        
        let filteredData = f1Data.filter(d => d.Points > 0);
        
        if (selectedRace !== 'all') {
            filteredData = filteredData.filter(d => d.Track === selectedRace);
        }
        
        if (selectedTeam !== 'all') {
            filteredData = filteredData.filter(d => d.Team === selectedTeam);
        }
        
        svg.selectAll('.point').remove();
        
        points = svg.selectAll('.point')
            .data(filteredData)
            .enter()
            .append('circle')
            .attr('class', 'point')
            .attr('cx', d => x(d.Track) + x.bandwidth() / 2)
            .attr('cy', d => y(d.Points))
            .attr('r', 6)
            .attr('fill', d => teamColors[d.Team] || '#666')
            .attr('opacity', 0.8)
            .attr('stroke', '#fff')
            .attr('stroke-width', 2)
            .style('cursor', 'pointer')
            .on('mouseover', function(event, d) {
                d3.select(this)
                    .attr('opacity', 1)
                    .attr('r', 8)
                    .attr('stroke-width', 3);
                
                tooltip.transition()
                    .duration(200)
                    .style('opacity', .9);
                
                tooltip.html(`
                    <strong>${d.Driver}</strong><br/>
                    <strong>${d.Team}</strong><br/>
                    Race: ${d.Track}<br/>
                    Position: ${d.Position}<br/>
                    Points: ${d.Points}<br/>
                    ${d['Set Fastest Lap'] === 'Yes' ? '🏁 Fastest Lap' : ''}
                `)
                    .style('left', (event.pageX + 10) + 'px')
                    .style('top', (event.pageY - 28) + 'px');
            })
            .on('mouseout', function() {
                d3.select(this)
                    .attr('opacity', 0.8)
                    .attr('r', 6)
                    .attr('stroke-width', 2);
                
                tooltip.transition()
                    .duration(500)
                    .style('opacity', 0);
            });
    }
    
    raceFilter.addEventListener('change', updateVisualization);
    teamFilter.addEventListener('change', updateVisualization);
    
    document.getElementById('reset-filters').addEventListener('click', function() {
        raceFilter.value = 'all';
        teamFilter.value = 'all';
        updateVisualization();
    });
    
    svg.append('g')
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x))
        .selectAll('text')
        .attr('transform', 'rotate(-45)')
        .style('text-anchor', 'end')
        .style('font-size', '10px');
    
    svg.append('g')
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(y));
    
    const legend = svg.append('g')
        .attr('transform', `translate(${width - 150}, ${margin.top})`);
    
    const legendData = Object.entries(teamColors).slice(0, 8);
    
    legend.selectAll('.legend-item')
        .data(legendData)
        .enter()
        .append('circle')
        .attr('cx', 0)
        .attr('cy', (d, i) => i * 20)
        .attr('r', 4)
        .attr('fill', d => d[1]);
    
    legend.selectAll('.legend-text')
        .data(legendData)
        .enter()
        .append('text')
        .attr('x', 10)
        .attr('y', (d, i) => i * 20 + 4)
        .style('font-size', '10px')
        .text(d => d[0].split(' ')[0]);
    
    legend.append('text')
        .attr('x', 0)
        .attr('y', -10)
        .style('font-size', '12px')
        .style('font-weight', 'bold')
        .text('Teams');
}

document.addEventListener('DOMContentLoaded', init); 