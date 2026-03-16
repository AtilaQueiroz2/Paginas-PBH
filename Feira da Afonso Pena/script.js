/* =============================================================
   FEIRA DA AFONSO PENA – script.js
   ============================================================= */

(function () {
  'use strict';

  // ── NAV: sticky scroll behaviour ────────────────────────────
  const topnav = document.getElementById('topnav');
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  const backBtn = document.getElementById('backToTop');
  const allNavLinks = document.querySelectorAll('.nav-links a');

  window.addEventListener('scroll', () => {
    // Sticky shadow
    topnav.classList.toggle('scrolled', window.scrollY > 20);
    // Back-to-top
    backBtn.classList.toggle('visible', window.scrollY > 400);
    // Active nav link by section
    highlightNav();
  }, { passive: true });

  // ── HAMBURGER ────────────────────────────────────────────────
  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
  });

  // Close menu on link click (mobile)
  allNavLinks.forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });

  // ── ACTIVE NAV ON SCROLL ─────────────────────────────────────
  const anchors = ['identidade', 'licenciamento', 'regras', 'categorias', 'localizacao', 'faq'];

  function highlightNav() {
    let current = '';
    anchors.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= 90) current = id;
      }
    });
    allNavLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
  }

  // ── BACK TO TOP ──────────────────────────────────────────────
  backBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ── ACCORDIONS ───────────────────────────────────────────────
  const accBtns = document.querySelectorAll('.accordion-btn');

  accBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      const bodyId = btn.getAttribute('aria-controls');
      const body = document.getElementById(bodyId);

      // Close all first
      accBtns.forEach(b => {
        b.setAttribute('aria-expanded', 'false');
        const bId = b.getAttribute('aria-controls');
        document.getElementById(bId)?.classList.remove('open');
      });

      // Toggle clicked
      if (!expanded) {
        btn.setAttribute('aria-expanded', 'true');
        body?.classList.add('open');
      }
    });
  });

  // ── SMOOTH ANCHOR OFFSET (account for fixed nav) ─────────────
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'), 10) || 68;
      const top = target.getBoundingClientRect().top + window.scrollY - navH - 16;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  // ── HERO CTA PARALLAX HINT ───────────────────────────────────
  const hero = document.querySelector('.hero');
  if (hero) {
    window.addEventListener('scroll', () => {
      const offset = window.scrollY * 0.35;
      hero.style.setProperty('--parallax', offset + 'px');
    }, { passive: true });
  }

  // ── SECTOR ITEM: click-highlight ─────────────────────────────
  document.querySelectorAll('.sector-item').forEach(item => {
    item.addEventListener('click', function () {
      document.querySelectorAll('.sector-item').forEach(s => s.classList.remove('selected'));
      this.classList.add('selected');
    });
  });

  // ── INTERSECTION OBSERVER: fade-in on scroll ─────────────────
  const fadeEls = document.querySelectorAll(
    '.hcard, .edital-card, .cat-card, .sector-item, .accordion-group, .rule-item, .phase-block'
  );

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    fadeEls.forEach(el => {
      el.classList.add('fade-out');
      io.observe(el);
    });
  }

  // ── SECTOR ITEM selected styling (CSS class only) ────────────
  const style = document.createElement('style');
  style.textContent = `
    .fade-out { opacity: 0; transform: translateY(20px); transition: opacity .5s ease, transform .5s ease; }
    .fade-in  { opacity: 1; transform: translateY(0); }
    .sector-item.selected {
      background: var(--green-light) !important;
      color: var(--green) !important;
      font-weight: 700;
      box-shadow: 0 0 0 2px var(--green-mid);
    }
  `;
  document.head.appendChild(style);

  // ── PRINT: remove nav ────────────────────────────────────────
  window.addEventListener('beforeprint', () => topnav.style.display = 'none');
  window.addEventListener('afterprint', () => topnav.style.display = '');

})();

