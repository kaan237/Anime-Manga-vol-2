import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff, FiStar } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Tüm alanları doldurun.');
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Hoş geldiniz! 👋');
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Giriş başarısız.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.08) 0%, transparent 60%), #080808',
      padding: '24px'
    }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          width: '100%', maxWidth: '420px',
          background: '#141414', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '20px', padding: '40px',
          boxShadow: '0 40px 80px rgba(0,0,0,0.5)'
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px', justifyContent: 'center' }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(124,58,237,0.4)'
          }}>
            <FiStar size={20} style={{ color: 'white' }} />
          </div>
          <span style={{
            fontFamily: 'Outfit,sans-serif', fontWeight: '800', fontSize: '1.5rem',
            background: 'linear-gradient(135deg, #a78bfa, #7c3aed)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>
            AniTrack
          </span>
        </div>

        <h2 style={{ fontWeight: '700', fontSize: '1.4rem', color: 'white', textAlign: 'center', margin: '0 0 6px' }}>
          Tekrar Hoş Geldiniz
        </h2>
        <p style={{ color: '#52525b', fontSize: '0.9rem', textAlign: 'center', marginBottom: '28px' }}>
          Hesabınıza giriş yapın
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#71717a', display: 'block', marginBottom: '7px' }}>
              E-posta
            </label>
            <div style={{ position: 'relative' }}>
              <FiMail size={16} style={{
                position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                color: '#52525b', pointerEvents: 'none'
              }} />
              <input
                type="email" value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="ornek@mail.com"
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px',
                  padding: '12px 14px 12px 42px', color: 'white', fontSize: '0.9rem', outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={e => e.target.style.border = '1px solid #7c3aed'}
                onBlur={e => e.target.style.border = '1px solid rgba(255,255,255,0.08)'}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#71717a', display: 'block', marginBottom: '7px' }}>
              Şifre
            </label>
            <div style={{ position: 'relative' }}>
              <FiLock size={16} style={{
                position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                color: '#52525b', pointerEvents: 'none'
              }} />
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px',
                  padding: '12px 42px 12px 42px', color: 'white', fontSize: '0.9rem', outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={e => e.target.style.border = '1px solid #7c3aed'}
                onBlur={e => e.target.style.border = '1px solid rgba(255,255,255,0.08)'}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{
                  position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: '#52525b', cursor: 'pointer'
                }}
              >
                {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '13px', borderRadius: '10px', marginTop: '8px',
              background: loading ? 'rgba(124,58,237,0.5)' : 'linear-gradient(135deg, #7c3aed, #4f46e5)',
              border: 'none', color: 'white', fontWeight: '700', fontSize: '0.95rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 8px 25px rgba(124,58,237,0.3)', transition: 'all 0.2s'
            }}
          >
            {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '0.9rem', color: '#52525b', marginTop: '24px' }}>
          Hesabınız yok mu?{' '}
          <Link to="/register" style={{ color: '#a78bfa', textDecoration: 'none', fontWeight: '600' }}>
            Kayıt Ol
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
