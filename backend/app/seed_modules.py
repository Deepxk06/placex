import asyncio
from app.database import connect_db, disconnect_db
import app.database as db_mod
from app.models import Base, GDTopic, CompanyQuestion, LearningTopic, CodingProblem, AptitudeQuestion
from app.aptitude_seed import APTITUDE_QUESTIONS
from app.technical_seed import TECHNICAL_QUESTIONS
from app.coding_seed import CODING_PROBLEMS
from sqlalchemy import select, func


GD_TOPICS = [
    {"title": "AI and Future Jobs", "category": "technology", "description": "Will AI replace human jobs or create new opportunities?",
     "points_for": ["AI creates new job categories", "Increases productivity", "Handles dangerous tasks", "Frees humans for creative work"],
     "points_against": ["Job displacement in routine tasks", "Widens skill gap", "Bias in AI decisions", "High cost of transition"],
     "key_arguments": ["Reskilling programs are essential", "AI augments rather than replaces", "New roles emerge with AI adoption"],
     "opening_statement": "Artificial intelligence is transforming the workplace at an unprecedented pace. While concerns about job displacement are valid, history shows that technological revolutions ultimately create more jobs than they destroy.",
     "conclusion": "The key is proactive reskilling and education reform to prepare the workforce for AI-augmented roles.", "difficulty": "medium"},
    {"title": "Work From Home vs Office Work", "category": "lifestyle", "description": "Which model is more productive and sustainable?",
     "points_for": ["Better work-life balance", "Reduced commute time", "Cost savings", "Increased flexibility"],
     "points_against": ["Isolation and loneliness", "Blurred work-life boundaries", "Reduced collaboration", "Home distractions"],
     "key_arguments": ["Hybrid models offer the best of both worlds", "Productivity depends on role and individual", "Company culture matters"],
     "opening_statement": "The pandemic fundamentally changed how we work. Now the debate is whether to return to offices or embrace remote work permanently.",
     "conclusion": "A hybrid approach that gives employees flexibility while maintaining collaboration opportunities is the most sustainable path forward.", "difficulty": "easy"},
    {"title": "Social Media: Boon or Bane", "category": "society", "description": "Does social media do more harm than good?",
     "points_for": ["Connects people globally", "Platform for expression", "Business opportunities", "Awareness and education"],
     "points_against": ["Mental health impacts", "Misinformation spread", "Privacy concerns", "Addiction and screen time"],
     "key_arguments": ["Digital literacy is key", "Platform regulation needed", "Responsible usage matters"],
     "opening_statement": "Social media has connected billions of people worldwide, but concerns about its impact on mental health and society are growing.",
     "conclusion": "Social media is a tool - its impact depends on how we use it. Regulation and digital literacy are essential.", "difficulty": "easy"},
    {"title": "Ethics of Artificial Intelligence", "category": "technology", "description": "Should there be strict regulations on AI development?",
     "points_for": ["Prevents misuse", "Protects privacy", "Ensures fairness", "Builds public trust"],
     "points_against": ["Slows innovation", "Hard to enforce globally", "Stifles competition", "Definition of ethics varies"],
     "key_arguments": ["Balanced regulation is needed", "International cooperation required", "Transparency in AI systems"],
     "opening_statement": "As AI systems become more powerful, the question of ethical boundaries becomes increasingly urgent.",
     "conclusion": "A collaborative approach between governments, tech companies, and society is needed to establish ethical AI guidelines.", "difficulty": "hard"},
    {"title": "Climate Change and Young Generation", "category": "environment", "description": "Is the younger generation doing enough to combat climate change?",
     "points_for": ["Youth activism raising awareness", "Adoption of sustainable practices", "Innovation in clean tech", "Voting for climate policies"],
     "points_against": ["Consumer habits contradict values", "Social media activism vs real action", "Limited political power", "Carbon footprint of tech"],
     "key_arguments": ["Systemic change requires policy action", "Individual and collective responsibility", "Technology alone cannot solve climate change"],
     "opening_statement": "Young people today are the most climate-conscious generation, but questions remain about whether awareness translates to action.",
     "conclusion": "While youth awareness is high, translating that into systemic change requires political engagement and corporate accountability.", "difficulty": "medium"},
    {"title": "Startup Ecosystem in India", "category": "business", "description": "Is India's startup ecosystem sustainable?",
     "points_for": ["Innovation and job creation", "Growing investor confidence", "Government support", "Large domestic market"],
     "points_against": ["High failure rates", "Unsustainable valuations", "Regulatory challenges", "Copycat vs innovation"],
     "key_arguments": ["Focus on unit economics", "Sustainable growth over unicorn chase", "Government policy impact"],
     "opening_statement": "India has emerged as the third-largest startup ecosystem globally, but questions about sustainability persist.",
     "conclusion": "Sustainable startups focusing on real problems and unit economics will drive India's growth story.", "difficulty": "medium"},
    {"title": "Online Education vs Traditional Classroom", "category": "education", "description": "Can online education replace traditional learning?",
     "points_for": ["Accessibility", "Flexibility", "Cost-effective", "Self-paced learning"],
     "points_against": ["Lack of social interaction", "Screen fatigue", "Quality concerns", "Digital divide"],
     "key_arguments": ["Blended learning is the future", "Infrastructure gaps need addressing", "Teacher training essential"],
     "opening_statement": "The shift to online education during the pandemic revealed both its potential and limitations.",
     "conclusion": "A blended approach combining online flexibility with classroom interaction offers the best learning outcomes.", "difficulty": "easy"},
    {"title": "Digital India: Progress and Challenges", "category": "technology", "description": "Has India's digital transformation been inclusive?",
     "points_for": ["UPI revolution", "Digital governance", "Financial inclusion", "Rural connectivity improving"],
     "points_against": ["Digital divide persists", "Cybersecurity concerns", "Language barriers", "Rural internet quality"],
     "key_arguments": ["Infrastructure investment needed", "Digital literacy programs essential", "Language localization key"],
     "opening_statement": "India's digital transformation has been remarkable, but ensuring inclusive access remains a challenge.",
     "conclusion": "Bridging the digital divide through infrastructure and literacy programs is essential for truly inclusive digital growth.", "difficulty": "medium"},
    {"title": "Mental Health in Corporate World", "category": "society", "description": "Are companies doing enough for employee mental health?",
     "points_for": ["Growing awareness", "Employee assistance programs", "Flexible work options", "Reduced stigma"],
     "points_against": ["Toxic work cultures persist", "Burnout normalized", "Insufficient support", "Performance pressure"],
     "key_arguments": ["Mental health is a business issue", "Leadership tone matters", "Systemic change needed"],
     "opening_statement": "Workplace stress and burnout have become epidemic, affecting productivity and employee well-being.",
     "conclusion": "Companies must treat mental health as a priority, not a perk, through systemic culture change.", "difficulty": "medium"},
    {"title": "Space Exploration: Worth the Investment?", "category": "science", "description": "Should developing countries invest in space programs?",
     "points_for": ["Technological spinoffs", "National pride", "Resource discovery", "Long-term survival"],
     "points_against": ["Immediate needs unmet", "Opportunity cost", "International cooperation needed", "Environmental impact"],
     "key_arguments": ["Balanced investment approach", "International collaboration", "Technology transfer benefits"],
     "opening_statement": "As countries invest billions in space programs, questions about prioritization arise.",
     "conclusion": "Space investment is justified when balanced with addressing immediate societal needs.", "difficulty": "hard"},
    {"title": "Impact of OTT Platforms on Cinema", "category": "entertainment", "description": "Are OTT platforms killing traditional cinema?",
     "points_for": ["Content democratization", "Global reach", "Creative freedom", "Convenience"],
     "points_against": ["Theatrical experience declining", "Revenue model challenges", "Content overload", "Cinema jobs affected"],
     "key_arguments": ["Coexistence is possible", "Different experiences serve different needs", "Content quality matters"],
     "opening_statement": "The rise of OTT platforms has fundamentally changed how we consume entertainment.",
     "conclusion": "OTT and cinema can coexist, each offering unique experiences to audiences.", "difficulty": "easy"},
    {"title": "Government Surveillance vs Privacy", "category": "politics", "description": "Is mass surveillance justified for national security?",
     "points_for": ["Crime prevention", "National security", "Terrorism prevention", "Public safety"],
     "points_against": ["Privacy violation", "Chilling effect on freedom", "Potential for abuse", "Mass data collection risks"],
     "key_arguments": ["Oversight mechanisms essential", "Proportionality principle", "Transparency needed"],
     "opening_statement": "In an age of digital communication, governments face the challenge of balancing security with privacy.",
     "conclusion": "Robust oversight and transparency mechanisms are essential to prevent surveillance overreach.", "difficulty": "hard"},
    {"title": "Plastic Ban: Solution or Inconvenience?", "category": "environment", "description": "Are plastic bans effective in reducing pollution?",
     "points_for": ["Reduces pollution", "Encourages alternatives", "Health benefits", "Environmental protection"],
     "points_against": ["Inconvenience to businesses", "Alternative costs higher", "Enforcement challenges", "Incomplete solution"],
     "key_arguments": ["Comprehensive approach needed", "Industry transition support", "Consumer behavior change"],
     "opening_statement": "Plastic bans are being implemented worldwide, but their effectiveness is debated.",
     "conclusion": "Plastic bans work best when accompanied by affordable alternatives and proper enforcement.", "difficulty": "easy"},
    {"title": "Reservation System in India", "category": "politics", "description": "Should reservation be based on economic status rather than caste?",
     "points_for": ["Addresses current inequality", "Merit-based opportunity", "Economic upliftment", "Modern approach"],
     "points_against": ["Historical injustice remains", "Caste discrimination persists", "Implementation challenges", "Political implications"],
     "key_arguments": ["Dual approach needed", "Data-driven policy", "Focus on quality education"],
     "opening_statement": "India's reservation system is one of the world's largest affirmative action programs, but debates about its form continue.",
     "conclusion": "A balanced approach considering both caste and economic factors may be the most equitable path forward.", "difficulty": "hard"},
    {"title": "Autonomous Vehicles: Ready for the Road?", "category": "technology", "description": "Should self-driving cars be allowed on public roads now?",
     "points_for": ["Reduced accidents", "Accessibility for disabled", "Traffic optimization", "Technology readiness"],
     "points_against": ["Safety concerns", "Job displacement", "Ethical dilemmas", "Infrastructure needs"],
     "key_arguments": ["Gradual rollout with oversight", "Regulatory framework essential", "Public trust building"],
     "opening_statement": "Self-driving technology is advancing rapidly, but the question of public road readiness remains.",
     "conclusion": "Autonomous vehicles need robust regulation and proven safety records before widespread adoption.", "difficulty": "medium"},
]

