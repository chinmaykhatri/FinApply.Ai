'use client';
import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import PillButton from '@/components/ui/PillButton';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    window.location.href = '/admin';
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div style={{ maxWidth: 400, width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: '#fff' }}>FinApply.ai</h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.40)', marginTop: 8 }}>
            Admin Dashboard — Sign In
          </p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <input
            type="email"
            className="form-field"
            placeholder="Admin Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            className="form-field"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && (
            <div
              className="animate-shake"
              style={{
                background: 'rgba(220,38,38,0.10)',
                border: '1px solid rgba(220,38,38,0.25)',
                borderRadius: 8,
                padding: '10px 16px',
                fontSize: 13,
                color: '#DC2626',
              }}
            >
              {error}
            </div>
          )}

          <PillButton type="submit" variant="primary" fullWidth large loading={loading}>
            Sign In
          </PillButton>
        </form>
      </div>
    </div>
  );
}
