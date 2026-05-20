/* Lógica de la Aplicación */

const PDF_URL = "https://drive.google.com/file/d/1G71uogoFE6boorXlvMoWBKSQkKwGjj4x/view?usp=sharing";
const MAPA_JURISDICCION_URL = "https://drive.google.com/file/d/10BfC3v9k4GvsMJqlczQTpRrdsCt-vTha/view?usp=sharing";
const ZONAS_MAPS_URL = "https://www.google.com/maps/d/embed?mid=1lUbmQUK_E65nipknpMA6i16KNHLNBVI&ehbc=2E312F"; 
const MY_MAPS_URL = "https://www.google.com/maps/d/embed?mid=1q9r_H9K5cqbAjxtSMDrWQD2DA_2oZns&ehbc=2E312F"; 
const MAPA_ORIGINAL_QUERY = encodeURIComponent("Aconcagua 14, Ramos Mejia, Buenos Aires");
const MAPA_ORIGINAL_URL = `https://www.google.com/maps?q=$$${MAPA_ORIGINAL_QUERY}&output=embed`;

let mostrandoMyMaps = false;
let mostrandoZonas = false;

// Inicialización
document.addEventListener("DOMContentLoaded", () => {
    cargarTema();
    centrarMapaInicial();
    configurarEventos();
});

function cargarTema() {
    const currentTheme = localStorage.getItem('theme') || 'light';
    const checkbox = document.getElementById('checkbox');
    if (currentTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        if(checkbox) checkbox.checked = true;
    }
}

function centrarMapaInicial() {
    const mapa = document.getElementById('mapaFrame');
    if (mapa) mapa.src = MAPA_ORIGINAL_URL;
}

function configurarEventos() {
    // Modo Oscuro
    document.getElementById('checkbox').addEventListener('change', function() {
        toggleDarkMode(this);
    });

    // Menú Hamburguesa
    document.getElementById('btn-hamburger').addEventListener('click', toggleMenu);

    // Navegación
    document.getElementById('btn-cam').addEventListener('click', alternarMyMaps);
    document.getElementById('btn-zonas').addEventListener('click', alternarZonas);
    document.getElementById('btn-pdf').addEventListener('click', descargarPDF);
    document.getElementById('btn-imprimir').addEventListener('click', imprimirMapa);

    // Búsqueda y Validación (Modificado para acoplar el buscador dinámico)
    document.getElementById('busqueda').addEventListener('input', function() {
        validarYFiltrarSugerencias(this);
    });
    document.getElementById('altura').addEventListener('input', function() {
        validarAltura(this);
    });
    document.getElementById('form-busqueda').addEventListener('submit', function(e) {
        e.preventDefault();
        // Cerrar sugerencias al enviar
        const sugerencias = document.getElementById('sugerencias');
        if (sugerencias) sugerencias.style.display = "none";
        ejecutarBusqueda();
    });
    document.getElementById('btn-lista').addEventListener('click', alternarLista);
}

function toggleDarkMode(checkbox) {
    const theme = checkbox.checked ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
}

function toggleMenu() {
    document.getElementById('navButtons').classList.toggle('active');
}

function validarSoloLetras(input) {
    input.value = input.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ ]/g, "");
}

function validarAltura(input) {
    input.value = input.value.replace(/\D/g, "");
    if (input.value > 99999) input.value = 99999;
}

function descargarPDF() { 
    window.open(PDF_URL, '_blank'); 
    document.getElementById('navButtons').classList.remove('active');
}

function imprimirMapa() {
    const busqueda = document.getElementById('busqueda').value;
    const mensaje = document.getElementById('mensaje-resultado');
    document.getElementById('navButtons').classList.remove('active');

    if (busqueda === "" || mensaje.style.display === "none") {
        alert("Debe realizar una búsqueda válida antes de imprimir.");
        return;
    }

    const tituloOriginal = document.title;
    document.title = `REPORTE_${busqueda.toUpperCase()}`;
    window.print();
    document.title = tituloOriginal;
}

function alternarZonas() {
    const mapa = document.getElementById('mapaFrame');
    const btnZonas = document.getElementById('btn-zonas');
    const btnCam = document.getElementById('btn-cam');

    if (!mostrandoZonas) {
        mapa.src = ZONAS_MAPS_URL;
        btnZonas.classList.add('active-cam'); 
        mostrandoMyMaps = false;
        btnCam.classList.remove('active-cam');
        mostrandoZonas = true;
    } else {
        mapa.src = MAPA_ORIGINAL_URL;
        btnZonas.classList.remove('active-cam');
        mostrandoZonas = false;
    }
    document.getElementById('navButtons').classList.remove('active');
}

