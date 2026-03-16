import json

with open("feirantes.geojson", "r", encoding="utf-8") as f:
    data = f.read()

with open("feirantes.js", "w", encoding="utf-8") as f:
    f.write(f"const feirantesData = {data};")
