import axios from 'axios';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSun, FaMoon, FaUser, FaLock, FaSignInAlt, FaEye, FaEyeSlash } from 'react-icons/fa';

export const Loginpage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  useEffect(() => {
    const themeName = isDark ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', themeName);
    localStorage.setItem('theme', themeName);
  }, [isDark]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/Home'); 
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const cleanUsername = formData.username.trim();
    const cleanPassword = formData.password.trim();

    if (!cleanUsername || !cleanPassword) {
      setError('يرجى إدخال اسم المستخدم وكلمة المرور بشكل صحيح');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/token/`, {
        username: cleanUsername,
        password: cleanPassword
      }, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = response.data;
      const token = data.access || data.token;

      if (token) {
        localStorage.setItem('token', token);

        try {
          const profileRes = await axios.get(`${import.meta.env.VITE_API_URL}/profile/`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          const profile = profileRes.data;
          
          // التحقق بدقة: هل هو السوبر يوزر الحقيقي أم لا؟
          const isRealSuperUser = profile.is_superuser === true;

          localStorage.setItem(
            'user',
            JSON.stringify({
              id: profile.id,
              username: profile.username || cleanUsername,
              name: profile.first_name || profile.username || cleanUsername,
              role: profile.role,
              isAdmin: isRealSuperUser, // سيصبح true فقط لسوبر يوزر الموقع الحقيقي
              branch_name_display: profile.branch_name_display,
              profile_pic: profile.profile_pic,
              points: profile.points,
            })
          );
        } catch (profileErr) {
          console.warn('تعذر جلب بيانات البروفايل:', profileErr);
          localStorage.setItem(
            'user',
            JSON.stringify({
              username: cleanUsername,
              name: cleanUsername,
              role: '',
              isAdmin: false,
            })
          );
        }

        navigate('/Home');
      } else {
        setError('فشل في تسجيل الدخول');
      }

    } catch (err) {
      console.error('Login error:', err.response?.data || err.message);

      const errorData = err.response?.data;
      setError(
        errorData?.detail ||
        errorData?.non_field_errors?.[0] ||
        'اسم المستخدم أو كلمة المرور غير صحيحة'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='main' style={{
      backgroundColor: isDark ? "var(--bg-primary-dark, #0f172a)" : "var(--bg-primary-light, #f8fafc)",
      minHeight: '100vh',
      width: '100%',
      margin: 0,
      padding: 0,
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      overflowX: 'hidden',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>
      <style>{`
        @media (max-width: 768px) {
          .toggle-btn {
            padding: 16px 20px !important;
          }
          .card-container {
            padding: 12px !important;
          }
          .login-card {
            flex-direction: column !important;
          }
          .login-form-area {
            padding: 30px 20px !important;
          }
        }
      `}</style>

      <div className="toggle-btn" style={{ padding: '20px 40px', display: 'flex', justifyContent: 'flex-start', boxSizing: 'border-box', width: '100%' }}>
        <button onClick={toggleTheme} style={{
          color: isDark ? '#ffffff' : '#1f2937',
          backgroundColor: isDark ? "var(--bg-card-dark, #1e293b)" : "#e5e7eb",
          border: `1px solid ${isDark ? "var(--border-dark, #334155)" : "var(--border-light, #cbd5e1)"}`,
          padding: '10px 20px',
          borderRadius: '30px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontWeight: 'bold',
          transition: 'all 0.3s ease'
        }}>
          {isDark ? <FaSun color="#f59e0b" size={16} /> : <FaMoon color="#6b7280" size={16} />}
          <span>{isDark ? "الوضع المضيء" : "الوضع الداكن"}</span>
        </button>
      </div>

      <div className="card-container" style={{
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
        boxSizing: 'border-box',
        width: '100%'
      }}>
        <div className="login-card" style={{
          backgroundColor: isDark ? "var(--bg-card-dark, #1e293b)" : "var(--bg-card-light, #ffffff)",
          boxShadow: isDark ? "0 20px 30px -10px rgba(0, 0, 0, 0.5)" : "0 20px 30px -10px rgba(0, 0, 0, 0.05)",
          border: `1px solid ${isDark ? "var(--border-dark, #334155)" : "var(--border-light, #cbd5e1)"}`,
          width: '100%',
          maxWidth: '900px',
          borderRadius: '24px',
          display: 'flex',
          flexWrap: 'wrap',
          overflow: 'hidden',
          boxSizing: 'border-box'
        }}>

          <div style={{
            flex: '1 1 300px',
            backgroundColor: isDark ? "#10b981" : "#059669",
            padding: '50px 40px',
            color: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            boxSizing: 'border-box'
          }}>
            <FaSignInAlt size={70} style={{ marginBottom: '24px', opacity: 0.9 }} />
            <h2 style={{ fontSize: '26px', fontWeight: 'bold', marginBottom: '12px' }}>نظام إدارة الموظفين</h2>
            <p style={{ fontSize: '15px', lineHeight: '1.6', opacity: 0.85, maxWidth: '300px' }}>
              مرحباً بك مجدداً! قم بتسجيل الدخول للانضمام الي المنصه وبدأ التفاعل والتصويت
            </p>
          </div>

          <div className="login-form-area" style={{ flex: '1.2 1 350px', padding: '50px 40px', boxSizing: 'border-box' }}>
            <h3 style={{
              color: isDark ? "var(--text-primary-dark, #f8fafc)" : "var(--text-primary-light, #0f172a)",
              fontSize: '24px',
              marginBottom: '25px',
              fontWeight: 'bold'
            }}>
              تسجيل الدخول
            </h3>

            {error && (
              <div style={{
                color: '#ef4444',
                backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : '#fee2e2',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                padding: '12px',
                borderRadius: '10px',
                marginBottom: '20px',
                textAlign: 'center',
                fontSize: '14px',
                fontWeight: 'bold',
                boxSizing: 'border-box'
              }}>
                {error}
              </div>
            )}

            <form className='login-form' onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', boxSizing: 'border-box' }}>

              <div style={{ width: '100%', boxSizing: 'border-box' }}>
                <label style={{
                  display: 'block',
                  color: isDark ? "var(--text-primary-dark, #f8fafc)" : "var(--text-primary-light, #0f172a)",
                  fontSize: '13px',
                  marginBottom: '8px',
                  fontWeight: 'bold',
                  opacity: 0.8
                }}>
                  اسم المستخدم
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%', boxSizing: 'border-box' }}>
                  <input
                    type="text"
                    placeholder='ادخل اسم المستخدم'
                    required
                    name='username'
                    value={formData.username}
                    onChange={handleChange}
                    className='input'
                    style={{
                      width: '100%',
                      backgroundColor: isDark ? '#0f172a' : '#f8fafc',
                      color: isDark ? "var(--text-primary-dark, #f8fafc)" : "var(--text-primary-light, #0f172a)",
                      border: `1px solid ${isDark ? "var(--border-dark, #334155)" : "var(--border-light, #cbd5e1)"}`,
                      padding: '12px 15px 12px 40px',
                      borderRadius: '10px',
                      outline: 'none',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                  <FaUser style={{ position: 'absolute', left: '15px', color: '#9ca3af' }} />
                </div>
              </div>

              <div style={{ width: '100%', boxSizing: 'border-box' }}>
                <label style={{
                  display: 'block',
                  color: isDark ? "var(--text-primary-dark, #f8fafc)" : "var(--text-primary-light, #0f172a)",
                  fontSize: '13px',
                  marginBottom: '8px',
                  fontWeight: 'bold',
                  opacity: 0.8
                }}>
                  كلمة المرور
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%', boxSizing: 'border-box' }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder='ادخل كلمة المرور'
                    required
                    name='password'
                    value={formData.password}
                    onChange={handleChange}
                    className='input'
                    style={{
                      width: '100%',
                      backgroundColor: isDark ? '#0f172a' : '#f8fafc',
                      color: isDark ? "var(--text-primary-dark, #f8fafc)" : "var(--text-primary-light, #0f172a)",
                      border: `1px solid ${isDark ? "var(--border-dark, #334155)" : "var(--border-light, #cbd5e1)"}`,
                      padding: '12px 40px 12px 40px',
                      borderRadius: '10px',
                      outline: 'none',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                  <FaLock style={{ position: 'absolute', left: '15px', color: '#9ca3af' }} />

                  <div
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '15px',
                      color: '#9ca3af',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className='sub-btn'
                style={{
                  backgroundColor: loading ? '#9ca3af' : (isDark ? "#10b981" : "#059669"),
                  color: '#ffffff',
                  border: 'none',
                  padding: '14px',
                  borderRadius: '10px',
                  fontWeight: 'bold',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '15px',
                  marginTop: '10px',
                  transition: 'background-color 0.2s ease',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  boxSizing: 'border-box',
                  width: '100%'
                }}
              >
                {loading ? "جاري التحقق..." : "تسجيل الدخول"}
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};