// Elementos de tema
const body = document.body;
const oscuroRadio = document.getElementById('oscuro');
const claroRadio = document.getElementById('claro');
const languageSelector = document.getElementById('language-selector');

// Textos traducidos
const translations = {
    es: {
        title: "GuaguaTime RD",
        where: "¿A dónde vas?",
        location: "Ubicación actual",
        transport: "Tipo de transporte público",
        difficulty: "Dificultad en el camino",
        search: "Buscar rutas",
        guagua: "Guagua",
        carrito: "Carrito",
        motoconcho: "Motoconcho",
        uber: "Uber",
        lluvia: "Lluvia",
        paro: "Paro vehicular",
        horaPico: "Hora Pico",
        footer: "&copy; 2024 GuaguaTime RD. Todos los derechos reservados.",
        saveRoute: "Guardar ruta",
        routeSaved: "¡Ruta guardada exitosamente!",
        noRoute: "Por favor, complete el formulario primero",
        formIncomplete: "Por favor, complete destino y ubicación",
        receiptTitle: "Recibo de Ruta - GuaguaTime RD",
        destination: "Destino",
        currentLocation: "Ubicación Actual",
        transportTypes: "Tipos de Transporte",
        difficulties: "Dificultades",
        date: "Fecha",
        routeId: "ID de Ruta",
        savedRoutesTitle: "Rutas Guardadas",
        noSavedRoutes: "No hay rutas guardadas aún.",
        deleteRoute: "Eliminar",
        downloadReceipt: "Descargar Recibo",
        deleteAllRoutes: "Eliminar Todas las Rutas",
        exportAllRoutes: "Exportar Todas las Rutas",
        confirmDelete: "¿Estás seguro de que quieres eliminar esta ruta?",
        confirmDeleteAll: "¿Estás seguro de que quieres eliminar TODAS las rutas?",
        routeDeleted: "Ruta eliminada exitosamente",
        allRoutesDeleted: "Todas las rutas han sido eliminadas",
        exportSuccess: "Todas las rutas exportadas exitosamente",
        exportTitle: "EXPORTACIÓN DE RUTAS - GuaguaTime RD",
        exportDate: "Fecha de exportación",
        totalRoutes: "Total de rutas exportadas",
        routeNumber: "Ruta"
    },
    en: {
        title: "GuaguaTime RD",
        where: "Where are you going?",
        location: "Current location",
        transport: "Type of public transport",
        difficulty: "Road difficulty",
        search: "Search routes",
        guagua: "Bus",
        carrito: "Public Car",
        motoconcho: "Motorcycle Taxi",
        uber: "Uber",
        lluvia: "Rain",
        paro: "Traffic Stop",
        horaPico: "Rush Hour",
        footer: "&copy; 2024 GuaguaTime RD. All rights reserved.",
        saveRoute: "Save route",
        routeSaved: "Route saved successfully!",
        noRoute: "Please complete the form first",
        formIncomplete: "Please complete destination and location",
        receiptTitle: "Route Receipt - GuaguaTime RD",
        destination: "Destination",
        currentLocation: "Current Location",
        transportTypes: "Transport Types",
        difficulties: "Difficulties",
        date: "Date",
        routeId: "Route ID",
        savedRoutesTitle: "Saved Routes",
        noSavedRoutes: "No saved routes yet.",
        deleteRoute: "Delete",
        downloadReceipt: "Download Receipt",
        deleteAllRoutes: "Delete All Routes",
        exportAllRoutes: "Export All Routes",
        confirmDelete: "Are you sure you want to delete this route?",
        confirmDeleteAll: "Are you sure you want to delete ALL routes?",
        routeDeleted: "Route deleted successfully",
        allRoutesDeleted: "All routes have been deleted",
        exportSuccess: "All routes exported successfully",
        exportTitle: "ROUTES EXPORT - GuaguaTime RD",
        exportDate: "Export date",
        totalRoutes: "Total routes exported",
        routeNumber: "Route"
    }
};

function applyTheme(theme){
    if(theme === 'oscuro'){
        body.classList.add('oscuro');
        oscuroRadio.checked = true;
    } else {
        body.classList.remove('oscuro');
        claroRadio.checked = true;
    }
}

