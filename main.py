import geopandas as gpd

gdf = gpd.read_file('thing.xml')
gdf.to_file('waters.geojson', driver='GeoJSON')