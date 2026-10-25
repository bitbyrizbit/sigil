import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sigil.db import Base
from sigil.scenarios import run_all_scenarios
from sigil.evaluation import run_evaluation_benchmark

@pytest.fixture
def test_db():
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    TestingSession = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = TestingSession()
    yield session
    session.close()

def test_all_scenarios_execute(test_db):
    results = run_all_scenarios(test_db)
    assert len(results) >= 7
    # Verify scenarios A to F passed
    scenario_map = {r["scenario_id"]: r for r in results}
    assert scenario_map["scenario_normal"]["passed"]
    assert scenario_map["scenario_a"]["passed"]
    assert scenario_map["scenario_b"]["passed"]
    assert scenario_map["scenario_c"]["passed"]
    assert scenario_map["scenario_d"]["passed"]
    assert scenario_map["scenario_e"]["passed"]
    assert scenario_map["scenario_f"]["passed"]

def test_evaluation_benchmark_metrics(test_db):
    report = run_evaluation_benchmark(test_db)
    assert report["total_scenarios"] >= 7
    comparisons = {c["system_name"]: c for c in report["comparisons"]}

    # Sigil should achieve superior prevention and recall without sacrificing legitimate completion
    sigil_res = comparisons["Sigil (Context-Aware Identity Drift Layer)"]
    assert sigil_res["recall_pct"] >= 80.0
    assert sigil_res["prevention_rate_pct"] >= 80.0
    assert sigil_res["legitimate_task_completion_pct"] >= 66.0
