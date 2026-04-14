from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional
import json
import os
import logging
import uuid
import jwt
import bcrypt
import secrets
from datetime import datetime, timezone, timedelta
from bson import ObjectId
import aiosmtplib
from email.message import EmailMessage

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
if 'mongodb+srv' in mongo_url or 'mongodb.net' in mongo_url:
    import certifi
    client = AsyncIOMotorClient(mongo_url, tlsCAFile=certifi.where())
else:
    client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', secrets.token_hex(32))
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440  # 24 hours

app = FastAPI()
api_router = APIRouter(prefix="/api")

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

# ============ Auth Helpers ============

async def send_email(to_email: str, subject: str, html_content: str):
    """Send email using SMTP"""
    try:
        smtp_host = os.getenv('SMTP_HOST', 'smtp.gmail.com')
        smtp_port = int(os.getenv('SMTP_PORT', '587'))
        smtp_user = os.getenv('SMTP_USER')
        smtp_password = os.getenv('SMTP_PASSWORD')
        from_email = os.getenv('FROM_EMAIL', 'noreply@cakeshop.com')
        
        if not smtp_user or not smtp_password:
            logger.warning(f"SMTP credentials not configured. Email would be sent to: {to_email}")
            logger.info(f"Email content: {html_content}")
            return False
        
        message = EmailMessage()
        message["From"] = from_email
        message["To"] = to_email
        message["Subject"] = subject
        message.set_content(html_content, subtype="html")
        
        await aiosmtplib.send(
            message,
            hostname=smtp_host,
            port=smtp_port,
            username=smtp_user,
            password=smtp_password,
            use_tls=True
        )
        
        logger.info(f"Email sent successfully to {to_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {str(e)}")
        return False

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))

def create_access_token(user_id: str, email: str, role: str = "user") -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
        "type": "access"
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])}, {"password_hash": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        user["_id"] = str(user["_id"])
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_admin(request: Request) -> dict:
    user = await get_current_user(request)
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

# ============ Models ============

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class CakeCreate(BaseModel):
    name: str
    description: str
    base_price: float
    image_url: str
    category: str = "Cake"
    stock: int = 10
    in_stock: bool = True
    flavors: List[str] = ["Chocolate", "Vanilla", "Strawberry", "Red Velvet"]

class CakeUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    base_price: Optional[float] = None
    image_url: Optional[str] = None
    category: Optional[str] = None
    stock: Optional[int] = None
    in_stock: Optional[bool] = None
    flavors: Optional[List[str]] = None

class CartItemAdd(BaseModel):
    cake_id: str
    weight: str  # "500g", "1kg", "1.5kg", "2kg"
    flavor: str
    message: str = ""
    delivery_date: str
    quantity: int = 1

class OrderCreate(BaseModel):
    items: List[dict]
    total_amount: float
    user_name: str
    user_email: str
    user_mobile: str
    street: str
    city: str
    state: str
    pincode: str
    is_direct_order: bool = False

class WaitlistJoin(BaseModel):
    cake_id: str
    email: EmailStr

# ============ Startup Events ============

# ============ Startup Helpers ============

async def _verify_db_connection():
    """Verify MongoDB is reachable."""
    try:
        await client.admin.command('ping')
        logger.info("MongoDB Atlas connection successful!")
    except Exception as e:
        logger.error(f"MongoDB connection failed: {e}")
        raise

async def _create_indexes():
    """Create required database indexes."""
    await db.users.create_index("email", unique=True)
    await db.cakes.create_index("name")
    await db.password_reset_tokens.create_index("expires_at", expireAfterSeconds=0)
    await db.password_reset_tokens.create_index("token")

async def _seed_admin():
    """Seed or update the admin user and write test credentials."""
    admin_email = os.environ.get('ADMIN_EMAIL', 'admin@cakeshop.com')
    admin_password = os.environ.get('ADMIN_PASSWORD', 'Admin@123')

    existing_admin = await db.users.find_one({"email": admin_email})
    if not existing_admin:
        admin_data = {
            "name": "Admin",
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(admin_data)
        logger.info(f"Admin user created: {admin_email}")
    elif not verify_password(admin_password, existing_admin["password_hash"]):
        await db.users.update_one(
            {"email": admin_email},
            {"$set": {"password_hash": hash_password(admin_password)}}
        )
        logger.info("Admin password updated")

    _write_test_credentials(admin_email, admin_password)

def _write_test_credentials(admin_email: str, admin_password: str):
    """Write test credentials file for testing agents."""
    Path("/app/memory").mkdir(exist_ok=True)
    with open("/app/memory/test_credentials.md", "w") as f:
        f.write("# Test Credentials\n\n")
        f.write("## Admin Account\n")
        f.write(f"- Email: {admin_email}\n")
        f.write(f"- Password: {admin_password}\n")
        f.write("- Role: admin\n\n")
        f.write("## Auth Endpoints\n")
        f.write("- POST /api/auth/register\n")
        f.write("- POST /api/auth/login\n")
        f.write("- GET /api/auth/me\n")
        f.write("- POST /api/auth/logout\n")

def _get_sample_cakes() -> list:
    """Load sample cake seed data from JSON and add runtime fields."""
    seed_path = ROOT_DIR / "seed_cakes.json"
    with open(seed_path) as f:
        templates = json.load(f)

    now = datetime.now(timezone.utc).isoformat()
    for cake in templates:
        cake["cake_id"] = str(uuid.uuid4())
        cake["created_at"] = now
    return templates

async def _seed_sample_cakes():
    """Seed sample cakes if the collection is empty."""
    cake_count = await db.cakes.count_documents({})
    if cake_count == 0:
        sample_cakes = _get_sample_cakes()
        await db.cakes.insert_many(sample_cakes)
        logger.info(f"Seeded {len(sample_cakes)} sample cakes")

# ============ Startup Event ============

@app.on_event("startup")
async def startup_event():
    await _verify_db_connection()
    await _create_indexes()
    await _seed_admin()
    await _seed_sample_cakes()

# ============ Auth Routes ============

@api_router.post("/auth/register")
async def register(user_data: UserRegister, response: Response):
    email = user_data.email.lower()
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_doc = {
        "name": user_data.name,
        "email": email,
        "password_hash": hash_password(user_data.password),
        "role": "user",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    result = await db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)
    
    token = create_access_token(user_id, email, "user")
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )
    
    return {
        "_id": user_id,
        "name": user_data.name,
        "email": email,
        "role": "user",
        "token": token
    }

@api_router.post("/auth/login")
async def login(credentials: UserLogin, response: Response):
    email = credentials.email.lower()
    user = await db.users.find_one({"email": email})
    
    if not user or not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    user_id = str(user["_id"])
    token = create_access_token(user_id, email, user.get("role", "user"))
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )
    
    return {
        "_id": user_id,
        "name": user.get("name"),
        "email": user.get("email"),
        "role": user.get("role", "user"),
        "token": token
    }

