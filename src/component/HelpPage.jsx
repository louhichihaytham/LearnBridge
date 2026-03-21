import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { certificationCatalog } from "../data/certifications";
import { appendItem, storage } from "../utils/careerData";
import "../CSS/HelpPage.css";

const GET_HIRED_STATE_KEY = "learnbridge-get-hired-state";

function readSavedGetHiredState() {
  try {
    const raw = sessionStorage.getItem(GET_HIRED_STATE_KEY);
    if (!raw) {
      return null;
    }

    const saved = JSON.parse(raw);
    return {
      selectedRole: String(saved.selectedRole || ""),
      skillsText: String(saved.skillsText || ""),
      cvFileName: String(saved.cvFileName || ""),
      fileError: String(saved.fileError || ""),
      certPlanResult: saved.certPlanResult || null,
      certPlanError: String(saved.certPlanError || ""),
      jobMatchResult: saved.jobMatchResult || null,
      jobMatchError: String(saved.jobMatchError || ""),
    };
  } catch {
    return null;
  }
}

const trendYears = [2024, 2025, 2026, 2027, 2028, 2029, 2030];

const trendPalette = [
  "#2563eb",
  "#059669",
  "#d97706",
  "#7c3aed",
  "#dc2626",
  "#0d9488",
  "#9333ea",
  "#ea580c",
  "#0284c7",
  "#16a34a",
];

const domainGrowthData = {
  "AI/ML": {
    growthPct: 34,
    sourceLabel: "BLS Data Scientists, 2024-2030",
    sourceUrl: "https://www.bls.gov/ooh/math/data-scientists.htm",
  },
  Blockchain: {
    growthPct: 15,
    sourceLabel: "BLS Software Developers (proxy), 2024-2030",
    sourceUrl:
      "https://www.bls.gov/ooh/computer-and-information-technology/software-developers.htm",
  },
  Cloud: {
    growthPct: 12,
    sourceLabel: "BLS Computer Network Architects (proxy), 2024-2030",
    sourceUrl:
      "https://www.bls.gov/ooh/computer-and-information-technology/computer-network-architects.htm",
  },
  Cybersecurity: {
    growthPct: 29,
    sourceLabel: "BLS Information Security Analysts, 2024-2030",
    sourceUrl:
      "https://www.bls.gov/ooh/computer-and-information-technology/information-security-analysts.htm",
  },
  Data: {
    growthPct: 34,
    sourceLabel: "BLS Data Scientists, 2024-2030",
    sourceUrl: "https://www.bls.gov/ooh/math/data-scientists.htm",
  },
  Database: {
    growthPct: 4,
    sourceLabel: "BLS Database Administrators and Architects, 2024-2030",
    sourceUrl:
      "https://www.bls.gov/ooh/computer-and-information-technology/database-administrators.htm",
  },
  DevOps: {
    growthPct: 15,
    sourceLabel: "BLS Software Developers (proxy), 2024-2030",
    sourceUrl:
      "https://www.bls.gov/ooh/computer-and-information-technology/software-developers.htm",
  },
  "IT Service Management": {
    growthPct: 6,
    sourceLabel: "BLS Project Management Specialists (proxy), 2024-2030",
    sourceUrl:
      "https://www.bls.gov/ooh/business-and-financial/project-management-specialists.htm",
  },
  Languages: {
    growthPct: 2,
    sourceLabel: "BLS Interpreters and Translators, 2024-2030",
    sourceUrl:
      "https://www.bls.gov/ooh/media-and-communication/interpreters-and-translators.htm",
  },
  "Mobile Development": {
    growthPct: 15,
    sourceLabel: "BLS Software Developers (proxy), 2024-2030",
    sourceUrl:
      "https://www.bls.gov/ooh/computer-and-information-technology/software-developers.htm",
  },
  Networking: {
    growthPct: 12,
    sourceLabel: "BLS Computer Network Architects (proxy), 2024-2030",
    sourceUrl:
      "https://www.bls.gov/ooh/computer-and-information-technology/computer-network-architects.htm",
  },
  Programming: {
    growthPct: 15,
    sourceLabel: "BLS Software Developers, 2024-2030",
    sourceUrl:
      "https://www.bls.gov/ooh/computer-and-information-technology/software-developers.htm",
  },
  "Project Management": {
    growthPct: 6,
    sourceLabel: "BLS Project Management Specialists, 2024-2030",
    sourceUrl:
      "https://www.bls.gov/ooh/business-and-financial/project-management-specialists.htm",
  },
  "QA Testing": {
    growthPct: 15,
    sourceLabel: "BLS Software QA Analysts and Testers, 2024-2030",
    sourceUrl:
      "https://www.bls.gov/ooh/computer-and-information-technology/software-developers.htm",
  },
  "UI/UX": {
    growthPct: 7,
    sourceLabel: "BLS Web Developers and Digital Designers (proxy), 2024-2030",
    sourceUrl:
      "https://www.bls.gov/ooh/computer-and-information-technology/web-developers.htm",
  },
  "Web Development": {
    growthPct: 7,
    sourceLabel: "BLS Web Developers and Digital Designers, 2024-2030",
    sourceUrl:
      "https://www.bls.gov/ooh/computer-and-information-technology/web-developers.htm",
  },
};

