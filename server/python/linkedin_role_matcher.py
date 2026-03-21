"""
Python role matcher adapted from linkedin_scraper.py matching style.
Reads JSON from stdin: {"skillsText": "..."}
Prints JSON to stdout: {"roles": [...], "source": {...}}
"""

import json
import sys
from urllib import error as urlerror
from urllib import request as urlrequest


DEFAULT_MODEL = "llama3.2"
OLLAMA_URL = "http://127.0.0.1:11434"
ROLE_GUIDES = [
    {
        "role": "Data Analyst",
        "keywords": ["sql", "excel", "power bi", "tableau", "python", "analytics"],
    },
    {
        "role": "Machine Learning Engineer",
        "keywords": ["python", "tensorflow", "pytorch", "ml", "ai", "data"],
    },
    {
        "role": "Cloud Engineer",
        "keywords": ["aws", "azure", "gcp", "cloud", "linux", "docker"],
    },
    {
        "role": "DevOps Engineer",
        "keywords": ["docker", "kubernetes", "ci/cd", "terraform", "linux", "devops"],
    },
    {
        "role": "Cybersecurity Analyst",
        "keywords": ["security", "siem", "soc", "incident", "threat", "network"],
    },
    {
        "role": "Frontend Developer",
        "keywords": ["react", "javascript", "html", "css", "typescript", "frontend"],
    },
    {
        "role": "Backend Developer",
        "keywords": ["node", "express", "java", "api", "mongodb", "postgres", "backend"],
    },
    {
        "role": "QA Automation Engineer",
        "keywords": ["testing", "selenium", "cypress", "automation", "qa"],
    },
]

ALLOWED_ROLES = {guide["role"] for guide in ROLE_GUIDES}


def normalize_response(parsed):
    roles = parsed.get("roles", []) if isinstance(parsed, dict) else []
    normalized = []

    for item in roles[:8]:
        if not isinstance(item, dict):
            continue
        role = str(item.get("role", "")).strip()
        if not role or role not in ALLOWED_ROLES:
            continue
        matched = item.get("matchedSkills", [])
        if not isinstance(matched, list):
            matched = []
        reason = str(item.get("matchReason", "Matched by Python LLM analysis.")).strip()
        normalized.append({
            "role": role,
            "matchedSkills": [str(skill).strip() for skill in matched if str(skill).strip()],
            "matchReason": reason,
        })

    return normalized


def heuristic_roles(skills_text):
    tokens = set(
        token.strip()
        for token in skills_text.lower().replace("/", " ").replace(",", " ").split()
        if token.strip()
    )

    ranked = []
    for guide in ROLE_GUIDES:
        matched = [kw for kw in guide["keywords"] if kw in skills_text.lower() or kw in tokens]
        if not matched:
            continue
        ranked.append(
            {
                "role": guide["role"],
                "matchedSkills": matched[:6],
                "matchReason": f"Matched {len(matched)} relevant skill(s) from your CV.",
                "score": len(matched),
            }
        )

    ranked.sort(key=lambda item: item["score"], reverse=True)
    return [{k: v for k, v in item.items() if k != "score"} for item in ranked[:8]]


def build_prompt(skills_text):
    return f"""
You are an expert recruiter and career advisor.

Candidate skills/CV text:
{skills_text}

Reference role guides:
{json.dumps(ROLE_GUIDES)}

Return ONLY valid JSON (no markdown) with this exact schema:
{{
  "roles": [
    {{
      "role": "<role title>",
      "matchedSkills": ["skill1", "skill2"],
      "matchReason": "<short reason>"
    }}
  ]
}}

Rules:
- Return up to 8 best matching roles.
- Prefer roles from the reference role guides.
- Keep matchedSkills specific and short.
""".strip()


def http_json(url, payload=None):
    data = None
    headers = {"Content-Type": "application/json"}

    if payload is not None:
        data = json.dumps(payload).encode("utf-8")

    req = urlrequest.Request(url, data=data, headers=headers)
    try:
        with urlrequest.urlopen(req, timeout=30) as response:
            body = response.read().decode("utf-8")
            return json.loads(body)
    except urlerror.HTTPError as exc:
        details = exc.read().decode("utf-8", errors="ignore")
        raise RuntimeError(f"HTTP {exc.code}: {details}") from exc
    except Exception as exc:
        raise RuntimeError(str(exc)) from exc


def resolve_model_name(model):
    tags = http_json(f"{OLLAMA_URL}/api/tags")
    installed = [item.get("name") for item in tags.get("models", []) if item.get("name")]

    if not installed:
        raise RuntimeError("No Ollama models installed. Run: ollama pull llama3.2")

    if model in installed:
        return model

    for name in installed:
        if name.startswith(f"{model}:"):
            return name

    return installed[0]


def main():
    raw = sys.stdin.read().strip()
    if not raw:
        print(json.dumps({"error": "Empty input"}))
        sys.exit(1)

    try:
        payload = json.loads(raw)
    except json.JSONDecodeError:
        print(json.dumps({"error": "Invalid JSON input"}))
        sys.exit(1)

    skills_text = str(payload.get("skillsText", "")).strip()
    model = str(payload.get("model", DEFAULT_MODEL)).strip() or DEFAULT_MODEL

    if not skills_text:
        print(json.dumps({"error": "skillsText is required"}))
        sys.exit(1)

    try:
        active_model = resolve_model_name(model)
        response = http_json(
            f"{OLLAMA_URL}/api/chat",
            {
                "model": active_model,
                "format": "json",
                "stream": False,
                "messages": [{"role": "user", "content": build_prompt(skills_text)}],
                "options": {"temperature": 0.2},
            },
        )

        content = str(response.get("message", {}).get("content", "")).strip()
        if content.startswith("```"):
            content = content.strip("`")
            if content.startswith("json"):
                content = content[4:].strip()

        parsed = json.loads(content)
        roles = normalize_response(parsed)

        if not roles:
            roles = heuristic_roles(skills_text)

        if not roles:
            raise ValueError("No usable roles returned")

        print(
            json.dumps(
                {
                    "roles": roles,
                    "source": {"mode": "python-linkedin-scraper", "model": active_model},
                }
            )
        )
    except Exception:
        roles = heuristic_roles(skills_text)
        if not roles:
            print(json.dumps({"error": "No usable roles returned"}))
            sys.exit(1)
        print(
            json.dumps(
                {
                    "roles": roles,
                    "source": {"mode": "python-heuristic", "model": model},
                }
            )
        )


if __name__ == "__main__":
    main()
