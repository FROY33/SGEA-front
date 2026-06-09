// - - - ID DE LA MATERIA - - -

const params = new URLSearchParams(window.location.search);
const id = params.get("id");
let equipo_id;

// - - - LÓGICA DEL TAB MODAL - - -

const tabs = document.querySelectorAll('.tab');

const vistas = {
    editar: document.getElementById('vista-editar'),
    rubrica: document.getElementById('vista-rubrica'),
    equipo: document.getElementById('vista-equipo')
};

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const tipo = tab.dataset.tab;

        Object.values(vistas).forEach(v => v.classList.add('hidden'));
        vistas[tipo].classList.remove('hidden');

        tabs.forEach(t => t.classList.remove('text-gray-900', 'border-b-2'));
        tab.classList.add('text-gray-900', 'border-b-2');
    });
});

// - - - CARGAR DATOS - - -

let rubrica_flag = false; // Bandera para saber si hay rubrica
let rubrica_materia = []; // Guardar rúbricas
let rubricas_eliminadas = []; // Rubricas eliminadas

async function cargar_datos_rubrica() {
    try {
        const response = await fetch(`https://sgea.onrender.com/rubricas/materia/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem('access_token')}`
            }
        });

        rubrica_materia = await response.json();

        // Reiniciar variables
        rubricas_eliminadas = [];
        rubrica_flag = false;

        rubricasCount = 1;

        // Párrafo donde se mostrará la rúbrica
        const textoRubrica = document.getElementById('texto_rubrica');
        let textoHTML = `<p class="mb-2 text-gray-500">Rúbrica de evaluación</p>`;

        // Si no hay rúbricas
        if (!rubrica_materia || rubrica_materia.length === 0) {
            return;
        }

        // Limpiar contenedor
        const container = document.getElementById('rubrica-lines-container');
        container.innerHTML = '';
        rubrica_flag = true;

        // Crear líneas
        rubrica_materia.forEach((rubrica) => {
            add_rubrica();

            // Inputs
            const tipoInput = document.getElementById(`tipo_actividad${rubricasCount}`);
            const porcentajeInput = document.getElementById(`porcentaje${rubricasCount}`);

            // Insertar datos
            tipoInput.value = rubrica.tipo_actividad;
            porcentajeInput.value = rubrica.porcentaje;

            // Guardar id de BD en el DOM
            tipoInput.dataset.rubricaId = rubrica.id;
            porcentajeInput.dataset.rubricaId = rubrica.id;

            // Agregar al texto del párrafo
            textoHTML += `${rubrica.tipo_actividad}: ${rubrica.porcentaje}%<br>`;
        });

        textoRubrica.innerHTML = textoHTML;

    } catch (error) {
        console.error('Error de conexión:', error);
    }
}

let equipo_flag = false; // Bandera para saber si hay equipo
let equipo_data = null; // Guardar equipo
let integrantes_eliminados = []; // Integrantes eliminados

async function cargar_datos_equipo() {
    try {
        const response = await fetch(`https://sgea.onrender.com/equipos/materia/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem('access_token')}`
            }
        });

        data = await response.json();

        // Reiniciar variables
        integrantes_eliminados = [];
        equipo_flag = false;

        integrantesCount = 1;

        // Si no hay equipo
        if (!data || data.length === 0) {
            return;
        }

        equipo_data = data[0];

        equipo_id = equipo_data.id;

        // Limpiar contenedor
        const container = document.getElementById('integrantes-lines-container');
        container.innerHTML = '';
        equipo_flag = true;

        // Nombre del equipo
        const nombreEquipoInput = document.getElementById('nombre_equipo');
        nombreEquipoInput.value = equipo_data.nombre;

        // Deshabilitar nombre
        nombreEquipoInput.disabled = true;

        // Mostrar integrantes
        equipo_data.miembros_equipo.forEach((miembro) => {
            add_integrante();

            const emailInput = document.getElementById(`email_integrante${integrantesCount}`);

            // Insertar email
            emailInput.value = miembro.email_miembro;

            // Guardar usuarioId en dataset
            emailInput.dataset.usuarioId = miembro.usuario_id;

            // Deshabilitar edición
            emailInput.disabled = true;
        });

    } catch (error) {
        console.error('Error al cargar equipo:', error);
    }
}

