// import axios from 'axios';
// import { useState, useEffect } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { 
//   FaSun, FaMoon, FaSignOutAlt, FaVoteYea, FaUsers, FaArrowLeft, 
//   FaCalendarCheck, FaUserShield, FaChartLine, FaCheckCircle, FaClock, FaUser 
// } from 'react-icons/fa';

// export const Home = () => {
//   const navigate = useNavigate();
//   const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');
//   const [userName, setUserName] = useState('');
//   const [currentUser, setCurrentUser] = useState(null);
//   const [isAdmin, setIsAdmin] = useState(false);
//   const [isFriday, setIsFriday] = useState(false);

//   useEffect(() => {
//     const storedUser = JSON.parse(localStorage.getItem('user'));
//     if (storedUser) {
//       setCurrentUser(storedUser);
//       setUserName(storedUser.name || storedUser.username || '');
      
//       const adminStatus = storedUser.role === 'admin' || storedUser.is_superuser || storedUser.role === 'Admin';
//       setIsAdmin(Boolean(adminStatus));
//     }

//     const today = new Date().getDay();
//     if (today === 5) {
//       setIsFriday(true);
//     } else {
//       setIsFriday(false);
//     }

//     const themeName = isDark ? 'dark' : 'light';
//     document.documentElement.setAttribute('data-theme', themeName);
//     localStorage.setItem('theme', themeName);
//   }, [isDark]);

//   const toggleTheme = () => setIsDark((prev) => !prev);

//   const handleLogout = () => {
//     localStorage.removeItem('token');
//     localStorage.removeItem('user');
//     navigate('/');
//   };
// return (
//   <div className="main" style={{ 
//     backgroundColor: isDark ? "var(--bg-primary-dark, #0f172a)" : "#e2e8f0", 
//     minHeight: '100vh', 
//     width: '100%',
//     overflowX: 'hidden',
//     transition: 'all 0.3s ease',
//     display: 'flex',
//     flexDirection: 'column'
//   }}>
//     {/* أنماط الاستجابة للموبايل والشاشات الصغيرة */}
//     <style>{`
//       @media (max-width: 768px) {
//         .header-container {
//           padding: 12px 16px !important;
//           flex-direction: column !important;
//           gap: 12px !important;
//         }
//         .header-actions {
//           width: 100% !important;
//           justify-content: space-between !important;
//           flex-wrap: wrap !important;
//           gap: 10px !important;
//         }
//         .dashboard-content {
//           padding: 20px 12px 40px 12px !important;
//         }
//         .banner-card {
//           padding: 20px !important;
//           flex-direction: column-reverse !important;
//           text-align: center !important;
//           align-items: center !important;
//         }
//         .banner-card h1 {
//           font-size: 20px !important;
//         }
//         .banner-card p {
//           font-size: 13px !important;
//         }
//         .stats-grid {
//           grid-template-columns: 1fr !important;
//         }
//         .cards {
//           grid-template-columns: 1fr !important;
//         }
//         .card {
//           padding: 20px !important;
//         }
//       }
//     `}</style>

//     {/* الهيدر الرئيسي */}
//     <header className="header-container" style={{ 
//       display: 'flex', 
//       justify: 'space-between', 
//       alignItems: 'center', 
//       padding: '16px 40px', 
//       width: '100%',
//       boxSizing: 'border-box',
//       backgroundColor: isDark ? "var(--bg-card-dark, #1e293b)" : "#ffffff", 
//       borderBottom: `1px solid ${isDark ? "var(--border-dark, #334155)" : "#cbd5e1"}`,
//       boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.05)',
//       zIndex: 10
//     }}>
//       <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
//         <img src="/logo.png" alt="logo" style={{ width: '42px', height: '42px', objectFit: 'contain' }} />
//         <h3 style={{ margin: 0, color: isDark ? "#f8fafc" : "#0f172a", fontSize: '19px', fontWeight: 'bold' }}>
//           اسم الشركه
//         </h3>
//       </div>

