import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiStar, FiCheck } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const passwordStrength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const strengthColors = ['transparent', '#ef4444', '#f59e0b', '#10b981'];
  const strengthLabels = ['', 'Zayıf', 'Orta', 'Güçlü'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !email || !password) {
      toast.error('Tüm alanları doldurun.');
      return;
    }
    if (password.length < 6) {
      toast.error('Şifre en az 6 karakter olmalı.');
      return;
    }
    setLoading(true);
    try {
      await register(username, email, password);
      toast.success('Hesabınız oluşturuldu! Hoş geldiniz 🎉');
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Kayıt başarısız.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (focused) => ({
    width: '100%', background: 'rgba(255,255,255,0.04)',
    border: `1px solid ${focused ? '#7c3aed' : 'rgba(255,255,255,0.08)'}`,
    borderRadius: '10px', padding: '12px 14px 12px 42px',
    color: 'white', fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.2s'
  });

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
          Hesap Oluştur
        </h2>
        <p style={{ color: '#52525b', fontSize: '0.9rem', textAlign: 'center', marginBottom: '28px' }}>
          Ücretsiz kayıt ol, takibe başla
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Username */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#71717a', display: 'block', marginBottom: '7px' }}>
              Kullanıcı Adı
            </label>
            <div style={{ position: 'relative' }}>
              <FiUser size={16} style={{
                position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                color: '#52525b', pointerEvents: 'none'
              }} />
              <input
                type="text" value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="kullanici_adi"
                maxLength={30}
                style={inputStyle(false)}
                onFocus={e => e.target.style.border = '1px solid #7c3aed'}
                onBlur={e => e.target.style.border = '1px solid rgba(255,255,255,0.08)'}
              />
            </div>
          </div>

          {/* Email */}
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
                style={inputStyle(false)}
                onFocus={e => e.target.style.border = '1px solid #7c3aed'}
                onBlur={e => e.target.style.border = '1px solid rgba(255,255,255,0.08)'}
              />
            </div>
          </div>

          {/* Password */}
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
                placeholder="En az 6 karakter"
                style={inputStyle(false)}
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
            {password && (
              <div style={{ marginTop: '8px' }}>
                <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                  {[1,2,3].map(i => (
                    <div key={i} style={{
                      flex: 1, height: '3px', borderRadius: '99px',
                      background: passwordStrength >= i ? strengthColors[passwordStrength] : 'rgba(255,255,255,0.08)',
                      transition: 'background 0.3s'
                    }} />
                  ))}
                </div>
                <span style={{ fontSize: '0.72rem', color: strengthColors[passwordStrength], fontWeight: '600' }}>
                  {strengthLabels[passwordStrength]}
                </span>
              </div>
            )}
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
            {loading ? 'Oluşturuluyor...' : 'Kayıt Ol'}
          </button>
        </form>

        {/* Features */}
        <div style={{
          marginTop: '20px', padding: '14px', borderRadius: '10px',
          background: 'rgba(124,58,237,0.05)', border: '1px solid rgba(124,58,237,0.1)'
        }}>
          {['Anime, Manga, Film & Dizi takip', 'Kişisel puanlama sistemi', 'İlerleme takibi'].map(feat => (
            <div key={feat} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <FiCheck size={13} style={{ color: '#7c3aed', flexShrink: 0 }} />
              <span style={{ fontSize: '0.78rem', color: '#71717a' }}>{feat}</span>
            </div>
          ))}
        </div>

        <p style={{ textAlign: 'center', fontSize: '0.9rem', color: '#52525b', marginTop: '20px' }}>
          Zaten hesabınız var mı?{' '}
          <Link to="/login" style={{ color: '#a78bfa', textDecoration: 'none', fontWeight: '600' }}>
            Giriş Yap
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
