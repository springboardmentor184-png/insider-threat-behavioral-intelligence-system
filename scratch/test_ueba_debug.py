import asyncio
from backend.core.database import AsyncSessionLocal
from backend.services.ueba_engine import UEBAEngineService

async def test_ueba():
    async with AsyncSessionLocal() as db:
        preds = await UEBAEngineService.predict_threat_trends(db)
        print(f"PREDICTIONS COUNT: {len(preds)}")
        for p in preds:
            print(p)
        
        if preds:
            emp_id = preds[0]['employee_id']
            comp = await UEBAEngineService.get_peer_group_comparison(db, emp_id)
            print("PEER COMP FOR TOP EMP:", comp)

asyncio.run(test_ueba())