async function cargar_datos_materia() {
    if (id === "materia_ejemplo") {
        // Materia de ejemplo
        document.getElementById('texto_rubrica').textContent = "Aqui se mostrará la rubrica de evaluación";
        deshabilitarBoton("btnEditar");
        deshabilitarBoton("btnActividades");
        deshabilitarBoton("btnEliminar");

        const enlace_actividades = document.getElementById('actividades_enlace');
        enlace_actividades.classList.add('cursor-not-allowed');
        enlace_actividades.removeAttribute("onclick");
        enlace_actividades.classList.remove("cursor-pointer");
    } else {
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
            document.querySelectorAll(".materia_nombre").forEach((elemento) => {
                elemento.textContent = materia.nombre;
            });

            // Cargar datos en el modal
            document.getElementById('nombre_materia').value = materia.nombre;
            document.getElementById('calificacion_profesor').value = materia.calificacion_profesor;
            document.getElementById('dificultad_examenes').value = materia.dificultad;
            document.getElementById('autonomia_percibida').value = materia.autonomia;

            await cargar_datos_equipo();
            await cargar_datos_rubrica();

            document.getElementById('loading').classList.add("hidden");
            document.getElementById('titulo_materia').classList.replace("hidden", "flex");
            document.getElementById('texto_rubrica').classList.remove("hidden");

        } catch (error) {
            console.error('Error de conexión:', error);
        }
    }
}

// - - - FUNCIONES FETCH - - -

async function eliminar_materia() {
    const btnEliminar = document.getElementById('btnEliminar_emergente');

    btnEliminar.disabled = true;
    btnEliminar.textContent = 'Eliminando...';

    try {
        const response = await fetch(`https://sgea.onrender.com/materias/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem('access_token')}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al eliminar la materia');
        }

        window.location.href = 'subjects.html';

    } catch (error) {
        console.error('Error de conexión:', error);
    }
}

async function update_materia(event) {
    event.preventDefault();

    // Obtener valores del formulario
    const nombreMateria = document.getElementById('nombre_materia').value;
    const calificacionProfesor = document.getElementById('calificacion_profesor').value ? parseInt(document.getElementById('calificacion_profesor').value) : 3;
    const dificultadExamenes = document.getElementById('dificultad_examenes').value ? parseInt(document.getElementById('dificultad_examenes').value) : 3;
    const autonomiaPercibida = document.getElementById('autonomia_percibida').value ? parseInt(document.getElementById('autonomia_percibida').value) : 3;

    // Validaciones
    if (!nombreMateria) {
        return;
    }

    const btnActualizar = document.getElementById('btnActualizar');

    // Cambiar estado del botón
    btnActualizar.disabled = true;
    btnActualizar.innerHTML = '<svg class="mr-1 -ml-1 w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd"></path></svg>Actualizando...'


    try {
        const response = await fetch(`https://sgea.onrender.com/materias/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem('access_token')}`
            },
            body: JSON.stringify({
                nombre: nombreMateria,
                calificacion_profesor: calificacionProfesor,
                dificultad: dificultadExamenes,
                autonomia: autonomiaPercibida
            })
        });

        const materia = await response.json();

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al actualizar la materia');
        }

        await cargar_datos_materia()
        ocultarEditar()

        // Cambiar estado del botón
        btnActualizar.disabled = true;
        btnActualizar.innerHTML = '<svg class="mr-1 -ml-1 w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd"></path></svg>Actualizar materia'

    } catch (error) {
        console.error('Error de conexión:', error);
    }
}

async function save_rubrica(event) {
    event.preventDefault();

    const saveBtn = document.getElementById('guardar_rubrica_btn');

    // Funciones Fetch
    try {
        const rubricas_actuales = [];
        let sum = 0;

        // Obtener todas las líneas existentes
        const lineas = document.querySelectorAll('[id^="rubrica-line-"]');

        lineas.forEach((linea) => {
            const tipoInput = linea.querySelector('[name="tipo_actividad"]');
            const porcentajeInput = linea.querySelector('[name="porcentaje"]');

            sum += Number(porcentajeInput.value);

            rubricas_actuales.push({
                id: tipoInput.dataset.rubricaId || null,
                materia_id: id,
                tipo_actividad: tipoInput.value,
                porcentaje: Number(porcentajeInput.value)
            });
        });

        if(sum !== 100) {
            alert('La suma de los porcentajes debe ser exactamente 100');
            return;
        }

        // Cambiar estado del botón
        saveBtn.disabled = true;
        saveBtn.textContent = 'Guardando...';

        // =========================================
        // CASO 1 -> NO EXISTEN RUBRICAS
        // =========================================

        if (!rubrica_flag) {
            for (const rubrica of rubricas_actuales) {
                await fetch(`https://sgea.onrender.com/rubricas`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${sessionStorage.getItem('access_token')}`
                    },
                    body: JSON.stringify({
                        materia_id: rubrica.materia_id,
                        tipo_actividad: rubrica.tipo_actividad,
                        porcentaje: rubrica.porcentaje
                    })
                });
            }
        } else {
            // =========================================
            // CASO 2 y 3 -> YA EXISTEN
            // =========================================

            // -------------------------------------
            // UPDATE O CREATE
            // -------------------------------------

            for (const rubrica of rubricas_actuales) {
                if (rubrica.id) { // UPDATE
                    await fetch(`https://sgea.onrender.com/rubricas/${rubrica.id}`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${sessionStorage.getItem('access_token')}`
                        },
                        body: JSON.stringify({
                            materia_id: rubrica.materia_id,
                            tipo_actividad: rubrica.tipo_actividad,
                            porcentaje: rubrica.porcentaje
                        })
                    });
                } else { // CREATE
                    await fetch(`https://sgea.onrender.com/rubricas`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${sessionStorage.getItem('access_token')}`
                        },
                        body: JSON.stringify({
                            materia_id: rubrica.materia_id,
                            tipo_actividad: rubrica.tipo_actividad,
                            porcentaje: rubrica.porcentaje
                        })
                    });
                }
            }

            // -------------------------------------
            // DELETE
            // -------------------------------------

            for (const rubricaId of rubricas_eliminadas) {
                await fetch(`https://sgea.onrender.com/rubricas/${rubricaId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${sessionStorage.getItem('access_token')}`
                    }
                });
            }
        }

        // Recargar datos
        await cargar_datos_rubrica();

        // Cambiar estado del botón
        saveBtn.disabled = false;
        saveBtn.textContent = 'Guardar';

        ocultarEditar();

    } catch (error) {
        console.error('Error al guardar rúbricas:', error);
    }
}

