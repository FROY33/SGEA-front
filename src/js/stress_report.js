// Mapeo de factores
const FACTORES = {
    factor_1: 'Calidad del docente',
    factor_2: 'Sobrecarga académica',
    factor_3: 'Creencias de rendimiento',
    factor_4: 'Intervenciones en público',
    factor_5: 'Clima social',
    factor_6: 'Exámenes',
    factor_7: 'Valor de contenidos',
    factor_8: 'Autonomía en el aula'
};

let lineaChart = null;
let barrasChart = null;

function crearLineChart(labels, data) {
    const ctx = document.getElementById('chartLinea');
    if (lineaChart) lineaChart.destroy();
    // calcular min/max y ajustar padding para resaltar pequeños cambios
    const nums = data.filter(v => typeof v === 'number' && !isNaN(v));
    let minVal = Math.min(...nums);
    let maxVal = Math.max(...nums);
    if (!isFinite(minVal) || !isFinite(maxVal)) { minVal = 0; maxVal = 100; }
    const diff = maxVal - minVal;
    // padding mínimo 5 unidades o igual al desfase si es mayor
    const padding = Math.max(5, Math.ceil(diff));
    const yMin = Math.max(0, Math.floor(minVal - padding));
    const yMax = Math.ceil(maxVal + padding);
    const step = Math.ceil((yMax - yMin) / 5);

    lineaChart = new Chart(ctx, {
        type: 'line',
        data: { labels, datasets: [{ label: 'NE', data, borderColor: '#0F6E56', backgroundColor: 'rgba(15,110,86,0.07)', borderWidth: 2, pointBackgroundColor: '#0F6E56', pointRadius: 4, tension: 0, fill: true }]},
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { autoSkip: false, maxRotation: 0, font: { size: 11 } }, grid: { display: false } }, y: { min: yMin, max: yMax, ticks: { stepSize: step, font: { size: 11 } }, grid: { color: 'rgba(0,0,0,0.05)' } } } }
    });
}

function crearBarrasChart(labels, data) {
    const ctx = document.getElementById('chartBarras');
    if (barrasChart) barrasChart.destroy();
    barrasChart = new Chart(ctx, {
        type: 'bar',
        data: { labels, datasets: [{ label: 'Promedio', data, backgroundColor: ['#1D9E75','#5DCAA5','#9FE1CB','#B5D4F4','#D3D1C7','#F7C6C6','#F3E2B8','#C8D9E8'].slice(0, labels.length), borderRadius: 6 }]},
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { font: { size: 11 } }, grid: { display: false } }, y: { ticks: { callback: v => v, font: { size: 11 } }, grid: { color: 'rgba(0,0,0,0.05)' }, suggestedMin: 0, suggestedMax: 5 } } }
    });
}

// - - - FUNCIONES DE ENLACES - - -

function cerrar_sesion() {
    window.location.href = 'index.html';
    sessionStorage.clear();
}

function exportarPDF() {
    window.print();
}

// - - - LÓGICA DE FETCH Y RENDER - - -

