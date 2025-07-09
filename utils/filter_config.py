"""
Configuration file for job email filtering.
This file contains all the configurable settings for the email filter.
"""

# High-confidence job-related keywords (case-insensitive)
JOB_KEYWORDS = [
    'applied', 'application', 'interview', 'recruiter', 'job', 'career',
    'position', 'hiring', 'candidate', 'resume', 'cv', 'employment',
    'opportunity', 'role', 'opening', 'vacancy', 'recruitment'
]

# Known job board domains
JOB_DOMAINS = [
    'linkedin.com', 'indeed.com', 'jobvite.com', 'workday.com',
    'greenhouse.io', 'lever.co', 'bamboohr.com', 'smartrecruiters.com',
    'icims.com', 'jobscore.com', 'recruiterbox.com', 'hired.com',
    'angel.co', 'stackoverflow.com', 'dice.com', 'monster.com',
    'ziprecruiter.com', 'glassdoor.com', 'simplyhired.com'
]

# High-confidence regex patterns for more precise matching
REGEX_PATTERNS = [
    r'\b(?:applied|application|interview|recruiter|job|career)\b',
    r'\b(?:position|hiring|candidate|resume|cv|employment)\b',
    r'\b(?:opportunity|role|opening|vacancy|recruitment)\b'
]

# Confidence scores for different rule types
CONFIDENCE_SCORES = {
    'keyword': 0.8,      # Subject keyword matches
    'domain': 0.9,       # Known job board domains
    'regex': 0.85        # Regex pattern matches
}

# Filter settings
FILTER_SETTINGS = {
    'min_confidence': 0.8,           # Minimum confidence to consider an email job-related
    'enable_logging': True,          # Enable detailed logging of matches
    'log_unmatched': False,          # Log emails that don't match (for debugging)
    'cache_results': True,           # Cache filtered results to avoid recomputation
    'max_cache_size': 1000           # Maximum number of cached results
}

# Logging configuration
LOGGING_CONFIG = {
    'level': 'INFO',                 # Log level: DEBUG, INFO, WARNING, ERROR
    'format': '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    'file': 'email_filter.log'       # Log file (optional, set to None for console only)
} 