from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    full_name: str
    password: str
    role: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str
class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    full_name: str
    role: str
    is_active: bool

    class Config:
        from_attributes = True
class OTPRequest(BaseModel):
    email: EmailStr


class OTPVerify(BaseModel):
    email: EmailStr
    otp: str
class UserUpdate(BaseModel):
    username: str
    full_name: str

class ChangePassword(BaseModel):
    current_password: str
    new_password: str