//       <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
//         <button onClick={toggleTheme} style={{ 
//           color: isDark ? "#f8fafc" : "#1e293b", 
//           backgroundColor: isDark ? "#0f172a" : "#cbd5e1", 
//           border: `1px solid ${isDark ? "#334155" : "#94a3b8"}`, 
//           padding: '8px 14px', 
//           borderRadius: '30px', 
//           cursor: 'pointer', 
//           display: 'flex', 
//           alignItems: 'center', 
//           gap: '8px', 
//           fontWeight: '600',
//           fontSize: '13px'
//         }}>
//           {isDark ? <FaSun color="#f59e0b" size={16} /> : <FaMoon color="#334155" size={16} />}
//           <span>{isDark ? "الوضع المضئ" : "الوضع الداكن"}</span>
//         </button>

//         <button onClick={handleLogout} style={{ 
//           backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : '#fee2e2', 
//           color: '#dc2626', 
//           border: `1px solid ${isDark ? 'rgba(239, 68, 68, 0.2)' : '#fca5a5'}`, 
//           padding: '8px 14px', 
//           borderRadius: '10px', 
//           cursor: 'pointer', 
//           display: 'flex', 
//           alignItems: 'center', 
//           gap: '8px', 
//           fontWeight: '600',
//           fontSize: '13px'
//         }}>
//           <FaSignOutAlt />
//           <span>خروج</span>
//         </button>
        
//         {!isAdmin && (
//           <div 
//             onClick={() => navigate('/profile')} 
//             style={{ 
//               display: 'flex', 
//               alignItems: 'center', 
//               gap: '10px', 
//               cursor: 'pointer',
//               padding: '4px 8px',
//               borderRadius: '12px'
//             }}
//           >
//             {userName && (
//               <div style={{ color: isDark ? "#f8fafc" : "#0f172a", fontWeight: '600', fontSize: '14px' }}>
//                 مرحباً، <span style={{ color: "#10b981" }}>{userName}</span> 👋
//               </div>
//             )}
//             <div style={{ position: 'relative' }}>
//               {currentUser?.image || currentUser?.avatar || currentUser?.imagePreview ? (
//                 <img 
//                   src={currentUser.image || currentUser.avatar || currentUser.imagePreview} 
//                   alt={userName} 
//                   style={{ 
//                     width: '36px', 
//                     height: '36px', 
//                     borderRadius: '50%', 
//                     objectFit: 'cover', 
//                     border: '2px solid #10b981' 
//                   }} 
//                 />
//               ) : (
//                 <div style={{ 
//                   width: '36px', 
//                   height: '36px', 
//                   borderRadius: '50%', 
//                   backgroundColor: isDark ? '#0f172a' : '#f1f5f9', 
//                   border: `2px solid ${isDark ? '#334155' : '#cbd5e1'}`, 
//                   display: 'flex', 
//                   alignItems: 'center', 
//                   justify: 'center', 
//                   color: '#94a3b8' 
//                 }}>
//                   <FaUser size={16} style={{margin: "auto"}}/>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}
//       </div>
//     </header>

//     {/* المحتوى الرئيسي */}
//     <div className="dashboard-content" style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '40px 20px 60px 20px', flex: 1, boxSizing: 'border-box' }}>
      
