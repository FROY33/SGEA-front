// - - - ID DE EL EQUIPO - - -

const params = new URLSearchParams(window.location.search);
const id = params.get("id");
const materiaId = params.get("materia");

// - - - CARGAR DATOS - - - 

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

        await cargar_ne_equipo();

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