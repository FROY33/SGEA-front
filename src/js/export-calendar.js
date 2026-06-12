const API_URL = 'https://sgea.onrender.com';

document.querySelectorAll('.btn-exportar').forEach(btn => {
  btn.addEventListener('click', async (e) => {
    const actividadId = e.target.dataset.id;
    const token = obtenerTokenSupabase(); // tu JWT de sesión de Supabase

    e.target.disabled = true;
    e.target.textContent = 'Exportando...';

    try {
      const response = await fetch(`${API_URL}/actividades/${actividadId}/exportar-calendario`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        // Si el usuario no conectó Google Calendar, sugerirle conectarlo
        if (response.status === 401) {
          if (confirm('No has conectado tu Google Calendar. ¿Conectar ahora?')) {
            const usuarioId = obtenerUsuarioIdActual();
            window.location.href = `${API_URL}/auth/google/connect?userId=${usuarioId}`;
          }
          return;
        }
        throw new Error(data.message || 'Error al exportar');
      }

      alert('✅ Actividad exportada a Google Calendar');
      console.log('Evento creado/actualizado con ID:', data);

    } catch (err) {
      console.error(err);
      alert('❌ No se pudo exportar la actividad');
    } finally {
      e.target.disabled = false;
      e.target.textContent = '📅 Exportar a Google Calendar';
    }
  });
});
document.getElementById('btnExportarTodas').addEventListener('click', async () => {
  const token = obtenerTokenSupabase();
  const btn = document.getElementById('btnExportarTodas');

  btn.disabled = true;
  btn.textContent = 'Exportando...';

  try {
    const response = await fetch(`${API_URL}/actividades/exportar-todas`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const data = await response.json();
    alert(`Exitosas: ${data.exitosas}, Fallidas: ${data.fallidas}`);
  } catch (err) {
    console.error(err);
    alert('Error al exportar actividades');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Exportar todas las actividades';
  }
});