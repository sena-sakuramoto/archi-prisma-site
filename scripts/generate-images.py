"""
Generate all missing images for archi-prisma-site using Nano Banana Pro (Gemini image API)
"""
import json, urllib.request, base64, os, sys, time

API_KEY = os.environ.get('GEMINI_API_KEY', 'AIzaSyDIugwqhmSs-ftK-NIww2iItlyCynmUuk0')
MODEL = 'gemini-3-pro-image-preview'
URL = f'https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent?key={API_KEY}'
OUT_DIR = 'D:/senaa_dev/archi-prisma-site/public/assets/generated'

STYLE_DARK = """
Style: Professional architectural photography, cinematic lighting, moody atmosphere.
Color palette: Deep black (#0C0C0C), warm amber gold (#C4A882), charcoal grey.
STRICTLY NO blue, purple, cyan, or neon colors. No AI-gradient aesthetics.
Photorealistic, high resolution, 16:9 landscape aspect ratio.
"""

STYLE_LIGHT = """
Style: Professional architectural photography, natural daylight, warm tones.
Color palette: Warm whites (#F8F6F3), natural concrete, warm brown accents.
STRICTLY NO blue, purple, cyan, or neon colors.
Photorealistic, high resolution, 16:9 landscape aspect ratio.
"""

STYLE_ARCH_RENDER = """
Style: High-end architectural CG rendering / visualization.
Professional quality like Dbox or MIR studio renders.
Natural lighting, photorealistic materials, Japanese architectural context.
16:9 landscape aspect ratio.
"""

images = [
    # === TOP PAGE: Hook section ===
    {
        "name": "hook-manifesto",
        "prompt": f"""A dramatic architectural interior shot looking down a long corridor of exposed concrete.
A single thin beam of warm golden light cuts vertically through the space, dividing dark from darker.
The light falls on dust particles in the air. The concrete has subtle texture and warmth.
A sense of depth, mystery, and architectural precision. Inspired by Tadao Ando's light work.
{STYLE_DARK}"""
    },

    # === /ai PAGE ===
    {
        "name": "ai-hero",
        "prompt": f"""A cinematic wide shot of a modern Japanese architecture studio at night.
Multiple screens display architectural BIM models and data visualizations.
An architect's hands rest on a desk covered with sketches, a physical architectural model sits nearby.
The screens cast a warm amber glow on the concrete walls. Rain on floor-to-ceiling windows, city skyline behind.
The mood is focused, powerful, technological yet human. Not sci-fi — real professional workspace.
{STYLE_DARK}"""
    },
    {
        "name": "ai-vision",
        "prompt": f"""An abstract architectural composition: a concrete building facade at twilight,
where the structure transitions from traditional brick/stone on the left to clean modern glass and steel on the right.
A single vertical line of warm golden light runs down the center where old meets new.
Metaphor for tradition meeting innovation. Architectural photography style, dramatic lighting.
{STYLE_DARK}"""
    },
    {
        "name": "ai-service-circle",
        "prompt": f"""A warm, intimate scene of 6-8 Japanese professionals gathered around a large table
in a modern co-working space. Casual but focused. Laptops open, architectural sketches visible.
One person is presenting on a screen. The atmosphere is collaborative and energetic.
Warm pendant lighting, exposed concrete ceiling, large windows with evening light.
{STYLE_LIGHT}"""
    },
    {
        "name": "ai-service-consulting",
        "prompt": f"""Two professionals in a one-on-one meeting in a minimalist Japanese office.
One is a senior architect (50s, glasses) and the other is younger (30s) showing something on a laptop.
Warm desk lamp, clean desk with a few papers. The interaction is respectful and focused.
Shot from a slight distance, editorial photography style, shallow depth of field.
{STYLE_LIGHT}"""
    },
    {
        "name": "ai-service-training",
        "prompt": f"""A corporate training workshop in a modern Japanese conference room.
About 15 people seated at desks with laptops. A presenter stands next to a large screen
showing an AI workflow diagram with architectural plans. Active engagement, some people taking notes.
Natural light from large windows, professional setting, clean modern interior.
{STYLE_LIGHT}"""
    },
    {
        "name": "ai-service-program",
        "prompt": f"""A professional strategic planning session. A large whiteboard covered with
sticky notes, workflow diagrams, and timelines. A diverse team of 4-5 Japanese professionals
in smart casual standing around it, one pointing at a critical path. Architecture blueprints
pinned to the wall behind. The mood is determined and organized.
{STYLE_LIGHT}"""
    },
    {
        "name": "ai-service-development",
        "prompt": f"""Close-up of a developer's workspace at night. A wide monitor displays code (React/TypeScript)
next to an architectural floor plan on a secondary screen. The developer's hands are on the keyboard.
Warm desk lamp light, dark surroundings. A small architectural model sits on the desk as decoration.
Professional, focused, the intersection of coding and architecture.
{STYLE_DARK}"""
    },

    # === WORKS PAGE: Projects without images ===
    {
        "name": "work-shimomeguro-office",
        "prompt": f"""Architectural visualization of a modern 5-story commercial office building in Tokyo's Meguro area.
Clean lines, glass and concrete facade with warm wood louver accents on upper floors.
Street level has a sophisticated retail entrance. Small trees line the sidewalk.
The building sits naturally in a quiet Tokyo neighborhood with low-rise buildings nearby.
Late afternoon golden hour light. Viewed from across the street at a slight angle.
{STYLE_ARCH_RENDER}"""
    },
    {
        "name": "work-kotsubo-yataimura",
        "prompt": f"""Architectural visualization of a vibrant Japanese fishing port market village.
Low wooden stall structures with modern design language — exposed timber frames, metal roofs, string lights.
Bustling market atmosphere with food stalls and seating areas.
A small harbor with fishing boats visible in the background. Hills with green trees behind.
Warm late afternoon light, friendly and inviting atmosphere. Coastal Japanese town feel.
{STYLE_ARCH_RENDER}"""
    },
    {
        "name": "work-nagoya-nishiki",
        "prompt": f"""Aerial architectural visualization of a mixed-use urban development in Nagoya, Japan.
Modern towers with commercial podium, featuring a large public plaza with trees and water features.
Glass and concrete architecture with warm material accents. The development integrates with
the surrounding Nishiki neighborhood's urban fabric. Evening twilight with warm interior lighting
visible through glass facades.
{STYLE_ARCH_RENDER}"""
    },

    # === ABOUT PAGE ===
    {
        "name": "about-heritage",
        "prompt": f"""A poetic double exposure or layered composition: London's architectural skyline (Big Ben, modern glass towers)
gently overlapping with Tokyo's skyline (Tokyo Tower, modern buildings).
The two cities merge at the center, creating a visual bridge between East and West.
Warm tones, subtle golden light, architectural photography style.
NOT a tourist postcard — a sophisticated, muted editorial composition.
{STYLE_LIGHT}"""
    },
]