const plannerRoleGuides = [
  {
    role: "Data Scientist",
    keywords: ["data", "machine learning", "python", "analytics", "sql"],
    certificationTypes: ["Data", "AI/ML", "Programming", "Database"],
  },
  {
    role: "Cloud Engineer",
    keywords: ["cloud", "aws", "azure", "gcp", "devops"],
    certificationTypes: ["Cloud", "DevOps", "Networking", "Cybersecurity"],
  },
  {
    role: "Cybersecurity Analyst",
    keywords: ["security", "siem", "network", "threat", "soc"],
    certificationTypes: ["Cybersecurity", "Networking", "Cloud"],
  },
  {
    role: "Frontend Developer",
    keywords: ["frontend", "react", "javascript", "ui", "css"],
    certificationTypes: ["Web Development", "Programming", "UI/UX"],
  },
  {
    role: "Backend Developer",
    keywords: ["backend", "api", "node", "java", "database"],
    certificationTypes: ["Programming", "Database", "Cloud", "DevOps"],
  },
  {
    role: "Project Manager",
    keywords: ["project", "agile", "scrum", "planning", "team"],
    certificationTypes: ["Project Management", "IT Service Management"],
  },
];

const roleMatchGuides = [
  {
    role: "Data Analyst",
    keywords: ["sql", "excel", "power bi", "tableau", "python", "analytics"],
  },
  {
    role: "Machine Learning Engineer",
    keywords: ["python", "tensorflow", "pytorch", "ml", "ai", "data"],
  },
  {
    role: "Cloud Engineer",
    keywords: ["aws", "azure", "gcp", "cloud", "linux", "docker"],
  },
  {
    role: "DevOps Engineer",
    keywords: ["docker", "kubernetes", "ci/cd", "terraform", "linux", "devops"],
  },
  {
    role: "Cybersecurity Analyst",
    keywords: ["security", "siem", "soc", "incident", "threat", "network"],
  },
  {
    role: "Frontend Developer",
    keywords: ["react", "javascript", "html", "css", "typescript", "frontend"],
  },
  {
    role: "Backend Developer",
    keywords: [
      "node",
      "express",
      "java",
      "api",
      "mongodb",
      "postgres",
      "backend",
    ],
  },
  {
    role: "QA Automation Engineer",
    keywords: ["testing", "selenium", "cypress", "automation", "qa"],
  },
];

function buildProjectedSeries(growthPct) {
  const baseIndex = 100;
  return trendYears.map((year) => {
    const progress = (year - 2024) / 10;
    return Math.round(baseIndex * (1 + (growthPct / 100) * progress));
  });
}

function inferLearningLevel(price) {
  const numericPrice = Number(price || 0);
  if (numericPrice <= 80) {
    return "Beginner";
  }
  if (numericPrice <= 140) {
    return "Intermediate";
  }
  return "Advanced";
}

