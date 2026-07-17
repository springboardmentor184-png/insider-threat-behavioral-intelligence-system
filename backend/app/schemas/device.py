from pydantic import BaseModel


class DeviceCreate(BaseModel):
    device_name: str
    device_type: str
    serial_number: str
    operating_system: str
    status: str


class DeviceResponse(BaseModel):
    id: int
    employee_id: int
    device_name: str
    device_type: str
    serial_number: str
    operating_system: str
    status: str

    class Config:
        from_attributes = True