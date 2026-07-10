"""
Enum definitions for the application.
"""

import enum


class UserRole(str, enum.Enum):
    SECURITY_ANALYST = "security_analyst"
    SOC_ENGINEER = "soc_engineer"
    SECURITY_MANAGER = "security_manager"
    ADMINISTRATOR = "administrator"
