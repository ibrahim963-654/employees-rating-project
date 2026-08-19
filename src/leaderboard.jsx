import axios from 'axios';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { FaTrophy, FaArrowRight, FaMoon, FaSun, FaPrint } from 'react-icons/fa';

export const LeaderboardPage = ({ categories = ["محاسب", "كاشير", "اقليمي", "مبيعات", "مدير"] }) => {
  const navigate = useNavigate()
  const [users, setUsers] = useState([]);
  const [votes, setVotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("الكل");
  
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || false;
  });

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  const handlePrint = () => {
    window.print();
  };

  const API_EMPLOYEES_URL = `${import.meta.env.VITE_API_URL}/users/`;
  const API_VOTES_URL = `${import.meta.env.VITE_API_URL}/votes/`;

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      setLoading(true);
      const token = localStorage.getItem('token') || localStorage.getItem('access_token') || localStorage.getItem('access');
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }

      try {
        const empRes = await fetch(API_EMPLOYEES_URL, { headers });
        if (empRes.ok) {
          const empData = await empRes.json();
          const empList = Array.isArray(empData) ? empData : (empData.results || empData.users || []);
          setUsers(empList);
          localStorage.setItem('local_employees', JSON.stringify(empList));
        } else {
          setUsers(JSON.parse(localStorage.getItem('local_employees') || '[]'));
        }
      } catch (err) {
        setUsers(JSON.parse(localStorage.getItem('local_employees') || '[]'));
      }

      try {
        const localVotes = JSON.parse(localStorage.getItem('local_votes') || '[]');
        const voteRes = await fetch(API_VOTES_URL, { headers });
        
        if (voteRes.ok) {
          const voteData = await voteRes.json();
          const serverVotes = Array.isArray(voteData) ? voteData : (voteData.results || []);
          
          const mergedVotes = [...serverVotes];
          localVotes.forEach(lv => {
            if (!mergedVotes.some(sv => String(sv.id) === String(lv.id) || (String(sv.targetUserId) === String(lv.targetUserId) && sv.voter === lv.voter))) {
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

    fetchLeaderboardData();
  }, []);

  const calculatedWinners = users.map(u => {
    const userId = u.id || u._id;
    const userVotes = votes.filter(v => String(v.targetUserId) === String(userId));
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
      points: totalScore > 0 ? totalScore : Number(u.points || 0) 
    };
  }).sort((a, b) => b.points - a.points);

  const filteredUsers = selectedCategory === "الكل" 
    ? calculatedWinners 
    : calculatedWinners.filter(w => {
        const userJob = (w.job || "").trim().toLowerCase();
        const targetJob = selectedCategory.trim().toLowerCase();
        return userJob === targetJob;
      });

  return (
    <>
      {/* تنسيق خاص بالطباعة لإخفاء الأزرار وجعل الخلفية بيضاء */}
      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background-color: #ffffff !important;
            color: #000000 !important;
          }
        }
      `}</style>

      <div style={{ 
        padding: "30px", 
        backgroundColor: isDark ? "#0f172a" : "#f8fafc", 
        minHeight: "100vh", 
        direction: "rtl",
        boxSizing: "border-box"
      }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          
          <div style={{
            backgroundColor: isDark ? "#1e293b" : "#ffffff",
            padding: "20px 30px",
            borderRadius: "20px",
            border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
            boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.04)',
            marginBottom: "20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "15px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                <Link to="/votes"
                  className="no-print"
                  style={{
                    backgroundColor: "rgb(52, 211, 153)",
                    border: "none",
                    color: "#f8fafc",
                    textDecoration: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontWeight: "bold",
                    fontSize: "13px",
                    padding: "10px 16px",
                    borderRadius: "12px"
                  }}
                >
                  <FaArrowRight />
                  <span>العودة للتصويت</span>
                </Link>
              <h1 style={{ color: isDark ? "#f8fafc" : "#0f172a", fontSize: "20px", fontWeight: "bold", margin: 0 }}>
                لوحة الترتيب العام 🏆
              </h1>
            </div>

            <div style={{ display: "flex", gap: "10px" }} className="no-print">
              <button
                onClick={handlePrint}
                style={{
                  backgroundColor: "#3b82f6",
                  border: "none",
                  color: "#ffffff",
                  cursor: "pointer",
                  padding: "10px 14px",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "13px",
                  fontWeight: "bold"
                }}
              >
                <FaPrint />
                <span>طباعة / PDF</span>
              </button>

              <button
                onClick={toggleTheme}
                style={{
                  backgroundColor: isDark ? "#334155" : "#f1f5f9",
                  border: "none",
                  color: isDark ? "#f8fafc" : "#0f172a",
                  cursor: "pointer",
                  padding: "10px 14px",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "13px",
                  fontWeight: "bold"
                }}
              >
                {isDark ? <FaSun color="#f59e0b" /> : <FaMoon />}
                <span>{isDark ? "الوضع الفاتح" : "الوضع الداكن"}</span>
              </button>
            </div>
          </div>

          <div style={{
            backgroundColor: isDark ? "#1e293b" : "#ffffff",
            padding: "20px 30px",
            borderRadius: "20px",
            border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
            boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.04)',
            marginBottom: "20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "15px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ padding: "12px", backgroundColor: isDark ? "rgba(245, 158, 11, 0.15)" : "#fef3c7", borderRadius: "50%", color: "#f59e0b" }}>
                <FaTrophy size={22} />
              </div>
              <div>
                <h2 style={{ color: isDark ? "#f8fafc" : "#0f172a", fontSize: "18px", fontWeight: "bold", margin: "0 0 4px 0" }}>
                  ترتيب الموظفين
                </h2>
                <p style={{ color: isDark ? "#94a3b8" : "#64748b", fontSize: "13px", margin: 0 }}>
                  عرض تفصيلي لأداء النقاط لجميع الموظفين المسجلين.
                </p>
              </div>
            </div>

            <div className="no-print" style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: isDark ? "#0f172a" : "#f1f5f9", padding: "8px 14px", borderRadius: "12px", border: `1px solid ${isDark ? "#334155" : "#cbd5e1"}` }}>
              <span style={{ fontSize: "13px", color: isDark ? "#94a3b8" : "#64748b", fontWeight: "bold" }}>اختار الفئه</span>
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{
                  backgroundColor: "transparent",
                  border: "none",
                  color: isDark ? "#f8fafc" : "#0f172a",
                  fontWeight: "bold",
                  outline: "none",
                  cursor: "pointer",
                  fontSize: "13px"
                }}
              >
                <option value="الكل" style={{ backgroundColor: isDark ? "#1e293b" : "#fff" }}>الكل</option>
                {categories.map(cat => (
                  <option key={cat} value={cat} style={{ backgroundColor: isDark ? "#1e293b" : "#fff" }}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{
            backgroundColor: isDark ? "#1e293b" : "#ffffff",
            padding: "25px",
            borderRadius: "20px",
            border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
            boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.04)'
          }}>
            {loading ? (
              <div style={{ textAlign: "center", padding: "40px", color: isDark ? "#94a3b8" : "#64748b", fontSize: "14px" }}>
                جاري جلب بيانات الموظفين والنقاط...
              </div>
            ) : filteredUsers.length > 0 ? (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "right" }}>
                  <thead>
                    <tr style={{
                      color: isDark ? "#cbd5e1" : "#475569",
                      borderBottom: `2px solid ${isDark ? "#334155" : "#e2e8f0"}`,
                      fontSize: "14px"
                    }}>
                      <th style={{ padding: "14px 16px" }}>الترتيب</th>
                      <th style={{ padding: "14px 16px" }}>اسم الموظف</th>
                      <th style={{ padding: "14px 16px" }}>الفرع</th>
                      <th style={{ padding: "14px 16px" }}>الفئة الوظيفية</th>
                      <th style={{ padding: "14px 16px" }}>إجمالي النقاط</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user, index) => (
                      <tr key={user.id} style={{
                        borderBottom: index !== filteredUsers.length - 1 ? `1px solid ${isDark ? "#334155" : "#f1f5f9"}` : 'none',
                        backgroundColor: index === 0 ? (isDark ? "rgba(245, 158, 11, 0.08)" : "#fffbe1") : "transparent"
                      }}>
                        <td style={{ padding: "14px 16px", fontWeight: "bold", color: isDark ? "#f8fafc" : "#0f172a" }}>
                          {index === 0 && <span style={{ marginLeft: "6px" }}>🥇</span>}
                          {index === 1 && <span style={{ marginLeft: "6px" }}>🥈</span>}
                          {index === 2 && <span style={{ marginLeft: "6px" }}>🥉</span>}
                          #{index + 1}
                        </td>
                        <td style={{ padding: "14px 16px", fontWeight: "bold", color: isDark ? "#f8fafc" : "#0f172a" }}>
                          {user.name}
                        </td>
                        <td style={{ padding: "14px 16px", color: isDark ? "#94a3b8" : "#64748b" }}>
                          {user.fled}
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <span style={{
                            backgroundColor: isDark ? "rgba(16, 185, 129, 0.15)" : "#dcfce7",
                            color: isDark ? "#34d399" : "#15803d",
                            padding: "4px 12px",
                            borderRadius: "20px",
                            fontSize: "12px",
                            fontWeight: "600"
                          }}>
                            {user.job}
                          </span>
                        </td>
                        <td style={{ padding: "14px 16px", fontWeight: "bold", color: "#10b981" }}>
                          {user.points} نقطة
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "40px", color: isDark ? "#94a3b8" : "#64748b", fontSize: "14px" }}>
                لا توجد بيانات مسجلة للموظفين.
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
};