// - - - ID DE EL EQUIPO - - -

const params = new URLSearchParams(window.location.search);
const id = params.get("id");
const materiaId = params.get("materia");

// - - - CARGAR DATOS - - - 

async function cargar_materia() {
    try {
        const response = await fetch(`https://sgea.onrender.com/materias/${materiaId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem('access_token')}`
            }
        });

        const data = await response.json();

        // Insertar nombre de materia
        document.getElementById("nombre_materia").textContent = `Materia: ${data.nombre}`;

    } catch (error) {
        console.error('Error al cargar el perfil:', error);
    }
}

async function cargar_ne() {
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
        document.getElementById("ne_equipo").textContent =
            `Nivel de estrés del equipo: ${data.categoria_equipo}`;

        // Imagen
        const img = document.getElementById("img_ne");

        if (data.categoria_equipo === "Bajo") {
            img.src = "assets/feliz.png";
        }
        else if (data.categoria_equipo === "Medio") {
            img.src = "assets/neutro.png";
        }
        else if (data.categoria_equipo === "Alto") {
            img.src = "assets/estresado.png";
        }

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

        // Crear integrantes
        for (const [index, miembro] of equipoActual.miembros_equipo.entries()) {

            const avatar = await obtener_avatar(miembro.usuario_id);
            const integrante = document.createElement("div");

            integrante.className =
                "grid gap-2 lg:grid-cols-2 items-center";

            integrante.innerHTML = `
                <img class="w-10 h-10 rounded-full" src="${avatar}">

                <p class="font-light text-gray-500">
                    ${miembro.nombre_miembro}
                </p>
            `;

            contenedor.appendChild(integrante);
        }

        await cargar_materia();
        await cargar_ne();

        document.querySelectorAll(".loading").forEach((elemento) => {
            elemento.classList.add("hidden");
        });

        document.querySelectorAll(".info_equipo").forEach((elemento) => {
            elemento.classList.remove("hidden");
        });

    } catch (error) {
        console.error('Error al cargar el perfil:', error);
    }
}

// - - - FUNCIONES FETCH - - -

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

// - - - FUNCIONES DE ENLACES - - -

function cerrar_sesion() {
    window.location.href = 'index.html';
    sessionStorage.clear()
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