const diasLinea = ['1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18'];
const valoresNE = [4.2, 5.1, 6.3, 7.0, 5.8, 4.5, 3.9, 5.2, 6.8, 8.4, 7.1, 5.5, 4.8, 4.1, 3.8, 4.4, 5.0, 4.2];

new Chart(document.getElementById('chartLinea'), {
    type: 'line',
    data: {
        labels: diasLinea,
        datasets: [{
            label: 'NE',
            data: valoresNE,
            borderColor: '#0F6E56',
            backgroundColor: 'rgba(15,110,86,0.07)',
            borderWidth: 2,
            pointBackgroundColor: '#0F6E56',
            pointRadius: 4,
            tension: 0,
            fill: true
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            x: { ticks: { autoSkip: false, maxRotation: 0, font: { size: 11 } }, grid: { display: false } },
            y: { min: 0, max: 10, ticks: { stepSize: 2, font: { size: 11 } }, grid: { color: 'rgba(0,0,0,0.05)' } }
        }
    }
});

new Chart(document.getElementById('chartBarras'), {
    type: 'bar',
    data: {
        labels: ['Exámenes', 'Tareas', 'Proyectos', 'Exposiciones', 'Otros'],
        datasets: [{
            label: '%',
            data: [35, 28, 20, 10, 7],
            backgroundColor: ['#1D9E75','#5DCAA5','#9FE1CB','#B5D4F4','#D3D1C7'],
            borderRadius: 4
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            x: { ticks: { font: { size: 11 } }, grid: { display: false } },
            y: { ticks: { callback: v => v + '%', font: { size: 11 } }, grid: { color: 'rgba(0,0,0,0.05)' } }
        }
    }
});

// - - - FUNCIONES DE ENLACES - - -

function cerrar_sesion() {
    window.location.href = 'index.html';
    sessionStorage.clear()
}

function exportarPDF() {
    window.print();
}