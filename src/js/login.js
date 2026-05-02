const loginBtn = document.getElementById('loginBtn');

async function login() {

    // Obtener valores del formulario
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Validaciones
    if (!email || !password) {
        return;
    }

    // Cambiar estado del botón
    loginBtn.disabled = true;
    loginBtn.textContent = 'Espere...';

    try {
        const response = await fetch('https://sgea.onrender.com/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        const data = await response.json();

        if (response.ok) {
            alert('Abriendo sesión...');
            sessionStorage.setItem('access_token', data.access_token);
            sessionStorage.setItem('refresh_token', data.refresh_token);
            const user = getUserNameFromToken(data.access_token);
            sessionStorage.setItem('user_name', user.display_name);

            try {
                // Verificar si es la primera vez que inicia sesión consultando los estresores
                const estresoresResponse = await fetch('https://sgea.onrender.com/perfil/estresores', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${data.access_token}`,
                        'Content-Type': 'application/json'
                    }
                });

                const estresoresData = await estresoresResponse.json();

                // Si la respuesta es un arreglo vacío, es primera vez
                const isPrimeraVez = Array.isArray(estresoresData) && estresoresData.length === 0;

                setTimeout(() => {
                    window.location.href = isPrimeraVez ? 'onboarding_1.html' : 'dashboard.html';
                }, 1500);
            } catch (error) {
                console.error('Error al verificar estresores:', error);
                // En caso de error, redirigir a onboarding_1 por defecto
                setTimeout(() => {
                    window.location.href = 'onboarding_1.html';
                }, 1500);
            }
        } else {
            alert('Error al iniciar sesión: ' + (data.message || 'Error desconocido'));
            loginBtn.disabled = false;
            loginBtn.textContent = 'Iniciar sesión';
        }
    } catch (error) {
        alert('Error de conexión. Intenta nuevamente.');
        loginBtn.disabled = false;
        loginBtn.textContent = 'Iniciar sesión';
    }
}

function getJwtPayload(token) {
  try {
    // 1. Obtener la segunda parte del token (payload)
    const base64Url = token.split('.')[1];
    // 2. Reemplazar caracteres especiales de Base64URL a Base64
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    // 3. Decodificar y convertir a JSON
    return JSON.parse(window.atob(base64));
  } catch (e) {
    console.error("Error al decodificar el token", e);
    return null;
  }
}

function getUserNameFromToken(token) {
  const payload = getJwtPayload(token);

  if (!payload) return null;

  try {
    return {
      display_name: payload.user_metadata?.display_name || null,
    };
  } catch (error) {
    console.error("Error al extraer user name", error);
    return null;
  }
}