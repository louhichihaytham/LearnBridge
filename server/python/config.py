"""
Configuration file for LinkedIn Job Scraper
All sensitive information and configurable parameters should be defined here
"""

import os

# ==================== FILE PATHS ====================
# Path to your resume PDF
RESUME_PATH = "path.pdf"

# Output file paths
OUTPUT_DIR = "linkedin_jobs_scraper/output"
DEFAULT_OUTPUT_PREFIX = "linkedin_jobs_analyzed"


# ==================== SCRAPER SETTINGS ====================
# Search parameters
DEFAULT_JOB_TITLES = [
    "AI Engineer",
    #"Machine Learning Engineer",
    #"MLOps Engineer",
    #"Data Scientist"
]

DEFAULT_LOCATIONS = [
    "Spain",
    #"Portugal",
    #"Italy",
    #"Germany",
    #"Norway",
    #"London, UK",
    #"France",
    #"Netherlands"
]

# Scraping limits
MAX_PAGES_PER_LOCATION = 1
MAX_JOBS_TOTAL = 2

DELAY_BETWEEN_REQUESTS = 3
DELAY_BETWEEN_LOCATIONS = 5
DELAY_AFTER_DESCRIPTION_FETCH = 2


# ==================== LLM SETTINGS ====================
# Ollama configuration
OLLAMA_MODEL = "qwen3"

# LLM features
ENABLE_LLM_ANALYSIS = True
FETCH_JOB_DESCRIPTIONS = True

# LLM scoring thresholds
EXCELLENT_MATCH_THRESHOLD = 8  # Score >= 8 is excellent match
GOOD_MATCH_THRESHOLD = 5  # Score >= 5 is good match
POOR_MATCH_THRESHOLD = 3  # Score < 3 is poor match


# ==================== HTTP SETTINGS ====================
# Request headers (mimics a real browser)
USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

REQUEST_HEADERS = {
    'User-Agent': USER_AGENT,
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
}

# Timeout settings
REQUEST_TIMEOUT = 15  # Seconds to wait for response


# ==================== LINKEDIN URLS ====================
LINKEDIN_JOBS_API_URL = "https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search"
LINKEDIN_BASE_URL = "https://www.linkedin.com"


# ==================== OUTPUT SETTINGS ====================
# CSV settings
CSV_ENCODING = "utf-8-sig"  # UTF-8 with BOM for Excel compatibility

# JSON settings
JSON_INDENT = 2
JSON_ENSURE_ASCII = False  # Allow unicode characters


# ==================== DEBUG SETTINGS ====================
# Debug mode
DEBUG_MODE = False  # Set to True to enable debug logging
SAVE_HTML_RESPONSES = True  # Save HTML responses for debugging

# Debug file names
DEBUG_LAST_RESPONSE = "last_response.html"
DEBUG_LAST_SEARCH_PAGE = "last_search_page.html"


# ==================== FILTERING SETTINGS ====================
# Job filters (optional - can be used to filter results)
EXCLUDE_KEYWORDS = [
    # "intern",
    # "junior",
    # "unpaid"
]

REQUIRE_KEYWORDS = [
    # "remote",
    # "senior"
]

# Date filters
MAX_JOB_AGE_DAYS = None  # Only scrape jobs posted within X days (None = no limit)


# ==================== EMAIL SETTINGS (Optional) ====================
# If you want to email results automatically
ENABLE_EMAIL_NOTIFICATIONS = False
EMAIL_SMTP_SERVER = "smtp.gmail.com"
EMAIL_SMTP_PORT = 587
EMAIL_FROM = "your_email@gmail.com"
EMAIL_TO = "your_email@gmail.com"
EMAIL_PASSWORD = ""  # Use environment variable instead!


# ==================== ENVIRONMENT VARIABLES ====================
# Override settings from environment variables (more secure)
# Usage: export RESUME_PATH=/path/to/resume.pdf

# Resume path from environment
RESUME_PATH = os.getenv('LINKEDIN_RESUME_PATH', RESUME_PATH)

# Email password from environment (never hardcode passwords!)
if ENABLE_EMAIL_NOTIFICATIONS:
    EMAIL_PASSWORD = os.getenv('EMAIL_PASSWORD', EMAIL_PASSWORD)

# Ollama model from environment
OLLAMA_MODEL = os.getenv('OLLAMA_MODEL', OLLAMA_MODEL)


# ==================== VALIDATION ====================
def validate_config():
    """Validate configuration settings"""
    errors = []
    
    # Check if resume exists
    if not os.path.exists(RESUME_PATH):
        errors.append(f"Resume not found at: {RESUME_PATH}")
    
    # Check output directory
    if OUTPUT_DIR and not os.path.exists(OUTPUT_DIR):
        try:
            os.makedirs(OUTPUT_DIR, exist_ok=True)
            print(f"✅ Created output directory: {OUTPUT_DIR}")
        except Exception as e:
            errors.append(f"Cannot create output directory {OUTPUT_DIR}: {e}")
    
    # Check email settings
    if ENABLE_EMAIL_NOTIFICATIONS and not EMAIL_PASSWORD:
        errors.append("Email notifications enabled but EMAIL_PASSWORD not set")
    
    if errors:
        print("⚠️ Configuration Errors:")
        for error in errors:
            print(f"  - {error}")
        return False
    
    return True


# ==================== HELPER FUNCTIONS ====================
def get_output_path(filename):
    """Get full output path for a file"""
    if OUTPUT_DIR:
        return os.path.join(OUTPUT_DIR, filename)
    return filename


def print_config():
    """Print current configuration (for debugging)"""
    print("=" * 80)
    print("LINKEDIN JOB SCRAPER CONFIGURATION")
    print("=" * 80)
    print(f"Resume Path: {RESUME_PATH}")
    print(f"Output Directory: {OUTPUT_DIR}")
    print(f"Max Pages per Location: {MAX_PAGES_PER_LOCATION}")
    print(f"Max Jobs Total: {MAX_JOBS_TOTAL}")
    print(f"LLM Analysis Enabled: {ENABLE_LLM_ANALYSIS}")
    print(f"Fetch Descriptions: {FETCH_JOB_DESCRIPTIONS}")
    print(f"Ollama Model: {OLLAMA_MODEL}")
    print(f"Debug Mode: {DEBUG_MODE}")
    print("=" * 80)


if __name__ == "__main__":
    # Test configuration
    print_config()
    if validate_config():
        print("\n✅ Configuration is valid!")
    else:
        print("\n❌ Configuration has errors!")