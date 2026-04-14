#!/usr/bin/env python3
"""
Backend API Testing for CakeCraft Application
CRITICAL: This test does NOT create ghost users. Only tests existing functionality.
"""

import requests
import sys
import json
from datetime import datetime

class CakeCraftAPITester:
    def __init__(self):
        self.base_url = "https://flour-power-frontend.preview.emergentagent.com/api"
        self.admin_token = None
        self.test_user_token = None
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
        url = f"{self.base_url}{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        if headers:
            test_headers.update(headers)

        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

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

    def test_admin_login(self):
        """Test admin login with known credentials"""
        print("\n🔐 Testing Admin Authentication...")
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "/auth/login",
            200,
            data={"email": "admin@cakeshop.com", "password": "Admin@123"}
        )
        if success and 'token' in response:
            self.admin_token = response['token']
            return True
        return False

    def test_admin_stats(self):
        """Test admin stats endpoint"""
        if not self.admin_token:
            self.log_test("Admin Stats", False, "No admin token")
            return False
            
        headers = {'Authorization': f'Bearer {self.admin_token}'}
        success, response = self.run_test(
            "Admin Stats",
            "GET",
            "/admin/stats",
            200,
            headers=headers
        )
        
        if success:
            required_fields = ['total_users', 'total_orders', 'total_cakes', 'total_revenue']
            for field in required_fields:
                if field not in response:
                    self.log_test(f"Admin Stats - {field} field", False, "Missing field")
                    return False
                else:
                    self.log_test(f"Admin Stats - {field} field", True)
        
        return success

    def test_cakes_endpoint(self):
        """Test cakes listing endpoint"""
        print("\n🍰 Testing Cakes API...")
        success, response = self.run_test(
            "Get Cakes List",
            "GET",
            "/cakes",
            200
        )
        
        if success and isinstance(response, list):
            self.log_test("Cakes List Format", True, f"Found {len(response)} cakes")
            
            # Test individual cake details if cakes exist
            if len(response) > 0:
                first_cake = response[0]
                if 'cake_id' in first_cake:
                    cake_success, cake_data = self.run_test(
                        "Get Individual Cake",
                        "GET",
                        f"/cakes/{first_cake['cake_id']}",
                        200
                    )
                    return cake_success
        else:
            self.log_test("Cakes List Format", False, "Invalid response format")
            
        return success

    def test_auth_endpoints(self):
        """Test auth endpoints without creating users"""
        print("\n🔒 Testing Auth Endpoints...")
        
        # Test /auth/me without token (should fail)
        success, _ = self.run_test(
            "Auth Me (No Token)",
            "GET",
            "/auth/me",
            401
        )
        
        # Test /auth/me with admin token (should succeed)
        if self.admin_token:
            headers = {'Authorization': f'Bearer {self.admin_token}'}
            success, response = self.run_test(
                "Auth Me (Admin Token)",
                "GET",
                "/auth/me",
                200,
                headers=headers
            )
            
            if success and response.get('role') == 'admin':
                self.log_test("Admin Role Verification", True)
            else:
                self.log_test("Admin Role Verification", False, "Role mismatch")
        
        return True

    def test_admin_users_endpoint(self):
        """Test admin users endpoint and count users"""
        print("\n👥 Testing Admin Users Endpoint...")
        if not self.admin_token:
            self.log_test("Admin Users", False, "No admin token")
            return False
            
        headers = {'Authorization': f'Bearer {self.admin_token}'}
        success, response = self.run_test(
            "Admin Get Users",
            "GET",
            "/admin/users",
            200,
            headers=headers
        )
        
        if success and isinstance(response, list):
            user_count = len(response)
            self.log_test("Users Count Check", True, f"Found {user_count} users")
            
            # Log user details for verification
            print(f"📊 Current users in database: {user_count}")
            for user in response:
                print(f"   - {user.get('email', 'Unknown')} ({user.get('role', 'user')})")
                
            return True
        else:
            self.log_test("Users List Format", False, "Invalid response format")
            return False

    def test_admin_orders_endpoint(self):
        """Test admin orders endpoint"""
        print("\n📦 Testing Admin Orders Endpoint...")
        if not self.admin_token:
            self.log_test("Admin Orders", False, "No admin token")
            return False
            
        headers = {'Authorization': f'Bearer {self.admin_token}'}
        success, response = self.run_test(
            "Admin Get Orders",
            "GET",
            "/admin/orders",
            200,
            headers=headers
        )
        
        if success:
            orders_count = len(response) if isinstance(response, list) else 0
            self.log_test("Orders List", True, f"Found {orders_count} orders")
            return True
        
        return success

    def test_cart_endpoints_without_auth(self):
        """Test cart endpoints without authentication (should fail)"""
        print("\n🛒 Testing Cart Endpoints (No Auth)...")
        
        # These should all return 401
        endpoints = [
            ("/cart", "GET"),
            ("/cart", "POST"),
            ("/cart", "DELETE")
        ]
        
        for endpoint, method in endpoints:
            success, _ = self.run_test(
                f"Cart {method} (No Auth)",
                method,
                endpoint,
                401,
                data={} if method == "POST" else None
            )

    def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting CakeCraft Backend API Tests")
        print("=" * 50)
        
        # Test admin login first
        if not self.test_admin_login():
            print("❌ Admin login failed - stopping tests")
            return False
            
        # Run all other tests
        self.test_admin_stats()
        self.test_cakes_endpoint()
        self.test_auth_endpoints()
        self.test_admin_users_endpoint()
        self.test_admin_orders_endpoint()
        self.test_cart_endpoints_without_auth()
        
        # Print summary
        print("\n" + "=" * 50)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return True
        else:
            print("⚠️  Some tests failed")
            return False

def main():
    """Main test runner"""
    tester = CakeCraftAPITester()
    success = tester.run_all_tests()
    
    # Save test results
    with open('/tmp/backend_test_results.json', 'w') as f:
        json.dump({
            'timestamp': datetime.now().isoformat(),
            'tests_run': tester.tests_run,
            'tests_passed': tester.tests_passed,
            'success_rate': tester.tests_passed / tester.tests_run if tester.tests_run > 0 else 0,
            'results': tester.test_results
        }, f, indent=2)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())