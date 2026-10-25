"""One-command evaluation script for Sigil."""
import json
from sigil.db import engine, Base, SessionLocal
from sigil.evaluation import run_evaluation_benchmark

def main():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        print("=" * 80)
        print("SIGIL IDENTITY DRIFT DETECTION - COMPARATIVE BENCHMARK RUN")
        print("=" * 80)
        report = run_evaluation_benchmark(db)
        print(f"Total Scenarios Evaluated: {report['total_scenarios']} (Violations: {report['total_violations']}, Benign: {report['total_benign']})\n")

        print(f"{'System / Architecture':<42} | {'Prec':<6} | {'Recall':<6} | {'FPR':<6} | {'Prev%':<6} | {'Legit%':<6} | {'Lat(ms)':<7}")
        print("-" * 88)
        for comp in report["comparisons"]:
            print(
                f"{comp['system_name']:<42} | "
                f"{comp['precision_pct']:<5.1f}% | "
                f"{comp['recall_pct']:<5.1f}% | "
                f"{comp['false_positive_rate_pct']:<5.1f}% | "
                f"{comp['prevention_rate_pct']:<5.1f}% | "
                f"{comp['legitimate_task_completion_pct']:<5.1f}% | "
                f"{comp['avg_latency_ms']:<7.2f}"
            )
        print("=" * 88)
    finally:
        db.close()

if __name__ == "__main__":
    main()
