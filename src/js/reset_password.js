const SUPABASE_URL = 'https://dcrczhswsvsxyzsolkoo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjcmN6aHN3c3ZzeHl6c29sa29vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxODM1MjgsImV4cCI6MjA5MTc1OTUyOH0.0dLJXV0bvYaHt8TnC96eEV7TexK9RhB1a2fsv2CRKOU';

const { createClient } = supabase;
const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const form = document.getElementById('reset-form');
const button = form.querySelector('button[type="submit"]');

// Parsear los tokens del hash de la URL (#access_token=...&type=recovery)
function parseHash() {
    const hash = window.location.hash.substring(1);
    return Object.fromEntries(new URLSearchParams(hash));
}

async function init() {
    const params = parseHash();

    if (params.type !== 'recovery' || !params.access_token) {
        form.innerHTML = `
            <p class="text-red-500 text-sm text-center">
                Enlace inválido o expirado.
            </p>
            <a href="recover_password.html" class="block w-full text-center text-sm text-gray-500 hover:underline mt-4">
                Solicitar nuevo enlace
            </a>
        `;
        return;
    }

    const { error } = await client.auth.setSession({
        access_token: params.access_token,
        refresh_token: params.refresh_token,
    });

    if (error) {
        form.innerHTML = `
            <p class="text-red-500 text-sm text-center">
                Sesión inválida. El enlace puede haber expirado.
            </p>
            <a href="recover_password.html" class="block w-full text-center text-sm text-gray-500 hover:underline mt-4">
                Solicitar nuevo enlace
            </a>
        `;
        return;
    }

    form.addEventListener('submit', handleSubmit);
}

async function handleSubmit(e) {
    e.preventDefault();

    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (password !== confirmPassword) {
        showError('Las contraseñas no coinciden');
        return;
    }

    button.disabled = true;
    button.textContent = 'Actualizando...';

    const { error } = await client.auth.updateUser({ password });

    if (error) {
        showError(error.message);
        button.disabled = false;
        button.textContent = 'Actualizar contraseña';
        return;
    }

    form.innerHTML = `
        <p class="text-green-600 font-medium text-center text-sm">
            ¡Contraseña actualizada correctamente!
        </p>
        <a href="index.html" class="block w-full text-center text-sm text-gray-500 hover:underline mt-4">
            Ir al inicio de sesión
        </a>
    `;
}

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

init();
