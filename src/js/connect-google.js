// conectar-google.js
const API_URL = 'https://sgea.onrender.com'; // tu backend en Render

document.getElementById('btnConectarGoogle').addEventListener('click', () => {
  const usuarioId = obtenerUsuarioIdActual(); // tu función que obtiene el ID del usuario logueado
  window.location.href = `${API_URL}/auth/google/connect?userId=${usuarioId}`;
});