function alternarMyMaps() {
    const mapa = document.getElementById('mapaFrame');
    const btnCam = document.getElementById('btn-cam');
    const btnZonas = document.getElementById('btn-zonas');

    if (!mostrandoMyMaps) {
        mapa.src = MY_MAPS_URL;
        btnCam.classList.add('active-cam');
        mostrandoZonas = false;
        if(btnZonas) btnZonas.classList.remove('active-cam');
        mostrandoMyMaps = true;
    } else {
        mapa.src = MAPA_ORIGINAL_URL;
        btnCam.classList.remove('active-cam');
        mostrandoMyMaps = false;
    }
    document.getElementById('navButtons').classList.remove('active');
}

function alternarLista() {
    const cuerpoTabla = document.getElementById('cuerpoTabla');
    const tablaWrapper = document.getElementById('tablaContenedor');
    const mensaje = document.getElementById('mensaje-resultado');
    
    if (tablaWrapper.style.display === "block") {
        tablaWrapper.style.display = "none";
    } else {
        mensaje.style.display = "none";
        cuerpoTabla.innerHTML = "";
        baseDeDatos.forEach(c => {
            const tr = document.createElement('tr');
            const notaHtml = c.observacion ? `<span class="nota-calle">📌 ${c.observacion}</span>` : '';
            tr.innerHTML = `<td><strong>${c.nombre}</strong>${notaHtml}</td><td>${c.desde} al ${c.hasta}</td><td><span class="tag-zona">Zona ${c.zona}</span></td>`;
            tr.onclick = () => { document.getElementById('busqueda').value = c.nombre; ejecutarBusqueda(); };
            cuerpoTabla.appendChild(tr);
        });
        tablaWrapper.style.display = "block";
    }
}

function ejecutarBusqueda() {
    const busquedaInput = document.getElementById('busqueda').value.trim().toLowerCase();
    const alturaInput = document.getElementById('altura').value;
    const mensaje = document.getElementById('mensaje-resultado');
    const tablaWrapper = document.getElementById('tablaContenedor');
    const cuerpoTabla = document.getElementById('cuerpoTabla');
    
    cuerpoTabla.innerHTML = "";
    
    if (busquedaInput === "") {
        mensaje.innerHTML = "⚠️ INGRESE EL NOMBRE DE UNA CALLE.";
        mensaje.className = "status-error";
        mensaje.style.display = "block";
        tablaWrapper.style.display = "none";
        return;
    }

    const resultados = baseDeDatos.filter(c => 
        c.nombre.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
        .includes(busquedaInput.normalize("NFD").replace(/[̀-ͯ]/g, ""))
    );

    if (resultados.length === 0) {
        mensaje.innerHTML = "❌ CALLE NO ENCONTRADA - FUERA DE JURISDICCIÓN.";
        mensaje.className = "status-error";
        mensaje.style.display = "block";
        tablaWrapper.style.display = "none";
        return;
    }

    resultados.forEach(calle => {
        const tr = document.createElement('tr');
        const notaHtml = calle.observacion ? `<span class="nota-calle">📌 ${calle.observacion}</span>` : '';
        tr.innerHTML = `<td><strong>${calle.nombre}</strong>${notaHtml}</td><td>${calle.desde} al ${calle.hasta}</td><td><span class="tag-zona">Zona ${calle.zona}</span></td>`;
        tr.onclick = () => { 
            document.getElementById('busqueda').value = calle.nombre; 
            validarAlturaEspecifica(calle); 
        };
        cuerpoTabla.appendChild(tr);
    });

    tablaWrapper.style.display = "block";
    
    if (alturaInput !== "") {
        const alturaNum = parseInt(alturaInput);
        const tramoManual = resultados.find(c => alturaNum >= c.desde && alturaNum <= c.hasta);
        if (tramoManual) {
            validarAlturaEspecifica(tramoManual);
        } else {
            mensaje.innerHTML = "🔍 CALLE ENCONTRADA, ALTURA FUERA DE RANGO. TOQUE LA LISTA PARA VERIFICAR.";
            mensaje.className = "status-fuera";
            mensaje.style.display = "block";
        }
    } else {
        mensaje.innerHTML = "💡 SE ENCONTRARON " + resultados.length + " TRAMOS. TOQUE UNO PARA VERIFICAR.";
        mensaje.className = "status-ok";
        mensaje.style.display = "block";
    }
}

