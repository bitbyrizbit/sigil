"""One-command seeding script for Sigil."""
from sigil.db import engine, Base, SessionLocal
from sigil.registry import seed_registry
from sigil.scenarios import run_all_scenarios

def main():
    print("[*] Initializing Sigil Database Schema...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        print("[*] Seeding default agents and role policies...")
        seed_registry(db)
        print("[*] Executing test scenarios to establish baseline telemetry...")
        results = run_all_scenarios(db)
        print(f"[+] Seeding complete! {len(results)} scenario events processed through the gateway.")
    finally:
        db.close()

if __name__ == "__main__":
    main()
