import { useState } from 'react';
import { KeyRound, X, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { useStore } from '../../store/useStore';

function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const { changePassword } = useAuth();
  const { darkMode } = useStore();
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    const { error: err } = await changePassword(newPassword);
    setLoading(false);
    if (err) {
      setError(err);
    } else {
      setSuccess(true);
    }
  };

  const base = darkMode ? 'bg-gray-900 border-gray-700 text-gray-100' : 'bg-white border-gray-200 text-gray-900';
  const inputCls = `w-full px-3 py-2 rounded-lg border text-sm pr-10 outline-none focus:ring-2 ${
    darkMode
      ? 'bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500 focus:ring-blue-500/40 focus:border-blue-500'
      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-blue-500/40 focus:border-blue-500'
  }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className={`relative w-full max-w-sm rounded-xl border shadow-2xl p-6 ${base}`}>
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-1 rounded-lg transition-colors ${darkMode ? 'text-gray-500 hover:text-gray-300 hover:bg-gray-800' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
        >
          <X size={16} />
        </button>

        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <KeyRound size={16} className="text-emerald-500" />
          </div>
          <h2 className="text-base font-semibold">Change Password</h2>
        </div>

        {success ? (
          <div className="text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-4 py-3">
            Password updated successfully.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>New Password</label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className={inputCls}
                  placeholder="Min. 6 characters"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowNew(v => !v)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  className={inputCls}
                  placeholder="Repeat new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(v => !v)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-medium transition-colors"
            >
              {loading ? 'Updating…' : 'Update Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export function RoleBanner() {
  const { role } = useAuth();
  const { darkMode } = useStore();
  const [showModal, setShowModal] = useState(false);

  if (!role) return null;

  const isAdmin = role === 'admin';

  return (
    <>
      <div className={`flex items-center justify-between px-4 py-2 text-xs font-medium border-b ${
        darkMode ? 'border-gray-800 bg-gray-950' : 'border-gray-200 bg-white'
      }`}>
        <div className="flex items-center gap-2">
          <span className={darkMode ? 'text-gray-500' : 'text-gray-400'}>Access level:</span>
          {isAdmin ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
              Admin
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/25">
              Reader
            </span>
          )}
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowModal(true)}
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border transition-colors ${
              darkMode
                ? 'border-gray-700 text-gray-400 hover:text-gray-200 hover:border-gray-600 hover:bg-gray-800'
                : 'border-gray-300 text-gray-500 hover:text-gray-700 hover:border-gray-400 hover:bg-gray-100'
            }`}
          >
            <KeyRound size={12} />
            Change Password
          </button>
        )}
      </div>

      {showModal && <ChangePasswordModal onClose={() => setShowModal(false)} />}
    </>
  );
}
