const spanNombre = document.getElementById('nombreUsuario');
spanNombre.textContent = sessionStorage.getItem('user_name');

const crearMateriaBtn = document.querySelector('button[onclick="save_materia()"]');

document.getElementById("contenedorMaterias").addEventListener("click", function(e) {
  
  const enlace = e.target.closest("a");
  if (!enlace) return;

  e.preventDefault();

  const article = enlace.closest("article");
  const id = article.id;

  window.location.href = `subjects_details.html?id=${id}`;
});

// Cargar avatar desde el endpoint
async function cargarAvatar() {
    try {
        const response = await fetch('https://sgea.onrender.com/perfil', {
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

        if (data.avatar_url) {
            document.querySelectorAll('.avatarUsuario').forEach(img => {
                img.src = data.avatar_url;
            });
        }

    } catch (error) {
        console.error('Error al cargar el perfil:', error);
    }
}

// Cargar materias al abrir la página
async function cargarMaterias() {

    document.getElementById('contenedorMaterias').classList.add("hidden");
    document.getElementById('loading').classList.replace("hidden", "grid");

    try {
        const response = await fetch('https://sgea.onrender.com/materias', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem('access_token')}`
            }
        });

        const materias = await response.json();

        let calidad_docente_prom = 0, autonomia_prom = 0;

        materias.forEach(materia => {
            calidad_docente_prom += materia.calificacion_profesor;
            autonomia_prom += materia.autonomia;
        });

        if (materias != "") {
            document.getElementById('materia_ejemplo').classList.add("hidden");
        }

        if (response.ok && Array.isArray(materias)) {
            for (const materia of materias) {

                // Cambiado a let para poder asignarle valor dentro del try
                let actividades = []; 

                // Para mostrar si hay actividades pendientes
                try {
                    const response = await fetch(`https://sgea.onrender.com/actividad/materia/${materia.id}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${sessionStorage.getItem('access_token')}`
                        }
                    });

                    if (!response.ok) {
                        throw new Error(`Error: ${response.status}`);
                    }

                    const todasLasActividades = await response.json();

                    // FILTRO: Guarda solo los elementos con estatus 'pendiente'
                    actividades = todasLasActividades.filter(act => act.estatus === 'pendiente' || act.estatus === 'en_progreso');

                } catch (error) {
                    console.error('Error de conexión:', error);
                }

                renderizarMateria(materia, actividades);
            }
        } else {
            console.error('Error al obtener materias');
        }

        factor1 = 5 - calidad_docente_prom/materias.length;
        factor8 = 5 - autonomia_prom/materias.length;

        const payload = {
            factores: [
                { factor_id: 1, peso: factor1 },
                { factor_id: 8, peso: factor8 }
            ]
        };

        try {
            const response = await fetch('https://sgea.onrender.com/perfil/estresores', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem('access_token')}`
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            console.log(data)
            
        } catch (error) {
            console.error('Error de conexión:', error);
        }

        await cargarAvatar();

        document.getElementById('loading').classList.add("hidden");
        document.getElementById('contenedorMaterias').classList.remove("hidden");


    } catch (error) {
        console.error('Error de conexión:', error);
    }
}

function renderizarMateria(materia, actividades) {
    const nuevoArticle = document.createElement('article');
    nuevoArticle.id = materia.id;
    nuevoArticle.className = 'p-6 bg-white rounded-lg border border-gray-200 shadow-md max-w-xl';
    nuevoArticle.innerHTML = `
        <div class="flex justify-between items-center mb-5 text-gray-500">
            <span class="bg-gray-100 text-gray-800 text-xs font-medium inline-flex items-center px-2.5 py-0.5 rounded">Materia</span>
        </div>
        <h2 class="mb-2 text-2xl font-bold tracking-tight text-gray-900"><a href="subjects_details.html">${materia.nombre}</a></h2>
        <p class="mb-5 font-light text-gray-500">${ actividades.length === 0 ? 'No tienes actividades pendientes.' : 'Tienes ' + actividades.length + ' actividades pendientes.'}</p>
        <div class="flex justify-between items-center">
            <div class="flex items-center space-x-4">
                <img class="avatarUsuario w-7 h-7 rounded-full" src="assets/user_avatar.png" alt="User Avatar"/>
                <span class="font-medium">${sessionStorage.getItem('user_name')}</span>
            </div>
            <a href="subjects_details.html" class="inline-flex items-center font-medium text-gray-800 hover:underline">
                Detalles<svg class="ml-2 w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
            </a>
        </div>
    `;

    document.getElementById('contenedorMaterias').appendChild(nuevoArticle);
}

function mostrarCrear() {
    const divCrear = document.getElementById('divCrearMateria');
    divCrear.style.display="flex";
    document.body.style.overflow = "hidden";
}

function ocultarCrear() {
    const divCrear = document.getElementById('divCrearMateria');
    divCrear.style.display="none";
    document.body.style.overflow = "auto";
}

async function save_materia() {
    // Obtener valores del formulario
    const nombreMateria = document.getElementById('nombre_materia').value;
    const calificacionProfesor = document.getElementById('calificacion_profesor').value ? parseInt(document.getElementById('calificacion_profesor').value) : 3;
    const dificultadExamenes = document.getElementById('dificultad_examenes').value ? parseInt(document.getElementById('dificultad_examenes').value) : 3;
    const autonomiaPercibida = document.getElementById('autonomia_percibida').value ? parseInt(document.getElementById('autonomia_percibida').value) : 3;

    // Validaciones
    if (!nombreMateria) {
        return;
    }

    // Cambiar estado del botón
    crearMateriaBtn.disabled = true;
    crearMateriaBtn.innerHTML = '<svg class="mr-1 -ml-1 w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd"></path></svg>Creando...';

    try {
        const response = await fetch('https://sgea.onrender.com/materias', {
            method: 'POST',
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

        const data = await response.json();

        if (response.ok) {
            // Limpiar el formulario
            document.getElementById('nombre_materia').value = '';
            document.getElementById('calificacion_profesor').value = 'Selecciona una opción';
            document.getElementById('dificultad_examenes').value = 'Selecciona una opción';
            document.getElementById('autonomia_percibida').value = 'Selecciona una opción';

            // Ocultar el modal
            ocultarCrear();

            setTimeout(() => {
                window.location.href = 'subjects.html';
            }, "500");

        } else {
            alert('Error al crear la materia: ' + (data.message || 'Error desconocido'));
        }
    } catch (error) {
        alert('Error de conexión. Intenta nuevamente.');
        console.error('Error:', error);
    } finally {
        // Restaurar estado del botón
        crearMateriaBtn.disabled = false;
        crearMateriaBtn.innerHTML = '<svg class="mr-1 -ml-1 w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd"></path></svg>Crear materia';
    }
}

function cerrar_sesion() {
    window.location.href = 'index.html';
    sessionStorage.clear()
}

// Cargar materias cuando se carga la página
document.addEventListener('DOMContentLoaded', cargarMaterias);