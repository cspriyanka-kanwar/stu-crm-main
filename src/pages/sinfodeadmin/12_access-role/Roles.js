import { useState } from 'react';
import SAAdminLayout from "../../../layouts/Sinfodeadmin";

const AccessManagement = () => {
  const [selectedRole, setSelectedRole] = useState('admin');
  const [users, setUsers] = useState([
    { id: 1, name: 'Sarah Johnson', role: 'admin', email: 'sarah.johnson@company.com', branch: 'All Branches', status: 'active', initials: 'SJ' },
    { id: 2, name: 'Michael Chen', role: 'brand-manager', email: 'michael.chen@company.com', branch: 'North Region', status: 'active', initials: 'MC' },
    { id: 3, name: 'Lisa Rodriguez', role: 'branch-manager', email: 'lisa.rodriguez@company.com', branch: 'Downtown Store', status: 'active', initials: 'LR' },
    { id: 4, name: 'David Kim', role: 'branch-manager', email: 'david.kim@company.com', branch: 'Mall Location', status: 'inactive', initials: 'DK' }
  ]);

  const roles = {
    admin: {
      title: 'System Administrator',
      description: 'Complete system access and control',
      icon: '⚡',
      iconClass: 'slds-icon--admin',
      badgeClass: 'slds-badge--brand',
      permissions: [
        { name: 'Full System Access', granted: true },
        { name: 'User Management', granted: true },
        { name: 'All Branch Control', granted: true },
        { name: 'System Configuration', granted: true },
        { name: 'Security Settings', granted: true },
        { name: 'Global Reports & Analytics', granted: true },
        { name: 'Data Export/Import', granted: true },
        { name: 'API Access', granted: true }
      ]
    },
    'brand-manager': {
      title: 'Brand Manager',
      description: 'Regional oversight and brand compliance',
      icon: '🏢',
      iconClass: 'slds-icon--brand',
      badgeClass: 'slds-badge--brand',
      permissions: [
        { name: 'Full System Access', granted: false },
        { name: 'User Management', granted: false },
        { name: 'Limited Branch Control', granted: true },
        { name: 'Regional Oversight', granted: true },
        { name: 'Brand Compliance', granted: true },
        { name: 'Performance Monitoring', granted: true },
        { name: 'Regional Reports', granted: true },
        { name: 'Staff Coordination', granted: true }
      ]
    },
    'branch-manager': {
      title: 'Branch Manager',
      description: 'Single branch operations and management',
      icon: '🏪',
      iconClass: 'slds-icon--branch',
      badgeClass: 'slds-badge--success',
      permissions: [
        { name: 'Full System Access', granted: false },
        { name: 'User Management', granted: false },
        { name: 'Own Branch Only', granted: true },
        { name: 'Staff Management', granted: true },
        { name: 'Daily Operations', granted: true },
        { name: 'Local Inventory', granted: true },
        { name: 'Customer Service', granted: true },
        { name: 'Branch Reports', granted: true }
      ]
    }
  };

  const updateUserRole = (userId, newRole) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, role: newRole } : user
    ));
  };

  const toggleUserStatus = (userId) => {
    setUsers(users.map(user => 
      user.id === userId ? { 
        ...user, 
        status: user.status === 'active' ? 'inactive' : 'active' 
      } : user
    ));
  };

  return (
    <SAAdminLayout>
      <div className="p-6">
        <style jsx>{`
          @import url('https://fonts.googleapis.com/css2?family=Salesforce+Sans:wght@300;400;500;600;700&display=swap');
          
          .slds-container {
            max-width: 1280px;
            margin: 0 auto;
            padding: 1rem;
          }
          
          .slds-page-header {
            background: #ffffff;
            border-radius: 0.25rem;
            box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.1);
            margin-bottom: 1rem;
            padding: 1.5rem;
          }
          
          .slds-page-header__title {
            font-size: 1.75rem;
            font-weight: 700;
            color: #080707;
            margin: 0 0 0.5rem 0;
          }
          
          .slds-page-header__meta {
            color: #706e6b;
            font-size: 0.875rem;
          }
          
          .slds-grid {
            display: flex;
            gap: 1rem;
          }
          
          .slds-col {
            flex: 1;
          }
          
          .slds-col--padded {
            padding: 0 0.5rem;
          }
          
          .slds-card {
            background: #ffffff;
            border: 1px solid #dddbda;
            border-radius: 0.25rem;
            box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.1);
            margin-bottom: 1rem;
          }
          
          .slds-card__header {
            padding: 1rem 1rem 0;
            border-bottom: 1px solid #dddbda;
            margin-bottom: 1rem;
          }
          
          .slds-card__header-title {
            font-size: 1.125rem;
            font-weight: 600;
            color: #080707;
            margin: 0 0 1rem 0;
          }
          
          .slds-card__body {
            padding: 0 1rem 1rem;
          }
          
          .slds-tile {
            border: 1px solid #dddbda;
            border-radius: 0.25rem;
            padding: 1rem;
            margin-bottom: 0.75rem;
            cursor: pointer;
            transition: all 0.15s ease-in-out;
            background: #ffffff;
          }
          
          .slds-tile:hover {
            box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.1);
            border-color: #0176d3;
          }
          
          .slds-tile--selected {
            border-color: #0176d3;
            box-shadow: 0 0 0 1px #0176d3;
            background: #f3f9ff;
          }
          
          .slds-tile__title {
            font-size: 1rem;
            font-weight: 600;
            color: #080707;
            margin: 0 0 0.5rem 0;
            display: flex;
            align-items: center;
          }
          
          .slds-icon {
            width: 1.5rem;
            height: 1.5rem;
            margin-right: 0.5rem;
            border-radius: 0.25rem;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1rem;
          }
          
          .slds-icon--admin {
            background: #8b5cf6;
            color: white;
          }
          
          .slds-icon--brand {
            background: #0176d3;
            color: white;
          }
          
          .slds-icon--branch {
            background: #04844b;
            color: white;
          }
          
          .slds-badge {
            display: inline-block;
            padding: 0.25rem 0.5rem;
            font-size: 0.75rem;
            font-weight: 600;
            border-radius: 0.25rem;
            text-transform: uppercase;
            letter-spacing: 0.0625rem;
          }
          
          .slds-badge--brand {
            background: #0176d3;
            color: white;
          }
          
          .slds-badge--success {
            background: #04844b;
            color: white;
          }
          
          .slds-badge--warning {
            background: #fe9339;
            color: white;
          }
          
          .slds-list {
            list-style: none;
            padding: 0;
            margin: 0;
          }
          
          .slds-list__item {
            padding: 0.5rem 0;
            border-bottom: 1px solid #f3f2f2;
            display: flex;
            align-items: center;
          }
          
          .slds-list__item:last-child {
            border-bottom: none;
          }
          
          .slds-checkbox {
            width: 1rem;
            height: 1rem;
            margin-right: 0.75rem;
            accent-color: #0176d3;
          }
          
          .slds-button {
            padding: 0.5rem 1rem;
            border: 1px solid #dddbda;
            border-radius: 0.25rem;
            background: #ffffff;
            color: #0176d3;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.15s ease-in-out;
            font-size: 0.875rem;
          }
          
          .slds-button:hover {
            background: #f3f2f2;
            border-color: #0176d3;
          }
          
          .slds-button--brand {
            background: #0176d3;
            color: white;
            border-color: #0176d3;
          }
          
          .slds-button--brand:hover {
            background: #014486;
            border-color: #014486;
          }
          
          .slds-button--destructive {
            background: #ba0517;
            color: white;
            border-color: #ba0517;
          }
          
          .slds-button--destructive:hover {
            background: #8e030f;
            border-color: #8e030f;
          }
          
          .slds-form-element {
            margin-bottom: 1rem;
          }
          
          .slds-form-element__label {
            display: block;
            font-size: 0.75rem;
            font-weight: 600;
            color: #3e3e3c;
            margin-bottom: 0.25rem;
            text-transform: uppercase;
            letter-spacing: 0.0625rem;
          }
          
          .slds-select {
            width: 100%;
            padding: 0.5rem 0.75rem;
            border: 1px solid #dddbda;
            border-radius: 0.25rem;
            background: #ffffff;
            font-size: 0.875rem;
          }
          
          .slds-select:focus {
            outline: none;
            border-color: #0176d3;
            box-shadow: 0 0 0 1px #0176d3;
          }
          
          .slds-media {
            display: flex;
            align-items: flex-start;
          }
          
          .slds-media__figure {
            margin-right: 0.75rem;
          }
          
          .slds-media__body {
            flex: 1;
          }
          
          .slds-avatar {
            width: 2.5rem;
            height: 2.5rem;
            border-radius: 50%;
            background: #0176d3;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: 1rem;
          }
          
          .slds-text-heading--small {
            font-size: 0.875rem;
            font-weight: 600;
            color: #080707;
            margin: 0 0 0.25rem 0;
          }
          
          .slds-text-body--small {
            font-size: 0.75rem;
            color: #706e6b;
            margin: 0;
          }
          
          .slds-text-color--success {
            color: #04844b;
          }
          
          .slds-text-color--error {
            color: #ba0517;
          }
          
          .slds-m-top--medium {
            margin-top: 1rem;
          }
          
          .slds-m-bottom--medium {
            margin-bottom: 1rem;
          }
          
          .slds-p-around--medium {
            padding: 1rem;
          }
          
          @media (max-width: 768px) {
            .slds-grid {
              flex-direction: column;
            }
            
            .slds-container {
              padding: 0.5rem;
            }
          }
        `}</style>

        <div className="slds-container">
          {/* Page Header */}
          <div className="slds-page-header">
            <h1 className="slds-page-header__title">Access Management</h1>
            <p className="slds-page-header__meta">
              Manage user roles and permissions • {users.length} total users • {users.filter(u => u.status === 'active').length} active
            </p>
          </div>

          <div className="slds-grid">
            {/* Role Selection */}
            <div className="slds-col" style={{flex: '0 0 300px'}}>
              <div className="slds-card">
                <div className="slds-card__header">
                  <h2 className="slds-card__header-title">Permission Profiles</h2>
                </div>
                <div className="slds-card__body">
                  {Object.entries(roles).map(([roleKey, role]) => (
                    <div 
                      key={roleKey}
                      className={`slds-tile ${selectedRole === roleKey ? 'slds-tile--selected' : ''}`}
                      onClick={() => setSelectedRole(roleKey)}
                    >
                      <h3 className="slds-tile__title">
                        <span className={`slds-icon ${role.iconClass}`}>
                          {role.icon}
                        </span>
                        {role.title}
                      </h3>
                      <p className="slds-text-body--small" style={{margin: '0 0 0.5rem 0', color: '#706e6b'}}>
                        {role.description}
                      </p>
                      <span className={`slds-badge ${role.badgeClass}`}>
                        {users.filter(u => u.role === roleKey).length} Users
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Permission Details */}
            <div className="slds-col">
              <div className="slds-card">
                <div className="slds-card__header">
                  <h2 className="slds-card__header-title">
                    {roles[selectedRole].title} Permissions
                  </h2>
                </div>
                <div className="slds-card__body">
                  <ul className="slds-list">
                    {roles[selectedRole].permissions.map((permission, index) => (
                      <li key={index} className="slds-list__item">
                        <input 
                          type="checkbox" 
                          className="slds-checkbox"
                          checked={permission.granted}
                          readOnly
                        />
                        <span style={{
                          color: permission.granted ? '#04844b' : '#706e6b',
                          textDecoration: permission.granted ? 'none' : 'line-through'
                        }}>
                          {permission.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* User Management */}
              <div className="slds-card slds-m-top--medium">
                <div className="slds-card__header">
                  <h2 className="slds-card__header-title">User Management</h2>
                </div>
                <div className="slds-card__body">
                  {users.map(user => (
                    <div key={user.id} className="slds-media slds-m-bottom--medium" style={{
                      padding: '1rem',
                      border: '1px solid #dddbda',
                      borderRadius: '0.25rem',
                      background: user.status === 'active' ? '#ffffff' : '#f3f2f2'
                    }}>
                      <div className="slds-media__figure">
                        <div className="slds-avatar" style={{
                          background: user.status === 'active' ? '#0176d3' : '#706e6b'
                        }}>
                          {user.initials}
                        </div>
                      </div>
                      <div className="slds-media__body">
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                          <div>
                            <h3 className="slds-text-heading--small">{user.name}</h3>
                            <p className="slds-text-body--small">{user.email}</p>
                            <p className="slds-text-body--small">{user.branch}</p>
                          </div>
                          <span className={`slds-badge ${user.status === 'active' ? 'slds-badge--success' : 'slds-badge--warning'}`}>
                            {user.status}
                          </span>
                        </div>
                        
                        <div style={{display: 'flex', gap: '0.5rem', marginTop: '0.75rem', alignItems: 'center'}}>
                          <div className="slds-form-element" style={{margin: 0, flex: 1}}>
                            <label className="slds-form-element__label">Role</label>
                            <select 
                              className="slds-select"
                              value={user.role}
                              onChange={(e) => updateUserRole(user.id, e.target.value)}
                            >
                              {Object.entries(roles).map(([roleKey, role]) => (
                                <option key={roleKey} value={roleKey}>{role.title}</option>
                              ))}
                            </select>
                          </div>
                          
                          <button 
                            className={`slds-button ${user.status === 'active' ? 'slds-button--destructive' : 'slds-button--brand'}`}
                            onClick={() => toggleUserStatus(user.id)}
                            style={{marginTop: '1.25rem'}}
                          >
                            {user.status === 'active' ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <button className="slds-button slds-button--brand" style={{width: '100%', marginTop: '1rem'}}>
                    + Add New User
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SAAdminLayout>
  );
};

export default AccessManagement;