/* Lógica de la Aplicación */

const PDF_URL = "https://drive.google.com/file/d/1Tqx3D425b5oP4T9IQRwZ58VYlhc5T9Cb/view?usp=sharing";
const MAPA_JURISDICCION_URL = "https://drive.google.com/file/d/10BfC3v9k4GvsMJqlczQTpRrdsCt-vTha/view?usp=sharing";
const ZONAS_MAPS_URL = "https://www.google.com/maps/d/embed?mid=1lUbmQUK_E65nipknpMA6i16KNHLNBVI&ehbc=2E312F"; 
const MY_MAPS_URL = "https://www.google.com/maps/d/embed?mid=1q9r_H9K5cqbAjxtSMDrWQD2DA_2oZns&ehbc=2E312F"; 
const MAPA_ORIGINAL_QUERY = encodeURIComponent("Aconcagua 14, Ramos Mejia, Buenos Aires");
const MAPA_ORIGINAL_URL = "https://www.google.com/maps?q=Aconcagua+14,+Ramos+Mejía,+Buenos+Aires&output=embed&z=17";

let mostrandoMyMaps = false;
let mostrandoZonas = false;

// Inicialización
document.addEventListener("DOMContentLoaded", () => {
    cargarTema();
    centrarMapaInicial();
    configurarEventos();
    sincronizarBotonesActivos();
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

    // Vinculación del botón "Don Bosco" (Badge de cabecera de referencias)
    const btnDonBosco = document.getElementById('btn-don-bosco');
    if (btnDonBosco) {
        btnDonBosco.addEventListener('click', () => {
            alternarZonas(); 
        });
    }

    // Búsqueda y Validación Dinámica
    document.getElementById('busqueda').addEventListener('input', function() {
        validarYFiltrarSugerencias(this, 'sugerencias');
    });

    document.getElementById('altura').addEventListener('input', function() {
        validarYFiltrarSugerencias(this, 'sugerencias-altura');
    });

    document.getElementById('form-busqueda').addEventListener('submit', function(e) {
        e.preventDefault();
        cerrarSugerencias();
        ejecutarBusqueda();
    });
    
    // Botones de Listado e Historial con sincronización de estado activo
    const btnLista = document.getElementById('btn-lista');
    const btnHistorial = document.getElementById('btn-historial');

    if (btnLista) {
        btnLista.addEventListener('click', () => {
            alternarLista();
            sincronizarBotonesActivos();
        });
    }

    if (btnHistorial) {
        btnHistorial.addEventListener('click', () => {
            alternarHistorial();
            sincronizarBotonesActivos();
        });
    }
}

function sincronizarBotonesActivos() {
    const btnLista = document.getElementById("btn-lista");
    const btnHistorial = document.getElementById("btn-historial");
    const tablaWrapper = document.getElementById('tablaContenedor');
    const historialDropdown = document.getElementById('historial-dropdown');

    // Estado del botón Lista según visibilidad del contenedor de tabla
    if (btnLista && tablaWrapper) {
        if (tablaWrapper.style.display === "block") {
            btnLista.classList.add("is-active");
        } else {
            btnLista.classList.remove("is-active");
        }
    }

    // Estado del botón Historial según visibilidad del dropdown
    if (btnHistorial && historialDropdown) {
        if (historialDropdown.style.display === "block") {
            btnHistorial.classList.add("is-active");
        } else {
            btnHistorial.classList.remove("is-active");
        }
    }
}

function cerrarSugerencias() {
    const sug1 = document.getElementById('sugerencias');
    const sug2 = document.getElementById('sugerencias-altura');
    const historialDropdown = document.getElementById('historial-dropdown');
    if (sug1) sug1.style.display = "none";
    if (sug2) sug2.style.display = "none";
    if (historialDropdown) historialDropdown.style.display = "none";
    sincronizarBotonesActivos();
}

function toggleDarkMode(checkbox) {
    const theme = checkbox.checked ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
}

function toggleMenu() {
    document.getElementById('navButtons').classList.toggle('active');
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
        if(btnZonas) btnZonas.classList.add('active-cam'); 
        mostrandoMyMaps = false;
        if(btnCam) btnCam.classList.remove('active-cam');
        mostrandoZonas = true;
    } else {
        mapa.src = MAPA_ORIGINAL_URL;
        if(btnZonas) btnZonas.classList.remove('active-cam');
        mostrandoZonas = false;
    }
    document.getElementById('navButtons').classList.remove('active');
}