COMPANY_QUESTIONS = [
    {"company_name": "TCS", "year": 2025, "role": "Software Developer", "round_name": "Aptitude", "topic": "Quantitative", "difficulty": "easy", "question": "A train 150m long passes a pole in 15 seconds. What is its speed in km/h?", "options": ["36 km/h", "54 km/h", "40 km/h", "45 km/h"], "correct_index": 0, "explanation": "Speed = 150/15 = 10 m/s = 36 km/h", "question_type": "mcq"},
    {"company_name": "TCS", "year": 2025, "role": "Software Developer", "round_name": "Aptitude", "topic": "Quantitative", "difficulty": "medium", "question": "If CI on Rs. 10000 for 2 years at 10% is Rs. 2100, what is the SI?", "options": ["Rs. 2000", "Rs. 1800", "Rs. 1900", "Rs. 2200"], "correct_index": 0, "explanation": "SI = P*R*T/100 = 10000*10*2/100 = 2000", "question_type": "mcq"},
    {"company_name": "TCS", "year": 2025, "role": "Software Developer", "round_name": "Technical", "topic": "Programming", "difficulty": "medium", "question": "What is the time complexity of binary search?", "options": ["O(n)", "O(log n)", "O(n log n)", "O(1)"], "correct_index": 1, "explanation": "Binary search halves the search space each step.", "question_type": "mcq"},
    {"company_name": "Infosys", "year": 2025, "role": "Software Developer", "round_name": "Technical", "topic": "Data Structures", "difficulty": "medium", "question": "Which data structure is best for implementing a priority queue?", "options": ["Array", "Linked List", "Binary Heap", "Stack"], "correct_index": 2, "explanation": "Binary heap provides O(log n) insert and extract-min/max.", "question_type": "mcq"},
    {"company_name": "Infosys", "year": 2025, "role": "Software Developer", "round_name": "Aptitude", "topic": "Logical Reasoning", "difficulty": "medium", "question": "If A = 1, BAT = 24, then CAT = ?", "options": ["24", "27", "30", "48"], "correct_index": 0, "explanation": "Each letter position is multiplied: C(3)*A(1)*T(20) pattern.", "question_type": "mcq"},
    {"company_name": "Wipro", "year": 2024, "role": "Software Developer", "round_name": "Aptitude", "topic": "Verbal", "difficulty": "easy", "question": "Choose the correctly spelled word:", "options": ["Accomodation", "Accommodation", "Acomodation", "Acommodation"], "correct_index": 1, "explanation": "Accommodation has double c and double m.", "question_type": "mcq"},
    {"company_name": "Accenture", "year": 2024, "role": "Data Analyst", "round_name": "Technical", "topic": "SQL", "difficulty": "medium", "question": "Which SQL clause eliminates duplicate rows?", "options": ["WHERE", "UNIQUE", "DISTINCT", "HAVING"], "correct_index": 2, "explanation": "DISTINCT eliminates duplicate rows from result set.", "question_type": "mcq"},
    {"company_name": "Amazon", "year": 2025, "role": "SDE", "round_name": "Coding", "topic": "Arrays", "difficulty": "hard", "question": "Given an array of integers, find two numbers that add up to a target. Return their indices.", "options": [], "correct_index": None, "explanation": "Use a hash map to store complements for O(n) solution.", "question_type": "coding"},
    {"company_name": "Google", "year": 2025, "role": "SDE", "round_name": "Coding", "topic": "Trees", "difficulty": "hard", "question": "Check if a binary tree is a valid BST.", "options": [], "correct_index": None, "explanation": "Use in-order traversal or min/max bounds checking.", "question_type": "coding"},
    {"company_name": "Microsoft", "year": 2025, "role": "SDE", "round_name": "Technical", "topic": "System Design", "difficulty": "hard", "question": "Design a URL shortener service. Discuss architecture, DB schema, and scaling.", "options": [], "correct_index": None, "explanation": "Consider hashing, database design, caching, and load balancing.", "question_type": "coding"},
    {"company_name": "Flipkart", "year": 2024, "role": "Software Developer", "round_name": "Aptitude", "topic": "Data Interpretation", "difficulty": "medium", "question": "Revenue grew from 120 Cr to 180 Cr in 3 years. What is the CAGR?", "options": ["14.47%", "15.5%", "12.5%", "18%"], "correct_index": 0, "explanation": "CAGR = (180/120)^(1/3) - 1 = 14.47%", "question_type": "mcq"},
    {"company_name": "Flipkart", "year": 2024, "role": "Software Developer", "round_name": "Technical", "topic": "OOP", "difficulty": "medium", "question": "Which OOP principle allows a class to have multiple forms?", "options": ["Encapsulation", "Inheritance", "Polymorphism", "Abstraction"], "correct_index": 2, "explanation": "Polymorphism allows methods to behave differently based on the object.", "question_type": "mcq"},
    {"company_name": "HCL", "year": 2024, "role": "Software Developer", "round_name": "Aptitude", "topic": "Quantitative", "difficulty": "easy", "question": "What is 15% of 200?", "options": ["25", "30", "35", "40"], "correct_index": 1, "explanation": "15% of 200 = 0.15 * 200 = 30", "question_type": "mcq"},
    {"company_name": "HCL", "year": 2024, "role": "Software Developer", "round_name": "Technical", "topic": "Networking", "difficulty": "medium", "question": "Which layer of OSI model is responsible for routing?", "options": ["Data Link", "Network", "Transport", "Session"], "correct_index": 1, "explanation": "Network layer handles routing and IP addressing.", "question_type": "mcq"},
]

