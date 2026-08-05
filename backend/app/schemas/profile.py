from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional

PHONE_RE = r"^[0-9+\-\s()]{8,15}$"
PIN_RE = r"^\d{6}$"
AADHAAR_RE = r"^\d{4}\s?\d{4}\s?\d{4}$"
DATE_RE = r"^\d{4}-\d{2}-\d{2}$"
YEAR_RE = r"^\d{4}$"
WEBSITE_RE = r"^(https?://|www\.)[\w\-.:/?=&%#]+$"


class PersonalIn(BaseModel):
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    aadhaar_number: Optional[str] = None
    nationality: Optional[str] = None
    bio: Optional[str] = None

    @field_validator("date_of_birth")
    @classmethod
    def valid_date(cls, v):
        if v is None or v == "":
            return v
        if not __import__("re").match(DATE_RE, v):
            raise ValueError("Date of birth must be in YYYY-MM-DD format")
        return v

    @field_validator("aadhaar_number")
    @classmethod
    def valid_aadhaar(cls, v):
        if v is None or v == "":
            return v
        if not __import__("re").match(AADHAAR_RE, v):
            raise ValueError("Aadhaar number must be 12 digits")
        return v


class ContactIn(BaseModel):
    phone: Optional[str] = None
    alternate_phone: Optional[str] = None
    personal_email: Optional[EmailStr] = None
    website: Optional[str] = None

    @field_validator("phone", "alternate_phone")
    @classmethod
    def valid_phone(cls, v):
        if v is None or v == "":
            return v
        if not __import__("re").match(PHONE_RE, v):
            raise ValueError("Phone number must be 8-15 digits")
        return v

    @field_validator("website")
    @classmethod
    def valid_website(cls, v):
        if v is None or v == "":
            return v
        if not __import__("re").match(WEBSITE_RE, v):
            raise ValueError("Website must start with http:// or https://")
        return v


class AddressIn(BaseModel):
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    city: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    pin_code: Optional[str] = None
    landmark: Optional[str] = None
    address_type: Optional[str] = None
    latitude: Optional[str] = None
    longitude: Optional[str] = None

    @field_validator("pin_code")
    @classmethod
    def valid_pin(cls, v):
        if v is None or v == "":
            return v
        if not __import__("re").match(PIN_RE, v):
            raise ValueError("PIN code must be 6 digits")
        return v


class CollegeIn(BaseModel):
    college_name: Optional[str] = None
    college_location: Optional[str] = None
    degree: Optional[str] = None
    branch: Optional[str] = None
    cgpa: Optional[str] = None
    start_year: Optional[str] = None
    end_year: Optional[str] = None
    roll_number: Optional[str] = None
    admission_number: Optional[str] = None

    @field_validator("start_year", "end_year")
    @classmethod
    def valid_year(cls, v):
        if v is None or v == "":
            return v
        if not __import__("re").match(YEAR_RE, v):
            raise ValueError("Year must be 4 digits (e.g. 2024)")
        return v

    @field_validator("cgpa")
    @classmethod
    def valid_cgpa(cls, v):
        if v is None or v == "":
            return v
        try:
            val = float(v)
        except ValueError:
            raise ValueError("CGPA must be a number")
        if val < 0 or val > 10:
            raise ValueError("CGPA must be between 0 and 10")
        return v


class MedicalIn(BaseModel):
    medical_conditions: Optional[str] = None
    allergies: Optional[str] = None
    disabilities: Optional[str] = None
    chronic_medications: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    emergency_contact_relation: Optional[str] = None

    @field_validator("emergency_contact_phone")
    @classmethod
    def valid_emergency_phone(cls, v):
        if v is None or v == "":
            return v
        if not __import__("re").match(PHONE_RE, v):
            raise ValueError("Emergency contact phone must be 8-15 digits")
        return v


class SettingsIn(BaseModel):
    language: Optional[str] = None
    theme: Optional[str] = None
    email_notifications: Optional[bool] = None
    sms_notifications: Optional[bool] = None
    push_notifications: Optional[bool] = None
    profile_visibility: Optional[str] = None
    two_factor_enabled: Optional[bool] = None


class ProfileUpdate(BaseModel):
    personal: Optional[PersonalIn] = None
    contact: Optional[ContactIn] = None
    address: Optional[AddressIn] = None
    college: Optional[CollegeIn] = None
    medical: Optional[MedicalIn] = None
    settings: Optional[SettingsIn] = None
