import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  FaSun, FaMoon, FaSignOutAlt, FaArrowRight, FaUser, FaLock, 
  FaBuilding, FaBriefcase, FaStar, FaEye, FaEyeSlash, FaIdCard
} from 'react-icons/fa';

export const Profile = () => {
  const navigate = useNavigate();

  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const [user, setUser] = useState({
    name: '',
    password: '******',
    fled: '',
    job: '',
    points: 0,
    image: null
  });

  const getToken = () => {
    return localStorage.getItem('token') || localStorage.getItem('access_token') || localStorage.getItem('access');
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      const token = getToken();
      if (!token) {
        navigate('/');
        return;
      }

      try {
        const headers = { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        };

        const response = await axios.get(`${import.meta.env.VITE_API_URL}/profile/`, { headers });
        const data = response.data;
        const currentUserId = data.id || data._id;
        const currentUserName = data.first_name || data.username || '';

        let finalPoints = Number(data.points) || 0;

        try {
          const API_EMPLOYEES_URL = `${import.meta.env.VITE_API_URL}/users/`;
          const API_VOTES_URL = `${import.meta.env.VITE_API_URL}/votes/`;

          let usersList = [];
          let votesList = [];

          try {
            const empRes = await axios.get(API_EMPLOYEES_URL, { headers });
            const empData = empRes.data;
            usersList = Array.isArray(empData) ? empData : (empData.results || empData.users || []);
          } catch (e) {
            usersList = JSON.parse(localStorage.getItem('local_employees') || '[]');
          }

          try {
            const localVotes = JSON.parse(localStorage.getItem('local_votes') || '[]');
            const voteRes = await axios.get(API_VOTES_URL, { headers });
            const serverVotes = Array.isArray(voteRes.data) ? voteRes.data : (voteRes.data.results || []);
            
            const mergedVotes = [...serverVotes];
            localVotes.forEach(lv => {
              if (!mergedVotes.some(sv => String(sv.id) === String(lv.id) || (String(sv.targetUserId) === String(lv.targetUserId) && sv.voter === lv.voter))) {
                mergedVotes.push(lv);
              }
            });
            votesList = mergedVotes;
          } catch (e) {
            votesList = JSON.parse(localStorage.getItem('local_votes') || '[]');
          }

          const calculatedWinners = usersList.map(u => {
            const userId = u.id || u._id;
            const userVotes = votesList.filter(v => String(v.targetUserId) === String(userId));
            let totalScore = 0;
            
            userVotes.forEach(v => {
              Object.values(v.ratings || {}).forEach(r => totalScore += Number(r) || 0);
            });

            const rawJob = u.job || u.jop || u.position || u.category || u.role || 'غير محدد';
            let mappedJob = rawJob;
            if (rawJob === 'ACCOUNTANT') mappedJob = 'محاسب';
            else if (rawJob === 'CASHIER') mappedJob = 'كاشير';
            else if (rawJob === 'REGIONAL') mappedJob = 'اقليمي';
            else if (rawJob === 'SALES') mappedJob = 'مبيعات';
            else if (rawJob === 'BRANCH_MANAGER' || rawJob === 'MANAGER') mappedJob = 'مدير';

            return {
              id: userId,
              name: u.first_name && u.first_name.trim() !== '' ? u.first_name : (u.name || u.username || "موظف"),
              fled: u.fled || u.field || u.branch_name_display || u.branch || "غير محدد",
              job: mappedJob,
              points: totalScore > 0 ? totalScore : Number(u.points || 0),
              image: u.profile_pic || u.image || null
            };
          });

          const matchedUserInLeaderboard = calculatedWinners.find(u => 
            String(u.id) === String(currentUserId) || 
            u.name === currentUserName
          );

          if (matchedUserInLeaderboard) {
            finalPoints = matchedUserInLeaderboard.points;
          }

        } catch (err) {
          console.error('فشل في مطابقة النقاط من جدول الترتيب:', err);
        }

        setUser({
          name: currentUserName || 'موظف',
          password: data.password || '******',
          fled: data.branch_name_display || data.branch_name || data.fled || 'الفرع الرئيسي',
          job: data.role || data.job || 'محاسب',
          points: finalPoints,
          image: data.profile_pic || data.image || null
        });

      } catch (err) {
        console.error('فشل في جلب بيانات البروفايل من السيرفر:', err);
        
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) {
          setUser({
            name: storedUser.name || storedUser.username || 'موظف',
            password: storedUser.password || '******',
            fled: storedUser.fled || storedUser.branch || 'الفرع الرئيسي',
            job: storedUser.job || storedUser.role || 'محاسب',
            points: Number(storedUser.points) || 0,
            image: storedUser.image || storedUser.avatar || null
          });
        } else {
          setErrorMsg('تعذر جلب بيانات الحساب، يرجى تسجيل الدخول مرة أخرى.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();

    const themeName = isDark ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', themeName);
    localStorage.setItem('theme', themeName);
  }, [isDark, navigate]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('access');
    localStorage.removeItem('user');
    navigate('/');
  };

  if (loading) {
    return (
      <div style={{ backgroundColor: isDark ? "#0f172a" : "#e2e8f0", minHeight: '100vh', display: 'grid', placeItems: 'center', color: isDark ? '#fff' : '#000' }}>
        <h2>جاري تحميل بيانات البروفايل...</h2>
      </div>
    );
  }

  return (
    <div style={{ 
      backgroundColor: isDark ? "#0f172a" : "#f8fafc", 
      minHeight: '100vh', 
      width: '100%',
      direction: 'rtl',
      margin: 0,
      padding: 0,
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      overflowX: 'hidden'
    }}>
      
      <header style={{ 
        display: 'flex',
        flexDirection: "row-reverse",
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '16px 40px', 
        width: '100%',
        boxSizing: 'border-box',
        backgroundColor: isDark ? "#1e293b" : "#ffffff", 
        borderBottom: `1px solid ${isDark ? "#334155" : "#cbd5e1"}`,
        boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.03)',
        flexWrap: 'wrap',
        gap: '15px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <img src="/logo.png" alt="logo" style={{ width: '42px', height: '42px', objectFit: 'contain' }} />
          <h3 style={{ margin: 0, color: isDark ? "#f8fafc" : "#0f172a", fontSize: '19px', fontWeight: 'bold' }}>
            اسم الشركه
          </h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <button onClick={toggleTheme} style={{ 
            color: isDark ? "#f8fafc" : "#1e293b", 
            backgroundColor: isDark ? "#0f172a" : "#e2e8f0", 
            border: `1px solid ${isDark ? "#334155" : "#cbd5e1"}`, 
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
            <span>{isDark ? "المضيء" : "الداكن"}</span>
          </button>

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

          <Link to="/home" style={{ 
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
            <span>الرئيسية</span>
          </Link>
        </div>
      </header>

      <div style={{ 
        flex: 1, 
        width: '100%', 
        display: 'flex', 
        justifyContent: 'center',
        alignItems: 'center',
        padding: '40px 20px',
        boxSizing: 'border-box'
      }}>
        <div style={{ 
          backgroundColor: isDark ? "#1e293b" : "#ffffff", 
          border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`, 
          width: '100%', 
          maxWidth: '900px', 
          borderRadius: '24px', 
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          overflow: 'hidden',
          boxShadow: isDark ? '0 20px 40px rgba(0,0,0,0.4)' : '0 10px 30px rgba(0,0,0,0.06)'
        }}>
          
          <div style={{ 
            flex: '1 1 280px', 
            backgroundColor: isDark ? "#0f172a" : "#f8fafc", 
            borderLeft: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
            padding: '40px 24px', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            textAlign: 'center',
            boxSizing: 'border-box',
            justifyContent: 'center'
          }}>
            <div style={{ position: 'relative', marginBottom: '18px' }}>
              {user.image ? (
                <img 
                  src={user.image.startsWith('http') ? user.image : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://127.0.0.1:8000'}${user.image}`} 
                  alt="Profile" 
                  style={{ 
                    width: '120px', 
                    height: '120px', 
                    borderRadius: '50%', 
                    objectFit: 'cover',
                    border: '4px solid #10b981',
                    boxShadow: '0 8px 20px rgba(16, 185, 129, 0.25)'
                  }} 
                />
              ) : (
                <div style={{ 
                  width: '120px', 
                  height: '120px', 
                  borderRadius: '50%', 
                  backgroundColor: isDark ? "#1e293b" : "#e2e8f0", 
                  border: `3px solid ${isDark ? "#334155" : "#cbd5e1"}`,
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: '#94a3b8'
                }}>
                  <FaUser size={54} />
                </div>
              )}
            </div>

            <h2 style={{ margin: '0 0 6px 0', color: isDark ? "#f8fafc" : "#0f172a", fontSize: '22px', fontWeight: 'bold' }}>
              {user.name}
            </h2>
            <span style={{ 
              fontSize: '13px', 
              color: '#10b981', 
              backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#dcfce7', 
              padding: '4px 14px', 
              borderRadius: '20px',
              fontWeight: '600'
            }}>
              {user.job}
            </span>
          </div>

          <div style={{ 
            flex: '2 1 350px', 
            padding: '40px', 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center',
            boxSizing: 'border-box'
          }}>
            <h3 style={{ margin: '0 0 24px 0', color: isDark ? "#f8fafc" : "#0f172a", fontSize: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FaIdCard color="#10b981" /> تفاصيل الحساب الشخصي
            </h3>

            {errorMsg && (
              <div style={{ color: '#ef4444', marginBottom: '15px', fontSize: '13px', fontWeight: 'bold' }}>
                {errorMsg}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                <div style={{ backgroundColor: isDark ? "#0f172a" : "#f8fafc", padding: '12px 16px', borderRadius: '12px', border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}` }}>
                  <span style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>اسم الموظف</span>
                  <strong style={{ color: isDark ? "#f8fafc" : "#0f172a", fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FaUser color="#10b981" size={13} /> {user.name}
                  </strong>
                </div>

                <div style={{ backgroundColor: isDark ? "#0f172a" : "#f8fafc", padding: '12px 16px', borderRadius: '12px', border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}` }}>
                  <span style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>الوظيفة</span>
                  <strong style={{ color: isDark ? "#f8fafc" : "#0f172a", fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FaBriefcase color="#10b981" size={13} /> {user.job}
                  </strong>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                <div style={{ backgroundColor: isDark ? "#0f172a" : "#f8fafc", padding: '12px 16px', borderRadius: '12px', border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}` }}>
                  <span style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>كلمة المرور</span>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <strong style={{ color: isDark ? "#f8fafc" : "#0f172a", fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FaLock color="#10b981" size={13} /> 
                      {showPassword ? user.password : '••••••••'}
                    </strong>
                    <button 
                      onClick={() => setShowPassword(!showPassword)} 
                      style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0 }}
                    >
                      {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                    </button>
                  </div>
                </div>

                <div style={{ backgroundColor: isDark ? "#0f172a" : "#f8fafc", padding: '12px 16px', borderRadius: '12px', border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}` }}>
                  <span style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>اسم الفرع</span>
                  <strong style={{ color: isDark ? "#f8fafc" : "#0f172a", fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FaBuilding color="#10b981" size={13} /> {user.fled}
                  </strong>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '14px', marginTop: '8px' }}>
                
                <div style={{ 
                  backgroundColor: isDark ? "rgba(245, 158, 11, 0.1)" : "#fffbeb", 
                  border: `1px solid ${isDark ? "rgba(245, 158, 11, 0.2)" : "#fef3c7"}`,
                  padding: '16px', 
                  borderRadius: '16px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '14px' 
                }}>
                  <div style={{ backgroundColor: '#f59e0b', color: '#ffffff', padding: '12px', borderRadius: '12px' }}>
                    <FaStar size={22} />
                  </div>
                  <div>
                    <span style={{ fontSize: '12px', color: isDark ? "#fcd34d" : "#b45309", fontWeight: 'bold', display: 'block' }}>إجمالي النقاط</span>
                    <span style={{ fontSize: '20px', fontWeight: 'bold', color: isDark ? "#fbbf24" : "#d97706" }}>{user.points} نقطة</span>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};