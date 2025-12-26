"""
Import official ICD-10 codes into the database.

This script downloads and imports ICD-10-CM codes from CMS (Centers for Medicare & Medicaid Services).
Source: https://www.cms.gov/medicare/coding-billing/icd-10-codes
"""
import asyncio
import csv
import requests
import zipfile
import io
from pathlib import Path
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.diagnostic_code import DiagnosticCode
from app.models.organization import Organization

# CMS ICD-10-CM codes download URL (2024 version)
ICD10_URL = "https://www.cms.gov/files/zip/2024-code-descriptions-tabular-order.zip"

# Mapping ICD-10 categories
CATEGORY_MAP = {
    'A': 'INFECTIOUS',
    'B': 'INFECTIOUS',
    'C': 'NEOPLASMS',
    'D': 'BLOOD',
    'E': 'ENDOCRINE',
    'F': 'MENTAL',
    'G': 'NERVOUS',
    'H': 'SENSORY',
    'I': 'CARDIOVASCULAR',
    'J': 'RESPIRATORY',
    'K': 'DIGESTIVE',
    'L': 'SKIN',
    'M': 'MUSCULOSKELETAL',
    'N': 'GENITOURINARY',
    'O': 'PREGNANCY',
    'P': 'PERINATAL',
    'Q': 'CONGENITAL',
    'R': 'SYMPTOMS',
    'S': 'INJURY',
    'T': 'INJURY',
    'V': 'EXTERNAL',
    'W': 'EXTERNAL',
    'X': 'EXTERNAL',
    'Y': 'EXTERNAL',
    'Z': 'FACTORS'
}

def get_category(code: str) -> str:
    """Get category from ICD-10 code."""
    if not code:
        return 'OTHER'
    first_char = code[0].upper()
    return CATEGORY_MAP.get(first_char, 'OTHER')

def get_severity(description: str) -> str:
    """Estimate severity from description."""
    description_lower = description.lower()
    
    # Critical conditions
    critical_keywords = [
        'acute', 'severe', 'critical', 'emergency', 'malignant', 
        'carcinoma', 'infarction', 'hemorrhage', 'failure', 'arrest'
    ]
    
    # Medium severity
    medium_keywords = [
        'chronic', 'moderate', 'disorder', 'disease', 'syndrome',
        'infection', 'inflammation'
    ]
    
    if any(keyword in description_lower for keyword in critical_keywords):
        return 'critical'
    elif any(keyword in description_lower for keyword in medium_keywords):
        return 'high'
    else:
        return 'medium'

def download_icd10_codes():
    """Download ICD-10 codes from CMS."""
    print("Downloading ICD-10 codes from CMS...")
    
    try:
        response = requests.get(ICD10_URL, timeout=120)
        response.raise_for_status()
        
        print(f"Downloaded {len(response.content) / (1024*1024):.2f} MB")
        
        # Extract ZIP file
        with zipfile.ZipFile(io.BytesIO(response.content)) as zip_file:
            # Find the main code file (usually icd10cm_codes_*.txt)
            code_files = [f for f in zip_file.namelist() if 'code' in f.lower() and f.endswith('.txt')]
            
            if not code_files:
                print("Available files in ZIP:", zip_file.namelist())
                raise Exception("Could not find ICD-10 code file in ZIP")
            
            code_file = code_files[0]
            print(f"Extracting {code_file}...")
            
            with zip_file.open(code_file) as f:
                content = f.read().decode('utf-8', errors='ignore')
                
            return content
            
    except Exception as e:
        print(f"Error downloading from CMS: {e}")
        print("\nFalling back to manual data structure...")
        return None

