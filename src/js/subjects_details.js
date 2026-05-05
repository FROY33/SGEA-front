// - - - ID DE LA MATERIA - - -

const params = new URLSearchParams(window.location.search);
const id = params.get("id");

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

let rubrica = false; // Bandera para saber si hay rubrica

async function cargar_datos_rubrica() {
    
}

let equipo = false; // Bandera para saber si hay equipo

async function cargar_datos_equipo() {
    
}

async function cargar_datos_materia() {
    if (id === "materia_ejemplo") {
        // Materia de ejemplo
        document.getElementById('texto_rubrica').textContent = "Aqui se mostrará la rubrica de evaluación e información sobre tu equipo";
        deshabilitarBoton("btnEditar");
        deshabilitarBoton("btnActividades");
        deshabilitarBoton("btnEliminar");
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
            document.getElementById('materia').textContent = materia.nombre;

            // Cargar datos en el modal
            document.getElementById('nombre_materia').value = materia.nombre;
            document.getElementById('calificacion_profesor').value = materia.calificacion_profesor;
            document.getElementById('dificultad_examenes').value = materia.dificultad;
            document.getElementById('autonomia_percibida').value = materia.autonomia;

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
        alert('Materia eliminada correctamente.');

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

        cargar_datos_materia()
        ocultarEditar()

    } catch (error) {
        console.error('Error de conexión:', error);
    }
}

async function save_rubrica() {

}

async function save_equipo() {
    // Obtener valores del formulario
    const nombre_equipo = document.getElementById('nombre_equipo').value;

    // Validaciones
    if (!nombre_equipo) {
        return;
    }
}

// - - - FUNCIONES DOM PARA AÑADIR INTEGRANTE Y RUBRICA - - -

// Contadores para las líneas dinámicas
let rubricsCount = 1;
let integrantesCount = 1;

// Función para añadir una nueva línea de rúbrica
function add_rubrica() {
    rubricsCount++;
    
    const container = document.getElementById('rubrica-lines-container');
    
    const div = document.createElement('div');
    div.id = `rubrica-line-${rubricsCount}`;
    div.className = 'grid gap-4 mb-4 grid-cols-[1fr_1fr_auto]';
    
    div.innerHTML = `
        <div class="w-full">
            <label for="tipo_actividad${rubricsCount}" class="block mb-2 text-sm font-medium text-gray-900">Tipo de actividad</label>
            <input type="text" name="tipo_actividad" id="tipo_actividad${rubricsCount}" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5" placeholder="Tipo de actividad" required="">
        </div>
        <div class="w-full">
            <label for="porcentaje${rubricsCount}" class="block mb-2 text-sm font-medium text-gray-900">Porcentaje (0 - 100)</label>
            <input type="number" name="porcentaje" id="porcentaje${rubricsCount}" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5" placeholder="Porcentaje de la actividad" required="">
        </div>
        <div class="w-full flex items-center">
            <button type="button" onclick="borrar_linea_actividad(${rubricsCount})" class="bg-red-100 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center hover:bg-red-200 text-gray-900">
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
    
    // Validar que siempre haya al menos una línea
    if (lines.length <= 1) {
        alert('Debe haber al menos un tipo de actividad');
        return;
    }
    
    const lineElement = document.getElementById(`rubrica-line-${lineNumber}`);
    if (lineElement) {
        lineElement.remove();
    }
}

// Función para añadir una nueva línea de integrante
function add_integrante() {
    integrantesCount++;
    
    const container = document.getElementById('integrantes-lines-container');
    
    const div = document.createElement('div');
    div.id = `integrante-line-${integrantesCount}`;
    div.className = 'grid gap-4 mb-4 grid-cols-[1fr_1fr_auto]';
    
    div.innerHTML = `
        <div class="w-full">
            <label for="nombre_integrante${integrantesCount}" class="block mb-2 text-sm font-medium text-gray-900">Nombre del integrante</label>
            <input type="text" name="nombre_integrante" id="nombre_integrante${integrantesCount}" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5" placeholder="Nombre del integrante" required="">
        </div>
        <div class="w-full">
            <label for="email_integrante${integrantesCount}" class="block mb-2 text-sm font-medium text-gray-900">Email del integrante</label>
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
    
    // Validar que siempre haya al menos una línea
    if (lines.length <= 1) {
        alert('Debe haber al menos un integrante (además de usted)');
        return;
    }
    
    const lineElement = document.getElementById(`integrante-line-${lineNumber}`);
    if (lineElement) {
        lineElement.remove();
    }
}

// - - - FUNCIONES DE ENLACES - - -

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

// Cargar materias cuando se carga la página
document.addEventListener('DOMContentLoaded', cargar_datos_materia);