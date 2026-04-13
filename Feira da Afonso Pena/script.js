/* =============================================================
   FEIRA DA AFONSO PENA – script.js
   ============================================================= */

(function () {
  'use strict';

  // ── CUSTOM SMOOTH SCROLL para quick cards ────────────────────────────
  function smoothScrollTo(targetElement, duration) {
    const targetRect = targetElement.getBoundingClientRect();
    const targetPosition = targetRect.top + window.pageYOffset - 20;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    let startTime = null;

    function animation(currentTime) {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const run = ease(timeElapsed, startPosition, distance, duration);
      window.scrollTo(0, run);
      if (timeElapsed < duration) requestAnimationFrame(animation);
    }

    // easeInOutCubic - mais suave que quad
    function ease(t, b, c, d) {
      t /= d / 2;
      if (t < 1) return c / 2 * t * t * t + b;
      t -= 2;
      return c / 2 * (t * t * t + 2) + b;
    }

    requestAnimationFrame(animation);
  }

  document.querySelectorAll('.quick-card').forEach(card => {
    card.addEventListener('click', (e) => {
      const href = card.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        const target = document.getElementById(href.slice(1));
        if (target) {
          smoothScrollTo(target, 900);
        }
      }
    });
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
  // ── LIGHTBOX (IMAGE EXPAND) ──────────────────────────────────
  const lightboxOverlay = document.getElementById('lightboxOverlay');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxDownload = document.getElementById('lightboxDownload');
  const lightboxClose = document.getElementById('lightboxClose');

  if (lightboxOverlay && lightboxImg && lightboxDownload && lightboxClose) {
    document.querySelectorAll('.carousel-img').forEach((img, index) => {
      img.addEventListener('click', () => {
        const src = img.getAttribute('src');
        lightboxImg.src = src;
        lightboxDownload.href = src;
        lightboxDownload.download = 'Feira-Afonso-Pena-' + (index + 1) + '.jpg';
        lightboxOverlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // prevent scrolling
      });
    });

    const closeLightbox = () => {
      lightboxOverlay.classList.remove('active');
      document.body.style.overflow = '';
      setTimeout(() => { lightboxImg.src = ''; }, 300);
    };

    lightboxClose.addEventListener('click', closeLightbox);
    lightboxOverlay.addEventListener('click', (e) => {
      if (e.target === lightboxOverlay) closeLightbox();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightboxOverlay.classList.contains('active')) closeLightbox();
    });
  }

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
    maxZoom: 19,
    attributionControl: false
  });

  // Camada Base Clara (CartoDB Positron)
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    subdomains: 'abcd',
    maxZoom: 20
  }).addTo(miniMap);

  const sectorsLayer = L.featureGroup().addTo(miniMap);
  const stallsLayer = L.featureGroup().addTo(miniMap);
  const markersLayer = L.featureGroup().addTo(miniMap);
  const bathLayer = L.featureGroup().addTo(miniMap);
  const brigadaLayer = L.featureGroup().addTo(miniMap);

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

  // Conversor para MultiPolygon UTM → LatLng
  function convertMultiPolygon(multiCoords) {
    return multiCoords.map(polygon => {
      return polygon.map(ring => {
        return ring.map(c => {
          const pt = proj4('EPSG:31983', 'EPSG:4326', [c[0], c[1]]);
          return [pt[1], pt[0]];
        });
      });
    });
  }

  let initialBounds = null;
  const allStalls = [];
  const allBathrooms = [];
  const allBrigada = [];

  // Carregar Ponto de Apoio Brigada Profissional
  function loadBrigada() {
    console.log("Carregando ponto de apoio da brigada...");

    const brigadaIcon = L.divIcon({
      html: '<div style="background-color: #999999; width: 28px; height: 28px; border: 2px solid white; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display:flex; align-items:center; justify-content:center; font-size:14px;">🛡️</div>',
      className: 'custom-brigada-icon',
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });

    const marker = L.marker([-19.922331, -43.936566], { icon: brigadaIcon });

    const popupContent = `
      <div style="font-family:'Inter',sans-serif; padding:5px 0;">
        <h4 style="margin:0 0 8px; color:#555; font-size:14px; font-weight:700;">🛡️ Ponto de Apoio — Brigada Profissional</h4>
        <p style="margin:0 0 3px; font-size:12px;"><b>📍 Localização:</b> Av. Afonso Pena</p>
        <p style="margin:0; font-size:12px;"><b>⏰ Disponível:</b> Domingos, durante a Feira</p>
      </div>
    `;

    marker.bindPopup(popupContent);
    marker.bindTooltip('🛡️ Brigada Profissional', { direction: 'top', offset: [0, -10] });

    brigadaLayer.addLayer(marker);
    allBrigada.push(marker);

    console.log('Ponto de apoio da brigada carregado.');
  }

  // Carregar Banheiros (sanitários portáteis ao longo da Feira)
  function loadBanheiros() {
    console.log("Carregando banheiros da Feira...");

    // Ícone personalizado para banheiros (estilo do mapa original)
    const wcIcon = L.divIcon({
      html: '<div style="background-color: #26c6da; width: 28px; height: 28px; border: 2px solid white; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display:flex; align-items:center; justify-content:center; font-size:14px;">🚻</div>',
      className: 'custom-wc-icon',
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });

    // Posições dos sanitários ao longo da Av. Afonso Pena (trajeto da Feira)
    // Coordenadas baseadas no mapa original do BHMap
    const banheiros = [
      { nome: "Sanitário — Carijós/Espírito Santo", lat: -19.919366, lng: -43.937444, ref: "Esquina Carijós com Espírito Santo" },
      { nome: "Sanitário — Afonso Pena", lat: -19.922946, lng: -43.936461, ref: "Av. Afonso Pena" },
      { nome: "Sanitário — Praça Afonso Arinos", lat: -19.924692, lng: -43.936394, ref: "Praça Afonso Arinos" },
      { nome: "Sanitário — Correios", lat: -19.9240051, lng: -43.935699, ref: "Em frente aos Correios" },
      { nome: "Sanitário — Afonso Pena (Sul)", lat: -19.925482, lng: -43.934837, ref: "Av. Afonso Pena (próx. Carandaí)" }
    ];

    banheiros.forEach(b => {
      const marker = L.marker([b.lat, b.lng], { icon: wcIcon });

      const popupContent = `
        <div style="font-family:'Inter',sans-serif; padding:5px 0;">
          <h4 style="margin:0 0 8px; color:#00838f; font-size:14px; font-weight:700;">🚻 ${b.nome}</h4>
          <p style="margin:0 0 3px; font-size:12px;"><b>📍 Localização:</b> ${b.ref}</p>
          <p style="margin:0; font-size:12px;"><b>⏰ Disponível:</b> Domingos, 8h às 14h</p>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.bindTooltip(`🚻 ${b.nome}`, { direction: 'top', offset: [0, -10] });

      bathLayer.addLayer(marker);
      allBathrooms.push(marker);
    });

    console.log(`${allBathrooms.length} banheiros carregados no mapa.`);
  }

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
      if (s.includes("BANHEIRO")) return "#42b9f5"; // Azul claro para Banheiros
      if (s.includes("OUTROS")) return "#999999"; // Cinza para Outros
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
      if (initialBounds && initialBounds.isValid()) {
        miniMap.fitBounds(initialBounds, { padding: [20, 20] });
      }
    }
  }

  // --- LÓGICA DE FILTRO PELO MENU ---
  const sectorItems = document.querySelectorAll('.sector-item');

  function resetFilters() {
    console.log("Resetando filtros e zoom...");
    sectorItems.forEach(i => i.classList.remove('active'));

    // Restaurar feirantes
    stallsLayer.clearLayers();
    allStalls.forEach(stall => stallsLayer.addLayer(stall));

    // Restaurar banheiros
    bathLayer.clearLayers();
    allBathrooms.forEach(b => bathLayer.addLayer(b));

    // Restaurar brigada
    brigadaLayer.clearLayers();
    allBrigada.forEach(b => brigadaLayer.addLayer(b));

    if (initialBounds) {
      miniMap.flyToBounds(initialBounds, {
        padding: [20, 20],
        duration: 1.5,
        easeLinearity: 0.25
      });
    } else {
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
      if (item.id === 'setor-1' || item.id === 'setor-15') {
        sectorItems.forEach(i => i.classList.remove('active'));
        stallsLayer.clearLayers();
        allStalls.forEach(stall => stallsLayer.addLayer(stall));
        bathLayer.clearLayers();
        allBathrooms.forEach(b => bathLayer.addLayer(b));
        brigadaLayer.clearLayers();
        allBrigada.forEach(b => brigadaLayer.addLayer(b));

        const coords = item.id === 'setor-1'
          ? [-19.919351, -43.938571]
          : [-19.926778, -43.934002];

        miniMap.flyTo(coords, 18, { duration: 1.5 });
        return;
      }

      // Toggle active UI para filtros de categoria
      sectorItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');

      // Filtro especial para Banheiros
      if (filter.toUpperCase() === 'BANHEIROS') {
        stallsLayer.clearLayers();
        brigadaLayer.clearLayers();
        bathLayer.clearLayers();
        allBathrooms.forEach(b => bathLayer.addLayer(b));

        if (allBathrooms.length > 0) {
          const group = L.featureGroup(allBathrooms);
          miniMap.flyToBounds(group.getBounds(), {
            padding: [40, 40],
            duration: 1.5
          });
        }
        return;
      }

      // Filtro especial para Brigada Profissional
      if (filter.toUpperCase() === 'BRIGADA') {
        stallsLayer.clearLayers();
        bathLayer.clearLayers();
        brigadaLayer.clearLayers();
        allBrigada.forEach(b => brigadaLayer.addLayer(b));

        if (allBrigada.length > 0) {
          miniMap.flyTo([-19.922331, -43.936566], 18, { duration: 1.5 });
        }
        return;
      }

      // Filtrar feirantes no mapa (esconde marcadores especiais)
      bathLayer.clearLayers();
      brigadaLayer.clearLayers();
      stallsLayer.clearLayers();
      const filtered = [];

      const filterUpper = filter.toUpperCase();
      allStalls.forEach(stall => {
        const sectorName = stall.options.sectorName;
        // Match exato para VESTUÁRIO (não pegar VESTUÁRIO INFANTIL)
        if (filter === 'all' || (sectorName && (
          filterUpper === 'VESTUÁRIO' ? sectorName === 'VESTUÁRIO' :
            sectorName.includes(filterUpper)
        ))) {
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

  loadBanheiros();
  loadBrigada();
  loadFeirantes();
});
