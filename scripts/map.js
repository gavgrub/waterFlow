// This code handles everything related to the map
// A lot of this is vibecode, unfortunately 😔
// Forgive me, I can't code in js 🙏

let loadTributariesVersion = 0;
let currentIndex = 0
let isDisplayingFlow = false

// Colors
const startColor = [0, 0, 255];
const endColor = [255, 0, 0];

// This stores the location and metadata of the rivers
let riversData = [];

// These are layers that can be added to the map
let seawaLayer;
let ssrbLayer;
let citiesLayer;
let reservoirLayer;
let riverLayer = [];

// Helper Functions

// This function interpolates between two RGB colors based on a parameter t (0 to 1)
function interpolateColor(fromColor, toColor, t) {
  // Clamp t to [0, 1]
  t = Math.max(0, Math.min(1, t));

  const r = Math.round(fromColor[0] + (toColor[0] - fromColor[0]) * t);
  const g = Math.round(fromColor[1] + (toColor[1] - fromColor[1]) * t);
  const b = Math.round(fromColor[2] + (toColor[2] - fromColor[2]) * t);

  return `rgb(${r}, ${g}, ${b})`;
}

// This function loads and displays GeoJSON data of the SSRSB tributaries up to a given degree
async function loadTributaries(index, displayFlow=false) {
  const thisVersion = ++loadTributariesVersion;  // Increment and capture version

  try {
    // Clear existing layers only if this is the latest call
    if (thisVersion === loadTributariesVersion) {
      riverLayer.forEach(layer => map.removeLayer(layer));
      riverLayer = [];
    } else {
      // This call is outdated, stop here
      return;
    }

    for (let i = 0; i <= index; i++) {
      if (thisVersion !== loadTributariesVersion) return; // Abort if outdated

      const entry = riversData[i];
      if (!entry) continue;

      const { folder, rivers: riverData } = entry;

      const t = index === 0 ? 0 : i / index;
      const interpolatedColor = interpolateColor(startColor, endColor, t);

      for (const river of riverData) {
        if (thisVersion !== loadTributariesVersion) return; // Abort if outdated

        const url = `geodata/rivers/${folder}/${river.name}.geojson`;
        const response = await fetch(url);
        if (!response.ok) {
          console.warn(`Failed to load: ${url}`);
          continue;
        }
        const data = await response.json();

        if (thisVersion !== loadTributariesVersion) return; // Abort if outdated

        const layer = L.geoJSON(data, {
          style: feature => {
            if (displayFlow) {
              return { color: interpolatedColor, weight: 10, opacity: 0 };
            } else {
              return { color: interpolatedColor, weight: 3, opacity: 1 };
            }
          },
          onEachFeature: (feature, layer) => {
            const popupContent = `
              <strong>${river.name.replace(/\s\d+$/, '')}</strong><br>
              <a href="${river.wiki}" target="_blank">Info</a>
            `;
            layer.bindPopup(popupContent);

            if (displayFlow) {
              layer.setText('>', {
                repeat: true,
                center: false,
                attributes: {
                  fill: interpolatedColor,
                  offset: 7,
                  'font-weight': 'bold',
                  'font-size': '24px',
                }
              });
            }
          }
        }).addTo(map);

        riverLayer.push(layer);
      }
    }
  } catch (err) {
    console.error(err);
  }
}


// Load the rivers GeoJSON data
fetch('geodata/rivers/data.json')
  .then(response => response.json())
  .then(data => {
    riversData = data;
    console.log('Rivers loaded:', riversData);
    loadTributaries(0);
  })
  .catch(err => console.error(err));

// Load SEAWA Watershed
fetch('geodata/SEAWAW.geojson')
  .then(res => res.json())
  .then(data => {
    seawaLayer = L.geoJSON(data, {
      pane: 'background',
      interactive: false,
      style: { color: '#222', weight: 2, fillOpacity: 0.3 }
    });
});

// Load South Saskatchewan River Basin
fetch('geodata/SSRB.geojson')
  .then(res => res.json())
  .then(data => {
    ssrbLayer = L.geoJSON(data, {
      pane: 'background',
      interactive: false,
      style: { color: '#222', weight: 2, fillOpacity: 0.3 }
    });
});

// Load the city GeoJSON data
fetch('geodata/cities.geojson')
  .then(res => res.json())
  .then(data => {
    citiesLayer = L.geoJSON(data, {
      pointToLayer: function (feature, latlng) {
        const label = String(feature.properties.name);
        return L.circleMarker(latlng, {
          radius: 3,
        }).bindTooltip(label, { permanent: true, opacity: 0.7 }).openTooltip();
      }
    }); 
  });

// Load the reservoir GeoJSON data
fetch('geodata/reservoirs.geojson')
  .then(res => res.json())
  .then(data => {
    reservoirLayer = L.geoJSON(data, {
      pointToLayer: function (feature, latlng) {
        const label = String(feature.properties.name);
        return L.circleMarker(latlng, {
          radius: 3,
        }).bindTooltip(label, { permanent: true, opacity: 0.7 }).openTooltip();
      }
    }); 
  });

// Setup base layer
const whiteBase = L.tileLayer(
  'https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png',
  {
    attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19
  }
);

// Initialize map with the base layer
const map = L.map('map').setView([51.146, -108.458], 6);
whiteBase.addTo(map);

map.createPane('background');
map.getPane('background').style.zIndex = 200;

// Event Listeners for UI controls

document.getElementById('tributarySlider').addEventListener('input', e => {
  // Slider value 1-based, convert to 0-based index
  const val = parseInt(e.target.value, 10) - 1; 
  if (val >= 0 && val < riversData.length) {
    loadTributaries(val, isDisplayingFlow);
    currentIndex = val
  }
});

document.getElementById('watershedSelect').addEventListener('change', function () {
  const selectedValue = this.value;

  // Remove all watershed layers first (if they're on the map)
  if (seawaLayer) map.removeLayer(seawaLayer);
  if (ssrbLayer) map.removeLayer(ssrbLayer);

  // Add the appropriate layer based on selection
  switch (selectedValue) {
    case 'seawaw':
      if (seawaLayer) seawaLayer.addTo(map);
      break;
    case 'ssrb':
      if (ssrbLayer) ssrbLayer.addTo(map);
      break;
    case 'none':
    default:
      break;
  }
});

document.getElementById('settlementToggle').addEventListener('change', function () {
  if (!citiesLayer) return;
  if (this.checked) {
    citiesLayer.addTo(map);
  } else {
    map.removeLayer(citiesLayer);
  }
});

document.getElementById('reservoirToggle').addEventListener('change', function () {
  if (!reservoirLayer) return;
  if (this.checked) {
    reservoirLayer.addTo(map);
  } else {
    map.removeLayer(reservoirLayer);
  }
});

document.getElementById('waterFlowToggle').addEventListener('change', function () {
  if (this.checked) {
    isDisplayingFlow = true
  } else {
    isDisplayingFlow = false
  } 
  loadTributaries(currentIndex, isDisplayingFlow)

});