//       {/* كارت الترحيب الرئيسي */}
//       <div className="banner-card" style={{ 
//         backgroundColor: isDark ? "var(--bg-card-dark, #1e293b)" : "#f8fafc", 
//         borderRadius: '20px', 
//         padding: '32px 40px', 
//         marginBottom: '24px',
//         border: `1px solid ${isDark ? "var(--border-dark, #334155)" : "#cbd5e1"}`,
//         display: 'flex',
//         justify: 'space-between',
//         alignItems: 'center',
//         gap: '20px',
//         boxShadow: isDark ? '0 10px 25px rgba(0,0,0,0.2)' : '0 4px 12px rgba(0,0,0,0.03)'
//       }}>
//         <div>
//           <h1 style={{ margin: '0 0 8px 0', color: isDark ? "#f8fafc" : "#0f172a", fontSize: '26px', fontWeight: 'bold' }}>
//             مرحباً بك في لوحة التحكم الرئيسية
//           </h1>
//           <p style={{ margin: 0, color: isDark ? "#94a3b8" : "#475569", fontSize: '15px', lineHeight: '1.6' }}>
//             اختر إحدى الخدمات التالية لإدارة الموظفين أو متابعة وتسيير التقييمات والتصويتات الأسبوعية.
//           </p>
//         </div>
//         <div style={{ 
//           backgroundColor: isDark ? "rgba(129, 140, 248, 0.1)" : "#dbeafe", 
//           padding: '16px', 
//           borderRadius: '16px', 
//           color: isDark ? "#818cf8" : "#1d4ed8",
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center'
//         }}>
//           <FaChartLine size={32} />
//         </div>
//       </div>

//       {/* شبكة الاحصائيات السريعة */}
//       <div className="stats-grid" style={{ 
//         display: 'grid', 
//         gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
//         gap: '16px', 
//         marginBottom: '24px' 
//       }}>
      
//         <div style={{ 
//           backgroundColor: isDark ? "var(--bg-card-dark, #1e293b)" : (isFriday ? "#fee2e2" : "#e0f2fe"), 
//           padding: '16px 20px', 
//           borderRadius: '16px', 
//           border: `1px solid ${isDark ? "var(--border-dark, #334155)" : (isFriday ? "#fca5a5" : "#bae6fd")}`,
//           display: 'flex',
//           alignItems: 'center',
//           gap: '16px'
//         }}>
//           <div style={{ 
//             padding: '12px', 
//             borderRadius: '12px', 
//             backgroundColor: isFriday ? (isDark ? 'rgba(239, 68, 68, 0.2)' : '#fca5a5') : (isDark ? 'rgba(59, 130, 246, 0.1)' : '#bae6fd'), 
//             color: isFriday ? '#dc2626' : '#0369a1' 
//           }}>
//             <FaCalendarCheck size={22} />
//           </div>
//           <div>
//             <div style={{ fontSize: '12px', color: isFriday ? '#dc2626' : (isDark ? "#94a3b8" : "#0369a1"), fontWeight: '600' }}>حالة التصويت</div>
//             <div style={{ fontSize: '15px', fontWeight: 'bold', color: isFriday ? '#991b1b' : (isDark ? "#f8fafc" : "#0c4a6e"), marginTop: '2px' }}>
//               {isFriday ? "غير نشط" : "نشط حالياً"}
//             </div>
//           </div>
//         </div>

//         <div style={{ 
//           backgroundColor: isDark ? "var(--bg-card-dark, #1e293b)" : "#dcfce7", 
//           padding: '16px 20px', 
//           borderRadius: '16px', 
//           border: `1px solid ${isDark ? "var(--border-dark, #334155)" : "#bbf7d0"}`,
//           display: 'flex',
//           alignItems: 'center',
//           gap: '16px'
//         }}>
//           <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : '#bbf7d0', color: '#15803d' }}>
//             <FaCheckCircle size={22} />
//           </div>
//           <div>
//             <div style={{ fontSize: '12px', color: isDark ? "#94a3b8" : "#15803d", fontWeight: '600' }}>النظام</div>
//             <div style={{ fontSize: '15px', fontWeight: 'bold', color: isDark ? "#f8fafc" : "#14532d", marginTop: '2px' }}>مستقر ومحدث</div>
//           </div>
//         </div>