function alternarMyMaps() {
    const mapa = document.getElementById('mapaFrame');
    const btnCam = document.getElementById('btn-cam');
    const btnZonas = document.getElementById('btn-zonas');
    const CONTRASENA_ACCESO = "CAMDB"; 

    if (!mostrandoMyMaps) {
        const passwordIngresada = prompt("Ingrese la contraseña de seguridad para acceder a CAM:");
        if (passwordIngresada === null) return; 
        if (passwordIngresada !== CONTRASENA_ACCESO) {
            alert("❌ Contraseña incorrecta. Acceso denegado.");
            return; 
        }
    }

    if (!mostrandoMyMaps) {
        mapa.src = MY_MAPS_URL;
        if(btnCam) btnCam.classList.add('active-cam');
        mostrandoZonas = false;
        if(btnZonas) btnZonas.classList.remove('active-cam');
        mostrandoMyMaps = true;
    } else {
        mapa.src = MAPA_ORIGINAL_URL;
        if(btnCam) btnCam.classList.remove('active-cam');
        mostrandoMyMaps = false;
    }
    document.getElementById('navButtons').classList.remove('active');
}

function alternarLista() {
    const cuerpoTabla = document.getElementById('cuerpoTabla');
    const tablaWrapper = document.getElementById('tablaContenedor');
    const mensaje = document.getElementById('mensaje-resultado');
    const historialDropdown = document.getElementById('historial-dropdown');
    
    // Si el historial está abierto, ciérralo para que no se superpongan
    if (historialDropdown) historialDropdown.style.display = "none";

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
    sincronizarBotonesActivos();
}

