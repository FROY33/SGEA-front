// - - - ESTADO GLOBAL - - -
let currentDate = new Date();
let allActividades = [];
let vistActual = 'mes'; // 'mes' o 'semana'
const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];
const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

// - - - CARGAR DATOS - - -
async function cargar_datos_calendario() {
    try {
        await cargar_actividades();
        if (vistActual === 'mes') {
            generarCalendario();
        } else {
            generarVistaSemanal();
        }
        mostrar_eventos_proximos();
        
        // Ocultar skeletons
        document.querySelectorAll('.animate-pulse').forEach(el => el.remove());
    } catch (error) {
        console.error('Error al cargar datos del calendario:', error);
    }
}

async function cargar_actividades() {
    try {
        const response = await fetch('https://sgea.onrender.com/actividad', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem('access_token')}`
            }
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        allActividades = await response.json();
        
        if (!allActividades || allActividades.length === 0) {
            console.log('No hay actividades');
        }

    } catch (error) {
        console.error('Error de conexión:', error);
    }
}

// - - - FUNCIONES DE CALENDARIO - - -

function generarCalendario() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Actualizar encabezado del mes
    document.getElementById('monthYear').textContent = `${meses[month]} ${year}`;
    
    // Primer día del mes
    const firstDay = new Date(year, month, 1).getDay();
    
    // Número de días en el mes
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Número de días del mes anterior
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    
    const calendarGrid = document.getElementById('calendarGrid');
    calendarGrid.innerHTML = '';
    
    // Días del mes anterior (grises)
    for (let i = firstDay - 1; i >= 0; i--) {
        const day = daysInPrevMonth - i;
        const dayElement = crearElementoDia(day, true, new Date(year, month - 1, day), year, month - 1);
        calendarGrid.appendChild(dayElement);
    }
    
    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = crearElementoDia(day, false, new Date(year, month, day), year, month);
        calendarGrid.appendChild(dayElement);
    }
    
    // Días del próximo mes (grises)
    const totalCells = calendarGrid.children.length;
    const remainingCells = 42 - totalCells; // 6 filas x 7 columnas
    for (let day = 1; day <= remainingCells; day++) {
        const dayElement = crearElementoDia(day, true, new Date(year, month + 1, day), year, month + 1);
        calendarGrid.appendChild(dayElement);
    }
}

function crearElementoDia(day, isOutsideMonth, date, year, month) {
    const container = document.createElement('div');
    container.className = `flex flex-col xl:aspect-square max-xl:min-h-15 p-2 relative ${
        isOutsideMonth ? 'bg-gray-50' : 'bg-white'
    } border-r border-b border-sereno-sage-light transition-all duration-300 hover:bg-gray-50 cursor-pointer`;
    
    if (isOutsideMonth) {
        container.classList.add('border-r', 'border-b');
    }
    
    // Marcar el día actual (Hoy)
    const hoy = new Date();
    const esHoy = date.getDate() === hoy.getDate() && date.getMonth() === hoy.getMonth() && date.getFullYear() === hoy.getFullYear();
    
    // Añadir clase para esquinas redondeadas
    const calendarGrid = document.getElementById('calendarGrid');
    const cellIndex = Array.from(calendarGrid.children).length;
    
    if (cellIndex === 35) container.classList.add('rounded-bl-xl');
    if (cellIndex === 41) container.classList.add('rounded-br-xl');
    
    // Número del día
    const daySpan = document.createElement('span');
    daySpan.className = `text-xs font-semibold ${isOutsideMonth ? 'text-gray-400' : 'text-gray-900'}`;
    
    // Estilo extra para el número si es hoy
    if (esHoy) {
        daySpan.classList.add('bg-sereno-sage', 'text-white', 'rounded-full', 'w-fit', 'py-1', 'px-1.5');
    }
    
    daySpan.textContent = day;
    container.appendChild(daySpan);
    
    // Actividades del día
    const activitiesContainer = document.createElement('div');
    activitiesContainer.className = 'flex flex-col gap-1 mt-1';
    
    if (!isOutsideMonth) {
        const actividadesDelDia = obtener_actividades_del_dia(date);
        
        actividadesDelDia.slice(0, 2).forEach(actividad => {
            const badge = document.createElement('span');
            badge.className = 'text-xs font-medium px-2 py-1 rounded truncate hover:shadow-md bg-gray-50 text-sereno-sage';
            badge.textContent = actividad.nombre;
            badge.title = actividad.nombre;
            activitiesContainer.appendChild(badge);
        });
        
        if (actividadesDelDia.length > 2) {
            const badge = document.createElement('span');
            badge.className = 'text-xs font-medium px-2 py-1 rounded bg-gray-200 text-gray-700';
            badge.textContent = `+${actividadesDelDia.length - 2}`;
            activitiesContainer.appendChild(badge);
        }
    }
    
    if (activitiesContainer.children.length > 0) {
        container.appendChild(activitiesContainer);
    }
    
    return container;
}

function obtener_actividades_del_dia(fecha) {
    const actividades = allActividades.filter(actividad => {
        if (!actividad.fecha_entrega) return false;
        
        // Corrección del desfase: Crear fecha local para la actividad ignorando horas
        const fechaActividad = new Date(actividad.fecha_entrega);
        
        // Comparación estricta de año, mes y día en formato local
        const mismoDia = fechaActividad.getDate() === fecha.getDate() &&
                         fechaActividad.getMonth() === fecha.getMonth() &&
                         fechaActividad.getFullYear() === fecha.getFullYear();
        
        return mismoDia && (actividad.estatus === 'pendiente' || actividad.estatus === 'en_progreso');
    });
    
    // Ordenar por importancia (mayor a menor)
    return actividades.sort((a, b) => {
        const importanciaA = a.importancia || 0;
        const importanciaB = b.importancia || 0;
        return importanciaB - importanciaA;
    });
}

// - - - EVENTOS PRÓXIMOS - - -

function mostrar_eventos_proximos() {
    const hoy = new Date();
    hoy.setTime(hoy.getTime() - 24 * 60 * 60 * 1000);
    const unaSemanaDespues = new Date(hoy.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    // Filtrar actividades de la próxima semana
    const eventosPróximos = allActividades
        .filter(actividad => {
            if (!actividad.fecha_entrega || actividad.estatus === 'completada') return false;
            const fecha = new Date(actividad.fecha_entrega);
            return fecha >= hoy && fecha <= unaSemanaDespues;
        })
        .sort((a, b) => new Date(a.fecha_entrega) - new Date(b.fecha_entrega));
    
    const eventosContainer = document.getElementById('eventosContainer');
    
    // Limpiar el contenedor (excepto skeletons)
    const eventos = eventosContainer.querySelectorAll('div:not(.animate-pulse)');
    eventos.forEach(el => el.remove());
    
    if (eventosPróximos.length === 0) {
        const mensaje = document.createElement('div');
        mensaje.className = 'p-6 rounded-xl bg-white text-center';
        mensaje.innerHTML = '<p class="text-gray-600 bg-gray-50 p-4 rounded-2xl">No hay actividades próximas en los próximos 7 días</p>';
        eventosContainer.appendChild(mensaje);
        return;
    }
    
    // Crear elementos para cada evento
    eventosPróximos.forEach(evento => {
        const template = document.getElementById('templateEvento');
        const element = template.cloneNode(true);
        element.classList.remove('hidden');
        
        // Asignar información
        const fecha = new Date(evento.fecha_entrega);
        const fechaFormato = `${String(fecha.getDate()).padStart(2, '0')}/${String(fecha.getMonth() + 1).padStart(2, '0')} ${String(fecha.getHours()).padStart(2, '0')}:${String(fecha.getMinutes()).padStart(2, '0')}`;
        
        element.querySelector('.evento-fecha').textContent = fechaFormato;
        element.querySelector('.evento-nombre').textContent = evento.nombre;
        element.querySelector('.evento-descripcion').textContent = `"${evento.descripcion || 'Sin descripción'}"`;
        
        // Determinar si es equipo o individual
        const badge = element.querySelector('.evento-badge');
        if (evento.equipoId) {
            badge.textContent = 'Equipo';
            badge.className = 'evento-badge px-2 py-1 text-xs font-medium rounded-lg bg-sereno-sage text-white';
            element.querySelector('.evento-color').className = 'w-2.5 h-2.5 rounded-full bg-sereno-sage evento-color';
        } else {
            badge.textContent = 'Individual';
            badge.className = 'evento-badge px-2 py-1 text-xs font-medium rounded-lg bg-sereno-beige text-white';
            element.querySelector('.evento-color').className = 'w-2.5 h-2.5 rounded-full bg-sereno-beige evento-color';
        }
        
        const firstChild = element.querySelector('div');
        eventosContainer.appendChild(firstChild);
    });
}

// - - - VISTA SEMANAL - - -

function resetearALunesActual() {
    currentDate = new Date();
}

function generarVistaSemanal() {
    let fechaDomingo = new Date(currentDate);
    const dia = fechaDomingo.getDay(); 

    // 1. Retroceder correctamente al domingo de la semana actual
    fechaDomingo.setDate(fechaDomingo.getDate() - dia);

    // 2. Calcular el sábado sumando 6 días al domingo de forma nativa
    const fechaSabado = new Date(fechaDomingo);
    fechaSabado.setDate(fechaSabado.getDate() + 6);

    // 3. Construir el formato usando las variables de los objetos Date ya calculados
    const formatoFechas = `${String(fechaDomingo.getDate()).padStart(2, '0')}/${String(fechaDomingo.getMonth() + 1).padStart(2, '0')} - ${String(fechaSabado.getDate()).padStart(2, '0')}/${String(fechaSabado.getMonth() + 1).padStart(2, '0')}`;
    document.getElementById('weekRange').textContent = formatoFechas;
    
    // Generar encabezados de los días
    for (let i = 0; i < 7; i++) {
        const fecha = new Date(fechaDomingo);
        fecha.setDate(fecha.getDate() + i);
        
        const numDia = fecha.getDate();
        document.getElementById(`day${i}Date`).textContent = numDia;
    }
    
    // Limpiar grid semanal
    const weeklyGrid = document.getElementById('weeklyGrid');
    weeklyGrid.innerHTML = '';
    
    // Generar celda por cada día
    for (let i = 0; i < 7; i++) {
        const fecha = new Date(fechaDomingo);
        fecha.setDate(fecha.getDate() + i);
        
        const container = document.createElement('div');
        container.className = `flex flex-col p-2 min-h-32 ${i < 6 ? 'border-r' : ''} border-b border-sereno-sage-light transition-all duration-300 hover:bg-gray-50`;
        
        // Obtener actividades del día ordenadas por importancia
        const actividades = obtener_actividades_del_dia(fecha);
        
        // Mostrar cada actividad apilada verticalmente
        actividades.forEach(actividad => {
            const badge = document.createElement('div');
            badge.className = 'text-xs font-medium px-2 py-1.5 rounded truncate mb-1 cursor-pointer transition-all hover:shadow-md bg-gray-50 text-sereno-sage';
            badge.title = actividad.nombre;
            badge.textContent = actividad.nombre;
            container.appendChild(badge);
        });
        
        weeklyGrid.appendChild(container);
    }
}

// - - - CAMBIO DE VISTA - - -
function cambiarVista(vista) {
    vistActual = vista;
    
    // Actualizar botones
    const btnWeek = document.getElementById('btnWeekView');
    const btnMonth = document.getElementById('btnMonthView');
    
    if (vista === 'semana') {
        btnWeek.classList.remove('bg-gray-50', 'text-sereno-sage');
        btnWeek.classList.add('bg-sereno-sage', 'text-white');
        btnMonth.classList.remove('bg-sereno-sage', 'text-white');
        btnMonth.classList.add('bg-gray-50', 'text-sereno-sage');
        
        document.getElementById('monthlyView').classList.add('hidden');
        document.getElementById('weeklyView').classList.remove('hidden');
        document.getElementById('monthYear').classList.add('hidden');
        document.getElementById('weekRange').classList.remove('hidden');
        
        // Resetear currentDate al lunes de la semana actual
        resetearALunesActual();
        generarVistaSemanal();
    } else {
        btnMonth.classList.remove('bg-gray-50', 'text-sereno-sage');
        btnMonth.classList.add('bg-sereno-sage', 'text-white');
        btnWeek.classList.remove('bg-sereno-sage', 'text-white');
        btnWeek.classList.add('bg-gray-50', 'text-sereno-sage');
        
        document.getElementById('monthlyView').classList.remove('hidden');
        document.getElementById('weeklyView').classList.add('hidden');
        document.getElementById('monthYear').classList.remove('hidden');
        document.getElementById('weekRange').classList.add('hidden');
        
        generarCalendario();
    }
}

// - - - NAVEGACIÓN - - -
function previousPeriod() {
    if (vistActual === 'mes') {
        currentDate.setMonth(currentDate.getMonth() - 1);
        generarCalendario();
    } else {
        currentDate.setDate(currentDate.getDate() - 7);
        generarVistaSemanal();
    }
}

function nextPeriod() {
    if (vistActual === 'mes') {
        currentDate.setMonth(currentDate.getMonth() + 1);
        generarCalendario();
    } else {
        currentDate.setDate(currentDate.getDate() + 7);
        generarVistaSemanal();
    }
}

function previousMonth() {
    previousPeriod();
}

function nextMonth() {
    nextPeriod();
}

// - - - CIERRE DE SESIÓN - - -

function cerrar_sesion() {
    window.location.href = 'index.html';
    sessionStorage.clear();
}

// - - - INICIALIZACIÓN - - -

document.addEventListener('DOMContentLoaded', cargar_datos_calendario);