//         <div style={{ 
//           backgroundColor: isDark ? "var(--bg-card-dark, #1e293b)" : "#fef3c7", 
//           padding: '16px 20px', 
//           borderRadius: '16px', 
//           border: `1px solid ${isDark ? "var(--border-dark, #334155)" : "#fde68a"}`,
//           display: 'flex',
//           alignItems: 'center',
//           gap: '16px'
//         }}>
//           <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: isDark ? 'rgba(245, 158, 11, 0.1)' : '#fde68a', color: '#b45309' }}>
//             <FaClock size={22} />
//           </div>
//           <div>
//             <div style={{ fontSize: '12px', color: isDark ? "#94a3b8" : "#b45309", fontWeight: '600' }}>تحديث النتائج</div>
//             <div style={{ fontSize: '15px', fontWeight: 'bold', color: isDark ? "#f8fafc" : "#78350f", marginTop: '2px' }}>كل يوم جمعة</div>
//           </div>
//         </div>
//       </div>

//       {/* كروت الخدمات الرئيسية */}
//       <div className="cards" style={{ 
//         display: 'grid', 
//         gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
//         gap: '20px' 
//       }}>
        
//         <Link to="/votes" className="card" style={{ 
//           backgroundColor: isDark ? "var(--bg-card-dark, #1e293b)" : "#eff6ff", 
//           border: `1px solid ${isDark ? "var(--border-dark, #334155)" : "#bfdbfe"}`, 
//           borderRadius: '20px', 
//           padding: '28px', 
//           textDecoration: 'none', 
//           display: 'flex', 
//           flexDirection: 'column', 
//           justify: 'space-between', 
//           gap: '20px',
//           transition: 'transform 0.2s ease, border-color 0.2s ease',
//           boxShadow: isDark ? '0 10px 20px rgba(0,0,0,0.15)' : '0 4px 12px rgba(37,99,235,0.06)'
//         }}>
//           <div>
//             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
//               <div style={{ padding: '12px', backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : '#dbeafe', borderRadius: '14px' }}>
//                 <FaVoteYea size={24} color="#2563eb" />
//               </div>
//               <span style={{ fontSize: '12px', fontWeight: 'bold', padding: '6px 12px', borderRadius: '20px', backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : '#dbeafe', color: '#1d4ed8', display: 'flex', alignItems: 'center', gap: '6px' }}>
//                 <FaCalendarCheck /> أسبوعي
//               </span>
//             </div>

//             <h2 className='title' style={{ margin: '0 0 8px 0', color: isDark ? "#f8fafc" : "#1e3a8a", fontSize: '18px', fontWeight: 'bold' }}>
//               صفحة التصويتات والتقييم
//             </h2>

//             <p className='desc' style={{ margin: 0, color: isDark ? "#94a3b8" : "#1e40af", fontSize: '13px', lineHeight: '1.6', opacity: 0.85 }}>
//               الصفحة المخصصة لجميع تقييمات المهام للأقسام المختلفة. تبدأ فترة التصويت رسمياً من يوم السبت وتغلق أوتوماتيكياً يوم الجمعة لحصر النتائج وإعلان الأوائل.
//             </p>
//           </div>

//           <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2563eb', fontWeight: 'bold', fontSize: '14px' }}>
//             <span>الدخول للتصويت</span>
//             <FaArrowLeft size={14} />
//           </div>
//         </Link>

//         {isAdmin && (
//           <Link to="/employees" className="card" style={{ 
//             backgroundColor: isDark ? "var(--bg-card-dark, #1e293b)" : "#f0fdf4", 
//             border: `1px solid ${isDark ? "var(--border-dark, #334155)" : "#bbf7d0"}`, 
//             borderRadius: '20px', 
//             padding: '28px', 
//             textDecoration: 'none', 
//             display: 'flex', 
//             flexDirection: 'column', 
//             justify: 'space-between', 
//             gap: '20px',
//             transition: 'transform 0.2s ease, border-color 0.2s ease',
//             boxShadow: isDark ? '0 10px 20px rgba(0,0,0,0.15)' : '0 4px 12px rgba(16,185,129,0.06)'
//           }}>
//             <div>
//               <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
//                 <div style={{ padding: '12px', backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#dcfce7', borderRadius: '14px' }}>
//                   <FaUsers size={24} color="#16a34a" />
//                 </div>
//                 <span style={{ fontSize: '12px', fontWeight: 'bold', padding: '6px 12px', borderRadius: '20px', backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', gap: '6px' }}>
//                   <FaUserShield /> مسؤول النظام
//                 </span>
//               </div>

