import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Any
from ..database import get_db
from ..models import AppSetting
from ..seed import seed_database

router = APIRouter(prefix="/api/settings", tags=["Settings"])


class SettingUpdate(BaseModel):
    value: Any


@router.get("")
def get_settings(db: Session = Depends(get_db)):
    settings_rows = db.query(AppSetting).all()
    res = {}
    for row in settings_rows:
        try:
            res[row.key] = json.loads(row.value)
        except Exception:
            res[row.key] = row.value
    return res


@router.put("/{key}")
def update_setting(key: str, data: SettingUpdate, db: Session = Depends(get_db)):
    setting = db.query(AppSetting).filter(AppSetting.key == key).first()
    val_str = json.dumps(data.value) if not isinstance(data.value, str) else data.value

    if not setting:
        setting = AppSetting(key=key, value=val_str)
        db.add(setting)
    else:
        setting.value = val_str

    db.commit()
    return {"key": key, "value": data.value}


@router.post("/reset-to-defaults")
def reset_defaults(db: Session = Depends(get_db)):
    seed_database(force=True)
    return {"message": "Database reset and seeded with initial spreadsheet data successfully!"}
