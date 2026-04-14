import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [resetLink, setResetLink] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post(`${API}/auth/forgot-password`, { email }, {
        headers: { 'Content-Type': 'application/json' }
      });
      
      toast.success('Password reset link sent to your email!');
      setSubmitted(true);
      
      // For demo purposes, show the reset link if email wasn't sent
      if (data.reset_link) {
        setResetLink(data.reset_link);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to send reset link';
      
      // Show specific error for invalid email
      if (errorMsg.includes('Invalid email') || errorMsg.includes('not registered')) {
        toast.error('Invalid email ID. This email is not registered.');
      } else {
        toast.error(errorMsg);
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
            <h1
              className="text-3xl font-bold text-[#2C1E16] dark:text-[#FAFAF7] mb-2"
              style={{ fontFamily: "'Playfair Display', serif" }}
              data-testid="forgot-password-heading"
            >
              Reset Password
            </h1>
            <p className="text-[#5C4A3D] dark:text-[#D0B8A8]">
              {submitted
                ? 'Check your email for reset instructions'
                : 'Enter your email to receive a password reset link'}
            </p>
          </div>

          {!submitted ? (
            <form onSubmit={handleSubmit} data-testid="forgot-password-form">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-[#2C1E16] dark:text-[#FAFAF7]">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#5C4A3D]" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@cakeshop.com"
                      required
                      className="pl-10 border-[rgba(44,30,22,0.15)] focus:ring-1 focus:ring-[#2C1E16]"
                      data-testid="email-input"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full text-sm uppercase tracking-wide bg-[#D0B8A8] hover:bg-[#B89B88] text-white"
                  data-testid="submit-button"
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="bg-[#81B29A]/10 border border-[#81B29A]/30 rounded-lg p-4">
                <p className="text-sm text-[#2C1E16] dark:text-[#FAFAF7] mb-2">
                  ✓ Password reset email sent successfully!
                </p>
                <p className="text-xs text-[#5C4A3D] dark:text-[#D0B8A8]">
                  Please check your email and click the reset link.
                </p>
              </div>

              {resetLink && (
                <div className="bg-[#D0B8A8]/10 border border-[#D0B8A8]/30 rounded-lg p-4">
                  <p className="text-xs text-[#5C4A3D] dark:text-[#D0B8A8] mb-2">
                    <strong>Demo Mode:</strong> Reset link (in production, this would be sent via email):
                  </p>
                  <a
                    href={resetLink}
                    className="text-xs text-[#D0B8A8] hover:text-[#B89B88] break-all"
                    data-testid="reset-link"
                  >
                    {resetLink}
                  </a>
                </div>
              )}
            </div>
          )}

          <div className="mt-6">
            <Link
              to="/login"
              className="flex items-center justify-center text-[#D0B8A8] hover:text-[#B89B88] text-sm"
              data-testid="back-to-login"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