@api_router.get("/auth/me")
async def get_me(request: Request):
    user = await get_current_user(request)
    return user

@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token")
    return {"message": "Logged out successfully"}

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

@api_router.post("/auth/forgot-password")
async def forgot_password(request: ForgotPasswordRequest):
    email = request.email.lower()
    user = await _validate_forgot_email(email)
    reset_token, reset_link = await _generate_reset_token(email, user)
    email_sent = await _send_reset_email(email, reset_link)
    return {
        "message": "Password reset link has been sent to your email",
        "reset_link": reset_link if not email_sent else None
    }

async def _validate_forgot_email(email: str) -> dict:
    """Check if email exists in database, raise 400 if not."""
    user = await db.users.find_one({"email": email})
    if not user:
        raise HTTPException(
            status_code=400,
            detail="Invalid email ID. This email is not registered."
        )
    return user

async def _generate_reset_token(email: str, user: dict) -> tuple:
    """Generate a secure reset token, store it, and return (token, reset_link)."""
    reset_token = secrets.token_urlsafe(32)
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=30)

    logger.info(f"Generated token for {email}: {reset_token[:10]}... (expires: {expires_at})")

    token_doc = {
        "email": email,
        "token": reset_token,
        "user_type": user.get("role", "user"),
        "expires_at": expires_at,
        "used": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.password_reset_tokens.insert_one(token_doc)
    logger.info(f"Token stored in database for {email}")

    frontend_url = os.getenv('FRONTEND_URL', 'https://cake-craft-plus.preview.emergentagent.com')
    reset_link = f"{frontend_url}/reset-password?token={reset_token}"
    return reset_token, reset_link

def _build_reset_email_html(reset_link: str) -> str:
    """Build the HTML email body for a password reset."""
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background-color: #D0B8A8; color: white; padding: 20px; text-align: center; }}
            .content {{ background-color: #f9f9f9; padding: 30px; border: 1px solid #ddd; }}
            .button {{ display: inline-block; padding: 12px 30px; background-color: #D0B8A8; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
            .footer {{ text-align: center; padding: 20px; color: #666; font-size: 12px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>CakeCraft - Password Reset</h1>
            </div>
            <div class="content">
                <h2>Reset Your Password</h2>
                <p>Hello,</p>
                <p>You requested to reset your password for your CakeCraft account.</p>
                <p>Click the button below to reset your password:</p>
                <p style="text-align: center;">
                    <a href="{reset_link}" class="button">Reset Password</a>
                </p>
                <p>Or copy and paste this link in your browser:</p>
                <p style="word-break: break-all; background-color: #f0f0f0; padding: 10px; border-radius: 3px;">
                    {reset_link}
                </p>
                <p><strong>This link will expire in 30 minutes.</strong></p>
                <p>If you didn't request this, please ignore this email.</p>
            </div>
            <div class="footer">
                <p>&copy; 2026 CakeCraft. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """

async def _send_reset_email(email: str, reset_link: str) -> bool:
    """Attempt to send the password reset email. Returns True if sent."""
    email_html = _build_reset_email_html(reset_link)
    email_sent = await send_email(
        to_email=email,
        subject="Reset Your CakeCraft Password",
        html_content=email_html
    )
    if email_sent:
        logger.info(f"Password reset email sent to {email}")
    else:
        logger.warning(f"Email not sent (SMTP not configured). Reset link: {reset_link}")
    return email_sent

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

@api_router.post("/auth/reset-password")
async def reset_password(request: ResetPasswordRequest):
    token = request.token
    new_password = request.new_password

    logger.info(f"Reset password attempt with token: {token[:10]}...")

    reset_doc = await _verify_reset_token(token)
    _validate_new_password(new_password)
    await _update_user_password(reset_doc["email"], new_password)
    await _mark_token_used(token)

    logger.info(f"Password reset successful for: {reset_doc['email']}")
    return {"message": "Password reset successful"}

async def _verify_reset_token(token: str) -> dict:
    """Find and validate the reset token. Raises HTTPException on failure."""
    reset_doc = await db.password_reset_tokens.find_one({
        "token": token,
        "used": False
    })
    if not reset_doc:
        logger.warning(f"Token not found or already used: {token[:10]}...")
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")

    expires_at = _parse_token_expiry(reset_doc["expires_at"])

    current_time = datetime.now(timezone.utc)
    logger.info(f"Token expires at: {expires_at}, Current time: {current_time}")

    if current_time > expires_at:
        logger.warning(f"Token expired: {token[:10]}...")
        raise HTTPException(status_code=400, detail="Reset token has expired. Please request a new one.")

    return reset_doc

def _parse_token_expiry(expires_at) -> datetime:
    """Normalize expires_at to a timezone-aware datetime."""
    if isinstance(expires_at, str):
        try:
            expires_at = datetime.fromisoformat(expires_at.replace('Z', '+00:00'))
        except Exception as e:
            logger.error(f"Failed to parse expiry date: {e}")
            raise HTTPException(status_code=400, detail="Invalid token format")

    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)

    return expires_at

def _validate_new_password(password: str):
    """Raise HTTPException if the password doesn't meet requirements."""
    if len(password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

async def _update_user_password(email: str, new_password: str):
    """Hash and store the new password for the given email."""
    hashed = hash_password(new_password)
    result = await db.users.update_one(
        {"email": email},
        {"$set": {"password_hash": hashed}}
    )
    if result.matched_count == 0:
        logger.error(f"User not found for email: {email}")
        raise HTTPException(status_code=400, detail="User not found")

async def _mark_token_used(token: str):
    """Mark a reset token as used so it cannot be reused."""
    await db.password_reset_tokens.update_one(
        {"token": token},
        {"$set": {"used": True}}
    )

# ============ Cake Routes ============

@api_router.get("/cakes")
async def get_cakes(search: Optional[str] = None, category: Optional[str] = None):
    query = {}
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}}
        ]
    if category:
        query["category"] = category
    
    cakes = await db.cakes.find(query, {"_id": 0}).to_list(100)
    return cakes

@api_router.get("/cakes/{cake_id}")
async def get_cake(cake_id: str):
    cake = await db.cakes.find_one({"cake_id": cake_id}, {"_id": 0})
    if not cake:
        raise HTTPException(status_code=404, detail="Cake not found")
    return cake

@api_router.post("/cakes")
async def create_cake(cake: CakeCreate, request: Request):
    await get_current_admin(request)
    
    cake_doc = cake.model_dump()
    cake_doc["cake_id"] = str(uuid.uuid4())
    cake_doc["created_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.cakes.insert_one(cake_doc)
    
    # Return the created cake without _id
    created_cake = await db.cakes.find_one({"cake_id": cake_doc["cake_id"]}, {"_id": 0})
    return created_cake

@api_router.put("/cakes/{cake_id}")
async def update_cake(cake_id: str, update: CakeUpdate, request: Request):
    await get_current_admin(request)
    
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.cakes.update_one({"cake_id": cake_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Cake not found")
    
    # Return updated cake
    updated_cake = await db.cakes.find_one({"cake_id": cake_id}, {"_id": 0})
    return updated_cake

@api_router.delete("/cakes/{cake_id}")
async def delete_cake(cake_id: str, request: Request):
    await get_current_admin(request)
    
    result = await db.cakes.delete_one({"cake_id": cake_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Cake not found")
    
    return {"message": "Cake deleted"}

# ============ Cart Routes ============

@api_router.get("/cart")
async def get_cart(request: Request):
    user = await get_current_user(request)
    cart_items = await db.cart.find({"user_id": user["_id"]}, {"_id": 0}).to_list(100)
    return cart_items

@api_router.post("/cart")
async def add_to_cart(item: CartItemAdd, request: Request):
    user = await get_current_user(request)
    
    # Get cake details
    cake = await db.cakes.find_one({"cake_id": item.cake_id}, {"_id": 0})
    if not cake:
        raise HTTPException(status_code=404, detail="Cake not found")
    
    # Calculate price based on weight
    weight_multiplier = {
        "500g": 1.0,
        "1kg": 2.0,
        "1.5kg": 3.0,
        "2kg": 4.0
    }
    price = cake["base_price"] * weight_multiplier.get(item.weight, 1.0)
    
    cart_item = {
        "cart_item_id": str(uuid.uuid4()),
        "user_id": user["_id"],
        "cake_id": item.cake_id,
        "cake_name": cake["name"],
        "cake_image": cake["image_url"],
        "weight": item.weight,
        "flavor": item.flavor,
        "message": item.message,
        "delivery_date": item.delivery_date,
        "quantity": item.quantity,
        "price": price,
        "added_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.cart.insert_one(cart_item)
    return {"message": "Added to cart", "cart_item_id": cart_item["cart_item_id"]}

@api_router.delete("/cart/{cart_item_id}")
async def remove_from_cart(cart_item_id: str, request: Request):
    user = await get_current_user(request)
    
    result = await db.cart.delete_one({"cart_item_id": cart_item_id, "user_id": user["_id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Cart item not found")
    
    return {"message": "Removed from cart"}

@api_router.delete("/cart")
async def clear_cart(request: Request):
    user = await get_current_user(request)
    await db.cart.delete_many({"user_id": user["_id"]})
    return {"message": "Cart cleared"}

# ============ Order Routes ============

@api_router.post("/orders")
async def create_order(order_data: OrderCreate, request: Request):
    user = await get_current_user(request)
    
    # Format full address
    full_address = f"{order_data.street}, {order_data.city}, {order_data.state} - {order_data.pincode}"
    
    order_doc = {
        "order_id": str(uuid.uuid4()),
        "user_id": user["_id"],
        "user_name": order_data.user_name,
        "user_email": order_data.user_email,
        "user_mobile": order_data.user_mobile,
        "address": {
            "street": order_data.street,
            "city": order_data.city,
            "state": order_data.state,
            "pincode": order_data.pincode,
            "full_address": full_address
        },
        "items": order_data.items,
        "total_amount": order_data.total_amount,
        "payment_method": "COD",  # Force COD only
        "payment_status": "Pending",
        "order_status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.orders.insert_one(order_doc)
    
    # Clear user's cart only for cart-based orders
    if not order_data.is_direct_order:
        await db.cart.delete_many({"user_id": user["_id"]})
    
    logger.info(f"Order created: {order_doc['order_id']} for {order_data.user_email} ({order_data.user_mobile})")
    
    return {"message": "Order placed successfully", "order_id": order_doc["order_id"]}

@api_router.get("/orders")
async def get_orders(request: Request):
    user = await get_current_user(request)
    orders = await db.orders.find({"user_id": user["_id"]}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return orders

@api_router.get("/orders/{order_id}")
async def get_order(order_id: str, request: Request):
    user = await get_current_user(request)
    order = await db.orders.find_one({"order_id": order_id, "user_id": user["_id"]}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

# ============ Waitlist Routes ============

@api_router.post("/waitlist")
async def join_waitlist(data: WaitlistJoin, request: Request):
    user = await get_current_user(request)
    
    cake = await db.cakes.find_one({"cake_id": data.cake_id}, {"_id": 0})
    if not cake:
        raise HTTPException(status_code=404, detail="Cake not found")
    
    existing = await db.waitlist.find_one({"cake_id": data.cake_id, "user_id": user["_id"]})
    if existing:
        return {"message": "Already in waitlist"}
    
    waitlist_doc = {
        "waitlist_id": str(uuid.uuid4()),
        "user_id": user["_id"],
        "user_email": data.email,
        "cake_id": data.cake_id,
        "cake_name": cake["name"],
        "status": "waiting",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.waitlist.insert_one(waitlist_doc)
    return {"message": "Added to waitlist", "waitlist_id": waitlist_doc["waitlist_id"]}

@api_router.get("/waitlist")
async def get_waitlist(request: Request):
    user = await get_current_user(request)
    waitlist = await db.waitlist.find({"user_id": user["_id"]}, {"_id": 0}).to_list(100)
    return waitlist

# ============ Favorites Routes ============

@api_router.post("/favorites/{cake_id}")
async def add_favorite(cake_id: str, request: Request):
    user = await get_current_user(request)
    
    cake = await db.cakes.find_one({"cake_id": cake_id}, {"_id": 0})
    if not cake:
        raise HTTPException(status_code=404, detail="Cake not found")
    
    existing = await db.favorites.find_one({"cake_id": cake_id, "user_id": user["_id"]})
    if existing:
        return {"message": "Already in favorites"}
    
    fav_doc = {
        "favorite_id": str(uuid.uuid4()),
        "user_id": user["_id"],
        "cake_id": cake_id,
        "cake_name": cake["name"],
        "cake_image": cake["image_url"],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.favorites.insert_one(fav_doc)
    return {"message": "Added to favorites"}

@api_router.delete("/favorites/{cake_id}")
async def remove_favorite(cake_id: str, request: Request):
    user = await get_current_user(request)
    result = await db.favorites.delete_one({"cake_id": cake_id, "user_id": user["_id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Favorite not found")
    return {"message": "Removed from favorites"}

@api_router.get("/favorites")
async def get_favorites(request: Request):
    user = await get_current_user(request)
    favorites = await db.favorites.find({"user_id": user["_id"]}, {"_id": 0}).to_list(100)
    return favorites

# ============ Admin Routes ============

@api_router.get("/admin/orders")
async def admin_get_orders(request: Request, status: Optional[str] = None):
    await get_current_admin(request)
    query = {}
    if status:
        query["status"] = status
    orders = await db.orders.find(query, {"_id": 0}).sort("created_at", -1).to_list(200)
    return orders

@api_router.put("/admin/orders/{order_id}")
async def admin_update_order(order_id: str, status: str, request: Request):
    await get_current_admin(request)
    result = await db.orders.update_one(
        {"order_id": order_id},
        {"$set": {"order_status": status, "status": status}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"message": "Order updated"}

@api_router.delete("/admin/orders/{order_id}")
async def admin_delete_order(order_id: str, request: Request):
    await get_current_admin(request)
    result = await db.orders.delete_one({"order_id": order_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"message": "Order deleted successfully"}

@api_router.delete("/admin/orders")
async def admin_delete_all_orders(request: Request):
    await get_current_admin(request)
    result = await db.orders.delete_many({})
    return {"message": f"{result.deleted_count} orders deleted successfully", "deleted_count": result.deleted_count}

@api_router.get("/admin/users")
async def admin_get_users(request: Request):
    await get_current_admin(request)
    users = await db.users.find({}, {"_id": 0, "password_hash": 0}).to_list(200)
    return users

@api_router.get("/admin/waitlist")
async def admin_get_waitlist(request: Request):
    await get_current_admin(request)
    waitlist = await db.waitlist.find({}, {"_id": 0}).to_list(200)
    return waitlist

@api_router.get("/admin/stats")
async def admin_get_stats(request: Request):
    await get_current_admin(request)
    
    total_users = await db.users.count_documents({"role": "user"})
    total_orders = await db.orders.count_documents({})
    total_cakes = await db.cakes.count_documents({})
    pending_orders = await db.orders.count_documents({"status": "pending"})
    
    # Calculate total revenue
    pipeline = [
        {"$group": {"_id": None, "total": {"$sum": "$total_amount"}}}
    ]
    revenue_result = await db.orders.aggregate(pipeline).to_list(1)
    total_revenue = revenue_result[0]["total"] if revenue_result else 0
    
    return {
        "total_users": total_users,
        "total_orders": total_orders,
        "total_cakes": total_cakes,
        "pending_orders": pending_orders,
        "total_revenue": total_revenue
    }

# Include router in app
app.include_router(api_router)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()