LEARNING_TECH = [
    {"name": "Python Programming", "category": "programming", "career_type": "technical", "description": "Master Python basics to advanced", "difficulty": "beginner", "subtopics": ["Variables & Data Types", "Control Flow", "Functions", "OOP", "File Handling", "Libraries"], "resources": ["Python.org", "Automate the Boring Stuff", "LeetCode"]},
    {"name": "Data Structures & Algorithms", "category": "programming", "career_type": "technical", "description": "Core DSA for coding interviews", "difficulty": "intermediate", "subtopics": ["Arrays", "Linked Lists", "Stacks & Queues", "Trees", "Graphs", "Sorting", "Searching", "Dynamic Programming"], "resources": ["LeetCode", "GeeksforGeeks", "Cracking the Coding Interview"]},
    {"name": "SQL & Databases", "category": "database", "career_type": "technical", "description": "Database design and queries", "difficulty": "beginner", "subtopics": ["Basic Queries", "Joins", "Subqueries", "Indexing", "Normalization"], "resources": ["SQLBolt", "Mode Analytics"]},
    {"name": "Machine Learning", "category": "data_science", "career_type": "technical", "description": "ML algorithms and applications", "difficulty": "advanced", "subtopics": ["Supervised Learning", "Unsupervised Learning", "Neural Networks", "Model Evaluation", "Feature Engineering"], "resources": ["Coursera ML", "Kaggle", "Scikit-learn"]},
    {"name": "Web Development", "category": "development", "career_type": "technical", "description": "Full-stack web development", "difficulty": "beginner", "subtopics": ["HTML/CSS", "JavaScript", "React", "Node.js", "REST APIs"], "resources": ["MDN Web Docs", "freeCodeCamp"]},
    {"name": "Cloud Computing", "category": "infrastructure", "career_type": "technical", "description": "AWS, Azure, GCP fundamentals", "difficulty": "intermediate", "subtopics": ["Cloud Basics", "Compute", "Storage", "Networking", "Security"], "resources": ["AWS Free Tier", "Azure Learn"]},
    {"name": "Operating Systems", "category": "fundamentals", "career_type": "technical", "description": "OS concepts for interviews", "difficulty": "intermediate", "subtopics": ["Process Management", "Memory Management", "File Systems", "Deadlocks", "Scheduling"], "resources": ["OSTEP", "GeeksforGeeks"]},
    {"name": "Computer Networks", "category": "fundamentals", "career_type": "technical", "description": "Networking fundamentals", "difficulty": "intermediate", "subtopics": ["OSI Model", "TCP/IP", "HTTP", "DNS", "Routing"], "resources": ["Kurose", "Cisco Academy"]},
]

