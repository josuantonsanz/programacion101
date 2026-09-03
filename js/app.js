'use strict';

// =================================================================
// 1. FUNCIONES DE APOYO EN TIEMPO DE EJECUCIÓN
// =================================================================
let capturaActiva = null; // array donde se acumulan las líneas si estamos comprobando un ejercicio
let colaEntradas = null; // cola de valores simulados para el bloque pedir (tests con campo "entradas")
// Da formato a un valor como lo mostraría Python: None, True/False y listas con comillas simples.
function formatearValor(valor) {
  if (valor === null || valor === undefined) return 'None';
  if (Array.isArray(valor)) {
    return '[' + valor.map(item => {
      if (item === null || item === undefined) return 'None';
      if (typeof item === 'string') return "'" + item + "'";
      if (typeof item === 'boolean') return item ? 'True' : 'False';
      return String(item);
    }).join(', ') + ']';
  }
  if (typeof valor === 'boolean') return valor ? 'True' : 'False';
  return String(valor);
}
function mostrar(valor) {
  const texto = formatearValor(valor);
  if (capturaActiva) capturaActiva.push(texto);
  escribirEnConsola(texto);
}
function tipoDeES(valor) {
  if (Array.isArray(valor)) return 'lista';
  const t = typeof valor;
  if (t === 'number') return 'número';
  if (t === 'string') return 'texto';
  if (t === 'boolean') return 'booleano';
  if (t === 'function') return 'función';
  if (t === 'undefined') return 'indefinido';
  if (valor === null) return 'nulo';
  return t;
}
// input() simulado: en los tests consume la cola de "entradas" del ejercicio;
// en ejecución normal abre un diálogo del navegador (como escribir en la terminal).
function entrada(mensaje) {
  if (colaEntradas !== null) {
    const valor = colaEntradas.length ? colaEntradas.shift() : '';
    escribirEnConsola((mensaje ? mensaje + ' ' : '') + '› ' + valor);
    return valor;
  }
  if (typeof window !== 'undefined' && typeof window.prompt === 'function') {
    return window.prompt(mensaje || '') || '';
  }
  return '';
}
// palabra[i] con índices negativos (como en Python)
function charEn(texto, pos) {
  pos = Number(pos);
  if (pos < 0) pos = texto.length + pos;
  return texto[pos];
}
// lista[i] con índices negativos (como en Python)
function elementoEn(lista, pos) {
  pos = Number(pos);
  if (pos < 0) pos = lista.length + pos;
  return lista[pos];
}
// range() simulado: devuelve un array. rango(a), rango(a, b), rango(a, b, c) con paso negativo.
function rango(inicio, fin, paso) {
  inicio = Number(inicio);
  if (fin === undefined || fin === null) { fin = inicio; inicio = 0; }
  paso = (paso === undefined || paso === null) ? 1 : Number(paso);
  const resultado = [];
  if (paso > 0) {
    for (let i = inicio; i < fin; i += paso) resultado.push(i);
  } else {
    for (let i = inicio; i > fin; i += paso) resultado.push(i);
  }
  return resultado;
}
// list.sort() como en Python: números por valor, textos alfabéticamente.
function ordenarLista(lista) {
  lista.sort(function(a, b) {
    if (typeof a === 'number' && typeof b === 'number') return a - b;
    if (typeof a === 'string' && typeof b === 'string') {
      return a < b ? -1 : a > b ? 1 : 0;
    }
    const sa = String(a), sb = String(b);
    return sa < sb ? -1 : sa > sb ? 1 : 0;
  });
  return lista;
}
function escribirEnConsola(texto, esError) {
  const consola = document.getElementById('consola');
  if (consola.querySelector('.vacio')) consola.innerHTML = '';
  const linea = document.createElement('div');
  if (esError) linea.className = 'linea-error';
  linea.textContent = (esError ? '⚠️ ' : '› ') + texto;
  consola.appendChild(linea);
  consola.scrollTop = consola.scrollHeight;
}

// =================================================================
// 2. CARGA DEL TEMARIO DESDE data/temario.json
// =================================================================
let TEMARIO = [];

