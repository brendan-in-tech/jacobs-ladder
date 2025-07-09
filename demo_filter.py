#!/usr/bin/env python3
"""
Demo script for the job email filtering functionality.
This script demonstrates how the filter works with sample email data.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from utils.email_filter import filter_job_emails, get_filter_configuration

def demo_email_filtering():
    """Demonstrate the email filtering functionality."""
    
    print("🚀 Job Email Filter Demo")
    print("=" * 50)
    
    # Sample email data
    sample_emails = [
        {
            'subject': 'Application for Senior Software Engineer',
            'sender_email': 'john.smith@example.com',
            'from': 'John Smith <john.smith@example.com>',
            'body': 'I am writing to apply for the Senior Software Engineer position...'
        },
        {
            'subject': 'Interview Invitation - Software Engineer Role',
            'sender_email': 'recruiter@linkedin.com',
            'from': 'LinkedIn Recruiter <recruiter@linkedin.com>',
            'body': 'We would like to invite you for an interview...'
        },
        {
            'subject': 'Your application has been received',
            'sender_email': 'noreply@indeed.com',
            'from': 'Indeed <noreply@indeed.com>',
            'body': 'Thank you for your application to the Software Engineer position...'
        },
        {
            'subject': 'Weekly Team Meeting',
            'sender_email': 'manager@company.com',
            'from': 'Team Manager <manager@company.com>',
            'body': 'Hi team, let\'s meet tomorrow to discuss the project...'
        },
        {
            'subject': 'Job opportunity at Google',
            'sender_email': 'recruiter@google.com',
            'from': 'Google Recruiter <recruiter@google.com>',
            'body': 'We have an exciting opportunity for you at Google...'
        },
        {
            'subject': 'Resume Review Request',
            'sender_email': 'hr@startup.com',
            'from': 'HR Team <hr@startup.com>',
            'body': 'We would like to review your resume for our open positions...'
        },
        {
            'subject': 'Newsletter: Tech Industry Updates',
            'sender_email': 'newsletter@tech.com',
            'from': 'Tech Newsletter <newsletter@tech.com>',
            'body': 'This week\'s updates from the tech industry...'
        },
        {
            'subject': 'Candidate Screening Call',
            'sender_email': 'talent@company.com',
            'from': 'Talent Acquisition <talent@company.com>',
            'body': 'We would like to schedule a screening call...'
        }
    ]
    
    print(f"📧 Processing {len(sample_emails)} sample emails...")
    print()
    
    # Apply filtering
    filter_result = filter_job_emails(sample_emails)
    
    # Display results
    print("📊 Filter Results:")
    print(f"   Total emails: {filter_result['total_emails']}")
    print(f"   Job emails found: {filter_result['matched_count']}")
    print(f"   Filter rate: {filter_result['filter_rate']:.1f}%")
    print()
    
    print("✅ Job-related emails:")
    print("-" * 40)
    for i, email in enumerate(filter_result['filtered_emails'], 1):
        print(f"{i}. {email['subject']}")
        print(f"   From: {email['from']}")
        print(f"   Confidence: {email.get('filter_confidence', 'N/A'):.2f}")
        print(f"   Rules matched: {len(email.get('filter_matches', []))}")
        for match in email.get('filter_matches', []):
            print(f"     • {match['description']}")
        print()
    
    # Show filter configuration
    print("⚙️ Filter Configuration:")
    print("-" * 40)
    config = get_filter_configuration()
    print(f"Keywords: {config['keyword_count']}")
    print(f"Domains: {config['domain_count']}")
    print(f"Regex patterns: {config['regex_pattern_count']}")
    print(f"Total rules: {config['total_rules']}")
    print()
    
    print("🎯 Sample Keywords:", ', '.join(config['keywords'][:5]) + '...')
    print("🌐 Sample Domains:", ', '.join(config['domains'][:5]) + '...')
    print()
    
    print("✨ Demo completed successfully!")
    print("The filter successfully identified job-related emails using high-confidence rules.")

if __name__ == "__main__":
    demo_email_filtering() 