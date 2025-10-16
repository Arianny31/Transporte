
/* Temas */

(() => {
  const KEY = 'theme';
  const body = document.body;
  const oscuroRadio = document.getElementById('oscuro');
  const claroRadio = document.getElementById('claro');

  function safeGet(k) {
    try { return localStorage.getItem(k); } catch { return null; }
  }
  function safeSet(k, v) {
    try { localStorage.setItem(k, v); } catch {}
  }

  function applyTheme(theme) {
    const isDark = theme === 'oscuro';
    body.classList.toggle('oscuro', isDark);
    if (oscuroRadio) oscuroRadio.checked = isDark;
    if (claroRadio) claroRadio.checked = !isDark;
    // (Opcional) evento por si otro módulo quiere escuchar
    window.dispatchEvent(new CustomEvent('theme:change', {
      detail: { theme: isDark ? 'dark' : 'light' }
    }));
  }

  const systemDark = window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches;

  const saved = safeGet(KEY);
  applyTheme(saved || (systemDark ? 'oscuro' : 'claro'));

  oscuroRadio?.addEventListener('change', function () {
    if (this.checked) { applyTheme('oscuro'); safeSet(KEY, 'oscuro'); }
  });
  claroRadio?.addEventListener('change', function () {
    if (this.checked) { applyTheme('claro'); safeSet(KEY, 'claro'); }
  });

  // Si el sistema cambia y no hay preferencia guardada
  if (window.matchMedia) {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener?.('change', (e) => {
      if (!safeGet(KEY)) applyTheme(e.matches ? 'oscuro' : 'claro');
    });
  }
})();

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