LEARNING_NONTECH = [
    {"name": "Communication Skills", "category": "soft_skills", "career_type": "non-technical", "description": "Effective workplace communication", "difficulty": "beginner", "subtopics": ["Written Communication", "Verbal Communication", "Presentations", "Email Etiquette", "Active Listening"], "resources": ["Toastmasters", "Coursera"]},
    {"name": "Aptitude & Reasoning", "category": "aptitude", "career_type": "non-technical", "description": "Quantitative and logical reasoning", "difficulty": "beginner", "subtopics": ["Quantitative Aptitude", "Logical Reasoning", "Data Interpretation", "Puzzles"], "resources": ["IndiaBix", "RS Aggarwal"]},
    {"name": "Business Acumen", "category": "business", "career_type": "non-technical", "description": "Understanding business operations", "difficulty": "intermediate", "subtopics": ["Business Models", "Financial Basics", "Market Analysis", "Strategy"], "resources": ["HBR", "Business Case Studies"]},
    {"name": "Marketing Fundamentals", "category": "marketing", "career_type": "non-technical", "description": "Core marketing concepts", "difficulty": "beginner", "subtopics": ["4Ps of Marketing", "Digital Marketing", "Brand Management", "Market Research"], "resources": ["Google Digital Garage", "HubSpot"]},
    {"name": "HR Management", "category": "hr", "career_type": "non-technical", "description": "Human resource management basics", "difficulty": "beginner", "subtopics": ["Recruitment", "Employee Relations", "Compensation", "Training & Development"], "resources": ["SHRM"]},
    {"name": "Financial Analysis", "category": "finance", "career_type": "non-technical", "description": "Financial statement analysis", "difficulty": "intermediate", "subtopics": ["Balance Sheet", "Income Statement", "Cash Flow", "Ratio Analysis"], "resources": ["Investopedia", "CFA"]},
    {"name": "Verbal Ability", "category": "verbal", "career_type": "non-technical", "description": "English grammar and vocabulary", "difficulty": "beginner", "subtopics": ["Grammar", "Vocabulary", "Reading Comprehension", "Sentence Correction"], "resources": ["Grammarly", "WordPower"]},
    {"name": "Sales & Negotiation", "category": "sales", "career_type": "non-technical", "description": "Sales techniques and negotiation", "difficulty": "intermediate", "subtopics": ["Prospecting", "Cold Calling", "Negotiation Tactics", "Closing Deals"], "resources": ["SPIN Selling"]},
]


