"""Drop and recreate all tables from models, then seed data.

Run:  python init_db.py
"""
import asyncio
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from app.database import connect_db, disconnect_db
import app.database as db_mod
from app.models import Base


async def main():
    print("Connecting to database...")
    await connect_db()

    print("Dropping all tables...")
    async with db_mod.engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

    print("Creating all tables from models...")
    async with db_mod.engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    print("Running seed data...")
    from app.seed_modules import seed_all
    await seed_all()

    await disconnect_db()
    print("\nDone! Database fully initialized.")


if __name__ == "__main__":
    asyncio.run(main())
