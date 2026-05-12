// - - - ID DE LA MATERIA - - -

const params = new URLSearchParams(window.location.search);
const id = params.get("id");

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

        // Si no devuelve nada, hacer return
        if (!actividades || actividades.length === 0) {
            return;
        }

         console.log(actividades);

        const contenedor = document.getElementById('contenedorActividades');
        
        // Para cada actividad
        actividades.forEach((actividad, index) => {
            const indice = index + 2;
            
            // Usar generar_actividad para que se muestren con DOM
            const nuevoArticle = generar_actividad(indice);
            
            // Guardar el id de la actividad en un atributo data
            nuevoArticle.dataset.actividadId = actividad.id;
            
            // Insertar nombre en id="tituloTarea{indice}"
            nuevoArticle.querySelector(`#tituloTarea${indice}`).textContent = actividad.nombre;
            
            // Si importancia está en [0-33]: Baja, [34-66]: Media, [67-100]: Alta
            let importancia = 'Baja';
            if (actividad.importancia !== null) {
                if (actividad.importancia >= 67) {
                    importancia = 'Alta';
                } else if (actividad.importancia >= 34) {
                    importancia = 'Media';
                }
            }
            
            // Insertar en id="badgeImportancia{indice}"
            const badgeImportancia = nuevoArticle.querySelector(`#badgeImportancia${indice}`);
            badgeImportancia.textContent = importancia;
            
            // Cambiar colores del badge según importancia
            badgeImportancia.classList.remove('text-amber-700', 'bg-amber-400/20');
            if (importancia === 'Alta') {
                badgeImportancia.classList.add('text-red-700', 'bg-red-400/20');
            } else if (importancia === 'Media') {
                badgeImportancia.classList.add('text-amber-700', 'bg-amber-400/20');
            } else {
                badgeImportancia.classList.add('text-green-700', 'bg-green-400/20');
            }
            
            // Insertar fecha_entrega en formato 00/00/0000 en id="fechaEntrega{indice}"
            if (actividad.fecha_entrega) {
                const fecha = new Date(actividad.fecha_entrega);
                const fechaFormato = `${String(fecha.getDate()).padStart(2, '0')}/${String(fecha.getMonth() + 1).padStart(2, '0')}/${fecha.getFullYear()}`;
                nuevoArticle.querySelector(`#fechaEntrega${indice}`).textContent = fechaFormato;
            }
            
            // Insertar descripción entre comillas en id="descripcionActividad{indice}"
            const descripcion = nuevoArticle.querySelector(`#descripcionActividad${indice}`);
            descripcion.textContent = `"${actividad.descripcion || ''}"`;
            
            // Insertar estatus en id="estadoActividad{indice}"
            const select = nuevoArticle.querySelector(`#estadoActividad${indice}`);
            select.value = actividad.estatus;
            
            // Quitar atributos de clase en id="guardar_cambiosAct{indice}" y id="eliminarAct{indice}"
            const guardarBtn = nuevoArticle.querySelector(`#guardar_cambiosAct${indice}`);
            const eliminarBtn = nuevoArticle.querySelector(`#eliminarAct${indice}`);
            
            guardarBtn.classList.remove('opacity-50', 'cursor-not-allowed', 'pointer-events-none');
            eliminarBtn.classList.remove('opacity-50', 'cursor-not-allowed', 'pointer-events-none');
            
            // Agregar al contenedor
            contenedor.appendChild(nuevoArticle);
        });

    } catch (error) {
        console.error('Error de conexión:', error);
    }
}

// - - - FUNCIONES FETCH - - -

async function guardarActividad(indice) {
    try {
        // Obtener el elemento de la actividad
        const contenedor = document.getElementById(`contenedorDetalle${indice}`);
        const actividadId = contenedor.dataset.actividadId;
        
        // Obtener el nuevo estado
        const select = document.getElementById(`estadoActividad${indice}`);
        const nuevoEstatus = select.value;

        console.log('ID:', actividadId);

        // Realizar PATCH
        const response = await fetch(`https://sgea.onrender.com/actividad/${actividadId}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem('access_token')}`
            },
            body: JSON.stringify({ estatus: nuevoEstatus })
        });
        
        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        console.log(`Actividad ${actividadId} actualizada a estado: ${nuevoEstatus}`);
        alert('Estado actualizado correctamente.');

        window.location.href = `view_activities.html?id=${id}`;
        
    } catch (error) {
        console.error('Error al guardar actividad:', error);
        alert('Error al guardar los cambios. Intenta de nuevo.');
    }
}

async function eliminarActividad(indice) {
    try {
        // Obtener el elemento de la actividad
        const contenedor = document.getElementById(`contenedorDetalle${indice}`);
        const actividadId = contenedor.dataset.actividadId;
        
        // Confirmar eliminación
        const confirmar = confirm('¿Estás seguro de que deseas eliminar esta actividad?');
        if (!confirmar) {
            return;
        }
        
        // Realizar DELETE
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
        
        console.log(`Actividad ${actividadId} eliminada`);
        alert('Actividad eliminada correctamente.');
        
        window.location.href = `view_activities.html?id=${id}`;
        
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
            ...(equipo && { equipo_asignado: equipo })
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

        window.location.href = `view_activities.html?id=${id}`;

    } catch (error) {
        console.error('Error al crear actividad:', error);
        alert('Error al crear la actividad. Intenta de nuevo.');
    }
}

// - - - FUNCIONES DE DOM - - -

function generar_actividad(indice) {
    // Clonamos el elemento template
    const template = document.getElementById('contenedorDetalle1');
    const clon = template.cloneNode(true);
    
    // Actualizamos los IDs del clon con el nuevo índice
    clon.id = `contenedorDetalle${indice}`;
    
    // Actualizamos los IDs de los elementos secundarios
    const tituloTarea = clon.querySelector('#tituloTarea1');
    tituloTarea.id = `tituloTarea${indice}`;
    
    const badgeImportancia = clon.querySelector('#badgeImportancia1');
    badgeImportancia.id = `badgeImportancia${indice}`;
    
    const fechaEntrega = clon.querySelector('#fechaEntrega1');
    fechaEntrega.id = `fechaEntrega${indice}`;
    
    const descripcionActividad = clon.querySelector('#descripcionActividad1');
    descripcionActividad.id = `descripcionActividad${indice}`;
    
    const estadoActividad = clon.querySelector('#estadoActividad1');
    estadoActividad.id = `estadoActividad${indice}`;
    
    const guardarBtn = clon.querySelector('#guardar_cambiosAct');
    guardarBtn.id = `guardar_cambiosAct${indice}`;
    guardarBtn.onclick = function() { guardarActividad(indice); };
    
    const eliminarBtn = clon.querySelector('#eliminarAct');
    eliminarBtn.id = `eliminarAct${indice}`;
    eliminarBtn.onclick = function() { eliminarActividad(indice); };
    
    return clon;
}

// - - - FUNCION CREAR ACTIVIDAD - - -

// - - - FUNCIONES DE ENLACES - - -

function cerrar_sesion() {
    window.location.href = 'index.html';
    sessionStorage.clear()
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