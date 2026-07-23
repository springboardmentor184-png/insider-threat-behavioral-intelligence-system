from app.main import app

behavior_routes = [r for r in app.routes if hasattr(r, 'path') and '/behavior' in r.path]
print(f"Found {len(behavior_routes)} behavior routes:")
for r in behavior_routes:
    print(f"  {r.path} -> {r.methods if hasattr(r, 'methods') else 'N/A'}")

print("\n--- Testing direct import ---")
from app.api.v1.behavior import router
print(f"Router has {len(router.routes)} routes:")
for r in router.routes:
    print(f"  {r.path}")
