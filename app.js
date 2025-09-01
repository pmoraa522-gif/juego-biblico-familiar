// ====================================================================================
// VARIABLES Y ELEMENTOS HTML
// ====================================================================================
let sonidosHabilitados = true;
// Almacena los datos de las preguntas después de cargarlos desde el archivo JSON
let datosBiblicos;

// Variables de estado del juego
let preguntasActuales = [];
let indicePreguntaActual = 0;
let score = 0;

// Variable para almacenar los logros desbloqueados
let logrosDesbloqueados = [];
try {
    logrosDesbloqueados = JSON.parse(localStorage.getItem('logrosDesbloqueados')) || [];
} catch (e) {
    console.log('Error al cargar logros desde localStorage:', e);
}

// Referencias a los elementos de las vistas en el HTML
const inicioView = document.getElementById('inicio-view');
const juegoView = document.getElementById('juego-view');

// Referencias a los botones de inicio
const btnNinosNoLectores = document.getElementById('btn-ninos-no-lectores');
const btnNinosLectores = document.getElementById('btn-ninos-lectores');
const btnAdultos = document.getElementById('btn-adultos');

// Referencias a los elementos de la vista del juego
const preguntaTitulo = document.getElementById('pregunta-titulo');
const preguntaTexto = document.getElementById('pregunta-texto');
const preguntaImagen = document.getElementById('pregunta-imagen');
const opcionesContainer = document.getElementById('opciones-container');
const mensajeFeedback = document.getElementById('mensaje-feedback');
const puntuacionActual = document.getElementById('puntuacion-actual');

// ====================================================================================
// FUNCIONES PRINCIPALES
// ====================================================================================

/**
 * Carga los datos del archivo JSON de manera asíncrona.
 * Una vez cargados, la aplicación está lista para empezar.
 */
async function cargarDatos() {
    try {
        const response = await fetch('biblia_data.json');
        if (!response.ok) {
            throw new Error('No se pudo cargar el archivo de datos.');
        }
        datosBiblicos = await response.json();
        console.log('Datos cargados exitosamente:', datosBiblicos);
    } catch (error) {
        console.error('Error al cargar los datos:', error);
        // Aquí podrías mostrar un mensaje de error al usuario
    }
}

/**
 * Inicia el juego para el nivel seleccionado.
 * @param {string} nivel - La clave del nivel en el archivo JSON ('ninos_no_lectores', 'ninos_lectores', 'adultos').
 */
function iniciarJuego(nivel) {
    if (!datosBiblicos) {
        console.error('Los datos aún no se han cargado.');
        return;
    }

    // Esconde la vista de inicio y muestra la vista del juego
    inicioView.classList.add('hidden');
    juegoView.classList.remove('hidden');

    // Inicializa las variables del juego para el nuevo nivel
    preguntasActuales = datosBiblicos[nivel];
    indicePreguntaActual = 0;
    score = 0;

    // Actualiza el texto de la puntuación para que se reinicie en la pantalla
    puntuacionActual.textContent = `Puntos: 0`;

    // Mezcla las preguntas para que aparezcan en un orden aleatorio
    preguntasActuales = preguntasActuales.sort(() => Math.random() - 0.5);

    mostrarSiguientePregunta();
    actualizarBarraProgreso();
}

/**
 * Muestra la siguiente pregunta en la interfaz.
 */
