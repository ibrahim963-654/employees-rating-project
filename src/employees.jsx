import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FaSun, FaMoon, FaSignOutAlt, FaPlus, FaSearch, FaArrowRight, 
  FaTrash, FaUsers, FaBuilding, FaUserCheck, FaUser, FaEdit, FaStore 
} from 'react-icons/fa';

const ROLE_DISPLAY_MAP = {
  'ACCOUNTANT': 'محاسب',
  'CASHIER': 'كاشير',
  'REGIONAL': 'إقليمي',
  'BRANCH_MANAGER': 'مدير',
  'MANAGER': 'مدير',
  'SALES': 'مبيعات',
  'ADMIN': 'مدير النظام',
};

export const Employees = () => {
  const navigate = useNavigate();

  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const API_URL = `${import.meta.env.VITE_API_URL}/users/`;

  const getToken = () => {
    return localStorage.getItem('access_token') || localStorage.getItem('token') || localStorage.getItem('access');
  };

  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate('/');
      return;
    }

    fetchEmployees();

    const themeName = isDark ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', themeName);
    localStorage.setItem('theme', themeName);
  }, [isDark, navigate]);

  const fetchEmployees = async () => {
    setLoading(true);
    const token = getToken();

    try {
      const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const list = Array.isArray(data) ? data : (data.results || []);
        setEmployees(list);
        localStorage.setItem('local_employees', JSON.stringify(list));
      } else {
        const localData = JSON.parse(localStorage.getItem('local_employees') || '[]');
        setEmployees(localData);
      }
    } catch (error) {
      const localData = JSON.parse(localStorage.getItem('local_employees') || '[]');
      setEmployees(localData);
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

  const handleEdit = (employeeId) => {
    if (!employeeId) return;
    navigate(`/edit-employee/${employeeId}`);
  };

  const handleDelete = async (employeeId) => {
    if (!employeeId) return;
    if (!window.confirm("هل أنت متأكد من حذف هذا الموظف؟")) return;

    const token = getToken();

    const updateLocalAndState = () => {
      setEmployees((prev) => prev.filter((emp) => (emp.id || emp._id) !== employeeId));
      const localEmps = JSON.parse(localStorage.getItem('local_employees') || '[]');
      const updatedLocal = localEmps.filter((emp) => (emp.id || emp._id) !== employeeId);
      localStorage.setItem('local_employees', JSON.stringify(updatedLocal));
    };

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/users/${employeeId}/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok || res.status === 200 || res.status === 204) {
        updateLocalAndState();
      } else {
        updateLocalAndState();
      }
    } catch (err) {
      updateLocalAndState();
    }
  };

  const filteredEmployees = employees.filter(emp => {
    const fullName = (emp.first_name || emp.username || '').toLowerCase();
    const companyName = (typeof emp.company === 'object' ? emp.company?.name : emp.company_name || '').toLowerCase();
    const branchName = (emp.branch_name_display || emp.branch_name || '').toLowerCase();
    const search = searchTerm.toLowerCase().trim();

    return fullName.includes(search) || companyName.includes(search) || branchName.includes(search) || search === '';
  });

  return (
    <div className="main" style={{ 
      backgroundColor: isDark ? "#0b0f19" : "#f1f5f9", 
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
          .content {
            padding: 20px 12px 40px 12px !important;
          }
          .banner-card {
            padding: 20px !important;
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 16px !important;
          }
          .banner-card a {
            width: 100% !important;
            justify-content: center !important;
            box-sizing: border-box !important;
          }
        }
      `}</style>

      <header className="header-container" style={{ 
        display: 'flex',
        flexDirection: "row-reverse",
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '16px 40px', 
        width: '100%',
        boxSizing: 'border-box',
        backgroundColor: isDark ? "#111827" : "#ffffff", 
        borderBottom: `1px solid ${isDark ? "#1f2937" : "#e2e8f0"}`,
        boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.4)' : '0 2px 10px rgba(0,0,0,0.03)',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <img src="/logo.png" alt="logo" style={{ width: '42px', height: '42px', objectFit: 'contain' }} />
          <h3 style={{ margin: 0, color: isDark ? "#f9fafb" : "#0f172a", fontSize: '19px', fontWeight: 'bold' }}>
            لوحة الإدارة
          </h3>
        </div>

        <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={toggleTheme} style={{ 
            color: isDark ? "#f8fafc" : "#1e293b", 
            backgroundColor: isDark ? "#1f2937" : "#e2e8f0", 
            border: `1px solid ${isDark ? "#374151" : "#cbd5e1"}`, 
            padding: '8px 16px', 
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
            backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#fee2e2', 
            color: '#ef4444', 
            border: `1px solid ${isDark ? 'rgba(239, 68, 68, 0.3)' : '#fca5a5'}`, 
            padding: '8px 16px', 
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
            padding: '8px 16px', 
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

      <div className="content" style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '36px 20px 60px 20px', flex: 1, boxSizing: 'border-box' }}>
        <div className="banner-card" style={{ 
          backgroundColor: isDark ? "#111827" : "#ffffff", 
          borderRadius: '20px', 
          padding: '24px 32px', 
          marginBottom: '28px',
          border: `1px solid ${isDark ? "#1f2937" : "#e2e8f0"}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '20px',
          boxShadow: isDark ? '0 10px 25px rgba(0,0,0,0.3)' : '0 4px 15px rgba(0,0,0,0.04)',
          boxSizing: 'border-box',
          width: '100%'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            <div style={{ 
              backgroundColor: isDark ? 'rgba(16, 185, 129, 0.2)' : '#dcfce7', 
              padding: '16px', 
              borderRadius: '16px', 
              color: '#10b981' 
            }}>
              <FaUsers size={28} />
            </div>
            <div>
              <h1 style={{ margin: '0 0 6px 0', color: isDark ? "#f9fafb" : "#0f172a", fontSize: '22px', fontWeight: 'bold' }}>
                قائمة الموظفين
              </h1>
              <div style={{ color: isDark ? "#9ca3af" : "#64748b", fontSize: '14px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FaUserCheck color="#10b981" /> إجمالي الموظفين: <span style={{ fontSize: '16px', fontWeight: 'bold', color: isDark ? "#10b981" : "#16a34a" }}>{filteredEmployees.length}</span>
              </div>
            </div>
          </div>

          <Link to="/add-employee" style={{ 
            backgroundColor: "#10b981", 
            color: '#ffffff', 
            padding: '11px 22px', 
            borderRadius: '12px', 
            textDecoration: 'none', 
            fontWeight: 'bold', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            fontSize: '14px',
            boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)'
          }}>
            <FaPlus /> 
            <span>إضافة موظف جديد</span>
          </Link>
        </div>

        <div style={{ marginBottom: '28px' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            backgroundColor: isDark ? "#111827" : "#ffffff", 
            border: `1px solid ${isDark ? "#1f2937" : "#cbd5e1"}`, 
            borderRadius: '14px',
            overflow: 'hidden',  
            width: '100%',
            boxSizing: 'border-box',
            boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.15)' : '0 2px 8px rgba(0,0,0,0.03)'
          }}>
            <div style={{ padding: '0 18px', color: '#9ca3af', display: 'flex', alignItems: 'center' }}>
              <FaSearch size={16} />
            </div>
            <input 
              type="search" 
              placeholder='ابحث باسم الموظف أو الشركة أو الفرع...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ 
                flex: 1,
                backgroundColor: 'transparent', 
                color: isDark ? "#f9fafb" : "#0f172a", 
                border: 'none', 
                padding: '14px 0', 
                outline: 'none',
                fontSize: '15px'
              }} 
            />
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: isDark ? "#9ca3af" : "#64748b", fontSize: '15px' }}>
            جاري جلب قائمة الموظفين...
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px 20px', 
            backgroundColor: isDark ? "#111827" : "#ffffff", 
            borderRadius: '16px', 
            border: `1px solid ${isDark ? "#1f2937" : "#e2e8f0"}`,
            color: isDark ? "#9ca3af" : "#64748b",
            fontSize: '15px'
          }}>
            {searchTerm.trim() !== '' ? `لا يوجد نتائج مطابقة للبحث "${searchTerm}".` : "لا يوجد موظفين حالياً."}
          </div>
        ) : (
          <div style={{ 
            backgroundColor: isDark ? "#111827" : "#ffffff", 
            borderRadius: '20px', 
            border: `1px solid ${isDark ? "#1f2937" : "#e2e8f0"}`,
            overflowX: 'auto',
            boxShadow: isDark ? '0 10px 20px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.04)'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
              <thead>
                <tr style={{ 
                  borderBottom: `2px solid ${isDark ? "#1f2937" : "#e2e8f0"}`,
                  backgroundColor: isDark ? "#161e2e" : "#f8fafc"
                }}>
                  <th style={{ padding: '16px 20px', color: isDark ? "#f9fafb" : "#0f172a", fontSize: '14px', fontWeight: 'bold' }}>الصورة</th>
                  <th style={{ padding: '16px 20px', color: isDark ? "#f9fafb" : "#0f172a", fontSize: '14px', fontWeight: 'bold' }}>اسم الموظف</th>
                  <th style={{ padding: '16px 20px', color: isDark ? "#f9fafb" : "#0f172a", fontSize: '14px', fontWeight: 'bold' }}>الوظيفة</th>
                  <th style={{ padding: '16px 20px', color: isDark ? "#f9fafb" : "#0f172a", fontSize: '14px', fontWeight: 'bold' }}>الفرع</th>
                  <th style={{ padding: '16px 20px', color: isDark ? "#f9fafb" : "#0f172a", fontSize: '14px', fontWeight: 'bold', textAlign: 'center'}}>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((emp) => {
                  const displayName = emp.first_name || emp.username || '';
                  const displayRole = ROLE_DISPLAY_MAP[emp.role] || emp.role || 'غير محدد';
                  
                  
                  const displayBranch = emp.branch_name_display || emp.branch_name || 'غير محدد';

                  return (
                    <tr 
                      key={emp.id || emp._id} 
                      style={{ 
                        borderBottom: `1px solid ${isDark ? "#1f2937" : "#f1f5f9"}`,
                        transition: 'background-color 0.2s ease'
                      }}
                    >
                      <td style={{ padding: '14px 20px' }}>
                        {emp.profile_pic ? (
                          <img 
                            src={emp.profile_pic} 
                            alt={displayName} 
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
                              {displayName ? displayName.charAt(0).toUpperCase() : <FaUser size={16} />}
                            </span>
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '14px 20px', color: isDark ? "#f9fafb" : "#0f172a", fontSize: '14px', fontWeight: '600' }}>
                        {displayName}
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
                          {displayRole}
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
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          <FaBuilding size={12} />
                          {displayBranch}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                          <button 
                            onClick={() => handleEdit(emp.id || emp._id)} 
                            title="تعديل الموظف"
                            style={{ 
                              backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : '#eff6ff', 
                              color: '#3b82f6', 
                              border: 'none', 
                              width: '36px',
                              height: '36px',
                              borderRadius: '10px', 
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <FaEdit size={14} />
                          </button>

                          <button 
                            onClick={() => handleDelete(emp.id || emp._id)} 
                            title="حذف الموظف"
                            style={{ 
                              backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#fee2e2', 
                              color: '#ef4444', 
                              border: 'none', 
                              width: '36px',
                              height: '36px',
                              borderRadius: '10px', 
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <FaTrash size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};