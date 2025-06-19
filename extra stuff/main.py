import json

# --- Config ---
input_file = "MDA_ADP_05_DrainageBasin_BassinDeDrainage.geojson"   # your source GeoJSON file
name_substring = "SOUTH SASKATCHEWAN RIVER"      # string to search in "NameNom"

# --- Load the GeoJSON file ---
with open(input_file, 'r', encoding='utf-8') as f:
    data = json.load(f)

# --- Filter and save features ---
count = 0
for feature in data["features"]:
    name = feature["properties"].get("NameNom", "")
    if name_substring.lower() in name.lower():
        # Build new FeatureCollection
        out_data = {
            "type": "FeatureCollection",
            "features": [feature]
        }

        # Create a safe filename
        station = feature["properties"].get("StationNum", f"feature_{count}")
        safe_name = station.replace("/", "_") + ".geojson"

        # Save file in the current working directory
        with open(safe_name, "w", encoding='utf-8') as out_f:
            json.dump(out_data, out_f, indent=2)

        count += 1

print(f"{count} feature(s) saved to current directory.")