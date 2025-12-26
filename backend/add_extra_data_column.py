"""Add extra_data column to diagnostic_codes table."""
from sqlalchemy import text
from app.db.database import engine

with engine.connect() as conn:
    conn.execute(text('ALTER TABLE diagnostic_codes ADD COLUMN IF NOT EXISTS extra_data JSON'))
    conn.commit()
    print("✅ Added extra_data column to diagnostic_codes table")
