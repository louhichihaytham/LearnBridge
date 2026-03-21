const rawCertificationCatalog = [
  {
    type: "AI/ML",
    certifications: [
      {
        name: "Elements of AI Certificate",
        provider: "University of Helsinki",
        priceTnd: 0,
      },
      {
        name: "Coursera Machine Learning Specialization",
        provider: "Coursera",
        priceTnd: 160,
      },
      {
        name: "TensorFlow Developer Certificate",
        provider: "Google",
        priceTnd: 320,
      },
      {
        name: "Azure AI Engineer Associate (AI-102)",
        provider: "Microsoft",
        priceTnd: 520,
      },
      {
        name: "AWS Certified Machine Learning - Specialty",
        provider: "AWS",
        priceTnd: 960,
      },
      {
        name: "Databricks Certified Machine Learning Associate",
        provider: "Databricks",
        priceTnd: 920,
      },
    ],
    freeCourses: [
      {
        title: "CS50's Introduction to Artificial Intelligence with Python",
        university: "Harvard University",
        platform: "edX",
        url: "https://www.edx.org/learn/artificial-intelligence/harvard-university-cs50-s-introduction-to-artificial-intelligence-with-python",
      },
      {
        title: "Machine Learning",
        university: "Stanford University",
        platform: "Coursera (audit)",
        url: "https://www.coursera.org/learn/machine-learning",
      },
      {
        title: "AI For Everyone",
        university: "DeepLearning.AI",
        platform: "Coursera (audit)",
        url: "https://www.coursera.org/learn/ai-for-everyone",
      },
    ],
  },
  {
    type: "Blockchain",
    certifications: [
      {
        name: "Blockchain Basics Badge",
        provider: "Blockchain Council",
        priceTnd: 0,
      },
      {
        name: "Certified Blockchain Professional",
        provider: "EC-Council",
        priceTnd: 650,
      },
      {
        name: "Blockchain Council Certified Blockchain Expert",
        provider: "Blockchain Council",
        priceTnd: 780,
      },
      {
        name: "Ethereum Developer Certification",
        provider: "Blockchain Training Alliance",
        priceTnd: 890,
      },
      {
        name: "Certified Blockchain Solutions Architect",
        provider: "Blockchain Council",
        priceTnd: 920,
      },
    ],
    freeCourses: [
      {
        title: "Blockchain Basics",
        university: "University at Buffalo",
        platform: "Coursera (audit)",
        url: "https://www.coursera.org/learn/blockchain-basics",
      },
      {
        title: "Bitcoin and Cryptocurrency Technologies",
        university: "Princeton University",
        platform: "Coursera (audit)",
        url: "https://www.coursera.org/learn/cryptocurrency",
      },
      {
        title: "Smart Contracts",
        university: "University at Buffalo",
        platform: "Coursera (audit)",
        url: "https://www.coursera.org/learn/smarter-contracts",
      },
    ],
  },
  {
    type: "Cloud",
    certifications: [
      {
        name: "AWS Educate Cloud Foundations Badge",
        provider: "AWS",
        priceTnd: 0,
      },
      {
        name: "AWS Certified Cloud Practitioner",
        provider: "AWS",
        priceTnd: 320,
      },
      {
        name: "AWS Certified Solutions Architect - Associate",
        provider: "AWS",
        priceTnd: 520,
      },
      {
        name: "Azure Fundamentals (AZ-900)",
        provider: "Microsoft",
        priceTnd: 320,
      },
      {
        name: "Google Associate Cloud Engineer",
        provider: "Google Cloud",
        priceTnd: 520,
      },
      {
        name: "AWS Certified SysOps Administrator - Associate",
        provider: "AWS",
        priceTnd: 520,
      },
    ],
    freeCourses: [
      {
        title: "Introduction to Cloud Computing",
        university: "IBM",
        platform: "Coursera (audit)",
        url: "https://www.coursera.org/learn/introduction-to-cloud",
      },
      {
        title: "Cloud Computing Concepts, Part 1",
        university: "University of Illinois Urbana-Champaign",
        platform: "Coursera (audit)",
        url: "https://www.coursera.org/learn/cloud-computing",
      },
      {
        title: "Cloud Engineering with Google Cloud",
        university: "Google Cloud",
        platform: "Coursera (audit)",
        url: "https://www.coursera.org/professional-certificates/cloud-engineering-gcp",
      },
    ],
  },
  {
    type: "Cybersecurity",
    certifications: [
      {
        name: "Cisco Networking Academy: Introduction to Cybersecurity",
        provider: "Cisco",
        priceTnd: 0,
      },
      {
        name: "Fortinet NSE 1 Network Security Associate",
        provider: "Fortinet",
        priceTnd: 0,
      },
      {
        name: "Google IT Support Professional Certificate",
        provider: "Google",
        priceTnd: 160,
      },
      {
        name: "IBM Cybersecurity Analyst Professional Certificate",
        provider: "IBM",
        priceTnd: 160,
      },
      {
        name: "Cisco Certified Entry Networking Technician (CCENT)",
        provider: "Cisco",
        priceTnd: 330,
      },
      { name: "CompTIA Security+", provider: "CompTIA", priceTnd: 1320 },
      {
        name: "Certified Ethical Hacker (CEH)",
        provider: "EC-Council",
        priceTnd: 3900,
      },
      { name: "CISSP", provider: "(ISC)2", priceTnd: 2500 },
    ],
    freeCourses: [
      {
        title: "Introduction to Cyber Security",
        university: "New York University",
        platform: "edX",
        url: "https://www.edx.org/learn/cybersecurity/new-york-university-introduction-to-cyber-security",
      },
      {
        title: "Cybersecurity for Everyone",
        university: "University of Maryland",
        platform: "Coursera (audit)",
        url: "https://www.coursera.org/learn/cybersecurity-for-everyone",
      },
    ],
  },
  {
    type: "Data",
    certifications: [
      {
        name: "IBM Data Science Foundations Badge",
        provider: "IBM",
        priceTnd: 0,
      },
      {
        name: "Splunk Core Certified User",
        provider: "Splunk",
        priceTnd: 0,
      },
      {
        name: "Microsoft Power BI Data Analyst (PL-300)",
        provider: "Microsoft",
        priceTnd: 520,
      },
      {
        name: "Google Data Analytics Professional Certificate",
        provider: "Google",
        priceTnd: 160,
      },
      {
        name: "Tableau Certified Data Analyst",
        provider: "Tableau",
        priceTnd: 820,
      },
      {
        name: "IBM Data Analyst Professional Certificate",
        provider: "IBM",
        priceTnd: 180,
      },
    ],
    freeCourses: [
      {
        title: "Data Science: R Basics",
        university: "Harvard University",
        platform: "edX",
        url: "https://www.edx.org/learn/data-science/harvard-university-data-science-r-basics",
      },
      {
        title: "Data Analysis with Python",
        university: "IBM",
        platform: "Coursera (audit)",
        url: "https://www.coursera.org/learn/data-analysis-with-python",
      },
      {
        title: "Foundations: Data, Data, Everywhere",
        university: "Google",
        platform: "Coursera (audit)",
        url: "https://www.coursera.org/learn/foundations-data",
      },
    ],
  },
  {
    type: "Database",
    certifications: [
      {
        name: "MongoDB Associate Developer",
        provider: "MongoDB",
        priceTnd: 520,
      },
      {
        name: "MySQL Certified Associate",
        provider: "Oracle",
        priceTnd: 320,
      },
      {
        name: "PostgreSQL Professional Developer",
        provider: "EDB",
        priceTnd: 300,
      },
      {
        name: "Oracle Database SQL Certified Associate",
        provider: "Oracle",
        priceTnd: 800,
      },
      {
        name: "Microsoft Azure Database Administrator Associate (DP-300)",
        provider: "Microsoft",
        priceTnd: 520,
      },
      {
        name: "MongoDB Database Administrator Associate",
        provider: "MongoDB",
        priceTnd: 520,
      },
    ],
    freeCourses: [
      {
        title: "Databases: Relational Databases and SQL",
        university: "Stanford University",
        platform: "edX",
        url: "https://www.edx.org/learn/sql/stanford-university-databases-relational-databases-and-sql",
      },
      {
        title: "Introduction to Databases",
        university: "Meta",
        platform: "Coursera (audit)",
        url: "https://www.coursera.org/learn/introduction-to-databases",
      },
      {
        title: "Databases and SQL for Data Science with Python",
        university: "IBM",
        platform: "Coursera (audit)",
        url: "https://www.coursera.org/learn/sql-data-science",
      },
    ],
  },
  {
    type: "DevOps",
    certifications: [
      { name: "GitHub Foundations", provider: "GitHub", priceTnd: 0 },
      {
        name: "Linux Foundation Certified System Administrator (LFCA)",
        provider: "Linux Foundation",
        priceTnd: 295,
      },
      {
        name: "HashiCorp Vault Associate",
        provider: "HashiCorp",
        priceTnd: 300,
      },
      {
        name: "AWS Certified DevOps Engineer - Professional",
        provider: "AWS",
        priceTnd: 960,
      },
      { name: "Docker Certified Associate", provider: "Docker", priceTnd: 650 },
      {
        name: "Certified Kubernetes Administrator (CKA)",
        provider: "CNCF",
        priceTnd: 1320,
      },
      {
        name: "HashiCorp Terraform Associate",
        provider: "HashiCorp",
        priceTnd: 650,
      },
    ],
    freeCourses: [
      {
        title: "Introduction to DevOps",
        university: "Linux Foundation",
        platform: "edX",
        url: "https://www.edx.org/learn/devops/the-linux-foundation-introduction-to-devops",
      },
      {
        title: "Continuous Delivery and DevOps",
        university: "University of Virginia",
        platform: "Coursera (audit)",
        url: "https://www.coursera.org/learn/uva-darden-continous-delivery-devops",
      },
      {
        title: "Site Reliability Engineering and DevOps",
        university: "Google Cloud",
        platform: "Coursera (audit)",
        url: "https://www.coursera.org/professional-certificates/sre-devops-engineer-google-cloud",
      },
    ],
  },
  {
    type: "IT Service Management",
    certifications: [
      {
        name: "Atlassian ITSM Fundamentals Badge",
        provider: "Atlassian University",
        priceTnd: 0,
      },
      { name: "ITIL 4 Foundation", provider: "AXELOS", priceTnd: 1250 },
      {
        name: "ITIL 4 Specialist: Create, Deliver and Support",
        provider: "AXELOS",
        priceTnd: 1800,
      },
      { name: "ISO/IEC 20000 Foundation", provider: "PECB", priceTnd: 1200 },
    ],
    freeCourses: [
      {
        title: "IT Service Management",
        university: "University System of Georgia",
        platform: "Coursera (audit)",
        url: "https://www.coursera.org/learn/it-service-management",
      },
      {
        title: "Digital Transformation and IT Service Management",
        university: "Rochester Institute of Technology",
        platform: "edX",
        url: "https://www.edx.org/learn/information-technology/rochester-institute-of-technology-digital-transformation-and-it-service-management",
      },
    ],
  },
  {
    type: "Languages",
    certifications: [
      {
        name: "IELTS Academic",
        provider: "British Council / IDP",
        priceTnd: 780,
      },
      { name: "TOEFL iBT", provider: "ETS", priceTnd: 760 },
      {
        name: "DELF B2",
        provider: "France Education International",
        priceTnd: 420,
      },
      {
        name: "DALF C1",
        provider: "France Education International",
        priceTnd: 520,
      },
      { name: "TestDaF", provider: "g.a.s.t.", priceTnd: 680 },
      { name: "DELE B2", provider: "Instituto Cervantes", priceTnd: 480 },
      {
        name: "HSK Level 4",
        provider: "Chinese Testing International",
        priceTnd: 260,
      },
      { name: "Duolingo English Test", provider: "Duolingo", priceTnd: 210 },
    ],
    freeCourses: [
      {
        title: "English for Career Development",
        university: "University of Pennsylvania",
        platform: "Coursera (audit)",
        url: "https://www.coursera.org/learn/careerdevelopment",
      },
      {
        title: "Learn French B1-B2",
        university: "Ecole Polytechnique",
        platform: "Coursera (audit)",
        url: "https://www.coursera.org/learn/etudier-en-france",
      },
      {
        title: "Chinese for HSK 1",
        university: "Peking University",
        platform: "Coursera (audit)",
        url: "https://www.coursera.org/learn/hsk-1",
      },
    ],
  },
  {
    type: "Mobile Development",
    certifications: [
      {
        name: "Android Associate Developer",
        provider: "Google",
        priceTnd: 520,
      },
      {
        name: "Meta Android Developer Professional Certificate",
        provider: "Meta",
        priceTnd: 160,
      },
      {
        name: "Meta iOS Developer Professional Certificate",
        provider: "Meta",
        priceTnd: 160,
      },
      {
        name: "Flutter Application Developer Certification",
        provider: "Google",
        priceTnd: 520,
      },
    ],
    freeCourses: [
      {
        title: "Developing Android Apps with Kotlin",
        university: "Vanderbilt University",
        platform: "Coursera (audit)",
        url: "https://www.coursera.org/specializations/android-app-development",
      },
      {
        title: "iOS App Development with Swift",
        university: "The Hong Kong University of Science and Technology",
        platform: "Coursera (audit)",
        url: "https://www.coursera.org/specializations/app-development",
      },
      {
        title: "Mobile App Development with React Native",
        university: "The Hong Kong University of Science and Technology",
        platform: "Coursera (audit)",
        url: "https://www.coursera.org/learn/react-native",
      },
    ],
  },
  {
    type: "Networking",
    certifications: [
      {
        name: "Cisco Networking Academy: Networking Basics",
        provider: "Cisco",
        priceTnd: 0,
      },
      {
        name: "Cisco Networking Academy: Introduction to Packet Tracer",
        provider: "Cisco",
        priceTnd: 0,
      },
      {
        name: "Cisco Certified Entry Networking Technician (CCENT)",
        provider: "Cisco",
        priceTnd: 330,
      },
      {
        name: "Linux Foundation Certified Network Associate",
        provider: "Linux Foundation",
        priceTnd: 295,
      },
      { name: "CCNA", provider: "Cisco", priceTnd: 980 },
      { name: "CompTIA Network+", provider: "CompTIA", priceTnd: 1320 },
      { name: "Juniper JNCIA-Junos", provider: "Juniper", priceTnd: 650 },
    ],
    freeCourses: [
      {
        title: "Computer Communications",
        university: "University of Colorado System",
        platform: "Coursera (audit)",
        url: "https://www.coursera.org/learn/computer-communications",
      },
      {
        title: "Introduction to Networking",
        university: "New York University",
        platform: "edX",
        url: "https://www.edx.org/learn/computer-networking/new-york-university-introduction-to-networking",
      },
    ],
  },
  {
    type: "Programming",
    certifications: [
      {
        name: "freeCodeCamp JavaScript Algorithms and Data Structures",
        provider: "freeCodeCamp",
        priceTnd: 0,
      },
      {
        name: "freeCodeCamp Scientific Computing with Python",
        provider: "freeCodeCamp",
        priceTnd: 0,
      },
      {
        name: "Zend Certified Associate PHP Engineer",
        provider: "Zend",
        priceTnd: 200,
      },
      {
        name: "Linux Foundation - Certified Associate Python Programmer",
        provider: "Linux Foundation",
        priceTnd: 295,
      },
      {
        name: "Oracle Certified Professional, Java SE",
        provider: "Oracle",
        priceTnd: 800,
      },
      {
        name: "PCAP - Certified Associate in Python Programming",
        provider: "Python Institute",
        priceTnd: 920,
      },
      {
        name: "Microsoft Certified: Azure Developer Associate (AZ-204)",
        provider: "Microsoft",
        priceTnd: 520,
      },
      {
        name: "AWS Certified Developer - Associate",
        provider: "AWS",
        priceTnd: 520,
      },
    ],
    freeCourses: [
      {
        title: "CS50's Introduction to Computer Science",
        university: "Harvard University",
        platform: "edX",
        url: "https://www.edx.org/learn/computer-science/harvard-university-cs50-s-introduction-to-computer-science",
      },
      {
        title: "Programming Languages",
        university: "University of Washington",
        platform: "Coursera (audit)",
        url: "https://www.coursera.org/learn/programming-languages",
      },
      {
        title: "Python for Everybody",
        university: "University of Michigan",
        platform: "Coursera (audit)",
        url: "https://www.coursera.org/specializations/python",
      },
    ],
  },
  {
    type: "Project Management",
    certifications: [
      {
        name: "Agile Project Management Foundations Badge",
        provider: "HP LIFE",
        priceTnd: 0,
      },
      { name: "PMP", provider: "PMI", priceTnd: 1780 },
      {
        name: "Certified ScrumMaster (CSM)",
        provider: "Scrum Alliance",
        priceTnd: 1450,
      },
      { name: "PRINCE2 Foundation", provider: "PeopleCert", priceTnd: 1650 },
    ],
    freeCourses: [
      {
        title: "Introduction to Project Management",
        university: "University of Adelaide",
        platform: "edX",
        url: "https://www.edx.org/learn/project-management/the-university-of-adelaide-introduction-to-project-management",
      },
      {
        title: "Project Management Principles and Practices",
        university: "University of California, Irvine",
        platform: "Coursera (audit)",
        url: "https://www.coursera.org/specializations/project-management",
      },
    ],
  },
  {
    type: "QA Testing",
    certifications: [
      {
        name: "Postman API Fundamentals Student Expert",
        provider: "Postman",
        priceTnd: 0,
      },
      {
        name: "ISTQB Certified Tester Foundation Level",
        provider: "ISTQB",
        priceTnd: 850,
      },
      {
        name: "Certified Agile Tester",
        provider: "ICAgile",
        priceTnd: 1250,
      },
      {
        name: "Spring Professional Certification",
        provider: "VMware",
        priceTnd: 300,
      },
      {
        name: "Certified Selenium Tester Foundation",
        provider: "Selenium Certification Board",
        priceTnd: 700,
      },
      {
        name: "ISTQB Advanced Test Analyst",
        provider: "ISTQB",
        priceTnd: 1450,
      },
    ],
    freeCourses: [
      {
        title: "Software Testing and Automation",
        university: "University of Minnesota",
        platform: "Coursera (audit)",
        url: "https://www.coursera.org/specializations/software-testing-automation",
      },
      {
        title: "Introduction to Software Testing",
        university: "University of Leeds",
        platform: "FutureLearn",
        url: "https://www.futurelearn.com/courses/software-testing",
      },
      {
        title: "Software Testing and Quality Assurance",
        university: "University of Alberta",
        platform: "Coursera (audit)",
        url: "https://www.coursera.org/specializations/software-testing-automation",
      },
    ],
  },
  {
    type: "UI/UX",
    certifications: [
      {
        name: "Figma Design Foundations Badge",
        provider: "Figma",
        priceTnd: 0,
      },
      {
        name: "Google UX Design Professional Certificate",
        provider: "Google",
        priceTnd: 160,
      },
      {
        name: "Nielsen Norman UX Certification",
        provider: "Nielsen Norman Group",
        priceTnd: 9000,
      },
      {
        name: "Certified Usability Analyst (CUA)",
        provider: "Human Factors International",
        priceTnd: 7800,
      },
      {
        name: "Adobe Certified Professional in Visual Design",
        provider: "Adobe",
        priceTnd: 920,
      },
    ],
    freeCourses: [
      {
        title: "Human-Computer Interaction",
        university: "Georgia Institute of Technology",
        platform: "Coursera (audit)",
        url: "https://www.coursera.org/learn/human-computer-interaction",
      },
      {
        title: "Introduction to User Experience Design",
        university: "Georgia Institute of Technology",
        platform: "Coursera (audit)",
        url: "https://www.coursera.org/learn/user-experience-design",
      },
      {
        title: "UI/UX Design Specialization",
        university: "California Institute of the Arts",
        platform: "Coursera (audit)",
        url: "https://www.coursera.org/specializations/ui-ux-design",
      },
    ],
  },
  {
    type: "Web Development",
    certifications: [
      {
        name: "freeCodeCamp Front End Development Libraries",
        provider: "freeCodeCamp",
        priceTnd: 0,
      },
      {
        name: "freeCodeCamp Responsive Web Design",
        provider: "freeCodeCamp",
        priceTnd: 0,
      },
      {
        name: "Meta Front-End Developer Professional Certificate",
        provider: "Meta",
        priceTnd: 160,
      },
      {
        name: "Meta Back-End Developer Professional Certificate",
        provider: "Meta",
        priceTnd: 160,
      },
      {
        name: "W3C Front-End Web Developer Professional Certificate",
        provider: "W3C",
        priceTnd: 320,
      },
      {
        name: "Meta Full-Stack Developer Professional Certificate",
        provider: "Meta",
        priceTnd: 160,
      },
    ],
    freeCourses: [
      {
        title: "Web Programming with Python and JavaScript",
        university: "Harvard University",
        platform: "edX",
        url: "https://www.edx.org/learn/web-development/harvard-university-cs50-s-web-programming-with-python-and-javascript",
      },
      {
        title: "HTML, CSS, and Javascript for Web Developers",
        university: "Johns Hopkins University",
        platform: "Coursera (audit)",
        url: "https://www.coursera.org/learn/html-css-javascript-for-web-developers",
      },
      {
        title: "Front-End Web Developer",
        university: "W3Cx",
        platform: "edX",
        url: "https://www.edx.org/professional-certificate/w3cx-front-end-web-developer",
      },
    ],
  },
];

export const certificationCatalog = rawCertificationCatalog.map((entry) => ({
  ...entry,
  certifications: [...entry.certifications].sort((a, b) =>
    a.name.localeCompare(b.name),
  ),
  freeCourses: [...entry.freeCourses].sort((a, b) =>
    a.title.localeCompare(b.title),
  ),
}));

export const certifications = certificationCatalog.flatMap((entry) =>
  entry.certifications.map((certification) => ({
    ...certification,
    type: entry.type,
  })),
);

export const certificationTypes = certificationCatalog
  .map((entry) => entry.type)
  .sort((a, b) => a.localeCompare(b));
