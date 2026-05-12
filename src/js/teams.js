// - - - REDIRECCIÓN A DETALLES DEL EQUIPO - - -

document.getElementById("contenedorEquipos").addEventListener("click", function(e) {

    const enlace = e.target.closest("a");
    if (!enlace) return;

    e.preventDefault();

    const article = enlace.closest("article");
    if (!article) return;

    // Obtener el id real del equipo
    const equipoId = article.dataset.id;
    const materiaId = article.dataset.materiaId;

    // Enviar ambos parámetros
    window.location.href = `teams_details.html?id=${equipoId}&materia=${materiaId}`;
});

// - - - CARGAR DATOS - - -

function crear_article_equipo(equipo, index) {
    const contenedor = document.getElementById('contenedorEquipos');

    // Obtener nombres de integrantes
    const nombresIntegrantes = equipo.miembros_equipo
        .map(miembro => miembro.nombre_miembro)
        .join(', ');

    // Contenedor de avatares
    let avatarsHTML = '';

    // Mostrar máximo 3 imágenes
    const maxAvatares = 3;
    const miembrosMostrar = equipo.miembros_equipo.slice(0, maxAvatares);

    miembrosMostrar.forEach((miembro, i) => {
        avatarsHTML += `
            <img 
                class="w-10 h-10 rounded-full ${i === 0 ? 'avatar_usuarioMain' : ''}" 
                src="assets/user_avatar.png"
                alt="${miembro.nombre_miembro}"
            >
        `;
    });

    // Si hay más de 3 integrantes
    if (equipo.miembros_equipo.length > maxAvatares) {
        const faltantes = equipo.miembros_equipo.length - maxAvatares;

        avatarsHTML += `
            <a class="flex items-center justify-center w-10 h-10 text-xs font-medium text-gray-500 border border-gray-300 bg-gray-100 rounded-full">
                +${faltantes}
            </a>
        `;
    }

    // Crear article
    const article = document.createElement('article');
    article.id = `equipo${index}`;

    // ID real del equipo y materia
    article.dataset.id = equipo.id;
    article.dataset.materiaId = equipo.materia_id;

    article.className = 'flex';

    article.innerHTML = `
        <div class="rounded-l-lg bg-white py-4 pl-4 pr-6 mt-8 shadow-md">
            <div class="flex justify-between items-center mb-5 text-gray-500">
                <span class="bg-gray-100 text-gray-800 text-xs font-medium inline-flex items-center px-2.5 py-0.5 rounded">
                    Equipo
                </span>
            </div>

            <h2 class="mb-2 text-2xl font-bold tracking-tight text-gray-900">
                <a href="teams_details.html">
                    Equipo <span id="nombre_equipo${index}">${equipo.nombre}</span>
                </a>
            </h2>

            <div class="flex flex-wrap items-center gap-y-4 border-b border-gray-200 pb-4 md:pb-5"></div>

            <p class="mt-2 font-light text-gray-500">
                Integrantes:
                <span id="integrantes_equipo${index}">
                    ${nombresIntegrantes}
                </span>
            </p>

            <div class="mt-6 mb-2">
                <div class="flex -space-x-4 rtl:space-x-reverse">
                    ${avatarsHTML}
                </div>
            </div>
        </div>

        <div class="flex items-center rounded-r-lg bg-gray-100 mt-8 shadow-md">
            <a href="teams_details.html" class="rotate-270 text-gray-400 hover:text-gray-500">
                Ver detalles
            </a>
        </div>
    `;

    contenedor.appendChild(article);
}

async function cargar_equipos() { // Devuelve arreglo de equipos
    try {
        const response = await fetch(`https://sgea.onrender.com/equipos/mis-equipos`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem('access_token')}`
            }
        });

        const data = await response.json();

        console.log(data);

        // El article ejemplo ya ocupa el índice 1
        // Los reales inician en 2
        let index = 2;

        data.forEach((equipo) => {
            crear_article_equipo(equipo, index);
            index++;
        });

        await obtener_avatar();

    } catch (error) {
        console.error('Error al cargar equipo:', error);
    }
}

// - - - FUNCIONES FETCH - - -

async function obtener_avatar() {
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
            const avatares = document.querySelectorAll('.avatar_usuarioMain');
            if (data.avatar_url && avatares.length > 0) {
                avatares.forEach(img => {
                    img.src = data.avatar_url;
                });
            }
        }

    } catch (error) {
        console.error('Error al cargar el perfil:', error);
    }
}

// - - - FUNCIONES DE ENLACES - - -

function cerrar_sesion() {
    window.location.href = 'index.html';
    sessionStorage.clear()
}

// Cargar datos cuando se carga la página
document.addEventListener('DOMContentLoaded', cargar_equipos);