async function cargarTemario() {
  const respuesta = await fetch('data/temario.json');
  if (!respuesta.ok) throw new Error('HTTP ' + respuesta.status);
  const datos = await respuesta.json();
  TEMARIO = datos.capitulos;
  // Asociar a cada ejemplo/ejercicio su función de construcción (si existe)
  TEMARIO.forEach(cap => {
    cap.ejemplos.forEach(ej => { if (CONSTRUCTORES[ej.id]) ej.construir = CONSTRUCTORES[ej.id]; });
    cap.tests.forEach(t => { if (CONSTRUCTORES[t.id]) t.construir = CONSTRUCTORES[t.id]; });
  });
}

// =================================================================
// 2.5 PARCH: desacoplar el zoom del selector de bloques (flyout)
// del zoom del espacio de trabajo principal.
// En Blockly 12 el flyout copia la escala del workspace objetivo
// (getFlyoutScale devuelve targetWorkspace.scale), así que al hacer
// zoom en el panel principal los bloques del selector se encogían.
// Aquí fijamos la escala del flyout al 100% siempre.
// =================================================================
(function fijarEscalaFlyout() {
  const EscalaFlyout = 1;
  if (!Blockly.Flyout || !Blockly.Flyout.prototype) return;
  Blockly.Flyout.prototype.getFlyoutScale = function () { return EscalaFlyout; };
  // layout_ en VerticalFlyout/HorizontalFlyout copia targetWorkspace.scale
  // directamente; lo envolvemos para forzar la escala fija al terminar.
  [Blockly.VerticalFlyout, Blockly.HorizontalFlyout].forEach(Cls => {
    if (!Cls || !Cls.prototype || typeof Cls.prototype.layout_ !== 'function') return;
    const original = Cls.prototype.layout_;
    Cls.prototype.layout_ = function (contenido) {
      const resultado = original.call(this, contenido);
      this.workspace_.scale = this.getFlyoutScale();
      return resultado;
    };
  });
})();

// =================================================================
// 3. INICIALIZAR EL ESPACIO DE TRABAJO
// =================================================================
const workspace = Blockly.inject('blocklyDiv', {
  toolbox: construirToolbox(['mostrar']),
  grid: { spacing: 22, length: 3, colour: '#e3e3e3', snap: true },
  zoom: { controls: true, wheel: true, startScale: 0.9 },
  trashcan: true
});
window.addEventListener('resize', () => Blockly.svgResize(workspace));

// =================================================================
// 3.5 SELECTOR DE ESTILO
// =================================================================
// Mantiene la elección entre visitas y activa solamente las hojas necesarias:
// Pico + diseño sobrio, o la apariencia de pizarra original. Se usa `media`
// para seleccionar de forma explícita qué hojas participan en la cascada.
const selectorEstilo = document.getElementById('selectorEstilo');
const basePico = document.getElementById('basePico');
const estiloSobrio = document.getElementById('estiloSobrio');
const estiloPizarra = document.getElementById('estiloPizarra');

function activarHojaDeEstilo(hoja, activa) {
  // Las tres hojas se cargan sin el atributo `disabled`. `not all` impide que
  // sus reglas participen en la cascada y cambiarlo a `all` es fiable.
  hoja.disabled = false;
  hoja.media = activa ? 'all' : 'not all';
}

function aplicarEstilo(nombre) {
  const esPizarra = nombre === 'pizarra';
  activarHojaDeEstilo(basePico, !esPizarra);
  activarHojaDeEstilo(estiloSobrio, !esPizarra);
  activarHojaDeEstilo(estiloPizarra, esPizarra);
  selectorEstilo.value = esPizarra ? 'pizarra' : 'sobrio';
  document.documentElement.dataset.estilo = selectorEstilo.value;

  try { localStorage.setItem('estiloBloques', selectorEstilo.value); }
  catch (e) { /* La página sigue funcionando si el almacenamiento está bloqueado. */ }

  requestAnimationFrame(() => Blockly.svgResize(workspace));
}

let estiloGuardado = 'sobrio';
try { estiloGuardado = localStorage.getItem('estiloBloques') || 'sobrio'; }
catch (e) { /* Usar el estilo sobrio por defecto. */ }
aplicarEstilo(estiloGuardado);
selectorEstilo.addEventListener('change', () => aplicarEstilo(selectorEstilo.value));

