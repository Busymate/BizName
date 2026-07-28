import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import useDarkMode from '../hooks/useDarkMode';
import SEO from '../components/SEO';
import { APP_NAME, APP_VERSION, BUILD_DATE, RELEASE_NAME } from '../config/version';
import '../styles/BusinessSuite.css';

export default function Settings() {
  const { profile, refreshProfile } = useAuth();
  const { darkMode, toggleDarkMode } = useDarkMode();

  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [savingName, setSavingName] = useState(false);
  const [nameMsg, setNameMsg] = useState('');
  const [nameErr, setNameErr] = useState('');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordErr, setPasswordErr] = useState('');

  if (!profile) return null;

  const handleSaveName = async (e) => {
    e.preventDefault();
    setNameErr('');
    setNameMsg('');
    setSavingName(true);
    try {
      const { error } = await supabase.from('profiles').update({ full_name: fullName }).eq('id', profile.id);
      if (error) throw new Error(error.message);
      await refreshProfile();
      setNameMsg('Saved.');
    } catch (err) {
      setNameErr(err.message);
    } finally {
      setSavingName(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordErr('');
    setPasswordMsg('');
    if (newPassword.length < 8) return setPasswordErr('Password must be at least 8 characters.');
    if (newPassword !== confirmPassword) return setPasswordErr('Passwords do not match.');
    setSavingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw new Error(error.message);
      setPasswordMsg('Password updated.');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordErr(err.message);
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="bn-container" style={{ maxWidth: 720, margin: 0, padding: 0 }}>
      <SEO title="Settings" description="Manage your BizName account settings." path="/settings" />
      <h1 style={{ marginBottom: '0.25rem' }}>Settings</h1>
      <p style={{ color: 'var(--bn-text-secondary)', marginBottom: '1.75rem' }}>Manage your profile, security and preferences.</p>

      <div className="bn-dashboard-card" style={{ marginBottom: '1.5rem' }}>
        <h3><i className="fa-solid fa-id-card" /> Profile</h3>
        <form onSubmit={handleSaveName} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', marginTop: '0.75rem' }}>
          <div className="bn-input-group">
            <label>Full Name</label>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div className="bn-input-group">
            <label>Email</label>
            <input value={profile.email} disabled />
          </div>
          {nameErr && <p className="bn-newsletter-error">{nameErr}</p>}
          {nameMsg && <p style={{ color: 'var(--bn-success)', fontSize: '0.85rem', margin: 0 }}>{nameMsg}</p>}
          <button type="submit" className="bn-auth-submit" style={{ width: 'fit-content' }} disabled={savingName}>
            {savingName ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      </div>

      <div className="bn-dashboard-card" style={{ marginBottom: '1.5rem' }}>
        <h3><i className="fa-solid fa-lock" /> Change Password</h3>
        <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', marginTop: '0.75rem' }}>
          <div className="bn-input-group">
            <label>New Password</label>
            <input type="password" minLength={8} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          </div>
          <div className="bn-input-group">
            <label>Confirm New Password</label>
            <input type="password" minLength={8} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          </div>
          {passwordErr && <p className="bn-newsletter-error">{passwordErr}</p>}
          {passwordMsg && <p style={{ color: 'var(--bn-success)', fontSize: '0.85rem', margin: 0 }}>{passwordMsg}</p>}
          <button type="submit" className="bn-auth-submit" style={{ width: 'fit-content' }} disabled={savingPassword}>
            {savingPassword ? 'Updating…' : 'Update password'}
          </button>
        </form>
      </div>

      <div className="bn-dashboard-card">
        <h3><i className="fa-solid fa-palette" /> Appearance</h3>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.75rem' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--bn-text-secondary)' }}>Dark mode</span>
          <button className="bn-icon-btn" onClick={toggleDarkMode} type="button" aria-label="Toggle dark mode">
            <i className={`fa-solid ${darkMode ? 'fa-toggle-on' : 'fa-toggle-off'}`} style={{ fontSize: '1.4rem', color: darkMode ? 'var(--bn-primary)' : 'var(--bn-text-secondary)' }} />
          </button>
        </div>
      </div>

      <div className="bn-dashboard-card" style={{ marginTop: '1.5rem' }}>
        <h3><i className="fa-solid fa-circle-info" /> About</h3>
        <p style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--bn-text)', margin: '0.75rem 0 0.15rem' }}>{APP_NAME}</p>
        <p className="bn-muted-text">Version {APP_VERSION}</p>
        <p className="bn-muted-text">Release: {RELEASE_NAME}</p>
        <p className="bn-muted-text">Build date: {new Date(BUILD_DATE).toLocaleDateString()}</p>
        <Link to="/whats-new" className="bn-view-all-link" style={{ display: 'inline-block', marginTop: '0.75rem' }}>
          See what's new <i className="fa-solid fa-arrow-right" />
        </Link>
      </div>
    </div>
  );
}
