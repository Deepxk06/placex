from sqlalchemy import select, func, text
from sqlalchemy.ext.asyncio import AsyncSession


async def get_or_404(session: AsyncSession, model, id_val):
    result = await session.get(model, id_val)
    return result


async def find_one(session: AsyncSession, model, **filters):
    stmt = select(model).filter_by(**filters)
    result = await session.execute(stmt)
    return result.scalar_one_or_none()


async def find_all(session: AsyncSession, model, **filters):
    stmt = select(model).filter_by(**filters)
    result = await session.execute(stmt)
    return result.scalars().all()


async def count_rows(session: AsyncSession, model, **filters):
    stmt = select(func.count()).select_from(model).filter_by(**filters)
    result = await session.execute(stmt)
    return result.scalar()


async def search_ilike(session: AsyncSession, model, field: str, value: str):
    column = getattr(model, field)
    stmt = select(model).where(column.ilike(f"%{value}%"))
    result = await session.execute(stmt)
    return result.scalars().all()


async def random_sample(session: AsyncSession, model, limit: int, **filters):
    stmt = select(model).filter_by(**filters).order_by(func.random()).limit(limit)
    result = await session.execute(stmt)
    return result.scalars().all()
