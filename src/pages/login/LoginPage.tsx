import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogIn, Eye, EyeOff, Lock, User } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { aclApi } from '../../api/resources/acl.api';
import axios from 'axios';
import { storage } from '../../utils/storage';
import { useAuthStore } from '../../store/auth.store';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser, setPermissions } = useAuthStore();
  // Redirect back to the page the user tried to access before being sent to login
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const oktaEnabled = storage.isOktaEnabled();

  // If already authenticated, redirect home
  useEffect(() => {
    if (storage.getToken()) {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  // OKTA login: redirect to Express /int-login endpoint
  const handleOktaLogin = () => {
    window.location.href = '/int-login';
  };

  // Basic (non-OKTA) login
  const handleBasicLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Username and password are required.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // POST directly to /login — bypasses apiClient's /api baseURL so the
      // Vite proxy can forward it to the backend login endpoint correctly.
      const res = await axios.post('/login', { username, password });
      const { token, refreshToken } = res.data as { token: string; refreshToken?: string };
      storage.setToken(token);
      if (refreshToken) storage.setRefreshToken(refreshToken);

      // Load user info and permissions
      const [accountRes, permsRes] = await Promise.all([
        aclApi.getMyAccount(),
        aclApi.getRoles(),
      ]);
      const acc = accountRes.data as Record<string, unknown>;
      setUser({
        id: String(acc['id'] || ''),
        email: String(acc['email'] || ''),
        username: String(acc['username'] || acc['email'] || ''),
        division: acc['division'] ? String(acc['division']) : undefined,
        divisionName: acc['divisionName'] ? String(acc['divisionName']) : undefined,
      });
      const perms = Array.isArray(permsRes.data) ? permsRes.data : [];
      setPermissions(perms as string[]);

      navigate(from, { replace: true });
    } catch (err: unknown) {
      setError(
        (err as { message?: string })?.message || 'Login failed. Check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-700 px-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-blue-600 p-3">
              <Lock className="h-7 w-7 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">ReactorCX</CardTitle>
          <p className="text-sm text-gray-500 mt-1">Loyalty Program Management</p>
        </CardHeader>

        <CardContent className="pt-4">
          {error && <ErrorMessage message={error} />}

          {oktaEnabled ? (
            <div className="space-y-4 mt-4">
              <p className="text-sm text-center text-gray-600">
                Sign in using your organization account.
              </p>
              <Button className="w-full" size="lg" onClick={handleOktaLogin}>
                <LogIn size={18} className="mr-2" />
                Sign in with OKTA
              </Button>
            </div>
          ) : (
            <form onSubmit={handleBasicLogin} className="space-y-4 mt-4">
              <div className="space-y-1">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="username"
                    className="pl-9"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoFocus
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    className="pl-9 pr-10"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                <LogIn size={18} className="mr-2" />
                {loading ? 'Signing in…' : 'Sign In'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
