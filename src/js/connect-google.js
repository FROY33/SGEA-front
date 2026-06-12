
function obtenerUsuarioIdActual() {
  // Supabase guarda por defecto la sesión en el localStorage bajo la llave 'sb-auth-token'
  const sessionString = localStorage.getItem('sb-auth-token'); 
  if (!sessionString) return null;
  
  try {
    const session = JSON.parse(sessionString);
    // Extraemos el ID único (UUID) del usuario autenticado
    return session?.user?.id || null;
  } catch (error) {
    console.error('Error al parsear la sesión de Supabase:', error);
    return null;
  }
}

document.getElementById('btnConectarGoogle').addEventListener('click', (e) => {
  const usuarioId = obtenerUsuarioIdActual();
  
  // Seguridad por si la sesión expiró o no se encontró el ID
  if (!usuarioId) {
    console.error('No se pudo redirigir: No se encontró un ID de usuario activo.');
    return;
  }

  e.target.disabled = true;
  e.target.textContent = 'Redirigiendo a Google...';

  // 4. Configuración de parámetros de Google OAuth2
  const clientId = '957656718778-r5k64rslpr2vnf44c7ga0gq976jh12iq.apps.googleusercontent.com';
  const redirectUri = 'https://sgea.onrender.com/auth/google/callback';
  const scope = encodeURIComponent('https://www.googleapis.com/auth/calendar.events');

 
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent&state=${usuarioId}`;

  // 6. Redirección final
  window.location.href = googleAuthUrl;
});