function mostrarSiguientePregunta() {
    
    // Si ya no hay más preguntas, termina el juego.
    if (indicePreguntaActual >= preguntasActuales.length) {
        terminarJuego();
        
        return;
    }

    const pregunta = preguntasActuales[indicePreguntaActual];

    // Limpia el contenido anterior
    opcionesContainer.innerHTML = '';
    mensajeFeedback.textContent = '';
    mensajeFeedback.className = 'feedback';
    preguntaImagen.classList.add('hidden'); // Oculta la imagen por defecto

    // Rellena la pregunta y el texto
    preguntaTitulo.textContent = `Pregunta ${indicePreguntaActual + 1} de ${preguntasActuales.length}`;
    preguntaTexto.textContent = pregunta.pregunta;

    // Si la pregunta tiene una imagen, la muestra
    if (pregunta.imagen_pregunta) {
        preguntaImagen.src = `assets/images/${pregunta.imagen_pregunta}`;
        preguntaImagen.classList.remove('hidden');
    }

    // Mezcla las opciones para que no siempre estén en el mismo orden
    const opcionesMezcladas = pregunta.opciones.sort(() => Math.random() - 0.5);

    // Crea los botones para cada opción
    opcionesMezcladas.forEach(opcion => {
        const btn = document.createElement('button');
        btn.textContent = opcion;
        btn.classList.add('btn');
        btn.classList.add('opcion-btn'); // Clase para identificar los botones de opción
        btn.addEventListener('click', () => verificarRespuesta(opcion, pregunta));
        opcionesContainer.appendChild(btn);
    });
    actualizarBarraProgreso();
}

/**
 * Verifica si la respuesta seleccionada por el usuario es correcta.
 * @param {string} respuestaSeleccionada - El texto de la opción elegida por el usuario.
 * @param {object} preguntaActual - El objeto de la pregunta actual.
 */

// Variables globales para audio
let audioContext;
let sonidos = {};

// Inicializar audio
function inicializarAudio() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Cargar sonidos
        cargarSonidos();
    } catch (e) {
        console.log("Audio no soportado en este navegador");
    }
}

function cargarSonidos() {
    // Sonidos básicos (puedes reemplazar con archivos reales después)
    sonidos.correcto = () => {
        if (!audioContext) return;
        playTones([523.25, 659.25]); // Do y Mi
    };
    
    sonidos.incorrecto = () => {
        if (!audioContext) return;
        playTones([392.00, 293.66]); // Sol y Re
    };
}

function playTones(frequencies) {
    const gainNode = audioContext.createGain();
    gainNode.connect(audioContext.destination);
    gainNode.gain.value = 0.3;

    frequencies.forEach(freq => {
        const oscillator = audioContext.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.value = freq;
        oscillator.connect(gainNode);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.7);
    });
}

function verificarRespuesta(respuestaSeleccionada, preguntaActual) {
    console.log("Verificando respuesta:", respuestaSeleccionada);
    // Deshabilita los botones de opción
    const botonesOpciones = document.querySelectorAll('.opcion-btn');
    botonesOpciones.forEach(btn => {
        btn.disabled = true;
    });

    // Verifica si la respuesta es correcta
    const esCorrecta = respuestaSeleccionada === preguntaActual.respuesta_correcta;
    
    if (esCorrecta) {
        mensajeFeedback.textContent = '¡Correcto!';
        mensajeFeedback.classList.add('correcto');
        score++;
        if (sonidosHabilitados) {
            reproducirSonido('correcto');
        }
    } else {
        mensajeFeedback.textContent = `Incorrecto. La respuesta correcta es: ${preguntaActual.respuesta_correcta}`;
        mensajeFeedback.classList.add('incorrecto');
        if (sonidosHabilitados) {
            reproducirSonido('incorrecto');
        }
    }
    
    // Muestra la lección si existe
    if (preguntaActual.leccion) {
        const leccionElement = document.createElement('p');
        leccionElement.classList.add('leccion');
        leccionElement.textContent = preguntaActual.leccion;
        mensajeFeedback.appendChild(leccionElement);
    }
    
    // Actualiza la puntuación
    document.getElementById('puntuacion-actual').textContent = `Puntos: ${score}`;
    
    // Prepara la siguiente pregunta después de un delay
    setTimeout(() => {
        indicePreguntaActual++;
        if (indicePreguntaActual < preguntasActuales.length) {
            mostrarSiguientePregunta();
        } else {
            terminarJuego();
        }
    }, 2500); // 2.5 segundos para leer el feedback y la lección
    actualizarBarraProgreso();
}

// Llamar a inicializarAudio al cargar la página
window.addEventListener('load', inicializarAudio);

/**
 * Verifica si algún logro ha sido desbloqueado.
 */
