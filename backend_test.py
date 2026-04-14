#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime
import uuid

class CakeShopAuthTester:
    def __init__(self, base_url="https://flour-power-frontend.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.user_data = None
        self.tests_run = 0
        self.tests_passed = 0
        self.admin_email = "admin@cakeshop.com"
        self.admin_password = "Admin@123"

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        print(f"   Method: {method}")
        if data:
            print(f"   Data: {json.dumps(data, indent=2)}")
        
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
            
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2)}")
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {json.dumps(error_data, indent=2)}")
                except:
                    print(f"   Error: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_admin_login(self):
        """Test admin login and store token"""
        print(f"\n🔐 Testing Admin Login with {self.admin_email}")
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "/auth/login",
            200,
            data={"email": self.admin_email, "password": self.admin_password}
        )
        
        if success and 'token' in response:
            self.token = response['token']
            self.user_data = response
            print(f"✅ Admin login successful, token stored")
            print(f"   User role: {response.get('role')}")
            print(f"   User email: {response.get('email')}")
            return True
        else:
            print(f"❌ Admin login failed - no token in response")
            return False

    def test_auth_me(self):
        """Test /auth/me endpoint with token"""
        if not self.token:
            print("❌ No token available for /auth/me test")
            return False
            
        success, response = self.run_test(
            "Auth Me (Protected Route)",
            "GET",
            "/auth/me",
            200
        )
        
        if success:
            print(f"✅ /auth/me successful")
            print(f"   User: {response.get('name')} ({response.get('email')})")
            print(f"   Role: {response.get('role')}")
            return True
        return False

    def test_user_registration(self):
        """Test user registration"""
        test_user_email = f"testuser_{datetime.now().strftime('%H%M%S')}@test.com"
        test_user_data = {
            "name": "Test User",
            "email": test_user_email,
            "password": "TestPass123!"
        }
        
        success, response = self.run_test(
            "User Registration",
            "POST",
            "/auth/register",
            200,
            data=test_user_data
        )
        
        if success and 'token' in response:
            print(f"✅ User registration successful")
            print(f"   New user: {response.get('name')} ({response.get('email')})")
            print(f"   Role: {response.get('role')}")
            print(f"   Token received: {response.get('token')[:20]}...")
            return True, test_user_email, response.get('token')
        return False, None, None

    def test_user_login(self, email, password):
        """Test user login"""
        success, response = self.run_test(
            "User Login",
            "POST",
            "/auth/login",
            200,
            data={"email": email, "password": password}
        )
        
        if success and 'token' in response:
            print(f"✅ User login successful")
            return True, response.get('token')
        return False, None

    def test_admin_stats(self):
        """Test admin stats endpoint"""
        if not self.token:
            print("❌ No admin token for stats test")
            return False
            
        success, response = self.run_test(
            "Admin Stats",
            "GET",
            "/admin/stats",
            200
        )
        
        if success:
            print(f"✅ Admin stats retrieved")
            print(f"   Total Users: {response.get('total_users')}")
            print(f"   Total Orders: {response.get('total_orders')}")
            print(f"   Total Cakes: {response.get('total_cakes')}")
            print(f"   Total Revenue: ₹{response.get('total_revenue')}")
            return True
        return False

    def test_cakes_endpoint(self):
        """Test cakes endpoint"""
        success, response = self.run_test(
            "Get Cakes",
            "GET",
            "/cakes",
            200
        )
        
        if success:
            cakes_count = len(response) if isinstance(response, list) else 0
            print(f"✅ Cakes endpoint working - {cakes_count} cakes found")
            return True
        return False

    def test_logout(self):
        """Test logout endpoint"""
        success, response = self.run_test(
            "Logout",
            "POST",
            "/auth/logout",
            200,
            data={}
        )
        
        if success:
            print(f"✅ Logout successful")
            # Clear token after logout
            self.token = None
            return True
        return False

    def test_unauthorized_access(self):
        """Test that protected routes require authentication"""
        # Temporarily clear token
        original_token = self.token
        self.token = None
        
        success, response = self.run_test(
            "Unauthorized Access to /auth/me",
            "GET",
            "/auth/me",
            401  # Should fail without token
        )
        
        # Restore token
        self.token = original_token
        
        if success:  # We expect this to return 401, which means success
            print(f"✅ Unauthorized access properly blocked")
            return True
        else:
            print(f"❌ Unauthorized access was allowed - security issue!")
            return False

def main():
    print("🧪 Starting CakeShop Auth Testing")
    print("=" * 50)
    
    tester = CakeShopAuthTester()
    
    # Test sequence
    tests_results = []
    
    # 1. Test admin login
    print("\n📋 PHASE 1: Admin Authentication")
    admin_login_success = tester.test_admin_login()
    tests_results.append(("Admin Login", admin_login_success))
    
    if not admin_login_success:
        print("❌ Admin login failed - stopping tests")
        return 1
    
    # 2. Test protected route with admin token
    auth_me_success = tester.test_auth_me()
    tests_results.append(("Auth Me (Admin)", auth_me_success))
    
    # 3. Test admin stats
    admin_stats_success = tester.test_admin_stats()
    tests_results.append(("Admin Stats", admin_stats_success))
    
    # 4. Test user registration
    print("\n📋 PHASE 2: User Registration & Login")
    reg_success, test_email, user_token = tester.test_user_registration()
    tests_results.append(("User Registration", reg_success))
    
    if reg_success and test_email:
        # 5. Test user login
        user_login_success, login_token = tester.test_user_login(test_email, "TestPass123!")
        tests_results.append(("User Login", user_login_success))
    
    # 6. Test public endpoints
    print("\n📋 PHASE 3: Public Endpoints")
    cakes_success = tester.test_cakes_endpoint()
    tests_results.append(("Get Cakes", cakes_success))
    
    # 7. Test logout
    print("\n📋 PHASE 4: Logout & Security")
    logout_success = tester.test_logout()
    tests_results.append(("Logout", logout_success))
    
    # 8. Test unauthorized access
    unauthorized_success = tester.test_unauthorized_access()
    tests_results.append(("Unauthorized Access Block", unauthorized_success))
    
    # Print summary
    print("\n" + "=" * 50)
    print("📊 TEST SUMMARY")
    print("=" * 50)
    
    for test_name, success in tests_results:
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
    
    passed = sum(1 for _, success in tests_results if success)
    total = len(tests_results)
    
    print(f"\n📈 Overall: {passed}/{total} tests passed ({passed/total*100:.1f}%)")
    
    if passed == total:
        print("🎉 All auth tests passed!")
        return 0
    else:
        print("⚠️  Some auth tests failed - check implementation")
        return 1

if __name__ == "__main__":
    sys.exit(main())