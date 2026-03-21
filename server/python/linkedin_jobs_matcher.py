"""
Bridge script to run LinkedIn scraping + CV/job matching using config.py and linkedin_scraper.py.
Reads JSON from stdin and prints JSON to stdout.
"""

import json
import os
import sys
from contextlib import redirect_stderr, redirect_stdout
from io import StringIO
from urllib import error as urlerror
from urllib import request as urlrequest

import config
import linkedin_scraper as ls
from linkedin_scraper import LinkedInJobScraper


def _safe_job(job):
    analysis = job.get("llm_analysis", {}) if isinstance(job, dict) else {}
    score = analysis.get("match_score", 0)
    recommendation = analysis.get("recommendation", "Unknown")

    return {
        "title": str(job.get("title", "Unknown Title")),
        "company": str(job.get("company", "Unknown Company")),
        "location": str(job.get("location", "Unknown")),
        "link": str(job.get("link", "")),
        "postedText": str(job.get("posted_text", "Unknown")),
        "matchScore": int(score),
        "recommendation": recommendation,
        "analysis": str(analysis.get("analysis", "")),
        "matchedSkills": analysis.get("matched_skills", []),
        "missingSkills": analysis.get("missing_skills", []),
    }


def _heuristic_job_score(skills_text, role_hints, job):
    text = " ".join(
        [
            str(job.get("title", "")),
            str(job.get("company", "")),
            str(job.get("location", "")),
            str(job.get("description", "")),
        ]
    ).lower()

    tokens = [
        token.strip()
        for token in skills_text.lower().replace("/", " ").replace(",", " ").split()
        if len(token.strip()) > 1
    ]
    unique_tokens = list(dict.fromkeys(tokens))

    matched_skills = [token for token in unique_tokens if token in text][:8]
    role_boost = sum(1 for role in role_hints if role.lower() in text)

    skill_hits = len(matched_skills)
    raw_score = skill_hits + role_boost
    score = max(0, min(10, raw_score))

    if score >= config.EXCELLENT_MATCH_THRESHOLD:
        recommendation = "Apply"
    elif score >= config.GOOD_MATCH_THRESHOLD:
        recommendation = "Maybe Apply"
    else:
        recommendation = "Review"

    return {
        "match_score": score,
        "recommendation": recommendation,
        "matched_skills": matched_skills,
        "missing_skills": [],
        "job_benefits": [],
        "analysis": f"Matched {skill_hits} CV skill keyword(s) and {role_boost} role hint(s) against this LinkedIn listing.",
    }


def _compare_resume_with_job_http(resume_text, job_data):
    job_context = f"""
Job Title: {job_data.get('title', 'Unknown')}
Company: {job_data.get('company', 'Unknown')}
Location: {job_data.get('location', 'Unknown')}

Job Description:
{job_data.get('description', 'No description available')}
"""

    if not job_data.get("description", "").strip():
        return {
            "match_score": 0,
            "recommendation": "Don't Apply",
            "matched_skills": [],
            "missing_skills": [],
            "job_benefits": [],
            "analysis": "No job description available",
        }

    prompt = f"""
You are an expert career advisor and recruiter.

RESUME:
{resume_text}

JOB POSTING:
{job_context}

Return ONLY valid JSON with this exact schema:
{{
  "match_score": <number 0-10>,
  "recommendation": "<Apply/Don't Apply/Maybe Apply>",
  "matched_skills": ["skill1", "skill2"],
  "missing_skills": ["skill1", "skill2"],
  "job_benefits": ["benefit1", "benefit2"],
  "analysis": "<2-3 sentence summary>"
}}
""".strip()

    payload = {
        "model": config.OLLAMA_MODEL,
        "format": "json",
        "stream": False,
        "messages": [{"role": "user", "content": prompt}],
        "options": {"temperature": 0.2},
    }

    req = urlrequest.Request(
        "http://127.0.0.1:11434/api/chat",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
    )

    try:
        with urlrequest.urlopen(req, timeout=45) as response:
            body = json.loads(response.read().decode("utf-8"))

        content = str(body.get("message", {}).get("content", "")).strip()
        if content.startswith("```"):
            content = content.strip("`")
            if content.startswith("json"):
                content = content[4:].strip()

        result = json.loads(content)
        for key, default in {
            "match_score": 0,
            "recommendation": "Unknown",
            "matched_skills": [],
            "missing_skills": [],
            "job_benefits": [],
            "analysis": "",
        }.items():
            if key not in result:
                result[key] = default
        return result
    except (json.JSONDecodeError, urlerror.URLError, TimeoutError, RuntimeError):
        return {
            "match_score": 0,
            "recommendation": "Maybe Apply",
            "matched_skills": [],
            "missing_skills": [],
            "job_benefits": [],
            "analysis": "Could not reliably parse model response for this job.",
        }


