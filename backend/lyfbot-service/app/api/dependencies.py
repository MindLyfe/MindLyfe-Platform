from typing import Generator
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import SessionLocal

async def get_db() -> Generator[AsyncSession, None, None]:
    """
    Get a database session
    
    Yields:
        AsyncSession: Database session
    """
    session = SessionLocal()
    try:
        yield session
    finally:
        await session.close() 