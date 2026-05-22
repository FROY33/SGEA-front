const divNombre1 = document.getElementById('nombreUsuario1');
const divNombre2 = document.getElementById('nombreUsuario2');
divNombre1.textContent = sessionStorage.getItem('user_name');
divNombre2.textContent = sessionStorage.getItem('user_name');

// Cargar datos del perfil desde el endpoint
async function cargarPerfil() {
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

        // Llenar los datos en el HTML
        document.getElementById('correoUsuario').textContent = data.usuario;
        document.getElementById('institucionUsuario').textContent = data.institucion;
        document.getElementById('carreraUsuario').textContent = data.carrera;
        document.getElementById('semestreUsuario').textContent = data.semestre;
        document.getElementById('promedioUsuario').textContent = data.promedio_general.toFixed(2);
        
        // Formatear la fecha
        const fecha = new Date(data.created_at);
        const fechaFormato = fecha.toLocaleDateString('es-ES');
        document.getElementById('fechaCreacionUsuario').textContent = fechaFormato;

        // Actualizar el avatar
        if (data.avatar_url) {
            document.getElementById('avatarUsuario').src = data.avatar_url;
        }

        // Llenar campos del formulario de edición
        document.getElementById('name').value = data.usuario;
        document.getElementById('institucion').value = data.institucion;
        document.getElementById('carrera').value = data.carrera;
        document.getElementById('semestre').value = data.semestre;
        document.getElementById('promedio').value = data.promedio_general;

        document.querySelectorAll(".loading").forEach((elemento) => {
            elemento.classList.add("hidden");
        });

        document.querySelectorAll(".info_perfil").forEach((elemento) => {
            elemento.classList.remove("hidden");
        });

    } catch (error) {
        console.error('Error al cargar el perfil:', error);
    }
}

// Cargar el perfil cuando se cargue la página
document.addEventListener('DOMContentLoaded', cargarPerfil);

function mostrarPerfil() {
    const divPerfil = document.getElementById('divEditarPerfil');
    divPerfil.style.display="flex";
    document.body.style.overflow = "hidden";
}

function ocultarPerfil() {
    const divPerfil = document.getElementById('divEditarPerfil');
    divPerfil.style.display="none";
    document.body.style.overflow = "auto";
}

function cerrar_sesion() {
    window.location.href = 'index.html';
    sessionStorage.clear()
}

// Función para subir el avatar
async function upload_avatar(file) {
    try {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('https://sgea.onrender.com/perfil/avatar', {
            method: 'POST',
            body: formData,
            headers: {
                'Authorization': `Bearer ${sessionStorage.getItem('access_token')}`
            }
        });

        if (!res.ok) {
            throw new Error(`Error al subir avatar: ${res.status}`);
        }

        const data = await res.json();
        console.log('Avatar subido exitosamente:', data);
        return true;

    } catch (error) {
        console.error('Error al subir avatar:', error);
        throw error;
    }
}

// Función para actualizar el perfil
async function update_perfil(event) {
    event.preventDefault();

    try {
        // Obtener valores del formulario
        const usuario = document.getElementById('name').value.trim();
        const institucion = document.getElementById('institucion').value.trim();
        const carrera = document.getElementById('carrera').value.trim();
        const semestre = document.getElementById('semestre').value;
        const avatarInput = document.getElementById('avatar');

        // Construir el body con solo los campos que tengan valor
        const body = {};
        
        if (usuario) body.usuario = usuario;
        if (institucion) body.institucion = institucion;
        if (carrera) body.carrera = carrera;
        if (semestre) body.semestre = parseInt(semestre);

        console.log('Body a enviar:', body);

        // Actualizar los datos del perfil
        const response = await fetch('https://sgea.onrender.com/perfil', {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${sessionStorage.getItem('access_token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Error ${response.status}: ${JSON.stringify(errorData)}`);
        }

        // Subir el avatar si se seleccionó un archivo
        if (avatarInput.files && avatarInput.files.length > 0) {
            const file = avatarInput.files[0];
            console.log('Subiendo avatar:', file.name);
            await upload_avatar(file);
        }

        alert('¡Perfil actualizado correctamente!');
        
        // Recargar los datos del perfil
        await cargarPerfil();
        
        // Cerrar el modal
        ocultarPerfil();

    } catch (error) {
        console.error('Error al actualizar el perfil:', error);
        alert('Error al actualizar el perfil: ' + error.message);
    }
}