function verificarLogros() {
    const logros = datosBiblicos.logros;
    let logroDesbloqueado = null;
    
    // Recorre todos los logros para ver si alguno se ha cumplido
    for (const logro of logros) {
        if (
            score >= logro.criterios.puntuacion_minima &&
            preguntasActuales[0].id.startsWith(logro.criterios.nivel === 'ninos_no_lectores' ? '1' : logro.criterios.nivel === 'ninos_lectores' ? '10' : '20') &&
            !logrosDesbloqueados.includes(logro.id)
        ) {
            logrosDesbloqueados.push(logro.id);
            localStorage.setItem('logrosDesbloqueados', JSON.stringify(logrosDesbloqueados));
            logroDesbloqueado = logro;
            break;
        }
    }
    
    // Si un logro fue desbloqueado, muéstralo
    if (logroDesbloqueado) {
        const logroContainer = document.createElement('div');
        logroContainer.classList.add('logro-container');
        logroContainer.innerHTML = `
            <h4>¡Logro Desbloqueado!</h4>
            <p>${logroDesbloqueado.titulo}</p>
            <p>${logroDesbloqueado.descripcion}</p>
        `;
        opcionesContainer.appendChild(logroContainer);
    }
}

/**
 * Muestra la pantalla final de resultados y lecciones.
 */
function terminarJuego() {
    opcionesContainer.innerHTML = '';
    mensajeFeedback.textContent = '';
    mensajeFeedback.className = 'feedback';
    preguntaTitulo.textContent = '¡Juego terminado!';
    preguntaTexto.textContent = `Has respondido correctamente a ${score} de ${preguntasActuales.length} preguntas.`;

    verificarLogros();
    
    // Crea el botón para volver al inicio
    const btnReinicio = document.createElement('button');
    btnReinicio.textContent = 'Volver al inicio';
    btnReinicio.classList.add('btn');
    opcionesContainer.appendChild(btnReinicio);

    // Asigna la acción de reiniciar al botón
    btnReinicio.addEventListener('click', () => {
        juegoView.classList.add('hidden');
        inicioView.classList.remove('hidden');
    });
}


// ====================================================================================
// INICIO DE LA APLICACIÓN
// ====================================================================================

// Llamar a la función para cargar los datos al iniciar la página
// (función anónima async para permitir el uso de await)
(async () => {
    await cargarDatos();

    // Ahora, asigna las acciones a los botones una vez que los datos estén listos
    btnNinosNoLectores.addEventListener('click', () => iniciarJuego('ninos_no_lectores'));
    btnNinosLectores.addEventListener('click', () => iniciarJuego('ninos_lectores'));
    btnAdultos.addEventListener('click', () => iniciarJuego('adultos'));

})();

function actualizarBarraProgreso() {
    const porcentaje = (indicePreguntaActual / preguntasActuales.length) * 100;
    const barraProgreso = document.getElementById('barra-progreso');
    const textoProgreso = document.getElementById('texto-progreso');
    
    if (barraProgreso && textoProgreso) {
        barraProgreso.style.width = porcentaje + '%';
        textoProgreso.textContent = Math.round(porcentaje) + '%';
    }
}

// Llamar a actualizarProgreso después de cada pregunta
// en verificarRespuesta y mostrarSiguientePregunta

// Alternar modo alto contraste
document.getElementById('btn-contraste').addEventListener('click', function() {
    document.body.classList.toggle('alto-contraste');
});

// Función para reproducir sonidos simples
function reproducirSonido(tipo) {
    if (!sonidosHabilitados) return;
    
    try {
        // Crear sonidos simples con el Web Audio API
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        if (tipo === 'correcto') {
            oscillator.frequency.value = 523.25; // Do
            gainNode.gain.value = 0.3;
        } else if (tipo === 'incorrecto') {
            oscillator.frequency.value = 392.00; // Sol
            gainNode.gain.value = 0.2;
        }
        
        oscillator.start();
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.7);
        oscillator.stop(audioContext.currentTime + 0.7);
    } catch (e) {
        console.log("Audio no compatible");
    }
}





