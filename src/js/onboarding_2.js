document.addEventListener('DOMContentLoaded', function () {
    const questionsContainer = document.getElementById('questionsContainer');
    const groups = document.querySelectorAll('.questions-group');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const currentQuestionSpan = document.getElementById('currentQuestion');
    const totalQuestionsSpan = document.getElementById('totalQuestions');
    const stressorsForm = document.getElementById('stressorsForm');

    let currentGroup = 0;
    const totalGroups = groups.length;
    const questionsPerGroup = 3;
    const totalQuestions = 12;

    function updateProgressIndicator() {
        const firstQuestionInGroup = currentGroup * questionsPerGroup + 1;
        currentQuestionSpan.textContent = firstQuestionInGroup;
        totalQuestionsSpan.textContent = totalQuestions;
    }

    function showGroup(groupIndex) {
        groups.forEach(group => {
            group.classList.remove('active');
        });

        if (groupIndex >= 0 && groupIndex < totalGroups) {
            groups[groupIndex].classList.add('active');
            currentGroup = groupIndex;
            updateProgressIndicator();
            updateButtonStates();
        }
    }

    function updateButtonStates() {
        if (currentGroup > 0) {
            prevBtn.disabled = false;
            prevBtn.style.opacity = '1';
            prevBtn.style.cursor = 'pointer';
        } else {
            prevBtn.disabled = true;
            prevBtn.style.opacity = '0.6';
            prevBtn.style.cursor = 'not-allowed';
        }

        if (currentGroup === totalGroups - 1) {
            nextBtn.textContent = 'Enviar';
        } else {
            nextBtn.textContent = 'Siguiente';
        }
    }

    function isGroupAnswered() {
        const currentGroupElement = groups[currentGroup];
        const radios = currentGroupElement.querySelectorAll('input[type="radio"]');
        const radioNames = new Set();

        radios.forEach(radio => {
            radioNames.add(radio.name);
        });

        for (let name of radioNames) {
            const isAnswered = document.querySelector(`input[name="${name}"]:checked`);
            if (!isAnswered) {
                return false;
            }
        }

        return true;
    }

    prevBtn.addEventListener('click', function (e) {
        e.preventDefault();

        if (currentGroup > 0) {
            showGroup(currentGroup - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });

    nextBtn.addEventListener('click', async function (e) {
        e.preventDefault();

        if (!isGroupAnswered()) {
            alert('Por favor, responde todas las preguntas de este grupo antes de continuar.');
            return;
        }

        if (currentGroup < totalGroups - 1) {
            showGroup(currentGroup + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            if (!stressorsForm || stressorsForm.checkValidity()) {
                nextBtn.disabled = true;
                nextBtn.textContent = 'Guardando...';

                // Cada factor se calcula con el promedio de las tres preguntas
                // Recopilar las respuestas y calcular promedios
                try {
                    const token = sessionStorage.getItem('access_token');

                    function avgForQuestionRange(startIndex) {
                        const values = [];
                        for (let i = startIndex; i < startIndex + 3; i++) {
                            const selected = document.querySelector(`input[name="p${i}"]:checked`);
                            values.push(selected ? parseInt(selected.value) : 0);
                        }
                        const sum = values.reduce((a, b) => a + b, 0);
                        return values.length ? sum / values.length : 0;
                    }

                    const factor1 = avgForQuestionRange(1); // preguntas 1-3 -> id 3
                    const factor2 = avgForQuestionRange(4); // preguntas 4-6 -> id 4
                    const factor3 = avgForQuestionRange(7); // preguntas 7-9 -> id 5
                    const factor4 = avgForQuestionRange(10); // preguntas 10-12 -> id 2

                    // Los que aún no calculamos los dejamos en medio
                    const payload = {
                        factores: [
                            { factor_id: 2, peso: factor4 },
                            { factor_id: 3, peso: factor1 },
                            { factor_id: 4, peso: factor2 },
                            { factor_id: 5, peso: factor3 }
                        ]
                    };

                    const response = await fetch('https://sgea.onrender.com/perfil/estresores', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${sessionStorage.getItem('access_token')}`
                        },
                        body: JSON.stringify(payload)
                    });

                    const data = await response.json();

                    if (response.ok) {
                        setTimeout(() => {
                            window.location.href = 'dashboard.html';
                        }, 1000);
                    } else {
                        alert('Error al guardar factores: ' + (data.message || 'Error desconocido'));
                        nextBtn.disabled = false;
                        nextBtn.textContent = 'Enviar';
                    }
                } catch (error) {
                    alert('Error de conexión. Intenta nuevamente.');
                    nextBtn.disabled = false;
                    nextBtn.textContent = 'Enviar';
                }
            } else {
                alert('Por favor, completa todas las preguntas.');
            }
        }
    });

    showGroup(0);
});