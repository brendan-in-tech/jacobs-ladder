# Email Filtering for Job Applications

This document describes the initial filtering step that reduces the full inbox to a manageable subset of emails likely related to job applications using simple, high-confidence rules.

## Overview

The email filtering system uses a multi-layered approach to identify job-related emails:

1. **Keyword Matching**: Searches email subjects for job-related keywords
2. **Domain Matching**: Identifies emails from known job boards and recruitment platforms
3. **Regex Pattern Matching**: Uses regular expressions for more precise text matching

## Configuration

The filter is configured through `utils/filter_config.py`:

### Keywords
High-confidence job-related keywords that are searched in email subjects:
```python
JOB_KEYWORDS = [
    'applied', 'application', 'interview', 'recruiter', 'job', 'career',
    'position', 'hiring', 'candidate', 'resume', 'cv', 'employment',
    'opportunity', 'role', 'opening', 'vacancy', 'recruitment'
]
```

### Domains
Known job board and recruitment platform domains:
```python
JOB_DOMAINS = [
    'linkedin.com', 'indeed.com', 'jobvite.com', 'workday.com',
    'greenhouse.io', 'lever.co', 'bamboohr.com', 'smartrecruiters.com',
    # ... more domains
]
```

### Confidence Scores
Different confidence levels for different rule types:
```python
CONFIDENCE_SCORES = {
    'keyword': 0.8,      # Subject keyword matches
    'domain': 0.9,       # Known job board domains
    'regex': 0.85        # Regex pattern matches
}
```

## How It Works

### 1. Email Processing
When emails are fetched from Gmail, they go through the filtering process:

```python
# In gmail_fetcher.py
filter_result = filter_job_emails(email_list)
filtered_emails = filter_result['filtered_emails']
```

### 2. Rule Application
Each email is checked against all rules:

- **Keyword Rules**: Check if the subject contains any job-related keywords
- **Domain Rules**: Check if the sender's email domain matches known job boards
- **Regex Rules**: Apply regular expression patterns to the combined text

### 3. Confidence Scoring
An email is classified as job-related if:
- At least one rule matches
- The highest confidence score meets the minimum threshold (default: 0.8)

### 4. Metadata Addition
Filtered emails receive additional metadata:
```python
email['preFiltered'] = True
email['filter_matches'] = matched_rules
email['filter_confidence'] = max_confidence_score
```

## Frontend Integration

### Filter Statistics
The header displays filtering statistics:
```
• 15/100 job emails (15.0%)
```

### Email Badges
Filtered emails show a "Job Email" badge in the email list.

### Detailed Information
When viewing a filtered email, the modal shows:
- Filter confidence percentage
- List of matched rules
- Rule descriptions and confidence scores

## API Endpoints

### Get Filter Configuration
```
GET /filter-config
```
Returns the current filter configuration and statistics.

### Filtered Email Data
The `/fetch-emails` endpoint now returns:
```json
{
  "threads": [...],
  "individual_emails": [...],
  "total_count": 15,
  "filter_stats": {
    "total_emails_processed": 100,
    "filtered_emails_count": 15,
    "filter_rate_percentage": 15.0,
    "preFiltered": true
  }
}
```

## Logging

The filter provides detailed logging for analysis:

```
INFO - Email matched rule: Subject contains keyword: application
INFO -   Subject: Application for Software Engineer Position
INFO -   From: John Doe <john.doe@example.com>
INFO - Email classified as job-related with 4 rule matches (confidence: 0.85)
```

## Testing

Run the test suite to verify filtering accuracy:
```bash
python tests/test_email_filter.py
```

## Performance

- **Fast Filtering**: Uses simple string matching and regex for quick processing
- **Configurable**: Easy to adjust keywords, domains, and confidence thresholds
- **Caching**: Results are cached to avoid recomputation
- **Logging**: Detailed logs for accuracy evaluation and coverage analysis

## Future Enhancements

1. **Machine Learning**: Replace rule-based filtering with ML models
2. **User Feedback**: Allow users to mark emails as job-related/not job-related
3. **Dynamic Rules**: Learn from user behavior to improve accuracy
4. **Batch Processing**: Optimize for large email volumes
5. **Custom Rules**: Allow users to add their own filtering rules

## Troubleshooting

### Low Filter Rate
- Check if keywords match your email subjects
- Verify job board domains are included
- Review confidence thresholds

### High False Positives
- Increase minimum confidence threshold
- Add negative keywords to exclude certain emails
- Review regex patterns for over-matching

### Performance Issues
- Reduce the number of regex patterns
- Disable detailed logging in production
- Implement caching for large email volumes 