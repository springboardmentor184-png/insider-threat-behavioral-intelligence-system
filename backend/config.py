import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    # Flask Security
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key-12345')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'dev-jwt-secret-key-12345')
    DEBUG = os.environ.get('DEBUG', 'True').lower() in ('true', '1', 't')
    
    # Configurable Risk Scoring Weights
    WEIGHT_LATE_LOGIN = int(os.environ.get('WEIGHT_LATE_LOGIN', 10))
    WEIGHT_WEEKEND_LOGIN = int(os.environ.get('WEIGHT_WEEKEND_LOGIN', 10))
    WEIGHT_FAILED_LOGINS = int(os.environ.get('WEIGHT_FAILED_LOGINS', 15))
    WEIGHT_USB_USAGE = int(os.environ.get('WEIGHT_USB_USAGE', 15))
    WEIGHT_LARGE_DOWNLOAD = int(os.environ.get('WEIGHT_LARGE_DOWNLOAD', 30))
    WEIGHT_SENSITIVE_FILE_ACCESS = int(os.environ.get('WEIGHT_SENSITIVE_FILE_ACCESS', 25))
    WEIGHT_EXCESSIVE_EMAIL = int(os.environ.get('WEIGHT_EXCESSIVE_EMAIL', 15))
    WEIGHT_UNUSUAL_WEB = int(os.environ.get('WEIGHT_UNUSUAL_WEB', 15))
    WEIGHT_PRIVILEGE_ESCALATION = int(os.environ.get('WEIGHT_PRIVILEGE_ESCALATION', 20))
    WEIGHT_RESTRICTED_FOLDER = int(os.environ.get('WEIGHT_RESTRICTED_FOLDER', 20))
    
    # Risk threshold for auto-investigations
    AUTO_INVESTIGATION_THRESHOLD = int(os.environ.get('AUTO_INVESTIGATION_THRESHOLD', 70))

    # Critical-threat email notifications. Disabled until SMTP is configured.
    SMTP_ENABLED = os.environ.get('SMTP_ENABLED', 'False').lower() in ('true', '1', 't', 'yes')
    SMTP_HOST = os.environ.get('SMTP_HOST')
    SMTP_PORT = int(os.environ.get('SMTP_PORT', '587'))
    SMTP_USERNAME = os.environ.get('SMTP_USERNAME')
    SMTP_PASSWORD = os.environ.get('SMTP_PASSWORD')
    SMTP_FROM_EMAIL = os.environ.get('SMTP_FROM_EMAIL')
    SMTP_USE_TLS = os.environ.get('SMTP_USE_TLS', 'True').lower() in ('true', '1', 't', 'yes')
    ADMIN_ALERT_EMAILS = os.environ.get('ADMIN_ALERT_EMAILS', '')
    
    # Database Configuration
    MYSQL_USER = os.environ.get('MYSQL_USER')
    MYSQL_PASSWORD = os.environ.get('MYSQL_PASSWORD')
    MYSQL_HOST = os.environ.get('MYSQL_HOST')
    MYSQL_PORT = os.environ.get('MYSQL_PORT', '3306')
    MYSQL_DATABASE = os.environ.get('MYSQL_DATABASE')
    
    SQLITE_FALLBACK = os.environ.get('SQLITE_FALLBACK', 'True').lower() in ('true', '1', 't')
    
    # SQLAlchemy configurations
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # JWT Configurations
    JWT_ACCESS_TOKEN_EXPIRES = 3600  # 1 hour
    JWT_REFRESH_TOKEN_EXPIRES = 2592000  # 30 days
    JWT_ERROR_MESSAGE_KEY = 'message'
    
    @property
    def SQLALCHEMY_DATABASE_URI(self):
        # Check if MySQL variables are fully set (ignoring placeholder/default values)
        has_mysql = all([
            self.MYSQL_USER,
            self.MYSQL_PASSWORD,
            self.MYSQL_DATABASE,
            self.MYSQL_USER != 'root' or self.MYSQL_PASSWORD != 'yourpassword'  # Check if they are changed from defaults
        ])
        
        if has_mysql:
            return f"mysql+pymysql://{self.MYSQL_USER}:{self.MYSQL_PASSWORD}@{self.MYSQL_HOST}:{self.MYSQL_PORT}/{self.MYSQL_DATABASE}"
        
        if self.SQLITE_FALLBACK:
            base_dir = os.path.abspath(os.path.dirname(__file__))
            return f"sqlite:///{os.path.join(base_dir, 'insider_threat.db')}"
            
        raise ValueError("MySQL Database is not configured, and SQLITE_FALLBACK is disabled.")

# Instantiate config
config_instance = Config()