// =================================================================
// 4. NAVEGACIÓN: temario → capítulo → ejemplo/test
// =================================================================
let capituloActual = null;
let contenidoActual = null;
let modoActual = null; // 'ejemplo' | 'test'

function renderTemario() {
  const cont = document.getElementById('temario');
  cont.innerHTML = '';
  TEMARIO.forEach(tema => {
    const btn = document.createElement('button');
    btn.className = 'bloque-btn tema-btn';
    btn.innerHTML = tema.numero + '. ' + tema.titulo + '<small>' + tema.ejemplos.length + ' ejemplos · ' + tema.tests.length + ' ejercicios</small>';
    btn.dataset.id = tema.id;
    btn.addEventListener('click', () => seleccionarCapitulo(tema.id));
    cont.appendChild(btn);
  });
}

function seleccionarCapitulo(id) {
  capituloActual = TEMARIO.find(t => t.id === id);
  document.querySelectorAll('#temario .bloque-btn').forEach(b => {
    const activo = (b.dataset.id === id);
    b.dataset.active = activo ? 'true' : 'false';
    b.classList.toggle('acento', activo);
  });

  document.getElementById('panelCapitulo').style.display = 'block';
  document.getElementById('tituloCapitulo').textContent = capituloActual.numero + '. ' + capituloActual.titulo;
  document.getElementById('resumenCapitulo').textContent = capituloActual.resumen;

  const listaEj = document.getElementById('listaEjemplos');
  listaEj.innerHTML = '';
  capituloActual.ejemplos.forEach((ej, i) => {
    const btn = document.createElement('button');
    btn.className = 'bloque-btn suave';
    btn.textContent = ej.titulo;
    btn.addEventListener('click', () => seleccionarContenido('ejemplo', i));
    listaEj.appendChild(btn);
  });

  const listaTest = document.getElementById('listaTests');
  listaTest.innerHTML = '';
  capituloActual.tests.forEach((t, i) => {
    const btn = document.createElement('button');
    btn.className = 'bloque-btn suave';
    btn.textContent = t.titulo;
    btn.addEventListener('click', () => seleccionarContenido('test', i));
    listaTest.appendChild(btn);
  });

  // cargar automáticamente el primer ejemplo del capítulo
  seleccionarContenido('ejemplo', 0);
}

function seleccionarContenido(tipo, indice) {
  modoActual = tipo;
  contenidoActual = capituloActual[tipo === 'ejemplo' ? 'ejemplos' : 'tests'][indice];

  document.querySelectorAll('#listaEjemplos .bloque-btn, #listaTests .bloque-btn').forEach(b => b.dataset.active = 'false');
  const listaId = tipo === 'ejemplo' ? 'listaEjemplos' : 'listaTests';
  const botones = document.getElementById(listaId).children;
  if (botones[indice]) botones[indice].dataset.active = 'true';

  workspace.updateToolbox(construirToolbox(capituloActual.bloques));
  workspace.clear();

  // Un ejemplo/ejercicio puede venir montado de dos formas:
  //  - "estado": JSON nativo de Blockly (exportado desde el panel del profesor)
  //  - "construir": función de js/constructores.js asociada por id
  if (contenidoActual.estado) {
    Blockly.serialization.workspaces.load(contenidoActual.estado, workspace);
  } else if (contenidoActual.construir) {
    contenidoActual.construir();
  }
  workspace.cleanUp();

  const infoDiv = document.getElementById('infoContenido');
  if (tipo === 'ejemplo') {
    infoDiv.innerHTML =
      '<div class="info-contenido"><span class="badge-tipo">Ejemplo</span><br><strong>' + contenidoActual.titulo + '</strong><br>' + contenidoActual.explicacion + '</div>';
  } else {
    infoDiv.innerHTML =
      '<div class="info-contenido test"><span class="badge-tipo test">Ejercicio</span><br><strong>' + contenidoActual.titulo + '</strong><br>' + contenidoActual.enunciado +
      '<br><button class="explicacion-toggle" id="btnPista">💡 Ver explicación</button><div class="explicacion-caja" id="cajaPista">' + contenidoActual.explicacion + '</div></div>';
    document.getElementById('btnPista').addEventListener('click', () => {
      document.getElementById('cajaPista').classList.toggle('visible');
    });
  }

  document.getElementById('btnEjecutar').textContent = tipo === 'test' ? '✔ Ejecutar y comprobar' : '▶ Ejecutar';
  document.getElementById('btnReiniciar').style.display = tipo === 'test' ? 'inline-block' : 'none';
  document.getElementById('veredicto').innerHTML = '';
  document.getElementById('consola').innerHTML = '<span class="vacio">Pulsa «Ejecutar» para ver aquí lo que muestra el programa…</span>';

  document.getElementById('panelTrabajo').style.display = 'block';
  document.getElementById('panelResultado').style.display = 'block';
  actualizarCodigo();
}

