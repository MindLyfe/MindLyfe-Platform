import logging
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)

async def init_db(db: AsyncSession) -> None:
    """
    Initialize the database with required data
    
    Args:
        db: Database session
    """
    logger.info("Initializing database")
    
    # Add any initial data here
    
    await db.commit()
    logger.info("Database initialized") 