function ejecutarBusqueda() {
    const busquedaInput = document.getElementById('busqueda').value.trim().toLowerCase();
    const alturaInput = document.getElementById('altura').value.trim();
    const mensaje = document.getElementById('mensaje-resultado');
    const tablaWrapper = document.getElementById('tablaContenedor');
    const cuerpoTabla = document.getElementById('cuerpoTabla');
    
    cuerpoTabla.innerHTML = "";
    
    if (busquedaInput === "") {
        mensaje.innerHTML = "⚠️ INGRESE EL NOMBRE DE UNA CALLE.";
        mensaje.className = "status-error";
        mensaje.style.display = "block";
        tablaWrapper.style.display = "none";
        sincronizarBotonesActivos();
        return;
    }

    guardarEnHistorial(document.getElementById('busqueda').value.trim(), alturaInput);

    const resultadosCalle1 = baseDeDatos.filter(c => 
        c.nombre.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
        .includes(busquedaInput.normalize("NFD").replace(/[̀-ͯ]/g, ""))
    );

    const esNumero = /^\d+$/.test(alturaInput);

    if (resultadosCalle1.length === 0) {
        if (alturaInput !== "" && esNumero) {
            tablaWrapper.style.display = "none";
            mensaje.innerHTML = `⚠️ CALLE FUERA DE LA BASE DE DATOS.<br>Mostrando ubicación aproximada en el mapa.`;
            mensaje.className = "status-fuera";
            mensaje.style.display = "block";
            actualizarMapa(document.getElementById('busqueda').value, alturaInput);
            sincronizarBotonesActivos();
            return;
        } else {
            mensaje.innerHTML = `❌ CALLE INEXISTENTE O FUERA DE JURISDICCIÓN.<br>No se encontró "${document.getElementById('busqueda').value}" en la base de datos.`;
            mensaje.className = "status-error";
            mensaje.style.display = "block";
            tablaWrapper.style.display = "none";
            sincronizarBotonesActivos();
            return;
        }
    }

    if (alturaInput !== "" && !esNumero) {
        const calle2Normalizada = alturaInput.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
        
        const resultadosCalle2 = baseDeDatos.filter(c => 
            c.nombre.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").includes(calle2Normalizada)
        );

        if (resultadosCalle2.length === 0) {
            mensaje.innerHTML = `❌ CRUCE INEXISTENTE.<br>La calle secundaria "${alturaInput}" no figura en la base de datos.`;
            mensaje.className = "status-error";
            mensaje.style.display = "block";
            tablaWrapper.style.display = "none";
            sincronizarBotonesActivos();
            return;
        }

        resultadosCalle1.forEach(calle => {
            const tr = document.createElement('tr');
            const notaHtml = calle.observacion ? `<span class="nota-calle">📌 ${calle.observacion}</span>` : '';
            tr.innerHTML = `<td><strong>${calle.nombre}</strong>${notaHtml}</td><td>${calle.desde} al ${calle.hasta}</td><td><span class="tag-zona">Zona ${calle.zona}</span></td>`;
            cuerpoTabla.appendChild(tr);
        });
        tablaWrapper.style.display = "block";

        const tramoPrincipal = resultadosCalle1[0]; 
        
        mensaje.innerHTML = `📍 INTERSECCIÓN: ${tramoPrincipal.nombre} e/ ${alturaInput}.<br>Verifique la cartografía abajo. Zona general aproximada: ZONA ${tramoPrincipal.zona}`;
        mensaje.className = "status-ok";
        mensaje.style.display = "block";
        
        actualizarMapaCruce(tramoPrincipal.nombre, alturaInput);

    } else {
        resultadosCalle1.forEach(calle => {
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
            const tramoManual = resultadosCalle1.find(c => alturaNum >= c.desde && alturaNum <= c.hasta);
            if (tramoManual) {
                validarAlturaEspecifica(tramoManual);
            } else {
                mensaje.innerHTML = "🔍 CALLE ENCONTRADA, ALTURA FUERA DE RANGO. TOQUE LA LISTA PARA VERIFICAR.";
                mensaje.className = "status-fuera";
                mensaje.style.display = "block";
                actualizarMapa(resultadosCalle1[0].nombre, alturaNum);
            }
        } else {
            mensaje.innerHTML = "💡 SE ENCONTRARON " + resultadosCalle1.length + " TRAMOS. TOQUE UNO PARA VERIFICAR.";
            mensaje.className = "status-ok";
            mensaje.style.display = "block";
        }
    }
    sincronizarBotonesActivos();
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
    
    // Lógica para mostrar el botón flotante
    const btnIr = document.getElementById('btn-ir-flotante');
    if (btnIr) {
        btnIr.style.display = "flex";
        btnIr.href = `https://www.google.com/maps/dir/?api=1&destination=${query}`;
    }
}

function actualizarMapaCruce(calle1, calle2) {
    const query = encodeURIComponent(`${calle1} y ${calle2}, Ramos Mejía, Buenos Aires`);
    document.getElementById('mapaFrame').src = `https://maps.google.com/maps?q=${query}&output=embed`;
    
    // Lógica para mostrar el botón flotante
    const btnIr = document.getElementById('btn-ir-flotante');
    if (btnIr) {
        btnIr.style.display = "flex";
        btnIr.href = `https://www.google.com/maps/dir/?api=1&destination=${query}`;
    }
}

function validarYFiltrarSugerencias(input, idContenedor) {
    if (idContenedor === 'sugerencias') {
        input.value = input.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ ]/g, "");
    } else {
        input.value = input.value.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ ]/g, "");
    }
    
    const texto = input.value.trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    const contenedorSugerencias = document.getElementById(idContenedor);
    
    if (!contenedorSugerencias) return;
    
    if (texto === "" || /^\d+$/.test(texto)) {
        contenedorSugerencias.style.display = "none";
        return;
    }

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

