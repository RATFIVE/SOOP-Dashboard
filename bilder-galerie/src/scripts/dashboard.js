// Dashboard-Logik für STA-Datenbank
// 1. Karte initialisieren
// 2. Locations von STA-API laden und Marker setzen
// 3. Beim Klick auf Marker Zeitreihe laden und anzeigen

const map = L.map('map').setView([0, 0], 2);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

const FROST_API = 'https://timeseries.geomar.de/soop/FROST-Server/v1.1';

async function fetchLocations() {
    const resp = await fetch(`${FROST_API}/Things?$expand=Locations`);
    const data = await resp.json();
    return data.value.map(thing => {
        const loc = thing.Locations[0];
        return {
            id: thing['@iot.id'],
            name: thing.name,
            lat: loc && loc.location && loc.location.coordinates[1],
            lon: loc && loc.location && loc.location.coordinates[0]
        };
    }).filter(l => l.lat && l.lon);
}

async function fetchDatastreams(thingId) {
    const resp = await fetch(`${FROST_API}/Things(${thingId})/Datastreams`);
    const data = await resp.json();
    return data.value[0]; // Nimm den ersten Datastream
}

async function fetchObservations(datastreamId) {
    const resp = await fetch(`${FROST_API}/Datastreams(${datastreamId})/Observations?$top=100&$orderby=phenomenonTime asc`);
    const data = await resp.json();
    return data.value;
}

function renderChart(observations, title = 'Messwert') {
    const ctx = document.getElementById('timeseriesChart').getContext('2d');
    if (window.tsChart) window.tsChart.destroy();
    window.tsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: observations.map(o => o.phenomenonTime),
            datasets: [{
                label: title,
                data: observations.map(o => o.result),
                borderColor: '#0074D9',
                backgroundColor: 'rgba(0,116,217,0.1)',
                fill: true,
                pointRadius: 2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: title
                }
            },
            scales: {
                x: { type: 'time', time: { unit: 'day' } },
                y: { beginAtZero: true }
            }
        }
    });
}

// Login-Logik für Admin
const loginForm = document.getElementById('loginForm');
const loginStatus = document.getElementById('loginStatus');
const loginBox = document.getElementById('loginBox');

if (loginForm) {
    loginForm.onsubmit = function(e) {
        e.preventDefault();
        const user = document.getElementById('username').value;
        const pw = document.getElementById('password').value;
        // Dummy-Login: admin / admin123
        if (user === 'admin' && pw === 'admin123') {
            loginStatus.textContent = 'Login erfolgreich!';
            loginStatus.style.color = 'green';
            setTimeout(() => loginBox.style.display = 'none', 1000);
            // Hier kann Admin-Funktionalität eingeblendet werden
        } else {
            loginStatus.textContent = 'Login fehlgeschlagen!';
            loginStatus.style.color = 'red';
        }
    };
}

async function main() {
    const locations = await fetchLocations();
    locations.forEach(loc => {
        const marker = L.marker([loc.lat, loc.lon]).addTo(map).bindPopup(loc.name);
        marker.on('click', async () => {
            const ds = await fetchDatastreams(loc.id);
            if (!ds) return alert('Keine Messdaten gefunden!');
            const obs = await fetchObservations(ds['@iot.id']);
            renderChart(obs, `${loc.name} (${ds.name || 'Messwert'})`);
        });
    });
}

main();
