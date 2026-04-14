import requests
import sys
import json
from datetime import datetime

class CakeShopAPITester:
    def __init__(self, base_url="https://flour-power-frontend.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.session = requests.Session()
        self.admin_token = None
        self.user_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

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
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        if headers:
            test_headers.update(headers)

        try:
            if method == 'GET':
                response = self.session.get(url, headers=test_headers)
            elif method == 'POST':
                response = self.session.post(url, json=data, headers=test_headers)
            elif method == 'PUT':
                response = self.session.put(url, json=data, headers=test_headers)
            elif method == 'DELETE':
                response = self.session.delete(url, headers=test_headers)

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

    def test_auth_endpoints(self):
        """Test authentication endpoints"""
        print("\n🔐 Testing Authentication Endpoints...")
        
        # Test admin login
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "auth/login",
            200,
            data={"email": "admin@cakeshop.com", "password": "Admin@123"}
        )
        
        if success:
            print(f"   Admin user data: {response}")
        
        # Test user registration
        test_user_email = f"test_user_{datetime.now().strftime('%H%M%S')}@test.com"
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data={"name": "Test User", "email": test_user_email, "password": "TestPass123!"}
        )
        
        if success:
            print(f"   New user created: {response}")
        
        # Test user login
        success, response = self.run_test(
            "User Login",
            "POST",
            "auth/login",
            200,
            data={"email": test_user_email, "password": "TestPass123!"}
        )
        
        # Test auth/me endpoint
        self.run_test(
            "Get Current User",
            "GET",
            "auth/me",
            200
        )
        
        # Test forgot password
        self.run_test(
            "Forgot Password",
            "POST",
            "auth/forgot-password",
            200,
            data={"email": "admin@cakeshop.com"}
        )
        
        # Test logout
        self.run_test(
            "Logout",
            "POST",
            "auth/logout",
            200,
            data={}
        )

    def test_cake_endpoints(self):
        """Test cake-related endpoints"""
        print("\n🍰 Testing Cake Endpoints...")
        
        # Test get all cakes
        success, cakes_data = self.run_test(
            "Get All Cakes",
            "GET",
            "cakes",
            200
        )
        
        if success and cakes_data:
            print(f"   Found {len(cakes_data)} cakes")
            
            # Test get specific cake
            if len(cakes_data) > 0:
                cake_id = cakes_data[0].get('cake_id')
                if cake_id:
                    self.run_test(
                        "Get Specific Cake",
                        "GET",
                        f"cakes/{cake_id}",
                        200
                    )
        
        # Test search cakes
        self.run_test(
            "Search Cakes",
            "GET",
            "cakes?search=chocolate",
            200
        )
        
        # Test filter by category
        self.run_test(
            "Filter Cakes by Category",
            "GET",
            "cakes?category=Chocolate",
            200
        )

    def test_admin_endpoints(self):
        """Test admin-only endpoints"""
        print("\n👑 Testing Admin Endpoints...")
        
        # First login as admin
        success, response = self.run_test(
            "Admin Login for Admin Tests",
            "POST",
            "auth/login",
            200,
            data={"email": "admin@cakeshop.com", "password": "Admin@123"}
        )
        
        if not success:
            print("❌ Cannot test admin endpoints - admin login failed")
            return
        
        # Test admin stats
        success, stats_data = self.run_test(
            "Get Admin Stats",
            "GET",
            "admin/stats",
            200
        )
        
        if success:
            print(f"   Stats: {stats_data}")
        
        # Test get all users
        self.run_test(
            "Get All Users (Admin)",
            "GET",
            "admin/users",
            200
        )
        
        # Test get all orders
        self.run_test(
            "Get All Orders (Admin)",
            "GET",
            "admin/orders",
            200
        )
        
        # Test create new cake
        new_cake_data = {
            "name": "Test Cake",
            "description": "A test cake for API testing",
            "base_price": 500,
            "image_url": "https://example.com/test-cake.jpg",
            "category": "Special",
            "stock": 5,
            "in_stock": True,
            "flavors": ["Test Flavor"]
        }
        
        success, created_cake = self.run_test(
            "Create New Cake (Admin)",
            "POST",
            "cakes",
            200,
            data=new_cake_data
        )
        
        if success and created_cake:
            cake_id = created_cake.get('cake_id')
            print(f"   Created cake with ID: {cake_id}")
            
            # Test update cake
            update_data = {
                "base_price": 600,
                "in_stock": False
            }
            
            self.run_test(
                "Update Cake (Admin)",
                "PUT",
                f"cakes/{cake_id}",
                200,
                data=update_data
            )
            
            # Test delete cake
            self.run_test(
                "Delete Cake (Admin)",
                "DELETE",
                f"cakes/{cake_id}",
                200
            )

    def test_cart_endpoints(self):
        """Test cart endpoints"""
        print("\n🛒 Testing Cart Endpoints...")
        
        # Login as user first
        test_user_email = f"cart_test_{datetime.now().strftime('%H%M%S')}@test.com"
        success, response = self.run_test(
            "User Login for Cart Tests",
            "POST",
            "auth/login",
            200,
            data={"email": "admin@cakeshop.com", "password": "Admin@123"}  # Use admin for simplicity
        )
        
        if not success:
            print("❌ Cannot test cart endpoints - user login failed")
            return
        
        # Test get empty cart
        self.run_test(
            "Get Cart",
            "GET",
            "cart",
            200
        )
        
        # Get a cake to add to cart
        success, cakes_data = self.run_test(
            "Get Cakes for Cart Test",
            "GET",
            "cakes",
            200
        )
        
        if success and cakes_data and len(cakes_data) > 0:
            cake_id = cakes_data[0].get('cake_id')
            
            # Test add to cart
            cart_item = {
                "cake_id": cake_id,
                "weight": "1kg",
                "flavor": "Chocolate",
                "message": "Test message",
                "delivery_date": "2024-12-25",
                "quantity": 1
            }
            
            success, cart_response = self.run_test(
                "Add to Cart",
                "POST",
                "cart",
                200,
                data=cart_item
            )
            
            if success:
                # Test clear cart
                self.run_test(
                    "Clear Cart",
                    "DELETE",
                    "cart",
                    200
                )

    def test_error_cases(self):
        """Test error handling"""
        print("\n⚠️ Testing Error Cases...")
        
        # Test invalid login
        self.run_test(
            "Invalid Login",
            "POST",
            "auth/login",
            401,
            data={"email": "invalid@test.com", "password": "wrongpass"}
        )
        
        # Test non-existent cake
        self.run_test(
            "Get Non-existent Cake",
            "GET",
            "cakes/invalid-cake-id",
            404
        )
        
        # Test unauthorized admin access
        # First logout
        self.run_test(
            "Logout for Unauthorized Test",
            "POST",
            "auth/logout",
            200,
            data={}
        )
        
        # Try to access admin stats without auth
        self.run_test(
            "Unauthorized Admin Access",
            "GET",
            "admin/stats",
            401
        )

    def run_all_tests(self):
        """Run all test suites"""
        print("🚀 Starting CakeShop API Tests...")
        print(f"Testing against: {self.base_url}")
        
        try:
            self.test_auth_endpoints()
            self.test_cake_endpoints()
            self.test_admin_endpoints()
            self.test_cart_endpoints()
            self.test_error_cases()
            
        except Exception as e:
            print(f"❌ Test suite failed with exception: {str(e)}")
        
        # Print summary
        print(f"\n📊 Test Results Summary:")
        print(f"Tests Run: {self.tests_run}")
        print(f"Tests Passed: {self.tests_passed}")
        print(f"Tests Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%" if self.tests_run > 0 else "0%")
        
        # Print failed tests
        failed_tests = [t for t in self.test_results if not t['success']]
        if failed_tests:
            print(f"\n❌ Failed Tests:")
            for test in failed_tests:
                print(f"   - {test['test']}: {test['details']}")
        
        return self.tests_passed == self.tests_run

def main():
    tester = CakeShopAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())