def _fallback_keywords(skills_text):
    tokens = set(
        token.strip()
        for token in skills_text.lower().replace("/", " ").replace(",", " ").split()
        if token.strip()
    )

    titles = []
    if {"data", "sql", "analytics", "python"} & tokens:
        titles.append("Data Analyst")
    if {"ml", "ai", "tensorflow", "pytorch"} & tokens:
        titles.append("Machine Learning Engineer")
    if {"cloud", "aws", "azure", "gcp"} & tokens:
        titles.append("Cloud Engineer")
    if {"docker", "kubernetes", "devops", "terraform"} & tokens:
        titles.append("DevOps Engineer")
    if {"react", "frontend", "javascript", "css"} & tokens:
        titles.append("Frontend Developer")
    if {"backend", "node", "java", "api"} & tokens:
        titles.append("Backend Developer")

    return titles or list(config.DEFAULT_JOB_TITLES)


def main():
    raw = sys.stdin.read().strip()
    if not raw:
        print(json.dumps({"error": "Empty input"}))
        sys.exit(1)

    try:
        payload = json.loads(raw)
    except json.JSONDecodeError:
        print(json.dumps({"error": "Invalid JSON payload"}))
        sys.exit(1)

    skills_text = str(payload.get("skillsText", "")).strip()
    role_hints = payload.get("roleHints") or []
    max_jobs = int(payload.get("maxJobs", 6))

    if not skills_text:
        print(json.dumps({"error": "skillsText is required"}))
        sys.exit(1)

    # Prefer runtime model from API request.
    runtime_model = str(payload.get("model", "")).strip()
    if runtime_model:
        config.OLLAMA_MODEL = runtime_model

    # Speed up API interactions while preserving config-driven behavior.
    config.DELAY_BETWEEN_REQUESTS = 0.2
    config.DELAY_BETWEEN_LOCATIONS = 0.2
    config.DELAY_AFTER_DESCRIPTION_FETCH = 0.2

    job_titles = [str(title).strip() for title in role_hints if str(title).strip()]
    if not job_titles:
        job_titles = _fallback_keywords(skills_text)

    try:
        ls.compare_resume_with_job = _compare_resume_with_job_http

        # The original scraper prints emoji-heavy logs. Silence stdout/stderr to
        # prevent Windows code page encoding errors and keep JSON-only output.
        with redirect_stdout(StringIO()), redirect_stderr(StringIO()):
            scraper = LinkedInJobScraper(analyze_with_llm=False, fetch_descriptions=False)
            scraper.resume_text = skills_text
            scraper.scrape(
                job_titles=job_titles,
                locations=list(config.DEFAULT_LOCATIONS),
                max_pages=max(1, int(config.MAX_PAGES_PER_LOCATION)),
                max_jobs=max_jobs,
            )

        jobs = list(scraper.jobs)

        # Retry with broader role keywords if the first pass found no jobs.
        if not jobs:
            broader_titles = list(dict.fromkeys(job_titles + _fallback_keywords(skills_text) + list(config.DEFAULT_JOB_TITLES)))
            with redirect_stdout(StringIO()), redirect_stderr(StringIO()):
                retry_scraper = LinkedInJobScraper(analyze_with_llm=False, fetch_descriptions=False)
                retry_scraper.resume_text = skills_text
                retry_scraper.scrape(
                    job_titles=broader_titles,
                    locations=list(config.DEFAULT_LOCATIONS),
                    max_pages=max(1, int(config.MAX_PAGES_PER_LOCATION)),
                    max_jobs=max_jobs,
                )
            jobs = list(retry_scraper.jobs)

        for job in jobs:
            job["llm_analysis"] = _heuristic_job_score(skills_text, job_titles, job)

        jobs.sort(
            key=lambda job: job.get("llm_analysis", {}).get("match_score", 0),
            reverse=True,
        )

        non_zero_jobs = [
            job
            for job in jobs
            if int(job.get("llm_analysis", {}).get("match_score", 0)) > 0
        ]

        top_jobs = [_safe_job(job) for job in (non_zero_jobs or jobs)[:max_jobs]]

        print(
            json.dumps(
                {
                    "jobs": top_jobs,
                    "search": {
                        "jobTitles": job_titles,
                        "locations": list(config.DEFAULT_LOCATIONS),
                        "maxJobs": max_jobs,
                    },
                    "source": {
                        "mode": "linkedin-scraper",
                        "model": config.OLLAMA_MODEL,
                    },
                }
            )
        )
    except Exception as exc:
        print(json.dumps({"error": str(exc)}))
        sys.exit(1)


if __name__ == "__main__":
    main()
