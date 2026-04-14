import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(name, email, password);
      toast.success('Account created successfully!');
      navigate('/');
    } catch (error) {
      const message = error.response?.data?.detail || 'Registration failed';
      toast.error(typeof message === 'string' ? message : 'Failed to create account');
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
          <Link
            to="/"
            className="text-3xl font-bold text-[#2C1E16] dark:text-[#FAFAF7] block text-center mb-2"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            CakeCraft
          </Link>
          <p className="text-center text-[#5C4A3D] dark:text-[#D0B8A8] mb-8">
            Create your account to start ordering
          </p>

          <form onSubmit={handleSubmit} data-testid="register-form">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-[#2C1E16] dark:text-[#FAFAF7]">
                  Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="border-[rgba(44,30,22,0.15)] focus:ring-1 focus:ring-[#2C1E16]"
                  data-testid="name-input"
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-[#2C1E16] dark:text-[#FAFAF7]">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-[rgba(44,30,22,0.15)] focus:ring-1 focus:ring-[#2C1E16]"
                  data-testid="email-input"
                />
              </div>

              <div>
                <Label htmlFor="password" className="text-[#2C1E16] dark:text-[#FAFAF7]">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="border-[rgba(44,30,22,0.15)] focus:ring-1 focus:ring-[#2C1E16] pr-10"
                    data-testid="password-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#5C4A3D]"
                    data-testid="toggle-password-visibility"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full text-sm uppercase tracking-wide bg-[#D0B8A8] hover:bg-[#B89B88] text-white"
                data-testid="register-submit-button"
              >
                {loading ? 'Creating account...' : 'Sign Up'}
              </Button>
            </div>
          </form>

          <p className="text-center mt-6 text-[#5C4A3D] dark:text-[#D0B8A8]">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-[#D0B8A8] hover:text-[#B89B88] font-semibold"
              data-testid="login-link"
            >
              Login
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