function applyLanguage(lang) {
    const t = translations[lang];
    
    // Actualizar textos
    document.title = t.title;
    document.getElementById('where-title').textContent = t.where;
    document.getElementById('location-title').textContent = t.location;
    document.getElementById('transport-title').textContent = t.transport;
    document.getElementById('difficulty-title').textContent = t.difficulty;
    document.getElementById('search-button').textContent = t.search;
    document.getElementById('footer-text').innerHTML = t.footer;
    document.getElementById('save-route').textContent = t.saveRoute;
    document.getElementById('saved-routes-title').textContent = t.savedRoutesTitle;
    document.getElementById('clear-all-routes').textContent = t.deleteAllRoutes;
    document.getElementById('export-all-routes').textContent = t.exportAllRoutes;
    
    // Actualizar labels de transporte
    document.getElementById('guagua-label').textContent = t.guagua;
    document.getElementById('carrito-label').textContent = t.carrito;
    document.getElementById('motoconcho-label').textContent = t.motoconcho;
    document.getElementById('uber-label').textContent = t.uber;
    
    // Actualizar labels de dificultad
    document.getElementById('lluvia-label').textContent = t.lluvia;
    document.getElementById('paro-label').textContent = t.paro;
    document.getElementById('horaPico-label').textContent = t.horaPico;
    
    localStorage.setItem('language', lang);
    
    // Recargar la lista de rutas para actualizar textos
    loadSavedRoutes();
}

// Cargar preferencias
const savedTheme = localStorage.getItem('theme');
const savedLanguage = localStorage.getItem('language') || 'en';

if(savedTheme){
    applyTheme(savedTheme);
} else {
    applyTheme('claro');
}

applyLanguage(savedLanguage);
languageSelector.value = savedLanguage;

// Event listeners
oscuroRadio.addEventListener('change', function(){
    if(this.checked) {
        applyTheme('oscuro');
        localStorage.setItem('theme', 'oscuro');
    }
});

claroRadio.addEventListener('change', function(){
    if(this.checked) {
        applyTheme('claro');
        localStorage.setItem('theme', 'claro');
    }
});

languageSelector.addEventListener('change', function() {
    applyLanguage(this.value);
});