function guardarEnHistorial(calle, altura) {
    if (!calle) return;
    let historial = JSON.parse(localStorage.getItem('historialBusquedas')) || [];
    
    let textoBusqueda = calle;
    if (altura) {
        textoBusqueda += ` (${altura})`;
    }

    // Obtenemos la fecha y hora actual formateada
    const ahora = new Date();
    const fechaFormateada = ahora.toLocaleDateString() + ' ' + ahora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Filtramos para evitar duplicados exactos del texto de búsqueda
    historial = historial.filter(item => item.texto !== textoBusqueda);
    
    // Guardamos el objeto con texto y fecha al principio del arreglo
    historial.unshift({ texto: textoBusqueda, fecha: fechaFormateada });
    
    if (historial.length > 10) {
        historial.pop();
    }

    localStorage.setItem('historialBusquedas', JSON.stringify(historial));
}

function alternarHistorial() {
    const dropdown = document.getElementById('historial-dropdown');
    const tablaWrapper = document.getElementById('tablaContenedor');
    
    if (!dropdown) return;

    // Si la tabla está abierta, ciérrala para que no se superpongan
    if (tablaWrapper) tablaWrapper.style.display = "none";

    if (dropdown.style.display === "block") {
        dropdown.style.display = "none";
        sincronizarBotonesActivos();
        return;
    }

    const historial = JSON.parse(localStorage.getItem('historialBusquedas')) || [];
    dropdown.innerHTML = "";

    if (historial.length === 0) {
        dropdown.innerHTML = `<div class="sugerencia-item" style="color: gray; cursor: default;">No hay búsquedas recientes</div>`;
    } else {
        const headerDiv = document.createElement('div');
        headerDiv.className = 'sugerencia-item';
        headerDiv.style.fontWeight = 'bold';
        headerDiv.style.borderBottom = '1px solid #ddd';
        headerDiv.innerHTML = `<span>Búsquedas recientes</span> <i class="fa-solid fa-trash" id="limpiar-historial" title="Borrar historial" style="float: right; cursor: pointer; color: #dc3545;"></i>`;
        
        headerDiv.querySelector('#limpiar-historial').onclick = (e) => {
            e.stopPropagation();
            localStorage.removeItem('historialBusquedas');
            alternarHistorial();
        };
        dropdown.appendChild(headerDiv);

        historial.forEach(item => {
            const div = document.createElement('div');
            div.className = 'sugerencia-item';
            
            // Renderizamos la búsqueda y agregamos la fecha a la derecha de forma más pequeña
            div.innerHTML = `<span>${item.texto}</span> <small style="float: right; color: #888; font-size: 0.8em;">${item.fecha}</small>`;
            
            div.onclick = function() {
                const match = item.texto.match(/^(.*?)(?:\s*\((.*?)\))?$/);
                if (match) {
                    document.getElementById('busqueda').value = match[1].trim();
                    document.getElementById('altura').value = match[2] ? match[2].trim() : '';
                } else {
                    document.getElementById('busqueda').value = item.texto;
                }
                dropdown.style.display = "none";
                sincronizarBotonesActivos();
                ejecutarBusqueda();
            };
            dropdown.appendChild(div);
        });
    }

    dropdown.style.display = "block";
    sincronizarBotonesActivos();
}

document.querySelectorAll('.zona-chips span').forEach(chip => {
    chip.addEventListener('click', () => {
        const calleNombre = chip.getAttribute('data-calle');
        const inputBusqueda = document.getElementById('busqueda');
        
        if (inputBusqueda) {
            inputBusqueda.value = calleNombre;
            inputBusqueda.dispatchEvent(new Event('input'));
            inputBusqueda.scrollIntoView({ behavior: 'smooth', block: 'center' });
            inputBusqueda.focus();
        }
    });
});

document.addEventListener('click', function(e) {
    const sug1 = document.getElementById('sugerencias');
    const sug2 = document.getElementById('sugerencias-altura');
    const historialDropdown = document.getElementById('historial-dropdown');
    const btnHistorial = document.getElementById('btn-historial');

    if (sug1 && e.target.id !== 'busqueda') sug1.style.display = "none";
    if (sug2 && e.target.id !== 'altura') sug2.style.display = "none";
    
    if (historialDropdown && !historialDropdown.contains(e.target) && e.target !== btnHistorial && !btnHistorial.contains(e.target)) {
        historialDropdown.style.display = "none";
        sincronizarBotonesActivos();
    }
});