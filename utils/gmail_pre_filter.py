# Filters emails where subject contains high-confidence keywords or from address/domain matches known job boards        

class GmailPreFilter:
    def __init__(self):
        self.JOB_KEYWORDS = ['applied', 'application', 'interview', 'recruiter', 'job', 'career']
        self.JOB_DOMAINS = ['linkedin.com', 'indeed.com', 'jobvite.com', 'workday.com']

        self.JOB_KEYWORDS_QUERY = ' OR '.join(self.JOB_KEYWORDS)
        self.JOB_DOMAINS_QUERY = ' OR '.join(self.JOB_DOMAINS)

        self.JOB_KEYWORDS_QUERY = f'subject:({self.JOB_KEYWORDS_QUERY})' if self.JOB_KEYWORDS_QUERY else ''
        self.JOB_DOMAINS_QUERY = f'from:({self.JOB_DOMAINS_QUERY})' if self.JOB_DOMAINS_QUERY else ''

        self.JOB_QUERY = f'{self.JOB_KEYWORDS_QUERY} {self.JOB_DOMAINS_QUERY}'

    def get_job_query(self):
        return self.JOB_QUERY
    
    def apply_filter(self, emails):
        """
        Filters emails for job-related content.
        
        Args:
            emails (list): List of email dictionaries with 'subject' and 'from' keys
            
        Returns:
            list: Filtered list of job-related emails
        """
        if not isinstance(emails, list):
            return []
        
        filtered_emails = []
        for email in emails:
            subject = email.get('subject', '').lower()
            from_address = email.get('from', '').lower()
            
            # Check if subject contains any job keywords
            subject_match = any(keyword in subject for keyword in self.JOB_KEYWORDS)
            if subject_match:
                filtered_emails.append(email)
                continue
            
            # Check if from address contains any job domains
            domain_match = any(domain in from_address for domain in self.JOB_DOMAINS)
            if domain_match:
                filtered_emails.append(email)
        
        return filtered_emails
    
if __name__ == "__main__":
    pre_filter = GmailPreFilter()
    print(pre_filter.get_job_query())