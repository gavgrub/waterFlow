import json
from flask import Flask, render_template, request
import folium
from shapely.geometry import Point

app = Flask(__name__)

ALBERTA_CENTER = [53.9333, -116.5765]

# Load GeoJSON once on app startup to avoid repeated disk reads
with open('alberta_boundary.geojson') as f:
    alberta_geojson = json.load(f)

@app.route('/')
def index():
    m = folium.Map(location=ALBERTA_CENTER, zoom_start=6, tiles=None)

    folium.TileLayer(
        tiles="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        attr="©OpenStreetMap, ©CartoDB",
        name="CartoDB Dark",
        control=False
    ).add_to(m)

    # Add Alberta boundary GeoJSON
    folium.GeoJson(
        alberta_geojson,
        name="Alberta Boundary",
        style_function=lambda feature: {
            'fillColor': 'blue',
            'color': 'blue',
            'weight': 2,
            'fillOpacity': 0.1,
        }
    ).add_to(m)

    m.add_child(folium.LatLngPopup())

    m.save('templates/map.html')
    return render_template('map.html')


@app.route('/simulate', methods=['POST'])
def simulate():
    lat = float(request.form['lat'])
    lon = float(request.form['lon'])

    path = [(lat, lon)]
    for i in range(1, 6):
        path.append((lat - i * 0.05, lon + i * 0.1))

    m = folium.Map(location=ALBERTA_CENTER, zoom_start=6, tiles=None)

    folium.TileLayer(
        tiles="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        attr="©OpenStreetMap, ©CartoDB",
        name="CartoDB Dark",
        control=False
    ).add_to(m)

    # Add Alberta boundary GeoJSON
    folium.GeoJson(
        alberta_geojson,
        name="Alberta Boundary",
        style_function=lambda feature: {
            'fillColor': 'blue',
            'color': 'blue',
            'weight': 2,
            'fillOpacity': 0.1,
        }
    ).add_to(m)

    folium.Marker([lat, lon], tooltip="Dropped Here").add_to(m)
    folium.PolyLine(path, color="aqua", weight=5).add_to(m)

    m.save('templates/map.html')
    return render_template('map.html')


if __name__ == '__main__':
    app.run(debug=True)
