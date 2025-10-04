import { useState } from 'react';
import styles from './Settings.module.css';
import SAAdminLayout from "../../../layouts/Sinfodeadmin";

export default function Settings() {
  const [activeTab, setActiveTab] = useState('branding');
  const [settings, setSettings] = useState({
    branding: {
      logo: null,
      primaryColor: '#0176d3',
      secondaryColor: '#04844b',
      accentColor: '#fe9339',
      companyName: 'Sinfode Academy',
      tagline: 'Excellence in Education'
    },
    userRoles: [
      { id: 1, name: 'Super Admin', permissions: ['all'], users: 2, status: 'active' },
      { id: 2, name: 'Academic Director', permissions: ['courses', 'students', 'reports'], users: 5, status: 'active' },
      { id: 3, name: 'Instructor', permissions: ['courses', 'students'], users: 25, status: 'active' },
      { id: 4, name: 'Student Advisor', permissions: ['students', 'communications'], users: 8, status: 'active' }
    ],
    approvals: {
      discountThresholds: [
        { range: '0% - 10%', approver: 'Instructor', amount: '$0 - $500' },
        { range: '11% - 25%', approver: 'Academic Director', amount: '$501 - $2,000' },
        { range: '26% - 50%', approver: 'Super Admin', amount: '$2,001+' }
      ],
      expenseThresholds: [
        { range: '$0 - $100', approver: 'Auto-approved', status: 'success' },
        { range: '$101 - $500', approver: 'Department Head', status: 'warning' },
        { range: '$501+', approver: 'Finance Director', status: 'info' }
      ]
    },
    reminders: {
      paymentReminders: 'weekly',
      courseReminders: 'daily',
      assignmentReminders: 'daily',
      eventReminders: 'weekly'
    }
  });

  const updateSetting = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        updateSetting('branding', 'logo', e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const tabs = [
    { id: 'branding', label: 'Institute Branding', icon: '🎨' },
    { id: 'roles', label: 'User Roles', icon: '👥' },
    { id: 'approvals', label: 'Approval Settings', icon: '✅' },
    { id: 'reminders', label: 'Reminder Settings', icon: '🔔' }
  ];

  return (
    <SAAdminLayout>
      <div className="slds-container">
        {/* Page Header */}
        <div className="slds-page-header">
          <h1 className="slds-page-header__title">Settings</h1>
          <p className="slds-page-header__meta">
            Configure your Sinfode Academy CRM system settings and preferences
          </p>
        </div>

        {/* Tabs */}
        <div className="slds-tabs">
          <div className="slds-tabs__nav">
            {tabs.map(tab => (
              <div key={tab.id} className="slds-tabs__item">
                <a 
                  className={`slds-tabs__link ${activeTab === tab.id ? 'slds-tabs__link--active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span style={{marginRight: '0.5rem'}}>{tab.icon}</span>
                  {tab.label}
                </a>
              </div>
            ))}
          </div>

          <div className="slds-tabs__content">
            {/* Branding Tab */}
            {activeTab === 'branding' && (
              <div className="slds-grid slds-grid--2-col">
                <div className="slds-card">
                  <div className="slds-card__header">
                    <h2 className="slds-card__header-title">
                      🎨 Logo & Visual Identity
                    </h2>
                  </div>
                  <div className="slds-card__body">
                    <div className="slds-form-element">
                      <label className="slds-form-element__label">Company Logo</label>
                      <div className="slds-file-upload" onClick={() => document.getElementById('logo-upload').click()}>
                        <div className="slds-file-upload__icon">📁</div>
                        <p>Click to upload logo</p>
                        <p style={{fontSize: '0.75rem', color: '#706e6b'}}>PNG, JPG up to 2MB</p>
                      </div>
                      <input 
                        id="logo-upload" 
                        type="file" 
                        accept="image/*" 
                        style={{display: 'none'}}
                        onChange={handleFileUpload}
                      />
                      {settings.branding.logo && (
                        <div style={{marginTop: '1rem'}}>
                          <img 
                            src={settings.branding.logo} 
                            alt="Logo Preview" 
                            className="slds-logo-preview"
                          />
                        </div>
                      )}
                    </div>

                    <div className="slds-form-element">
                      <label className="slds-form-element__label">Company Name</label>
                      <input 
                        type="text" 
                        className="slds-input"
                        value={settings.branding.companyName}
                        onChange={(e) => updateSetting('branding', 'companyName', e.target.value)}
                      />
                    </div>

                    <div className="slds-form-element">
                      <label className="slds-form-element__label">Tagline</label>
                      <input 
                        type="text" 
                        className="slds-input"
                        value={settings.branding.tagline}
                        onChange={(e) => updateSetting('branding', 'tagline', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="slds-card">
                  <div className="slds-card__header">
                    <h2 className="slds-card__header-title">
                      🎨 Color Scheme
                    </h2>
                  </div>
                  <div className="slds-card__body">
                    <div className="slds-form-element">
                      <label className="slds-form-element__label">Primary Color</label>
                      <div className="slds-color-picker">
                        <div 
                          className="slds-color-preview"
                          style={{backgroundColor: settings.branding.primaryColor}}
                          onClick={() => document.getElementById('primary-color').click()}
                        ></div>
                        <input 
                          id="primary-color"
                          type="color" 
                          value={settings.branding.primaryColor}
                          onChange={(e) => updateSetting('branding', 'primaryColor', e.target.value)}
                          style={{opacity: 0, width: 0}}
                        />
                        <input 
                          type="text" 
                          className="slds-input"
                          value={settings.branding.primaryColor}
                          onChange={(e) => updateSetting('branding', 'primaryColor', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="slds-form-element">
                      <label className="slds-form-element__label">Secondary Color</label>
                      <div className="slds-color-picker">
                        <div 
                          className="slds-color-preview"
                          style={{backgroundColor: settings.branding.secondaryColor}}
                          onClick={() => document.getElementById('secondary-color').click()}
                        ></div>
                        <input 
                          id="secondary-color"
                          type="color" 
                          value={settings.branding.secondaryColor}
                          onChange={(e) => updateSetting('branding', 'secondaryColor', e.target.value)}
                          style={{opacity: 0, width: 0}}
                        />
                        <input 
                          type="text" 
                          className="slds-input"
                          value={settings.branding.secondaryColor}
                          onChange={(e) => updateSetting('branding', 'secondaryColor', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="slds-form-element">
                      <label className="slds-form-element__label">Accent Color</label>
                      <div className="slds-color-picker">
                        <div 
                          className="slds-color-preview"
                          style={{backgroundColor: settings.branding.accentColor}}
                          onClick={() => document.getElementById('accent-color').click()}
                        ></div>
                        <input 
                          id="accent-color"
                          type="color" 
                          value={settings.branding.accentColor}
                          onChange={(e) => updateSetting('branding', 'accentColor', e.target.value)}
                          style={{opacity: 0, width: 0}}
                        />
                        <input 
                          type="text" 
                          className="slds-input"
                          value={settings.branding.accentColor}
                          onChange={(e) => updateSetting('branding', 'accentColor', e.target.value)}
                        />
                      </div>
                    </div>

                    <button className="slds-button slds-button--brand" style={{width: '100%', marginTop: '1rem'}}>
                      💾 Save Branding Settings
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* User Roles Tab */}
            {activeTab === 'roles' && (
              <div className="slds-card">
                <div className="slds-card__header">
                  <h2 className="slds-card__header-title">
                    👥 User Role Configuration
                  </h2>
                </div>
                <div className="slds-card__body">
                  <div className="slds-approval-matrix">
                    <table className="slds-table">
                      <thead>
                        <tr>
                          <th>Role Name</th>
                          <th>Permissions</th>
                          <th>Active Users</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {settings.userRoles.map(role => (
                          <tr key={role.id}>
                            <td>
                              <strong>{role.name}</strong>
                            </td>
                            <td>
                              {role.permissions.join(', ')}
                            </td>
                            <td>
                              <span className="slds-badge slds-badge--info">
                                {role.users} users
                              </span>
                            </td>
                            <td>
                              <span className={`slds-badge ${role.status === 'active' ? 'slds-badge--success' : 'slds-badge--warning'}`}>
                                {role.status}
                              </span>
                            </td>
                            <td>
                              <button className="slds-button" style={{marginRight: '0.5rem'}}>
                                ✏️ Edit
                              </button>
                              <button className="slds-button">
                                👥 Manage Users
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <button className="slds-button slds-button--brand" style={{marginTop: '1.5rem'}}>
                    ➕ Add New Role
                  </button>
                </div>
              </div>
            )}

            {/* Approval Settings Tab */}
            {activeTab === 'approvals' && (
              <div className="slds-grid slds-grid--2-col">
                <div className="slds-card">
                  <div className="slds-card__header">
                    <h2 className="slds-card__header-title">
                      💰 Discount Approval Matrix
                    </h2>
                  </div>
                  <div className="slds-card__body">
                    <div className="slds-approval-matrix">
                      <table className="slds-table">
                        <thead>
                          <tr>
                            <th>Discount Range</th>
                            <th>Amount Range</th>
                            <th>Required Approver</th>
                          </tr>
                        </thead>
                        <tbody>
                          {settings.approvals.discountThresholds.map((threshold, index) => (
                            <tr key={index}>
                              <td><strong>{threshold.range}</strong></td>
                              <td>{threshold.amount}</td>
                              <td>
                                <span className="slds-badge slds-badge--info">
                                  {threshold.approver}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div className="slds-card">
                  <div className="slds-card__header">
                    <h2 className="slds-card__header-title">
                      💳 Expense Approval Matrix
                    </h2>
                  </div>
                  <div className="slds-card__body">
                    <div className="slds-approval-matrix">
                      <table className="slds-table">
                        <thead>
                          <tr>
                            <th>Amount Range</th>
                            <th>Required Approver</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {settings.approvals.expenseThresholds.map((threshold, index) => (
                            <tr key={index}>
                              <td><strong>{threshold.range}</strong></td>
                              <td>{threshold.approver}</td>
                              <td>
                                <span className={`slds-badge slds-badge--${threshold.status}`}>
                                  {threshold.status === 'success' ? 'Automatic' : 
                                    threshold.status === 'warning' ? 'Manual' : 'Executive'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    <div style={{marginTop: '1.5rem', padding: '1rem', background: '#f8f9fa', borderRadius: '0.375rem'}}>
                      <h4 style={{margin: '0 0 1rem 0', color: '#3e3e3c'}}>Approval Workflow Settings</h4>
                      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem'}}>
                        <span>Auto-approve recurring expenses</span>
                        <label className="slds-toggle">
                          <input type="checkbox" defaultChecked />
                          <span className="slds-toggle__slider"></span>
                        </label>
                      </div>
                      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                        <span>Email notifications for approvals</span>
                        <label className="slds-toggle">
                          <input type="checkbox" defaultChecked />
                          <span className="slds-toggle__slider"></span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Reminder Settings Tab */}
            {activeTab === 'reminders' && (
              <div className="slds-grid slds-grid--2-col">
                <div className="slds-card">
                  <div className="slds-card__header">
                    <h2 className="slds-card__header-title">
                      🔔 Reminder Frequency Settings
                    </h2>
                  </div>
                  <div className="slds-card__body">
                    <div className="slds-form-element">
                      <label className="slds-form-element__label">Payment Reminders</label>
                      <select 
                        className="slds-select"
                        value={settings.reminders.paymentReminders}
                        onChange={(e) => updateSetting('reminders', 'paymentReminders', e.target.value)}
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="disabled">Disabled</option>
                      </select>
                    </div>

                    <div className="slds-form-element">
                      <label className="slds-form-element__label">Course Reminders</label>
                      <select 
                        className="slds-select"
                        value={settings.reminders.courseReminders}
                        onChange={(e) => updateSetting('reminders', 'courseReminders', e.target.value)}
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="disabled">Disabled</option>
                      </select>
                    </div>

                    <div className="slds-form-element">
                      <label className="slds-form-element__label">Assignment Reminders</label>
                      <select 
                        className="slds-select"
                        value={settings.reminders.assignmentReminders}
                        onChange={(e) => updateSetting('reminders', 'assignmentReminders', e.target.value)}
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="disabled">Disabled</option>
                      </select>
                    </div>

                    <div className="slds-form-element">
                      <label className="slds-form-element__label">Event Reminders</label>
                      <select 
                        className="slds-select"
                        value={settings.reminders.eventReminders}
                        onChange={(e) => updateSetting('reminders', 'eventReminders', e.target.value)}
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="disabled">Disabled</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="slds-card">
                  <div className="slds-card__header">
                    <h2 className="slds-card__header-title">
                      ⚙️ Advanced Reminder Settings
                    </h2>
                  </div>
                  <div className="slds-card__body">
                    <div style={{padding: '1rem', background: '#f8f9fa', borderRadius: '0.375rem', marginBottom: '1.5rem'}}>
                      <h4 style={{margin: '0 0 1rem 0', color: '#3e3e3c'}}>Notification Preferences</h4>
                      
                      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem'}}>
                        <span>Email Notifications</span>
                        <label className="slds-toggle">
                          <input type="checkbox" defaultChecked />
                          <span className="slds-toggle__slider"></span>
                        </label>
                      </div>
                      
                      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem'}}>
                        <span>SMS Notifications</span>
                        <label className="slds-toggle">
                          <input type="checkbox" />
                          <span className="slds-toggle__slider"></span>
                        </label>
                      </div>
                      
                      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                        <span>Push Notifications</span>
                        <label className="slds-toggle">
                          <input type="checkbox" defaultChecked />
                          <span className="slds-toggle__slider"></span>
                        </label>
                      </div>
                    </div>

                    <div className="slds-form-element">
                      <label className="slds-form-element__label">Reminder Time</label>
                      <select className="slds-select">
                        <option value="09:00">9:00 AM</option>
                        <option value="12:00">12:00 PM</option>
                        <option value="15:00">3:00 PM</option>
                        <option value="18:00">6:00 PM</option>
                      </select>
                    </div>

                    <div className="slds-form-element">
                      <label className="slds-form-element__label">Time Zone</label>
                      <select className="slds-select">
                        <option value="UTC">UTC</option>
                        <option value="EST">Eastern Time</option>
                        <option value="PST">Pacific Time</option>
                        <option value="CST">Central Time</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Save All Button */}
        <div style={{textAlign: 'center', marginTop: '2rem'}}>
          <button className="slds-button slds-button--success" style={{padding: '1rem 2rem', fontSize: '1rem'}}>
            💾 Save All Settings
          </button>
        </div>
      </div>
    </SAAdminLayout>
  );
}