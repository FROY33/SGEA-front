// - - - ESTADO GLOBAL - - -
let currentDate = new Date();
let allActividades = [];
const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

// - - - CARGAR DATOS - - -
async function cargar_datos_calendario() {
    try {
        await cargar_actividades();
        generarCalendario();
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
    } border-r border-b border-indigo-200 transition-all duration-300 hover:bg-indigo-50 cursor-pointer`;
    
    if (isOutsideMonth) {
        container.classList.add('border-r', 'border-b');
    }
    
    // Añadir clase para esquinas redondeadas
    const calendarGrid = document.getElementById('calendarGrid');
    const cellIndex = Array.from(calendarGrid.children).length;
    
    if (cellIndex === 0) container.classList.add('rounded-tl-xl');
    if (cellIndex === 6) container.classList.add('rounded-tr-xl');
    if (cellIndex >= 35 && cellIndex < 41) container.classList.add('rounded-bl-xl');
    if (cellIndex === 41) container.classList.add('rounded-br-xl');
    
    // Número del día
    const daySpan = document.createElement('span');
    daySpan.className = `text-xs font-semibold ${isOutsideMonth ? 'text-gray-400' : 'text-gray-900'}`;
    daySpan.textContent = day;
    container.appendChild(daySpan);
    
    // Actividades del día
    const activitiesContainer = document.createElement('div');
    activitiesContainer.className = 'flex flex-col gap-1 mt-1';
    
    if (!isOutsideMonth) {
        const actividadesDelDia = obtener_actividades_del_dia(date);
        
        actividadesDelDia.slice(0, 2).forEach(actividad => {
            const badge = document.createElement('span');
            badge.className = 'text-xs font-medium px-2 py-1 rounded truncate bg-indigo-100 text-indigo-700';
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
    const fechaFormato = fecha.toISOString().split('T')[0];
    
    return allActividades.filter(actividad => {
        if (!actividad.fecha_entrega) return false;
        
        const actividadFecha = new Date(actividad.fecha_entrega).toISOString().split('T')[0];
        return actividadFecha === fechaFormato && actividad.estatus === 'pendiente';
    });
}

// - - - EVENTOS PRÓXIMOS - - -

function mostrar_eventos_proximos() {
    const hoy = new Date();
    const unaSemanaDespues = new Date(hoy.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    // Filtrar actividades de la próxima semana
    const eventosPróximos = allActividades
        .filter(actividad => {
            if (!actividad.fecha_entrega) return false;
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
        mensaje.innerHTML = '<p class="text-gray-600">No hay actividades próximas en los próximos 7 días</p>';
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
            badge.className = 'evento-badge px-2 py-1 text-xs font-medium rounded-lg bg-purple-100 text-purple-700';
            element.querySelector('.evento-color').className = 'w-2.5 h-2.5 rounded-full bg-purple-600 evento-color';
        } else {
            badge.textContent = 'Individual';
            badge.className = 'evento-badge px-2 py-1 text-xs font-medium rounded-lg bg-blue-100 text-blue-700';
            element.querySelector('.evento-color').className = 'w-2.5 h-2.5 rounded-full bg-blue-600 evento-color';
        }
        
        const firstChild = element.querySelector('div');
        eventosContainer.appendChild(firstChild);
    });
}

// - - - NAVEGACIÓN DE MESES - - -

function previousMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    generarCalendario();
}

function nextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    generarCalendario();
}

// - - - CIERRE DE SESIÓN - - -

function cerrar_sesion() {
    window.location.href = 'index.html';
    sessionStorage.clear();
}

// - - - INICIALIZACIÓN - - -

document.addEventListener('DOMContentLoaded', cargar_datos_calendario);