// Función para generar y descargar recibo
function generateAndDownloadReceipt(route, fileName = null) {
    const t = translations[languageSelector.value];
    const timestamp = fileName || new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    
    // Crear contenido del recibo
    const receiptContent = `
${t.receiptTitle}
========================================

${t.destination}: ${route.destino}
${t.currentLocation}: ${route.ubicacion}
${t.transportTypes}: ${route.transportes.join(', ')}
${t.difficulties}: ${route.dificultades.join(', ')}
${t.date}: ${route.fecha}
${t.routeId}: ${route.id}

========================================
GuaguaTime RD - Tu compañero de transporte confiable
    `;

    // Crear archivo y descargar
    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ruta_guaguatime_${timestamp}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Función para guardar ruta
function saveCurrentRoute() {
    const destino = document.getElementById('destino').value;
    const ubicacion = document.getElementById('ubicacion').value;
    
    if (!destino || !ubicacion) {
        showAlert(translations[languageSelector.value].formIncomplete, 'error');
        return;
    }
    
    const transportes = [];
    document.querySelectorAll('.transporte input:checked').forEach(checkbox => {
        transportes.push(checkbox.nextElementSibling.textContent);
    });
    
    const dificultades = [];
    document.querySelectorAll('.efectos input:checked').forEach(checkbox => {
        dificultades.push(checkbox.nextElementSibling.textContent);
    });
    
    const route = {
        destino,
        ubicacion,
        transportes: transportes.length > 0 ? transportes : ['Ninguno seleccionado'],
        dificultades: dificultades.length > 0 ? dificultades : ['Ninguna seleccionada'],
        fecha: new Date().toLocaleString(),
        id: 'GT-' + Date.now()
    };
    
    // Obtener rutas guardadas
    let savedRoutes = JSON.parse(localStorage.getItem('savedRoutes') || '[]');
    savedRoutes.push(route);
    localStorage.setItem('savedRoutes', JSON.stringify(savedRoutes));
    
    // Generar y descargar recibo
    generateAndDownloadReceipt(route);
    
    showAlert(translations[languageSelector.value].routeSaved, 'success');
    
    // Recargar la lista de rutas guardadas
    loadSavedRoutes();
    
    // Opcional: Limpiar formulario después de guardar
    document.querySelector('form').reset();
}

// Función para cargar y mostrar rutas guardadas
function loadSavedRoutes() {
    const savedRoutes = JSON.parse(localStorage.getItem('savedRoutes') || '[]');
    const savedRoutesList = document.getElementById('saved-routes-list');
    const t = translations[languageSelector.value];
    
    savedRoutesList.innerHTML = '';
    
    if (savedRoutes.length === 0) {
        savedRoutesList.innerHTML = `<div class="empty-routes">${t.noSavedRoutes}</div>`;
        return;
    }
    
    // Ordenar rutas por fecha (más reciente primero)
    savedRoutes.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    
    savedRoutes.forEach(route => {
        const routeCard = document.createElement('div');
        routeCard.className = 'route-card';
        routeCard.innerHTML = `
            <div class="route-header">
                <div class="route-title">${route.destino}</div>
                <div class="route-date">${route.fecha}</div>
            </div>
            <div class="route-details">
                <div class="route-detail-item">
                    <span class="route-detail-label">${t.currentLocation}</span>
                    <span class="route-detail-value">${route.ubicacion}</span>
                </div>
                <div class="route-detail-item">
                    <span class="route-detail-label">${t.transportTypes}</span>
                    <span class="route-detail-value">${route.transportes.join(', ')}</span>
                </div>
                <div class="route-detail-item">
                    <span class="route-detail-label">${t.difficulties}</span>
                    <span class="route-detail-value">${route.dificultades.join(', ')}</span>
                </div>
                <div class="route-detail-item">
                    <span class="route-detail-label">${t.routeId}</span>
                    <span class="route-detail-value">${route.id}</span>
                </div>
            </div>
            <div class="route-actions">
                <button class="route-action-btn download-btn" data-id="${route.id}">
                    ${t.downloadReceipt}
                </button>
                <button class="route-action-btn delete-btn" data-id="${route.id}">
                    ${t.deleteRoute}
                </button>
            </div>
        `;
        savedRoutesList.appendChild(routeCard);
    });
    
    // Agregar event listeners a los botones
    document.querySelectorAll('.download-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const routeId = this.getAttribute('data-id');
            const route = savedRoutes.find(r => r.id === routeId);
            if (route) {
                generateAndDownloadReceipt(route, routeId);
            }
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const routeId = this.getAttribute('data-id');
            deleteRoute(routeId);
        });
    });
}

// Función para eliminar una ruta
function deleteRoute(routeId) {
    const t = translations[languageSelector.value];
    
    if (!confirm(t.confirmDelete)) {
        return;
    }
    
    let savedRoutes = JSON.parse(localStorage.getItem('savedRoutes') || '[]');
    savedRoutes = savedRoutes.filter(route => route.id !== routeId);
    localStorage.setItem('savedRoutes', JSON.stringify(savedRoutes));
    
    showAlert(t.routeDeleted, 'success');
    loadSavedRoutes();
}

// Función para eliminar todas las rutas
function deleteAllRoutes() {
    const t = translations[languageSelector.value];
    
    if (!confirm(t.confirmDeleteAll)) {
        return;
    }
    
    localStorage.removeItem('savedRoutes');
    showAlert(t.allRoutesDeleted, 'success');
    loadSavedRoutes();
}

