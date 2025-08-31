// ====================================================================================
// VARIABLES Y ELEMENTOS HTML
// ====================================================================================

// Almacena los datos de las preguntas después de cargarlos desde el archivo JSON
let datosBiblicos;

// Variables de estado del juego
let preguntasActuales = [];
let indicePreguntaActual = 0;
let score = 0;

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

    // Mezcla las preguntas para que aparezcan en un orden aleatorio
    preguntasActuales = preguntasActuales.sort(() => Math.random() - 0.5);

    mostrarSiguientePregunta();
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
}

/**
 * Verifica si la respuesta seleccionada por el usuario es correcta.
 * @param {string} respuestaSeleccionada - El texto de la opción elegida por el usuario.
 * @param {object} preguntaActual - El objeto de la pregunta actual.
 */
function verificarRespuesta(respuestaSeleccionada, preguntaActual) {
    // Deshabilita los botones de opción para evitar múltiples clics
    document.querySelectorAll('.opcion-btn').forEach(btn => {
        btn.disabled = true;
    });

    if (respuestaSeleccionada === preguntaActual.respuesta_correcta) {
        mensajeFeedback.textContent = '¡Correcto!';
        mensajeFeedback.classList.add('correcto');
        score++;
    } else {
        mensajeFeedback.textContent = `Incorrecto. La respuesta era: ${preguntaActual.respuesta_correcta}`;
        mensajeFeedback.classList.add('incorrecto');
    }

    // Avanza a la siguiente pregunta después de un breve retraso
    setTimeout(() => {
        indicePreguntaActual++;
        mostrarSiguientePregunta();
    }, 2000); // 2 segundos
}

/**
 * Muestra la pantalla final de resultados y lecciones.
 */
function terminarJuego() {
    opcionesContainer.innerHTML = '';
    preguntaTitulo.textContent = '¡Juego terminado!';
    preguntaTexto.textContent = `Has respondido correctamente a ${score} de ${preguntasActuales.length} preguntas.`;
    
    // Aquí podrías agregar un botón para volver a jugar
    const btnReinicio = document.createElement('button');
    btnReinicio.textContent = 'Volver al inicio';
    btnReinicio.classList.add('btn');
    btnRevisar.classList.add('review-btn');
    btnReinicio.addEventListener('click', () => {
        juegoView.classList.add('hidden');
        inicioView.classList.remove('hidden');
    });
    opcionesContainer.appendChild(btnReinicio);
}

// ====================================================================================
// INICIO DE LA APLICACIÓN
// ====================================================================================

// Carga los datos al iniciar la página
cargarDatos();

// Asigna la acción a cada botón del menú principal
btnNinosNoLectores.addEventListener('click', () => iniciarJuego('ninos_no_lectores'));
btnNinosLectores.addEventListener('click', () => iniciarJuego('ninos_lectores'));
btnAdultos.addEventListener('click', () => iniciarJuego('adultos'));