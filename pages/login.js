import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Login() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    if (res.ok) {
      router.push('/dashboard');
    } else {
      setError('Incorrect password');
    }
  };

  return (
    <div className="wrap" style={{ maxWidth: 400, marginTop: 80 }}>
      <div className="sheet">
        <h2 style={{ fontFamily: 'Fraunces, serif', marginTop: 0 }}>Reviewer login</h2>
        <form onSubmit={submit}>
          <div className="field">
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} autoFocus />
          </div>
          {error && <p className="error-text">{error}</p>}
          <button className="nav primary" type="submit">Log in</button>
        </form>
      </div>
    </div>
  );
}