os.makedirs(OUT_DIR, exist_ok=True)

for i, img in enumerate(images):
    name = img["name"]
    path = f"{OUT_DIR}/{name}.jpg"

    if os.path.exists(path):
        print(f"[{i+1}/{len(images)}] SKIP {name} (exists)")
        continue

    print(f"[{i+1}/{len(images)}] Generating {name}...", end=" ", flush=True)

    payload = {
        "contents": [{"role": "user", "parts": [{"text": img["prompt"]}]}],
        "generationConfig": {"responseModalities": ["TEXT", "IMAGE"]}
    }

    for attempt in range(3):
        try:
            req = urllib.request.Request(
                URL,
                data=json.dumps(payload).encode("utf-8"),
                headers={"Content-Type": "application/json"},
                method="POST"
            )
            with urllib.request.urlopen(req, timeout=180) as res:
                data = json.loads(res.read().decode("utf-8"))

            parts = data.get("candidates", [{}])[0].get("content", {}).get("parts", [])
            saved = False
            for part in parts:
                inline = part.get("inlineData") or part.get("inline_data")
                if inline and inline.get("data"):
                    img_data = base64.b64decode(inline["data"])
                    with open(path, "wb") as f:
                        f.write(img_data)
                    print(f"OK ({len(img_data)//1024}KB)")
                    saved = True
                    break
            if not saved:
                print(f"No image in response (attempt {attempt+1})")
                if attempt < 2:
                    time.sleep(5)
            else:
                break
        except Exception as e:
            print(f"Error: {e} (attempt {attempt+1})")
            if attempt < 2:
                time.sleep(10)

    # Rate limit: 2s between requests
    if i < len(images) - 1:
        time.sleep(2)

print("\nAll done!")
