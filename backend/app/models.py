import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Text, ForeignKey, Enum as SAEnum, JSON, ARRAY
from sqlalchemy.orm import DeclarativeBase, relationship
from sqlalchemy.dialects.postgresql import UUID as PG_UUID


class Base(DeclarativeBase):
    pass


def utcnow():
    return datetime.now(timezone.utc)


PROFILE_COMPLETION_FIELDS = [
    "date_of_birth", "gender", "blood_group", "aadhaar_number", "nationality", "bio",
    "phone", "alternate_phone", "personal_email", "website",
    "address_line1", "address_line2", "city", "district", "state", "country",
    "pin_code", "landmark", "address_type", "latitude", "longitude",
    "college_name", "college_location", "degree", "branch", "cgpa",
    "start_year", "end_year", "roll_number", "admission_number",
    "medical_conditions", "allergies", "disabilities", "chronic_medications",
    "emergency_contact_name", "emergency_contact_phone", "emergency_contact_relation",
]


class User(Base):
    __tablename__ = "users"
    uid = Column(String, primary_key=True)
    email = Column(String, nullable=False, unique=True)
    name = Column(String, nullable=False)
    role = Column(String, nullable=False, default="student")
    college = Column(String, default="")
    branch = Column(String, default="")
    cgpa = Column(Float, default=0.0)
    grad_year = Column(Integer, default=datetime.now().year)
    skills = Column(ARRAY(String), default=list)
    target_role = Column(String, default="")
    target_industry = Column(String, default="")
    preferred_location = Column(String, default="")
    desired_skills = Column(ARRAY(String), default=list)
    projects = Column(JSON, default=list)
    current_company = Column(String, default="")
    current_role = Column(String, default="")
    experience_years = Column(Integer, default=0)
    mentorship_available = Column(Boolean, default=False)
    expertise = Column(ARRAY(String), default=list)
    linked_in = Column(String, default="")
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    resumes = relationship("Resume", back_populates="user")
    assessments = relationship("Assessment", back_populates="user")
    interviews = relationship("Interview", back_populates="user")
    predictions = relationship("Prediction", back_populates="user")
    roadmaps = relationship("Roadmap", back_populates="user")
    chat_messages = relationship("ChatHistory", back_populates="user")
    sent_requests = relationship("ConnectRequest", foreign_keys="ConnectRequest.from_user_id", back_populates="sender")
    received_requests = relationship("ConnectRequest", foreign_keys="ConnectRequest.to_user_id", back_populates="receiver")
    profile = relationship("UserProfile", back_populates="user", uselist=False)


class UserProfile(Base):
    __tablename__ = "user_profiles"
    user_id = Column(String, ForeignKey("users.uid"), primary_key=True)

    # Personal
    photo = Column(Text, default="")
    date_of_birth = Column(String, default="")
    gender = Column(String, default="")
    blood_group = Column(String, default="")
    aadhaar_number = Column(String, default="")
    nationality = Column(String, default="Indian")
    bio = Column(Text, default="")

    # Contact
    phone = Column(String, default="")
    alternate_phone = Column(String, default="")
    personal_email = Column(String, default="")
    website = Column(String, default="")

    # Address
    address_line1 = Column(String, default="")
    address_line2 = Column(String, default="")
    city = Column(String, default="")
    district = Column(String, default="")
    state = Column(String, default="")
    country = Column(String, default="India")
    pin_code = Column(String, default="")
    landmark = Column(String, default="")
    address_type = Column(String, default="permanent")
    latitude = Column(String, default="")
    longitude = Column(String, default="")

    # College
    college_name = Column(String, default="")
    college_location = Column(String, default="")
    degree = Column(String, default="")
    branch = Column(String, default="")
    cgpa = Column(String, default="")
    start_year = Column(String, default="")
    end_year = Column(String, default="")
    roll_number = Column(String, default="")
    admission_number = Column(String, default="")

    # Medical
    medical_conditions = Column(Text, default="")
    allergies = Column(Text, default="")
    disabilities = Column(Text, default="")
    chronic_medications = Column(Text, default="")
    emergency_contact_name = Column(String, default="")
    emergency_contact_phone = Column(String, default="")
    emergency_contact_relation = Column(String, default="")

    # Identity documents (JSON: {name, size, type, dataUrl})
    student_id_doc = Column(JSON, default=dict)
    aadhaar_doc = Column(JSON, default=dict)
    driving_license_doc = Column(JSON, default=dict)

    # Account settings
    language = Column(String, default="English")
    theme = Column(String, default="light")
    email_notifications = Column(Boolean, default=True)
    sms_notifications = Column(Boolean, default=True)
    push_notifications = Column(Boolean, default=True)
    profile_visibility = Column(String, default="public")
    two_factor_enabled = Column(Boolean, default=False)

    # Meta
    is_verified = Column(Boolean, default=False)
    activity = Column(JSON, default=list)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    user = relationship("User", back_populates="profile")

    def completion_pct(self) -> int:
        filled = 0
        total = 0
        for col in PROFILE_COMPLETION_FIELDS:
            if col in ("nationality", "country", "address_type"):
                continue
            total += 1
            if getattr(self, col):
                filled += 1
        return round(filled / total * 100) if total else 0


