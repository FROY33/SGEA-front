function obtenerUsuarioIdActual() {

    // Buscar automáticamente la clave de sesión de Supabase
    const claveSesion = Object.keys(localStorage)
        .find(key =>
            key.startsWith('sb-') &&
            key.includes('auth-token')
        );

    if (!claveSesion) {
        console.error('No se encontró ninguna sesión de Supabase en localStorage');
        return null;
    }

    console.log('Clave encontrada:', claveSesion);

    const sessionString = localStorage.getItem(claveSesion);

    if (!sessionString) {
        console.error('La sesión está vacía');
        return null;
    }

    try {

        const session = JSON.parse(sessionString);

        console.log('Contenido de sesión:', session);

        // Diferentes formatos según la versión de Supabase
        const usuarioId =
            session?.user?.id ||
            session?.currentSession?.user?.id ||
            session?.session?.user?.id ||
            null;

        console.log('Usuario ID encontrado:', usuarioId);

        return usuarioId;

    } catch (error) {
        console.error('Error al parsear la sesión:', error);
        return null;
    }
}

document.addEventListener('DOMContentLoaded', () => {

    const btn = document.getElementById('btnconectargoogle');

    if (!btn) {
        console.error('No existe el botón btnconectargoogle');
        return;
    }

    btn.addEventListener('click', (e) => {

        const usuarioId = obtenerUsuarioIdActual();

        if (!usuarioId) {
            console.error(
                'No se pudo redirigir: No se encontró un ID de usuario activo.'
            );
            return;
        }

        btn.disabled = true;
        btn.textContent = 'Redirigiendo a Google...';

        const clientId =
            '957656718778-r5k64rslpr2vnf44c7ga0gq976jh12iq.apps.googleusercontent.com';

        const redirectUri = encodeURIComponent(
            'https://sgea.onrender.com/auth/google/callback'
        );

        const scope = encodeURIComponent(
            'https://www.googleapis.com/auth/calendar.events'
        );

        const state = encodeURIComponent(usuarioId);

        const googleAuthUrl =
            `https://accounts.google.com/o/oauth2/v2/auth` +
            `?client_id=${clientId}` +
            `&redirect_uri=${redirectUri}` +
            `&response_type=code` +
            `&scope=${scope}` +
            `&access_type=offline` +
            `&prompt=consent` +
            `&state=${state}`;

        console.log('URL OAuth:', googleAuthUrl);

        window.location.href = googleAuthUrl;
    });
});