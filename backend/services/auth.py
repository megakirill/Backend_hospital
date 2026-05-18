from datetime import datetime, timedelta, timezone

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.config import settings
from ..core.security import (
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token
)

from ..storage.postgres.models.refresh_token import RefreshToken
from ..storage.postgres.models.users import User

from backend.schemas.auth import (
    LoginSchema,
    TokenResponse
)


class AuthService:
    def __init__(
        self,
        session: AsyncSession
    ):
        self.session = session

    async def login(
        self,
        data: LoginSchema
    ) -> TokenResponse:

        stmt = select(User).where(
            User.email == data.email
        )

        result = await self.session.execute(stmt)

        user = result.scalar_one_or_none()

        if not user:
            raise HTTPException(
                status_code=404,
                detail="User not found"
            )

        if not verify_password(
            data.password,
            user.password_hash
        ):
            raise HTTPException(
                status_code=401,
                detail="Invalid password"
            )

        payload = {
            "sub": str(user.id),
            "role": user.role.value
        }

        access_token = create_access_token(
            payload
        )

        refresh_token = create_refresh_token(
            payload
        )

        db_refresh = RefreshToken(
            token=refresh_token,
            user_id=user.id,
            expires_at=datetime.now(
                timezone.utc
            ) + timedelta(
                days=settings.REFRESH_TOKEN_EXPIRE_DAYS
            )
        )

        self.session.add(db_refresh)

        await self.session.commit()

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token
        )

    async def refresh(
        self,
        refresh_token: str
    ):

        payload = decode_token(
            refresh_token
        )

        if not payload:
            raise HTTPException(
                status_code=401,
                detail="Invalid token"
            )

        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=401,
                detail="Invalid token type"
            )

        stmt = select(RefreshToken).where(
            RefreshToken.token == refresh_token
        )

        result = await self.session.execute(stmt)

        db_token = result.scalar_one_or_none()

        if not db_token:
            raise HTTPException(
                status_code=401,
                detail="Token not found"
            )

        if db_token.revoked:
            raise HTTPException(
                status_code=401,
                detail="Token revoked"
            )

        if db_token.expires_at < datetime.now(
            timezone.utc
        ):
            raise HTTPException(
                status_code=401,
                detail="Token expired"
            )

        db_token.revoked = True

        new_payload = {
            "sub": payload["sub"],
            "role": payload["role"]
        }

        new_access = create_access_token(
            new_payload
        )

        new_refresh = create_refresh_token(
            new_payload
        )

        new_db_token = RefreshToken(
            token=new_refresh,
            user_id=int(payload["sub"]),
            expires_at=datetime.now(
                timezone.utc
            ) + timedelta(
                days=settings.REFRESH_TOKEN_EXPIRE_DAYS
            )
        )

        self.session.add(new_db_token)

        await self.session.commit()

        return TokenResponse(
            access_token=new_access,
            refresh_token=new_refresh
        )

    async def logout(
        self,
        refresh_token: str
    ):
        stmt = select(RefreshToken).where(
            RefreshToken.token == refresh_token
        )

        result = await self.session.execute(stmt)

        db_token = result.scalar_one_or_none()

        if db_token:
            db_token.revoked = True

            await self.session.commit()

        return {
            "message": "Logged out"
        }