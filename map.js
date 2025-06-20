//TODO: have this read the folders instead so I don't have to put in everything individually

// List of river GeoJSON files
const rivers = [
  {
    folder: '1',
    rivers: [
      {
        name: 'South Saskatchewan River',
        wiki: 'https://en.wikipedia.org/wiki/South_Saskatchewan_River'
      }
    ]
  },
  {
    folder: '2',
    rivers: [
      {
        name: 'Red Deer River',
        wiki: 'https://en.wikipedia.org/wiki/Red_Deer_River'
      },
      {
        name: 'Bow River 1',
        wiki: 'https://en.wikipedia.org/wiki/Bow_River'
      },
      {
        name: 'Bow River 2',
        wiki: 'https://en.wikipedia.org/wiki/Bow_River'
      },
      {
        name: 'Bow River 3',
        wiki: 'https://en.wikipedia.org/wiki/Bow_River'
      },
      {
        name: 'Oldman River',
        wiki: 'https://en.wikipedia.org/wiki/Oldman_River'
      },
      {
        name: 'Seven Persons Creek',
        wiki: 'https://www.tourismmedicinehat.com/features/paddle-seven-persons'
      }
    ]
  },
  {
    folder: '3',
    rivers: [
      {
        name: 'Saint Mary River',
        wiki: 'https://en.wikipedia.org/wiki/St._Mary_River_(Alberta–Montana)'
      },
      {
        name: 'Belly River',
        wiki: 'https://en.wikipedia.org/wiki/Belly_River'
      },
      {
        name: 'Castle River',
        wiki: 'https://www.albertaparks.ca/parks/south/castle-pp/information-facilities/camping/castle-river-bridge/'
      },
      {
        name: 'Willow Creek',
        wiki: 'https://www.albertaparks.ca/parks/south/willow-creek-pp/'
      },
      {
        name: 'Livingstone River',
        wiki: 'https://www.albertaparks.ca/parks/south/livingstone-falls-pra/information-facilities/camping/livingstone-falls/'
      },
      {
        name: 'Crowsnest River 1',
        wiki: 'https://en.wikipedia.org/wiki/Crowsnest_River'
      },
      {
        name: 'Crowsnest River 2',
        wiki: 'https://en.wikipedia.org/wiki/Crowsnest_River'
      },
      {
        name: 'Little Bow River 1',
        wiki: 'https://en.wikipedia.org/wiki/Little_Bow_River'
      },
      {
        name: 'Little Bow River 2',
        wiki: 'https://en.wikipedia.org/wiki/Little_Bow_River'
      },
      {
        name: 'Little Bow River 3',
        wiki: 'https://en.wikipedia.org/wiki/Little_Bow_River'
      },
      {
        name: 'Kananaskis River',
        wiki: 'https://en.wikipedia.org/wiki/Kananaskis_River'
      },
      {
        name: 'Elbow River',
        wiki: 'https://en.wikipedia.org/wiki/Elbow_River'
      },
      {
        name: 'Highwood River',
        wiki: 'https://en.wikipedia.org/wiki/Highwood_River'
      },
      {
        name: 'Ross Creek',
        wiki: 'https://www.albertadiscoverguide.com/site.cfm?grid=F4&number=20'
      }
    ]
  },
  {
    folder: '4',
    rivers: [
      {
        name: 'Sheep River',
        wiki: 'https://en.wikipedia.org/wiki/Sheep_River_(Alberta)'
      },
      {
        name: 'Waterton River',
        wiki: 'https://en.wikipedia.org/wiki/Waterton_River'
      }
    ]
  }
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

// Base layers
const whiteBase = L.tileLayer(
  'https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png',
  {
    attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19
  }
);
// Initialize map with one of the base layers
const map = L.map('map').setView([51.146, -108.458], 6);
whiteBase.addTo(map);

// TODO: Make Better
// Add the watershed to the map
let ssrsbLayer;

map.createPane('background');
map.getPane('background').style.zIndex = 200;

fetch('geodata/SSRB.geojson')
  .then(res => res.json())
  .then(data => {
    ssrsbLayer = L.geoJSON(data, {
      pane: 'background',
      interactive: false,
      style: { color: '#222', weight: 2, fillOpacity: 0.3 }
    });

    // Add initially if checkbox is checked
    if (document.getElementById('watershedToggle').checked) {
      ssrsbLayer.addTo(map);
    }
  });

// Add the cities to the map
let citiesLayer;

fetch('geodata/cities.geojson')
  .then(res => res.json())
  .then(data => {
    citiesLayer = L.geoJSON(data, {
      pointToLayer: function (feature, latlng) {
        const label = String(feature.properties.name);
        return L.circleMarker(latlng, {
          radius: 1,
        }).bindTooltip(label, { permanent: true, opacity: 0.7 }).openTooltip();
      }
    }); 
    if (document.getElementById('watershedToggle').checked) {
      citiesLayer.addTo(map);
    }
  });

let geoJsonLayers = [];

// This function loads and displays GeoJSON river data up to a given index level
async function loadGeoJSON(index) {
    try {
        // Clear previously loaded river layers from the map
        geoJsonLayers.forEach(layer => map.removeLayer(layer));
        geoJsonLayers = [];

        // Loop through each folder level up to the selected index
        for (let i = 0; i <= index; i++) {
            const { folder, rivers: riverList } = rivers[i];

            // Interpolate color for this level (for gradient effect)
            const t = index === 0 ? 0 : i / index;  // avoid division by zero
            const interpolatedColor = interpolateColor(startColor, endColor, t);

            // Loop through each river in the current folder level
            for (const river of riverList) {
                // Construct the relative file path to the GeoJSON file
                const url = `geodata/rivers/${folder}/${river.name}.geojson`;

                // Fetch the GeoJSON data for the river
                const response = await fetch(url);
                if (!response.ok) throw new Error(`Failed to load: ${url}`);
                const data = await response.json();

                // Create and style the GeoJSON layer
                const layer = L.geoJSON(data, {
                    style: feature => ({
                        color: interpolatedColor,
                        weight: 3
                    }),
                    onEachFeature: (feature, layer) => {
                        // Bind a popup with river name and Wikipedia link
                        const popupContent = `
                            <strong>${river.name.replace(/\s\d+$/, '')}</strong><br>
                            <a href="${river.wiki}" target="_blank">Info</a>
                        `;
                        layer.bindPopup(popupContent);
                    }
                }).addTo(map);

                // Store the layer for future removal
                geoJsonLayers.push(layer);
            }
        }

    } catch (err) {
        // Log any errors that occur during loading
        console.error(err);
    }
}

// Initialize with first file
loadGeoJSON(0);

// Event Listeners for UI controls
document.getElementById('geoSlider').addEventListener('input', e => {
  const val = parseInt(e.target.value, 10) - 1;  // slider value 1-based, convert to 0-based index
  if (val >= 0 && val < rivers.length) {
    loadGeoJSON(val);
  }
});

document.getElementById('watershedToggle').addEventListener('change', function () {
  if (!ssrsbLayer) return;
  if (this.checked) {
    ssrsbLayer.addTo(map);
  } else {
    map.removeLayer(ssrsbLayer);
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