class Job(Base):
    __tablename__ = "jobs"
    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String, nullable=False)
    company = Column(String, nullable=False)
    location = Column(String, default="")
    description = Column(Text, default="")
    required_skills = Column(ARRAY(String), default=list)
    type = Column(String, default="fulltime")
    salary_min = Column(Float, nullable=True)
    salary_max = Column(Float, nullable=True)
    salary_text = Column(String, default="")
    apply_url = Column(String, default="")
    source = Column(String, default="internal")
    source_job_id = Column(String, default="")
    role = Column(String, default="")
    posted_at = Column(DateTime(timezone=True), nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)


class ScrapedJob(Base):
    __tablename__ = "scraped_jobs"
    id = Column(Integer, primary_key=True, autoincrement=True)
    external_id = Column(String, default="")
    title = Column(String, nullable=False)
    company = Column(String, nullable=False)
    location = Column(String, default="")
    description = Column(Text, default="")
    apply_url = Column(String, default="")
    source = Column(String, default="linkedin")
    source_job_id = Column(String, default="")
    salary_text = Column(String, default="")
    salary_min = Column(Float, nullable=True)
    salary_max = Column(Float, nullable=True)
    skills = Column(ARRAY(String), default=list)
    role = Column(String, default="")
    job_type = Column(String, default="fulltime")
    posted_date = Column(DateTime(timezone=True), nullable=True)
    scraped_at = Column(DateTime(timezone=True), default=utcnow)


class Company(Base):
    __tablename__ = "companies"
    id = Column(Integer, primary_key=True, autoincrement=True)
    company_name = Column(String, nullable=False)
    industry = Column(String, default="")
    logo = Column(String, default="")
    website = Column(String, default="")
    salaries = Column(JSON, default=list)
    interview_experiences = Column(JSON, default=list)
    required_skills = Column(ARRAY(String), default=list)
    faqs = Column(JSON, default=list)
    created_at = Column(DateTime(timezone=True), default=utcnow)


class Resume(Base):
    __tablename__ = "resumes"
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(String, ForeignKey("users.uid"), nullable=False)
    original_file = Column(String, default="")
    parsed_data = Column(JSON, default=dict)
    ats_score = Column(Float, nullable=True)
    jd_match_score = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)

    user = relationship("User", back_populates="resumes")


class ResumeTemplate(Base):
    __tablename__ = "resume_templates"
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    target_role = Column(String, nullable=False)
    sections = Column(JSON, default=list)
    ats_rules = Column(JSON, default=dict)
    created_at = Column(DateTime(timezone=True), default=utcnow)