// Función para exportar todas las rutas en formato de texto
function exportAllRoutes() {
    const t = translations[languageSelector.value];
    const savedRoutes = JSON.parse(localStorage.getItem('savedRoutes') || '[]');
    
    if (savedRoutes.length === 0) {
        showAlert(t.noSavedRoutes, 'warning');
        return;
    }
    
    // Crear contenido del archivo de texto
    let exportContent = `${t.exportTitle}\n`;
    exportContent += "=".repeat(50) + "\n\n";
    exportContent += `${t.exportDate}: ${new Date().toLocaleString()}\n`;
    exportContent += `${t.totalRoutes}: ${savedRoutes.length}\n\n`;
    
    // Ordenar rutas por fecha (más reciente primero)
    const sortedRoutes = [...savedRoutes].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    
    // Agregar cada ruta al contenido
    sortedRoutes.forEach((route, index) => {
        exportContent += `${t.routeNumber} ${index + 1}:\n`;
        exportContent += "-".repeat(30) + "\n";
        exportContent += `${t.destination}: ${route.destino}\n`;
        exportContent += `${t.currentLocation}: ${route.ubicacion}\n`;
        exportContent += `${t.transportTypes}: ${route.transportes.join(', ')}\n`;
        exportContent += `${t.difficulties}: ${route.dificultades.join(', ')}\n`;
        exportContent += `${t.date}: ${route.fecha}\n`;
        exportContent += `${t.routeId}: ${route.id}\n`;
        exportContent += "\n" + "=".repeat(50) + "\n\n";
    });
    
    exportContent += "GuaguaTime RD - Tu compañero de transporte confiable\n";
    exportContent += "© 2024 GuaguaTime RD. Todos los derechos reservados.";
    
    // Crear archivo y descargar
    const blob = new Blob([exportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `guaguatime_todas_las_rutas_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showAlert(t.exportSuccess, 'success');
}

// Función para mostrar alertas
function showAlert(message, type) {
    // Remover alerta anterior si existe
    const existingAlert = document.querySelector('.custom-alert');
    if (existingAlert) {
        existingAlert.remove();
    }
    
    const alert = document.createElement('div');
    alert.className = `custom-alert ${type}`;
    alert.textContent = message;
    
    document.body.appendChild(alert);
    
    // Auto-remover después de 3 segundos
    setTimeout(() => {
        alert.remove();
    }, 3000);
}

// Event listeners
document.getElementById('save-route').addEventListener('click', saveCurrentRoute);
document.getElementById('clear-all-routes').addEventListener('click', deleteAllRoutes);
document.getElementById('export-all-routes').addEventListener('click', exportAllRoutes);

// Manejar el envío del formulario
document.querySelector('form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const destino = document.getElementById('destino').value;
    const ubicacion = document.getElementById('ubicacion').value;
    
    if (!destino || !ubicacion) {
        showAlert(translations[languageSelector.value].formIncomplete, 'error');
        return;
    }
    
    // Aquí iría la lógica para buscar rutas
    showAlert("Buscando rutas disponibles...", 'info');
    
    // Simulación de búsqueda
    setTimeout(() => {
        showAlert("Rutas encontradas! Revisa la consola para más detalles.", 'success');
        console.log("Rutas simuladas encontradas para:", { destino, ubicacion });
    }, 1500);
});

// Mostrar alerta de bienvenida al cargar y cargar rutas guardadas
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        showAlert("¡Bienvenido a GuaguaTime RD!", 'info');
    }, 1000);
    
    // Cargar rutas guardadas al iniciar
    loadSavedRoutes();
});

/* Calculo de Rutas */

(() => {
  // 1) Dejando constantes los datos de transporte y condiciones
  // Velocidades base aproximadas en ciudad (km/h), tarifas en DOP
  const TRANSPORTS = {
    guagua:     { label: 'Guagua',     baseSpeedKmh: 18, baseFare: 35,  perKm: 2  },
    carrito:    { label: 'Carrito',    baseSpeedKmh: 22, baseFare: 35,  perKm: 3  },
    motoconcho: { label: 'Motoconcho', baseSpeedKmh: 28, baseFare: 50,  perKm: 5  },
    uber:       { label: 'Uber',       baseSpeedKmh: 24, baseFare: 60,  perKm: 12, minFare: 120 }
  };

  const CONDITIONS = {
    lluvia:   { label: 'Lluvia',       speedMult: 0.85, costMult: 1.10 },
    paro:     { label: 'Paro vehicular', speedMult: 0.60, costMult: 1.20 },
    horaPico: { label: 'Hora pico',    speedMult: 0.70, costMult: 1.00 }
  };

  // 2) Funciones de cálculo
  function clamp(num, min, max) { return Math.min(max, Math.max(min, num)); }

  function currencyDOP(n) {
    try {
      return new Intl.NumberFormat('es-DO', {
        style: 'currency', currency: 'DOP',
        minimumFractionDigits: 0, maximumFractionDigits: 0
      }).format(n);
    } catch {
      return `RD$ ${Math.round(n)}`;
    }
  }

  function combineMultipliers(selectedConditions) {
    return selectedConditions.reduce((acc, key) => {
      const c = CONDITIONS[key];
      return {
        speedMult: acc.speedMult * (c?.speedMult ?? 1),
        costMult: acc.costMult * (c?.costMult ?? 1)
      };
    }, { speedMult: 1, costMult: 1 });
  }

  /**
   * Calcula tiempo (min) y costo (DOP) por transporte, dada la distancia y condiciones.
   * @param {number} distanceKm
   * @param {string[]} transportsKeys - p.ej. ['guagua', 'carrito']
   * @param {string[]} conditionsKeys - p.ej. ['lluvia', 'horaPico']
   */
  function calculatePerTransport(distanceKm, transportsKeys, conditionsKeys) {
    const { speedMult, costMult } = combineMultipliers(conditionsKeys);
    const results = [];

    for (const key of transportsKeys) {
      const t = TRANSPORTS[key];
      if (!t) continue;

      const effSpeed = Math.max(5, t.baseSpeedKmh * speedMult); // no dejar caer demasiado
      const minutes = (distanceKm / effSpeed) * 60;
      let cost = (t.baseFare + t.perKm * distanceKm) * costMult;
      if (t.minFare) cost = Math.max(cost, t.minFare);

      results.push({
        key,
        label: t.label,
        minutes: Math.round(clamp(minutes, 1, 24 * 60)), // tope 24h
        cost: Math.round(cost),
        speedKmh: Math.round(effSpeed)
      });
    }
    return results.sort((a, b) => a.minutes - b.minutes); // más rápido primero
  }

  // 3) Preparación del formulario
  // Asume estructura HTML dada (ver index.html)
  // Añade campo de distancia si no existe, y contenedor de resultados
  // Asegura IDs en checkboxes y vincula labels (si faltan)
  // (no se usa ninguna librería externa)
  const form = document.querySelector('.form-grid-layout');
  const container = document.querySelector('.form-container');

  if (!form || !container) return;

  // Asegura IDs en checkboxes y vincula labels (si faltan)
  function patchCheckboxGroup(groupSelector) {
    const group = container.querySelector(groupSelector);
    if (!group) return;
    const inputs = Array.from(group.querySelectorAll('input[type="checkbox"]'));
    inputs.forEach((input) => {
      if (!input.id) input.id = (input.name || 'chk') + '-' + Math.random().toString(36).slice(2, 6);
      // Si el label siguiente no tiene 'for', se lo ponemos
      const label = input.nextElementSibling;
      if (label && label.tagName === 'LABEL' && !label.htmlFor) {
        label.htmlFor = input.id;
      }
    });
  }
  patchCheckboxGroup('.transporte');
  patchCheckboxGroup('.efectos');

  // Inserta un campo de Distancia (km), necesario para el cálculo
  let distanceEl = document.getElementById('distancia');
  if (!distanceEl) {
    const distGroup = document.createElement('div');
    distGroup.className = 'form-group';
    distGroup.innerHTML = `
      <h3>Distancia aproximada (km)</h3>
      <input type="number" id="distancia" min="0.5" step="0.1" value="5" />
      <small style="color:#6b7280">Estimación temporal hasta integrar mapa.</small>
    `;
    // Colocar antes del primer .full-width (tipo de transporte)
    const firstFull = form.querySelector('.full-width');
    form.insertBefore(distGroup, firstFull || form.lastElementChild);
    distanceEl = distGroup.querySelector('#distancia');
  }

  // Crear contenedor de resultados debajo del formulario
  const resultsBox = document.createElement('div');
  resultsBox.id = 'resultados';
  resultsBox.style.marginTop = '20px';
  container.appendChild(resultsBox);

  // 4) Obtención de datos del formulario
  function getSelectedTransports() {
    const map = {
      guagua: container.querySelector('input[name="Guagua"], #Guagua'),
      carrito: container.querySelector('input[name="carrito"], #carrito'),
      motoconcho: container.querySelector('input[name="motoconcho"]'),
      uber: container.querySelector('input[name="uber"]'),
    };
    return Object.entries(map)
      .filter(([, el]) => el && el.checked)
      .map(([k]) => k);
  }

  function getSelectedConditions() {
    const map = {
      lluvia: container.querySelector('input[name="lluvia"]'),
      paro: container.querySelector('input[name="paro"]'),
      horaPico: container.querySelector('input[name="horaPico"]'),
    };
    return Object.entries(map)
      .filter(([, el]) => el && el.checked)
      .map(([k]) => k);
  }

  // 5) Renderizado de resultados (en HTML)
  // A discusión en el HTML o en Backend? #AngelCarela
  function renderResults(list, distanceKm, conds) {
    if (!list.length) {
      resultsBox.innerHTML = `
        <div class="card" style="padding:16px;border-radius:12px;background:#fff;border:1px solid #ddd;">
          <p>No hay transportes seleccionados. Marca al menos una opción.</p>
        </div>`;
      return;
    }

    const condsText = conds.length
      ? ' • Condiciones: ' + conds.map((c) => CONDITIONS[c]?.label || c).join(', ')
      : ' • Sin condiciones especiales';

    const items = list.map(item => `
      <li style="padding:12px 0;border-bottom:1px solid #e5e7eb;">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;">
          <div>
            <strong>${item.label}</strong>
            <div style="color:#6b7280;font-size:0.9rem;">
              Velocidad efectiva: ${item.speedKmh} km/h
            </div>
          </div>
          <div style="text-align:right;">
            <div><span style="color:#6b7280;">Tiempo:</span> <strong>${item.minutes} min</strong></div>
            <div><span style="color:#6b7280;">Costo:</span> <strong>${currencyDOP(item.cost)}</strong></div>
          </div>
        </div>
      </li>
    `).join('');

    resultsBox.innerHTML = `
      <section class="card" style="padding:16px;border-radius:12px;background-color:var(--card, #ffffff);border:1px solid #ddd;">
        <h3 style="margin-top:0;">Resultados</h3>
        <p style="color:#6b7280;margin:4px 0 12px 0;">
          Distancia: <strong>${distanceKm.toFixed(1)} km</strong>${condsText}
        </p>
        <ul style="list-style:none;padding:0;margin:0;">
          ${items}
        </ul>
        <div style="margin-top:12px;">
          <button id="copyResults" type="button" style="padding:10px 12px;border-radius:8px;border:1px solid #ddd;background:#2B446A;color:#fff;cursor:pointer;">
            Copiar resumen
          </button>
        </div>
      </section>
    `;

    // Permitir copiar resultados al portapapeles
    document.getElementById('copyResults')?.addEventListener('click', () => {
      const text = [
        `Resultados (distancia ${distanceKm.toFixed(1)} km${conds.length ? `; condiciones: ${conds.map(c => CONDITIONS[c]?.label || c).join(', ')}` : ''})`,
        ...list.map(r => `- ${r.label}: ${r.minutes} min, ${currencyDOP(r.cost)} (vel ${r.speedKmh} km/h)`)
      ].join('\n');
      navigator.clipboard?.writeText(text).then(() => {
        const btn = document.getElementById('copyResults');
        if (btn) {
          const old = btn.textContent;
          btn.textContent = '¡Copiado!';
          setTimeout(() => (btn.textContent = old), 1200);
        }
      });
    });
  }

  // 6) Manejo del submit del formulario
  // Evita recarga, valida datos, calcula y muestra resultados
  // (Ver si se puede aplicar en el HTML a discusión)  #AngelCarela
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const distance = parseFloat(distanceEl?.value);
    if (!Number.isFinite(distance) || distance <= 0) {
      alert('Por favor, ingresa una distancia válida (km).');
      distanceEl?.focus();
      return;
    }

    const transports = getSelectedTransports();
    if (!transports.length) {
      renderResults([], distance, []);
      return;
    }

    const conditions = getSelectedConditions();
    const results = calculatePerTransport(distance, transports, conditions);
    renderResults(results, distance, conditions);
  });

  // 7) Modo oscuro aplicado a resultados (pequeño ajuste visual)
  function applyResultsTheme(isDark) {
    // Estilos mínimos inline para el card, respetando tus colores
    const card = resultsBox.querySelector('.card');
    if (!card) return;
    if (isDark) {
      card.style.backgroundColor = '#1e1e1e';
      card.style.borderColor = '#555';
      card.style.color = '#e0e0e0';
    } else {
      card.style.backgroundColor = '#ffffff';
      card.style.borderColor = '#ddd';
      card.style.color = '#131b2b';
    }
  }

  // Inicializando tema y escuchando cambios
  applyResultsTheme(document.body.classList.contains('oscuro'));
  window.addEventListener('theme:change', (e) => {
    applyResultsTheme(e.detail?.theme === 'dark');
  });
})();