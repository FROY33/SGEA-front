// - - - ID DE EL EQUIPO - - -

const params = new URLSearchParams(window.location.search);
const id = params.get("id");
const materiaId = params.get("materia");

// - - - ESTADO GLOBAL - - -
let contadorIndices = 0;
let equipoActualGlobal = null;

// - - - CONTROL DE SUBTAREAS - - -
let subtareas_actuales_id = null; // ID de la actividad actual
let subtareas_flag = false; // Bandera para saber si hay subtareas
let subtareas_eliminadas = []; // Subtareas eliminadas

// - - - CARGAR DATOS - - - 

async function crear_actividad(indice, actividad) {
    const template = document.getElementById('template_actividad');
    const article = template.querySelector('article').cloneNode(true);
    const section = template.querySelector('section').cloneNode(true);

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

    if (actividad.estatus == "completada") {
        article.querySelector('.estatus').textContent = "Completada";
    } else if (actividad.estatus == "en_progreso") {
        article.querySelector('.estatus').textContent = "En progreso";
    } else {
        article.querySelector('.estatus').textContent = "Pendiente";
    }

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
    const btnCrear = article.querySelector('.btn-crear');
    btnCrear.onclick = () => mostrarSubtareas(actividad.id);

    // Cargar subtareas
    try {
        const response = await fetch(`https://sgea.onrender.com/actividad/${actividad.id}/subtareas`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem('access_token')}`
            }
        });

        const subtareas = await response.json();

        const form = section.querySelector('form');
        const subtareasContainer = form.querySelectorAll('.flex.items-start.my-2');

        // Limpiar subtareas de ejemplo
        subtareasContainer.forEach(el => el.remove());

        // Si hay subtareas, agregarlas
        if (subtareas && subtareas.length > 0) {
            subtareas.forEach((subtarea, index) => {
                const miembro = equipoActualGlobal.miembros_equipo.find(m => m.usuario_id == subtarea.asignado_a);

                let checked = '';

                if (subtarea.completado) {
                    checked = 'checked';
                }

                const div = document.createElement('div');
                div.className = 'flex items-start my-2';

                div.innerHTML = `
                    <div class="flex items-center h-5">
                        <input id="subtarea_${actividad.id}_${index}" type="checkbox" ${checked} class="w-4 h-4 border border-gray-300 rounded bg-gray-50">
                    </div>
                    <div class="ml-3 text-sm">
                        <label for="subtarea_${actividad.id}_${index}" class="text-gray-500">${subtarea.nombre} (${miembro.nombre_miembro})</label>
                    </div>
                `;

                form.appendChild(div);
            });

            const button_guardarCambios = document.createElement('button');
            button_guardarCambios.type = 'button';
            button_guardarCambios.id = `btnGuardar${actividad.id}`;
            button_guardarCambios.className = 'mt-auto py-2.5 px-4 flex w-full justify-center border cursor-pointer text-gray-900 bg-gray-50 border-gray-300 hover:bg-gray-300 font-medium rounded-lg text-sm';
            button_guardarCambios.textContent = 'Guardar cambios';

            button_guardarCambios.onclick = () => check_subtareas(actividad.id, subtareas);

            form.appendChild(button_guardarCambios);

        } else {
            // Si no hay subtareas, mostrar mensaje
            const mensajeDiv = document.createElement('div');
            mensajeDiv.className = 'text-center py-4';
            mensajeDiv.innerHTML = '<p class="text-gray-500 font-light">Aún no hay subtareas</p>';
            form.appendChild(mensajeDiv);
        }

    } catch (error) {
        console.error('Error al cargar las subtareas:', error);

        const form = section.querySelector('form');
        const subtareasContainer = form.querySelectorAll('.flex.items-start.my-2');
        subtareasContainer.forEach(el => el.remove());
    }

    // Retornar fragment con ambos elementos
    const fragment = document.createElement('div');
    fragment.classList.add('hidden', 'flex-col', 'lg:flex-row', 'items-stretch', 'div_actividad');
    fragment.appendChild(article);
    fragment.appendChild(section);
    
    return fragment;
}

async function cargar_actividades() {
    try {
        const response = await fetch(`https://sgea.onrender.com/actividad/equipo/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem('access_token')}`
            }
        });

        const data = await response.json();

        const contenedor = document.getElementById('contenedorActividades');

        // Si no hay actividades, mostrar el mensaje
        if (!data || data.length === 0) {
            document.getElementById('actividadesPendientes').classList.remove('hidden');

            const divFlag = document.getElementById('flag_actividadesPendientes');
            divFlag.classList.remove('sm:mb-16');
            divFlag.classList.replace('mb-8', 'mb-2');

            return;
        }

        // Cargar todas las actividades
        for (const actividad of data) {
            contadorIndices++;
            const indice = contadorIndices;

            // Crear elemento de actividad (ahora es async)
            const fragment = await crear_actividad(indice, actividad);

            contenedor.appendChild(fragment);
        }

    } catch (error) {
        console.error('Error al cargar el perfil:', error);
    }
}

