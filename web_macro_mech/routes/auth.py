
from flask import Blueprint, render_template, request, redirect, url_for
from flask_login import login_user, login_required, logout_user, current_user

from sqlalchemy import select
from sqlalchemy.orm import Session
from urllib.parse import unquote


from ..models import Problem, User
    
from .. import SessionLocal, bcrypt

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['GET', 'POST'])
def register():

    message = error = None

    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')

        with SessionLocal() as db:
            user_exists = db.scalar(select(User).where(User.username == username))
            if user_exists:
                error = 'Користувач вже існує'
            else:
                password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
                new_user = User(username=username, password_hash=password_hash)
                db.add(new_user)
                db.commit()
                message = 'Користувача зареєстровано успішно'

    return render_template('register.html', message=message, error=error)


@auth_bp.route('/login', methods=['GET', 'POST'])
def login():

    error = None
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')

        with SessionLocal() as db:
            user = db.scalar(select(User).where(User.username == username))
            if user and bcrypt.check_password_hash(user.password_hash, password):
                login_user(user)
                return redirect(url_for('main.index'))
            else:
                error = 'Невірне імʼя користувача або пароль'

    return render_template('login.html', error=error)


@auth_bp.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('main.index'))
