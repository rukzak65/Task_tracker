from fastapi import FastAPI
from .database import init_db
from .routes import auth, habits, completion
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
	return {"message": "запуск"}

init_db()


app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(habits.router, prefix="/habits", tags=["habits"])
app.include_router(completion.router, prefix="/completions", tags=["completions"])