async function cargar_ne_equipo() {
    try {
        const response = await fetch(`https://sgea.onrender.com/equipos/${id}/nivel-estres`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem('access_token')}`
            }
        });

        const data = await response.json();

        // Insertar texto
        document.getElementById("ne_equipo").textContent = `Nivel de estrés del equipo: ${data.categoria_equipo}`;

        const contenedor_ne = document.getElementById('contenedor_ne_equipo');

        let colorBarra = 'bg-green-500';

        if (data.ne_equipo >= 70) {
            colorBarra = 'bg-red-500';
        } else if (data.ne_equipo >= 40) {
            colorBarra = 'bg-yellow-400';
        }

        // Contenedor principal
        const container = document.createElement('div');
        container.id = 'barraNEContainer';
        container.className = `
            flex items-center gap-3
            bg-white/90 backdrop-blur-md
            border border-gray-200
            shadow-sm rounded-2xl
            px-4 py-3
        `;

        // Texto "NE"
        const texto = document.createElement('span');
        texto.textContent = 'NE';
        texto.className = 'font-bold text-gray-900';

        // Fondo de la barra
        const barraFondo = document.createElement('div');
        barraFondo.className = `
            w-44 h-4
            bg-gray-200
            rounded-full
            overflow-hidden
        `;

        // Barra de progreso
        const barra = document.createElement('div');
        barra.className = `
            h-full rounded-full
            transition-all duration-500
            ${colorBarra}
        `;
        barra.style.width = `${data.ne_equipo}%`;

        // Ensamblar
        barraFondo.appendChild(barra);
        container.appendChild(texto);
        container.appendChild(barraFondo);

        contenedor_ne.appendChild(container);

    } catch (error) {
        console.error('Error al cargar el perfil:', error);
    }
}

async function cargar_equipo() {
    try {
        const response = await fetch(`https://sgea.onrender.com/equipos/materia/${materiaId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem('access_token')}`
            }
        });

        const data = await response.json();

        document.getElementById('nombre_equipo').textContent = `Equipo: ${data[0].nombre}`;
        document.getElementById("nombre_materia").textContent = `Materia: ${data[0].materias.nombre}`;

        // Contenedor
        const contenedor = document.getElementById("integrantes_equipo");

        // Limpiar contenido anterior
        contenedor.innerHTML = "";

        // Buscar el equipo actual usando el id enviado por URL
        const equipoActual = data.find(equipo => equipo.id === id);

        if (!equipoActual) {
            console.error("Equipo no encontrado");
            return;
        }

        // Guardar en variable global
        equipoActualGlobal = equipoActual;

        // Crear integrantes
        for (const [index, miembro] of equipoActual.miembros_equipo.entries()) {

            const avatar = await obtener_avatar(miembro.usuario_id);
            const integrante = document.createElement("div");

            integrante.className =
                "flex justify-left items-center";

            integrante.innerHTML = `
                <img class="w-10 h-10 mr-4 rounded-full" src="${avatar}">
                <p class="font-light text-lg hidden md:block text-gray-500">${miembro.nombre_miembro}</p>
            `;

            contenedor.appendChild(integrante);
        }

        // Llenar selects de miembros
        llenarSelectMiembros(equipoActual);

        await cargar_ne_equipo();
        await cargar_actividades();

        document.querySelectorAll(".loading").forEach((elemento) => {
            elemento.classList.add("hidden");
        });

        document.querySelectorAll(".div_actividad").forEach((elemento) => {
            elemento.classList.replace("hidden", "flex");
        });

        document.querySelectorAll(".info_equipo").forEach((elemento) => {
            elemento.classList.remove("hidden");
        });

    } catch (error) {
        console.error('Error al cargar el perfil:', error);
    }
}

