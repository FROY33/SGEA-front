// - - - ID DE LA MATERIA - - -
const params = new URLSearchParams(window.location.search);
const id = params.get("id");
const equipoID = params.get("equipo");

// - - - ESTADO GLOBAL - - -
const actividadesEstado = {}; // { actividadId: { indice, estatus_actual, estatus_original } }
let contadorIndices = 0;

// - - - CARGAR DATOS - - -
async function cargar_datos_materia() {
    try {
        const response = await fetch(`https://sgea.onrender.com/materias/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem('access_token')}`
            }
        });

        const materia = await response.json();

        // Cargar nombre de la materia en el titulo
        document.getElementById('materia').textContent = materia.nombre;

        await cargar_rubricas_select();
        await cargar_actividades();

        document.querySelectorAll(".loading").forEach((elemento) => {
            elemento.classList.add("hidden");
        });

        document.getElementById('info_actividad').classList.replace("hidden", "flex");
        document.getElementById('actividades_pendientes').classList.replace("hidden", "flex");
        document.getElementById('actividades_progreso').classList.replace("hidden", "flex");
        document.getElementById('actividades_completadas').classList.replace("hidden", "flex");

    } catch (error) {
        console.error('Error de conexión:', error);
    }
}

async function cargar_rubricas_select() {
    try {
        const response = await fetch(`https://sgea.onrender.com/rubricas/materia/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem('access_token')}`
            }
        });

        const rubrica_materia = await response.json();

        if (!rubrica_materia || rubrica_materia.length === 0) {
            return;
        }

        const select = document.getElementById('tipoActividad');

        // Limpiar opciones anteriores
        select.innerHTML = '';

        rubrica_materia.forEach((rubrica) => {
            const option = document.createElement('option');

            option.value = rubrica.tipo_actividad;
            option.textContent = rubrica.tipo_actividad;

            select.appendChild(option);
        });

    } catch (error) {
        console.error('Error al cargar equipo:', error);
    }
}

async function cargar_actividades() {
    try {
        const response = await fetch(`https://sgea.onrender.com/actividad/materia/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem('access_token')}`
            }
        });

        const actividades = await response.json();

        if (!actividades || actividades.length === 0) {
            actualizar_contadores();
            return;
        }

        // Limpiar los contenedores
        document.getElementById('actividades_pendientes').innerHTML = '';
        document.getElementById('actividades_progreso').innerHTML = '';
        document.getElementById('actividades_completadas').innerHTML = '';

        // Distribuir actividades por estado
        actividades.forEach((actividad) => {
            contadorIndices++;
            const indice = contadorIndices;

            // Crear elemento de actividad
            const article = crear_actividad(indice, actividad);

            // Guardar en estado global
            actividadesEstado[actividad.id] = {
                indice: indice,
                estatus_actual: actividad.estatus,
                estatus_original: actividad.estatus,
                id_elemento: `actividad_${indice}`
            };

            // Añadir a la columna correspondiente
            let contenedor;
            if (actividad.estatus === 'pendiente') {
                contenedor = document.getElementById('actividades_pendientes');
            } else if (actividad.estatus === 'en_progreso') {
                contenedor = document.getElementById('actividades_progreso');
            } else if (actividad.estatus === 'completada') {
                contenedor = document.getElementById('actividades_completadas');
            }

            if (contenedor) {
                contenedor.appendChild(article);
            }
        });

        actualizar_contadores();
        configurar_drag_drop();

    } catch (error) {
        console.error('Error de conexión:', error);
    }
}

// - - - CREAR ELEMENTO DE ACTIVIDAD - - -
function crear_actividad(indice, actividad) {
    const template = document.getElementById('template_actividad');
    const article = template.querySelector('article').cloneNode(true);

    // Asignar ID único
    article.id = `actividad_${indice}`;
    article.dataset.actividadId = actividad.id;
    article.dataset.estatus = actividad.estatus;

    // Actualizar contenido
    article.querySelector('.titulo').textContent = actividad.nombre;

    // Importancia y badge
    let importancia = 'Baja';
    let colorClases = 'text-green-700 bg-green-400/20';

    if (actividad.importancia !== null) {
        if (actividad.importancia >= 67) {
            importancia = 'Alta';
            colorClases = 'text-red-700 bg-red-400/20';
        } else if (actividad.importancia >= 34) {
            importancia = 'Media';
            colorClases = 'text-amber-700 bg-amber-400/20';
        }
    }

    const badge = article.querySelector('.badge');
    badge.textContent = importancia;
    badge.className = `badge text-xs font-bold rounded-lg px-3 py-1.25 ${colorClases}`;

    // Fecha
    if (actividad.fecha_entrega) {
        const fecha = new Date(actividad.fecha_entrega);
        const fechaFormato = `${String(fecha.getDate()).padStart(2, '0')}/${String(fecha.getMonth() + 1).padStart(2, '0')}/${fecha.getFullYear()}`;
        article.querySelector('.fecha').textContent = fechaFormato;
    }

    // Descripción
    const descripcion = article.querySelector('.descripcion');
    descripcion.textContent = `"${actividad.descripcion || ''}"`;

    // Botón eliminar
    const btnEliminar = article.querySelector('.btn-eliminar');
    btnEliminar.onclick = () => mostrarEliminar(actividad.id);

    return article;
}

