import os
from datetime import timedelta

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'super-secret-key-for-capacity-connect'
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///capacity_connect.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    CORS_HEADERS = 'Content-Type'
    CORS_ORIGINS = os.environ.get('CORS_ORIGINS')

    # Assessment flow: when True, a module quiz unlocks once every lesson in
    # that module is completed, and the final assessment unlocks once every
    # lesson in the course is completed. Set REQUIRE_COMPLETION_FOR_QUIZZES=1
    # to enable this locking (off by default).
    REQUIRE_COMPLETION_FOR_QUIZZES = os.environ.get('REQUIRE_COMPLETION_FOR_QUIZZES', '0') not in ('0', 'false', 'False')
