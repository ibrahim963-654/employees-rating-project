import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FaSun, 
  FaMoon, 
  FaSignOutAlt, 
  FaArrowRight, 
  FaTrophy, 
  FaStar, 
  FaChartBar, 
  FaUsers, 
  FaListOl, 
  FaPaperPlane, 
  FaExclamationTriangle, 
  FaBan, 
  FaCheckCircle, 
  FaMedal, 
  FaArrowLeft,
  FaEye,
  FaCalendarAlt,
  FaList
} from 'react-icons/fa';
import { 
  BarChart, 
  Bar, 
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell 
} from 'recharts';

const ROLE_DISPLAY_MAP = {
  "ACCOUNTANT": "محاسب",
  "CASHIER": "كاشير",
  "REGIONAL": "اقليمي",
  "SALES": "مبيعات",
  "MANAGER": "مدير"
};

const REVERSE_ROLE_MAP = {
  "محاسب": "ACCOUNTANT",
  "كاشير": "CASHIER",
  "اقليمي": "REGIONAL",
  "مبيعات": "SALES",
  "مدير": "MANAGER"
};

export const Voting = () => {
 const navigate = useNavigate();

  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');
  const [userName, setUserName] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  const [selectedJob, setSelectedJob] = useState('محاسب');
  const [winnerCategory, setWinnerCategory] = useState('الكل');
  const [isEvaluating, setIsEvaluating] = useState(false); 
  const [showAdminResultsView, setShowAdminResultsView] = useState(false);
  const [selectedUserToVote, setSelectedUserToVote] = useState(null);
  const [ratings, setRatings] = useState({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const [users, setUsers] = useState([]);
  const [votes, setVotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFriday, setIsFriday] = useState(false);

  const API_EMPLOYEES_URL = `${import.meta.env.VITE_API_URL}/users/`;
  const API_VOTES_URL = `${import.meta.env.VITE_API_URL}/votes/`;

  const getToken = () => {
    return localStorage.getItem('token') || localStorage.getItem('access_token') || localStorage.getItem('access');
  };

  const categories = ["محاسب", "كاشير", "اقليمي", "مبيعات", "مدير"];

  const evaluationCriteria = {
    "محاسب": [
      "دقة التقرير المالي والحسابات",
      "الالتزام بالمواعيد النهائية والتسليم",
      "إدارة وتسوية الفواتير بدون أخطاء",
      "التعاون مع باقي الأقسام والشفافية",
      "القدرة على حل المشاكل المالية المعقدة"
    ],
    "كاشير": [
      "السرعة والدقة في إتمام المعاملات النقدية",
      "حسن التعامل مع العملاء ولباقة الحديث",
      "الالتزام بتطابق صندوق النقدية (الدرج)",
      "المظهر العام والالتزام بالزي الرسمي",
      "السرعة في حل مشكلات الدفع والارتجاع"
    ],
    "اقليمي": [
      "المتابعة الفعالة للفروع التابعة له",
      "القدرة على تحقيق الأهداف والتارقت الأسبوعي",
      "إدارة فرق العمل وتوجيههم بفاعلية",
      "سرعة حل الأزمات والمشكلات الميدانية",
      "تقديم تقارير دورية شاملة للإدارة"
    ],
    "مبيعات": [
      "تحقيق نسبة التارقت والتغطية البيعية",
      "إقناع العملاء ومهارات التفاوض",
      "المعرفة الكاملة بالمنتجات والخدمات",
      "متابعة العملاء بعد البيع وكسب ولاءهم",
      "النشاط والمبادرة بالعمل الجماعي"
    ],
    "مدير": [
      "القيادة وتوجيه الفريق بنجاح",
      "التخطيط الاستراتيجي واتخاذ القرارات",
      "التواصل الفعال وعدالة توزيع المهام",
      "التطوير المستمر لأداء المرؤوسين",
      "القدرة على العمل تحت الضغط والأزمات"
    ]
  };

useEffect(() => {
    const getWeekNumber = (d) => {
      d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
      d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
      var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
      var weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
      return weekNo;
    };

    const currentWeek = getWeekNumber(new Date());
    const savedWeek = localStorage.getItem('current_voting_week');
    
    if (savedWeek !== String(currentWeek)) {
      localStorage.setItem('local_votes', JSON.stringify([]));
      localStorage.setItem('current_voting_week', String(currentWeek));
    }
  }, []);

  useEffect(() => {
    const today = new Date();
    setIsFriday(today.getDay() === 5);

    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (storedUser) {
      setCurrentUser(storedUser);
      setUserName(storedUser.name || storedUser.username || '');
    }

    const themeName = isDark ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', themeName);
    localStorage.setItem('theme', themeName);

    fetchInitialData();
  }, [isDark]);

  const fetchInitialData = async () => {
    setLoading(true);
    const token = getToken();
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    try {
      const empRes = await fetch(API_EMPLOYEES_URL, { headers });
      if (empRes.ok) {
        const empData = await empRes.json();
        const empList = Array.isArray(empData) ? empData : (empData.results || []);
        setUsers(empList);
        localStorage.setItem('local_employees', JSON.stringify(empList));
      } else {
        setUsers(JSON.parse(localStorage.getItem('local_employees') || '[]'));
      }
    } catch (err) {
      setUsers(JSON.parse(localStorage.getItem('local_employees') || '[]'));
    }

    try {
      const voteRes = await fetch(API_VOTES_URL, { headers });
      const localVotes = JSON.parse(localStorage.getItem('local_votes') || '[]');
      
      if (voteRes.ok) {
        const voteData = await voteRes.json();
        const serverVotes = Array.isArray(voteData) ? voteData : (voteData.results || []);
        
        const mergedVotes = [...serverVotes];
        localVotes.forEach(lv => {
          if (!mergedVotes.some(sv => (sv.id === lv.id || (String(sv.targetUserId) === String(lv.targetUserId) && String(sv.voterId) === String(lv.voterId))))) {
            mergedVotes.push(lv);
          }
        });

        setVotes(mergedVotes);
        localStorage.setItem('local_votes', JSON.stringify(mergedVotes));
      } else {
        setVotes(localVotes);
      }
    } catch (err) {
      setVotes(JSON.parse(localStorage.getItem('local_votes') || '[]'));
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = () => setIsDark((prev) => !prev);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('access');
    localStorage.removeItem('user');
    navigate('/');
  };

  const storedUserCheck = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = storedUserCheck?.role === 'ADMIN' || storedUserCheck?.is_superuser || storedUserCheck?.is_staff || storedUserCheck?.username === '1' || userName === '1' || currentUser?.role === 'ADMIN';

  const userCurrentRole = currentUser?.role ? (ROLE_DISPLAY_MAP[currentUser.role] || currentUser.role) : '';
  const userCurrentJob = currentUser?.job || currentUser?.jop || currentUser?.position || currentUser?.category || '';
  
  const isSameJob = userCurrentRole === selectedJob || userCurrentJob === selectedJob;

  const hasVotedForUser = (targetUserId) => {
    const currentVoterName = currentUser?.username || currentUser?.name;
    const currentVoterId = currentUser?.id || currentUser?._id;
    const safeVotes = Array.isArray(votes) ? votes : [];
    
    return safeVotes.some(v => {
      const matchTarget = String(v.targetUserId) === String(targetUserId);
      const matchVoter = (currentVoterId && String(v.voterId) === String(currentVoterId)) || 
      (currentVoterName && v.voter === currentVoterName);
      return matchTarget && matchVoter;
    });
  };

  const handleStarClick = (criterionIndex, starValue) => {
    setRatings(prev => ({ ...prev, [criterionIndex]: starValue }));
  };

  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    const token = getToken();
    const targetId = selectedUserToVote?.id || selectedUserToVote?._id;

    const newVote = {
      id: Date.now(),
      evaluatedJob: selectedJob,
      targetUserId: targetId,
      voter: currentUser?.username || currentUser?.name,
      voterId: currentUser?.id || currentUser?._id,
      ratings: ratings,
      notes: notes
    };

    const updatedVotes = [...(Array.isArray(votes) ? votes : []), newVote];
    setVotes(updatedVotes);
    localStorage.setItem('local_votes', JSON.stringify(updatedVotes));

    try {
      await fetch(API_VOTES_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newVote)
      });
    } catch (err) {
      console.error(err);
    }

    setSubmitted(true);
    setIsEvaluating(false);
    setRatings({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
    setNotes('');
  };

  const currentCriteria = evaluationCriteria[selectedJob] || evaluationCriteria["محاسب"];

  const filteredUsersForVoting = Array.isArray(users) ? users.filter(u => {
    const targetRoleCode = REVERSE_ROLE_MAP[selectedJob];
    const userRole = (u.role || '').trim();
    const userJob = (u.job || u.jop || u.position || u.category || '').trim();
    return userRole === targetRoleCode || userJob === selectedJob;
  }) : [];
  
  const validVotes = Array.isArray(votes) && Array.isArray(users) 
    ? votes.filter(v => users.some(emp => String(emp.id || emp._id) === String(v.targetUserId))) 
    : (Array.isArray(votes) ? votes : []);

  const totalVotesCount = validVotes.length;

  let totalAllRatings = 0;
  let totalRatingEntries = 0;
  const jobVoteCounts = { "محاسب": 0, "كاشير": 0, "اقليمي": 0, "مبيعات": 0, "مدير": 0 };

  validVotes.forEach(v => {
    if (v.evaluatedJob && jobVoteCounts[v.evaluatedJob] !== undefined) {
      jobVoteCounts[v.evaluatedJob]++;
    }
    Object.values(v.ratings || {}).forEach(r => {
      totalAllRatings += Number(r) || 0;
      totalRatingEntries += 1;
    });
  });

  const averageRating = totalRatingEntries > 0 ? (totalAllRatings / totalRatingEntries).toFixed(1) : "0.0";

  let topCategoryName = "لا يوجد";
  let maxCatVotes = -1;
  Object.entries(jobVoteCounts).forEach(([cat, count]) => {
    if (count > maxCatVotes) {
      maxCatVotes = count;
      topCategoryName = cat;
    }
  });

  const calculatedChartData = categories.map(cat => ({
    name: cat,
    total: jobVoteCounts[cat] || 0
  }));

  const calculatedDepartmentData = [
    { name: 'الإدارة', value: jobVoteCounts['مدير'] || 1, color: '#3b82f6' },
    { name: 'المبيعات', value: jobVoteCounts['مبيعات'] || 1, color: '#10b981' },
    { name: 'الحسابات', value: jobVoteCounts['محاسب'] || 1, color: '#f59e0b' },
    { name: 'الكاشير', value: jobVoteCounts['كاشير'] || 1, color: '#8b5cf6' },
    { name: 'الإقليمي', value: jobVoteCounts['اقليمي'] || 1, color: '#ec4899' },
  ];

  const calculatedWinners = Array.isArray(users) ? users.map(u => {
    const userId = u.id || u._id;
    const userVotes = validVotes.filter(v => String(v.targetUserId) === String(userId));
    let totalScore = 0;
    userVotes.forEach(v => {
      Object.values(v.ratings || {}).forEach(r => totalScore += Number(r) || 0);
    });
    
    const mappedJob = ROLE_DISPLAY_MAP[u.role] || u.job || u.jop || u.position || u.category || 'غير محدد';

    return {
      id: userId,
      name: u.first_name && u.first_name.trim() !== '' ? u.first_name : u.username,
      fled: u.fled || u.field || u.branch_name_display || u.branch || "غير محدد",
      job: mappedJob,
      points: totalScore,
      profile_pic: u.profile_pic || u.img || u.image || u.avatar || ""
    };
  }).sort((a, b) => b.points - a.points) : [];

  const filteredWinners = winnerCategory === 'الكل' 
    ? calculatedWinners 
    : calculatedWinners.filter(w => w.job === winnerCategory);

  const top5Winners = filteredWinners.slice(0, 5);
  const userProfilePic = currentUser?.profile_pic || currentUser?.img || currentUser?.image || currentUser?.avatar || "";

  return (
    <div className="main" style={{ 
      backgroundColor: isDark ? "#0f172a" : "#f8fafc", 
      minHeight: '100vh', 
      width: '100%',
      direction: 'rtl',
      overflowX: 'hidden',
      transition: 'all 0.3s ease',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>
      <style>{`
        @media (max-width: 768px) {
          .table-responsive-wrapper {
            width: 100%;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }
          .custom-responsive-table {
            min-width: 650px;
          }
        }
      `}</style>
      
      <header style={{ 
        display: 'flex',
        flexDirection: "row-reverse",
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '16px 40px', 
        width: '100%',
        boxSizing: 'border-box',
        backgroundColor: isDark ? "#1e293b" : "#ffffff", 
        borderBottom: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
        boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.05)',
        zIndex: 10,
        flexWrap: 'wrap',
        gap: '15px'
      }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', order: 1 }}>
          <h3 style={{ margin: 0, color: isDark ? "#f8fafc" : "#0f172a", fontSize: '19px', fontWeight: 'bold' }}>
            اسم الشركة
          </h3>
          <img src="/logo.png" alt="logo" style={{ width: '42px', height: '42px', objectFit: 'contain' }} />
        </div>

    
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', order: 2 }}>
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
            <span>خروج</span>
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

        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px',
          padding: '6px 14px',
          borderRadius: '12px',
          backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
          order: 3
        }}>
          {isAdmin ? (
            <div style={{ color: isDark ? "#10b981" : "#059669", fontWeight: '700', fontSize: '15px', letterSpacing: '0.3px' }}>
              مرحبا مشرف الشركه
            </div>
          ) : (
            <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
              {userProfilePic ? (
                <img 
                  src={userProfilePic} 
                  alt={userName} 
                  style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #10b981' }} 
                />
              ) : (
                <div style={{ 
                  width: '36px', 
                  height: '36px', 
                  borderRadius: '50%', 
                  backgroundColor: '#10b981', 
                  color: '#fff', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontWeight: 'bold', 
                  fontSize: '15px' 
                }}>
                  {userName ? userName.charAt(0).toUpperCase() : <FaUsers size={16} />}
                </div>
              )}
              <div style={{ color: isDark ? "#f8fafc" : "#0f172a", fontWeight: '700', fontSize: '15px' }}>
                مرحباً، {userName || "ضيف"}
              </div>
            </Link>
          )}
        </div>

      </header>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px', width: '100%', boxSizing: 'border-box' }}>
        
        {isAdmin && (
          <div style={{ 
            display: "flex", 
            justifyContent: "center", 
            marginBottom: "30px" 
          }}>
            <button
              onClick={() => setShowAdminResultsView(!showAdminResultsView)}
              style={{
                backgroundColor: showAdminResultsView ? '#f59e0b' : '#3b82f6',
                color: '#ffffff',
                border: 'none',
                padding: '14px 32px',
                borderRadius: '16px',
                fontWeight: 'bold',
                fontSize: '18px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                boxShadow: '0 6px 20px rgba(59, 130, 246, 0.35)',
                transition: 'all 0.2s ease'
              }}
            >
              <FaEye size={20} />
              <span>{showAdminResultsView ? "العودة لصفحة التصويت العادية" : "عرض النتائج والترتيب (للمشرف فقط)"}</span>
            </button>
          </div>
        )}

        {(isFriday && !showAdminResultsView) || (showAdminResultsView) ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "25px", width: "100%" }}>
            <div style={{
              textAlign: "center",
              backgroundColor: isDark ? "#1e293b" : "#ffffff",
              padding: "35px 25px",
              borderRadius: "24px",
              boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.04)',
              border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
              width: "100%",
              boxSizing: "border-box"
            }}>
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(245, 158, 11, 0.15)",
                color: "#f59e0b",
                padding: "16px",
                borderRadius: "50%",
                marginBottom: "15px"
              }}>
                <FaTrophy size={48} />
              </div>

              <h1 style={{
                color: isDark ? "#34d399" : "#059669",
                fontSize: "30px",
                margin: "0 0 10px 0",
                fontWeight: "800"
              }}>
                {showAdminResultsView ? "لوحة نتائج وعرض الترتيب (معاينة المشرف) 📊" : "التصويت مغلق اليوم (الجمعة) 🔒"}
              </h1>
              <p style={{
                color: isDark ? "#94a3b8" : "#475569",
                fontSize: "15px",
                margin: "0 auto 25px auto",
                maxWidth: "600px",
                lineHeight: "1.6"
              }}>
                {showAdminResultsView ? "تستعرض الآن النتائج والإحصائيات وأعلى الموظفين بصلاحيات المشرف." : "تم إيقاف استقبال التصويتات الأسبوعية مؤقتاً لحساب النتائج. يرجى الاطلاع على قائمة أعلى 5 موظفين تقييماً لهذا الأسبوع."}
              </p>

              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "15px", flexWrap: "wrap", marginBottom: "35px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <label style={{ color: isDark ? "#cbd5e1" : "#475569", fontWeight: "bold", fontSize: "14px" }}>
                    عرض نتائج الفئة:
                  </label>
                  <select 
                    value={winnerCategory}
                    onChange={(e) => setWinnerCategory(e.target.value)}
                    style={{ 
                      color: isDark ? "#f8fafc" : "#0f172a", 
                      backgroundColor: isDark ? "#0f172a" : "#f8fafc", 
                      border: `1px solid ${isDark ? "#334155" : "#cbd5e1"}`, 
                      borderRadius: '10px',
                      padding: '8px 16px', 
                      outline: 'none',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="الكل">كل الفئات</option>
                    <option value="محاسب">محاسب</option>
                    <option value="كاشير">كاشير</option>
                    <option value="اقليمي">اقليمي</option>
                    <option value="مبيعات">مبيعات</option>
                    <option value="مدير">مدير</option>
                  </select>
                </div>

                <button
                  onClick={() => navigate('/leaderboard', { state: { category: winnerCategory } })}
                  style={{
                    backgroundColor: "#10b981",
                    color: "#ffffff",
                    border: "none",
                    padding: "9px 20px",
                    borderRadius: "10px",
                    fontWeight: "bold",
                    fontSize: "14px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    boxShadow: "0 4px 12px rgba(16, 185, 129, 0.25)"
                  }}
                >
                  <FaList />
                  <span>عرض الترتيب الكامل</span>
                </button>
              </div>

              <div style={{ textAlign: 'right', borderTop: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`, paddingTop: "30px" }}>
                <h3 style={{ color: isDark ? "#f8fafc" : "#0f172a", fontSize: "20px", fontWeight: "bold", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
                  <FaMedal color="#f59e0b" /> قائمة أعلى 5 موظفين تقييماً ({winnerCategory})
                </h3>

                {top5Winners.length > 0 ? (
                  <div className="table-responsive-wrapper" style={{ 
                    backgroundColor: isDark ? "#111827" : "#ffffff", 
                    borderRadius: '20px', 
                    border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
                    boxShadow: isDark ? '0 10px 20px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.04)'
                  }}>
                    <table className="custom-responsive-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
                      <thead>
                        <tr style={{ 
                          borderBottom: `2px solid ${isDark ? "#334155" : "#e2e8f0"}`,
                          backgroundColor: isDark ? "#161e2e" : "#f8fafc"
                        }}>
                          <th style={{ padding: '16px 20px', color: isDark ? "#f8fafc" : "#0f172a", fontSize: '14px', fontWeight: 'bold' }}>المركز</th>
                          <th style={{ padding: '16px 20px', color: isDark ? "#f8fafc" : "#0f172a", fontSize: '14px', fontWeight: 'bold' }}>الصورة</th>
                          <th style={{ padding: '16px 20px', color: isDark ? "#f8fafc" : "#0f172a", fontSize: '14px', fontWeight: 'bold' }}>اسم المستخدم</th>
                          <th style={{ padding: '16px 20px', color: isDark ? "#f8fafc" : "#0f172a", fontSize: '14px', fontWeight: 'bold' }}>الوظيفة</th>
                          <th style={{ padding: '16px 20px', color: isDark ? "#f8fafc" : "#0f172a", fontSize: '14px', fontWeight: 'bold' }}>الفرع</th>
                          <th style={{ padding: '16px 20px', color: isDark ? "#f8fafc" : "#0f172a", fontSize: '14px', fontWeight: 'bold', textAlign: 'center' }}>عدد النقاط</th>
                        </tr>
                      </thead>
                      <tbody>
                        {top5Winners.map((winner, index) => (
                          <tr 
                            key={winner.id || index} 
                            style={{ 
                              borderBottom: `1px solid ${isDark ? "#334155" : "#f1f5f9"}`,
                              transition: 'background-color 0.2s ease'
                            }}
                          >
                            <td style={{ padding: '14px 20px', color: isDark ? "#f8fafc" : "#0f172a", fontWeight: 'bold', fontSize: '15px' }}>
                              <div style={{
                                width: "30px",
                                height: "30px",
                                borderRadius: "50%",
                                backgroundColor: index === 0 ? "#f59e0b" : index === 1 ? "#94a3b8" : index === 2 ? "#b45309" : (isDark ? "#334155" : "#cbd5e1"),
                                color: "#ffffff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: "bold",
                                fontSize: "13px"
                              }}>
                                {index + 1}
                              </div>
                            </td>
                            <td style={{ padding: '14px 20px' }}>
                              {winner.profile_pic ? (
                                <img 
                                  src={winner.profile_pic} 
                                  alt={winner.name} 
                                  style={{ 
                                    width: '42px', 
                                    height: '42px', 
                                    borderRadius: '12px', 
                                    objectFit: 'cover',
                                    border: `2px solid ${isDark ? '#10b981' : '#16a34a'}`,
                                    flexShrink: 0
                                  }} 
                                />
                              ) : (
                                <div style={{ 
                                  width: '42px', 
                                  height: '42px', 
                                  borderRadius: '12px', 
                                  backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#dcfce7', 
                                  color: isDark ? '#10b981' : '#15803d',
                                  display: 'grid',
                                  placeItems: 'center',
                                  fontWeight: 'bold',
                                  fontSize: '16px',
                                  flexShrink: 0,
                                  border: `1px solid ${isDark ? 'rgba(16, 185, 129, 0.3)' : '#bbf7d0'}`
                                }}>
                                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
                                    {winner.name ? winner.name.charAt(0).toUpperCase() : <FaUsers size={16} />}
                                  </span>
                                </div>
                              )}
                            </td>
                            <td style={{ padding: '14px 20px', color: isDark ? "#f8fafc" : "#0f172a", fontSize: '14px', fontWeight: '600' }}>
                              {winner.name}
                            </td>
                            <td style={{ padding: '14px 20px', fontSize: '14px' }}>
                              <span style={{ 
                                backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : '#f0fdf4',
                                color: isDark ? '#a7f3d0' : '#15803d',
                                padding: '6px 12px',
                                borderRadius: '8px',
                                border: `1px solid ${isDark ? 'rgba(16, 185, 129, 0.2)' : '#dcfce7'}`,
                                fontWeight: '600',
                                display: 'inline-block'
                              }}>
                                {winner.job}
                              </span>
                            </td>
                            <td style={{ padding: '14px 20px', fontSize: '14px' }}>
                              <span style={{ 
                                backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : '#eff6ff',
                                color: isDark ? '#93c5fd' : '#1d4ed8',
                                padding: '6px 12px',
                                borderRadius: '8px',
                                border: `1px solid ${isDark ? 'rgba(59, 130, 246, 0.2)' : '#dbeafe'}`,
                                fontWeight: '600',
                                display: 'inline-block'
                              }}>
                                {winner.fled}
                              </span>
                            </td>
                            <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                              <span style={{ 
                                backgroundColor: isDark ? 'rgba(245, 158, 11, 0.15)' : '#fef3c7',
                                color: isDark ? '#fcd34d' : '#d97706',
                                padding: '6px 14px',
                                borderRadius: '20px',
                                fontWeight: 'bold',
                                fontSize: '14px',
                                display: 'inline-block'
                              }}>
                                {winner.points} نقطة
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={{ textAlign: "center", padding: "20px", color: isDark ? "#94a3b8" : "#64748b", fontSize: "14px" }}>
                    لا توجد تقييمات كافية لعرضها في هذه الفئة حالياً.
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          !isEvaluating ? ( 
            <>
              <div style={{
                textAlign: "center",
                backgroundColor: isDark ? "#1e293b" : "#ffffff",
                padding: "40px 20px",
                borderRadius: "24px",
                boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.04)',
                border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
                marginBottom: "35px"
              }}>
                <h1 style={{
                  color: isDark ? "#34d399" : "#059669",
                  fontSize: "36px",
                  margin: "0 0 12px 0",
                  fontWeight: "800"
                }}>
                  منصة التصويتات الأسبوعية 🏆
                </h1>
                <p style={{
                  color: isDark ? "#94a3b8" : "#475569",
                  fontSize: "16px",
                  margin: "0 auto",
                  maxWidth: "600px",
                  lineHeight: "1.6"
                }}>
                  الصفحة الكاملة والمتخصصة في تقييم الموظفين وتقييم نشاطهم الأسبوعي بكل شفافية.
                </p>
              </div>

              {isAdmin && (
  <div style={{ 
    backgroundColor: isDark ? "#0f172a" : "#f8fafc", 
    padding: '30px', 
    borderRadius: '24px',
    marginBottom: '35px', 
    border: `1px solid ${isDark ? "#1e293b" : "#e2e8f0"}`,
    boxShadow: isDark ? '0 20px 40px rgba(0,0,0,0.4)' : '0 10px 30px rgba(0,0,0,0.05)',
    boxSizing: 'border-box',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
  }}>
    
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
      <h2 style={{ 
        color: isDark ? "#f8fafc" : "#0f172a", 
        margin: 0, 
        display: 'flex', 
        alignItems: 'center', 
        gap: '12px', 
        fontSize: '20px', 
        fontWeight: 'bold' 
      }}>
        <span style={{ 
          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', 
          padding: '10px', 
          borderRadius: '12px', 
          display: 'flex', 
          color: '#fff' 
        }}>
          <FaChartBar size={18} />
        </span>
        لوحة تحكم ونشاط التصويت (Dashboard)
      </h2>
      <div style={{ 
        backgroundColor: isDark ? '#1e293b' : '#e2e8f0', 
        color: '#10b981', 
        padding: '6px 14px', 
        borderRadius: '20px', 
        fontSize: '13px', 
        fontWeight: '600',
        border: '1px solid #10b98133'
      }}>
        ● نشط الآن
      </div>
    </div>

    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', 
      gap: '16px', 
      marginBottom: '30px' 
    }}>
      <div style={{ 
        background: isDark ? '#1e293b' : '#ffffff', 
        padding: '18px', 
        borderRadius: '18px', 
        color: isDark ? '#fff' : '#0f172a', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '14px',
        border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
        boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
      }}>
        <div style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', padding: '12px', borderRadius: '14px', display: 'flex' }}>
          <FaUsers size={20} />
        </div>
        <div>
          <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>إجمالي الأصوات</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{totalVotesCount}</div>
        </div>
      </div>

      <div style={{ 
        background: isDark ? '#1e293b' : '#ffffff', 
        padding: '18px', 
        borderRadius: '18px', 
        color: isDark ? '#fff' : '#0f172a', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '14px',
        border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
        boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
      }}>
        <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '12px', borderRadius: '14px', display: 'flex' }}>
          <FaStar size={20} />
        </div>
        <div>
          <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>متوسط التقييم</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{averageRating} <span style={{ fontSize: '11px', color: '#94a3b8' }}>/ 5</span></div>
        </div>
      </div>

      <div style={{ 
        background: isDark ? '#1e293b' : '#ffffff', 
        padding: '18px', 
        borderRadius: '18px', 
        color: isDark ? '#fff' : '#0f172a', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '14px',
        border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
        boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
      }}>
        <div style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', padding: '12px', borderRadius: '14px', display: 'flex' }}>
          <FaTrophy size={20} />
        </div>
        <div>
          <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>الفئة الأعلى</div>
          <div style={{ fontSize: '15px', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '110px' }}>{topCategoryName}</div>
        </div>
      </div>

      <div style={{ 
        background: isDark ? '#1e293b' : '#ffffff', 
        padding: '18px', 
        borderRadius: '18px', 
        color: isDark ? '#fff' : '#0f172a', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '14px',
        border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
        boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
      }}>
        <div style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6', padding: '12px', borderRadius: '14px', display: 'flex' }}>
          <FaCalendarAlt size={20} />
        </div>
        <div>
          <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>حالة النظام</div>
          <div style={{ fontSize: '16px', fontWeight: 'bold' }}>يعمل بكفاءة</div>
        </div>
      </div>

    </div>

    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: '2fr 1fr', 
      gap: '20px' 
    }}>
      
      <div style={{ 
        backgroundColor: isDark ? '#1e293b' : '#ffffff', 
        padding: '20px', 
        borderRadius: '20px', 
        border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
        boxSizing: 'border-box'
      }}>
        <h4 style={{ color: isDark ? '#f8fafc' : '#0f172a', marginTop: 0, marginBottom: '20px', fontSize: '15px', fontWeight: 'bold' }}>
          تدفق وأمواج الأصوات والتفاعل
        </h4>
        <div style={{ width: '100%', height: '240px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={calculatedChartData}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="colorSecondary" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#334155" : "#e2e8f0"} vertical={false} />
              <XAxis dataKey="name" stroke={isDark ? "#94a3b8" : "#64748b"} fontSize={12} tickLine={false} />
              <YAxis stroke={isDark ? "#94a3b8" : "#64748b"} allowDecimals={false} fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ backgroundColor: isDark ? '#0f172a' : '#ffffff', borderColor: isDark ? '#334155' : '#e2e8f0', borderRadius: '10px', color: isDark ? '#fff' : '#000' }} />
              <Area type="monotone" dataKey="total" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ 
        backgroundColor: isDark ? '#1e293b' : '#ffffff', 
        padding: '20px', 
        borderRadius: '20px', 
        border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}>
        <h4 style={{ color: isDark ? '#f8fafc' : '#0f172a', marginTop: 0, marginBottom: '10px', fontSize: '15px', fontWeight: 'bold' }}>
          توزيع المشاركة
        </h4>
        <div style={{ width: '100%', height: '180px', position: 'relative' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie 
                data={calculatedDepartmentData.map((item, idx) => ({
                  ...item,
                  color: idx === 0 ? '#8b5cf6' : idx === 1 ? '#ef4444' : '#cbd5e1'
                }))} 
                cx="50%" 
                cy="50%" 
                innerRadius={50} 
                outerRadius={75} 
                paddingAngle={6} 
                dataKey="value"
              >
                {calculatedDepartmentData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={index === 0 ? '#8b5cf6' : index === 1 ? '#ef4444' : '#64748b'} 
                    stroke="none" 
                  />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: isDark ? '#0f172a' : '#ffffff', borderColor: isDark ? '#334155' : '#e2e8f0', borderRadius: '10px', color: isDark ? '#fff' : '#000' }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)', 
            textAlign: 'center',
            pointerEvents: 'none'
          }}>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: isDark ? '#fff' : '#000' }}>{totalVotesCount}</div>
            <div style={{ fontSize: '10px', color: '#94a3b8' }}>مشارك</div>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', fontSize: '11px', color: '#94a3b8', marginTop: '10px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#8b5cf6', display: 'inline-block' }}></span> صوتوا</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', display: 'inline-block' }}></span> متأخر</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#64748b', display: 'inline-block' }}></span> لم يصوتوا</span>
        </div>
      </div>

    </div>

  </div>
)}
              <h2 style={{
                color: isDark ? "#f8fafc" : "#0f172a",
                fontSize: "22px",
                fontWeight: "bold",
                marginBottom: "20px"
              }}>
                كيف يتم التصويت:
              </h2>

              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "16px",
                marginBottom: "35px"
              }}>
                <div style={{
                  backgroundColor: isDark ? "#1e293b" : "#ffffff",
                  padding: "24px",
                  borderRadius: "16px",
                  border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
                  boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.1)' : '0 2px 8px rgba(0,0,0,0.03)',
                  display: "flex",
                  alignItems: "center",
                  gap: "16px"
                }}>
                  <div style={{ backgroundColor: isDark ? "rgba(59, 130, 246, 0.15)" : "#dbeafe", color: "#3b82f6", padding: "14px", borderRadius: "12px" }}>
                    <FaListOl size={22} />
                  </div>
                  <div>
                    <h3 style={{ margin: "0 0 4px 0", fontSize: "16px", color: isDark ? "#f8fafc" : "#0f172a" }}>1- اختيار نوع الموظفين</h3>
                    <span style={{ fontSize: "13px", color: isDark ? "#94a3b8" : "#64748b" }}>حدد القسم أو الفئة المراد تقييمها</span>
                  </div>
                </div>

                <div style={{
                  backgroundColor: isDark ? "#1e293b" : "#ffffff",
                  padding: "24px",
                  borderRadius: "16px",
                  border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
                  boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.1)' : '0 2px 8px rgba(0,0,0,0.03)',
                  display: "flex",
                  alignItems: "center",
                  gap: "16px"
                }}>
                  <div style={{ backgroundColor: isDark ? "rgba(245, 158, 11, 0.15)" : "#fef3c7", color: "#d97706", padding: "14px", borderRadius: "12px" }}>
                    <FaStar size={22} />
                  </div>
                  <div>
                    <h3 style={{ margin: "0 0 4px 0", fontSize: "16px", color: isDark ? "#f8fafc" : "#0f172a" }}>2- تقييم المعايير الـ 5</h3>
                    <span style={{ fontSize: "13px", color: isDark ? "#94a3b8" : "#64748b" }}>تقييم الموظف بناءً على المعايير المحددة</span>
                  </div>
                </div>

                <div style={{
                  backgroundColor: isDark ? "rgba(16, 185, 129, 0.1)" : "#dcfce7",
                  padding: "24px",
                  borderRadius: "16px",
                  border: `1px solid ${isDark ? "rgba(16, 185, 129, 0.2)" : "#bbf7d0"}`,
                  boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.1)' : '0 2px 8px rgba(0,0,0,0.03)',
                  display: "flex",
                  alignItems: "center",
                  gap: "16px"
                }}>
                  <div style={{ backgroundColor: isDark ? "#10b981" : "#16a34a", color: "#ffffff", padding: "14px", borderRadius: "12px" }}>
                    <FaPaperPlane size={22} />
                  </div>
                  <div>
                    <h3 style={{ margin: "0 0 4px 0", fontSize: "16px", color: isDark ? "#a7f3d0" : "#14532d" }}>3- إرسال التصويت</h3>
                    <span style={{ fontSize: "13px", color: isDark ? "#6ee7b7" : "#15803d" }}>إرسال التقييم وانتظار النتائج</span>
                  </div>
                </div>
              </div>

              <div style={{
                backgroundColor: isDark ? "rgba(239, 68, 68, 0.1)" : "#fef2f2",
                border: `1px solid ${isDark ? "rgba(239, 68, 68, 0.3)" : "#fca5a5"}`,
                borderRadius: "18px",
                padding: "24px 28px",
                boxShadow: isDark ? '0 4px 15px rgba(239, 68, 68, 0.05)' : '0 4px 12px rgba(220, 38, 38, 0.04)',
                marginBottom: "40px"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
                  <FaExclamationTriangle color="#dc2626" size={24} />
                  <h3 style={{ margin: 0, color: "#dc2626", fontSize: "18px", fontWeight: "bold" }}>
                    ملاحظات وقواعد هامة قبل التصويت:
                  </h3>
                </div>

                <ul style={{ 
                  margin: 0, 
                  paddingRight: "24px", 
                  color: isDark ? "#fca5a5" : "#991b1b", 
                  fontSize: "15px", 
                  lineHeight: "1.8",
                  fontWeight: "600"
                }}>
                  <li style={{ marginBottom: "8px", listStyle: "none"}}>
                    1- لا يمكنك تقييم موظف يمتلك نفس تخصصك الوظيفي.
                  </li>
                  <li style={{ listStyle: "none"}}>
                    2- يمنع تكرار التصويت لنفس الموظف أكثر من مرة.
                  </li>
                </ul>
              </div>

              <div style={{
                backgroundColor: isDark ? "#1e293b" : "#ffffff",
                padding: "30px",
                borderRadius: "20px",
                border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
                display: "flex",
                flexDirection: "column",
                gap: "20px"
              }}>
                <div>
                  <label style={{ 
                    display: "block", 
                    marginBottom: "12px", 
                    color: isDark ? "#f8fafc" : "#0f172a",
                    fontWeight: "bold",
                    fontSize: "17px"
                  }}>
                    اختر نوع الوظيفة للبدء في التقييم:
                  </label>
                  <select 
                    name="voting" 
                    id="voting" 
                    value={selectedJob}
                    onChange={(e) => setSelectedJob(e.target.value)}
                    style={{ 
                      color: isDark ? "#f8fafc" : "#0f172a", 
                      backgroundColor: isDark ? "#0f172a" : "#f8fafc", 
                      border: `1px solid ${isDark ? "#334155" : "#cbd5e1"}`, 
                      borderRadius: '12px',
                      padding: '14px 20px', 
                      outline: 'none',
                      fontSize: '15px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      width: '100%',
                      maxWidth: '350px'
                    }}
                  >
                    <option value="محاسب">محاسب</option>
                    <option value="كاشير">كاشير</option>
                    <option value="اقليمي">اقليمي</option>
                    <option value="مبيعات">مبيعات</option>
                    <option value="مدير">مدير</option>
                  </select>
                </div> 

                {isSameJob && (
                  <div style={{
                    backgroundColor: isDark ? "rgba(239, 68, 68, 0.15)" : "#fee2e2",
                    border: "1px solid #fca5a5",
                    borderRadius: "12px",
                    padding: "14px 18px",
                    color: "#dc2626",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    fontWeight: "bold",
                    fontSize: "14px"
                  }}>
                    <FaBan size={18} />
                    <span>عفواً، لا يمكنك التصويت لنفس تخصصك الوظيفي ({userCurrentRole || userCurrentJob || selectedJob}).</span>
                  </div>
                )}

                <div>
                  {loading ? (
                    <div style={{ textAlign: "center", padding: "30px", color: isDark ? "#94a3b8" : "#64748b" }}>
                      جاري تحميل الموظفين...
                    </div>
                  ) : filteredUsersForVoting.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginTop: "20px" }}>
                      {filteredUsersForVoting.map((user, index) => {
                        const targetUserId = user.id || user._id;
                        const alreadyVoted = hasVotedForUser(targetUserId);
                        const isDisabled = isSameJob || alreadyVoted;
                        const userDisplayName = user.first_name && user.first_name.trim() !== '' ? user.first_name : user.username;
                        const userRoleName = ROLE_DISPLAY_MAP[user.role] || user.job || selectedJob;

                        return (
                          <div 
                            key={targetUserId || index} 
                            style={{
                              backgroundColor: isDark ? "#1e293b" : "#ffffff",
                              padding: "20px",
                              borderRadius: "16px",
                              border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
                              display: "flex",
                              alignItems: "center",
                              gap: "20px",
                              boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.04)',
                              flexWrap: 'wrap'
                            }}
                          >
                            <div style={{ width: "70px", height: "70px", borderRadius: "50%", overflow: "hidden", border: "2px solid #10b981", flexShrink: 0 }}>
                              <img 
                                src={user.profile_pic || user.img || user.image || user.avatar || "/default-avatar.png"} 
                                alt={userDisplayName} 
                                style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                              />
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "6px", flexGrow: 1, minWidth: '180px' }}>
                              <h3 style={{ margin: 0, color: isDark ? "#f8fafc" : "#0f172a", fontSize: "18px" }}>
                                الاسم: {userDisplayName}
                              </h3>
                              <span style={{ color: isDark ? "#94a3b8" : "#64748b", fontSize: "14px" }}>
                                الفرع: {user.branch_name_display || user.fled || user.field || user.branch || "غير محدد"}
                              </span>
                              <span style={{ color: isDark ? "#94a3b8" : "#64748b", fontSize: "14px" }}>
                                الفئة: {userRoleName}
                              </span>
                            </div>

                            <button
                              disabled={isDisabled}
                              onClick={() => { setSelectedUserToVote(user); setIsEvaluating(true); setSubmitted(false); }}
                              style={{
                                backgroundColor: alreadyVoted 
                                  ? (isDark ? "#475569" : "#94a3b8") 
                                  : isSameJob 
                                  ? (isDark ? "#334155" : "#cbd5e1") 
                                  : "#10b981",
                                color: "#ffffff",
                                border: "none",
                                padding: "12px 20px",
                                borderRadius: "12px",
                                fontSize: "14px",
                                fontWeight: "bold",
                                cursor: isDisabled ? "not-allowed" : "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                transition: "all 0.2s ease"
                              }}
                            >
                              {alreadyVoted ? (
                                <>
                                  <FaCheckCircle color="#a7f3d0" />
                                  <span>تم التصويت له</span>
                                </>
                              ) : (
                                <>
                                  <span>تقييم {userDisplayName}</span>
                                  <FaArrowLeft />
                                </>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{
                      textAlign: "center",
                      padding: "30px",
                      backgroundColor: isDark ? "#1e293b" : "#ffffff",
                      borderRadius: "16px",
                      border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
                      marginTop: "20px"
                    }}>
                      <h3 style={{ color: isDark ? "#f8fafc" : "#0f172a", margin: 0 }}>
                        ⚠️ لا يوجد موظفين حاليين من فئة ({selectedJob})
                      </h3>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div style={{
              backgroundColor: isDark ? "#1e293b" : "#ffffff",
              borderRadius: "24px",
              padding: "35px",
              border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
              boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.05)'
            }}>
              <button 
                onClick={() => { setIsEvaluating(false); setSubmitted(false); setSelectedUserToVote(null); }}
                style={{
                  backgroundColor: "transparent",
                  border: "none",
                  color: isDark ? "#94a3b8" : "#64748b",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontWeight: "bold",
                  fontSize: "14px",
                  marginBottom: "20px"
                }}
              >
                <FaArrowRight />
                <span>الرجوع لاختيار الموظف</span>
              </button>

              {submitted ? (
                <div style={{ textAlign: "center", padding: "40px 20px" }}>
                  <FaCheckCircle color="#10b981" size={60} style={{ marginBottom: "20px" }} />
                  <h2 style={{ color: isDark ? "#f8fafc" : "#0f172a", marginBottom: "10px" }}>تم إرسال التقييم بنجاح!</h2>
                  <p style={{ color: isDark ? "#94a3b8" : "#64748b", marginBottom: "25px" }}>
                    شكراً لمشاركتك في تقييم الموظف ({selectedUserToVote?.first_name || selectedUserToVote?.username}) في فئة ({selectedJob}).
                  </p>
                  <button
                    onClick={() => { setIsEvaluating(false); setSubmitted(false); setSelectedUserToVote(null); }}
                    style={{
                      backgroundColor: "#10b981",
                      color: "#ffffff",
                      border: "none",
                      padding: "12px 24px",
                      borderRadius: "10px",
                      fontWeight: "bold",
                      cursor: "pointer"
                    }}
                  >
                    العودة للصفحة الرئيسية للتصويت
                  </button>
                </div>
              ) : (
                <form onSubmit={handleRatingSubmit}>
                  <div style={{ borderBottom: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`, paddingBottom: "20px", marginBottom: "25px" }}>
                    <h2 style={{ margin: "0 0 8px 0", color: isDark ? "#34d399" : "#059669", fontSize: "24px" }}>
                      نموذج تقييم: {selectedUserToVote?.first_name || selectedUserToVote?.username || selectedJob}
                    </h2>
                    <p style={{ margin: 0, color: isDark ? "#94a3b8" : "#64748b", fontSize: "14px" }}>
                      يرجى تقييم كل معيار من 1 إلى 5 نجوم بناءً على الأداء الأسبوعي.
                    </p>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginBottom: "30px" }}>
                    {currentCriteria.map((criterion, idx) => {
                      const criterionNum = idx + 1;
                      return (
                        <div key={idx} style={{
                          backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                          padding: "18px 20px",
                          borderRadius: "14px",
                          border: `1px solid ${isDark ? "#334155" : "#cbd5e1"}`,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          flexWrap: "wrap",
                          gap: "10px"
                        }}>
                          <span style={{ fontWeight: "bold", color: isDark ? "#f8fafc" : "#0f172a", fontSize: "15px" }}>
                            {criterionNum}- {criterion}
                          </span>

                          <div style={{ display: "flex", gap: "6px" }}>
                            {[1, 2, 3, 4, 5].map((star) => (
                              <FaStar
                                key={star}
                                size={22}
                                style={{ cursor: "pointer", transition: "color 0.2s ease" }}
                                color={star <= (ratings[criterionNum] || 0) ? "#f59e0b" : (isDark ? "#334155" : "#cbd5e1")}
                                onClick={() => handleStarClick(criterionNum, star)}
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ marginBottom: "25px" }}>
                    <label style={{ display: "block", marginBottom: "8px", color: isDark ? "#f8fafc" : "#0f172a", fontWeight: "bold", fontSize: "14px" }}>
                      ملاحظات إضافية (اختياري):
                    </label>
                    <textarea
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="اكتب أسباب التقييم أو أي ملاحظات ترغب في إضافتها..."
                      style={{
                        width: "100%",
                        backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                        color: isDark ? "#f8fafc" : "#0f172a",
                        border: `1px solid ${isDark ? "#334155" : "#cbd5e1"}`,
                        borderRadius: "12px",
                        padding: "12px",
                        outline: "none",
                        fontSize: "14px",
                        boxSizing: "border-box"
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    style={{
                      backgroundColor: "#10b981",
                      color: "#ffffff",
                      border: "none",
                      padding: "14px 32px",
                      borderRadius: "12px",
                      fontSize: "16px",
                      fontWeight: "bold",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px"
                    }}
                  >
                    <FaPaperPlane />
                    <span>إرسال التقييم النهائي</span>
                  </button>
                </form>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
};