// - - - FUNCIONES AUXILIARES - - -

function llenarSelectMiembros(equipoActual) {
    // Obtener todos los selects de miembros
    const selects = document.querySelectorAll('select[name="miembro"]');
    
    selects.forEach(select => {
        // Limpiar opciones existentes excepto la primera
        while (select.options.length >= 1) {
            select.remove(1);
        }
        
        // Agregar miembros como opciones
        if (equipoActual && equipoActual.miembros_equipo) {
            equipoActual.miembros_equipo.forEach(miembro => {
                const option = document.createElement('option');
                option.value = miembro.usuario_id;
                option.textContent = miembro.nombre_miembro;
                select.appendChild(option);
            });
        }
    });
}

// - - - FUNCIONES FETCH - - -

async function check_subtareas(actividad_id, subtareas) {

    const btnGuardar = document.getElementById(`btnGuardar${actividad_id}`);

    // Cambiar estado del botón
    btnGuardar.disabled = true;
    btnGuardar.textContent = 'Guardando...';

    try {
        // Iterar sobre todas las subtareas
        for (let index = 0; index < subtareas.length; index++) {
            const subtarea = subtareas[index];
            
            // Obtener el input checkbox correspondiente
            const checkbox = document.getElementById(`subtarea_${actividad_id}_${index}`);
            
            if (checkbox) {
                const completado = checkbox.checked;
                
                // Hacer PATCH a la API
                await fetch(`https://sgea.onrender.com/actividad/${actividad_id}/subtareas/${subtarea.id}/completado`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${sessionStorage.getItem('access_token')}`
                    },
                    body: JSON.stringify({
                        completado: completado
                    })
                });
            }
        }

        alert('Cambios guardados con éxito.');

        btnGuardar.disabled = false;
        btnGuardar.textContent = 'Guardar cambios';

    } catch (error) {
        console.error('Error al actualizar subtareas:', error);
    }
}

async function save_subtarea(id_actividad) {
    const saveBtn = document.getElementById('guardar_subtarea_btn');

    try {
        const subtareas_actuales = [];

        // Obtener todas las líneas existentes
        const lineas = document.querySelectorAll('[id^="subtarea-line-"]');

        lineas.forEach((linea) => {
            const nombreInput = linea.querySelector('[name="nombre"]');
            const miembroInput = linea.querySelector('[name="miembro"]');
            const tiempoInput = linea.querySelector('[name="tiempo"]');

            if (nombreInput.value && miembroInput.value && tiempoInput.value) {
                subtareas_actuales.push({
                    id: nombreInput.dataset.subtareaId || null,
                    nombre: nombreInput.value,
                    usuario_id: miembroInput.value,
                    tiempo_estimado: Number(tiempoInput.value)
                });
            }
        });

        // Cambiar estado del botón
        saveBtn.disabled = true;
        saveBtn.textContent = 'Guardando...';

        // =========================================
        // CASO 1 -> NO EXISTEN SUBTAREAS
        // =========================================

        if (!subtareas_flag) {
            for (const subtarea of subtareas_actuales) {
                await fetch(`https://sgea.onrender.com/actividad/${id_actividad}/subtareas`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${sessionStorage.getItem('access_token')}`
                    },
                    body: JSON.stringify({
                        nombre: subtarea.nombre,
                        asignado_a: subtarea.usuario_id,
                        horas_estimadas: subtarea.tiempo_estimado
                    })
                });
            }
        } else {
            // =========================================
            // CASO 2 y 3 -> YA EXISTEN SUBTAREAS
            // =========================================

            // -------------------------------------
            // UPDATE O CREATE
            // -------------------------------------

            for (const subtarea of subtareas_actuales) {
                if (subtarea.id) { // UPDATE
                    await fetch(`https://sgea.onrender.com/actividad/${id_actividad}/subtareas/${subtarea.id}`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${sessionStorage.getItem('access_token')}`
                        },
                        body: JSON.stringify({
                            nombre: subtarea.nombre,
                            asignado_a: subtarea.usuario_id,
                            horas_estimadas: subtarea.tiempo_estimado
                        })
                    });
                } else { // CREATE
                    await fetch(`https://sgea.onrender.com/actividad/${id_actividad}/subtareas`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${sessionStorage.getItem('access_token')}`
                        },
                        body: JSON.stringify({
                            nombre: subtarea.nombre,
                            asignado_a: subtarea.usuario_id,
                            horas_estimadas: subtarea.tiempo_estimado
                        })
                    });
                }
            }

            // -------------------------------------
            // DELETE
            // -------------------------------------

            for (const subtareaId of subtareas_eliminadas) {
                await fetch(`https://sgea.onrender.com/actividad/${id_actividad}/subtareas/${subtareaId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${sessionStorage.getItem('access_token')}`
                    }
                });
            }
        }

        setTimeout(() => {
            window.location.href = `teams_details.html?id=${id}&materia=${materiaId}`;
        }, "500");

    } catch (error) {
        console.error('Error al guardar subtareas:', error);
        alert('Ocurrio un error al guardar las subtareas, recuerde llenar todos los campos.');
    }
}


