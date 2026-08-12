from fastapi import APIRouter
from app.api.v1.routers.auth.auth_router import router as auth_router
from app.api.v1.routers.admin.admin_router import router as admin_router

api_router = APIRouter()
api_router.include_router(auth_router)
api_router.include_router(admin_router)