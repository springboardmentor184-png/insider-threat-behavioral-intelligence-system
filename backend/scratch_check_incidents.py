import asyncio
from backend.core.database import AsyncSessionLocal
from sqlalchemy import select, func
from backend.models.dataset import Incident, Employee, BehavioralAnomaly
from backend.services.investigation_service import InvestigationService

async def main():
    async with AsyncSessionLocal() as db:
        res = await db.execute(select(func.count(Incident.id)))
        count = res.scalar() or 0
        print(f"Current Incident Count in DB: {count}")

        if count == 0:
            print("Seeding initial investigation cases for high-risk employees...")
            # Find top employees with anomalies
            anom_stmt = select(BehavioralAnomaly.employee_id).group_by(BehavioralAnomaly.employee_id).order_by(func.count(BehavioralAnomaly.id).desc()).limit(5)
            anom_emp_ids = list((await db.execute(anom_stmt)).scalars().all())
            print("Found employees with anomalies:", anom_emp_ids)

            if not anom_emp_ids:
                # Fallback to any employees
                emp_stmt = select(Employee.employee_id).limit(5)
                anom_emp_ids = list((await db.execute(emp_stmt)).scalars().all())

            for emp_id in anom_emp_ids:
                clean_id = emp_id.replace("EMP-", "").strip()
                emp = (await db.execute(select(Employee).where((Employee.employee_id == emp_id) | (Employee.employee_id == clean_id)))).scalar_one_or_none()
                emp_name = emp.full_name if emp else f"Employee {clean_id}"
                
                inc = await InvestigationService.create_incident(
                    db,
                    employee_id=clean_id,
                    title=f"Behavioral Threat Investigation: {emp_name}",
                    description=f"Auto-seeded initial threat case for {emp_name} (EMP-{clean_id}) monitoring off-hours data transfers and unusual logon patterns.",
                    severity="High",
                    created_by="ITBIS Threat Engine",
                    assigned_analyst="analyst@itbis.com"
                )
                print(f"Created Incident Case {inc.incident_number} for EMP-{clean_id} ({emp_name})")

if __name__ == "__main__":
    asyncio.run(main())