async function obtener_avatar(id_usuario) {
    try {
        const response = await fetch(`https://sgea.onrender.com/perfil/avatar/${id_usuario}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${sessionStorage.getItem('access_token')}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();

        return data.avatar_url;

    } catch (error) {
        console.error('Error al cargar el perfil:', error);
    }
}

async function calificar_equipo() {
    try {
        const valor = document.querySelector('input[name="inline-radio-group"]:checked')?.value;

        if (!valor) {
            alert('Seleccione una calificación.');
            return;
        }

        const btnCalificar = document.getElementById('btnCalificar');

        btnCalificar.disabled = true;
        btnCalificar.textContent = 'Guardando...';

        const response = await fetch(`https://sgea.onrender.com/equipos/${id}/calificar`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${sessionStorage.getItem('access_token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                satisfaccion: parseInt(valor)
            })
        });

        const data = await response.json();

        btnCalificar.disabled = false;
        btnCalificar.textContent = 'Guardar';

        ocultarCalificar();

    } catch (error) {
        console.error('Error al cargar el perfil:', error);
    } 
}

// - - - FUNCIONES DOM PARA AÑADIR SUBTAREAS - - -

// Contadores para las líneas dinámicas
let subtareasCount = 1;

// Función para añadir una nueva línea de subtarea
function add_subtarea() {
    subtareasCount++;
    
    const container = document.getElementById('subtareas-lines-container');
    
    const div = document.createElement('div');
    div.id = `subtarea-line-${subtareasCount}`;
    div.className = 'grid gap-4 mb-4 grid-cols-[1fr_1fr_1fr_auto]';
    
    div.innerHTML = `
        <div class="w-full">
            <label for="nombre${subtareasCount}" class="block mb-2 text-sm font-medium text-gray-900">Nombre:</label>
            <input type="text" name="nombre" id="nombre${subtareasCount}" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5" placeholder="Nombre de la subtarea" required="">
        </div>
        <div class="w-full">
            <label for="miembro${subtareasCount}" class="block mb-2 text-sm font-medium text-gray-900">Miembro asignado:</label>
            <select id="miembro${subtareasCount}" name="miembro" class="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg block text-sm w-full p-3">
            </select>
        </div>
        <div class="w-full">
            <label for="tiempo${subtareasCount}" class="block mb-2 text-sm font-medium text-gray-900">Tiempo estimado:</label>
            <input type="number" name="tiempo" id="tiempo${subtareasCount}" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5" placeholder="Tiempo en horas" required="">
        </div>
        <div class="w-full flex items-center">
            <button type="button" onclick="borrar_linea_subtarea(${subtareasCount})" class="bg-red-100 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center hover:bg-red-200 text-gray-900">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
            </button>
        </div>
    `;
    
    container.appendChild(div);
    
    // Llenar el nuevo select con los miembros
    if (equipoActualGlobal) {
        const selectNuevo = div.querySelector('select[name="miembro"]');
        if (equipoActualGlobal.miembros_equipo) {
            equipoActualGlobal.miembros_equipo.forEach(miembro => {
                const option = document.createElement('option');
                option.value = miembro.usuario_id;
                option.textContent = miembro.nombre_miembro;
                selectNuevo.appendChild(option);
            });
        }
    }
}

