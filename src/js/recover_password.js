const form = document.querySelector('form');
const button = form.querySelector('button[type="submit"]');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const basePath = window.location.pathname.replace('recover_password.html', '');
    const redirectTo = `${window.location.origin}${basePath}reset_password.html`;

    button.disabled = true;
    button.textContent = 'Enviando...';

    try {
        const res = await fetch('https://sgea.onrender.com/auth/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, redirectTo }),
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.message || 'Error al enviar el correo');

        form.innerHTML = `
            <p class="text-green-600 font-medium text-center text-sm">
                Si el correo existe, recibirás un enlace de recuperación en tu bandeja de entrada.
            </p>
            <a href="index.html" class="block w-full text-center text-sm text-gray-500 hover:underline mt-4">
                Volver al inicio de sesión
            </a>
        `;
    } catch (err) {
        showError(err.message);
        button.disabled = false;
        button.textContent = 'Enviar código de verificación';
    }
});

function showError(message) {
    let el = document.getElementById('error-msg');
    if (!el) {
        el = document.createElement('p');
        el.id = 'error-msg';
        el.className = 'text-red-500 text-sm';
        button.before(el);
    }
    el.textContent = message;
}
