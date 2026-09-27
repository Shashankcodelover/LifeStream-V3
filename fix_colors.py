import os
import glob
import re

components_dir = r"frontend/src/components"
for filepath in glob.glob(os.path.join(components_dir, "*.jsx")):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content
    replacements = {
        "bg-slate-900": "bg-white",
        "bg-slate-800": "bg-slate-100",
        "bg-slate-950": "bg-white",
        "text-white": "text-slate-900",
        "text-slate-200": "text-slate-800",
        "text-slate-300": "text-slate-700",
        "text-slate-400": "text-slate-500",
        "border-slate-800": "border-slate-200",
        "border-slate-700": "border-slate-300"
    }

    for old, new in replacements.items():
        content = content.replace(old, new)

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")
