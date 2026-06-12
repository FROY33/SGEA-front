const API_URL = 'https://sgea.onrender.com';

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