import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogIn, Eye, EyeOff, Lock, User } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { aclApi } from '../../api/resources/acl.api';
import axios from 'axios';
import { storage } from '../../utils/storage';
import { useAuthStore } from '../../store/auth.store';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser, setPermissions } = useAuthStore();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const oktaEnabled = storage.isOktaEnabled();

  useEffect(() => {
    if (storage.getToken()) {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  const handleOktaLogin = () => {
    window.location.href = '/int-login';
  };

  const handleBasicLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Username and password are required.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post('/login', { username, password });
      const { token, refreshToken } = res.data as { token: string; refreshToken?: string };
      storage.setToken(token);
      if (refreshToken) storage.setRefreshToken(refreshToken);

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-blue-600/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo + brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-blue-600 shadow-lg mb-4">
            <span className="text-white text-2xl font-bold leading-none">R</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">ReactorCX</h1>
          <p className="text-sm text-slate-400 mt-1">Loyalty Program Management</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl shadow-black/30 p-8">
          {error && <ErrorMessage message={error} className="mb-5" />}

          {oktaEnabled ? (
            <div className="space-y-4">
              <p className="text-sm text-center text-slate-500">
                Sign in using your organization account.
              </p>
              <Button className="w-full h-10" onClick={handleOktaLogin}>
                <LogIn size={16} className="mr-2" />
                Sign in with OKTA
              </Button>
            </div>
          ) : (
            <form onSubmit={handleBasicLogin} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="username" className="text-sm font-medium text-slate-700">
                  Username
                </Label>
                <div className="relative">
                  <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="username"
                    className="pl-9 h-10"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoFocus
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                  Password
                </Label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    className="pl-9 pr-10 h-10"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    onClick={() => setShowPassword((v) => !v)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full h-10 mt-1" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Signing in…
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <LogIn size={16} />
                    Sign In
                  </span>
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
