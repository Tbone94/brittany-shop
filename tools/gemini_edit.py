#!/usr/bin/env python3
"""Edit/generate a photo with Gemini from reference images and a prompt.

Uses the API key from the squish-game Gemini->Meshy orchestrator's .env (never printed).
Usage (the orchestrator's venv has certifi): ~/Projects/squish-game/tools/gemini-meshy-orchestrator/.venv/bin/python tools/gemini_edit.py out.png prompt.txt ref1.png [ref2.png ...]
"""
import base64, json, os, ssl, sys, urllib.request, urllib.error
try:
    import certifi
    CTX = ssl.create_default_context(cafile=certifi.where())
except ImportError:
    CTX = ssl.create_default_context()

ENV = os.path.expanduser("~/Projects/squish-game/tools/gemini-meshy-orchestrator/.env")

def load_key():
    for line in open(ENV):
        line = line.strip()
        if line.startswith("GEMINI_API_KEY="):
            return line.split("=", 1)[1].strip().strip('"').strip("'")
    sys.exit("no GEMINI_API_KEY in the orchestrator .env")

def main():
    out, prompt_file, refs = sys.argv[1], sys.argv[2], sys.argv[3:]
    parts = [{"inline_data": {"mime_type": "image/png", "data": base64.b64encode(open(r, "rb").read()).decode()}} for r in refs]
    parts.append({"text": open(prompt_file).read()})
    body = {"contents": [{"role": "user", "parts": parts}],
            "generationConfig": {"responseModalities": ["IMAGE"], "imageConfig": {"aspectRatio": os.environ.get("GEMINI_ASPECT", "3:2")}}}
    models = [os.environ.get("GEMINI_IMAGE_MODEL") or "gemini-3.1-flash-image", "gemini-3-pro-image-preview", "gemini-2.5-flash-image"]
    last = ""
    for model in models:
        req = urllib.request.Request(
            "https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent" % model,
            data=json.dumps(body).encode(), headers={"x-goog-api-key": load_key(), "Content-Type": "application/json"})
        try:
            data = json.load(urllib.request.urlopen(req, timeout=300, context=CTX))
        except urllib.error.HTTPError as e:
            last = "%s: %s %s" % (model, e.code, e.read()[:300].decode(errors="replace"))
            print("tried", last)
            continue
        for part in (data.get("candidates") or [{}])[0].get("content", {}).get("parts", []):
            inl = part.get("inlineData") or part.get("inline_data")
            if inl and inl.get("data"):
                open(out, "wb").write(base64.b64decode(inl["data"]))
                print("saved", out, "with", model)
                return
        last = "%s: no image. %s" % (model, json.dumps(data)[:300])
        print("tried", last)
    sys.exit("failed: " + last)

main()