// =================================================================
// 5. CÓDIGO GENERADO / EJECUCIÓN / COMPROBACIÓN
// =================================================================
// Blockly añade al inicio una asignación `variable = None` por cada variable
// del espacio. Es útil para su generador, pero distrae al leer el programa.
// Solo se elimina ese bloque inicial; una asignación a None creada por el
// alumnado, que aparece después, se conserva.
function ocultarDeclaracionesInicialesDeBlockly(codigo) {
  const lineas = codigo.split(/\r?\n/);
  const esDeclaracion = /^[\p{L}_][\p{L}\p{N}_]* = None$/u;
  let posicion = 0;

  while (posicion < lineas.length && !lineas[posicion].trim()) posicion++;
  const inicioDeclaraciones = posicion;
  while (posicion < lineas.length && esDeclaracion.test(lineas[posicion])) posicion++;

  if (posicion === inicioDeclaraciones) return codigo.trim();
  while (posicion < lineas.length && !lineas[posicion].trim()) posicion++;
  return lineas.slice(posicion).join('\n').trim();
}

function escaparHTML(texto) {
  return texto.replace(/[&<>"']/g, caracter => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[caracter]);
}

// Resaltado ligero y local: no incorpora otra dependencia ni interpreta el
// código como HTML. Cubre el Python que genera Blockly (comentarios, cadenas,
// palabras reservadas, funciones incorporadas y números).
const patronPython = /((?:br|rb|fr|rf|r|u|b|f)?(?:"(?:\\.|[^"\\\r\n])*"|'(?:\\.|[^'\\\r\n])*'))|(#[^\r\n]*)|\b(and|as|assert|async|await|break|case|class|continue|def|del|elif|else|except|False|finally|for|from|global|if|import|in|is|lambda|match|None|nonlocal|not|or|pass|raise|return|True|try|while|with|yield)\b|\b(bool|dict|enumerate|float|input|int|len|list|max|min|print|range|set|sorted|str|sum|tuple|type|zip)\b|\b(0[xob][0-9a-f_]+|\d[\d_]*(?:\.[\d_]*)?(?:e[+-]?[\d_]+)?j?)\b/gi;

function resaltarPython(codigo) {
  let hasta = 0;
  let resultado = '';

  // No se usa String#replace aquí: esa API conserva automáticamente el texto
  // no coincidente. Como ya añadimos ese texto escapado entre coincidencias,
  // usarla duplicaría fragmentos como `a = a = 10`.
  for (const coincidencia of codigo.matchAll(patronPython)) {
    const [texto, cadena, comentario, palabra, funcion] = coincidencia;
    const posicion = coincidencia.index;
    resultado += escaparHTML(codigo.slice(hasta, posicion));
    const clase = cadena ? 'py-cadena'
      : comentario ? 'py-comentario'
        : palabra ? 'py-palabra'
          : funcion ? 'py-funcion' : 'py-numero';
    resultado += '<span class="' + clase + '">' + escaparHTML(texto) + '</span>';
    hasta = posicion + texto.length;
  }
  return resultado + escaparHTML(codigo.slice(hasta));
}

function mostrarCodigoPython(codigo) {
  const codigoVisible = ocultarDeclaracionesInicialesDeBlockly(codigo) || '# (espacio de trabajo vacío)';
  document.getElementById('codigoGenerado').innerHTML = resaltarPython(codigoVisible);
}

function actualizarCodigo() {
  try {
    mostrarCodigoPython(Blockly.Python.workspaceToCode(workspace));
  } catch (e) { /* ignorar mientras el usuario edita */ }
}
workspace.addChangeListener(() => actualizarCodigo());

document.getElementById('btnEjecutar').addEventListener('click', () => {
  const consola = document.getElementById('consola');
  consola.innerHTML = '';
  document.getElementById('veredicto').innerHTML = '';

  let codigoPython;
  try { codigoPython = Blockly.Python.workspaceToCode(workspace); }
  catch (e) { consola.innerHTML = '<span class="linea-error">⚠️ No se pudo generar el código: ' + e.message + '</span>'; return; }
  mostrarCodigoPython(codigoPython);

  let codigoJS;
  try { codigoJS = Blockly.JavaScript.workspaceToCode(workspace); }
  catch (e) { consola.innerHTML = '<span class="linea-error">⚠️ No se pudo ejecutar: ' + e.message + '</span>'; return; }

  capturaActiva = (modoActual === 'test') ? [] : null;
  colaEntradas = (modoActual === 'test' && Array.isArray(contenidoActual.entradas)) ? contenidoActual.entradas.slice() : null;
  try {
    const fn = new Function('mostrar', 'tipoDeES', 'entrada', 'charEn', 'elementoEn', 'rango', 'ordenarLista', codigoJS);
    fn(mostrar, tipoDeES, entrada, charEn, elementoEn, rango, ordenarLista);
    if (!consola.innerHTML) consola.innerHTML = '<span class="vacio">El programa no mostró ningún resultado.</span>';
  } catch (e) {
    escribirEnConsola(e.message, true);
    capturaActiva = null;
    colaEntradas = null;
    return;
  }
  colaEntradas = null;

  if (modoActual === 'test') {
    const esperado = contenidoActual.resultadoEsperado;
    const obtenido = capturaActiva;
    const correcto = esperado.length === obtenido.length && esperado.every((linea, i) => linea === obtenido[i]);
    const veredictoDiv = document.getElementById('veredicto');
    if (correcto) {
      veredictoDiv.innerHTML = '<div class="veredicto correcto">✅ ¡Correcto! El resultado coincide con lo esperado.</div>';
    } else {
      veredictoDiv.innerHTML = '<div class="veredicto incorrecto">❌ Todavía no es el resultado esperado. Revisa tu programa e inténtalo de nuevo.</div>';
    }
    capturaActiva = null;
  }
});

document.getElementById('btnReiniciar').addEventListener('click', () => {
  const indice = capituloActual[modoActual === 'ejemplo' ? 'ejemplos' : 'tests'].indexOf(contenidoActual);
  seleccionarContenido(modoActual, indice);
});

document.getElementById('btnLimpiar').addEventListener('click', () => {
  workspace.clear();
  document.getElementById('consola').innerHTML = '<span class="vacio">Pulsa «Ejecutar» para ver aquí lo que muestra el programa…</span>';
  document.getElementById('veredicto').innerHTML = '';
  actualizarCodigo();
});

// =================================================================
// 6. PANEL DEL PROFESOR: exportar JSON nativo de Blockly
// =================================================================
document.getElementById('btnExportar').addEventListener('click', () => {
  const estado = Blockly.serialization.workspaces.save(workspace);
  const caja = document.getElementById('cajaExportar');
  caja.style.display = 'block';
  caja.value = JSON.stringify(estado, null, 2);
  caja.focus();
  caja.select();
});

// =================================================================
// 7. ARRANQUE
// =================================================================
async function iniciar() {
  try {
    await cargarTemario();
  } catch (error) {
    document.getElementById('temario').innerHTML =
      '<div class="info-contenido"><strong>⚠️ No se pudo cargar data/temario.json.</strong><br>' +
      'Si abriste la página con doble clic (protocolo file://), el navegador bloquea la carga de archivos JSON locales.<br>' +
      'Abre una terminal en la carpeta del proyecto y ejecuta:<br><code>python -m http.server 8000</code><br>' +
      '(si no te funciona, prueba <code>py -m http.server 8000</code>)<br>' +
      'y después entra en <a href="http://localhost:8000" target="_blank" rel="noopener">http://localhost:8000</a>.</div>';
    return;
  }
  renderTemario();
  seleccionarCapitulo(TEMARIO[0].id);
}
iniciar();
