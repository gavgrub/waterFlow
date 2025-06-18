//TODO: have this read the folders instead so I don't have to put in everything individually

// List of river GeoJSON files
// The index denotes the degree of tributary
const rivers = [
    ['geodata/South Saskatchewan River.geojson',],
    ['geodata/Red Deer River.geojson', 'geodata/Bow River.geojson', 'geodata/Oldman River.geojson'],
    ['geodata/Saint Mary River.geojson', 'geodata/Belly River.geojson', 'geodata/Castle River.geojson'],
];

// Colors
const startColor = [0, 0, 255];
const endColor = [255, 0, 0];

// Helper Functions
function interpolateColor(fromColor, toColor, t) {
  // Clamp t to [0, 1]
  t = Math.max(0, Math.min(1, t));

  const r = Math.round(fromColor[0] + (toColor[0] - fromColor[0]) * t);
  const g = Math.round(fromColor[1] + (toColor[1] - fromColor[1]) * t);
  const b = Math.round(fromColor[2] + (toColor[2] - fromColor[2]) * t);

  return `rgb(${r}, ${g}, ${b})`;
}

// Create the map and a tile layer
const map = L.map('map').setView([51.146, -108.458], 6);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

let geoJsonLayers = [];

// This function loads GeoJSON data based on the index of the rivers array
async function loadGeoJSON(index) {
    try {
        // Remove previous layers
        geoJsonLayers.forEach(layer => map.removeLayer(layer));
        geoJsonLayers = [];

        // Iterate through the rivers array up to the specified index
        for (let i = 0; i <= index; i++) {

            // Determine the color of the river
            const t = index === 0 ? 0 : i / index;  // avoid division by zero
            const interpolatedColor = interpolateColor(startColor, endColor, t);

            for (let j = 0; j < rivers[i].length; j++) {
                const url = rivers[i][j];
                const response = await fetch(url);
                if (!response.ok) throw new Error(`Failed to load: ${url}`);
                const data = await response.json();

                const layer = L.geoJSON(data, {
                    style: feature => ({
                        color: interpolatedColor,
                        weight: 3
                    }),
                    onEachFeature: (feature, layer) => {
                        if (feature.properties?.description) {
                            layer.bindPopup(feature.properties.description);
                        }
                    }
                }).addTo(map);

                geoJsonLayers.push(layer);
            }
        }

    } catch (err) {
        console.error(err);
    }
}

// Initialize with first file
loadGeoJSON(0);

// Add event listener to the slider
document.getElementById('geoSlider').addEventListener('input', e => {
  const val = parseInt(e.target.value, 10) - 1;  // slider value 1-based, convert to 0-based index
  if (val >= 0 && val < rivers.length) {
    loadGeoJSON(val);
  }
});