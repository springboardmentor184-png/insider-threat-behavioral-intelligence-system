from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from fastapi import HTTPException
from fastapi.security import OAuth2PasswordBearer
from fastapi import Request


from app.services.oauth import oauth
from app.services.jwt_handler import (
    create_access_token,
    verify_access_token,
    get_current_user
)
from app.schemas.user import UserCreate, UserLogin
from app.services.security import hash_password, verify_password
from app.database import get_db
from app.models.user import User
from app.services.rbac import require_role
from app.models.employee import EmployeeProfile
from app.schemas.employee import (
    EmployeeProfileCreate,
    EmployeeProfileUpdate
)
from app.models.department import Department
from app.schemas.department import (
    DepartmentCreate,
    DepartmentResponse
)
from app.models.device import Device
from app.schemas.device import (
    DeviceCreate,
    DeviceResponse
)


router = APIRouter()

# oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")


@router.get("/auth/google/login")
async def google_login(request: Request):
    redirect_uri = request.url_for("google_callback")

    print("Redirect URI:", redirect_uri)

    return await oauth.google.authorize_redirect(
        request,
        redirect_uri
    )


@router.get("/auth/google/callback", name="google_callback")
async def google_callback(
    request: Request,
    db: Session = Depends(get_db)
):

    token = await oauth.google.authorize_access_token(request)

    user_info = token["userinfo"]

    db_user = db.query(User).filter(
        User.email == user_info["email"]
    ).first()

    if not db_user:
        db_user = User(
            name=user_info["name"],
            email=user_info["email"],
            password=None,
            role="employee"
        )

        db.add(db_user)
        db.commit()
        db.refresh(db_user)

    token = create_access_token(
        {
            "sub": db_user.email,
            "role": db_user.role
        }
    )

    return {
        "message": "Google login successful",
        "access_token": token,
        "token_type": "bearer"
    }



