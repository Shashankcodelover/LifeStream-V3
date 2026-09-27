import os
import re

# 1. Update frontend/src/App.jsx
app_jsx_path = "frontend/src/App.jsx"
with open(app_jsx_path, 'r', encoding='utf-8') as f:
    app_jsx = f.read()

app_jsx = app_jsx.replace('bg-[#0b0f19] text-slate-100', 'bg-slate-50 text-slate-900')
app_jsx = app_jsx.replace('bg-slate-950/80', 'bg-white/80')
app_jsx = app_jsx.replace('text-slate-400', 'text-slate-600')
app_jsx = app_jsx.replace('border-slate-800', 'border-slate-200')

with open(app_jsx_path, 'w', encoding='utf-8') as f:
    f.write(app_jsx)


# 2. Update frontend/src/components/RadarMap.jsx
map_jsx_path = "frontend/src/components/RadarMap.jsx"
with open(map_jsx_path, 'r', encoding='utf-8') as f:
    map_jsx = f.read()

old_tiles = r"L\.tileLayer\('https://{s}\.basemaps\.cartocdn\.com/dark_all/\{z\}/\{x\}/\{y\}\{r\}\.png', \{[\s\S]*?\}\)\.addTo\(map\);"
new_tiles = r"""L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      attribution: '&copy; Google Maps',
      maxZoom: 19
    }).addTo(map);"""

map_jsx = re.sub(old_tiles, new_tiles, map_jsx)
with open(map_jsx_path, 'w', encoding='utf-8') as f:
    f.write(map_jsx)


# 3. Update src/server.js to export app for Vercel
server_js_path = "src/server.js"
with open(server_js_path, 'r', encoding='utf-8') as f:
    server_js = f.read()

if "module.exports = app;" not in server_js:
    server_js = server_js.replace("app.listen(PORT, () => {", "module.exports = app;\n\napp.listen(PORT, () => {")

with open(server_js_path, 'w', encoding='utf-8') as f:
    f.write(server_js)


# 4. Create vercel.json
vercel_json = """{
  "version": 2,
  "builds": [
    {
      "src": "src/server.js",
      "use": "@vercel/node"
    },
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "src/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "frontend/dist/$1"
    }
  ]
}"""
with open("vercel.json", 'w', encoding='utf-8') as f:
    f.write(vercel_json)

print("LifeStream fixes applied!")
