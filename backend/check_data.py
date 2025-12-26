import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select, func
from app.core.config import settings
from app.models.diagnostic_code import DiagnosticCode
from app.models.analytics import AnalyticsEvent

async def check():
    db_url = settings.DATABASE_URL.replace('postgresql://', 'postgresql+asyncpg://').split('?')[0]
    engine = create_async_engine(db_url, connect_args={'ssl': 'require'})
    async_session = sessionmaker(engine, class_=AsyncSession)
    
    async with async_session() as session:
        codes_result = await session.execute(select(func.count()).select_from(DiagnosticCode))
        events_result = await session.execute(select(func.count()).select_from(AnalyticsEvent))
        
        print(f'Diagnostic Codes: {codes_result.scalar()}')
        print(f'Analytics Events: {events_result.scalar()}')
    
    await engine.dispose()

asyncio.run(check())