async def seed_all():
    await connect_db()
    async with db_mod.engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with db_mod.engine.begin() as conn:
        count = (await conn.execute(select(func.count(GDTopic.id)))).scalar()
        if count == 0:
            for t in GD_TOPICS:
                await conn.execute(GDTopic.__table__.insert().values(**t))
            print(f"Seeded {len(GD_TOPICS)} GD topics")

        count = (await conn.execute(select(func.count(CompanyQuestion.id)))).scalar()
        if count == 0:
            for q in COMPANY_QUESTIONS:
                await conn.execute(CompanyQuestion.__table__.insert().values(**q))
            print(f"Seeded {len(COMPANY_QUESTIONS)} company questions")

        count = (await conn.execute(select(func.count(LearningTopic.id)))).scalar()
        if count == 0:
            for t in LEARNING_TECH + LEARNING_NONTECH:
                await conn.execute(LearningTopic.__table__.insert().values(**t))
            print(f"Seeded {len(LEARNING_TECH) + len(LEARNING_NONTECH)} learning topics")

        count = (await conn.execute(select(func.count(CodingProblem.id)))).scalar()
        if count == 0:
            for p in CODING_PROBLEMS:
                await conn.execute(CodingProblem.__table__.insert().values(**p))
            print(f"Seeded {len(CODING_PROBLEMS)} coding problems")

        count = (await conn.execute(select(func.count(AptitudeQuestion.id)))).scalar()
        if count == 0:
            for q in APTITUDE_QUESTIONS:
                await conn.execute(AptitudeQuestion.__table__.insert().values(**q))
            print(f"Seeded {len(APTITUDE_QUESTIONS)} aptitude questions")

            for q in TECHNICAL_QUESTIONS:
                await conn.execute(AptitudeQuestion.__table__.insert().values(**q))
            print(f"Seeded {len(TECHNICAL_QUESTIONS)} technical MCQ questions")

    await disconnect_db()
    print("All module seed data inserted successfully")


if __name__ == "__main__":
    asyncio.run(seed_all())