//               <h2 className='title' style={{ margin: '0 0 8px 0', color: isDark ? "#f8fafc" : "#065f46", fontSize: '18px', fontWeight: 'bold' }}>
//                 إدارة وسجل الموظفين
//               </h2>

//               <p className='desc' style={{ margin: 0, color: isDark ? "#94a3b8" : "#047857", fontSize: '13px', lineHeight: '1.6', opacity: 0.85 }}>
//                 لوحة تحكم خاصة بالمسؤولين تمكّنك من إضافة موظفين جُدد، تعديل الصلاحيات والأقسام، أو حذف الموظفين والوصول لكافة بيانات السجل.
//               </p>
//             </div>

//             <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#16a34a', fontWeight: 'bold', fontSize: '14px' }}>
//               <span>إدارة الموظفين</span>
//               <FaArrowLeft size={14} />
//             </div>
//           </Link>
//         )}

//       </div>
//     </div>
//   </div>
// );
// };

import axios from 'axios';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaSun, FaMoon, FaSignOutAlt, FaVoteYea, FaUsers, FaArrowLeft, 
  FaCalendarCheck, FaUserShield, FaChartLine, FaCheckCircle, FaClock, FaUser 
} from 'react-icons/fa';

export const Home = () => {
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');
  const [userName, setUserName] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isFriday, setIsFriday] = useState(false);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setCurrentUser(storedUser);
      setUserName(storedUser.name || storedUser.username || '');
      
      // ✅ بنتأكد من isAdmin (اللي بتتخزن من Loginpage.jsx) قبل أي حاجة تانية
      const adminStatus = storedUser.isAdmin || storedUser.role === 'admin' || storedUser.is_superuser || storedUser.role === 'ADMIN';
      setIsAdmin(Boolean(adminStatus));
    }

    const today = new Date().getDay();
    if (today === 5) {
      setIsFriday(true);
    } else {
      setIsFriday(false);
    }

    const themeName = isDark ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', themeName);
    localStorage.setItem('theme', themeName);
  }, [isDark]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };
