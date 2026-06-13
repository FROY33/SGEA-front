
document
  .getElementById('btnconectargoogle')
  .addEventListener('click', async (e) => {

    e.preventDefault();

    const {
      data: { session }
    } = await supabase.auth.getSession();

    const usuarioId = session?.user?.id;

    if (!usuarioId) {
      alert('No hay sesión activa');
      return;
    }

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

    console.log(googleAuthUrl);

    window.location.assign(googleAuthUrl);
});