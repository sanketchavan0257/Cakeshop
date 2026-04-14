"""
Cake Shop API Tests
Tests for: Auth, Cakes, Cart, Orders (including direct order flow)
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://cake-craft-plus.preview.emergentagent.com').rstrip('/')

# Test user credentials
TEST_USER_EMAIL = f"testuser_{uuid.uuid4().hex[:8]}@test.com"
TEST_USER_PASSWORD = "TestPass123"
TEST_USER_NAME = "Test User"

# Admin credentials
ADMIN_EMAIL = "admin@cakeshop.com"
ADMIN_PASSWORD = "Admin@123"


class TestHealthAndCakes:
    """Basic health and cake listing tests"""
    
    def test_get_cakes_list(self):
        """Test GET /api/cakes returns list of cakes"""
        response = requests.get(f"{BASE_URL}/api/cakes")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        # Verify cake structure
        cake = data[0]
        assert "cake_id" in cake
        assert "name" in cake
        assert "base_price" in cake
        assert "in_stock" in cake
        print(f"✓ Found {len(data)} cakes")
    
    def test_get_single_cake(self):
        """Test GET /api/cakes/:cake_id returns cake details"""
        # First get a cake_id
        cakes_response = requests.get(f"{BASE_URL}/api/cakes")
        cakes = cakes_response.json()
        cake_id = cakes[0]["cake_id"]
        
        response = requests.get(f"{BASE_URL}/api/cakes/{cake_id}")
        assert response.status_code == 200
        cake = response.json()
        assert cake["cake_id"] == cake_id
        assert "name" in cake
        assert "description" in cake
        assert "base_price" in cake
        assert "flavors" in cake
        print(f"✓ Got cake: {cake['name']}")
    
    def test_get_nonexistent_cake(self):
        """Test GET /api/cakes/:cake_id returns 404 for invalid ID"""
        response = requests.get(f"{BASE_URL}/api/cakes/nonexistent-id-12345")
        assert response.status_code == 404


class TestAuth:
    """Authentication tests"""
    
    def test_register_new_user(self):
        """Test user registration"""
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "name": TEST_USER_NAME,
            "email": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == TEST_USER_EMAIL.lower()
        assert data["name"] == TEST_USER_NAME
        assert data["role"] == "user"
        print(f"✓ Registered user: {TEST_USER_EMAIL}")
    
    def test_register_duplicate_email(self):
        """Test duplicate email registration fails"""
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "name": "Another User",
            "email": TEST_USER_EMAIL,
            "password": "AnotherPass123"
        })
        assert response.status_code == 400
        print("✓ Duplicate email rejected")
    
    def test_login_valid_credentials(self):
        """Test login with valid credentials"""
        session = requests.Session()
        response = session.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == TEST_USER_EMAIL.lower()
        # Check cookie is set
        assert "access_token" in session.cookies
        print(f"✓ Login successful for: {TEST_USER_EMAIL}")
    
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_USER_EMAIL,
            "password": "WrongPassword"
        })
        assert response.status_code == 401
        print("✓ Invalid credentials rejected")
    
    def test_admin_login(self):
        """Test admin login"""
        session = requests.Session()
        response = session.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        assert data["role"] == "admin"
        print("✓ Admin login successful")
    
    def test_get_me_authenticated(self):
        """Test GET /api/auth/me with valid session"""
        session = requests.Session()
        # Login first
        session.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD
        })
        
        response = session.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == TEST_USER_EMAIL.lower()
        print("✓ GET /me returned user data")
    
    def test_get_me_unauthenticated(self):
        """Test GET /api/auth/me without auth"""
        response = requests.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 401
        print("✓ Unauthenticated /me rejected")


class TestCart:
    """Cart functionality tests"""
    
    @pytest.fixture
    def auth_session(self):
        """Create authenticated session"""
        session = requests.Session()
        session.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD
        })
        return session
    
    @pytest.fixture
    def cake_id(self):
        """Get a valid cake_id"""
        response = requests.get(f"{BASE_URL}/api/cakes")
        cakes = response.json()
        in_stock_cakes = [c for c in cakes if c.get("in_stock")]
        return in_stock_cakes[0]["cake_id"]
    
    def test_add_to_cart_with_quantity(self, auth_session, cake_id):
        """Test adding item to cart with quantity"""
        response = auth_session.post(f"{BASE_URL}/api/cart", json={
            "cake_id": cake_id,
            "weight": "1kg",
            "flavor": "Chocolate",
            "message": "Happy Birthday",
            "delivery_date": "2026-04-15",
            "quantity": 2
        })
        assert response.status_code == 200
        data = response.json()
        assert "cart_item_id" in data
        print(f"✓ Added to cart with quantity 2, cart_item_id: {data['cart_item_id']}")
        return data["cart_item_id"]
    
    def test_add_to_cart_default_quantity(self, auth_session, cake_id):
        """Test adding item to cart with default quantity (1)"""
        response = auth_session.post(f"{BASE_URL}/api/cart", json={
            "cake_id": cake_id,
            "weight": "500g",
            "flavor": "Vanilla",
            "message": "",
            "delivery_date": "2026-04-16",
            "quantity": 1
        })
        assert response.status_code == 200
        data = response.json()
        assert "cart_item_id" in data
        print("✓ Added to cart with default quantity 1")
    
    def test_get_cart(self, auth_session):
        """Test getting cart items"""
        response = auth_session.get(f"{BASE_URL}/api/cart")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        if len(data) > 0:
            item = data[0]
            assert "cart_item_id" in item
            assert "cake_name" in item
            assert "quantity" in item
            assert "price" in item
        print(f"✓ Cart has {len(data)} items")
    
    def test_add_to_cart_unauthenticated(self, cake_id):
        """Test adding to cart without auth fails"""
        response = requests.post(f"{BASE_URL}/api/cart", json={
            "cake_id": cake_id,
            "weight": "1kg",
            "flavor": "Chocolate",
            "message": "",
            "delivery_date": "2026-04-15",
            "quantity": 1
        })
        assert response.status_code == 401
        print("✓ Unauthenticated cart add rejected")
    
    def test_remove_from_cart(self, auth_session, cake_id):
        """Test removing item from cart"""
        # First add an item
        add_response = auth_session.post(f"{BASE_URL}/api/cart", json={
            "cake_id": cake_id,
            "weight": "1kg",
            "flavor": "Chocolate",
            "message": "",
            "delivery_date": "2026-04-17",
            "quantity": 1
        })
        cart_item_id = add_response.json()["cart_item_id"]
        
        # Then remove it
        response = auth_session.delete(f"{BASE_URL}/api/cart/{cart_item_id}")
        assert response.status_code == 200
        print("✓ Removed item from cart")


class TestOrders:
    """Order functionality tests including direct order flow"""
    
    @pytest.fixture
    def auth_session(self):
        """Create authenticated session"""
        session = requests.Session()
        session.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD
        })
        return session
    
    @pytest.fixture
    def cake_data(self):
        """Get cake data for order"""
        response = requests.get(f"{BASE_URL}/api/cakes")
        cakes = response.json()
        in_stock_cake = [c for c in cakes if c.get("in_stock")][0]
        return {
            "cake_id": in_stock_cake["cake_id"],
            "cake_name": in_stock_cake["name"],
            "cake_image": in_stock_cake["image_url"],
            "weight": "1kg",
            "flavor": "Chocolate",
            "message": "Test Order",
            "delivery_date": "2026-04-20",
            "quantity": 1,
            "price": in_stock_cake["base_price"] * 2  # 1kg = 2x base price
        }
    
    def test_place_cart_order(self, auth_session, cake_data):
        """Test placing order from cart (is_direct_order=False)"""
        # First add to cart
        auth_session.post(f"{BASE_URL}/api/cart", json={
            "cake_id": cake_data["cake_id"],
            "weight": "1kg",
            "flavor": "Chocolate",
            "message": "Cart Order Test",
            "delivery_date": "2026-04-21",
            "quantity": 1
        })
        
        # Get cart items
        cart_response = auth_session.get(f"{BASE_URL}/api/cart")
        cart_items = cart_response.json()
        
        # Place order with is_direct_order=False
        response = auth_session.post(f"{BASE_URL}/api/orders", json={
            "items": cart_items,
            "total_amount": sum(item["price"] * item["quantity"] for item in cart_items),
            "user_name": "Test User",
            "user_email": TEST_USER_EMAIL,
            "user_mobile": "9876543210",
            "street": "123 Test Street",
            "city": "Test City",
            "state": "Test State",
            "pincode": "123456",
            "is_direct_order": False
        })
        assert response.status_code == 200
        data = response.json()
        assert "order_id" in data
        print(f"✓ Cart order placed: {data['order_id']}")
        
        # Verify cart is cleared
        cart_after = auth_session.get(f"{BASE_URL}/api/cart")
        assert len(cart_after.json()) == 0
        print("✓ Cart cleared after cart-based order")
    
    def test_place_direct_order(self, auth_session, cake_data):
        """Test placing direct order (is_direct_order=True) - cart should NOT be cleared"""
        # First add something to cart to verify it's not cleared
        auth_session.post(f"{BASE_URL}/api/cart", json={
            "cake_id": cake_data["cake_id"],
            "weight": "500g",
            "flavor": "Vanilla",
            "message": "Should remain in cart",
            "delivery_date": "2026-04-25",
            "quantity": 1
        })
        
        # Get cart count before direct order
        cart_before = auth_session.get(f"{BASE_URL}/api/cart")
        cart_count_before = len(cart_before.json())
        
        # Place direct order
        direct_order_item = {
            "cake_id": cake_data["cake_id"],
            "cake_name": cake_data["cake_name"],
            "cake_image": cake_data["cake_image"],
            "weight": "1kg",
            "flavor": "Chocolate",
            "message": "Direct Order Test",
            "delivery_date": "2026-04-22",
            "quantity": 2,
            "price": cake_data["price"] * 2
        }
        
        response = auth_session.post(f"{BASE_URL}/api/orders", json={
            "items": [direct_order_item],
            "total_amount": direct_order_item["price"],
            "user_name": "Test User",
            "user_email": TEST_USER_EMAIL,
            "user_mobile": "9876543210",
            "street": "456 Direct Street",
            "city": "Direct City",
            "state": "Direct State",
            "pincode": "654321",
            "is_direct_order": True
        })
        assert response.status_code == 200
        data = response.json()
        assert "order_id" in data
        print(f"✓ Direct order placed: {data['order_id']}")
        
        # Verify cart is NOT cleared
        cart_after = auth_session.get(f"{BASE_URL}/api/cart")
        cart_count_after = len(cart_after.json())
        assert cart_count_after == cart_count_before
        print(f"✓ Cart NOT cleared after direct order (still has {cart_count_after} items)")
    
    def test_get_user_orders(self, auth_session):
        """Test getting user's orders"""
        response = auth_session.get(f"{BASE_URL}/api/orders")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        if len(data) > 0:
            order = data[0]
            assert "order_id" in order
            assert "items" in order
            assert "total_amount" in order
            assert "order_status" in order
        print(f"✓ User has {len(data)} orders")
    
    def test_place_order_unauthenticated(self, cake_data):
        """Test placing order without auth fails"""
        response = requests.post(f"{BASE_URL}/api/orders", json={
            "items": [cake_data],
            "total_amount": cake_data["price"],
            "user_name": "Test User",
            "user_email": "test@test.com",
            "user_mobile": "9876543210",
            "street": "123 Test Street",
            "city": "Test City",
            "state": "Test State",
            "pincode": "123456",
            "is_direct_order": False
        })
        assert response.status_code == 401
        print("✓ Unauthenticated order rejected")


class TestAdminOrders:
    """Admin order management tests"""
    
    @pytest.fixture
    def admin_session(self):
        """Create admin authenticated session"""
        session = requests.Session()
        session.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        return session
    
    def test_admin_get_all_orders(self, admin_session):
        """Test admin can get all orders"""
        response = admin_session.get(f"{BASE_URL}/api/admin/orders")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Admin can see {len(data)} orders")
    
    def test_admin_get_stats(self, admin_session):
        """Test admin can get stats"""
        response = admin_session.get(f"{BASE_URL}/api/admin/stats")
        assert response.status_code == 200
        data = response.json()
        assert "total_users" in data
        assert "total_orders" in data
        assert "total_cakes" in data
        print(f"✓ Admin stats: {data['total_orders']} orders, {data['total_users']} users")
    
    def test_non_admin_cannot_access_admin_routes(self):
        """Test non-admin users cannot access admin routes"""
        session = requests.Session()
        session.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD
        })
        
        response = session.get(f"{BASE_URL}/api/admin/orders")
        assert response.status_code == 403
        print("✓ Non-admin rejected from admin routes")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