return (
  <div className="main" style={{ 
    backgroundColor: isDark ? "var(--bg-primary-dark, #0f172a)" : "#e2e8f0", 
    minHeight: '100vh', 
    width: '100%',
    overflowX: 'hidden',
    transition: 'all 0.3s ease',
    display: 'flex',
    flexDirection: 'column'
  }}>
    {/* أنماط الاستجابة للموبايل والشاشات الصغيرة */}
    <style>{`
      @media (max-width: 768px) {
        .header-container {
          padding: 12px 16px !important;
          flex-direction: column !important;
          gap: 12px !important;
        }
        .header-actions {
          width: 100% !important;
          justify-content: space-between !important;
          flex-wrap: wrap !important;
          gap: 10px !important;
        }
        .dashboard-content {
          padding: 20px 12px 40px 12px !important;
        }
        .banner-card {
          padding: 20px !important;
          flex-direction: column-reverse !important;
          text-align: center !important;
          align-items: center !important;
        }
        .banner-card h1 {
          font-size: 20px !important;
        }
        .banner-card p {
          font-size: 13px !important;
        }
        .stats-grid {
          grid-template-columns: 1fr !important;
        }
        .cards {
          grid-template-columns: 1fr !important;
        }
        .card {
          padding: 20px !important;
        }
      }
    `}</style>

    {/* الهيدر الرئيسي */}
    <header className="header-container" style={{ 
      display: 'flex', 
      justify: 'space-between', 
      alignItems: 'center', 
      padding: '16px 40px', 
      width: '100%',
      boxSizing: 'border-box',
      backgroundColor: isDark ? "var(--bg-card-dark, #1e293b)" : "#ffffff", 
      borderBottom: `1px solid ${isDark ? "var(--border-dark, #334155)" : "#cbd5e1"}`,
      boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.05)',
      zIndex: 10
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <img src="/logo.png" alt="logo" style={{ width: '42px', height: '42px', objectFit: 'contain' }} />
        <h3 style={{ margin: 0, color: isDark ? "#f8fafc" : "#0f172a", fontSize: '19px', fontWeight: 'bold' }}>
          اسم الشركه
        </h3>
      </div>

      <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button onClick={toggleTheme} style={{ 
          color: isDark ? "#f8fafc" : "#1e293b", 
          backgroundColor: isDark ? "#0f172a" : "#cbd5e1", 
          border: `1px solid ${isDark ? "#334155" : "#94a3b8"}`, 
          padding: '8px 14px', 
          borderRadius: '30px', 
          cursor: 'pointer', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          fontWeight: '600',
          fontSize: '13px'
        }}>
          {isDark ? <FaSun color="#f59e0b" size={16} /> : <FaMoon color="#334155" size={16} />}
          <span>{isDark ? "الوضع المضئ" : "الوضع الداكن"}</span>
        </button>

        <button onClick={handleLogout} style={{ 
          backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : '#fee2e2', 
          color: '#dc2626', 
          border: `1px solid ${isDark ? 'rgba(239, 68, 68, 0.2)' : '#fca5a5'}`, 
          padding: '8px 14px', 
          borderRadius: '10px', 
          cursor: 'pointer', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          fontWeight: '600',
          fontSize: '13px'
        }}>
          <FaSignOutAlt />
          <span>خروج</span>
        </button>
        
        {!isAdmin && (
          <div 
            onClick={() => navigate('/profile')} 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px', 
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: '12px'
            }}
          >
            {userName && (
              <div style={{ color: isDark ? "#f8fafc" : "#0f172a", fontWeight: '600', fontSize: '14px' }}>
                مرحباً، <span style={{ color: "#10b981" }}>{userName}</span> 👋
              </div>
            )}
            <div style={{ position: 'relative' }}>
              {currentUser?.profile_pic || currentUser?.image || currentUser?.avatar || currentUser?.imagePreview ? (
                <img 
                  src={currentUser.profile_pic || currentUser.image || currentUser.avatar || currentUser.imagePreview} 
                  alt={userName} 
                  style={{ 
                    width: '36px', 
                    height: '36px', 
                    borderRadius: '50%', 
                    objectFit: 'cover', 
                    border: '2px solid #10b981' 
                  }} 
                />
              ) : (
                <div style={{ 
                  width: '36px', 
                  height: '36px', 
                  borderRadius: '50%', 
                  backgroundColor: isDark ? '#0f172a' : '#f1f5f9', 
                  border: `2px solid ${isDark ? '#334155' : '#cbd5e1'}`, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justify: 'center', 
                  color: '#94a3b8' 
                }}>
                  <FaUser size={16} style={{margin: "auto"}}/>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>

    {/* المحتوى الرئيسي */}
    <div className="dashboard-content" style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '40px 20px 60px 20px', flex: 1, boxSizing: 'border-box' }}>
      
      {/* كارت الترحيب الرئيسي */}
      <div className="banner-card" style={{ 
        backgroundColor: isDark ? "var(--bg-card-dark, #1e293b)" : "#f8fafc", 
        borderRadius: '20px', 
        padding: '32px 40px', 
        marginBottom: '24px',
        border: `1px solid ${isDark ? "var(--border-dark, #334155)" : "#cbd5e1"}`,
        display: 'flex',
        justify: 'space-between',
        alignItems: 'center',
        gap: '20px',
        boxShadow: isDark ? '0 10px 25px rgba(0,0,0,0.2)' : '0 4px 12px rgba(0,0,0,0.03)'
      }}>
        <div>
          <h1 style={{ margin: '0 0 8px 0', color: isDark ? "#f8fafc" : "#0f172a", fontSize: '26px', fontWeight: 'bold' }}>
            مرحباً بك في لوحة التحكم الرئيسية
          </h1>
          <p style={{ margin: 0, color: isDark ? "#94a3b8" : "#475569", fontSize: '15px', lineHeight: '1.6' }}>
            اختر إحدى الخدمات التالية لإدارة الموظفين أو متابعة وتسيير التقييمات والتصويتات الأسبوعية.
          </p>
        </div>
        <div style={{ 
          backgroundColor: isDark ? "rgba(129, 140, 248, 0.1)" : "#dbeafe", 
          padding: '16px', 
          borderRadius: '16px', 
          color: isDark ? "#818cf8" : "#1d4ed8",
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <FaChartLine size={32} />
        </div>
      </div>

      {/* شبكة الاحصائيات السريعة */}
      <div className="stats-grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
        gap: '16px', 
        marginBottom: '24px' 
      }}>
      
        <div style={{ 
          backgroundColor: isDark ? "var(--bg-card-dark, #1e293b)" : (isFriday ? "#fee2e2" : "#e0f2fe"), 
          padding: '16px 20px', 
          borderRadius: '16px', 
          border: `1px solid ${isDark ? "var(--border-dark, #334155)" : (isFriday ? "#fca5a5" : "#bae6fd")}`,
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{ 
            padding: '12px', 
            borderRadius: '12px', 
            backgroundColor: isFriday ? (isDark ? 'rgba(239, 68, 68, 0.2)' : '#fca5a5') : (isDark ? 'rgba(59, 130, 246, 0.1)' : '#bae6fd'), 
            color: isFriday ? '#dc2626' : '#0369a1' 
          }}>
            <FaCalendarCheck size={22} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: isFriday ? '#dc2626' : (isDark ? "#94a3b8" : "#0369a1"), fontWeight: '600' }}>حالة التصويت</div>
            <div style={{ fontSize: '15px', fontWeight: 'bold', color: isFriday ? '#991b1b' : (isDark ? "#f8fafc" : "#0c4a6e"), marginTop: '2px' }}>
              {isFriday ? "غير نشط" : "نشط حالياً"}
            </div>
          </div>
        </div>

        <div style={{ 
          backgroundColor: isDark ? "var(--bg-card-dark, #1e293b)" : "#dcfce7", 
          padding: '16px 20px', 
          borderRadius: '16px', 
          border: `1px solid ${isDark ? "var(--border-dark, #334155)" : "#bbf7d0"}`,
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : '#bbf7d0', color: '#15803d' }}>
            <FaCheckCircle size={22} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: isDark ? "#94a3b8" : "#15803d", fontWeight: '600' }}>النظام</div>
            <div style={{ fontSize: '15px', fontWeight: 'bold', color: isDark ? "#f8fafc" : "#14532d", marginTop: '2px' }}>مستقر ومحدث</div>
          </div>
        </div>

        <div style={{ 
          backgroundColor: isDark ? "var(--bg-card-dark, #1e293b)" : "#fef3c7", 
          padding: '16px 20px', 
          borderRadius: '16px', 
          border: `1px solid ${isDark ? "var(--border-dark, #334155)" : "#fde68a"}`,
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: isDark ? 'rgba(245, 158, 11, 0.1)' : '#fde68a', color: '#b45309' }}>
            <FaClock size={22} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: isDark ? "#94a3b8" : "#b45309", fontWeight: '600' }}>تحديث النتائج</div>
            <div style={{ fontSize: '15px', fontWeight: 'bold', color: isDark ? "#f8fafc" : "#78350f", marginTop: '2px' }}>كل يوم جمعة</div>
          </div>
        </div>
      </div>

      {/* كروت الخدمات الرئيسية */}
      <div className="cards" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: '20px' 
      }}>
        
        <Link to="/votes" className="card" style={{ 
          backgroundColor: isDark ? "var(--bg-card-dark, #1e293b)" : "#eff6ff", 
          border: `1px solid ${isDark ? "var(--border-dark, #334155)" : "#bfdbfe"}`, 
          borderRadius: '20px', 
          padding: '28px', 
          textDecoration: 'none', 
          display: 'flex', 
          flexDirection: 'column', 
          justify: 'space-between', 
          gap: '20px',
          transition: 'transform 0.2s ease, border-color 0.2s ease',
          boxShadow: isDark ? '0 10px 20px rgba(0,0,0,0.15)' : '0 4px 12px rgba(37,99,235,0.06)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ padding: '12px', backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : '#dbeafe', borderRadius: '14px' }}>
                <FaVoteYea size={24} color="#2563eb" />
              </div>
              <span style={{ fontSize: '12px', fontWeight: 'bold', padding: '6px 12px', borderRadius: '20px', backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : '#dbeafe', color: '#1d4ed8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FaCalendarCheck /> أسبوعي
              </span>
            </div>

            <h2 className='title' style={{ margin: '0 0 8px 0', color: isDark ? "#f8fafc" : "#1e3a8a", fontSize: '18px', fontWeight: 'bold' }}>
              صفحة التصويتات والتقييم
            </h2>

            <p className='desc' style={{ margin: 0, color: isDark ? "#94a3b8" : "#1e40af", fontSize: '13px', lineHeight: '1.6', opacity: 0.85 }}>
              الصفحة المخصصة لجميع تقييمات المهام للأقسام المختلفة. تبدأ فترة التصويت رسمياً من يوم السبت وتغلق أوتوماتيكياً يوم الجمعة لحصر النتائج وإعلان الأوائل.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2563eb', fontWeight: 'bold', fontSize: '14px' }}>
            <span>الدخول للتصويت</span>
            <FaArrowLeft size={14} />
          </div>
        </Link>

        {isAdmin && (
          <Link to="/employees" className="card" style={{ 
            backgroundColor: isDark ? "var(--bg-card-dark, #1e293b)" : "#f0fdf4", 
            border: `1px solid ${isDark ? "var(--border-dark, #334155)" : "#bbf7d0"}`, 
            borderRadius: '20px', 
            padding: '28px', 
            textDecoration: 'none', 
            display: 'flex', 
            flexDirection: 'column', 
            justify: 'space-between', 
            gap: '20px',
            transition: 'transform 0.2s ease, border-color 0.2s ease',
            boxShadow: isDark ? '0 10px 20px rgba(0,0,0,0.15)' : '0 4px 12px rgba(16,185,129,0.06)'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ padding: '12px', backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#dcfce7', borderRadius: '14px' }}>
                  <FaUsers size={24} color="#16a34a" />
                </div>
                <span style={{ fontSize: '12px', fontWeight: 'bold', padding: '6px 12px', borderRadius: '20px', backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FaUserShield /> مسؤول النظام
                </span>
              </div>

              <h2 className='title' style={{ margin: '0 0 8px 0', color: isDark ? "#f8fafc" : "#065f46", fontSize: '18px', fontWeight: 'bold' }}>
                إدارة وسجل الموظفين
              </h2>

              <p className='desc' style={{ margin: 0, color: isDark ? "#94a3b8" : "#047857", fontSize: '13px', lineHeight: '1.6', opacity: 0.85 }}>
                لوحة تحكم خاصة بالمسؤولين تمكّنك من إضافة موظفين جُدد، تعديل الصلاحيات والأقسام، أو حذف الموظفين والوصول لكافة بيانات السجل.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#16a34a', fontWeight: 'bold', fontSize: '14px' }}>
              <span>إدارة الموظفين</span>
              <FaArrowLeft size={14} />
            </div>
          </Link>
        )}

      </div>
    </div>
  </div>
);
};