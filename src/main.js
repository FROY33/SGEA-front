// - - - FUNCIONES GENERALES - - - 

async function cargar_ne() {
    try {
        const response = await fetch(`https://sgea.onrender.com/perfil/nivel-estres`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem('access_token')}`
            }
        });

        const data = await response.json();
        console.log(data.valor);

        const ne = document.getElementById('nivelEstres');

        if (ne) {
            ne.textContent = data.categoria;
        }
        
        // Eliminar barra anterior si existe
        const barraAnterior = document.getElementById('barraNEContainer');
        if (barraAnterior) barraAnterior.remove();

        // Color dinámico
        let colorBarra = 'bg-green-500';

        if (data.valor >= 70) {
            colorBarra = 'bg-red-500';
        } else if (data.valor >= 40) {
            colorBarra = 'bg-yellow-400';
        }

        // Contenedor principal
        const container = document.createElement('div');
        container.id = 'barraNEContainer';
        container.className = `
            fixed bottom-4 left-4 z-50
            flex items-center gap-3
            bg-white/90 backdrop-blur-md
            border border-gray-200
            shadow-lg rounded-2xl
            px-4 py-3
        `;

        // Texto "NE"
        const texto = document.createElement('span');
        texto.textContent = 'NE';
        texto.className = 'font-bold text-gray-900';

        // Fondo de la barra
        const barraFondo = document.createElement('div');
        barraFondo.className = `
            w-44 h-4
            bg-gray-200
            rounded-full
            overflow-hidden
        `;

        // Barra de progreso
        const barra = document.createElement('div');
        barra.className = `
            h-full rounded-full
            transition-all duration-500
            ${colorBarra}
        `;
        barra.style.width = `${data.valor}%`;

        // Ensamblar
        barraFondo.appendChild(barra);
        container.appendChild(texto);
        container.appendChild(barraFondo);

        document.body.appendChild(container);

    } catch (error) {
        console.error('Error de conexión:', error);
    }
}

// Cargar ne cuando se carga la página
document.addEventListener('DOMContentLoaded', cargar_ne);