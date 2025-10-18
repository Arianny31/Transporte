
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
    // DATA DEL MAPA Y RUTAS ESQUEMÁTICAS
    const MAP_DATA = {
        nodes: [
            { id: 'P01', label: 'La Caleta', x: 300, y: 50 },
            { id: 'P02', label: 'Boca Chica', x: 200, y: 100 },
            { id: 'P03', label: 'San Isidro', x: 400, y: 100 },
            { id: 'P04', label: 'Los Mina', x: 100, y: 200 },
            { id: 'P05', label: 'Ozama', x: 300, y: 200 },
            { id: 'P06', label: 'Invivienda', x: 500, y: 200 },
            { id: 'P07', label: 'Villa Mella', x: 50, y: 300 },
            { id: 'P08', label: 'Cristo Rey', x: 150, y: 300 },
            { id: 'P09', label: 'Gascue', x: 250, y: 350 },
            { id: 'P10', label: 'Ciudad Colonial', x: 350, y: 350 },
            { id: 'P11', label: 'Ens. Luperón', x: 450, y: 300 },
            { id: 'P12', label: 'Herrera', x: 550, y: 300 },
            { id: 'P13', label: 'Los Alcarrizos', x: 50, y: 450 },
            { id: 'P14', label: 'Arroyo Hondo', x: 400, y: 450 },
            { id: 'P15', label: 'Naco', x: 200, y: 450 },
        ],
        edges: [
            // time_min: Tiempo base estimado por ese tramo en minutos (ej: 8km a 30km/h = 16min)
            { from: 'P01', to: 'P02', distanceKm: 8.5, time_min: 15 },
            { from: 'P01', to: 'P03', distanceKm: 6.0, time_min: 10 },
            { from: 'P02', to: 'P04', distanceKm: 12.0, time_min: 25 },
            { from: 'P03', to: 'P05', distanceKm: 4.0, time_min: 8 },
            { from: 'P03', to: 'P06', distanceKm: 5.5, time_min: 12 },
            { from: 'P04', to: 'P07', distanceKm: 10.0, time_min: 20 },
            { from: 'P04', to: 'P08', distanceKm: 7.0, time_min: 15 },
            { from: 'P05', to: 'P09', distanceKm: 5.0, time_min: 10 },
            { from: 'P05', to: 'P10', distanceKm: 2.5, time_min: 5 },
            { from: 'P06', to: 'P11', distanceKm: 3.5, time_min: 7 },
            { from: 'P06', to: 'P12', distanceKm: 8.0, time_min: 18 },
            { from: 'P07', to: 'P13', distanceKm: 15.0, time_min: 30 },
            { from: 'P08', to: 'P09', distanceKm: 3.0, time_min: 6 },
            { from: 'P09', to: 'P10', distanceKm: 1.5, time_min: 4 },
            { from: 'P10', to: 'P11', distanceKm: 4.5, time_min: 10 },
            { from: 'P11', to: 'P14', distanceKm: 7.0, time_min: 15 },
            { from: 'P12', to: 'P15', distanceKm: 6.5, time_min: 14 },
            { from: 'P13', to: 'P15', distanceKm: 9.0, time_min: 20 },
            { from: 'P14', to: 'P15', distanceKm: 5.0, time_min: 10 }
        ],
    };

    // Variables de estado
    let selectedOriginId = null;
    let selectedDestId = null;

    // Elementos del DOM del mapa/selects
    const selectOrigen = document.getElementById('select-origen');
    const selectDestino = document.getElementById('select-destino');
    const mapNodesGroup = document.getElementById('map-nodes');
    const mapEdgesGroup = document.getElementById('map-edges');
    const form = document.querySelector('.form-grid-layout');
    const container = document.querySelector('.form-container');

    if (!form || !container) return; // Salir si el HTML no está listo

   
    // 1) Constantes de Transporte y Condiciones
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
     * @param {number} baseTimeMinutes - Suma de tiempo_min de tramos (Regla: Tiempo base de ruta)
     * @param {string[]} transportsKeys - p.ej. ['guagua', 'carrito']
     * @param {string[]} conditionsKeys - p.ej. ['lluvia', 'horaPico']
     */
    function calculatePerTransport(distanceKm, baseTimeMinutes, transportsKeys, conditionsKeys) {
        const { speedMult, costMult } = combineMultipliers(conditionsKeys);
        const results = [];

        // Regla: tiempo = tiempo * (1 + tiempo_pct/100). Redondear al minuto.
        // Como 'speedMult' es un factor de reducción de velocidad (ej: 0.85), 
        // el tiempo debe aumentar: Tiempo_Final = Tiempo_Base / speedMult
        
        // El tiempo base ya es la suma de tiempo_min de tramos.
        // Aplicamos el factor de desaceleración (inverso del speedMult) al tiempo.
        let effectiveTime = baseTimeMinutes / speedMult; 
        const finalMinutes = Math.round(clamp(effectiveTime, 1, 24 * 60)); // Redondear y clamp

        for (const key of transportsKeys) {
            const t = TRANSPORTS[key];
            if (!t) continue;

            // Regla: Costo total = suma de costo + suma de costo_extra de condiciones.
            // (Base + PerKm) * CostMult
            let cost = (t.baseFare + t.perKm * distanceKm) * costMult; 
            if (t.minFare) cost = Math.max(cost, t.minFare);

            results.push({
                key,
                label: t.label,
                minutes: finalMinutes, // Tiempo afectado por las condiciones
                cost: Math.round(cost),
                speedKmh: Math.round((distanceKm / (finalMinutes / 60)) || 0) // Velocidad efectiva para mostrar
            });
        }
        return results.sort((a, b) => a.minutes - b.minutes); // Ranking por tiempo (por defecto)
    }

    // [NUEVO] Lógica del Mapa y Rutas (Dijkstra)
    let distanceEl = null; 
    let baseTimeEl = null;

    function createSvgElement(tag, attrs) {
        const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
        for (const key in attrs) {
            el.setAttribute(key, attrs[key]);
        }
        return el;
    }

    function renderMap() {
        if (!mapNodesGroup || !mapEdgesGroup) return;
        mapNodesGroup.innerHTML = '';
        mapEdgesGroup.innerHTML = '';
        document.getElementById('map-labels').innerHTML = '';

        // 1. Dibujar Aristas
        MAP_DATA.edges.forEach(edge => {
            const fromNode = MAP_DATA.nodes.find(n => n.id === edge.from);
            const toNode = MAP_DATA.nodes.find(n => n.id === edge.to);
            if (fromNode && toNode) {
                const line = createSvgElement('line', {
                    x1: fromNode.x, y1: fromNode.y,
                    x2: toNode.x, y2: toNode.y,
                    'data-from': fromNode.id,
                    'data-to': toNode.id,
                    class: 'map-edge'
                });
                mapEdgesGroup.appendChild(line);
            }
        });
        
        // 2. Dibujar Nodos
        MAP_DATA.nodes.forEach(node => {
            const circle = createSvgElement('circle', {
                cx: node.x, cy: node.y, r: 8,
                fill: 'var(--node-color, #2B446A)',
                stroke: 'var(--node-border, #fff)',
                'stroke-width': 2,
                'data-id': node.id,
                'data-label': node.label,
                class: 'map-node'
            });
            circle.addEventListener('click', () => handleNodeClick(node.id));
            mapNodesGroup.appendChild(circle);

            // Añadir Label
            const label = createSvgElement('text', {
                x: node.x + 10, y: node.y + 3,
                'data-id': node.id,
                class: 'map-label',
                style: 'font-weight: bold; cursor: default;'
            });
            label.textContent = node.id; 
            document.getElementById('map-labels').appendChild(label);
        });
    }

    function handleNodeClick(nodeId) {
        if (selectedOriginId === nodeId) {
            selectedOriginId = null;
        } else if (selectedDestId === nodeId) {
            selectedDestId = null;
        } else if (!selectedOriginId) {
            selectedOriginId = nodeId;
        } else if (!selectedDestId) {
            selectedDestId = nodeId;
        } else {
            // Reemplaza el origen y borra el destino para una nueva búsqueda
            selectedOriginId = nodeId;
            selectedDestId = null;
        }
        updateSelection();
        updateDistanceInput();
    }

    function updateSelection() {
        // 1. Actualizar selects
        selectOrigen.value = selectedOriginId || '';
        selectDestino.value = selectedDestId || '';

        // 2. Actualizar nodos en el mapa
        mapNodesGroup.querySelectorAll('.map-node').forEach(circle => {
            const id = circle.getAttribute('data-id');
            circle.style.fill = 'var(--node-color, #2B446A)'; 
            circle.style.r = 8;
            circle.style.stroke = 'var(--node-border, #fff)';

            if (id === selectedOriginId) {
                circle.style.fill = 'var(--origin-color, green)';
                circle.style.r = 10;
            } else if (id === selectedDestId) {
                circle.style.fill = 'var(--dest-color, red)';
                circle.style.r = 10;
            }
        });

        // 3. Resaltar ruta más corta
        mapEdgesGroup.querySelectorAll('.map-edge').forEach(line => {
            line.style.stroke = 'var(--primary-color, #2B446A)';
            line.style.strokeWidth = 2;
        });

        if (selectedOriginId && selectedDestId) {
            const { path } = findShortestPath(selectedOriginId, selectedDestId);
            if (path && path.length > 1) {
                for (let i = 0; i < path.length - 1; i++) {
                    const start = path[i];
                    const end = path[i + 1];
                    // Busca la línea en ambas direcciones
                    const edge = mapEdgesGroup.querySelector(`.map-edge[data-from="${start}"][data-to="${end}"], .map-edge[data-from="${end}"][data-to="${start}"]`);
                    if (edge) {
                        edge.style.stroke = 'var(--path-color, orange)';
                        edge.style.strokeWidth = 4;
                        // Mover al frente (opcional)
                        mapEdgesGroup.appendChild(edge);
                    }
                }
            }
        }
    }

    // Algoritmo de Dijkstra para la ruta más corta (por distancia)
    function findShortestPath(startNodeId, endNodeId) {
        if (startNodeId === endNodeId) return { path: [startNodeId], distance: 0, time_base: 0, transbordos: 0 };
        if (!startNodeId || !endNodeId) return { path: [], distance: 0, time_base: 0, transbordos: 0 };

        const nodes = MAP_DATA.nodes.map(n => n.id);
        const edges = MAP_DATA.edges;
        
        const adj = new Map();
        nodes.forEach(node => adj.set(node, []));
        edges.forEach(edge => {
            adj.get(edge.from)?.push({ to: edge.to, distance: edge.distanceKm, time: edge.time_min });
            adj.get(edge.to)?.push({ to: edge.from, distance: edge.distanceKm, time: edge.time_min });
        });

        const distances = {}; 
        const previous = {}; 
        const unvisited = new Set(nodes);
        
        nodes.forEach(node => {
            distances[node] = Infinity;
            previous[node] = null;
        });
        distances[startNodeId] = 0;

        while (unvisited.size > 0) {
            let current = null;
            let minDistance = Infinity;
            for (const node of unvisited) {
                if (distances[node] < minDistance) {
                    minDistance = distances[node];
                    current = node;
                }
            }
            if (current === null || distances[current] === Infinity) break;
            unvisited.delete(current);
            if (current === endNodeId) break; 

            adj.get(current)?.forEach(neighbor => {
                const newDistance = distances[current] + neighbor.distance;
                if (newDistance < distances[neighbor.to]) {
                    distances[neighbor.to] = newDistance;
                    previous[neighbor.to] = current;
                }
            });
        }

        const path = [];
        let current = endNodeId;
        while (current) {
            path.unshift(current);
            if (current === startNodeId) break;
            current = previous[current];
        }
        
        if (path[0] !== startNodeId || path[path.length - 1] !== endNodeId) return { path: [], distance: 0, time_base: 0, transbordos: 0 };

        let totalDistance = 0;
        let totalTimeBase = 0;
        for (let i = 0; i < path.length - 1; i++) {
            const start = path[i];
            const end = path[i + 1];
            const edge = edges.find(e => 
                (e.from === start && e.to === end) || 
                (e.from === end && e.to === start)
            );
            if (edge) {
                totalDistance += edge.distanceKm;
                totalTimeBase += edge.time_min;
            }
        }
        
        return { path, distance: totalDistance, time_base: totalTimeBase, transbordos: path.length - 2 };
    }

    function updateDistanceInput() {
        if (!distanceEl || !baseTimeEl) return;

        if (selectedOriginId && selectedDestId) {
            const { distance, time_base } = findShortestPath(selectedOriginId, selectedDestId);
            distanceEl.value = distance.toFixed(1);
            baseTimeEl.value = time_base;
        } else {
            distanceEl.value = '0';
            baseTimeEl.value = '0';
        }
    }

    function initMapAndSelectors() {
        renderMap();

        // Llenar selects
        MAP_DATA.nodes.forEach(node => {
            const option = document.createElement('option');
            option.value = node.id;
            option.textContent = `${node.id}: ${node.label}`;
            selectOrigen.appendChild(option.cloneNode(true));
            selectDestino.appendChild(option);
        });

        // Escuchar cambios en los selects
        selectOrigen?.addEventListener('change', (e) => {
            selectedOriginId = e.target.value;
            updateSelection();
            updateDistanceInput();
        });
        selectDestino?.addEventListener('change', (e) => {
            selectedDestId = e.target.value;
            updateSelection();
            updateDistanceInput();
        });

        // Inicializar visualmente
        updateSelection();
    }

    // 3) Preparación del formulario (Añadir campos de Distancia/Tiempo Base)
   
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
    let distanceGroup = document.getElementById('distance-group');
    if (!distanceGroup) {
        distanceGroup = document.createElement('div');
        distanceGroup.id = 'distance-group';
        distanceGroup.className = 'form-group full-width';
        distanceGroup.innerHTML = `
            <h3 style="margin-top:0;">Detalles de la Ruta Seleccionada</h3>
            <div style="display:flex; gap:10px;">
                <div style="flex:1;">
                    <label for="distancia" style="display:block; font-size:0.9rem; color:var(--text-color-secondary, #6b7280);">Distancia (km)</label>
                    <input type="number" id="distancia" min="0.1" step="0.1" value="0" disabled style="width:100%;" />
                </div>
                <div style="flex:1;">
                    <label for="tiempo-base" style="display:block; font-size:0.9rem; color:var(--text-color-secondary, #6b7280);">Tiempo Base (min)</label>
                    <input type="number" id="tiempo-base" min="1" step="1" value="0" disabled style="width:100%;" />
                </div>
            </div>
            <small style="color:var(--text-color-secondary, #6b7280)">Tiempo Base = Suma de tiempo_min de tramos.</small>
        `;
        // Colocar antes del primer .full-width (tipo de transporte)
        const placeholder = document.getElementById('distance-group-placeholder');
        if (placeholder) {
            placeholder.replaceWith(distanceGroup);
        } else {
            const firstFull = form.querySelector('.full-width');
            form.insertBefore(distanceGroup, firstFull || form.lastElementChild);
        }
        
        distanceEl = distanceGroup.querySelector('#distancia');
        baseTimeEl = distanceGroup.querySelector('#tiempo-base');
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
            motoconcho: container.querySelector('input[name="motoconcho"], #motoconcho'),
            uber: container.querySelector('input[name="uber"], #uber'),
        };
        return Object.entries(map)
            .filter(([, el]) => el && el.checked)
            .map(([k]) => k);
    }

    function getSelectedConditions() {
        const map = {
            lluvia: container.querySelector('input[name="lluvia"], #lluvia'),
            paro: container.querySelector('input[name="paro"], #paro'),
            horaPico: container.querySelector('input[name="horaPico"], #horaPico'),
        };
        return Object.entries(map)
            .filter(([, el]) => el && el.checked)
            .map(([k]) => k);
    }

  // 5) Renderizado de resultados (en HTML)
  // A discusión en el HTML o en Backend? #AngelCarela
    function renderResults(list, distanceKm, baseTimeMinutes, conds) {
        if (!list.length) {
            resultsBox.innerHTML = `
                <div class="card" style="padding:16px;border-radius:12px;background-color:var(--card, #ffffff);border:1px solid var(--border-color, #ddd);">
                    <p style="color:var(--text-color, #333);">No hay transportes seleccionados. Marca al menos una opción.</p>
                </div>`;
            return;
        }
        
        const transbordos = findShortestPath(selectedOriginId, selectedDestId).transbordos;
        const condsText = conds.length
            ? ' • Condiciones: ' + conds.map((c) => CONDITIONS[c]?.label || c).join(', ')
            : ' • Sin condiciones especiales';

        const items = list.map(item => `
            <li style="padding:12px 0;border-bottom:1px solid var(--border-color, #e5e7eb);">
                <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;">
                    <div>
                        <strong>${item.label}</strong>
                        <div style="color:var(--text-color-secondary, #6b7280);font-size:0.9rem;">
                            Velocidad efectiva: ${item.speedKmh} km/h
                        </div>
                    </div>
                    <div style="text-align:right;">
                        <div><span style="color:var(--text-color-secondary, #6b7280);">Tiempo:</span> <strong style="color: ${item.minutes > baseTimeMinutes * 1.2 ? 'red' : 'green'};">${item.minutes} min</strong></div>
                        <div><span style="color:var(--text-color-secondary, #6b7280);">Costo:</span> <strong>${currencyDOP(item.cost)}</strong></div>
                    </div>
                </div>
            </li>
        `).join('');

        resultsBox.innerHTML = `
            <section class="card" style="padding:16px;border-radius:12px;background-color:var(--card, #ffffff);border:1px solid var(--border-color, #ddd);">
                <h3 style="margin-top:0;">Resultados de Ruta</h3>
                <p style="color:var(--text-color-secondary, #6b7280);margin:4px 0 12px 0;">
                    ${selectedOriginId}: ${MAP_DATA.nodes.find(n=>n.id===selectedOriginId)?.label} a ${selectedDestId}: ${MAP_DATA.nodes.find(n=>n.id===selectedDestId)?.label}
                </p>
                <p style="color:var(--text-color-secondary, #6b7280);margin:4px 0 12px 0;">
                    Distancia: <strong>${distanceKm.toFixed(1)} km</strong> • Transbordos: <strong>${transbordos}</strong>${condsText}
                </p>
                <ul style="list-style:none;padding:0;margin:0;">
                    ${items}
                </ul>
            </section>
        `;
        
 
    // Permitir copiar resultados al portapapeles
        const isDark = document.body.classList.contains('oscuro');
        applyResultsTheme(isDark);
    }

  // 6) Manejo del submit del formulario
  // Evita recarga, valida datos, calcula y muestra resultados
  // (Ver si se puede aplicar en el HTML a discusión)  #AngelCarela
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        if (!selectedOriginId || !selectedDestId) {
            alert('Por favor, selecciona un Origen y un Destino en el mapa o en los selectores.');
            return;
        }
        
        const { distance, time_base, transbordos } = findShortestPath(selectedOriginId, selectedDestId);
        const distanceKm = distance;
        const baseTimeMinutes = time_base;

        if (distanceKm <= 0) {
            alert('Ruta no válida o no se encontró una conexión.');
            return;
        }

        const transports = getSelectedTransports();
        if (!transports.length) {
            renderResults([], distanceKm, baseTimeMinutes, []);
            return;
        }

        const conditions = getSelectedConditions();
        const results = calculatePerTransport(distanceKm, baseTimeMinutes, transports, conditions); 
        renderResults(results, distanceKm, baseTimeMinutes, conditions);
    });

    // 7) Modo oscuro aplicado a resultados (pequeño ajuste visual)
    function applyResultsTheme(isDark) {
    // Estilos mínimos inline para el card, respetando tus colores
        const card = resultsBox.querySelector('.card');
        const root = document.documentElement.style;

        if (isDark) {
            root.setProperty('--card', '#1e1e1e');
            root.setProperty('--border-color', '#555');
            root.setProperty('--text-color', '#e0e0e0');
            root.setProperty('--text-color-secondary', '#999');
            root.setProperty('--map-bg', '#333');
            root.setProperty('--node-color', '#FFCA28');
            root.setProperty('--node-border', '#1e1e1e');
            root.setProperty('--origin-color', '#1E88E5');
            root.setProperty('--dest-color', '#FFCA28');
            root.setProperty('--primary-color', '#888');
            root.setProperty('--path-color', '#1E88E5');
            root.setProperty('--button-bg', '#FFCA28');
            root.setProperty('--button-color', '#131b2b');

        } else {
            root.setProperty('--card', '#ffffff');
            root.setProperty('--border-color', '#ddd');
            root.setProperty('--text-color', '#131b2b');
            root.setProperty('--text-color-secondary', '#6b7280');
            root.setProperty('--map-bg', '#f4f4f4');
            root.setProperty('--node-color', '#2B446A');
            root.setProperty('--node-border', '#fff');
            root.setProperty('--origin-color', 'green');
            root.setProperty('--dest-color', 'red');
            root.setProperty('--primary-color', '#2B446A');
            root.setProperty('--path-color', 'orange');
            root.setProperty('--button-bg', '#2B446A');
            root.setProperty('--button-color', '#fff');
        }
    }

  // Inicializando tema y escuchando cambios
    applyResultsTheme(document.body.classList.contains('oscuro'));
    window.addEventListener('theme:change', (e) => {
        applyResultsTheme(e.detail?.theme === 'dark');
    });

    // Inicialización del mapa y selects
    initMapAndSelectors();
})();