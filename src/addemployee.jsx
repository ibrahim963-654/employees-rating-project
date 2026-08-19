import axios from 'axios';
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FaSun, FaMoon, FaSignOutAlt, FaArrowRight, FaUserPlus, 
  FaUser, FaLock, FaBuilding, FaBriefcase, FaUserShield, FaCamera, FaStore, FaAt 
} from 'react-icons/fa';

export const AddEmployee = () => {
  const navigate = useNavigate();

  const userStored = JSON.parse(localStorage.getItem('user') || '{}');
  const isSuperUser = userStored.isAdmin === true;

  const ROLE_MAP = {
    ...(isSuperUser ? { 'أدمن': 'ADMIN' } : {}),
    'مدير': 'MANAGER',
    'إقليمي': 'REGIONAL',
    'محاسب': 'ACCOUNTANT',
    'كاشير': 'CASHIER',
    'مبيعات': 'SALES',
  };

  const [formdata, setFormdata] = useState({
    username: '',   
    name: '',       
    password: '',
    company_name: '',
    branch_name: '',  
    job: isSuperUser ? 'أدمن' : 'محاسب',
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');

  const API_URL = `${import.meta.env.VITE_API_URL}/users/`;

  const getToken = () => localStorage.getItem('token');

  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate('/');
      return;
    }

    const themeName = isDark ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', themeName);
    localStorage.setItem('theme', themeName);
  }, [isDark, navigate]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  const handlechange = (e) => {
    const { name, value } = e.target;
    setFormdata({ ...formdata, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlesubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const token = getToken();

    if (!formdata.username.trim()) {
      setErrorMsg('يجب كتابة اسم المستخدم لتسجيل الدخول');
      setLoading(false);
      return;
    }

    if (!formdata.company_name.trim()) {
      setErrorMsg('يجب كتابة اسم الشركة');
      setLoading(false);
      return;
    }

    if (!formdata.branch_name.trim()) {
      setErrorMsg('يجب كتابة اسم الفرع');
      setLoading(false);
      return;
    }

    if (!formdata.name.trim()) {
      setErrorMsg('يجب كتابة اسم الموظف');
      setLoading(false);
      return;
    }

    try {
      const submitData = new FormData();
      submitData.append('username', formdata.username.trim());
      submitData.append('first_name', formdata.name.trim());
      submitData.append('password', formdata.password);
      submitData.append('company_name', formdata.company_name.trim());
      submitData.append('branch_name', formdata.branch_name.trim());
      submitData.append('role', ROLE_MAP[formdata.job] || 'CASHIER');

      if (imageFile) {
        submitData.append('profile_pic', imageFile);
      }

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: submitData,
      });

      if (response.ok) {
        alert('تمت إضافة الموظف بنجاح! 🎉');
        navigate('/employees');
      } else {
        const errData = await response.json().catch(() => ({}));
        console.error('Server validation error:', errData);

        const firstError =
          errData.username?.[0] ||
          errData.password?.[0] ||
          errData.company_name?.[0] ||
          errData.branch_name?.[0] ||
          errData.role?.[0] ||
          errData.detail ||
          JSON.stringify(errData);

        setErrorMsg(firstError || 'حدث خطأ أثناء إضافة الموظف (ربما اسم المستخدم مستخدم من قبل)');
      }
    } catch (error) {
      console.error('خطأ الاتصال بالسيرفر:', error);
      setErrorMsg('تعذر الاتصال بالسيرفر، تأكد من تشغيل السيرفر بشكل صحيح.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div className="main" style={{ 
      backgroundColor: isDark ? "#0f172a" : "#e2e8f0", 
      minHeight: '100vh', 
      width: '100%',
      margin: 0,
      padding: 0,
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflowX: 'hidden',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>
      
      <style>{`
        @media (max-width: 768px) {
          .header-container {
            padding: 12px 16px !important;
            flex-direction: column !important;
            gap: 12px !important;
            align-items: stretch !important;
          }
          .header-actions {
            width: 100% !important;
            justify-content: space-between !important;
            flex-wrap: wrap !important;
            gap: 8px !important;
          }
          .form-wrapper {
            flex-direction: column !important;
          }
          .form-content-area {
            padding: 24px 20px !important;
          }
        }
      `}</style>

      <header className="header-container" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '16px 40px', 
        width: '100%',
        boxSizing: 'border-box',
        backgroundColor: isDark ? "#1e293b" : "#ffffff", 
        borderBottom: `1px solid ${isDark ? "#334155" : "#cbd5e1"}`,
        boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.03)',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <img src="/logo.png" alt="logo" style={{ width: '42px', height: '42px', objectFit: 'contain' }} />
          <h3 style={{ margin: 0, color: isDark ? "#f8fafc" : "#0f172a", fontSize: '19px', fontWeight: 'bold' }}>
            لوحة الإدارة
          </h3>
        </div>

        <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button onClick={toggleTheme} style={{ 
            color: isDark ? "#f8fafc" : "#1e293b", 
            backgroundColor: isDark ? "#0f172a" : "#cbd5e1", 
            border: `1px solid ${isDark ? "#334155" : "#94a3b8"}`, 
            padding: '9px 18px', 
            borderRadius: '30px', 
            cursor: 'pointer', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            fontWeight: '600',
            fontSize: '14px'
          }}>
            {isDark ? <FaSun color="#f59e0b" size={16} /> : <FaMoon color="#334155" size={16} />}
            <span>{isDark ? "الوضع المضيء" : "الوضع الداكن"}</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button onClick={handleLogout} style={{ 
              backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : '#fee2e2', 
              color: '#dc2626', 
              border: `1px solid ${isDark ? 'rgba(239, 68, 68, 0.2)' : '#fca5a5'}`, 
              padding: '9px 16px', 
              borderRadius: '10px', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              fontWeight: '600',
              fontSize: '14px'
            }}>
              <FaSignOutAlt />
              <span>تسجيل خروج</span>
            </button>

            <Link to="/employees" style={{ 
              backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#dcfce7', 
              color: isDark ? '#10b981' : '#15803d', 
              border: `1px solid ${isDark ? 'rgba(16, 185, 129, 0.3)' : '#bbf7d0'}`,
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              padding: '9px 16px', 
              borderRadius: '10px', 
              textDecoration: 'none', 
              fontWeight: '600',
              fontSize: '14px'
            }}>
              <FaArrowRight size={13} />
              <span>سجل الموظفين</span>
            </Link>
          </div>
        </div>
      </header>

      <div style={{ 
        flex: 1, 
        width: '100%', 
        display: 'grid', 
        placeItems: 'center', 
        padding: '30px 20px',
        boxSizing: 'border-box'
      }}>
        <div className="form-wrapper" style={{ 
          backgroundColor: isDark ? "#1e293b" : "#ffffff", 
          border: `1px solid ${isDark ? "#334155" : "#cbd5e1"}`, 
          width: '100%', 
          maxWidth: '850px', 
          borderRadius: '24px', 
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          overflow: 'hidden',
          boxShadow: isDark ? '0 20px 40px rgba(0,0,0,0.4)' : '0 10px 30px rgba(0,0,0,0.06)',
          boxSizing: 'border-box'
        }}>
          <div style={{ 
            flex: '1 1 300px', 
            backgroundColor: isDark ? "#059669" : "#10b981", 
            color: '#ffffff', 
            padding: '40px 30px', 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center', 
            alignItems: 'center',
            textAlign: 'center',
            boxSizing: 'border-box'
          }}>
            <div style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.2)', 
              padding: '20px', 
              borderRadius: '50%', 
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FaUserShield size={44} color="#ffffff" />
            </div>
            <h2 style={{ margin: '0 0 12px 0', fontSize: '24px', fontWeight: 'bold' }}>
              إدارة الشركات والموظفين
            </h2>
            <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.7', opacity: 0.9 }}>
              إضافة موظف جديد وتحديد اسم الشركة والفرع الخاص به بكل سهولة ومرونة.
            </p>
          </div>

          <div className="form-content-area" style={{ 
            flex: '1.2 1 350px', 
            padding: '36px 40px', 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center',
            boxSizing: 'border-box'
          }}>
            <h3 style={{ margin: '0 0 20px 0', color: isDark ? "#f8fafc" : "#0f172a", fontSize: '22px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FaUserPlus color="#10b981" /> إضافة موظف جديد
            </h3>

            {errorMsg && (
              <div style={{
                color: '#ef4444',
                backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : '#fee2e2',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                padding: '12px',
                borderRadius: '10px',
                marginBottom: '16px',
                textAlign: 'center',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>
                {errorMsg}
              </div>
            )}

            <form onSubmit={handlesubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%', boxSizing: 'border-box' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '4px' }}>
                <div style={{ position: 'relative', width: '64px', height: '64px', flexShrink: 0 }}>
                  {imagePreview ? (
                    <img 
                      src={imagePreview} 
                      alt="preview" 
                      style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '2px solid #10b981' }} 
                    />
                  ) : (
                    <div style={{ 
                      width: '100%', 
                      height: '100%', 
                      borderRadius: '50%', 
                      backgroundColor: isDark ? "#0f172a" : "#f1f5f9", 
                      border: `2px dashed ${isDark ? "#334155" : "#cbd5e1"}`,
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      color: '#94a3b8'
                    }}>
                      <FaUser size={24} />
                    </div>
                  )}
                  <label htmlFor="avatar-upload" style={{
                    position: 'absolute',
                    bottom: '0',
                    left: '0',
                    backgroundColor: '#10b981',
                    color: '#fff',
                    borderRadius: '50%',
                    padding: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                  }}>
                    <FaCamera size={12} />
                  </label>
                  <input 
                    id="avatar-upload" 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageChange} 
                    style={{ display: 'none' }} 
                  />
                </div>
                <div>
                  <label htmlFor="avatar-upload" style={{ fontSize: '13px', fontWeight: 'bold', color: isDark ? "#cbd5e1" : "#475569", cursor: 'pointer', display: 'block' }}>
                    صورة البروفايل (اختياري)
                  </label>
                  <span style={{ fontSize: '12px', color: isDark ? "#94a3b8" : "#64748b" }}>
                    اضغط لتغيير الصورة
                  </span>
                </div>
              </div>

              {/* حقل اسم المستخدم لتسجيل الدخول */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 'bold', color: isDark ? "#cbd5e1" : "#475569" }}>
                  اسم المستخدم (الذي سيقوم بتسجيل الدخول به)
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}>
                  <FaAt style={{ position: 'absolute', right: '14px', color: '#94a3b8' }} size={14} />
                  <input 
                    type="text" 
                    placeholder='مثال: ahmed_kashier' 
                    required 
                    name='username'
                    value={formdata.username}
                    onChange={handlechange}
                    style={{ 
                      width: '100%',
                      color: isDark ? "#f8fafc" : "#0f172a", 
                      backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                      border: `1px solid ${isDark ? "#334155" : "#cbd5e1"}`, 
                      borderRadius: '10px',
                      padding: '10px 40px 10px 14px', 
                      outline: 'none',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* حقل اسم الموظف الظاهري */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 'bold', color: isDark ? "#cbd5e1" : "#475569" }}>
                  اسم الموظف الظاهري (يمكن تكراره بحرية)
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}>
                  <FaUser style={{ position: 'absolute', right: '14px', color: '#94a3b8' }} size={14} />
                  <input 
                    type="text" 
                    placeholder='مثال: أحمد محمد' 
                    required 
                    name='name'
                    value={formdata.name}
                    onChange={handlechange}
                    style={{ 
                      width: '100%',
                      color: isDark ? "#f8fafc" : "#0f172a", 
                      backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                      border: `1px solid ${isDark ? "#334155" : "#cbd5e1"}`, 
                      borderRadius: '10px',
                      padding: '10px 40px 10px 14px', 
                      outline: 'none',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* حقل كلمة المرور */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 'bold', color: isDark ? "#cbd5e1" : "#475569" }}>
                  كلمة المرور
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}>
                  <FaLock style={{ position: 'absolute', right: '14px', color: '#94a3b8' }} size={14} />
                  <input 
                    type="password" 
                    placeholder='ادخل كلمة المرور' 
                    required 
                    name='password' 
                    value={formdata.password}
                    onChange={handlechange}
                    style={{ 
                      width: '100%',
                      color: isDark ? "#f8fafc" : "#0f172a", 
                      backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                      border: `1px solid ${isDark ? "#334155" : "#cbd5e1"}`, 
                      borderRadius: '10px',
                      padding: '10px 40px 10px 14px', 
                      outline: 'none',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* حقل اسم الشركة */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 'bold', color: isDark ? "#cbd5e1" : "#475569" }}>
                  اسم الشركة
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}>
                  <FaStore style={{ position: 'absolute', right: '14px', color: '#94a3b8' }} size={14} />
                  <input
                    type="text"
                    placeholder='ادخل اسم الشركة'
                    required
                    name='company_name'
                    value={formdata.company_name}
                    onChange={handlechange}
                    style={{ 
                      width: '100%',
                      color: isDark ? "#f8fafc" : "#0f172a", 
                      backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                      border: `1px solid ${isDark ? "#334155" : "#cbd5e1"}`, 
                      borderRadius: '10px',
                      padding: '10px 40px 10px 14px', 
                      outline: 'none',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* حقل اسم الفرع */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 'bold', color: isDark ? "#cbd5e1" : "#475569" }}>
                  اسم الفرع
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}>
                  <FaBuilding style={{ position: 'absolute', right: '14px', color: '#94a3b8' }} size={14} />
                  <input
                    type="text"
                    placeholder='ادخل اسم الفرع'
                    required
                    name='branch_name'
                    value={formdata.branch_name}
                    onChange={handlechange}
                    style={{ 
                      width: '100%',
                      color: isDark ? "#f8fafc" : "#0f172a", 
                      backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                      border: `1px solid ${isDark ? "#334155" : "#cbd5e1"}`, 
                      borderRadius: '10px',
                      padding: '10px 40px 10px 14px', 
                      outline: 'none',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* حقل الوظيفة */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 'bold', color: isDark ? "#cbd5e1" : "#475569" }}>
                  الوظيفة / التخصص
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}>
                  <FaBriefcase style={{ position: 'absolute', right: '14px', color: '#94a3b8', zIndex: 1 }} size={14} />
                  <select 
                    name="job" 
                    value={formdata.job} 
                    onChange={handlechange}
                    style={{ 
                      width: '100%',
                      color: isDark ? "#f8fafc" : "#0f172a", 
                      backgroundColor: isDark ? "#0f172a" : "#f8fafc", 
                      border: `1px solid ${isDark ? "#334155" : "#cbd5e1"}`, 
                      borderRadius: '10px',
                      padding: '10px 40px 10px 14px', 
                      outline: 'none',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                      cursor: 'pointer'
                    }}
                  >
                    {isSuperUser && <option value="أدمن">أدمن</option>}
                    <option value="مدير">مدير</option>
                    <option value="إقليمي">إقليمي</option>
                    <option value="محاسب">محاسب</option>
                    <option value="كاشير">كاشير</option>
                    <option value="مبيعات">مبيعات</option>
                  </select>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                style={{ 
                  marginTop: '10px',
                  backgroundColor: loading ? '#9ca3af' : (isDark ? "#10b981" : "#059669"), 
                  color: '#ffffff', 
                  border: 'none', 
                  padding: '12px 20px', 
                  borderRadius: '10px', 
                  fontWeight: 'bold', 
                  fontSize: '15px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
                  transition: 'opacity 0.2s ease',
                  boxSizing: 'border-box',
                  width: '100%'
                }}
              >
                {loading ? "جاري الإضافة..." : "حفظ الموظف"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};