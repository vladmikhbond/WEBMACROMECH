from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from web_macro_mech.models import Problem
import re

conStr = "sqlite:///webmacromech.db"
engine = create_engine(conStr, echo=False)
SessionLocal = sessionmaker(bind=engine, expire_on_commit=False)

def exportProblems(username: str) -> str:
    with SessionLocal() as db:
        problems = db.query(Problem).filter(Problem.username == username).all()

    s = ''
    for p in problems:
            s += f"""TITLE: {p.title}
    COND: {p.cond}
    INIT: {p.init}
    ANSWER: {p.answer}
    ---
    """
    return s


def importProblems(username: str, text: str):
    # JS     /TITLE:((.|\r|\n)*?)COND:((.|\r|\n)*?)INIT:((.|\r|\n)*?)ANSWER:((.|\r|\n)*?)---/gm;
    regex = r"TITLE:((.|\r|\n)*?)COND:((.|\r|\n)*?)INIT:((.|\r|\n)*?)ANSWER:((.|\r|\n)*?)---"
    matches = re.finditer(regex, text, re.MULTILINE)
    problems = []
    for m in matches:
        p = Problem()
        p.title = '0' + m[1].strip()
        p.cond = m[3].strip()
        p.init = m[5].strip()
        p.answer = m[7].strip()
        p.username = username
        problems.append(p)

    with SessionLocal() as db:
        for p in problems:
            db.add(p)
        db.commit()
        
# print(exportProblems('test1'))

text = exportProblems('test1')
probs = importProblems('test', text)

