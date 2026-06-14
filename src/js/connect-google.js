document.addEventListener('DOMContentLoaded', () => {

    const btn = document.getElementById('btnconectargoogle');

    if (!btn) {
        console.error('No se encontró el botón btnconectargoogle');
        return;
    }

    btn.addEventListener('click', () => {

        try {

            const token = sessionStorage.getItem('access_token');

            if (!token) {
                console.error('No se encontró access_token en sessionStorage');
                return;
            }

            const decodedToken = JSON.parse(
                atob(token.split('.')[1])
            );

            const usuarioId = decodedToken.sub;

            if (!usuarioId) {
                console.error('No se encontró el ID del usuario en el token');
                return;
            }

            console.log('Usuario ID:', usuarioId);

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

            const googleAuthUrl =
                `https://accounts.google.com/o/oauth2/v2/auth` +
                `?client_id=${clientId}` +
                `&redirect_uri=${redirectUri}` +
                `&response_type=code` +
                `&scope=${scope}` +
                `&access_type=offline` +
                `&prompt=consent` +
                `&state=${encodeURIComponent(usuarioId)}`;

            console.log('OAuth URL:', googleAuthUrl);

            window.location.href = googleAuthUrl;

        } catch (error) {

            console.error(
                'Error obteniendo usuario desde el JWT:',
                error
            );

        }

    });

});