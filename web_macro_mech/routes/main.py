
from flask import Blueprint, render_template, request, redirect, url_for
from flask_login import login_required, current_user

from urllib.parse import unquote

from ..models import Problem
from .. import SessionLocal

main_bp = Blueprint("main", __name__)

# HOME PAGE
#
@main_bp.route('/', methods=['GET'])
# @login_required
def index():
    nameInHeader = ''
    if current_user.is_authenticated:
        nameInHeader = ' - ' + current_user.username
    return render_template('index.html', nameInHeader = nameInHeader)


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


#  Запит на головну адмін форму 
#
@main_bp.route('/admin', methods=['GET'])
@login_required
def admin():
    with SessionLocal() as db:
        problems = db.query(Problem).filter(Problem.username == current_user.username).all()
        return render_template('admin.html', problems=problems)


# Відкриття-закриття задач з головної форми
#
@main_bp.route('/switch/<id>', methods=['GET'])
@login_required
def switch(id):
    with SessionLocal() as db:
        problem = db.get(Problem, id) 
        problem.isOpen = not problem.isOpen
        db.commit()    
        problems = db.query(Problem).filter(Problem.username == current_user.username).all()
    return render_template('admin.html', problems=problems)




#  Запит на форму додавання задачі
#
@main_bp.route('/add_prob/<scene>', methods=['GET'])
@main_bp.route('/add_prob/<scene>', defaults={'scene': None}, methods=['POST'])
@login_required
def add_prob(scene):
    if request.method == 'GET':
        scene = unquote(scene) if scene else None
        return render_template('add_prob.html', init=scene) 
       
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
        return redirect(url_for('main.admin'))        


#  Запит на форму редагування задачі
#
@main_bp.route('/edit_prob/<id>', methods=['GET','POST'])
@login_required
def edit_prob(id):
    if request.method == 'GET':        
        with SessionLocal() as db:
            problem = db.get(Problem, id) 
        return render_template('edit_prob.html', problem = problem);
     
    elif request.method == 'POST':
        with SessionLocal() as db:           
            problem = db.get(Problem, id) 

            problem.cond = request.form.get('cond')
            problem.init = request.form.get('init')
            problem.answer = request.form.get('answer')
            problem.isOpen = request.form.get('isOpen') == 'True'
            db.commit()
        return redirect(url_for('main.admin'))        


#  Запит на форму видалення задачі
#
@main_bp.route('/del_prob/<id>', methods=['GET','POST'])
@login_required
def del_prob(id):
    if request.method == 'GET':
        with SessionLocal() as db:
            problem = db.get(Problem, id) 
        return render_template('del_prob.html', problem = problem);
     
    elif request.method == 'POST':
        with SessionLocal() as db:
            problem = db.get(Problem, id) 
            db.delete(problem)
            db.commit()
        return redirect(url_for('main.index'))        