// Función para borrar una línea de subtarea
function borrar_linea_subtarea(lineNumber) {
    const container = document.getElementById('subtareas-lines-container');
    const lines = container.querySelectorAll('[id^="subtarea-line-"]');

    const lineElement = document.getElementById(`subtarea-line-${lineNumber}`);

    // Debe existir al menos una línea
    if (lines.length <= 1) {
        const nombreInput = lineElement.querySelector('[name="nombre"]');
        nombreInput.value = '';

        lineElement.querySelector('[name="tiempo"]').value = '';
        lineElement.querySelector('[name="miembro"]').selectedIndex = 0;


        const subtareaId = nombreInput.dataset.subtareaId;
        subtareas_eliminadas.push(subtareaId);

        nombreInput.dataset.subtareaId = null;

        return;
    }
    
    if (lineElement) {
        // Obtener id real de la subtarea
        const nombreInput = lineElement.querySelector('[name="nombre"]');
        const subtareaId = nombreInput.dataset.subtareaId;

        // Si existía en BD, marcar para eliminar
        if (subtareaId) {
            subtareas_eliminadas.push(subtareaId);
        }

        lineElement.remove();
    }
}

// - - - FUNCIONES DE ENLACES - - -

function cerrar_sesion() {
    window.location.href = 'index.html';
    sessionStorage.clear()
}

async function mostrarSubtareas(id) {
    const divSubtareas = document.getElementById('divSubtareas');

    // Resetear variables de control
    subtareas_actuales_id = id;
    subtareas_flag = false;
    subtareas_eliminadas = [];

    // Limpiar contenedor de subtareas
    const container = document.getElementById('subtareas-lines-container');
    const lineas = container.querySelectorAll('[id^="subtarea-line-"]');
    
    // Dejar solo la primera línea
    lineas.forEach((linea, index) => {
        if (index > 0) {
            linea.remove();
        } else {
            // Limpiar inputs de la primera línea
            linea.querySelector('[name="nombre"]').value = '';
            linea.querySelector('[name="tiempo"]').value = '';
            linea.querySelector('[name="nombre"]').dataset.subtareaId = null;
        }
    });

    // Resetear contador
    subtareasCount = 1;

    // Cargar subtareas existentes
    try {
        const response = await fetch(`https://sgea.onrender.com/actividad/${id}/subtareas`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem('access_token')}`
            }
        });

        const subtareas = await response.json();

        if (subtareas && subtareas.length > 0) {
            subtareas_flag = true;

            // Llenar la primera línea con la primera subtarea
            const primerSubtarea = subtareas[0];
            const primerLinea = container.querySelector('[id="subtarea-line-1"]');
            
            primerLinea.querySelector('[name="nombre"]').value = primerSubtarea.nombre;
            primerLinea.querySelector('[name="miembro"]').value = primerSubtarea.asignado_a;
            primerLinea.querySelector('[name="tiempo"]').value = primerSubtarea.horas_estimadas;
            primerLinea.querySelector('[name="nombre"]').dataset.subtareaId = primerSubtarea.id;

            // Agregar las demás subtareas
            for (let i = 1; i < subtareas.length; i++) {
                add_subtarea();
                
                const linea = container.querySelector(`[id="subtarea-line-${subtareasCount}"]`);
                const subtarea = subtareas[i];

                linea.querySelector('[name="nombre"]').value = subtarea.nombre;
                linea.querySelector('[name="miembro"]').value = subtarea.asignado_a;
                linea.querySelector('[name="tiempo"]').value = subtarea.horas_estimadas;
                linea.querySelector('[name="nombre"]').dataset.subtareaId = subtarea.id;
            }
        }

    } catch (error) {
        console.error('Error al cargar las subtareas:', error);
    }

    const btnGuardar = document.getElementById('guardar_subtarea_btn');
    btnGuardar.onclick = () => save_subtarea(id);

    divSubtareas.style.display="flex";
    document.body.style.overflow = "hidden";
}


function ocultarSubtareas() {
    const divSubtareas = document.getElementById('divSubtareas');
    divSubtareas.style.display="none";
    document.body.style.overflow = "auto";
}

function mostrarCalificar() {
    const divCal = document.getElementById('calificarModal');
    divCal.style.display="flex";
    document.body.style.overflow = "hidden";
}

function ocultarCalificar() {
    const divCal = document.getElementById('calificarModal');
    divCal.style.display="none";
    document.body.style.overflow = "auto";
}

// Cargar datos cuando se carga la página
document.addEventListener('DOMContentLoaded', cargar_equipo);