class ResumeBuilder(Base):
    __tablename__ = "resume_builder"
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(String, ForeignKey("users.uid"), nullable=False)
    template_id = Column(String, nullable=True)
    sections = Column(JSON, default=list)
    customizations = Column(JSON, default=dict)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)


class CodingProblem(Base):
    __tablename__ = "coding_problems"
    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String, nullable=False)
    slug = Column(String, unique=True, nullable=False)
    difficulty = Column(String, default="easy")
    topics = Column(ARRAY(String), default=list)
    companies = Column(ARRAY(String), default=list)
    description = Column(Text, default="")
    examples = Column(JSON, default=list)
    constraints = Column(Text, default="")
    test_cases = Column(JSON, default=list)
    hidden_test_cases = Column(JSON, default=list)
    hints = Column(ARRAY(String), default=list)
    solution = Column(JSON, default=dict)
    time_limit = Column(Integer, default=1000)
    memory_limit = Column(Integer, default=256)
    total_submissions = Column(Integer, default=0)
    total_accepted = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), default=utcnow)


class AptitudeQuestion(Base):
    __tablename__ = "aptitude_questions"
    id = Column(Integer, primary_key=True, autoincrement=True)
    topic = Column(String, nullable=False)
    subtopic = Column(String, default="")
    difficulty = Column(String, default="medium")
    question = Column(Text, nullable=False)
    options = Column(ARRAY(String), nullable=False)
    correct_index = Column(Integer, nullable=False)
    explanation = Column(Text, default="")
    time_limit = Column(Integer, default=60)
    created_at = Column(DateTime(timezone=True), default=utcnow)


class Assessment(Base):
    __tablename__ = "assessments"
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(String, ForeignKey("users.uid"), nullable=False)
    type = Column(String, nullable=False)
    score = Column(Float, default=0)
    total = Column(Float, default=0)
    answers = Column(JSON, default=list)
    topic_scores = Column(JSON, default=dict)
    time_taken = Column(Integer, default=0)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)

    user = relationship("User", back_populates="assessments")


class Interview(Base):
    __tablename__ = "interviews"
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(String, ForeignKey("users.uid"), nullable=False)
    type = Column(String, default="technical")
    status = Column(String, default="pending")
    questions = Column(JSON, default=list)
    analysis = Column(JSON, default=dict)
    overall_score = Column(Float, default=0.0)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)

    user = relationship("User", back_populates="interviews")


class Prediction(Base):
    __tablename__ = "predictions"
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(String, ForeignKey("users.uid"), nullable=False)
    placement_probability = Column(Float, default=0.0)
    expected_salary = Column(Float, default=0.0)
    predicted_role = Column(String, default="")
    skill_recommendations = Column(ARRAY(String), default=list)
    features_used = Column(JSON, default=dict)
    created_at = Column(DateTime(timezone=True), default=utcnow)

    user = relationship("User", back_populates="predictions")


class Roadmap(Base):
    __tablename__ = "roadmaps"
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(String, ForeignKey("users.uid"), nullable=False)
    career_goal = Column(String, default="")
    timeline = Column(JSON, default=list)
    milestones = Column(JSON, default=list)
    daily_goals = Column(JSON, default=list)
    certifications = Column(JSON, default=list)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    user = relationship("User", back_populates="roadmaps")


class ChatHistory(Base):
    __tablename__ = "chat_history"
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String, ForeignKey("users.uid"), nullable=False)
    role = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow)

    user = relationship("User", back_populates="chat_messages")


class ConnectRequest(Base):
    __tablename__ = "connect_requests"
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    from_user_id = Column(String, ForeignKey("users.uid"), nullable=False)
    to_user_id = Column(String, ForeignKey("users.uid"), nullable=False)
    status = Column(String, default="pending")
    message = Column(Text, default="")
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    sender = relationship("User", foreign_keys=[from_user_id], back_populates="sent_requests")
    receiver = relationship("User", foreign_keys=[to_user_id], back_populates="received_requests")
