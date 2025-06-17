import json
from flask import Flask, render_template
import folium
from folium import plugins

app = Flask(__name__)

ALBERTA_CENTER = [53.9333, -116.5765]

def remove_loops(coords):
    """
    Checks if any coordinate repeats earlier in the list.
    If yes, cuts off the coordinates at the first repeated coordinate to avoid loops.
    """
    seen = {}
    for i, pt in enumerate(coords):
        if pt in seen:
            # Loop detected: remove everything from the repeated point onward
            loop_start_index = seen[pt]
            return coords[:loop_start_index + 1]
        seen[pt] = i
    return coords  # no loops found, return original list

# Load your single-geometry GeoJSON once on app startup
with open('South Saskatchewan River 000030030444.geojson') as f:
    river_geojson = json.load(f)

def extract_line_coords(geojson):
    """
    Extract a list of (lat, lon) tuples from a single geometry GeoJSON:
    handles LineString and MultiLineString.
    """
    coords = []
    geom = geojson
    if geom['type'] == 'LineString':
        coords = [(lat, lon) for lon, lat in geom['coordinates']]
    elif geom['type'] == 'MultiLineString':
        for line in geom['coordinates']:
            coords.extend([(lat, lon) for lon, lat in line])
    else:
        raise ValueError(f"Unexpected GeoJSON type: {geom['type']}")
    return coords

@app.route('/')
def index():
    river_coords = extract_line_coords(river_geojson)

    river_coords = remove_loops(river_coords)

    m = folium.Map(location=ALBERTA_CENTER, zoom_start=7, tiles=None)

    folium.TileLayer(
        tiles="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        attr="©OpenStreetMap, ©CartoDB",
        name="CartoDB Dark",
        control=False
    ).add_to(m)

    # Draw river polyline
    river_line = folium.PolyLine(
        river_coords,
        color='blue',
        weight=5,
        opacity=0, # <---- IMPORTANT
    ).add_to(m)

    # Add arrows along the river line
    plugins.PolyLineTextPath(
        river_line,
        '➔',
        repeat=1,
        offset=10,
        attributes={'fill': 'aqua', 'font-weight': 'bold', 'font-size': '20'}
    ).add_to(m)

    m.add_child(folium.LatLngPopup())

    # Save and render the map
    m.save('templates/map.html')
    return render_template('map.html')


if __name__ == '__main__':
    app.run(debug=True)

