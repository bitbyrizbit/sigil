"""One-command evaluation script for Sigil."""
import json
from sigil.db import engine, Base, SessionLocal
from sigil.evaluation import run_evaluation_benchmark

def main():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        print("=" * 96)
        print("SIGIL IDENTITY DRIFT DETECTION - COMPREHENSIVE BENCHMARK RUN")
        print("Tagline: Authenticated isn't innocent")
        print("=" * 96)
        report = run_evaluation_benchmark(db)
        print(
            f"Dataset Composition: {report['total_scenarios']} Scenarios | "
            f"Attacks: {report['total_attacks']} | "
            f"Legitimate: {report['total_legitimate']} | "
            f"Ambiguous Cases: {report['total_ambiguous']} | "
            f"Additional Edge Case Suite: {report.get('total_additional', 3)}\n"
        )

        print(f"{'System / Architecture':<42} | {'Prec':<6} | {'Recall':<6} | {'FPR':<6} | {'Prev%':<6} | {'Imm%':<6} | {'Held%':<6} | {'Lat(ms)':<7}")
        print("-" * 105)
        for comp in report["comparisons"]:
            print(
                f"{comp['system_name']:<42} | "
                f"{comp['precision_pct']:<5.1f}% | "
                f"{comp['recall_pct']:<5.1f}% | "
                f"{comp['false_positive_rate_pct']:<5.1f}% | "
                f"{comp['prevention_rate_pct']:<5.1f}% | "
                f"{comp.get('immediate_completion_pct', comp['legitimate_task_completion_pct']):<5.1f}% | "
                f"{comp.get('held_for_review_pct', 0.0):<5.1f}% | "
                f"{comp['avg_latency_ms']:<7.2f}"
            )
        print("=" * 105)

        print("\n" + "=" * 96)
        print("PER-SCENARIO-TYPE BREAKDOWN (Honest Empirical Performance by Threat Category)")
        print("=" * 96)
        print(f"{'Threat / Workload Category':<35} | {'Cases':<6} | {'Baseline A':<14} | {'Baseline B':<14} | {'Sigil Layer':<14}")
        print("-" * 96)
        for cat in report.get("category_breakdown", []):
            print(
                f"{cat['name']:<35} | "
                f"{cat['total']:<6} | "
                f"{cat['baseline_a_caught']}/{cat['total']} caught      | "
                f"{cat['baseline_b_caught']}/{cat['total']} caught      | "
                f"{cat['sigil_caught']}/{cat['total']} caught"
            )
        print("=" * 96)
    finally:
        db.close()

if __name__ == "__main__":
    main()
