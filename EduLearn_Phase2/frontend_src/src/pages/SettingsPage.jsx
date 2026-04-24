// src/pages/SettingsPage.jsx
import { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Lock, Shield, Bell, Globe, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { usersApi } from '../hooks/useApi';

const passwordSchema = Yup.object({
  current: Yup.string().required('Current password is required'),
  newPass: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'Must contain at least one uppercase letter')
    .matches(/[0-9]/, 'Must contain at least one number')
    .required('New password is required'),
  confirm: Yup.string()
    .oneOf([Yup.ref('newPass')], 'Passwords do not match')
    .required('Please confirm your new password'),
});

// ── Account Tab ───────────────────────────────────────────────────────────────
function AccountTab({ user, updateUser }) {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew,     setShowNew]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [regionSaved, setRegionSaved] = useState(false);
  const [regionError, setRegionError] = useState('');

  const prefs = user?.preferences || {};
  const [language,   setLanguage]   = useState(prefs.language   || 'en');
  const [timezone,   setTimezone]   = useState(prefs.timezone   || 'Africa/Cairo');
  const [dateFormat, setDateFormat] = useState(prefs.dateFormat || 'DD/MM/YYYY');

  const saveRegion = async () => {
    setRegionError('');
    try {
      const updated = await usersApi.updatePreferences({ language, timezone, dateFormat });
      updateUser({ preferences: { ...prefs, ...updated } });
      setRegionSaved(true);
      setTimeout(() => setRegionSaved(false), 3000);
    } catch (err) {
      setRegionError(err.message);
    }
  };

  const formik = useFormik({
    initialValues: { current: '', newPass: '', confirm: '' },
    validationSchema: passwordSchema,
    onSubmit: async (values, helpers) => {
      try {
        await usersApi.changePassword({ currentPassword: values.current, newPassword: values.newPass });
        helpers.resetForm();
        helpers.setStatus('saved');
        setTimeout(() => helpers.setStatus(null), 3000);
      } catch (err) {
        helpers.setStatus('error:' + err.message);
      }
    },
  });

  const errCls = (name) => formik.touched[name] && formik.errors[name] ? 'border-red-500' : '';

  const sessions = [
    { device: 'Chrome on Windows', location: 'Cairo, EG', time: 'Active now', current: true },
    { device: 'Safari on iPhone',  location: 'Cairo, EG', time: '2 hours ago', current: false },
  ];

  const selectCls = "w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm";

  return (
    <div className="space-y-6">
      {/* Language & Region */}
      <Card className="bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <Globe className="w-5 h-5" /> Language & Region
          </CardTitle>
          <CardDescription className="text-gray-500 dark:text-gray-400">Set your preferred language, timezone, and date format.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold tracking-widest uppercase text-gray-700 dark:text-gray-300">Language</Label>
              <select value={language} onChange={e => setLanguage(e.target.value)} className={selectCls}>
                <option value="en">English</option>
                <option value="ar">Arabic</option>
                <option value="fr">French</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold tracking-widest uppercase text-gray-700 dark:text-gray-300">Date Format</Label>
              <select value={dateFormat} onChange={e => setDateFormat(e.target.value)} className={selectCls}>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-semibold tracking-widest uppercase text-gray-700 dark:text-gray-300">Timezone</Label>
            <select value={timezone} onChange={e => setTimezone(e.target.value)} className={selectCls}>
              <option value="Africa/Cairo">Cairo (UTC+2)</option>
              <option value="Europe/London">London (UTC+0)</option>
              <option value="America/New_York">New York (UTC-5)</option>
              <option value="Asia/Tokyo">Tokyo (UTC+9)</option>
            </select>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={saveRegion}>Save Region Settings</Button>
          {regionSaved && <p className="text-green-600 dark:text-green-400 text-sm font-medium">✓ Region settings saved!</p>}
          {regionError && <p className="text-red-500 text-sm">{regionError}</p>}
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card className="bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <Lock className="w-5 h-5" /> Change Password
          </CardTitle>
          <CardDescription className="text-gray-500 dark:text-gray-400">Min 8 characters, one uppercase letter, one number.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={formik.handleSubmit} noValidate className="space-y-4">
            {[
              { name: 'current', label: 'Current Password', show: showCurrent, toggle: () => setShowCurrent(p => !p) },
              { name: 'newPass', label: 'New Password',     show: showNew,     toggle: () => setShowNew(p => !p)     },
              { name: 'confirm', label: 'Confirm Password', show: showConfirm,  toggle: () => setShowConfirm(p => !p)  },
            ].map(({ name, label, show, toggle }) => (
              <div key={name} className="space-y-1">
                <Label htmlFor={name} className="text-gray-700 dark:text-gray-300">{label}</Label>
                <div className="relative">
                  <Input id={name} name={name} type={show ? 'text' : 'password'}
                    value={formik.values[name]} onChange={formik.handleChange} onBlur={formik.handleBlur}
                    className={`pr-10 dark:bg-gray-900 dark:border-gray-700 dark:text-white ${errCls(name)}`} />
                  <button type="button" onClick={toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {formik.touched[name] && formik.errors[name] && (
                  <p className="text-red-500 text-xs">{formik.errors[name]}</p>
                )}
              </div>
            ))}
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={formik.isSubmitting}>
              {formik.isSubmitting ? 'Updating...' : 'Update Password'}
            </Button>
            {formik.status === 'saved' && <p className="text-green-600 dark:text-green-400 text-sm text-center font-medium">✓ Password updated successfully!</p>}
            {formik.status?.startsWith('error:') && <p className="text-red-500 text-sm text-center">{formik.status.replace('error:', '')}</p>}
          </form>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card className="bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">Active Sessions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {sessions.map((s, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-900 dark:text-white text-sm">{s.device}</p>
                  {s.current && <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs">Current</Badge>}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{s.location} · {s.time}</p>
              </div>
              {!s.current && (
                <Button variant="outline" size="sm" className="text-red-500 border-red-200 hover:bg-red-50">Revoke</Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// ── Notifications Tab ─────────────────────────────────────────────────────────
function NotificationsTab({ user, updateUser }) {
  const prefs = user?.preferences || {};
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [settings, setSettings] = useState({
    examReminders:     prefs.examReminders     ?? true,
    gradeUpdates:      prefs.gradeUpdates      ?? true,
    courseAnnounce:    prefs.courseAnnounce    ?? true,
    systemUpdates:     prefs.systemUpdates     ?? false,
    emailDigest:       prefs.emailDigest       ?? true,
    pushNotifications: prefs.pushNotifications ?? false,
  });

  const toggle = (key) => setSettings(prev => ({ ...prev, [key]: !prev[key] }));

  const save = async () => {
    setError('');
    try {
      const updated = await usersApi.updatePreferences(settings);
      updateUser({ preferences: { ...prefs, ...updated } });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const items = [
    { key: 'examReminders',     label: 'Exam Reminders',       desc: 'Get notified before upcoming exams.' },
    { key: 'gradeUpdates',      label: 'Grade Updates',        desc: 'Receive alerts when grades are posted.' },
    { key: 'courseAnnounce',    label: 'Course Announcements', desc: 'Stay informed about course changes.' },
    { key: 'systemUpdates',     label: 'System Updates',       desc: 'Platform maintenance and feature news.' },
    { key: 'emailDigest',       label: 'Weekly Email Digest',  desc: 'A summary of your weekly activity.' },
    { key: 'pushNotifications', label: 'Push Notifications',   desc: 'Browser push notifications.' },
  ];

  return (
    <Card className="bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white"><Bell className="w-5 h-5" /> Notification Preferences</CardTitle>
        <CardDescription className="text-gray-500 dark:text-gray-400">Choose what you want to be notified about.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map(({ key, label, desc }) => (
          <div key={key} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">{label}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{desc}</p>
            </div>
            <Switch checked={settings[key]} onCheckedChange={() => toggle(key)}
              className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-300" />
          </div>
        ))}
        <Button className="w-full bg-blue-600 hover:bg-blue-700 mt-2" onClick={save}>Save Preferences</Button>
        {saved  && <p className="text-green-600 dark:text-green-400 text-sm text-center font-medium">✓ Saved successfully!</p>}
        {error  && <p className="text-red-500 text-sm text-center">{error}</p>}
      </CardContent>
    </Card>
  );
}

// ── Privacy Tab ───────────────────────────────────────────────────────────────
function PrivacyTab() {
  const sections = [
    { title: '1. Data Collection',                body: 'The E-Learning platform collects only the information necessary to provide educational services.' },
    { title: '2. How Your Data Is Used',          body: 'Your data is used solely to deliver and improve your learning experience.' },
    { title: '3. Data Privacy & Confidentiality', body: 'Your academic records and personal information are strictly confidential.' },
    { title: '4. Platform Access & Security',     body: 'Account access is protected by your password and optionally by two-factor authentication.' },
    { title: '5. Your Rights',                    body: 'You have the right to access your personal data, request corrections, and request deletion where permitted by law.' },
  ];
  return (
    <div className="space-y-4">
      <Card className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-xl text-gray-900 dark:text-white">Privacy Policy & Terms</CardTitle>
          <CardDescription className="text-gray-500 dark:text-gray-400">Last updated: March 2026</CardDescription>
        </CardHeader>
      </Card>
      {sections.map(({ title, body }) => (
        <Card key={title} className="bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800">
          <CardContent className="pt-6">
            <p className="font-bold text-gray-900 dark:text-white mb-2">{title}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{body}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function SettingsPage({ isDarkMode, toggleTheme }) {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('account');

  const tabs = [
    { id: 'account',       label: 'Account Settings' },
    { id: 'notifications', label: 'Notifications'    },
    { id: 'privacy',       label: 'Privacy'          },
  ];

  return (
    <div className={`min-h-screen flex ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <Sidebar isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
      <main className="flex-1 overflow-y-auto">
        <div className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 px-8 pt-6 pb-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Account Settings</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">Manage your account settings, notifications, and privacy preferences.</p>
          <div className="flex gap-2 flex-wrap">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`px-5 py-2 rounded-full text-sm font-semibold border transition-all ${
                  activeTab === t.id
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white'
                    : 'bg-transparent text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:border-gray-400'
                }`}>{t.label}</button>
            ))}
          </div>
        </div>
        <div className="p-8 max-w-3xl">
          {activeTab === 'account'       && <AccountTab       user={user} updateUser={updateUser} />}
          {activeTab === 'notifications' && <NotificationsTab user={user} updateUser={updateUser} />}
          {activeTab === 'privacy'       && <PrivacyTab />}
        </div>
      </main>
    </div>
  );
}
