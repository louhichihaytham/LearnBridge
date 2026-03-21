import express from "express";
import cors from "cors";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { existsSync } from "node:fs";
import { unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { dirname, resolve as resolvePath } from "node:path";
import { fileURLToPath } from "node:url";
import multer from "multer";
import { certificationCatalog } from "../src/data/certifications.js";

const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");

const app = express();
const PORT = Number(process.env.PORT || 3001);
const OLLAMA_URL = process.env.OLLAMA_URL || "http://127.0.0.1:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.1";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const VENV_PYTHON = resolvePath(__dirname, "../.venv/Scripts/python.exe");
const PYTHON_CMD =
  process.env.PYTHON_CMD || (existsSync(VENV_PYTHON) ? VENV_PYTHON : "python");
const PYTHON_MATCHER_SCRIPT = resolvePath(
  __dirname,
  "./python/linkedin_role_matcher.py",
);
const PYTHON_LINKEDIN_JOBS_SCRIPT = resolvePath(
  __dirname,
  "./python/linkedin_jobs_matcher.py",
);
const PYTHON_CV_EXTRACT_SCRIPT = resolvePath(
  __dirname,
  "./python/extract_cv_text.py",
);
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.get("/", (_req, res) => {
  res.json({
    ok: true,
    service: "LearnBridge AI API",
    endpoints: {
      health: "GET /api/health",
      jobMatches: "POST /api/ai/job-matches",
      certificationPlan: "POST /api/ai/certification-plan",
    },
    note: "Use the frontend at http://localhost:5173 for the full experience.",
  });
});

function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function getInstalledModels() {
  const response = await fetch(`${OLLAMA_URL}/api/tags`);
  if (!response.ok) {
    throw new Error(`Could not read models from Ollama: ${response.status}`);
  }

  const payload = await response.json();
  return Array.isArray(payload?.models)
    ? payload.models.map((model) => model.name)
    : [];
}

async function resolveModelName() {
  const installed = await getInstalledModels();
  if (!installed.length) {
    throw new Error("No Ollama models installed. Run: ollama pull llama3.2");
  }

  const exact = installed.find((name) => name === OLLAMA_MODEL);
  if (exact) {
    return exact;
  }

  const samePrefix = installed.find((name) =>
    name.startsWith(`${OLLAMA_MODEL}:`),
  );
  if (samePrefix) {
    return samePrefix;
  }

  return installed[0];
}

async function askOllama(systemPrompt, userPrompt) {
  const activeModel = await resolveModelName();

  const response = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: activeModel,
      format: "json",
      stream: false,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      options: {
        temperature: 0.2,
      },
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Ollama request failed: ${response.status} ${details}`);
  }

  const data = await response.json();
  const content = data?.message?.content?.trim();

  if (!content) {
    throw new Error("Ollama returned an empty response.");
  }

  const parsed = safeJsonParse(content);
  if (!parsed) {
    throw new Error("Ollama did not return valid JSON.");
  }

  return {
    parsed,
    activeModel,
  };
}

function flattenCertifications() {
  return certificationCatalog.flatMap((domain) =>
    domain.certifications.map((cert) => ({
      ...cert,
      type: domain.type,
    })),
  );
}

function heuristicCertPlan(jobTitle) {
  const lower = jobTitle.toLowerCase();
  const allCerts = flattenCertifications();
  const typePriority = [];

  if (/data|ml|ai|analyst/.test(lower)) {
    typePriority.push("Data", "AI/ML", "Programming", "Database");
  }
  if (/cloud|devops|sre|platform/.test(lower)) {
    typePriority.push("Cloud", "DevOps", "Networking");
  }
  if (/security|soc|cyber/.test(lower)) {
    typePriority.push("Cybersecurity", "Networking", "Cloud");
  }
  if (/front|ui|ux|web/.test(lower)) {
    typePriority.push("Web Development", "UI/UX", "Programming");
  }
  if (/back|api|node|java/.test(lower)) {
    typePriority.push("Programming", "Database", "Cloud");
  }
  if (/project|pm|scrum/.test(lower)) {
    typePriority.push("Project Management", "IT Service Management");
  }

  const uniqueTypes = [
    ...new Set(
      typePriority.length ? typePriority : ["Programming", "Cloud", "Data"],
    ),
  ];

  const recommendations = allCerts
    .filter((cert) => uniqueTypes.includes(cert.type))
    .sort((a, b) => a.priceTnd - b.priceTnd || a.name.localeCompare(b.name))
    .slice(0, 10)
    .map((cert) => ({
      name: cert.name,
      provider: cert.provider,
      type: cert.type,
      reason: `Relevant to ${jobTitle} through ${cert.type} skills.`,
    }));

  return {
    matchedRole: jobTitle,
    recommendations,
  };
}

function heuristicJobMatches(skillsText) {
  const skills = skillsText
    .toLowerCase()
    .split(/[^a-z0-9+.#-]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const jobs = [
    {
      title: "Data Analyst",
      keywords: ["sql", "excel", "power bi", "tableau", "python"],
    },
    {
      title: "Machine Learning Engineer",
      keywords: ["python", "tensorflow", "pytorch", "ml"],
    },
    {
      title: "Cloud Engineer",
      keywords: ["aws", "azure", "gcp", "linux", "docker"],
    },
    {
      title: "DevOps Engineer",
      keywords: ["docker", "kubernetes", "ci/cd", "terraform", "linux"],
    },
    {
      title: "Cybersecurity Analyst",
      keywords: ["security", "siem", "soc", "network"],
    },
    {
      title: "Frontend Developer",
      keywords: ["react", "javascript", "html", "css", "typescript"],
    },
    {
      title: "Backend Developer",
      keywords: ["node", "express", "java", "api", "mongodb", "postgres"],
    },
  ];

  return jobs
    .map((job) => {
      const matchedSkills = job.keywords.filter((k) => skills.includes(k));
      return {
        role: job.title,
        matchedSkills,
        matchReason: `Matched ${matchedSkills.length} skills from your profile.`,
        score: matchedSkills.length,
      };
    })
    .filter((job) => job.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map(({ score, ...job }) => job);
}

function buildCareerSuggestions(roles = [], linkedinJobs = []) {
  const roleNames = (roles || [])
    .map((role) => String(role?.role || "").trim())
    .filter(Boolean)
    .slice(0, 3);

  const roleSuggestions = roleNames.map((roleName) => ({
    title: `Career Path: ${roleName}`,
    nextStep: `Target ${roleName} roles and align your portfolio projects to this direction.`,
  }));

  const marketSignal = linkedinJobs.length
    ? {
        title: "Market Signal",
        nextStep: `Found ${linkedinJobs.length} LinkedIn listings matching your profile. Prioritize recent postings first.`,
      }
    : {
        title: "Market Signal",
        nextStep:
          "No LinkedIn listings found for the current input. Add more domain-specific skills or upload a richer CV.",
      };

  return [...roleSuggestions, marketSignal].slice(0, 4);
}

function runPythonLinkedinMatcher(skillsText, modelName) {
  return new Promise((resolve, reject) => {
    const child = spawn(PYTHON_CMD, [PYTHON_MATCHER_SCRIPT], {
      stdio: ["pipe", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    const timeout = setTimeout(() => {
      child.kill();
      reject(new Error("Python matcher timed out."));
    }, 30000);

    child.stdout.on("data", (chunk) => {
      stdout += String(chunk);
    });

    child.stderr.on("data", (chunk) => {
      stderr += String(chunk);
    });

    child.on("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });

    child.on("close", (code) => {
      clearTimeout(timeout);

      if (code !== 0) {
        const details = stderr.trim() || stdout.trim() || `exit code ${code}`;
        reject(new Error(`Python matcher failed: ${details}`));
        return;
      }

      const parsed = safeJsonParse(stdout.trim());
      if (!parsed || !Array.isArray(parsed.roles)) {
        reject(new Error("Python matcher returned invalid JSON payload."));
        return;
      }

      resolve(parsed);
    });

    child.stdin.write(
      JSON.stringify({
        skillsText,
        model: modelName,
      }),
    );
    child.stdin.end();
  });
}

function runPythonLinkedinJobsMatcher(skillsText, roleHints = [], modelName) {
  return new Promise((resolve, reject) => {
    const child = spawn(PYTHON_CMD, [PYTHON_LINKEDIN_JOBS_SCRIPT], {
      stdio: ["pipe", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    const timeout = setTimeout(() => {
      child.kill();
      reject(new Error("LinkedIn jobs matcher timed out."));
    }, 90000);

    child.stdout.on("data", (chunk) => {
      stdout += String(chunk);
    });

    child.stderr.on("data", (chunk) => {
      stderr += String(chunk);
    });

    child.on("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });

    child.on("close", (code) => {
      clearTimeout(timeout);

      if (code !== 0) {
        const details = stderr.trim() || stdout.trim() || `exit code ${code}`;
        reject(new Error(`LinkedIn jobs matcher failed: ${details}`));
        return;
      }

      const parsed = safeJsonParse(stdout.trim());
      if (!parsed || !Array.isArray(parsed.jobs)) {
        reject(
          new Error("LinkedIn jobs matcher returned invalid JSON payload."),
        );
        return;
      }

      resolve(parsed);
    });

    child.stdin.write(
      JSON.stringify({
        skillsText,
        roleHints,
        maxJobs: 6,
        model: modelName,
      }),
    );
    child.stdin.end();
  });
}

async function fetchLinkedinJobs(skillsText, roles, modelName) {
  try {
    const roleHints = (roles || [])
      .map((role) => String(role?.role || "").trim())
      .filter(Boolean);
    const jobsResult = await runPythonLinkedinJobsMatcher(
      skillsText,
      roleHints,
      modelName,
    );
    return Array.isArray(jobsResult?.jobs) ? jobsResult.jobs : [];
  } catch (jobsError) {
    console.warn(`LinkedIn jobs matcher unavailable: ${String(jobsError)}`);
    return [];
  }
}

function runPythonPdfTextExtractor(pdfPath) {
  return new Promise((resolve, reject) => {
    const child = spawn(PYTHON_CMD, [PYTHON_CV_EXTRACT_SCRIPT, pdfPath], {
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    const timeout = setTimeout(() => {
      child.kill();
      reject(new Error("Python PDF extraction timed out."));
    }, 30000);

    child.stdout.on("data", (chunk) => {
      stdout += String(chunk);
    });

    child.stderr.on("data", (chunk) => {
      stderr += String(chunk);
    });

    child.on("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });

    child.on("close", (code) => {
      clearTimeout(timeout);
      if (code !== 0) {
        reject(
          new Error(stderr.trim() || stdout.trim() || `exit code ${code}`),
        );
        return;
      }

      const parsed = safeJsonParse(stdout.trim());
      if (!parsed || typeof parsed.text !== "string") {
        reject(new Error("Python PDF extraction returned invalid payload."));
        return;
      }

      resolve(parsed.text.trim());
    });
  });
}

async function extractPdfTextWithFallback(pdfBuffer) {
  const parsePdfFn =
    typeof pdf === "function"
      ? pdf
      : typeof pdf?.default === "function"
        ? pdf.default
        : null;

  if (parsePdfFn) {
    try {
      const parsed = await parsePdfFn(pdfBuffer);
      const primaryText = String(parsed?.text || "").trim();
      if (primaryText) {
        return primaryText;
      }
    } catch {
      // Fall through to Python fallback.
    }
  }

  const tmpPath = join(
    tmpdir(),
    `learnbridge-cv-${Date.now()}-${Math.random().toString(16).slice(2)}.pdf`,
  );

  await writeFile(tmpPath, pdfBuffer);
  try {
    return await runPythonPdfTextExtractor(tmpPath);
  } finally {
    await unlink(tmpPath).catch(() => {});
  }
}

async function extractCvText(file) {
  if (!file) {
    return "";
  }

  const fileName = String(file.originalname || "").toLowerCase();
  const mimeType = String(file.mimetype || "").toLowerCase();
  const isPdf = mimeType === "application/pdf" || fileName.endsWith(".pdf");
  const isTxt = mimeType.startsWith("text/") || fileName.endsWith(".txt");

  if (isPdf) {
    const text = await extractPdfTextWithFallback(file.buffer);
    if (!text) {
      throw new Error(
        "Could not extract readable text from this PDF. Try another PDF or paste skills manually.",
      );
    }
    return text;
  }

  if (isTxt) {
    return file.buffer.toString("utf-8").trim();
  }

  throw new Error("Unsupported CV format. Upload PDF or TXT.");
}

function extractSkillsHeuristically(text) {
  const stopWords = new Set([
    "and",
    "the",
    "with",
    "from",
    "that",
    "this",
    "have",
    "your",
    "for",
    "role",
    "years",
    "experience",
  ]);

  const tokens = String(text || "")
    .toLowerCase()
    .split(/[^a-z0-9+.#/-]+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 2 && !stopWords.has(token));

  const unique = [...new Set(tokens)];
  const priority = [
    "javascript",
    "typescript",
    "react",
    "node",
    "nodejs",
    "python",
    "java",
    "sql",
    "docker",
    "kubernetes",
    "aws",
    "azure",
    "gcp",
    "devops",
    "ci/cd",
    "terraform",
    "mongodb",
    "postgres",
    "html",
    "css",
  ];

  const prioritized = priority.filter((skill) => unique.includes(skill));
  const remaining = unique.filter((skill) => !prioritized.includes(skill));
  return [...prioritized, ...remaining].slice(0, 40);
}

async function extractSkillsFromCvWithOllama(cvText) {
  const safeCvText = String(cvText || "").slice(0, 12000);

  const systemPrompt =
    'You extract professional skills from CV text. Return JSON only in this shape: {"skills": ["skill1", "skill2"]}.';
  const userPrompt = `Extract technical and professional skills from this CV/skills text. Normalize duplicates (for example js => javascript), keep concise skill phrases, and return up to 40 skills.\n\nCV TEXT:\n${safeCvText}`;

  try {
    const { parsed, activeModel } = await askOllama(systemPrompt, userPrompt);
    const rawSkills = Array.isArray(parsed?.skills) ? parsed.skills : [];
    const normalized = [
      ...new Set(
        rawSkills
          .map((skill) => String(skill).trim().toLowerCase())
          .filter(Boolean),
      ),
    ].slice(0, 40);

    if (!normalized.length) {
      throw new Error("No skills returned by model.");
    }

    return {
      skills: normalized,
      source: { mode: "ollama", model: activeModel },
    };
  } catch (error) {
    return {
      skills: extractSkillsHeuristically(safeCvText),
      source: {
        mode: "heuristic",
        model: OLLAMA_MODEL,
        message: String(error),
      },
    };
  }
}

app.get("/api/health", async (_req, res) => {
  try {
    const activeModel = await resolveModelName();
    res.json({ ok: true, ollamaUrl: OLLAMA_URL, model: activeModel });
  } catch (error) {
    res.status(503).json({
      ok: false,
      message: "Ollama is not reachable. Make sure `ollama serve` is running.",
      details: String(error),
    });
  }
});

app.post("/api/ai/certification-plan", async (req, res) => {
  const jobTitle = String(req.body?.jobTitle || "").trim();

  if (!jobTitle) {
    return res.status(400).json({ message: "jobTitle is required." });
  }

  const domainSummary = certificationCatalog.map((domain) => ({
    type: domain.type,
    certifications: domain.certifications.slice(0, 12).map((cert) => ({
      name: cert.name,
      provider: cert.provider,
      priceTnd: cert.priceTnd,
    })),
  }));

  const systemPrompt = `You are a career advisor. Return JSON only with this shape: {"matchedRole": string, "recommendations": [{"name": string, "provider": string, "type": string, "reason": string}]}. Keep recommendations between 6 and 12 items.`;
  const userPrompt = `Target job title: ${jobTitle}\nAvailable certification catalog by type: ${JSON.stringify(domainSummary)}\nChoose certifications that are most relevant for the target role.`;

  try {
    const { parsed: llm, activeModel } = await askOllama(
      systemPrompt,
      userPrompt,
    );

    const validTypes = new Set(
      certificationCatalog.map((domain) => domain.type),
    );
    const recommendations = Array.isArray(llm.recommendations)
      ? llm.recommendations
          .filter(
            (item) =>
              item?.name &&
              item?.type &&
              validTypes.has(String(item.type).trim()),
          )
          .map((item) => ({
            name: String(item.name).trim(),
            provider: String(item.provider || "Unknown").trim(),
            type: String(item.type).trim(),
            reason: String(
              item.reason || "Recommended by LLM analysis.",
            ).trim(),
          }))
          .slice(0, 12)
      : [];

    if (!recommendations.length) {
      throw new Error("LLM returned no usable recommendations.");
    }

    return res.json({
      matchedRole: llm.matchedRole || jobTitle,
      recommendations,
      source: { mode: "ollama", model: activeModel },
    });
  } catch (error) {
    return res.json({
      ...heuristicCertPlan(jobTitle),
      source: {
        mode: "fallback",
        model: OLLAMA_MODEL,
        message: String(error),
      },
    });
  }
});

app.post("/api/ai/job-matches", upload.single("cvFile"), async (req, res) => {
  const typedSkills = String(req.body?.skillsText || "").trim();
  let cvText = "";

  try {
    cvText = await extractCvText(req.file);
  } catch (error) {
    return res.status(400).json({ message: String(error) });
  }

  const skillsText = [typedSkills, cvText].filter(Boolean).join("\n\n").trim();

  if (!skillsText) {
    return res.status(400).json({
      message: "Provide skills text or upload a PDF/TXT CV.",
    });
  }

  if (req.file && !typedSkills && cvText.length < 40) {
    return res.status(422).json({
      message:
        "CV text could not be extracted reliably. Upload a text-based PDF/TXT CV or paste your skills manually.",
      input: {
        usedTypedSkills: false,
        usedUploadedCv: true,
        cvTextLength: cvText.length,
      },
    });
  }

  const systemPrompt = `You are a job matching assistant. Return JSON only with this shape: {"roles": [{"role": string, "matchedSkills": string[], "matchReason": string}]}. Return up to 8 role matches.`;
  const userPrompt = `Given these candidate skills/CV text:\n${skillsText}\nReturn best matching tech jobs.`;
  const resolvedModel = await resolveModelName().catch(() => OLLAMA_MODEL);
  const skillExtraction = await extractSkillsFromCvWithOllama(skillsText);
  const extractedSkills = skillExtraction.skills;
  const enrichedSkillsText = [
    skillsText,
    extractedSkills.length
      ? `Extracted Skills: ${extractedSkills.join(", ")}`
      : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  try {
    const pythonResult = await runPythonLinkedinMatcher(
      enrichedSkillsText,
      resolvedModel,
    );
    const linkedinJobs = await fetchLinkedinJobs(
      enrichedSkillsText,
      pythonResult.roles || [],
      resolvedModel,
    );

    return res.json({
      ...pythonResult,
      extractedSkills,
      skillExtraction,
      linkedinJobs,
      careerSuggestions: buildCareerSuggestions(
        pythonResult.roles || [],
        linkedinJobs,
      ),
      input: {
        usedTypedSkills: Boolean(typedSkills),
        usedUploadedCv: Boolean(req.file),
        cvTextLength: cvText.length,
        extractedSkillsCount: extractedSkills.length,
      },
    });
  } catch (pythonError) {
    console.warn(`Python matcher unavailable: ${String(pythonError)}`);
  }

  try {
    const { parsed: llm, activeModel } = await askOllama(
      systemPrompt,
      `Extracted skills: ${extractedSkills.join(", ")}\n\n${userPrompt}`,
    );
    const roles = Array.isArray(llm.roles)
      ? llm.roles
          .filter((item) => item?.role)
          .slice(0, 8)
          .map((item) => ({
            role: String(item.role).trim(),
            matchedSkills: Array.isArray(item.matchedSkills)
              ? item.matchedSkills
              : [],
            matchReason: String(
              item.matchReason || "Matched by LLM analysis.",
            ).trim(),
          }))
      : [];

    if (!roles.length) {
      throw new Error("LLM returned no usable role matches.");
    }

    const linkedinJobs = await fetchLinkedinJobs(
      enrichedSkillsText,
      roles,
      activeModel,
    );

    return res.json({
      roles,
      extractedSkills,
      skillExtraction,
      linkedinJobs,
      careerSuggestions: buildCareerSuggestions(roles, linkedinJobs),
      source: { mode: "ollama", model: activeModel },
      input: {
        usedTypedSkills: Boolean(typedSkills),
        usedUploadedCv: Boolean(req.file),
        cvTextLength: cvText.length,
        extractedSkillsCount: extractedSkills.length,
      },
    });
  } catch (error) {
    const roles = heuristicJobMatches(enrichedSkillsText);
    const linkedinJobs = await fetchLinkedinJobs(
      enrichedSkillsText,
      roles,
      resolvedModel,
    );
    return res.json({
      roles,
      extractedSkills,
      skillExtraction,
      linkedinJobs,
      careerSuggestions: buildCareerSuggestions(roles, linkedinJobs),
      source: {
        mode: "fallback",
        model: OLLAMA_MODEL,
        message: String(error),
      },
      input: {
        usedTypedSkills: Boolean(typedSkills),
        usedUploadedCv: Boolean(req.file),
        cvTextLength: cvText.length,
        extractedSkillsCount: extractedSkills.length,
      },
    });
  }
});

// Payment endpoint for certification purchases
app.post("/api/payments/create-intent", async (req, res) => {
  const {
    email,
    certificationName,
    certificationProvider,
    certificationPrice,
    quantity = 1,
  } = req.body;

  // Validate input
  if (!email || !certificationName || !certificationPrice) {
    return res.status(400).json({
      message: "Missing required payment information.",
    });
  }

  try {
    // In a production environment, you would:
    // 1. Create a Stripe Payment Intent
    // 2. Store the payment intent ID in a database
    // 3. Return the client secret for the frontend to complete payment

    // For now, we'll return a mock response
    const paymentIntentId = `pi_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    const total = (certificationPrice * quantity).toFixed(2);

    // Simulated payment processing
    console.log(`Payment Intent Created: ${paymentIntentId}`);
    console.log(`Email: ${email}`);
    console.log(
      `Certification: ${certificationName} by ${certificationProvider}`,
    );
    console.log(`Amount: $${total} (${quantity}x $${certificationPrice})`);

    res.json({
      ok: true,
      paymentIntentId,
      clientSecret: `${paymentIntentId}_secret_${Math.random().toString(16).slice(2)}`,
      amount: Math.round(parseFloat(total) * 100),
      currency: "usd",
      email,
      certification: {
        name: certificationName,
        provider: certificationProvider,
        price: certificationPrice,
        quantity,
        total: parseFloat(total),
      },
      status: "requires_payment_method",
    });
  } catch (error) {
    res.status(500).json({
      message: "Payment processing failed. Please try again.",
      error: String(error),
    });
  }
});

app.listen(PORT, () => {
  console.log(`LearnBridge AI server listening on http://localhost:${PORT}`);
  console.log(`Using Ollama model: ${OLLAMA_MODEL}`);
});