def parse_icd10_data(content: str):
    """Parse ICD-10 data from CMS format."""
    codes = []
    
    for line in content.split('\n'):
        line = line.strip()
        if not line:
            continue
        
        # CMS format: Code Description (usually space-separated)
        # Example: "A00.0 Cholera due to Vibrio cholerae 01, biovar cholerae"
        parts = line.split(maxsplit=1)
        
        if len(parts) >= 2:
            code = parts[0].strip()
            description = parts[1].strip()
            
            # Skip headers or invalid codes
            if len(code) < 3 or not code[0].isalpha():
                continue
            
            codes.append({
                'code': f"ICD-{code}",
                'description': description,
                'category': get_category(code),
                'severity': get_severity(description)
            })
    
    return codes

def get_sample_icd10_codes():
    """Get sample ICD-10 codes if download fails."""
    print("Using sample ICD-10 codes...")
    
    # Sample of common ICD-10 codes
    return [
        {'code': 'ICD-A00.0', 'description': 'Cholera due to Vibrio cholerae 01, biovar cholerae', 'category': 'INFECTIOUS', 'severity': 'high'},
        {'code': 'ICD-A00.1', 'description': 'Cholera due to Vibrio cholerae 01, biovar eltor', 'category': 'INFECTIOUS', 'severity': 'high'},
        {'code': 'ICD-A00.9', 'description': 'Cholera, unspecified', 'category': 'INFECTIOUS', 'severity': 'high'},
        {'code': 'ICD-A01.0', 'description': 'Typhoid fever', 'category': 'INFECTIOUS', 'severity': 'critical'},
        {'code': 'ICD-A02.0', 'description': 'Salmonella enteritis', 'category': 'INFECTIOUS', 'severity': 'medium'},
        # Add more sample codes as needed
    ]

def import_codes_to_database(codes, organization_id: int = 1):
    """Import codes into database."""
    engine = create_engine(settings.DATABASE_URL.replace('postgresql://', 'postgresql+psycopg2://'))
    
    print(f"\nImporting {len(codes)} codes into database...")
    
    with Session(engine) as session:
        # Check if organization exists
        org = session.execute(
            select(Organization).where(Organization.id == organization_id)
        ).scalar_one_or_none()
        
        if not org:
            print(f"Creating default organization...")
            org = Organization(
                name="Default Organization",
                slug="default",
                is_active=True
            )
            session.add(org)
            session.commit()
            organization_id = org.id
        
        # Clear existing codes (optional - remove if you want to keep sample codes)
        print("Clearing existing codes...")
        session.query(DiagnosticCode).delete()
        session.commit()
        
        # Batch insert for performance
        batch_size = 1000
        total_imported = 0
        
        for i in range(0, len(codes), batch_size):
            batch = codes[i:i+batch_size]
            
            db_codes = [
                DiagnosticCode(
                    organization_id=organization_id,
                    code=code['code'],
                    description=code['description'],
                    category=code['category'],
                    severity=code['severity'],
                    is_active=True
                )
                for code in batch
            ]
            
            session.bulk_save_objects(db_codes)
            session.commit()
            
            total_imported += len(batch)
            print(f"Imported {total_imported}/{len(codes)} codes...")
        
        print(f"\n✅ Successfully imported {total_imported} ICD-10 codes!")
        
        # Show statistics
        stats = {}
        for code in codes:
            category = code['category']
            stats[category] = stats.get(category, 0) + 1
        
        print("\nCodes by category:")
        for category, count in sorted(stats.items()):
            print(f"  {category}: {count}")

def main():
    """Main import function."""
    print("=" * 60)
    print("ICD-10 Code Import Tool")
    print("=" * 60)
    
    # Download codes
    content = download_icd10_codes()
    
    if content:
        # Parse downloaded data
        codes = parse_icd10_data(content)
    else:
        # Use sample codes
        codes = get_sample_icd10_codes()
    
    if not codes:
        print("❌ No codes to import!")
        return
    
    print(f"\nFound {len(codes)} codes to import")
    
    # Ask for confirmation
    response = input("\nProceed with import? This will REPLACE existing codes. (yes/no): ")
    
    if response.lower() in ['yes', 'y']:
        import_codes_to_database(codes)
    else:
        print("Import cancelled.")

if __name__ == "__main__":
    main()