// - - - ACTUALIZAR CONTADORES - - -
function actualizar_contadores() {
    const pendientes = document.getElementById('actividades_pendientes').children.length;
    const progreso = document.getElementById('actividades_progreso').children.length;
    const completadas = document.getElementById('actividades_completadas').children.length;

    document.getElementById('numero_pendientes').textContent = pendientes;
    document.getElementById('numero_progreso').textContent = progreso;
    document.getElementById('numero_completadas').textContent = completadas;
}

// - - - DRAG & DROP - - -
function configurar_drag_drop() {
    const articles = document.querySelectorAll('article[data-actividad-id]');
    const dropZones = [
        document.getElementById('actividades_pendientes'),
        document.getElementById('actividades_progreso'),
        document.getElementById('actividades_completadas')
    ];

    articles.forEach(article => {
        article.addEventListener('dragstart', handleDragStart);
        article.addEventListener('dragend', handleDragEnd);
    });

    dropZones.forEach(zone => {
        zone.addEventListener('dragover', handleDragOver);
        zone.addEventListener('drop', handleDrop);
        zone.addEventListener('dragenter', handleDragEnter);
        zone.addEventListener('dragleave', handleDragLeave);
    });
}

let draggedElement = null;

function handleDragStart(e) {
    draggedElement = this;
    this.style.opacity = '0.5';
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragEnd(e) {
    draggedElement = null;
    this.style.opacity = '1';
    
    // Limpiar clases de drop zones
    document.querySelectorAll('[id^="actividades_"]').forEach(zone => {
        zone.classList.remove('bg-blue-50', 'border-2', 'border-blue-300');
    });
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    return false;
}

function handleDragEnter(e) {
    if (this.id.startsWith('actividades_')) {
        this.classList.add('bg-blue-50', 'border-2', 'border-blue-300');
    }
}

function handleDragLeave(e) {
    if (e.target === this) {
        this.classList.remove('bg-blue-50', 'border-2', 'border-blue-300');
    }
}

function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }

    const dropZone = this;

    if (draggedElement && draggedElement !== this) {
        // Determinar nuevo estatus según la zona de drop
        let nuevoEstatus = '';
        
        if (dropZone.id === 'actividades_pendientes') {
            nuevoEstatus = 'pendiente';
        } else if (dropZone.id === 'actividades_progreso') {
            nuevoEstatus = 'en_progreso';
        } else if (dropZone.id === 'actividades_completadas') {
            nuevoEstatus = 'completada';
        }

        // Mover elemento
        dropZone.appendChild(draggedElement);

        // Actualizar estado global
        const actividadId = draggedElement.dataset.actividadId;
        if (actividadesEstado[actividadId]) {
            actividadesEstado[actividadId].estatus_actual = nuevoEstatus;
        }

        draggedElement.dataset.estatus = nuevoEstatus;

        // Actualizar contadores
        actualizar_contadores();
    }

    dropZone.classList.remove('bg-blue-50', 'border-2', 'border-blue-300');
    return false;
}

// - - - FUNCIONES FETCH - - -

async function guardarActividades() {

    const btnGuardar = document.getElementById('btnGuardar_cambios');

    try {
        // Filtrar actividades que fueron modificadas
        const actividadesModificadas = Object.entries(actividadesEstado)
            .filter(([_, datos]) => datos.estatus_actual !== datos.estatus_original)
            .map(([actividadId, datos]) => ({
                id: actividadId,
                estatus: datos.estatus_actual
            }));

        if (actividadesModificadas.length === 0) {
            alert('No hay cambios para guardar.');
            return;
        }

        btnGuardar.disabled = true;
        btnGuardar.textContent = 'Guardando...';

        // Actualizar cada actividad modificada
        for (const actividad of actividadesModificadas) {
            const response = await fetch(`https://sgea.onrender.com/actividad/${actividad.id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem('access_token')}`
                },
                body: JSON.stringify({ estatus: actividad.estatus })
            });

            if (!response.ok) {
                throw new Error(`Error actualizando actividad ${actividad.id}: ${response.statusText}`);
            }

            // Actualizar el estado original
            actividadesEstado[actividad.id].estatus_original = actividad.estatus;
        }

        window.location.href = `view_activities.html?id=${id}&equipo=${equipoID}`;

    } catch (error) {
        console.error('Error al guardar actividades:', error);
        alert('Error al guardar los cambios. Intenta de nuevo.');
    }
}