function HelpPage({ isAuthenticated }) {
  const savedState = useMemo(() => readSavedGetHiredState(), []);

  const [selectedRole, setSelectedRole] = useState(
    savedState?.selectedRole || "",
  );
  const [skillsText, setSkillsText] = useState(savedState?.skillsText || "");
  const [cvFileName, setCvFileName] = useState(savedState?.cvFileName || "");
  const [cvFile, setCvFile] = useState(null);
  const [fileError, setFileError] = useState(savedState?.fileError || "");

  const [certPlanResult, setCertPlanResult] = useState(
    savedState?.certPlanResult || null,
  );
  const [certPlanLoading, setCertPlanLoading] = useState(false);
  const [certPlanError, setCertPlanError] = useState(
    savedState?.certPlanError || "",
  );

  const [jobMatchResult, setJobMatchResult] = useState(
    savedState?.jobMatchResult || null,
  );
  const [jobMatchLoading, setJobMatchLoading] = useState(false);
  const [jobMatchError, setJobMatchError] = useState(
    savedState?.jobMatchError || "",
  );
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    const snapshot = {
      selectedRole,
      skillsText,
      cvFileName,
      fileError,
      certPlanResult,
      certPlanError,
      jobMatchResult,
      jobMatchError,
    };

    try {
      sessionStorage.setItem(GET_HIRED_STATE_KEY, JSON.stringify(snapshot));
    } catch {
      // Ignore storage quota/privacy errors.
    }
  }, [
    selectedRole,
    skillsText,
    cvFileName,
    fileError,
    certPlanResult,
    certPlanError,
    jobMatchResult,
    jobMatchError,
  ]);

  const allCertifications = useMemo(
    () =>
      certificationCatalog.flatMap((domain) =>
        domain.certifications.map((cert) => ({
          ...cert,
          type: domain.type,
        })),
      ),
    [],
  );

  const domainTrendSeries = useMemo(() => {
    return certificationCatalog.map((domain, index) => {
      const growthInfo = domainGrowthData[domain.type] || {
        growthPct: 5,
        sourceLabel: "Fallback growth proxy",
        sourceUrl: "https://www.bls.gov/ooh/",
      };
      const values = buildProjectedSeries(growthInfo.growthPct);

      return {
        label: domain.type,
        color: trendPalette[index % trendPalette.length],
        values,
        growthPct: growthInfo.growthPct,
        sourceLabel: growthInfo.sourceLabel,
        sourceUrl: growthInfo.sourceUrl,
      };
    });
  }, []);

  const buildSeriesPoints = (values) => {
    const width = 320;
    const height = 150;
    const padding = 18;
    const min = Math.min(...values);
    const max = Math.max(...values);

    return values
      .map((value, index) => {
        const x =
          padding + (index * (width - padding * 2)) / (values.length - 1 || 1);
        const y =
          height -
          padding -
          ((value - min) / (max - min || 1)) * (height - padding * 2);
        return `${x},${y}`;
      })
      .join(" ");
  };

  const handleCvUpload = async (event) => {
    const file = event.target.files?.[0];
    setFileError("");

    if (!file) {
      setCvFile(null);
      setCvFileName("");
      return;
    }

    const lowerName = String(file.name || "").toLowerCase();
    const isPdf = file.type === "application/pdf" || lowerName.endsWith(".pdf");
    const isTxt = file.type.startsWith("text/") || lowerName.endsWith(".txt");

    if (!isPdf && !isTxt) {
      setCvFile(null);
      setCvFileName("");
      setFileError(
        "Upload a PDF or TXT CV file, or paste your skills manually.",
      );
      return;
    }

    setCvFile(file);
    setCvFileName(file.name);
  };

  const generateCertificationPlan = () => {
    const role = selectedRole.trim();
    if (!role) {
      setCertPlanError("Please enter a job title first.");
      return;
    }

    setCertPlanLoading(true);
    setCertPlanError("");

    const normalized = role.toLowerCase();
    const scoredGuides = plannerRoleGuides
      .map((guide) => {
        const roleMatch = guide.role.toLowerCase().includes(normalized) ? 2 : 0;
        const keywordHits = guide.keywords.filter((keyword) =>
          normalized.includes(keyword),
        ).length;
        return {
          ...guide,
          score: roleMatch + keywordHits,
        };
      })
      .sort((a, b) => b.score - a.score);

    const matchedGuide = scoredGuides[0]?.score > 0 ? scoredGuides[0] : null;

    if (!matchedGuide) {
      setCertPlanError(
        "No clear role match yet. Try a more specific job title.",
      );
      setCertPlanResult(null);
      setCertPlanLoading(false);
      return;
    }

    const recommendations = allCertifications
      .filter((cert) => matchedGuide.certificationTypes.includes(cert.type))
      .sort((a, b) => a.priceTnd - b.priceTnd || a.name.localeCompare(b.name))
      .slice(0, 12)
      .map((cert) => ({
        name: cert.name,
        provider: cert.provider,
        type: cert.type,
        price: cert.priceTnd || 99.99,
        level: inferLearningLevel(cert.priceTnd || 99.99),
        reason: `Relevant to ${matchedGuide.role} through ${cert.type} skills.`,
      }));

    if (!recommendations.length) {
      setCertPlanError("Planner returned no recommendations.");
      setCertPlanResult(null);
      setCertPlanLoading(false);
      return;
    }

    setCertPlanResult({
      matchedRole: matchedGuide.role,
      recommendations,
      source: { mode: "local" },
    });
    setCertPlanLoading(false);
  };

  const saveCurrentSearch = () => {
    if (!selectedRole.trim() && !skillsText.trim() && !cvFileName) {
      setSaveMessage("Add role/skills or upload a CV before saving a search.");
      return;
    }

    appendItem(storage.savedSearches, {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      savedAt: new Date().toISOString(),
      selectedRole: selectedRole.trim(),
      skillsText: skillsText.trim(),
      cvFileName,
      topRoleMatch: jobMatchResult?.roles?.[0]?.role || "",
      extractedSkillCount: jobMatchResult?.extractedSkills?.length || 0,
    });

    setSaveMessage("Search saved to Dashboard.");
  };

  const saveCurrentPlan = () => {
    if (!certPlanResult) {
      setSaveMessage("Generate a certification plan before saving.");
      return;
    }

    appendItem(storage.savedPlans, {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      savedAt: new Date().toISOString(),
      matchedRole: certPlanResult.matchedRole,
      recommendations: certPlanResult.recommendations || [],
    });

    setSaveMessage("Certification plan saved to Dashboard.");
  };

  const clearCurrentSearch = () => {
    setSelectedRole("");
    setSkillsText("");
    setCvFileName("");
    setCvFile(null);
    setFileError("");
    setCertPlanResult(null);
    setCertPlanError("");
    setJobMatchResult(null);
    setJobMatchError("");
    setSaveMessage("Current Get Hired search cleared.");
    sessionStorage.removeItem(GET_HIRED_STATE_KEY);
  };

  const generateJobMatches = async () => {
    const input = skillsText.trim();
    if (!input && !cvFile) {
      setJobMatchError("Please paste skills text or upload a CV first.");
      return;
    }

    setJobMatchLoading(true);
    setJobMatchError("");

    try {
      const formData = new FormData();
      if (input) {
        formData.append("skillsText", input);
      }
      if (cvFile) {
        formData.append("cvFile", cvFile);
      }

      const response = await fetch("http://localhost:3001/api/ai/job-matches", {
        method: "POST",
        body: formData,
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        setJobMatchResult(null);
        setJobMatchError(
          payload?.message ||
            "CV scan failed. Try a text-based PDF/TXT CV or paste your skills.",
        );
        return;
      }

      setJobMatchResult({
        roles: Array.isArray(payload?.roles) ? payload.roles : [],
        extractedSkills: Array.isArray(payload?.extractedSkills)
          ? payload.extractedSkills
          : [],
        skillExtraction: payload?.skillExtraction || null,
        linkedinJobs: Array.isArray(payload?.linkedinJobs)
          ? payload.linkedinJobs
          : [],
        careerSuggestions: Array.isArray(payload?.careerSuggestions)
          ? payload.careerSuggestions
          : [],
        source: payload?.source || { mode: "unknown" },
      });

      if (!payload?.roles?.length) {
        setJobMatchError("No role matches found. Add more specific skills.");
      }
    } catch (error) {
      // Network/API unreachable: fallback to local keyword matching for resilience.
      const skillTokens = input
        .toLowerCase()
        .split(/[^a-z0-9+.#-]+/)
        .map((token) => token.trim())
        .filter(Boolean);

      const roles = roleMatchGuides
        .map((guide) => {
          const matchedSkills = guide.keywords.filter((keyword) =>
            skillTokens.includes(keyword),
          );
          return {
            role: guide.role,
            matchedSkills,
            matchReason: `Matched ${matchedSkills.length} keyword(s) from your profile.`,
            score: matchedSkills.length,
          };
        })
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 8)
        .map(({ score, ...item }) => item);

      setJobMatchResult({
        roles,
        extractedSkills: [],
        skillExtraction: null,
        linkedinJobs: [],
        careerSuggestions: [],
        source: { mode: "local-keyword", message: String(error) },
      });

      if (!roles.length) {
        setJobMatchError(
          "Could not reach AI service and no local role matches were found.",
        );
      } else {
        setJobMatchError(
          "AI service was unreachable, showing local fallback role matching.",
        );
      }
    } finally {
      setJobMatchLoading(false);
    }
  };

  return (
    <main className="help-page">
      <section className="help-hero">
        <h1>Get Hired: AI-Powered Career Path</h1>
        <p>
          Get certified, match your skills to roles, and land your next job. Use
          AI-powered analysis to find certifications tailored to your target
          role and discover matching job opportunities.
        </p>
        <div className="help-quick-actions">
          <button
            type="button"
            className="help-secondary-button"
            onClick={saveCurrentSearch}
          >
            Save Search
          </button>
          <button
            type="button"
            className="help-secondary-button"
            onClick={clearCurrentSearch}
          >
            Clear Search
          </button>
          <Link to="/dashboard" className="help-dashboard-link">
            Open Dashboard
          </Link>
        </div>
        {saveMessage ? <p className="help-api-status">{saveMessage}</p> : null}
      </section>

      <section className="help-trends">
        <h2>Hiring Trend Curves by Domain (2024-2030)</h2>
        <p>
          Curves are based on U.S. Bureau of Labor Statistics Job Outlook
          2024-2030 percentages, projected linearly into a 2024-2030 hiring index.
        </p>

        <div className="domain-trend-grid">
          {domainTrendSeries.map((series) => (
            <article key={series.label} className="domain-trend-card">
              <h3>{series.label}</h3>
              <p className="domain-trend-meta">
                Growth: {series.growthPct}% (2024-2030)
              </p>
              <a
                className="domain-trend-source"
                href={series.sourceUrl}
                target="_blank"
                rel="noreferrer"
              >
                Source: {series.sourceLabel}
              </a>
              <svg
                viewBox="0 0 320 150"
                className="domain-trend-chart"
                role="img"
                aria-label={`Hiring trend for ${series.label}`}
              >
                {[0, 1, 2, 3].map((line) => {
                  const y = 18 + line * 28;
                  return (
                    <line
                      key={line}
                      x1="18"
                      y1={y}
                      x2="302"
                      y2={y}
                      className="chart-grid"
                    />
                  );
                })}

                <polyline
                  fill="none"
                  stroke={series.color}
                  strokeWidth="3"
                  points={buildSeriesPoints(series.values)}
                />

                <text x="18" y="146" textAnchor="start" className="chart-year">
                  {trendYears[0]}
                </text>
                <text x="302" y="146" textAnchor="end" className="chart-year">
                  {trendYears[trendYears.length - 1]}
                </text>
              </svg>
            </article>
          ))}
        </div>
      </section>

      <section className="help-grid">
        <article className="help-card">
          <h2>1) Job to Certifications Planner</h2>
          <p>
            Enter a job title and discover the certifications you should
            complete before applying. Get personalized recommendations based on
            market demand.
          </p>
          <input
            type="text"
            value={selectedRole}
            onChange={(event) => {
              setSelectedRole(event.target.value);
              setCertPlanError("");
              setCertPlanResult(null);
            }}
            placeholder="Example: Cloud Engineer"
          />

          <button
            type="button"
            className="help-action-button"
            onClick={generateCertificationPlan}
            disabled={certPlanLoading}
          >
            {certPlanLoading
              ? "Generating plan..."
              : "Generate Certification Plan"}
          </button>
          <button
            type="button"
            className="help-secondary-button"
            onClick={saveCurrentPlan}
          >
            Save Plan
          </button>

          {certPlanError ? <p className="help-error">{certPlanError}</p> : null}

          {certPlanResult ? (
            <>
              <p className="help-note">
                Closest AI match: <strong>{certPlanResult.matchedRole}</strong>{" "}
                ({certPlanResult.source?.mode})
              </p>
              <ul className="help-list">
                {(certPlanResult.recommendations || []).map((cert) => (
                  <li key={`${cert.type}-${cert.name}`}>
                    <div>
                      <strong>{cert.name}</strong>
                      <span>
                        {cert.provider} · {cert.type}
                      </span>
                      <span>Learning level: {cert.level}</span>
                      {cert.reason ? <span>{cert.reason}</span> : null}
                    </div>
                    <div className="cert-actions">
                      <Link
                        to={`/payment?name=${encodeURIComponent(cert.name)}&provider=${encodeURIComponent(cert.provider)}&type=${encodeURIComponent(cert.type)}&price=${cert.price || 99.99}`}
                        className="cert-purchase-btn"
                      >
                        <span className="purchase-icon" aria-hidden="true" />
                        Purchase
                      </Link>
                      {isAuthenticated ? (
                        <Link
                          to={`/certifications/${encodeURIComponent(cert.type)}`}
                          className="cert-open-btn"
                        >
                          Open Domain
                        </Link>
                      ) : (
                        <Link
                          to="/signin"
                          state={{
                            from: `/certifications/${encodeURIComponent(cert.type)}`,
                          }}
                          className="cert-open-btn"
                        >
                          Sign In
                        </Link>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </article>

        <article className="help-card">
          <h2>2) CV/Skills to Matching Roles</h2>
          <p>
            Paste your skills or upload a CV. AI matching returns role fits and
            LinkedIn jobs that best match your profile.
          </p>

          <textarea
            value={skillsText}
            onChange={(event) => setSkillsText(event.target.value)}
            placeholder="Example: react, javascript, node, docker, aws"
            rows={6}
          />

          <label className="help-upload-label" htmlFor="cv-upload">
            Upload CV (PDF or TXT)
          </label>
          <input
            id="cv-upload"
            type="file"
            accept=".txt,.pdf"
            onChange={handleCvUpload}
          />
          {cvFileName ? <small>Uploaded file: {cvFileName}</small> : null}
          {fileError ? <p className="help-error">{fileError}</p> : null}

          <p className="help-note">
            This feature uses Ollama via your local server, with local keyword
            fallback if the API is unavailable.
          </p>

          <button
            type="button"
            className="help-action-button"
            onClick={generateJobMatches}
            disabled={jobMatchLoading}
          >
            {jobMatchLoading ? "Matching profile..." : "Generate Job Matches"}
          </button>
          <button
            type="button"
            className="help-secondary-button"
            onClick={saveCurrentSearch}
          >
            Save Search
          </button>

          {jobMatchError ? <p className="help-error">{jobMatchError}</p> : null}

          <ul className="help-list">
            {!jobMatchResult?.roles?.length ? (
              <li className="empty">
                No role matches yet. Paste skills and click Generate Job
                Matches.
              </li>
            ) : (
              jobMatchResult.roles.map((job) => (
                <li key={job.role}>
                  <div>
                    <strong>{job.role}</strong>
                    <span>
                      Matched skills: {(job.matchedSkills || []).join(", ")}
                    </span>
                    <span>
                      Confidence:{" "}
                      {Math.min((job.matchedSkills || []).length * 20, 95)}%
                    </span>
                    {job.matchReason ? <span>{job.matchReason}</span> : null}
                  </div>
                </li>
              ))
            )}
          </ul>

          <h3>Career Suggestions</h3>
          <ul className="help-list">
            {!jobMatchResult?.careerSuggestions?.length ? (
              <li className="empty">
                No career suggestions yet. Generate a profile match first.
              </li>
            ) : (
              jobMatchResult.careerSuggestions.map((suggestion) => (
                <li key={`${suggestion.title}-${suggestion.nextStep}`}>
                  <div>
                    <strong>{suggestion.title}</strong>
                    <span>{suggestion.nextStep}</span>
                  </div>
                </li>
              ))
            )}
          </ul>

          <h3>Extracted Skills From CV</h3>
          <ul className="help-list">
            {!jobMatchResult?.extractedSkills?.length ? (
              <li className="empty">
                No extracted skills yet. Upload a CV or add richer skills text.
              </li>
            ) : (
              <li>
                <div>
                  <strong>
                    Extraction source:{" "}
                    {jobMatchResult?.skillExtraction?.source?.mode || "unknown"}
                  </strong>
                  <span>{jobMatchResult.extractedSkills.join(", ")}</span>
                </div>
              </li>
            )}
          </ul>

          <h3>LinkedIn Job Matches</h3>
          <ul className="help-list">
            {!jobMatchResult?.linkedinJobs?.length ? (
              <li className="empty">
                No LinkedIn jobs returned yet. Try a richer CV/skills input.
              </li>
            ) : (
              jobMatchResult.linkedinJobs.map((job) => (
                <li key={`${job.link}-${job.title}`}>
                  <div>
                    <strong>{job.title}</strong>
                    <span>
                      {job.company} · {job.location}
                    </span>
                    <span>
                      Score: {job.matchScore}/10 · {job.recommendation}
                    </span>
                    {job.analysis ? <span>{job.analysis}</span> : null}
                  </div>
                  {job.link ? (
                    <a href={job.link} target="_blank" rel="noreferrer">
                      Open Job
                    </a>
                  ) : null}
                </li>
              ))
            )}
          </ul>

          {jobMatchResult?.source ? (
            <p className="help-note">
              Model source: {jobMatchResult.source.mode}
            </p>
          ) : null}
        </article>
      </section>
    </main>
  );
}

export default HelpPage;

