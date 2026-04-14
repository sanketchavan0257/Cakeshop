import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    console.log('Token from URL:', tokenParam);
    
    if (!tokenParam) {
      toast.error('Invalid reset link - no token provided');
      navigate('/login');
    } else {
      setToken(tokenParam);
      console.log('Token set:', tokenParam.substring(0, 10) + '...');
    }
  }, [searchParams, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    console.log('Attempting password reset with token:', token.substring(0, 10) + '...');

    setLoading(true);
    try {
      const response = await axios.post(`${API}/auth/reset-password`, {
        token,
        new_password: password,
      });

      console.log('Password reset response:', response.data);
      toast.success('Password reset successful!');
      
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (error) {
      console.error('Password reset error:', error);
      console.error('Error response:', error.response?.data);
      
      const message = error.response?.data?.detail || 'Failed to reset password';
      
      // Show specific error messages
      if (message.includes('expired')) {
        toast.error('Reset link has expired. Please request a new one.');
      } else if (message.includes('Invalid')) {
        toast.error('Invalid reset link. Please request a new one.');
      } else {
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAF7] dark:bg-[#2C1E16] px-4">
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="bg-white dark:bg-[#3C2E26] border border-[rgba(44,30,22,0.15)] rounded-lg p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#D0B8A8]/20 rounded-full mb-4">
              <Lock className="h-8 w-8 text-[#D0B8A8]" />
            </div>
            <h1
              className="text-3xl font-bold text-[#2C1E16] dark:text-[#FAFAF7] mb-2"
              style={{ fontFamily: "'Playfair Display', serif" }}
              data-testid="reset-password-heading"
            >
              Set New Password
            </h1>
            <p className="text-[#5C4A3D] dark:text-[#D0B8A8]">
              Create a strong password for your account
            </p>
          </div>

          <form onSubmit={handleSubmit} data-testid="reset-password-form">
            <div className="space-y-4">
              <div>
                <Label htmlFor="password" className="text-[#2C1E16] dark:text-[#FAFAF7]">
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="Enter new password"
                    className="border-[rgba(44,30,22,0.15)] focus:ring-1 focus:ring-[#2C1E16] pr-10"
                    data-testid="password-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#5C4A3D]"
                    data-testid="toggle-password"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                <p className="text-xs text-[#5C4A3D] dark:text-[#D0B8A8] mt-1">
                  Must be at least 6 characters
                </p>
              </div>

              <div>
                <Label htmlFor="confirmPassword" className="text-[#2C1E16] dark:text-[#FAFAF7]">
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Confirm new password"
                  className="border-[rgba(44,30,22,0.15)] focus:ring-1 focus:ring-[#2C1E16]"
                  data-testid="confirm-password-input"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full text-sm uppercase tracking-wide bg-[#D0B8A8] hover:bg-[#B89B88] text-white"
                data-testid="submit-button"
              >
                {loading ? 'Resetting Password...' : 'Reset Password'}
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-sm text-[#D0B8A8] hover:text-[#B89B88]"
              data-testid="back-to-login"
            >
              Remember your password? Login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
