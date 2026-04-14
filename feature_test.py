#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime, timedelta

class CakeShopFeatureTester:
    def __init__(self, base_url="https://flour-power-frontend.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.admin_token = None
        self.user_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        self.created_order_id = None

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}")
        else:
            print(f"❌ {name} - {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        if headers:
            test_headers.update(headers)

        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers)

            success = response.status_code == expected_status
            details = f"Status: {response.status_code}"
            
            if not success:
                try:
                    error_data = response.json()
                    details += f", Error: {error_data.get('detail', 'Unknown error')}"
                except:
                    details += f", Response: {response.text[:100]}"

            self.log_test(name, success, details)
            return success, response.json() if success and response.content else {}

        except Exception as e:
            self.log_test(name, False, f"Exception: {str(e)}")
            return False, {}

    def setup_auth(self):
        """Setup admin and user authentication"""
        print("🔐 Setting up authentication...")
        
        # Admin login
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "/auth/login",
            200,
            data={"email": "admin@cakeshop.com", "password": "Admin@123"}
        )
        if success and 'token' in response:
            self.admin_token = response['token']
        
        # User registration and login
        test_email = f"testuser_{datetime.now().strftime('%H%M%S')}@test.com"
        success, response = self.run_test(
            "User Registration",
            "POST",
            "/auth/register",
            200,
            data={"name": "Test User", "email": test_email, "password": "TestPass123!"}
        )
        if success and 'token' in response:
            self.user_token = response['token']

    def get_auth_headers(self, admin=False):
        """Get authorization headers"""
        token = self.admin_token if admin else self.user_token
        return {'Authorization': f'Bearer {token}'} if token else {}

    def test_cart_functionality(self):
        """Test complete cart functionality"""
        print("\n🛒 Testing Cart Functionality...")
        
        if not self.user_token:
            self.log_test("Cart Tests", False, "No user token available")
            return

        headers = self.get_auth_headers(admin=False)
        
        # Get empty cart
        success, cart_response = self.run_test("Get Empty Cart", "GET", "/cart", 200, headers=headers)
        
        # Get first cake for testing
        success, cakes_response = self.run_test("Get Cakes for Cart Test", "GET", "/cakes", 200)
        if not success or not cakes_response:
            self.log_test("Cart Add Item", False, "No cakes available for testing")
            return
            
        cake = cakes_response[0]
        tomorrow = (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d')
        
        # Add item to cart with different weights
        cart_items = [
            {
                "cake_id": cake['cake_id'],
                "weight": "500g",
                "flavor": "Chocolate",
                "message": "Test message 1",
                "delivery_date": tomorrow,
                "quantity": 1
            },
            {
                "cake_id": cake['cake_id'],
                "weight": "1kg",
                "flavor": "Vanilla",
                "message": "Test message 2",
                "delivery_date": tomorrow,
                "quantity": 2
            }
        ]
        
        cart_item_ids = []
        for i, item in enumerate(cart_items):
            success, add_response = self.run_test(
                f"Add Item {i+1} to Cart", 
                "POST", 
                "/cart", 
                200, 
                data=item, 
                headers=headers
            )
            if success and 'cart_item_id' in add_response:
                cart_item_ids.append(add_response['cart_item_id'])
        
        # Get cart with items
        success, cart_response = self.run_test("Get Cart with Items", "GET", "/cart", 200, headers=headers)
        if success:
            print(f"   Cart has {len(cart_response)} items")
        
        # Remove one item from cart
        if cart_item_ids:
            self.run_test(
                "Remove Item from Cart", 
                "DELETE", 
                f"/cart/{cart_item_ids[0]}", 
                200, 
                headers=headers
            )
        
        # Verify cart after removal
        success, cart_response = self.run_test("Get Cart After Removal", "GET", "/cart", 200, headers=headers)
        if success:
            print(f"   Cart has {len(cart_response)} items after removal")

    def test_order_functionality(self):
        """Test complete order functionality"""
        print("\n📦 Testing Order Functionality...")
        
        if not self.user_token:
            self.log_test("Orders Tests", False, "No user token available")
            return

        headers = self.get_auth_headers(admin=False)
        
        # Get user orders (should be empty initially)
        success, orders_response = self.run_test("Get User Orders", "GET", "/orders", 200, headers=headers)
        if success:
            print(f"   User has {len(orders_response)} existing orders")
        
        # Create a test order
        success, cakes_response = self.run_test("Get Cakes for Order Test", "GET", "/cakes", 200)
        if not success or not cakes_response:
            self.log_test("Create Order", False, "No cakes available for testing")
            return
            
        cake = cakes_response[0]
        order_data = {
            "items": [{
                "cake_id": cake['cake_id'],
                "cake_name": cake['name'],
                "weight": "1kg",
                "flavor": "Chocolate",
                "message": "Happy Testing!",
                "quantity": 1,
                "price": cake['base_price'] * 2  # 1kg = 2x price
            }],
            "total_amount": cake['base_price'] * 2,
            "user_name": "Test User",
            "user_email": "test@example.com",
            "user_mobile": "9876543210",
            "street": "123 Test Street",
            "city": "Test City",
            "state": "Test State",
            "pincode": "123456",
            "is_direct_order": True
        }
        
        success, order_response = self.run_test(
            "Create Order", 
            "POST", 
            "/orders", 
            200, 
            data=order_data, 
            headers=headers
        )
        
        if success and 'order_id' in order_response:
            self.created_order_id = order_response['order_id']
            print(f"   Created order: {self.created_order_id}")
        
        # Get orders after creation
        success, orders_response = self.run_test("Get Orders After Creation", "GET", "/orders", 200, headers=headers)
        if success:
            print(f"   User now has {len(orders_response)} orders")
        
        # Get specific order
        if self.created_order_id:
            self.run_test(
                "Get Specific Order", 
                "GET", 
                f"/orders/{self.created_order_id}", 
                200, 
                headers=headers
            )

    def test_admin_orders_functionality(self):
        """Test admin orders management functionality"""
        print("\n👨‍💼 Testing Admin Orders Functionality...")
        
        if not self.admin_token:
            self.log_test("Admin Orders Tests", False, "No admin token available")
            return

        headers = self.get_auth_headers(admin=True)
        
        # Get all orders
        success, orders_response = self.run_test("Admin Get All Orders", "GET", "/admin/orders", 200, headers=headers)
        if success:
            print(f"   Total orders in system: {len(orders_response)}")
        
        # Get orders by different statuses
        statuses = ['pending', 'confirmed', 'delivered', 'cancelled']
        for status in statuses:
            success, status_orders = self.run_test(
                f"Admin Get {status.title()} Orders", 
                "GET", 
                f"/admin/orders?status={status}", 
                200, 
                headers=headers
            )
            if success:
                print(f"   {status.title()} orders: {len(status_orders)}")
        
        # Get admin stats
        success, stats_response = self.run_test("Admin Get Stats", "GET", "/admin/stats", 200, headers=headers)
        if success:
            print(f"   Stats: {stats_response}")
        
        # Test order status update if we have orders
        if success and orders_response:
            order_id = orders_response[0]['order_id']
            
            # Update to confirmed
            self.run_test(
                "Admin Update Order to Confirmed", 
                "PUT", 
                f"/admin/orders/{order_id}?status=confirmed", 
                200, 
                headers=headers
            )
            
            # Update to delivered
            self.run_test(
                "Admin Update Order to Delivered", 
                "PUT", 
                f"/admin/orders/{order_id}?status=delivered", 
                200, 
                headers=headers
            )
            
            # Update to cancelled
            self.run_test(
                "Admin Update Order to Cancelled", 
                "PUT", 
                f"/admin/orders/{order_id}?status=cancelled", 
                200, 
                headers=headers
            )

    def test_cake_detail_functionality(self):
        """Test cake detail endpoint"""
        print("\n🍰 Testing Cake Detail Functionality...")
        
        # Get all cakes first
        success, cakes_response = self.run_test("Get All Cakes", "GET", "/cakes", 200)
        if not success or not cakes_response:
            self.log_test("Cake Detail Tests", False, "No cakes available for testing")
            return
        
        # Test getting specific cake details
        cake = cakes_response[0]
        success, cake_detail = self.run_test(
            "Get Cake Detail", 
            "GET", 
            f"/cakes/{cake['cake_id']}", 
            200
        )
        
        if success:
            print(f"   Cake: {cake_detail.get('name', 'Unknown')}")
            print(f"   Price: ₹{cake_detail.get('base_price', 0)}")
            print(f"   In Stock: {cake_detail.get('in_stock', False)}")
            print(f"   Flavors: {cake_detail.get('flavors', [])}")

    def run_all_tests(self):
        """Run all feature tests"""
        print("🧪 Starting CakeShop Feature Tests...")
        print(f"🔗 Testing against: {self.base_url}")
        print("=" * 60)
        
        # Setup authentication
        self.setup_auth()
        
        if not self.admin_token:
            print("❌ Admin authentication failed")
        if not self.user_token:
            print("❌ User authentication failed")
        
        # Run feature tests
        self.test_cake_detail_functionality()
        self.test_cart_functionality()
        self.test_order_functionality()
        self.test_admin_orders_functionality()
        
        # Print summary
        print("\n" + "=" * 60)
        print(f"📊 Tests completed: {self.tests_passed}/{self.tests_run} passed")
        
        # Print failed tests
        failed_tests = [test for test in self.test_results if not test['success']]
        if failed_tests:
            print("\n❌ Failed Tests:")
            for test in failed_tests:
                print(f"   - {test['test']}: {test['details']}")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All feature tests passed!")
            return 0
        else:
            print("⚠️  Some tests failed")
            return 1

def main():
    tester = CakeShopFeatureTester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())