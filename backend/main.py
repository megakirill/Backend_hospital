from fastapi import FastAPI
from .api import router
from .storage.postgres.db import db, Base
app = FastAPI(title="Курсач")

app.include_router(router, prefix="/api")


@app.on_event("startup")
async def startup():
    await db.connect()
    async with db._engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)



@app.on_event("shutdown")
async def shutdown():
    await db.close()

@app.get("/")
def root():
    return {"message": "API is running"}

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)