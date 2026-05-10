// - - - CARGAR DATOS - - -

async function cargar_equipos() {
    
}

// - - - FUNCIONES DE ENLACES - - -

function cerrar_sesion() {
    window.location.href = 'index.html';
    sessionStorage.clear()
}

// Cargar datos cuando se carga la página
document.addEventListener('DOMContentLoaded', cargar_equipos);