document.getElementById('btnConectarGoogle').addEventListener('click', (e) => {
  const usuarioId = obtenerUsuarioIdActual();
  
  // Deshabilitamos el botón y cambiamos el texto para feedback visual
  e.target.disabled = true;
  e.target.textContent = 'Conectando con Google...';
  
  window.location.href = `${API_URL}/auth/google/connect?userId=${usuarioId}`;
});