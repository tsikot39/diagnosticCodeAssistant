"""
Seed script to populate the database with realistic amounts of data for dashboard/analytics
"""
import asyncio
from datetime import datetime, timedelta
import random
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select, text
from app.core.config import settings
from app.models.diagnostic_code import DiagnosticCode
from app.models.analytics import AnalyticsEvent
from app.models.user import User
from app.models.organization import Organization


# Expanded diagnostic codes (100+ codes)
SAMPLE_CODES = [
    # Endocrine Disorders (20 codes)
    {"code": "ICD-E11.9", "description": "Type 2 diabetes mellitus without complications", "category": "ENDOCRINE", "subcategory": "Diabetes", "severity": "medium", "is_active": True},
    {"code": "ICD-E11.65", "description": "Type 2 diabetes with hyperglycemia", "category": "ENDOCRINE", "subcategory": "Diabetes", "severity": "high", "is_active": True},
    {"code": "ICD-E11.21", "description": "Type 2 diabetes with diabetic nephropathy", "category": "ENDOCRINE", "subcategory": "Diabetes", "severity": "high", "is_active": True},
    {"code": "ICD-E11.22", "description": "Type 2 diabetes with diabetic chronic kidney disease", "category": "ENDOCRINE", "subcategory": "Diabetes", "severity": "high", "is_active": True},
    {"code": "ICD-E11.29", "description": "Type 2 diabetes with other diabetic kidney complication", "category": "ENDOCRINE", "subcategory": "Diabetes", "severity": "high", "is_active": True},
    {"code": "ICD-E10.9", "description": "Type 1 diabetes mellitus without complications", "category": "ENDOCRINE", "subcategory": "Diabetes", "severity": "high", "is_active": True},
    {"code": "ICD-E10.65", "description": "Type 1 diabetes with hyperglycemia", "category": "ENDOCRINE", "subcategory": "Diabetes", "severity": "critical", "is_active": True},
    {"code": "ICD-E03.9", "description": "Hypothyroidism, unspecified", "category": "ENDOCRINE", "subcategory": "Thyroid", "severity": "medium", "is_active": True},
    {"code": "ICD-E05.90", "description": "Thyrotoxicosis, unspecified", "category": "ENDOCRINE", "subcategory": "Thyroid", "severity": "high", "is_active": True},
    {"code": "ICD-E78.5", "description": "Hyperlipidemia, unspecified", "category": "ENDOCRINE", "subcategory": "Lipid", "severity": "medium", "is_active": True},
    {"code": "ICD-E66.9", "description": "Obesity, unspecified", "category": "ENDOCRINE", "subcategory": "Metabolic", "severity": "medium", "is_active": True},
    {"code": "ICD-E66.01", "description": "Morbid (severe) obesity due to excess calories", "category": "ENDOCRINE", "subcategory": "Metabolic", "severity": "high", "is_active": True},
    {"code": "ICD-E27.40", "description": "Unspecified adrenocortical insufficiency", "category": "ENDOCRINE", "subcategory": "Adrenal", "severity": "high", "is_active": True},
    {"code": "ICD-E21.0", "description": "Primary hyperparathyroidism", "category": "ENDOCRINE", "subcategory": "Parathyroid", "severity": "medium", "is_active": True},
    {"code": "ICD-E22.0", "description": "Acromegaly and pituitary gigantism", "category": "ENDOCRINE", "subcategory": "Pituitary", "severity": "medium", "is_active": True},
    {"code": "ICD-E23.0", "description": "Hypopituitarism", "category": "ENDOCRINE", "subcategory": "Pituitary", "severity": "high", "is_active": True},
    {"code": "ICD-E24.0", "description": "Pituitary-dependent Cushing's disease", "category": "ENDOCRINE", "subcategory": "Pituitary", "severity": "high", "is_active": True},
    {"code": "ICD-E25.0", "description": "Congenital adrenogenital disorders", "category": "ENDOCRINE", "subcategory": "Adrenal", "severity": "high", "is_active": True},
    {"code": "ICD-E26.9", "description": "Hyperaldosteronism, unspecified", "category": "ENDOCRINE", "subcategory": "Adrenal", "severity": "medium", "is_active": True},
    {"code": "ICD-E28.2", "description": "Polycystic ovarian syndrome", "category": "ENDOCRINE", "subcategory": "Gonadal", "severity": "medium", "is_active": True},

    # Cardiovascular Disorders (25 codes)
    {"code": "ICD-I10", "description": "Essential (primary) hypertension", "category": "CARDIOVASCULAR", "subcategory": "Hypertension", "severity": "medium", "is_active": True},
    {"code": "ICD-I11.0", "description": "Hypertensive heart disease with heart failure", "category": "CARDIOVASCULAR", "subcategory": "Hypertension", "severity": "high", "is_active": True},
    {"code": "ICD-I12.9", "description": "Hypertensive chronic kidney disease", "category": "CARDIOVASCULAR", "subcategory": "Hypertension", "severity": "high", "is_active": True},
    {"code": "ICD-I21.9", "description": "Acute myocardial infarction, unspecified", "category": "CARDIOVASCULAR", "subcategory": "Ischemic", "severity": "critical", "is_active": True},
    {"code": "ICD-I21.4", "description": "Non-ST elevation myocardial infarction", "category": "CARDIOVASCULAR", "subcategory": "Ischemic", "severity": "critical", "is_active": True},
    {"code": "ICD-I25.10", "description": "Atherosclerotic heart disease", "category": "CARDIOVASCULAR", "subcategory": "Ischemic", "severity": "high", "is_active": True},
    {"code": "ICD-I48.91", "description": "Unspecified atrial fibrillation", "category": "CARDIOVASCULAR", "subcategory": "Arrhythmia", "severity": "high", "is_active": True},
    {"code": "ICD-I49.9", "description": "Cardiac arrhythmia, unspecified", "category": "CARDIOVASCULAR", "subcategory": "Arrhythmia", "severity": "medium", "is_active": True},
    {"code": "ICD-I50.9", "description": "Heart failure, unspecified", "category": "CARDIOVASCULAR", "subcategory": "Heart Failure", "severity": "critical", "is_active": True},
    {"code": "ICD-I50.21", "description": "Acute systolic heart failure", "category": "CARDIOVASCULAR", "subcategory": "Heart Failure", "severity": "critical", "is_active": True},
    {"code": "ICD-I50.43", "description": "Acute on chronic combined systolic and diastolic heart failure", "category": "CARDIOVASCULAR", "subcategory": "Heart Failure", "severity": "critical", "is_active": True},
    {"code": "ICD-I63.9", "description": "Cerebral infarction, unspecified", "category": "CARDIOVASCULAR", "subcategory": "Cerebrovascular", "severity": "critical", "is_active": True},
    {"code": "ICD-I64", "description": "Stroke, not specified as hemorrhage or infarction", "category": "CARDIOVASCULAR", "subcategory": "Cerebrovascular", "severity": "critical", "is_active": True},
    {"code": "ICD-I70.0", "description": "Atherosclerosis of aorta", "category": "CARDIOVASCULAR", "subcategory": "Vascular", "severity": "medium", "is_active": True},
    {"code": "ICD-I73.9", "description": "Peripheral vascular disease, unspecified", "category": "CARDIOVASCULAR", "subcategory": "Vascular", "severity": "medium", "is_active": True},
    {"code": "ICD-I35.0", "description": "Nonrheumatic aortic stenosis", "category": "CARDIOVASCULAR", "subcategory": "Valvular", "severity": "high", "is_active": True},
    {"code": "ICD-I34.0", "description": "Nonrheumatic mitral insufficiency", "category": "CARDIOVASCULAR", "subcategory": "Valvular", "severity": "high", "is_active": True},
    {"code": "ICD-I42.0", "description": "Dilated cardiomyopathy", "category": "CARDIOVASCULAR", "subcategory": "Cardiomyopathy", "severity": "high", "is_active": True},
    {"code": "ICD-I42.2", "description": "Other hypertrophic cardiomyopathy", "category": "CARDIOVASCULAR", "subcategory": "Cardiomyopathy", "severity": "high", "is_active": True},
    {"code": "ICD-I20.0", "description": "Unstable angina", "category": "CARDIOVASCULAR", "subcategory": "Ischemic", "severity": "high", "is_active": True},
    {"code": "ICD-I20.8", "description": "Other forms of angina pectoris", "category": "CARDIOVASCULAR", "subcategory": "Ischemic", "severity": "medium", "is_active": True},
    {"code": "ICD-I74.3", "description": "Embolism and thrombosis of arteries of lower extremities", "category": "CARDIOVASCULAR", "subcategory": "Vascular", "severity": "critical", "is_active": True},
    {"code": "ICD-I80.3", "description": "Phlebitis and thrombophlebitis of lower extremities", "category": "CARDIOVASCULAR", "subcategory": "Venous", "severity": "medium", "is_active": True},
    {"code": "ICD-I82.90", "description": "Acute embolism and thrombosis of unspecified vein", "category": "CARDIOVASCULAR", "subcategory": "Venous", "severity": "high", "is_active": True},
    {"code": "ICD-I87.2", "description": "Venous insufficiency (chronic)", "category": "CARDIOVASCULAR", "subcategory": "Venous", "severity": "low", "is_active": True},

    # Respiratory Disorders (20 codes)
    {"code": "ICD-J45.909", "description": "Unspecified asthma, uncomplicated", "category": "RESPIRATORY", "subcategory": "Asthma", "severity": "medium", "is_active": True},
    {"code": "ICD-J45.50", "description": "Severe persistent asthma, uncomplicated", "category": "RESPIRATORY", "subcategory": "Asthma", "severity": "high", "is_active": True},
    {"code": "ICD-J45.901", "description": "Unspecified asthma with exacerbation", "category": "RESPIRATORY", "subcategory": "Asthma", "severity": "high", "is_active": True},
    {"code": "ICD-J44.0", "description": "COPD with acute lower respiratory infection", "category": "RESPIRATORY", "subcategory": "COPD", "severity": "high", "is_active": True},
    {"code": "ICD-J44.1", "description": "COPD with acute exacerbation", "category": "RESPIRATORY", "subcategory": "COPD", "severity": "high", "is_active": True},
    {"code": "ICD-J44.9", "description": "COPD, unspecified", "category": "RESPIRATORY", "subcategory": "COPD", "severity": "medium", "is_active": True},
    {"code": "ICD-J43.9", "description": "Emphysema, unspecified", "category": "RESPIRATORY", "subcategory": "COPD", "severity": "medium", "is_active": True},
    {"code": "ICD-J18.9", "description": "Pneumonia, unspecified organism", "category": "RESPIRATORY", "subcategory": "Infection", "severity": "high", "is_active": True},
    {"code": "ICD-J15.9", "description": "Unspecified bacterial pneumonia", "category": "RESPIRATORY", "subcategory": "Infection", "severity": "high", "is_active": True},
    {"code": "ICD-J12.9", "description": "Viral pneumonia, unspecified", "category": "RESPIRATORY", "subcategory": "Infection", "severity": "high", "is_active": True},
    {"code": "ICD-J20.9", "description": "Acute bronchitis, unspecified", "category": "RESPIRATORY", "subcategory": "Infection", "severity": "medium", "is_active": True},
    {"code": "ICD-J42", "description": "Unspecified chronic bronchitis", "category": "RESPIRATORY", "subcategory": "COPD", "severity": "medium", "is_active": True},
    {"code": "ICD-J81.0", "description": "Acute pulmonary edema", "category": "RESPIRATORY", "subcategory": "Edema", "severity": "critical", "is_active": True},
    {"code": "ICD-J96.90", "description": "Respiratory failure, unspecified", "category": "RESPIRATORY", "subcategory": "Failure", "severity": "critical", "is_active": True},
    {"code": "ICD-J96.00", "description": "Acute respiratory failure", "category": "RESPIRATORY", "subcategory": "Failure", "severity": "critical", "is_active": True},
    {"code": "ICD-J96.20", "description": "Acute and chronic respiratory failure", "category": "RESPIRATORY", "subcategory": "Failure", "severity": "critical", "is_active": True},
    {"code": "ICD-J90", "description": "Pleural effusion, not elsewhere classified", "category": "RESPIRATORY", "subcategory": "Pleural", "severity": "medium", "is_active": True},
    {"code": "ICD-J93.0", "description": "Spontaneous tension pneumothorax", "category": "RESPIRATORY", "subcategory": "Pleural", "severity": "critical", "is_active": True},
    {"code": "ICD-J84.9", "description": "Interstitial pulmonary disease, unspecified", "category": "RESPIRATORY", "subcategory": "Interstitial", "severity": "high", "is_active": True},
    {"code": "ICD-J98.4", "description": "Other disorders of lung", "category": "RESPIRATORY", "subcategory": "Other", "severity": "medium", "is_active": True},

    # Mental Health (15 codes)
    {"code": "ICD-F41.9", "description": "Anxiety disorder, unspecified", "category": "MENTAL", "subcategory": "Anxiety", "severity": "medium", "is_active": True},
    {"code": "ICD-F41.0", "description": "Panic disorder", "category": "MENTAL", "subcategory": "Anxiety", "severity": "high", "is_active": True},
    {"code": "ICD-F41.1", "description": "Generalized anxiety disorder", "category": "MENTAL", "subcategory": "Anxiety", "severity": "medium", "is_active": True},
    {"code": "ICD-F43.10", "description": "Post-traumatic stress disorder", "category": "MENTAL", "subcategory": "Trauma", "severity": "high", "is_active": True},
    {"code": "ICD-F32.9", "description": "Major depressive disorder, single episode", "category": "MENTAL", "subcategory": "Depression", "severity": "high", "is_active": True},
    {"code": "ICD-F33.0", "description": "Major depressive disorder, recurrent, mild", "category": "MENTAL", "subcategory": "Depression", "severity": "medium", "is_active": True},
    {"code": "ICD-F33.1", "description": "Major depressive disorder, recurrent, moderate", "category": "MENTAL", "subcategory": "Depression", "severity": "high", "is_active": True},
    {"code": "ICD-F33.2", "description": "Major depressive disorder, recurrent, severe", "category": "MENTAL", "subcategory": "Depression", "severity": "critical", "is_active": True},
    {"code": "ICD-F31.9", "description": "Bipolar disorder, unspecified", "category": "MENTAL", "subcategory": "Bipolar", "severity": "high", "is_active": True},
    {"code": "ICD-F20.9", "description": "Schizophrenia, unspecified", "category": "MENTAL", "subcategory": "Psychotic", "severity": "critical", "is_active": True},
    {"code": "ICD-F10.20", "description": "Alcohol dependence, uncomplicated", "category": "MENTAL", "subcategory": "Substance", "severity": "high", "is_active": True},
    {"code": "ICD-F11.20", "description": "Opioid dependence, uncomplicated", "category": "MENTAL", "subcategory": "Substance", "severity": "critical", "is_active": True},
    {"code": "ICD-F60.3", "description": "Borderline personality disorder", "category": "MENTAL", "subcategory": "Personality", "severity": "high", "is_active": True},
    {"code": "ICD-F84.0", "description": "Autistic disorder", "category": "MENTAL", "subcategory": "Developmental", "severity": "medium", "is_active": True},
    {"code": "ICD-F90.0", "description": "Attention-deficit hyperactivity disorder", "category": "MENTAL", "subcategory": "Developmental", "severity": "medium", "is_active": True},

    # Digestive System (15 codes)
    {"code": "ICD-K21.9", "description": "Gastro-esophageal reflux disease", "category": "DIGESTIVE", "subcategory": "Esophagus", "severity": "low", "is_active": True},
    {"code": "ICD-K25.9", "description": "Gastric ulcer", "category": "DIGESTIVE", "subcategory": "Stomach", "severity": "medium", "is_active": True},
    {"code": "ICD-K29.70", "description": "Gastritis, unspecified", "category": "DIGESTIVE", "subcategory": "Stomach", "severity": "low", "is_active": True},
    {"code": "ICD-K50.90", "description": "Crohn's disease, unspecified", "category": "DIGESTIVE", "subcategory": "Intestine", "severity": "high", "is_active": True},
    {"code": "ICD-K51.90", "description": "Ulcerative colitis, unspecified", "category": "DIGESTIVE", "subcategory": "Intestine", "severity": "high", "is_active": True},
    {"code": "ICD-K58.9", "description": "Irritable bowel syndrome", "category": "DIGESTIVE", "subcategory": "Intestine", "severity": "low", "is_active": True},
    {"code": "ICD-K80.20", "description": "Calculus of gallbladder", "category": "DIGESTIVE", "subcategory": "Biliary", "severity": "medium", "is_active": True},
    {"code": "ICD-K85.9", "description": "Acute pancreatitis", "category": "DIGESTIVE", "subcategory": "Pancreas", "severity": "critical", "is_active": True},
    {"code": "ICD-K86.1", "description": "Other chronic pancreatitis", "category": "DIGESTIVE", "subcategory": "Pancreas", "severity": "high", "is_active": True},
    {"code": "ICD-K70.30", "description": "Alcoholic cirrhosis of liver", "category": "DIGESTIVE", "subcategory": "Liver", "severity": "critical", "is_active": True},
    {"code": "ICD-K74.60", "description": "Unspecified cirrhosis of liver", "category": "DIGESTIVE", "subcategory": "Liver", "severity": "critical", "is_active": True},
    {"code": "ICD-K92.2", "description": "Gastrointestinal hemorrhage", "category": "DIGESTIVE", "subcategory": "General", "severity": "critical", "is_active": True},
    {"code": "ICD-K64.9", "description": "Unspecified hemorrhoids", "category": "DIGESTIVE", "subcategory": "Anus", "severity": "low", "is_active": True},
    {"code": "ICD-K31.89", "description": "Other diseases of stomach and duodenum", "category": "DIGESTIVE", "subcategory": "Stomach", "severity": "low", "is_active": True},
    {"code": "ICD-K63.5", "description": "Polyp of colon", "category": "DIGESTIVE", "subcategory": "Intestine", "severity": "medium", "is_active": True},

    # Renal/Urinary (10 codes)
    {"code": "ICD-N18.3", "description": "Chronic kidney disease, stage 3", "category": "RENAL", "subcategory": "CKD", "severity": "high", "is_active": True},
    {"code": "ICD-N18.4", "description": "Chronic kidney disease, stage 4", "category": "RENAL", "subcategory": "CKD", "severity": "critical", "is_active": True},
    {"code": "ICD-N18.5", "description": "Chronic kidney disease, stage 5", "category": "RENAL", "subcategory": "CKD", "severity": "critical", "is_active": True},
    {"code": "ICD-N17.9", "description": "Acute kidney failure, unspecified", "category": "RENAL", "subcategory": "AKI", "severity": "critical", "is_active": True},
    {"code": "ICD-N39.0", "description": "Urinary tract infection", "category": "RENAL", "subcategory": "Infection", "severity": "medium", "is_active": True},
    {"code": "ICD-N20.0", "description": "Calculus of kidney", "category": "RENAL", "subcategory": "Stone", "severity": "high", "is_active": True},
    {"code": "ICD-N40.0", "description": "Benign prostatic hyperplasia", "category": "RENAL", "subcategory": "Prostate", "severity": "low", "is_active": True},
    {"code": "ICD-N03.9", "description": "Chronic nephritic syndrome", "category": "RENAL", "subcategory": "Nephritis", "severity": "high", "is_active": True},
    {"code": "ICD-N04.9", "description": "Nephrotic syndrome", "category": "RENAL", "subcategory": "Nephrosis", "severity": "high", "is_active": True},
    {"code": "ICD-N31.9", "description": "Neuromuscular dysfunction of bladder", "category": "RENAL", "subcategory": "Bladder", "severity": "medium", "is_active": True},

    # System Errors (15 codes)
    {"code": "ERR-DB001", "description": "Database connection timeout", "category": "ERROR", "subcategory": "Database", "severity": "high", "is_active": True},
    {"code": "ERR-DB002", "description": "Database deadlock detected", "category": "ERROR", "subcategory": "Database", "severity": "critical", "is_active": True},
    {"code": "ERR-DB003", "description": "Database query failed", "category": "ERROR", "subcategory": "Database", "severity": "high", "is_active": True},
    {"code": "ERR-AUTH001", "description": "Authentication failed - Invalid credentials", "category": "ERROR", "subcategory": "Authentication", "severity": "high", "is_active": True},
    {"code": "ERR-AUTH002", "description": "Session expired", "category": "ERROR", "subcategory": "Authentication", "severity": "medium", "is_active": True},
    {"code": "ERR-AUTH003", "description": "Insufficient permissions", "category": "ERROR", "subcategory": "Authentication", "severity": "medium", "is_active": True},
    {"code": "ERR-NET001", "description": "Network timeout occurred", "category": "ERROR", "subcategory": "Network", "severity": "medium", "is_active": True},
    {"code": "ERR-NET002", "description": "Connection refused", "category": "ERROR", "subcategory": "Network", "severity": "high", "is_active": True},
    {"code": "ERR-API001", "description": "API rate limit exceeded", "category": "ERROR", "subcategory": "API", "severity": "medium", "is_active": True},
    {"code": "ERR-API002", "description": "Invalid API request", "category": "ERROR", "subcategory": "API", "severity": "low", "is_active": True},
    {"code": "ERR-API003", "description": "API service unavailable", "category": "ERROR", "subcategory": "API", "severity": "critical", "is_active": True},
    {"code": "ERR-FILE001", "description": "File not found", "category": "ERROR", "subcategory": "FileSystem", "severity": "medium", "is_active": True},
    {"code": "ERR-FILE002", "description": "Permission denied", "category": "ERROR", "subcategory": "FileSystem", "severity": "high", "is_active": True},
    {"code": "ERR-SYS001", "description": "Out of memory", "category": "ERROR", "subcategory": "System", "severity": "critical", "is_active": True},
    {"code": "ERR-SYS002", "description": "Service crashed", "category": "ERROR", "subcategory": "System", "severity": "critical", "is_active": True},

    # Warnings & Info (10 codes)
    {"code": "WARN-MEM001", "description": "Memory usage above 80%", "category": "WARNING", "subcategory": "Performance", "severity": "low", "is_active": True},
    {"code": "WARN-CPU001", "description": "CPU usage above 90%", "category": "WARNING", "subcategory": "Performance", "severity": "medium", "is_active": True},
    {"code": "WARN-DISK001", "description": "Disk space low", "category": "WARNING", "subcategory": "Storage", "severity": "medium", "is_active": True},
    {"code": "WARN-SSL001", "description": "SSL certificate expiring soon", "category": "WARNING", "subcategory": "Security", "severity": "high", "is_active": True},
    {"code": "WARN-BACKUP001", "description": "Backup failed", "category": "WARNING", "subcategory": "Backup", "severity": "high", "is_active": True},
    {"code": "INFO-SYS001", "description": "System maintenance scheduled", "category": "INFO", "subcategory": "System", "severity": "low", "is_active": True},
    {"code": "INFO-SYS002", "description": "System update available", "category": "INFO", "subcategory": "System", "severity": "low", "is_active": True},
    {"code": "INFO-USER001", "description": "New user registered", "category": "INFO", "subcategory": "User", "severity": "low", "is_active": True},
    {"code": "INFO-DEPLOY001", "description": "Deployment successful", "category": "INFO", "subcategory": "Deployment", "severity": "low", "is_active": True},
    {"code": "INFO-AUDIT001", "description": "Audit log generated", "category": "INFO", "subcategory": "Audit", "severity": "low", "is_active": True},
]


