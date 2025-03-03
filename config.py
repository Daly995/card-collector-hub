import os
from dotenv import load_dotenv

basedir = os.path.abspath(os.path.dirname(__file__))
load_dotenv()


class Config:
    # Flask
    SECRET_KEY = os.environ.get("SECRET_KEY") or "dev-key-please-change"

    # Database
    SQLALCHEMY_DATABASE_URI = (
        os.environ.get("DATABASE_URL") or "postgresql://localhost/card_collector_db"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