function validarAlturaEspecifica(calleSeleccionada) {
    const alturaInput = document.getElementById('altura').value;
    const alturaNum = parseInt(alturaInput);
    const mensaje = document.getElementById('mensaje-resultado');
    
    if (isNaN(alturaNum)) {
        mensaje.innerHTML = `📍 SELECCIONADO: ${calleSeleccionada.nombre}. <br> INGRESE ALTURA PARA VERIFICAR ZONA EXACTA.`;
        mensaje.className = "status-ok";
        mensaje.style.display = "block";
        actualizarMapa(calleSeleccionada.nombre, calleSeleccionada.desde);
        return;
    }

    const tramoCorrecto = baseDeDatos.find(c => 
        c.nombre.toLowerCase() === calleSeleccionada.nombre.toLowerCase() && 
        alturaNum >= c.desde && 
        alturaNum <= c.hasta
    );

    if (tramoCorrecto) {
        const esPar = (alturaNum % 2 === 0);
        if (tramoCorrecto.limite) {
            if ((tramoCorrecto.limite === "par" && !esPar) || (tramoCorrecto.limite === "impar" && esPar)) {
                mensaje.innerHTML = `⚠️ ALTURA EN RANGO PERO VEREDA OPUESTA. <br> ${tramoCorrecto.observacion || 'JURISDICCION VECINA'}`;
                mensaje.className = "status-fuera";
            } else {
                mensaje.innerHTML = `✅ JURISDICCIÓN CORRECTA. <br> COMISARÍA NORTE 8VA DON BOSCO - ZONA ${tramoCorrecto.zona}`;
                mensaje.className = "status-ok";
            }
        } else {
            mensaje.innerHTML = `✅ ALTURA DENTRO DE LA JURISDICCIÓN. <br> ZONA ${tramoCorrecto.zona} - COMISARÍA NORTE 8VA DON BOSCO`;
            mensaje.className = "status-ok";
        }
    } else {
        if (alturaNum < calleSeleccionada.desde) {
            mensaje.innerHTML = `❌ FUERA DE JURISDICCIÓN. <br> CORRESPONDE A: ${calleSeleccionada.bajo}`;
        } else {
            mensaje.innerHTML = `❌ FUERA DE JURISDICCIÓN. <br> CORRESPONDE A: ${calleSeleccionada.alto}`;
        }
        mensaje.className = "status-fuera";
    }
    
    actualizarMapa(calleSeleccionada.nombre, alturaNum);
    mensaje.style.display = "block";
}

function actualizarMapa(calle, altura) {
    const query = encodeURIComponent(`${calle} ${altura}, Ramos Mejía, Buenos Aires`);
    document.getElementById('mapaFrame').src = `https://maps.google.com/maps?q=${query}&output=embed`;
}

// Nueva función unificada que evita conflictos con el filtro de entrada
function validarYFiltrarSugerencias(input) {
    // 1. Limpieza instantánea de caracteres no deseados (Lógica nativa de la app)
    input.value = input.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ ]/g, "");
    
    const texto = input.value.trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    const contenedorSugerencias = document.getElementById('sugerencias');
    
    if (!contenedorSugerencias) return;
    
    if (texto === "") {
        contenedorSugerencias.style.display = "none";
        return;
    }

    // 2. Filtrar nombres únicos de calles en baseDeDatos
    const callesFiltradas = [];
    if (typeof baseDeDatos !== 'undefined') {
        baseDeDatos.forEach(c => {
            const nombreNormalizado = c.nombre.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
            if (nombreNormalizado.includes(texto) && !callesFiltradas.includes(c.nombre)) {
                callesFiltradas.push(c.nombre);
            }
        });
    }

    if (callesFiltradas.length === 0) {
        contenedorSugerencias.style.display = "none";
        return;
    }

    // 3. Renderizar los resultados dentro de la caja flotante
    contenedorSugerencias.innerHTML = "";
    callesFiltradas.forEach(nombreCalle => {
        const div = document.createElement('div');
        div.className = 'sugerencia-item';
        div.innerText = nombreCalle;
        
        div.onclick = function() {
            input.value = nombreCalle;
            contenedorSugerencias.style.display = "none";
            ejecutarBusqueda();
        };
        contenedorSugerencias.appendChild(div);
    });

    contenedorSugerencias.style.display = "block";
}

// Ocultar la lista flotante si el usuario hace clic en el cuerpo de la web
document.addEventListener('click', function(e) {
    const contenedorSugerencias = document.getElementById('sugerencias');
    if (contenedorSugerencias && e.target.id !== 'busqueda') {
        contenedorSugerencias.style.display = "none";
    }
});