async def seed_realistic_data():
    """Seed the database with realistic amounts of data"""
    
    db_url = settings.DATABASE_URL.replace('postgresql://', 'postgresql+asyncpg://')
    db_url = db_url.split('?')[0]
    
    engine = create_async_engine(
        db_url,
        echo=False,  # Disable echo for faster seeding
        connect_args={
            'ssl': 'require',
            'server_settings': {
                'jit': 'off'
            }
        }
    )
    
    async_session = sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )
    
    async with async_session() as session:
        try:
            print("🌱 Starting realistic data seeding...")
            
            # Get or create organization
            result = await session.execute(select(Organization).limit(1))
            organization = result.scalar_one_or_none()
            
            if not organization:
                print("Creating default organization...")
                organization = Organization(
                    name="Default Organization",
                    description="Auto-created default organization for seeding",
                    is_active=True
                )
                session.add(organization)
                await session.commit()
                await session.refresh(organization)
                print(f"✅ Created organization with ID: {organization.id}")
            else:
                print(f"📌 Using existing organization: {organization.name} (ID: {organization.id})")
            
            # Clear existing data
            print("🗑️  Clearing existing diagnostic codes and analytics events...")
            await session.execute(text("DELETE FROM analytics_events"))
            await session.execute(text("DELETE FROM diagnostic_codes"))
            await session.commit()
            print("✅ Existing data cleared!")
            
            # Seed diagnostic codes
            print(f"📊 Seeding {len(SAMPLE_CODES)} diagnostic codes...")
            for code_data in SAMPLE_CODES:
                code_data_with_org = {**code_data, "organization_id": organization.id}
                code = DiagnosticCode(**code_data_with_org)
                session.add(code)
            await session.commit()
            print(f"✅ Successfully seeded {len(SAMPLE_CODES)} diagnostic codes!")
            
            # Get user IDs for analytics events
            result = await session.execute(select(User))
            users = result.scalars().all()
            
            if not users:
                print("⚠️  No users found. Please run seed_users.py first.")
                return
            
            user_ids = [user.id for user in users]
            
            # Get diagnostic code IDs
            result = await session.execute(select(DiagnosticCode))
            codes = result.scalars().all()
            code_ids = [code.id for code in codes]
            
            # Seed analytics events (simulating 30 days of activity)
            print("📈 Seeding analytics events (30 days of activity)...")
            event_types = ['view', 'create', 'update', 'delete', 'search', 'export', 'import']
            event_categories = ['code', 'page', 'search', 'export', 'import']
            pages = ['Home', 'Dashboard', 'Analytics', 'Organizations', 'Users']
            
            events_count = 0
            end_date = datetime.utcnow()
            
            # Create events for the past 30 days
            for day in range(30):
                event_date = end_date - timedelta(days=day)
                
                # Simulate more activity on weekdays
                is_weekend = event_date.weekday() >= 5
                daily_events = random.randint(5, 15) if is_weekend else random.randint(20, 50)
                
                for _ in range(daily_events):
                    event_type = random.choice(event_types)
                    event_category = random.choice(event_categories)
                    user_id = random.choice(user_ids)
                    
                    # Random time within the day
                    hours = random.randint(8, 18)  # Business hours
                    minutes = random.randint(0, 59)
                    event_datetime = event_date.replace(hour=hours, minute=minutes)
                    
                    # Different event types need different extra data
                    extra_data = {}
                    resource_id = None
                    
                    if event_category == 'page':
                        extra_data = {"page": random.choice(pages)}
                    elif event_category == 'code':
                        if code_ids:
                            resource_id = random.choice(code_ids)
                    elif event_category == 'search':
                        search_terms = ['diabetes', 'hypertension', 'error', 'warning', 'kidney', 'heart']
                        extra_data = {"query": random.choice(search_terms)}
                    
                    event = AnalyticsEvent(
                        user_id=user_id,
                        event_type=event_type,
                        event_category=event_category,
                        resource_id=resource_id,
                        extra_data=extra_data,
                        created_at=event_datetime
                    )
                    session.add(event)
                    events_count += 1
            
            await session.commit()
            print(f"✅ Successfully seeded {events_count} analytics events!")
            
            print("🎉 Realistic data seeding completed!")
            
        except Exception as e:
            print(f"❌ Error seeding database: {e}")
            import traceback
            traceback.print_exc()
            await session.rollback()
            raise
        finally:
            await engine.dispose()


if __name__ == "__main__":
    print("=" * 70)
    print("Diagnostic Code Assistant - Realistic Data Seeding")
    print("=" * 70)
    asyncio.run(seed_realistic_data())
