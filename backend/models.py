from sqlalchemy import Column, Integer, String, Text, DECIMAL
from database import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255))
    price = Column(DECIMAL(10, 2))
    image_main = Column(String(1000))
    description = Column(Text)  # maps to CLOB in DB2
    category = Column(String(100))
    rating = Column(DECIMAL(3, 2))
    reviews = Column(Integer)

    # JSON stored as TEXT/CLOB
    images_json = Column(Text)       # JSON array stored as string
    features_json = Column(Text)     # JSON array stored as string
    specs_json = Column(Text)        # JSON object stored as string
