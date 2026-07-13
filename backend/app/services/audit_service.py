# from sqlalchemy.orm import Session

# from app.models.audit_log import AuditLog


# def create_audit_log(
#     db: Session,
#     user_id: int,
#     action: str,
#     status: str,
#     description: str = None
# ):

#     log = AuditLog(
#         user_id=user_id,
#         action=action,
#         status=status,
#         description=description
#     )

#     db.add(log)
#     db.commit()

#     return log

from sqlalchemy.orm import Session
from app.models.audit_log import AuditLog


def create_audit_log(
    db: Session,
    user_id: int,
    action: str,
    status: str,
    description: str = None
):
    try:
        log = AuditLog(
            user_id=user_id,
            action=action,
            status=status,
            description=description
        )

        db.add(log)
        db.commit()
        db.refresh(log)

        print("✅ Audit log inserted successfully.")

        return log

    except Exception as e:
        db.rollback()

        print("❌ Audit Log Error:")
        print(type(e))
        print(e)

        raise



def get_all_logs(db: Session):

    return db.query(AuditLog).order_by(
        AuditLog.timestamp.desc()
    ).all()


def get_logs_by_user(
    db: Session,
    user_id: int
):

    return db.query(AuditLog).filter(
        AuditLog.user_id == user_id
    ).order_by(
        AuditLog.timestamp.desc()
    ).all()