import re
import logging
from typing import List, Dict, Any, Tuple
from dataclasses import dataclass
from .filter_config import JOB_KEYWORDS, JOB_DOMAINS, REGEX_PATTERNS, CONFIDENCE_SCORES, FILTER_SETTINGS

# Configure logging
logger = logging.getLogger(__name__)

@dataclass
class FilterRule:
    """Represents a filtering rule with its type and pattern."""
    rule_type: str  # 'keyword', 'domain', 'regex'
    pattern: str
    confidence: float  # 0.0 to 1.0
    description: str

class JobEmailFilter:
    """High-confidence filter for job application emails."""
    
    def __init__(self):
        # Load configuration from config file
        self.job_keywords = JOB_KEYWORDS
        self.job_domains = JOB_DOMAINS
        self.regex_patterns = REGEX_PATTERNS
        self.confidence_scores = CONFIDENCE_SCORES
        self.settings = FILTER_SETTINGS
        
        # Build filter rules
        self.rules = self._build_rules()
        
    def _build_rules(self) -> List[FilterRule]:
        """Build the list of filtering rules."""
        rules = []
        
        # Add keyword rules
        for keyword in self.job_keywords:
            rules.append(FilterRule(
                rule_type='keyword',
                pattern=keyword.lower(),
                confidence=self.confidence_scores['keyword'],
                description=f"Subject contains keyword: {keyword}"
            ))
        
        # Add domain rules
        for domain in self.job_domains:
            rules.append(FilterRule(
                rule_type='domain',
                pattern=domain.lower(),
                confidence=self.confidence_scores['domain'],
                description=f"From domain: {domain}"
            ))
        
        # Add regex rules
        for pattern in self.regex_patterns:
            rules.append(FilterRule(
                rule_type='regex',
                pattern=pattern,
                confidence=self.confidence_scores['regex'],
                description=f"Regex match: {pattern}"
            ))
        
        return rules
    
    def extract_domain(self, email: str) -> str:
        """Extract domain from email address."""
        if '@' in email:
            return email.split('@')[-1].lower()
        return email.lower()
    
    def matches_keyword(self, text: str, keyword: str) -> bool:
        """Check if text contains keyword (case-insensitive)."""
        return keyword.lower() in text.lower()
    
    def matches_domain(self, email: str, domain: str) -> bool:
        """Check if email domain matches the target domain."""
        email_domain = self.extract_domain(email)
        return email_domain == domain.lower()
    
    def matches_regex(self, text: str, pattern: str) -> bool:
        """Check if text matches regex pattern."""
        try:
            return bool(re.search(pattern, text, re.IGNORECASE))
        except re.error:
            logger.warning(f"Invalid regex pattern: {pattern}")
            return False
    
    def filter_email(self, email: Dict[str, Any]) -> Tuple[bool, List[Dict[str, Any]]]:
        """
        Filter an email using high-confidence rules.
        
        Args:
            email: Email dictionary with 'subject', 'sender_email', 'from' fields
            
        Returns:
            Tuple of (is_job_related, matched_rules)
        """
        matched_rules = []
        subject = email.get('subject', '').lower()
        sender_email = email.get('sender_email', '').lower()
        from_header = email.get('from', '').lower()
        
        # Combine all text fields for regex matching
        all_text = f"{subject} {sender_email} {from_header}"
        
        for rule in self.rules:
            is_match = False
            
            if rule.rule_type == 'keyword':
                is_match = self.matches_keyword(subject, rule.pattern)
            elif rule.rule_type == 'domain':
                is_match = (self.matches_domain(sender_email, rule.pattern) or 
                           self.matches_domain(from_header, rule.pattern))
            elif rule.rule_type == 'regex':
                is_match = self.matches_regex(all_text, rule.pattern)
            
            if is_match:
                matched_rules.append({
                    'rule_type': rule.rule_type,
                    'pattern': rule.pattern,
                    'confidence': rule.confidence,
                    'description': rule.description
                })
                
                # Log the match for analysis
                logger.info(f"Email matched rule: {rule.description}")
                logger.info(f"  Subject: {email.get('subject', 'No subject')}")
                logger.info(f"  From: {email.get('from', 'Unknown')}")
        
        # Consider it a job email if we have at least one high-confidence match
        # and the confidence meets the minimum threshold
        max_confidence = max(rule['confidence'] for rule in matched_rules) if matched_rules else 0
        is_job_related = len(matched_rules) > 0 and max_confidence >= self.settings['min_confidence']
        
        if is_job_related:
            logger.info(f"Email classified as job-related with {len(matched_rules)} rule matches (confidence: {max_confidence:.2f})")
        elif self.settings['log_unmatched']:
            logger.debug(f"Email not classified as job-related: {email.get('subject', 'No subject')}")
        
        return is_job_related, matched_rules
    
    def filter_emails(self, emails: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Filter a list of emails and return job-related ones.
        
        Args:
            emails: List of email dictionaries
            
        Returns:
            Dictionary with filtered emails and statistics
        """
        job_emails = []
        total_emails = len(emails)
        matched_count = 0
        
        logger.info(f"Starting email filtering for {total_emails} emails")
        
        for email in emails:
            is_job_related, matched_rules = self.filter_email(email)
            
            if is_job_related:
                # Add filtering metadata to the email
                email['preFiltered'] = True
                email['filter_matches'] = matched_rules
                email['filter_confidence'] = max(rule['confidence'] for rule in matched_rules)
                job_emails.append(email)
                matched_count += 1
        
        # Calculate statistics
        filter_rate = (matched_count / total_emails * 100) if total_emails > 0 else 0
        
        logger.info(f"Filtering complete: {matched_count}/{total_emails} emails matched ({filter_rate:.1f}%)")
        
        return {
            'filtered_emails': job_emails,
            'total_emails': total_emails,
            'matched_count': matched_count,
            'filter_rate': filter_rate,
            'preFiltered': True
        }
    
    def get_filter_stats(self) -> Dict[str, Any]:
        """Get statistics about the current filter configuration."""
        return {
            'keyword_count': len(self.job_keywords),
            'domain_count': len(self.job_domains),
            'regex_pattern_count': len(self.regex_patterns),
            'total_rules': len(self.rules),
            'keywords': self.job_keywords,
            'domains': self.job_domains
        }

# Global filter instance
job_filter = JobEmailFilter()

def filter_job_emails(emails: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Convenience function to filter emails for job applications.
    
    Args:
        emails: List of email dictionaries
        
    Returns:
        Dictionary with filtered emails and statistics
    """
    return job_filter.filter_emails(emails)

def get_filter_configuration() -> Dict[str, Any]:
    """
    Get the current filter configuration for debugging and analysis.
    
    Returns:
        Dictionary with filter configuration and statistics
    """
    return job_filter.get_filter_stats() 