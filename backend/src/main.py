from fastapi import FastAPI
from .database import init_db

app = FastAPI()

@app.get("/")
def root():
	return {"message": "запуск"}

init_db()