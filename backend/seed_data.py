"""
Seed script to populate the database with sample diagnostic codes
"""
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.models.diagnostic_code import DiagnosticCode
from app.db.database import Base
import os


# Sample diagnostic codes data
SAMPLE_CODES = [
    {
        "code": "ICD-E11.9",
        "description": "Type 2 diabetes mellitus without complications",
        "category": "ENDOCRINE",
        "subcategory": "Diabetes",
        "severity": "medium",
        "is_active": True
    },
    {
        "code": "ICD-I10",
        "description": "Essential (primary) hypertension",
        "category": "CARDIOVASCULAR",
        "subcategory": "Hypertension",
        "severity": "medium",
        "is_active": True
    },
    {
        "code": "ICD-J45.909",
        "description": "Unspecified asthma, uncomplicated",
        "category": "RESPIRATORY",
        "subcategory": "Asthma",
        "severity": "medium",
        "is_active": True
    },
    {
        "code": "ERR-DB001",
        "description": "Database connection timeout",
        "category": "ERROR",
        "subcategory": "Database",
        "severity": "high",
        "is_active": True
    },
    {
        "code": "ERR-AUTH001",
        "description": "Authentication failed - Invalid credentials",
        "category": "ERROR",
        "subcategory": "Authentication",
        "severity": "high",
        "is_active": True
    },
    {
        "code": "ERR-NET001",
        "description": "Network timeout occurred",
        "category": "ERROR",
        "subcategory": "Network",
        "severity": "medium",
        "is_active": True
    },
    {
        "code": "WARN-MEM001",
        "description": "Memory usage above 80%",
        "category": "WARNING",
        "subcategory": "Performance",
        "severity": "low",
        "is_active": True
    },
    {
        "code": "ICD-M79.3",
        "description": "Panniculitis, unspecified",
        "category": "MUSCULOSKELETAL",
        "subcategory": "Soft Tissue",
        "severity": "low",
        "is_active": True
    },
    {
        "code": "ICD-R50.9",
        "description": "Fever, unspecified",
        "category": "SYMPTOMS",
        "subcategory": "General",
        "severity": "medium",
        "is_active": True
    },
    {
        "code": "ICD-K21.9",
        "description": "Gastro-esophageal reflux disease without esophagitis",
        "category": "DIGESTIVE",
        "subcategory": "Esophagus",
        "severity": "low",
        "is_active": True
    },
    {
        "code": "ERR-API001",
        "description": "API rate limit exceeded",
        "category": "ERROR",
        "subcategory": "API",
        "severity": "medium",
        "is_active": True
    },
    {
        "code": "INFO-SYS001",
        "description": "System maintenance scheduled",
        "category": "INFO",
        "subcategory": "System",
        "severity": "low",
        "is_active": True
    },
    {
        "code": "ICD-F41.9",
        "description": "Anxiety disorder, unspecified",
        "category": "MENTAL",
        "subcategory": "Anxiety",
        "severity": "medium",
        "is_active": True
    },
    {
        "code": "ICD-N18.3",
        "description": "Chronic kidney disease, stage 3",
        "category": "RENAL",
        "subcategory": "CKD",
        "severity": "high",
        "is_active": True
    },
    {
        "code": "ERR-FILE001",
        "description": "File not found",
        "category": "ERROR",
        "subcategory": "FileSystem",
        "severity": "medium",
        "is_active": True
    }
]


async def seed_database():
    """Seed the database with sample diagnostic codes"""
    
    # Create async engine
    db_url = settings.DATABASE_URL.replace('postgresql://', 'postgresql+asyncpg://')
    # Remove sslmode and channel_binding as asyncpg uses connect_args instead
    db_url = db_url.split('?')[0]
    
    engine = create_async_engine(
        db_url,
        echo=True,
        connect_args={
            'ssl': 'require',
            'server_settings': {
                'jit': 'off'
            }
        }
    )
    
    # Create async session
    async_session = sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )
    
    async with async_session() as session:
        try:
            # Check if data already exists
            from sqlalchemy import select
            result = await session.execute(select(DiagnosticCode).limit(1))
            existing = result.scalar_one_or_none()
            
            if existing:
                print("⚠️  Database already contains data. Skipping seed.")
                print("   To reseed, delete existing data first.")
                return
            
            # Add sample codes
            print("🌱 Seeding database with sample diagnostic codes...")
            for code_data in SAMPLE_CODES:
                code = DiagnosticCode(**code_data)
                session.add(code)
            
            await session.commit()
            print(f"✅ Successfully seeded {len(SAMPLE_CODES)} diagnostic codes!")
            
        except Exception as e:
            print(f"❌ Error seeding database: {e}")
            await session.rollback()
            raise
        finally:
            await engine.dispose()


if __name__ == "__main__":
    print("=" * 60)
    print("Diagnostic Code Assistant - Database Seeding")
    print("=" * 60)
    asyncio.run(seed_database())