async function save_equipo(event) {
    event.preventDefault();

    const saveBtn = document.getElementById('guardar_equipo_btn');

    try {
        // Obtener nombre del equipo
        const nombre_equipo = document.getElementById('nombre_equipo').value;

        // Validación
        if (!nombre_equipo) {
            return;
        }

        // Cambiar estado del botón
        saveBtn.disabled = true;
        saveBtn.textContent = 'Guardando...';

        // Obtener integrantes actuales
        const integrantes_actuales = [];
        const lineas = document.querySelectorAll('[id^="integrante-line-"]');

        lineas.forEach((linea) => {

            const emailInput = linea.querySelector('[name="email_integrante"]');

            integrantes_actuales.push({
                usuarioId: emailInput.dataset.usuarioId || null,
                email_miembro: emailInput.value
            });
        });


        // =========================================
        // CASO 1 -> PRIMERA VEZ
        // =========================================

        if (!equipo_flag) {
            await fetch(`https://sgea.onrender.com/equipos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem('access_token')}`
                },
                body: JSON.stringify({
                    materia_id: id,
                    nombre: nombre_equipo,
                    miembros: integrantes_actuales.map(integrante => ({
                        email_miembro: integrante.email_miembro
                    }))
                })
            });
        } else {

            // =========================================
            // CASO 2 y 3 -> YA EXISTE EQUIPO
            // =========================================

            const equipoId = equipo_data.id;

            // -------------------------------------
            // AÑADIR NUEVOS MIEMBROS
            // -------------------------------------

            for (const integrante of integrantes_actuales) {
                // Si NO tiene usuarioId => es nuevo
                if (!integrante.usuarioId) {
                    await fetch(`https://sgea.onrender.com/equipos/${equipoId}/miembros`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${sessionStorage.getItem('access_token')}`
                        },
                        body: JSON.stringify({
                            email_miembro: integrante.email_miembro
                        })
                    });
                }
            }

            // -------------------------------------
            // ELIMINAR MIEMBROS
            // -------------------------------------

            for (const usuarioId of integrantes_eliminados) {
                await fetch(`https://sgea.onrender.com/equipos/${equipoId}/miembros/${usuarioId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${sessionStorage.getItem('access_token')}`
                    }
                });
            }
        }

        // Recargar datos
        await cargar_datos_equipo();

        // Cambiar estado del botón
        saveBtn.disabled = false;
        saveBtn.textContent = 'Guardar';

        ocultarEditar();

    } catch (error) {
        console.error('Error al guardar equipo:', error);
    }
}

// - - - FUNCIONES DOM PARA AÑADIR INTEGRANTE Y RUBRICA - - -

// Contadores para las líneas dinámicas
let rubricasCount = 1;

// Función para añadir una nueva línea de rúbrica
function add_rubrica() {
    rubricasCount++;
    
    const container = document.getElementById('rubrica-lines-container');
    
    const div = document.createElement('div');
    div.id = `rubrica-line-${rubricasCount}`;
    div.className = 'grid gap-4 mb-4 grid-cols-[1fr_1fr_auto]';
    
    div.innerHTML = `
        <div class="w-full">
            <label for="tipo_actividad${rubricasCount}" class="block mb-2 text-sm font-medium text-gray-900">Tipo de actividad</label>
            <input type="text" name="tipo_actividad" id="tipo_actividad${rubricasCount}" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5" placeholder="Tipo de actividad" required="">
        </div>
        <div class="w-full">
            <label for="porcentaje${rubricasCount}" class="block mb-2 text-sm font-medium text-gray-900">Porcentaje (0 - 100)</label>
            <input type="number" name="porcentaje" id="porcentaje${rubricasCount}" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5" placeholder="Porcentaje de la actividad" required="">
        </div>
        <div class="w-full flex items-center">
            <button type="button" onclick="borrar_linea_actividad(${rubricasCount})" class="bg-red-100 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center hover:bg-red-200 text-gray-900">
                <svg aria-hidden="true" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
            </button>
        </div>
    `;
    
    container.appendChild(div);
}