@router.post("/register")
def register_user(
    user: UserCreate,
    db: Session = Depends(get_db)
    ):
    existing_user = db.query(User).filter(User.email == user.email).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    hashed_password = hash_password(user.password)

    new_user = User(
        name=user.name,
        email=user.email,
        password=hashed_password,
        role=user.role.value
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    is_valid = verify_password(user.password, hashed_password)

    print(f"Original Password: {user.password}")
    print(f"Hashed Password: {hashed_password}")
    print(f"Password Verified: {is_valid}")
    
    return {
        "message": "User registered successfully!",
        "user": {
            "name": new_user.name,
            "email": new_user.email,
            "role": new_user.role
        }
    }

@router.post("/login")
def login_user(
    user: UserLogin,
    db: Session = Depends(get_db)
):
    db_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if not db_user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    if not verify_password(
        user.password,
        db_user.password
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid password"
        )

    token = create_access_token(
        {
            "sub": db_user.email,
            "role": db_user.role
        }
    )

    return {
        "message": "Login successful",
        "access_token": token,
        "token_type": "bearer"
    }

@router.get("/profile")
def get_profile(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_user = db.query(User).filter(
        User.email == current_user["sub"]
    ).first()

    if not db_user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return {
        "message": "Profile fetched successfully",
        "user": {
            "name": db_user.name,
            "email": db_user.email,
            "role": db_user.role
        }
    }


@router.post("/employee/profile")
def create_employee_profile(
    profile: EmployeeProfileCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_user = db.query(User).filter(
        User.email == current_user["sub"]
    ).first()

    if not db_user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    existing_profile = db.query(EmployeeProfile).filter(
        EmployeeProfile.user_id == db_user.id
    ).first()

    if existing_profile:
        raise HTTPException(
            status_code=400,
            detail="Employee profile already exists"
        )

    employee = EmployeeProfile(
        user_id=db_user.id,
        employee_id=profile.employee_id,
        department_id=profile.department_id,
        designation=profile.designation,
        manager=profile.manager,
        device_information=profile.device_information,
        access_privileges=profile.access_privileges
    )

    db.add(employee)
    db.commit()
    db.refresh(employee)

    return {
        "message": "Employee profile created successfully",
        "profile": employee
    }


@router.get("/employee/profile")
def get_employee_profile(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_user = db.query(User).filter(
        User.email == current_user["sub"]
    ).first()

    if not db_user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    employee = db.query(EmployeeProfile).filter(
        EmployeeProfile.user_id == db_user.id
    ).first()

    if not employee:
        raise HTTPException(
            status_code=404,
            detail="Employee profile not found"
        )

    return {
        "message": "Employee profile fetched successfully",
        "profile": employee
    }


@router.put("/employee/profile")
def update_employee_profile(
    profile: EmployeeProfileUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_user = db.query(User).filter(
        User.email == current_user["sub"]
    ).first()

    if not db_user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    employee = db.query(EmployeeProfile).filter(
        EmployeeProfile.user_id == db_user.id
    ).first()

    if not employee:
        raise HTTPException(
            status_code=404,
            detail="Employee profile not found"
        )

    employee.department_id = profile.department_id
    employee.designation = profile.designation
    employee.manager = profile.manager
    employee.device_information = profile.device_information
    employee.access_privileges = profile.access_privileges

    db.commit()
    db.refresh(employee)

    return {
        "message": "Employee profile updated successfully",
        "profile": employee
    }


@router.delete("/employee/profile")
def delete_employee_profile(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_user = db.query(User).filter(
        User.email == current_user["sub"]
    ).first()

    if not db_user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    employee = db.query(EmployeeProfile).filter(
        EmployeeProfile.user_id == db_user.id
    ).first()

    if not employee:
        raise HTTPException(
            status_code=404,
            detail="Employee profile not found"
        )

    db.delete(employee)
    db.commit()

    return {
        "message": "Employee profile deleted successfully"
    }


@router.post("/department")
def create_department(
    department: DepartmentCreate,
    db: Session = Depends(get_db)
):
    existing_department = db.query(Department).filter(
        Department.name == department.name
    ).first()

    if existing_department:
        raise HTTPException(
            status_code=400,
            detail="Department already exists"
        )

    new_department = Department(
        name=department.name,
        description=department.description
    )

    db.add(new_department)
    db.commit()
    db.refresh(new_department)

    return {
        "message": "Department created successfully",
        "department": new_department
    }



@router.post("/device")
def create_device(
    device: DeviceCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_user = db.query(User).filter(
        User.email == current_user["sub"]
    ).first()

    if not db_user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    employee = db.query(EmployeeProfile).filter(
        EmployeeProfile.user_id == db_user.id
    ).first()

    if not employee:
        raise HTTPException(
            status_code=404,
            detail="Employee profile not found"
        )

    existing_device = db.query(Device).filter(
        Device.serial_number == device.serial_number
    ).first()

    if existing_device:
        raise HTTPException(
            status_code=400,
            detail="Device already exists"
        )

    new_device = Device(
        employee_id=employee.id,
        device_name=device.device_name,
        device_type=device.device_type,
        serial_number=device.serial_number,
        operating_system=device.operating_system,
        status=device.status
    )

    db.add(new_device)
    db.commit()
    db.refresh(new_device)

    return {
        "message": "Device registered successfully",
        "device": new_device
    }


@router.get("/device")
def get_device(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_user = db.query(User).filter(
        User.email == current_user["sub"]
    ).first()

    if not db_user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    employee = db.query(EmployeeProfile).filter(
        EmployeeProfile.user_id == db_user.id
    ).first()

    if not employee:
        raise HTTPException(
            status_code=404,
            detail="Employee profile not found"
        )

    device = db.query(Device).filter(
        Device.employee_id == employee.id
    ).first()

    if not device:
        raise HTTPException(
            status_code=404,
            detail="Device not found"
        )

    return {
        "message": "Device fetched successfully",
        "device": device
    }


@router.put("/device")
def update_device(
    device: DeviceCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_user = db.query(User).filter(
        User.email == current_user["sub"]
    ).first()

    if not db_user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    employee = db.query(EmployeeProfile).filter(
        EmployeeProfile.user_id == db_user.id
    ).first()

    if not employee:
        raise HTTPException(
            status_code=404,
            detail="Employee profile not found"
        )

    db_device = db.query(Device).filter(
        Device.employee_id == employee.id
    ).first()

    if not db_device:
        raise HTTPException(
            status_code=404,
            detail="Device not found"
        )

    db_device.device_name = device.device_name
    db_device.device_type = device.device_type
    db_device.serial_number = device.serial_number
    db_device.operating_system = device.operating_system
    db_device.status = device.status

    db.commit()
    db.refresh(db_device)

    return {
        "message": "Device updated successfully",
        "device": db_device
    }


@router.delete("/device")
def delete_device(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_user = db.query(User).filter(
        User.email == current_user["sub"]
    ).first()

    if not db_user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    employee = db.query(EmployeeProfile).filter(
        EmployeeProfile.user_id == db_user.id
    ).first()

    if not employee:
        raise HTTPException(
            status_code=404,
            detail="Employee profile not found"
        )

    device = db.query(Device).filter(
        Device.employee_id == employee.id
    ).first()

    if not device:
        raise HTTPException(
            status_code=404,
            detail="Device not found"
        )

    db.delete(device)
    db.commit()

    return {
        "message": "Device deleted successfully"
    }


@router.get("/analyst")
def analyst_dashboard(
    current_user: dict = Depends(
        require_role("Security Analyst")
    )
):
    return {
        "message": "Welcome Security Analyst",
        "user": current_user
    }


@router.get("/manager")
def manager_dashboard(
    current_user: dict = Depends(
        require_role("Security Manager")
    )
):
    return {
        "message": "Welcome Security Manager",
        "user": current_user
    }


@router.get("/admin")
def admin_dashboard(
    current_user: dict = Depends(
        require_role("Administrator")
    )
):
    return {
        "message": "Welcome Administrator",
        "user": current_user
    }