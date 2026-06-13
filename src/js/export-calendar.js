
document.getElementById('btnExportarTodas').addEventListener('click', async () => {
  const API_URL = 'https://sgea.onrender.com'; 
  const token = sessionStorage.getItem('access_token');

  if (!token) {
    alert('No se encontró una sesión activa');
    return;
  }

  const btn = document.getElementById('btnExportarTodas');

  btn.disabled = true;
  btn.textContent = 'Exportando...';

  try {

    const response = await fetch(
      `${API_URL}/actividades/exportar-todas`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    alert(
      `Exitosas: ${data.exitosas}, Fallidas: ${data.fallidas}`
    );

  } catch (err) {

    console.error(err);
    alert('Error al exportar actividades');

  } finally {

    btn.disabled = false;
    btn.textContent = 'Exportar todas las actividades';

  }

});