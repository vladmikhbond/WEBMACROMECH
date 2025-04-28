
from flask import Blueprint, render_template, request, redirect, url_for
from flask_login import login_user, login_required, logout_user, current_user

from sqlalchemy import select
from sqlalchemy.orm import Session
from urllib.parse import unquote


from ..models import Problem, User
from .. import SessionLocal, bcrypt

main_bp = Blueprint("main", __name__)

# HOME PAGE
#
@main_bp.route('/', methods=['GET'])
@login_required
def index():
    return render_template('index.html')


#  API - список задач
#
@main_bp.route('/opened_probs', methods=['GET'])
@main_bp.route('/my_probs', methods=['GET'])
def probs():

    s = ''
    with SessionLocal() as db:
        if request.path == '/opened_probs': 
           problems = db.query(Problem).filter(Problem.isOpen == True).all()
        elif request.path == '/my_probs':
           problems = db.query(Problem).filter(Problem.username == current_user.username).all()

    for p in problems:
        s += f"""TITLE: {p.title}
COND: {p.cond}
INIT: {p.init}
ANSWER: {p.answer}
---
"""
    
    if len(s) > 0:
        s = "TITLE: Clear Scene\nCOND:\nINIT:\nANSWER:\n---\n" + s
    else:
        # load from ststic file
        with open('problems.txt', 'r') as f:
            s = f.read()
    return s

#  Запит на форму додавання задачі
#
@main_bp.route('/add_prob/<scene>', methods=['GET', 'POST'])
@login_required
def add_prob(scene):
    if request.method == 'GET':
        scene = unquote(scene) if scene else None
        return render_template('prob.html',  header="Додавання задачі", init=scene) 
       
    elif request.method == 'POST':
        problem = Problem()
        problem.title = request.form.get('title')
        problem.cond = request.form.get('cond')
        problem.init = request.form.get('init')
        problem.answer = request.form.get('answer')
        problem.username = current_user.username
        problem.isOpen = False
        
        with SessionLocal() as db:
            db.add(problem)
            db.commit()
        return redirect(url_for('main.index'))        

#  Запит на форму редагування задачі
#
@main_bp.route('/edit_prob/<title>', methods=['GET','POST'])
@login_required
def edit_prob(title):
    if request.method == 'GET':
        title = unquote(title) if title else None
        with SessionLocal() as db:
            problems = db.query(Problem).filter(Problem.title == title).all()
        if len(problems) == 0:
            return "Select a problem."   
        
        problem = problems[0]
        return render_template('prob.html', header="Редагування задачі (назву змінювати марно)",
            title=problem.title, cond=problem.cond, init=problem.init, answer=problem.answer)
     
    elif request.method == 'POST':
        with SessionLocal() as db:
            title = unquote(title) if title else None
            problem = db.query(Problem).filter(Problem.title == title).all()[0]

            problem.cond = request.form.get('cond')
            problem.init = request.form.get('init')
            problem.answer = request.form.get('answer')
            db.commit()
        return redirect(url_for('main.index'))        

#  Запит на форму видалення задачі
#
@main_bp.route('/del_prob/<title>', methods=['GET','POST'])
@login_required
def del_prob(title):
    if request.method == 'GET':
        title = unquote(title) if title else None
        with SessionLocal() as db:
            problems = db.query(Problem).filter(Problem.title == title).all()
        if len(problems) == 0:
            return "Select a problem."   
        
        problem = problems[0]
        return render_template('prob.html', header="Видалення задачі",
            title=problem.title, cond=problem.cond, init=problem.init, answer=problem.answer)
     
    elif request.method == 'POST':
        with SessionLocal() as db:
            title = unquote(title) if title else None
            problem = db.query(Problem).all()[0]
            db.delete(problem)
            db.commit()
        return redirect(url_for('main.index'))        