async function eliminarActividad(actividadId) {
    try {
        const response = await fetch(`https://sgea.onrender.com/actividad/${actividadId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem('access_token')}`
            }
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        window.location.href = `view_activities.html?id=${id}&equipo=${equipoID}`;

    } catch (error) {
        console.error('Error al eliminar actividad:', error);
        alert('Error al eliminar la actividad. Intenta de nuevo.');
    }
}

async function crearActividad(e) {
    e.preventDefault();

    const btnCrear = document.getElementById('btnCrear');

    try {
        // Extraer valores del formulario
        const nombre = document.getElementById('nombre').value.trim();
        const tipo = document.getElementById('tipoActividad').value.trim();
        const fecha = document.getElementById('fecha').value;
        const dificultad = document.getElementById('dificultad').value ? parseInt(document.getElementById('dificultad').value) : undefined;
        const tiempo = document.getElementById('tiempo').value.trim();
        const calificacion = document.getElementById('calificacion').value.trim();
        const equipo = document.getElementById('equipo').value.trim();

        let equipo_id;

        if (equipo == "equipo") {
            equipo_id = params.get("equipo");
        }

        const descripcion = document.getElementById('descripcion').value.trim();

        // Extraer usuario_id del token JWT
        const token = sessionStorage.getItem('access_token');
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        const usuario_id = decodedToken.sub;

        if (!nombre || !tipo || !fecha) {
            return;
        }

        btnCrear.disabled = true;
        btnCrear.textContent = 'Espere...';

        // Mapear calificacion a puntaje_contenido
        let puntaje_contenido = undefined;
        if (calificacion) {
            const mapeo = {
                'util': 'Muy útil',
                'interesante': 'Interesante',
                'irrelevante': 'Poco relevante'
            };
            puntaje_contenido = mapeo[calificacion];
        }

        // Parsear tiempo estimado (convertir a número si es posible)
        let tiempo_estimado = undefined;
        if (tiempo) {
            const numeroTiempo = parseFloat(tiempo);
            if (!isNaN(numeroTiempo)) {
                tiempo_estimado = numeroTiempo;
            }
        }

        // Construir objeto DTO
        const actividadData = {
            materia_id: id,
            usuario_id: usuario_id,
            nombre: nombre,
            tipo: tipo,
            fecha_entrega: fecha,
            ...(dificultad && { dificultad }),
            ...(puntaje_contenido && { puntaje_contenido }),
            ...(descripcion && { descripcion }),
            ...(tiempo_estimado && { tiempo_estimado }),
            ...(equipo_id && { equipoId: equipo_id })
        };

        // Realizar POST
        const response = await fetch('https://sgea.onrender.com/actividad', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem('access_token')}`
            },
            body: JSON.stringify(actividadData)
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        const nuevaActividad = await response.json();

        // Limpiar formulario
        document.querySelector('form').reset();

        window.location.href = `view_activities.html?id=${id}&equipo=${equipoID}`;

    } catch (error) {
        console.error('Error al crear actividad:', error);
        alert('Error al crear la actividad. Intenta de nuevo.');
    }
}

function cerrar_sesion() {
    window.location.href = 'index.html';
    sessionStorage.clear()
}

function mostrarEliminar(id) {
    const divBorrar = document.getElementById('deleteModal');

    const btnEliminar = document.getElementById('btnEliminar_emergente');
    btnEliminar.onclick = () => eliminarActividad(id);

    divBorrar.style.display="flex";
    document.body.style.overflow = "hidden";
}

function ocultarEliminar() {
    const divBorrar = document.getElementById('deleteModal');
    divBorrar.style.display="none";
    document.body.style.overflow = "auto";
}

function mostrarActividad() {
    const divCrear = document.getElementById('divCrearActividad');
    divCrear.style.display="flex";
    document.body.style.overflow = "hidden";
}

function ocultarActividad() {
    const divCrear = document.getElementById('divCrearActividad');
    divCrear.style.display="none";
    document.body.style.overflow = "auto";
}


function volver_materia() {
    window.location.href = `subjects_details.html?id=${id}`;
}

// Cargar datos cuando se carga la página
document.addEventListener('DOMContentLoaded', cargar_datos_materia);