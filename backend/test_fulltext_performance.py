"""
Performance test for full-text search implementation.
Tests search performance before and after full-text search optimization.
"""
import time
from sqlalchemy import create_engine, or_, text, select
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, JSON

# Create a simple Base for this test
Base = declarative_base()

# Read connection string from environment or use default
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/diagnostic_codes")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

# Define a minimal DiagnosticCode model for testing
class DiagnosticCode(Base):
    __tablename__ = "diagnostic_codes"
    
    id = Column(Integer, primary_key=True)
    code = Column(String(50))
    description = Column(Text)
    category = Column(String(100))
    severity = Column(String(50))

def test_old_ilike_search(db, search_term: str):
    """Test old ILIKE-based search performance."""
    start = time.time()
    search_pattern = f"%{search_term}%"
    results = db.query(DiagnosticCode).filter(
        or_(
            DiagnosticCode.code.ilike(search_pattern),
            DiagnosticCode.description.ilike(search_pattern),
        )
    ).limit(20).all()
    elapsed = time.time() - start
    return elapsed, len(results)

def test_fulltext_search(db, search_term: str):
    """Test new full-text search performance."""
    start = time.time()
    search_pattern = f"%{search_term}%"
    search_tsquery = " & ".join(search_term.split())
    
    results = db.query(DiagnosticCode).filter(
        or_(
            DiagnosticCode.code.ilike(search_pattern),
            text("description_tsv @@ to_tsquery('english', :search_term)")
        )
    ).params(search_term=search_tsquery).limit(20).all()
    elapsed = time.time() - start
    return elapsed, len(results)

def run_performance_tests():
    """Run comprehensive performance tests."""
    db = SessionLocal()
    
    # Test various search terms
    test_terms = [
        "diabetes",
        "heart",
        "respiratory",
        "infection",
        "chronic",
        "acute pain",
        "disorder",
        "syndrome"
    ]
    
    print("=" * 80)
    print("FULL-TEXT SEARCH PERFORMANCE TEST")
    print("=" * 80)
    print(f"\nTesting with {db.query(DiagnosticCode).count():,} diagnostic codes\n")
    
    total_old = 0
    total_new = 0
    
    print(f"{'Search Term':<20} {'Old (ILIKE)':<15} {'New (FTS)':<15} {'Speedup':<15} {'Results'}")
    print("-" * 80)
    
    for term in test_terms:
        # Run old search
        old_time, old_count = test_old_ilike_search(db, term)
        total_old += old_time
        
        # Run new search
        new_time, new_count = test_fulltext_search(db, term)
        total_new += new_time
        
        # Calculate speedup
        speedup = old_time / new_time if new_time > 0 else 0
        
        print(f"{term:<20} {old_time*1000:>10.2f}ms {new_time*1000:>10.2f}ms {speedup:>10.2f}x {new_count:>10}")
    
    print("-" * 80)
    avg_old = total_old / len(test_terms)
    avg_new = total_new / len(test_terms)
    avg_speedup = avg_old / avg_new if avg_new > 0 else 0
    
    print(f"{'AVERAGE':<20} {avg_old*1000:>10.2f}ms {avg_new*1000:>10.2f}ms {avg_speedup:>10.2f}x")
    print("\n" + "=" * 80)
    print(f"Overall Performance Improvement: {avg_speedup:.1f}x faster")
    print("=" * 80)
    
    db.close()

if __name__ == "__main__":
    run_performance_tests()
