// conectar-google.js
const API_URL = 'https://sgea.onrender.com'; // Tu backend en Render

// Función para obtener el ID real desde Supabase Auth en el cliente
function obtenerUsuarioIdActual() {
  const sessionString = localStorage.getItem('sb-auth-token'); // O como guardes tu sesión
  if (!sessionString) return null;
  
  const session = JSON.parse(sessionString);
  return session?.user?.id || null;
}

document.getElementById('btnConectarGoogle').addEventListener('click', () => {
  const usuarioId = obtenerUsuarioIdActual();
  
  if (!usuarioId) {
    alert('Debes iniciar sesión en SGEA primero.');
    return;
  }

  // Redirecciona al backend pasándole el ID en la URL
  window.location.href = `${API_URL}/auth/google/connect?userId=${usuarioId}`;
});