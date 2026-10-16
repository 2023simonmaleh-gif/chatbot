// Motor del chatbot: carga el árbol y controla la navegación.
// Todos los textos y opciones de conversación están en el JSON.

const mensajes = document.getElementById("messages");
const opciones = document.getElementById("options");

let arbol = {};
let nodoActual = null;

// Guarda las elecciones durante la conversación actual.
let historial = [];

async function iniciarChat() {
  try {
    const respuesta = await fetch("arbol_decision.json");

    if (!respuesta.ok) {
      throw new Error("No se pudo cargar el archivo JSON.");
    }

    arbol = await respuesta.json();

    // Comprueba que el nodo inicial exista.
    if (!arbol.inicio || !arbol.nodos[arbol.inicio]) {
      throw new Error("El árbol de conversación no es válido.");
    }

    mostrarNodo(arbol.inicio);
  } catch (error) {
    mostrarErrorCarga();
  }
}

// Muestra un mensaje claro si falla la carga del JSON.
function mostrarErrorCarga() {
  mensajes.replaceChildren();
  opciones.replaceChildren();

  const mensaje = document.createElement("div");
  mensaje.className = "message bot-message";
  mensaje.textContent =
    "Abrí el proyecto con Live Server o un servidor local para que pueda leer arbol_decision.json";

  mensajes.appendChild(mensaje);
}

// Agrega un mensaje al historial visual del chat.
function agregarMensaje(texto, tipo) {
  const mensaje = document.createElement("div");

  mensaje.className = `message ${
    tipo === "usuario" ? "user-message" : "bot-message"
  }`;

  // textContent evita interpretar los textos como HTML.
  mensaje.textContent = texto;
  mensajes.appendChild(mensaje);

  // Mantiene visible la última respuesta.
  mensajes.parentElement.scrollTop =
    mensajes.parentElement.scrollHeight;
}

// Valida que el siguiente nodo exista antes de navegar.
function mostrarNodo(id, registrar = true) {
  const nodo = arbol.nodos[id];

  if (!nodo || !Array.isArray(nodo.opciones) || nodo.opciones.length === 0) {
    mostrarErrorCarga();
    return;
  }

  if (registrar && nodoActual !== null) {
    historial.push(nodoActual);
  }

  nodoActual = id;

  agregarMensaje(nodo.texto, "bot");
  renderizarOpciones(nodo.opciones);
}

// Construye los botones a partir de las opciones del JSON.
function renderizarOpciones(lista) {
  opciones.replaceChildren();

  lista.forEach((opcion) => {
    const boton = document.createElement("button");

    boton.type = "button";
    boton.className = "option-button";

    if (opcion.estilo === "principal") {
      boton.classList.add("primary");
    }

    if (opcion.estilo === "peligro") {
      boton.classList.add("danger");
    }

    boton.textContent = opcion.texto;

    boton.addEventListener("click", () => {
      elegirOpcion(opcion);
    });

    opciones.appendChild(boton);
  });
}

// Ejecuta la elección del usuario.
function elegirOpcion(opcion) {
  // No permite navegar a nodos inexistentes.
  if (opcion.siguiente !== null &&
      typeof opcion.siguiente !== "string") {
    mostrarErrorCarga();
    return;
  }

  if (opcion.siguiente !== null &&
      !arbol.nodos[opcion.siguiente]) {
    mostrarErrorCarga();
    return;
  }

  agregarMensaje(opcion.texto, "usuario");

  if (opcion.accion === "reiniciar") {
    reiniciarChat();
    return;
  }

  if (opcion.accion === "terminar") {
    historial = [];
    nodoActual = null;
  }

  if (opcion.siguiente !== null) {
    mostrarNodo(opcion.siguiente);
  } else {
    mostrarErrorCarga();
  }
}

// Reinicia únicamente cuando el usuario pulsa el botón correspondiente.
function reiniciarChat() {
  mensajes.replaceChildren();
  historial = [];
  nodoActual = null;

  mostrarNodo(arbol.inicio, false);
}

// Carga inicial.
iniciarChat();