// Función para borrar una línea de rúbrica
function borrar_linea_actividad(lineNumber) {
    const container = document.getElementById('rubrica-lines-container');
    const lines = container.querySelectorAll('[id^="rubrica-line-"]');

    // Debe existir al menos una línea
    if (lines.length <= 1) {
        alert('Debe haber al menos un tipo de actividad');
        return;
    }

    const lineElement = document.getElementById(`rubrica-line-${lineNumber}`);

    if (lineElement) {
        // Obtener id real de la rúbrica
        const tipoInput = lineElement.querySelector('[name="tipo_actividad"]');
        const rubricaId = tipoInput.dataset.rubricaId;

        // Si existía en BD, marcar para eliminar
        if (rubricaId) {
            rubricas_eliminadas.push(rubricaId);
        }

        lineElement.remove();
    }
}

let integrantesCount = 1;

// Función para añadir una nueva línea de integrante
function add_integrante() {
    integrantesCount++;
    
    const container = document.getElementById('integrantes-lines-container');
    
    const div = document.createElement('div');
    div.id = `integrante-line-${integrantesCount}`;
    div.className = 'grid gap-4 mb-4 grid-cols-[1fr_auto]';
    
    div.innerHTML = `
        <div class="w-full">
            <label for="email_integrante${integrantesCount}" class="block mb-2 text-sm font-medium text-gray-900">Email del integrante (en minúsculas)</label>
            <input type="email" name="email_integrante" id="email_integrante${integrantesCount}" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5" placeholder="Email del integrante" required="">
        </div>
        <div class="w-full flex items-center">
            <button type="button" onclick="borrar_linea_integrante(${integrantesCount})" class="bg-red-100 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center hover:bg-red-200 text-gray-900">
                <svg aria-hidden="true" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
            </button>
        </div>
    `;
    
    container.appendChild(div);
}

// Función para borrar una línea de integrante
function borrar_linea_integrante(lineNumber) {
    const container = document.getElementById('integrantes-lines-container');
    const lines = container.querySelectorAll('[id^="integrante-line-"]');

    // Debe existir al menos una línea
    if (lines.length <= 1) {
        alert('Debe haber al menos un integrante (además de usted)');
        return;
    }

    const lineElement = document.getElementById(`integrante-line-${lineNumber}`);

    if (lineElement) {
        const emailInput = lineElement.querySelector('[name="email_integrante"]');
        const usuarioId = emailInput.dataset.usuarioId;

        // Si era miembro existente, guardar para delete
        if (usuarioId) {
            integrantes_eliminados.push(usuarioId);
        }

        lineElement.remove();
    }
}

// - - - FUNCIONES DE ENLACES - - -

function abrir_actividades() {
    if (!rubrica_flag) {
        alert('Debes agregar la rúbrica de evaluación antes de empezar a crear actividades');
        return;
    }

    window.location.href = `view_activities.html?id=${id}&equipo=${equipo_id}`;
}

function cerrar_sesion() {
    window.location.href = 'index.html';
    sessionStorage.clear()
}

function mostrarEliminar() {
    const divBorrar = document.getElementById('deleteModal');
    divBorrar.style.display="flex";
    document.body.style.overflow = "hidden";
}

function ocultarEliminar() {
    const divBorrar = document.getElementById('deleteModal');
    divBorrar.style.display="none";
    document.body.style.overflow = "auto";
}

function mostrarEditar() {
    const divEditar = document.getElementById('divEditarMateria');
    divEditar.style.display="flex";
    document.body.style.overflow = "hidden";
}

function ocultarEditar() {
    const divEditar = document.getElementById('divEditarMateria');
    divEditar.style.display="none";
    document.body.style.overflow = "auto";
}

function deshabilitarBoton(id) {
    const boton = document.getElementById(id);

    boton.style.pointerEvents = "none"; // evita clicks
    boton.style.opacity = "0.5"; // apariencia deshabilitada
    boton.style.cursor = "not-allowed";

    boton.removeAttribute("onclick");
    boton.removeAttribute("href");
}

// Cargar datos cuando se carga la página
document.addEventListener('DOMContentLoaded', cargar_datos_materia);