import os

# Add DB2 client DLLs before importing ibm_db / SQLAlchemy
os.add_dll_directory(
    r"E:\Project\shopify\my-web-market\backend\venv\Lib\site-packages\clidriver\bin"
)

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

load_dotenv()

DB2_HOST = os.getenv("DB2_HOST")
DB2_PORT = os.getenv("DB2_PORT")
DB2_USER = os.getenv("DB2_USER")
DB2_PASSWORD = os.getenv("DB2_PASSWORD")
DB2_DATABASE = os.getenv("DB2_DATABASE")

# SQLAlchemy URL format for DB2
DB_URL = (
    f"ibm_db_sa://{DB2_USER}:{DB2_PASSWORD}"
    f"@{DB2_HOST}:{DB2_PORT}/{DB2_DATABASE}"
)

engine = create_engine(DB_URL)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
