import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  User,
  Shield,
  KeyRound,
  Cpu,
  Sparkles,
  Server,
  Database,
  CheckCircle2,
  Loader2,
  Save,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';

const SettingsPage = () => {
  const { user, refreshUser } = useAuth();
  const { showToast } = useOutletContext();

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    department: user?.department || 'Operations',
    password: '',
    confirmPassword: '',
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSubmitProfile = async (e) => {
    e.preventDefault();

    if (profileData.password && profileData.password !== profileData.confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        name: profileData.name,
        department: profileData.department,
      };
      if (profileData.password) {
        payload.password = profileData.password;
      }

      await authService.updateProfile(payload);
      await refreshUser();
      showToast('Profile updated successfully!');
      setProfileData((prev) => ({ ...prev, password: '', confirmPassword: '' }));
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const aiFutureFeatures = [
    {
      title: 'Semantic Article Search',
      desc: 'Vector embeddings (OpenAI / Gemini text-embedding-004) to enable natural language question answering across enterprise SOPs.',
      status: 'Schema-Ready',
    },
    {
      title: 'Automated Stale Content Detection',
      desc: 'LLM agents compare step-by-step instructions against live product pull requests and flag obsolete screenshots or deprecated CLI commands.',
      status: 'Design Hook Ready',
    },
    {
      title: 'Adaptive Review Interval Suggestion',
      desc: 'Machine learning analysis of change velocity to recommend shorter cadences for rapid-churn services and longer for static policies.',
      status: 'Design Hook Ready',
    },
    {
      title: 'Duplicate & Conflicting Rule Auditing',
      desc: 'Cross-document reconciliation to identify contradictory procedural steps across departments before audits occur.',
      status: 'Design Hook Ready',
    },
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in duration-200">
      {/* Header */}
      <div className="border-b border-slate-200/80 pb-5">
        <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
          Account & System Settings
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Manage your personal profile, credentials, and review architecture configurations.
        </p>
      </div>

      {/* Profile & Credentials */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Personal Profile</h2>
            <p className="text-xs text-slate-500">Update your identity and password</p>
          </div>
        </div>

        <form onSubmit={handleSubmitProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                Work Email (Read Only)
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                Assigned Role
              </label>
              <input
                type="text"
                disabled
                value={user?.role || 'Knowledge Owner'}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold text-slate-700 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                Department
              </label>
              <input
                type="text"
                value={profileData.department}
                onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Change Password (leave empty to keep current)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-600 mb-1">New Password</label>
                <input
                  type="password"
                  minLength={6}
                  value={profileData.password}
                  onChange={(e) => setProfileData({ ...profileData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-600 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  minLength={6}
                  value={profileData.confirmPassword}
                  onChange={(e) => setProfileData({ ...profileData, confirmPassword: e.target.value })}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Profile Changes
            </button>
          </div>
        </form>
      </div>

      {/* AI-Ready Architecture Section */}
      <div className="rounded-3xl border border-indigo-200 bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-3 border-b border-indigo-100 pb-4 mb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">AI-Ready Architecture</h2>
              <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-extrabold text-indigo-700">
                Extensibility Spec
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Clean decoupled interfaces designed for future LLM integration without fake mock responses
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {aiFutureFeatures.map((feat, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <h4 className="text-xs font-bold text-slate-900">{feat.title}</h4>
                  <span className="text-[10px] font-mono rounded bg-white px-1.5 py-0.2 border border-slate-200 text-slate-600">
                    {feat.status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System Technical Telemetry */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">System Technical Telemetry</h2>
            <p className="text-xs text-slate-500">Full-Stack MERN Architecture Details</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Client Runtime</span>
            <strong className="text-slate-800">React 19 + Vite 6 + Tailwind CSS</strong>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">API Server</span>
            <strong className="text-slate-800">Node.js + Express REST APIs</strong>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Database Engine</span>
            <strong className="text-slate-800">MongoDB + Mongoose ODM</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