// =============================================================
// MAPA INTERATIVO (MINI MAPA LOCAL)
// =============================================================
document.addEventListener('DOMContentLoaded', () => {
  const mapElement = document.getElementById('mini-mapa');
  if (!mapElement) return;

  // Limpa a div
  mapElement.innerHTML = '';

  // Projeção UTM Zone 23S (EPSG:31983) usada pela PBH
  const crs = new L.Proj.CRS('EPSG:31983',
    '+proj=utm +zone=23 +south +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs',
    {
      resolutions: [8192, 4096, 2048, 1024, 512, 256, 128, 64, 32, 16, 8, 4, 2, 1, 0.5, 0.25, 0.125],
      origin: [166021.4431, 8339785.6077]
    }
  );

  // Inicializa o mapa
  const miniMap = L.map('mini-mapa', {
    crs: L.CRS.EPSG3857, // Base map usa Mercator normal
    center: [-19.9234, -43.9355],
    zoom: 16,
    minZoom: 15,
    maxZoom: 19
  });

  // Camada Base Clara (CartoDB Positron)
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    subdomains: 'abcd',
    maxZoom: 20
  }).addTo(miniMap);

  const sectorsLayer = L.layerGroup().addTo(miniMap);
  const stallsLayer = L.layerGroup().addTo(miniMap);
  const markersLayer = L.layerGroup().addTo(miniMap);

  // Marcadores de Pontos de Interesse (Entradas)
  const pinIcon = L.divIcon({
    html: '<div style="background-color: #1a7c3e; width: 12px; height: 12px; border: 2px solid white; border-radius: 50%; box-shadow: 0 0 10px rgba(0,0,0,0.3);"></div>',
    className: 'custom-pin-icon',
    iconSize: [12, 12],
    iconAnchor: [6, 6]
  });

  const pracaSete = L.marker([-19.919351, -43.938571], { icon: pinIcon }).addTo(markersLayer)
    .bindPopup("<b>📍 Entrada Praça Sete</b><br>Ponto inicial da Feira (Afonso Pena com Amazonas)")
    .bindTooltip("Entrada Praça Sete", { permanent: true, direction: 'top', offset: [0, -5] });

  const carandai = L.marker([-19.926778, -43.934002], { icon: pinIcon }).addTo(markersLayer)
    .bindPopup("<b>📍 Entrada Carandaí</b><br>Extremidade oposta da Feira")
    .bindTooltip("Entrada Carandaí", { permanent: true, direction: 'bottom', offset: [0, 5] });

  // Conversor de coordenada (UTM para LatLng)
  function convertCoordinates(coords, isPolygon = false) {
    if (!coords || !coords.length) return [];

    if (isPolygon) {
      return [coords[0].map(c => {
        const pt = proj4('EPSG:31983', 'EPSG:4326', [c[0], c[1]]);
        return [pt[1], pt[0]];
      })];
    }

    const pt = proj4('EPSG:31983', 'EPSG:4326', [coords[0], coords[1]]);
    return [pt[1], pt[0]];
  }

  let initialBounds = null;
  const allStalls = [];

  // Carregar Feirantes (Polígonos das barracas) a partir da variável injetada
  function loadFeirantes() {
    console.log("Carregando feirantes...");
    if (typeof feirantesData === 'undefined' || !feirantesData.features) {
      console.error("Dados dos feirantes não foram carregados do arquivo js.");
      return;
    }

    // Cores específicas para cada setor baseadas no mapa oficial
    function getColorForSector(sector) {
      if (!sector) return "#888888";
      const s = sector.toUpperCase();
      if (s.includes("CASA")) return "#cc0000"; // Vermelho
      if (s.includes("ALIMENTAÇÃO")) return "#798c19"; // Verde Oliva
      if (s.includes("VESTUÁRIO INFANTIL")) return "#004890"; // Azul Escuro
      if (s.includes("VESTUÁRIO")) return "#eec110"; // Amarelo
      if (s.includes("CRIANÇA")) return "#008fd3"; // Azul Claro
      if (s.includes("ARTES E PINTURA")) return "#6a22b7"; // Roxo
      if (s.includes("BIJOUTERIAS")) return "#b23a78"; // Magenta
      if (s.includes("ESCULTURAS")) return "#835316"; // Marrom
      if (s.includes("ARRANJOS E COMPLEMENTOS")) return "#c18c1b"; // Ouro/Laranja escuro
      if (s.includes("CINTOS, BOLSAS E ACESSÓRIOS")) return "#00774a"; // Verde Escuro
      if (s.includes("CALÇADOS")) return "#dc4e15"; // Laranja/Vermelho
      return "#888888";
    }

    feirantesData.features.forEach(feature => {
      if (feature.geometry && feature.geometry.coordinates) {
        try {
          const props = feature.properties;
          const latlngs = convertCoordinates(feature.geometry.coordinates, true);
          const sectorColor = getColorForSector(props.SETOR);

          const stallPolygon = L.polygon(latlngs, {
            fillColor: sectorColor,
            color: sectorColor,
            weight: 1,
            opacity: 1,
            fillOpacity: 1
          });

          // Anexa metadados para filtro
          stallPolygon.options.sectorName = (props.SETOR || "").toUpperCase();

          const popupContent = `
                        <div style="font-family:'Inter',sans-serif; padding:5px 0;">
                            <h4 style="margin:0 0 8px; color:${sectorColor}; font-size:14px; font-weight:700;">${props.NOME_FANTASIA || props.NOME}</h4>
                            <p style="margin:0 0 3px; font-size:12px;"><b>📍 Vaga:</b> ${props.VAGA}</p>
                            <p style="margin:0 0 3px; font-size:12px;"><b>🏷️ Setor:</b> ${props.SETOR}</p>
                            <p style="margin:0; font-size:12px;"><b>📦 Produto:</b> ${props.PRODUTO_PRINCIPAL}</p>
                        </div>
                    `;

          stallPolygon.bindPopup(popupContent);
          stallPolygon.bindTooltip(`${props.SETOR} - ${props.VAGA}`, { sticky: true });

          stallsLayer.addLayer(stallPolygon);
          allStalls.push(stallPolygon);
        } catch (e) { }
      }
    });

    if (stallsLayer.getLayers().length > 0) {
      initialBounds = stallsLayer.getBounds();
      miniMap.fitBounds(initialBounds, { padding: [20, 20] });
    }
  }

  // --- LÓGICA DE FILTRO PELO MENU ---
  const sectorItems = document.querySelectorAll('.sector-item');

  function resetFilters() {
    console.log("Resetando filtros e zoom...");
    sectorItems.forEach(i => i.classList.remove('active'));
    stallsLayer.clearLayers();
    allStalls.forEach(stall => stallsLayer.addLayer(stall));

    if (initialBounds) {
      miniMap.flyToBounds(initialBounds, {
        padding: [20, 20],
        duration: 1.5,
        easeLinearity: 0.25
      });
    } else {
      // Fallback caso initialBounds não tenha sido capturado
      const group = L.featureGroup(allStalls);
      if (group.getBounds().isValid()) {
        miniMap.flyToBounds(group.getBounds(), { padding: [20, 20] });
      }
    }
  }

  sectorItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.stopPropagation();

      const filter = item.getAttribute('data-filter');
      const isAlreadyActive = item.classList.contains('active');

      if (isAlreadyActive) {
        resetFilters();
        return;
      }

      // Lógica para Entradas (Mostram tudo + Zoom)
      if (item.id === 'setor-1' || item.id === 'setor-16') {
        sectorItems.forEach(i => i.classList.remove('active'));
        stallsLayer.clearLayers();
        allStalls.forEach(stall => stallsLayer.addLayer(stall));

        const coords = item.id === 'setor-1'
          ? [-19.919351, -43.938571]
          : [-19.926778, -43.934002];

        miniMap.flyTo(coords, 18, { duration: 1.5 });
        return;
      }

      // Toggle active UI para filtros de categoria
      sectorItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');

      // Filtrar no mapa
      stallsLayer.clearLayers();
      const filtered = [];

      allStalls.forEach(stall => {
        const sectorName = stall.options.sectorName;
        if (filter === 'all' || (sectorName && sectorName.includes(filter.toUpperCase()))) {
          stallsLayer.addLayer(stall);
          filtered.push(stall);
        }
      });

      if (filtered.length > 0) {
        const group = L.featureGroup(filtered);
        miniMap.flyToBounds(group.getBounds(), {
          padding: [40, 40],
          duration: 1.5
        });
      }
    });
  });

  // Clique no fundo do mapa reseta tudo e remove seleção visual
  miniMap.on('click', (e) => {
    const target = e.originalEvent.target;
    // Se clicou no fundo do mapa (tiles ou container)
    const isBackground = target.classList.contains('leaflet-tile') ||
      target.classList.contains('leaflet-container') ||
      target.classList.contains('leaflet-map-pane') ||
      target.id === 'mini-mapa';

    if (isBackground) {
      resetFilters();
    }
  });

  loadFeirantes();
});