async function cargarReporteSemanal() {
    const loadingEls = document.querySelectorAll('.sr-loading');
    loadingEls.forEach(el => el.classList.remove('hidden'));

    document.getElementById('loading_fechas').classList.replace('hidden', 'flex');
    document.getElementById('periodoInforme').classList.add('hidden');

    try {
        const resp = await fetch('https://sgea.onrender.com/reportes/estres', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${sessionStorage.getItem('access_token')}` }
        });

        if (!resp.ok) throw new Error('Error en la respuesta: ' + resp.status);
        const data = await resp.json();

        if (data.datos_insuficientes) {
            mostrarDatosInsuficientes();
            return;
        }

        // Periodo
        if (data.semana && data.semana.inicio && data.semana.fin) {
            const inicio = new Date(data.semana.inicio);
            const fin = new Date(data.semana.fin);
            const opciones = { day: '2-digit', month: 'short' };
            document.getElementById('periodoInforme').textContent = `${inicio.toLocaleDateString('es-ES', opciones)} - ${fin.toLocaleDateString('es-ES', opciones)}`;
        }

        // Texto ánimo
        if (data.mensaje_animo) document.getElementById('textoAnimo').textContent = data.mensaje_animo;

        // NE promedio y categoría
        if (typeof data.ne_promedio !== 'undefined') {
            document.getElementById('nePromedioValue')?.remove();
            const span = document.createElement('div');
            span.id = 'nePromedioValue';
            span.className = 'text-sm text-gray-700 font-semibold';
            span.textContent = `NE promedio: ${data.ne_promedio.toFixed(1)} (${data.categoria || ''})`;
            const parent = document.getElementById('neSummary');
            if (parent) parent.appendChild(span);
        }

        // Gráfica temporal
        if (Array.isArray(data.grafica_temporal)) {
            const labels = data.grafica_temporal.map(d => {
                const dt = new Date(d.fecha);
                return `${String(dt.getDate()).padStart(2,'0')}/${String(dt.getMonth()+1).padStart(2,'0')}`;
            });
            const valores = data.grafica_temporal.map(d => Number(d.ne_valor));
            crearLineChart(labels, valores);

            // Día más estresante
            if (valores.length>0) {
                let maxIdx = 0;
                for (let i=1;i<valores.length;i++) if (valores[i]>valores[maxIdx]) maxIdx = i;
                const fechaMax = new Date(data.grafica_temporal[maxIdx].fecha);
                const opciones = { day: '2-digit', month: 'short' };
                const diaTexto = `${fechaMax.toLocaleDateString('es-ES', opciones)}`;
                document.getElementById('diaMasEstresante').textContent = diaTexto;
                document.getElementById('valorDiaMax').textContent = `NE: ${valores[maxIdx]}`;
            }
        }

        // Gráfica distribución (ordenar por factor numérico si es posible)
        if (Array.isArray(data.grafica_distribucion) && data.grafica_distribucion.length>0) {
            // Mapear factor keys a texto
            const labels = data.grafica_distribucion.map(f => FACTORES[f.factor] || f.factor);
            const valores = data.grafica_distribucion.map(f => Number(f.promedio.toFixed(2)));
            crearBarrasChart(labels, valores);

            // Actualizar leyenda dinámica
            const colors = ['#1D9E75','#5DCAA5','#9FE1CB','#B5D4F4','#D3D1C7','#F7C6C6','#F3E2B8','#C8D9E8'];
            const legend = document.getElementById('estresoresLegend');
            legend.innerHTML = '';
            labels.forEach((lab, idx) => {
                const span = document.createElement('span');
                span.className = 'flex items-center gap-1';
                const dot = document.createElement('span');
                dot.className = 'w-2.5 h-2.5 rounded-sm inline-block';
                dot.style.backgroundColor = colors[idx % colors.length];
                span.appendChild(dot);
                const text = document.createTextNode(' ' + lab);
                span.appendChild(text);
                legend.appendChild(span);
            });
        }

        // resumen: promedio, capturas
        if (data.periodo && typeof data.periodo.total_capturas !== 'undefined') {
            document.getElementById('totalCapturas').textContent = data.periodo.total_capturas;
        }
        if (typeof data.ne_promedio !== 'undefined') {
            document.getElementById('promedioNE').textContent = data.ne_promedio.toFixed(1);
            // categoría
            const promParent = document.getElementById('promedioNE').parentElement;
            if (promParent) {
                const smalls = promParent.querySelectorAll('p.text-xs');
                if (smalls && smalls.length>0) {
                    // el texto de categoría suele ser el segundo <p> dentro del bloque
                    smalls[1].textContent = data.categoria || '';
                }
            }
        }

        // Ocultar loading
        loadingEls.forEach(el => el.classList.add('hidden'));
        document.getElementById('loading_fechas').classList.replace('flex', 'hidden');

        document.getElementById('periodoInforme').classList.remove('hidden');

    } catch (error) {
        console.error('Error cargando reporte:', error);
        loadingEls.forEach(el => el.classList.add('hidden'));
        mostrarDatosInsuficientes();
    }
}

function mostrarDatosInsuficientes() {
    const main = document.querySelector('main');
    const cont = document.createElement('div');
    const img = document.createElement('img');
    cont.className = 'p-6 rounded-xl bg-white text-center';
    cont.innerHTML = '<p class="text-gray-600 bg-gray-50 py-5 px-8 rounded-2xl">No hay datos suficientes para generar el reporte semanal.</p>';
    // Reemplazar contenido principal
    main.innerHTML = '<a href="dashboard.html"><img id="imagen_relleno" src="assets/logo.jpeg" class="w-80 h-80 rounded-2xl"></a>';
    main.className = 'flex flex-col items-center justify-center max-w-5xl mx-auto px-10 mt-38 mb-12 h-150 bg-white py-6 items-center rounded-2xl';
    
    main.appendChild(cont);
    main.appendChild(img);
}

document.addEventListener('DOMContentLoaded', () => {
    cargarReporteSemanal();
});