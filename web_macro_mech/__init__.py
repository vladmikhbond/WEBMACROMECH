from flask import Flask
from flask_bcrypt import Bcrypt
from flask_login import LoginManager
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os

from .models import Base, User


bcrypt = Bcrypt()

# БД має знаходитися в кореневому каталозі пакета
db_path = os.path.join(os.path.dirname(__file__), "webmacromech.db")

engine = create_engine(f"sqlite:///{db_path}", echo=False)
# engine = create_engine("sqlite:///webmacromech.db", echo=False)

SessionLocal = sessionmaker(bind=engine, expire_on_commit=False)

login_manager = LoginManager()


def create_app():
    app = Flask(__name__)
    app.secret_key = 'very-secret-key'  # Для сесій

    bcrypt.init_app(app)
    login_manager.init_app(app)

    Base.metadata.create_all(engine)

    from .routes import main_bp, auth_bp

    app.register_blueprint(main_bp)
    app.register_blueprint(auth_bp)

    login_manager.login_view = 'register.login'  # якщо не авторизований — редірект

    return app


@login_manager.user_loader
def load_user(user_id):
    with SessionLocal() as session:
        return session.get(User, int(user_id))
