import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utils.email_filter import JobEmailFilter, filter_job_emails

def test_job_email_filter():
    """Test the job email filter with various test cases."""
    
    # Create test emails
    test_emails = [
        {
            'subject': 'Application for Software Engineer Position',
            'sender_email': 'john.doe@example.com',
            'from': 'John Doe <john.doe@example.com>',
            'body': 'I am applying for the software engineer position...'
        },
        {
            'subject': 'Interview Invitation',
            'sender_email': 'recruiter@linkedin.com',
            'from': 'LinkedIn Recruiter <recruiter@linkedin.com>',
            'body': 'We would like to invite you for an interview...'
        },
        {
            'subject': 'Your application has been received',
            'sender_email': 'noreply@indeed.com',
            'from': 'Indeed <noreply@indeed.com>',
            'body': 'Thank you for your application...'
        },
        {
            'subject': 'Weekly Newsletter',
            'sender_email': 'newsletter@company.com',
            'from': 'Company Newsletter <newsletter@company.com>',
            'body': 'This week\'s updates...'
        },
        {
            'subject': 'Meeting tomorrow',
            'sender_email': 'colleague@work.com',
            'from': 'Colleague <colleague@work.com>',
            'body': 'Let\'s meet tomorrow to discuss the project...'
        },
        {
            'subject': 'Job opportunity at Google',
            'sender_email': 'recruiter@google.com',
            'from': 'Google Recruiter <recruiter@google.com>',
            'body': 'We have an exciting opportunity for you...'
        }
    ]
    
    # Test the filter
    filter_result = filter_job_emails(test_emails)
    
    print("=== Email Filter Test Results ===")
    print(f"Total emails processed: {filter_result['total_emails']}")
    print(f"Emails matched: {filter_result['matched_count']}")
    print(f"Filter rate: {filter_result['filter_rate']:.1f}%")
    print()
    
    print("=== Matched Emails ===")
    for email in filter_result['filtered_emails']:
        print(f"Subject: {email['subject']}")
        print(f"From: {email['from']}")
        print(f"Confidence: {email.get('filter_confidence', 'N/A')}")
        print(f"Matched rules: {len(email.get('filter_matches', []))}")
        for match in email.get('filter_matches', []):
            print(f"  - {match['description']}")
        print()
    
    # Verify expected results
    expected_matches = 4  # Should match the first 4 emails
    actual_matches = filter_result['matched_count']
    
    print(f"Expected matches: {expected_matches}")
    print(f"Actual matches: {actual_matches}")
    print(f"Test {'PASSED' if actual_matches == expected_matches else 'FAILED'}")
    
    return actual_matches == expected_matches

def test_filter_configuration():
    """Test the filter configuration."""
    from utils.email_filter import get_filter_configuration
    
    config = get_filter_configuration()
    
    print("=== Filter Configuration ===")
    print(f"Keywords: {config['keyword_count']}")
    print(f"Domains: {config['domain_count']}")
    print(f"Regex patterns: {config['regex_pattern_count']}")
    print(f"Total rules: {config['total_rules']}")
    print()
    
    print("Keywords:", config['keywords'])
    print("Domains:", config['domains'])
    
    return True

if __name__ == "__main__":
    print("Running email filter tests...")
    print()
    
    test_filter_configuration()
    print()
    
    success = test_job_email_filter()
    
    if success:
        print("\n✅ All tests passed!")
    else:
        print("\n❌ Some tests failed!") 