/**
 * src/components/islands/AccountModals.tsx
 * Componentes modales para funcionalidades de cuenta
 * Con verificación por código de un solo uso enviado al email
 */

import React, { useState, useEffect } from 'react';
import { supabaseClient } from '../../lib/supabase';

// ─── EDIT PROFILE MODAL ───────────────────────────────────────────
// Ofrece 2 opciones: cambiar nombre de usuario o correo electrónico
// Cada opción requiere código de verificación por email

type EditStep = 'choose' | 'enter-code' | 'enter-value' | 'success';
type EditAction = 'change-username' | 'change-email' | null;

export function EditProfileModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<EditStep>('choose');
  const [action, setAction] = useState<EditAction>(null);
  const [code, setCode] = useState('');
  const [newValue, setNewValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userId, setUserId] = useState('');

  const resetState = () => {
    setStep('choose');
    setAction(null);
    setCode('');
    setNewValue('');
    setError('');
    setSuccess('');
    setLoading(false);
  };

  const handleOpen = async () => {
    resetState();
    try {
      const { data: { session } } = await supabaseClient.auth.getSession();
      if (session) {
        setUserEmail(session.user.email || '');
        setUserId(session.user.id);
        setIsOpen(true);
      }
    } catch (err) {
      console.error('Error al abrir perfil:', err);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    resetState();
  };

  // Paso 1: elegir acción y enviar código
  const handleChooseAction = async (selectedAction: EditAction) => {
    if (!selectedAction) return;
    setAction(selectedAction);
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/account/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: selectedAction,
          email: userEmail,
          userId
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setStep('enter-code');
    } catch (err: any) {
      setError(err.message || 'Error al enviar código');
    } finally {
      setLoading(false);
    }
  };

  // Paso 2: verificar código
  const handleVerifyCode = async () => {
    if (code.length !== 6) {
      setError('El código debe tener 6 dígitos');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/account/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          code,
          userId
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setStep('enter-value');
    } catch (err: any) {
      setError(err.message || 'Error al verificar código');
    } finally {
      setLoading(false);
    }
  };

  // Paso 3: enviar nuevo valor
  const handleSubmitNewValue = async () => {
    if (!newValue.trim()) {
      setError(action === 'change-username' ? 'Introduce un nombre de usuario' : 'Introduce un correo electrónico');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/account/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          code,
          userId,
          newValue: newValue.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccess(data.message);
      setStep('success');

      // Actualizar la UI instantáneamente
      setTimeout(() => {
        if (action === 'change-username') {
          const el = document.getElementById('userName');
          if (el) el.textContent = newValue.trim();
        } else if (action === 'change-email') {
          const el = document.getElementById('userEmail');
          if (el) el.textContent = newValue.trim();
        }
        handleClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Error al actualizar');
    } finally {
      setLoading(false);
    }
  };

  const maskedEmail = userEmail ? userEmail.replace(/(.{2})(.*)(@.*)/, '$1***$3') : '';

  return (
    <>
      <button
        onClick={handleOpen}
        className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-all duration-200 shadow-sm hover:shadow-md"
      >
        Editar Perfil
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={(e) => e.target === e.currentTarget && handleClose()}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {step === 'choose' && 'Editar Perfil'}
                    {step === 'enter-code' && 'Verificación'}
                    {step === 'enter-value' && (action === 'change-username' ? 'Nuevo Usuario' : 'Nuevo Correo')}
                    {step === 'success' && '¡Actualizado!'}
                  </h2>
                  <p className="text-gray-400 text-sm mt-1">
                    {step === 'choose' && '¿Qué deseas cambiar?'}
                    {step === 'enter-code' && `Código enviado a ${maskedEmail}`}
                    {step === 'enter-value' && 'Introduce el nuevo dato'}
                    {step === 'success' && 'Cambio realizado correctamente'}
                  </p>
                </div>
                <button onClick={handleClose} className="text-gray-400 hover:text-white transition p-1">
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Step: Choose action */}
              {step === 'choose' && (
                <div className="space-y-3">
                  <button
                    onClick={() => handleChooseAction('change-username')}
                    disabled={loading}
                    className="w-full flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-red-300 hover:bg-red-50 transition-all duration-200 text-left group disabled:opacity-50"
                  >
                    <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 group-hover:bg-red-100 group-hover:text-red-600 transition">
                      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Cambiar Nombre de Usuario</p>
                      <p className="text-sm text-gray-500">Se enviará un código a tu correo</p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleChooseAction('change-email')}
                    disabled={loading}
                    className="w-full flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-red-300 hover:bg-red-50 transition-all duration-200 text-left group disabled:opacity-50"
                  >
                    <div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0 group-hover:bg-red-100 group-hover:text-red-600 transition">
                      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Cambiar Correo Electrónico</p>
                      <p className="text-sm text-gray-500">Se verificará tu identidad primero</p>
                    </div>
                  </button>

                  {loading && (
                    <div className="flex items-center justify-center gap-2 py-3 text-sm text-gray-500">
                      <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                      Enviando código de verificación...
                    </div>
                  )}
                </div>
              )}

              {/* Step: Enter verification code */}
              {step === 'enter-code' && (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <p className="text-sm text-blue-800">
                      Hemos enviado un código de 6 dígitos a tu correo electrónico. Introdúcelo a continuación.
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Código de verificación</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      className="w-full px-4 py-3 text-center text-2xl tracking-[0.5em] font-mono border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                      autoFocus
                    />
                  </div>
                  <button
                    onClick={handleVerifyCode}
                    disabled={loading || code.length !== 6}
                    className="w-full py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Verificando...' : 'Verificar Código'}
                  </button>
                  <button
                    onClick={() => handleChooseAction(action)}
                    disabled={loading}
                    className="w-full py-2 text-sm text-gray-500 hover:text-red-600 transition"
                  >
                    Reenviar código
                  </button>
                </div>
              )}

              {/* Step: Enter new value */}
              {step === 'enter-value' && (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <p className="text-sm text-green-800 flex items-center gap-2">
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      Código verificado correctamente
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {action === 'change-username' ? 'Nuevo Nombre de Usuario' : 'Nuevo Correo Electrónico'}
                    </label>
                    <input
                      type={action === 'change-email' ? 'email' : 'text'}
                      value={newValue}
                      onChange={(e) => setNewValue(e.target.value)}
                      placeholder={action === 'change-username' ? 'Tu nuevo nombre' : 'nuevo@correo.com'}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                      autoFocus
                    />
                  </div>
                  <button
                    onClick={handleSubmitNewValue}
                    disabled={loading || !newValue.trim()}
                    className="w-full py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </div>
              )}

              {/* Step: Success */}
              {step === 'success' && (
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#16a34a" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">{success}</p>
                  <p className="text-sm text-gray-500 mt-2">Cerrando en unos segundos...</p>
                </div>
              )}

              {/* Error message */}
              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center gap-2">
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── CHANGE PASSWORD MODAL ────────────────────────────────────────
// Requiere código de verificación antes de poder cambiar la contraseña

type PwStep = 'initial' | 'enter-code' | 'enter-password' | 'success';

export function ChangePasswordModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<PwStep>('initial');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const resetState = () => {
    setStep('initial');
    setCode('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess('');
    setLoading(false);
    setShowPassword(false);
  };

  const handleOpen = async () => {
    resetState();
    try {
      const { data: { session } } = await supabaseClient.auth.getSession();
      if (session) {
        setUserEmail(session.user.email || '');
        setUserId(session.user.id);
        setIsOpen(true);
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    resetState();
  };

  const handleSendCode = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/account/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'change-password',
          email: userEmail,
          userId
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setStep('enter-code');
    } catch (err: any) {
      setError(err.message || 'Error al enviar código');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (code.length !== 6) {
      setError('El código debe tener 6 dígitos');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/account/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'change-password',
          code,
          userId
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setStep('enter-password');
    } catch (err: any) {
      setError(err.message || 'Error al verificar código');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/account/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'change-password',
          code,
          userId,
          newValue: newPassword
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccess('Contraseña actualizada correctamente');
      setStep('success');

      setTimeout(() => handleClose(), 2500);
    } catch (err: any) {
      setError(err.message || 'Error al cambiar contraseña');
    } finally {
      setLoading(false);
    }
  };

  const maskedEmail = userEmail ? userEmail.replace(/(.{2})(.*)(@.*)/, '$1***$3') : '';

  return (
    <>
      <button
        onClick={handleOpen}
        className="w-full px-6 py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-all duration-200 flex items-center justify-center gap-2"
      >
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
        Cambiar Contraseña
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={(e) => e.target === e.currentTarget && handleClose()}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Cambiar Contraseña</h2>
                  <p className="text-gray-400 text-sm mt-1">
                    {step === 'initial' && 'Necesitas verificar tu identidad'}
                    {step === 'enter-code' && `Código enviado a ${maskedEmail}`}
                    {step === 'enter-password' && 'Introduce tu nueva contraseña'}
                    {step === 'success' && 'Cambio realizado'}
                  </p>
                </div>
                <button onClick={handleClose} className="text-gray-400 hover:text-white transition p-1">
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              {step === 'initial' && (
                <div className="space-y-4">
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <p className="text-sm text-amber-800">
                      Para cambiar tu contraseña, enviaremos un código de verificación a tu correo electrónico registrado.
                    </p>
                  </div>
                  <button
                    onClick={handleSendCode}
                    disabled={loading}
                    className="w-full py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Enviando...
                      </>
                    ) : (
                      <>
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        Enviar Código de Verificación
                      </>
                    )}
                  </button>
                </div>
              )}

              {step === 'enter-code' && (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <p className="text-sm text-blue-800">Introduce el código de 6 dígitos que te hemos enviado.</p>
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="w-full px-4 py-3 text-center text-2xl tracking-[0.5em] font-mono border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                    autoFocus
                  />
                  <button
                    onClick={handleVerifyCode}
                    disabled={loading || code.length !== 6}
                    className="w-full py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition disabled:opacity-50"
                  >
                    {loading ? 'Verificando...' : 'Verificar Código'}
                  </button>
                  <button
                    onClick={handleSendCode}
                    disabled={loading}
                    className="w-full py-2 text-sm text-gray-500 hover:text-red-600 transition"
                  >
                    Reenviar código
                  </button>
                </div>
              )}

              {step === 'enter-password' && (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <p className="text-sm text-green-800 flex items-center gap-2">
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      Identidad verificada
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nueva Contraseña</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Mínimo 6 caracteres"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition pr-12"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? (
                          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" /></svg>
                        ) : (
                          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar Contraseña</label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repite la contraseña"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                    />
                  </div>
                  {newPassword && confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-sm text-red-500">Las contraseñas no coinciden</p>
                  )}
                  <button
                    onClick={handleChangePassword}
                    disabled={loading || newPassword.length < 6 || newPassword !== confirmPassword}
                    className="w-full py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
                  </button>
                </div>
              )}

              {step === 'success' && (
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#16a34a" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">{success}</p>
                  <p className="text-sm text-gray-500 mt-2">Cerrando en unos segundos...</p>
                </div>
              )}

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center gap-2">
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}


// ─── DELETE ACCOUNT MODAL ─────────────────────────────────────────

export function DeleteAccountModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (confirmText !== 'ELIMINAR') {
        setError('Debes escribir "ELIMINAR" para confirmar');
        setLoading(false);
        return;
      }

      const { data: { session } } = await supabaseClient.auth.getSession();
      if (!session) throw new Error('No autenticado');

      const response = await fetch('/api/account/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error al eliminar cuenta');
      }

      localStorage.clear();
      window.location.href = '/';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar cuenta');
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition"
      >
        Eliminar Cuenta
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="p-6 border-b border-red-200 bg-red-50">
              <h2 className="text-2xl font-bold text-red-900">Eliminar Cuenta</h2>
            </div>

            <form onSubmit={handleDelete} className="p-6 space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-sm text-red-900">
                  <strong>Advertencia:</strong> Esta acción es irreversible. Se eliminarán todos tus datos, pedidos e historial.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Escribe "ELIMINAR" para confirmar
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="ELIMINAR"
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent uppercase"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    setConfirmText('');
                    setError('');
                  }}
                  disabled={loading}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || confirmText !== 'ELIMINAR'}
                  className="flex-1 px-4 py-2 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition disabled:opacity-50"
                >
                  {loading ? 'Eliminando...' : 'Eliminar Cuenta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}


// ─── SETTINGS PANEL ───────────────────────────────────────────────
// Ajustes: tema claro/oscuro, idioma, notificaciones, etc.

type ThemeMode = 'light' | 'dark' | 'system';

export function SettingsPanel() {
  const [theme, setTheme] = useState<ThemeMode>('light');
  const [notifications, setNotifications] = useState(true);
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [promotions, setPromotions] = useState(true);
  const [compactView, setCompactView] = useState(false);
  const [currency, setCurrency] = useState('EUR');
  const [saved, setSaved] = useState(false);

  // Cargar ajustes de localStorage al montar
  useEffect(() => {
    const savedSettings = localStorage.getItem('jgmarket-settings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        setTheme(settings.theme || 'light');
        setNotifications(settings.notifications ?? true);
        setOrderUpdates(settings.orderUpdates ?? true);
        setPromotions(settings.promotions ?? true);
        setCompactView(settings.compactView ?? false);
        setCurrency(settings.currency || 'EUR');
      } catch (e) {
        // ignore
      }
    }
    const currentTheme = localStorage.getItem('jgmarket-theme') || 'light';
    setTheme(currentTheme as ThemeMode);
  }, []);

  const applyTheme = (mode: ThemeMode) => {
    let isDark = false;
    if (mode === 'dark') {
      isDark = true;
    } else if (mode === 'system') {
      isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('jgmarket-theme', mode);
  };

  const handleThemeChange = (mode: ThemeMode) => {
    setTheme(mode);
    applyTheme(mode);
    saveSettings({ theme: mode });
  };

  const saveSettings = (overrides: Record<string, any> = {}) => {
    const settings = {
      theme,
      notifications,
      orderUpdates,
      promotions,
      compactView,
      currency,
      ...overrides
    };
    localStorage.setItem('jgmarket-settings', JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleToggle = (key: string, value: boolean) => {
    switch (key) {
      case 'notifications': setNotifications(value); break;
      case 'orderUpdates': setOrderUpdates(value); break;
      case 'promotions': setPromotions(value); break;
      case 'compactView': setCompactView(value); break;
    }
    saveSettings({ [key]: value });
  };

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${checked ? 'bg-red-600' : 'bg-gray-300'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 ${checked ? 'translate-x-6' : 'translate-x-0'}`} />
    </button>
  );

  return (
    <div className="space-y-8">
      {/* Apariencia */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
          Apariencia
        </h3>
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => handleThemeChange('light')}
            className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${theme === 'light' ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}
          >
            <div className="w-10 h-10 rounded-lg bg-white border-2 border-gray-200 flex items-center justify-center">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#f59e0b"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            </div>
            <span className={`text-sm font-medium ${theme === 'light' ? 'text-red-600' : 'text-gray-700'}`}>Claro</span>
          </button>

          <button
            onClick={() => handleThemeChange('dark')}
            className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${theme === 'dark' ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}
          >
            <div className="w-10 h-10 rounded-lg bg-gray-900 flex items-center justify-center">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="white"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
            </div>
            <span className={`text-sm font-medium ${theme === 'dark' ? 'text-red-600' : 'text-gray-700'}`}>Oscuro</span>
          </button>

          <button
            onClick={() => handleThemeChange('system')}
            className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${theme === 'system' ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-white to-gray-900 border border-gray-200 flex items-center justify-center">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#6b7280"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            </div>
            <span className={`text-sm font-medium ${theme === 'system' ? 'text-red-600' : 'text-gray-700'}`}>Sistema</span>
          </button>
        </div>
      </div>

      {/* Notificaciones */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
          Notificaciones por Email
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="font-medium text-gray-900">Notificaciones generales</p>
              <p className="text-sm text-gray-500">Novedades y actualizaciones de la plataforma</p>
            </div>
            <Toggle checked={notifications} onChange={(v) => handleToggle('notifications', v)} />
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="font-medium text-gray-900">Actualizaciones de pedidos</p>
              <p className="text-sm text-gray-500">Estado de envío y entrega de tus compras</p>
            </div>
            <Toggle checked={orderUpdates} onChange={(v) => handleToggle('orderUpdates', v)} />
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="font-medium text-gray-900">Ofertas y promociones</p>
              <p className="text-sm text-gray-500">Descuentos exclusivos y ofertas especiales</p>
            </div>
            <Toggle checked={promotions} onChange={(v) => handleToggle('promotions', v)} />
          </div>
        </div>
      </div>

      {/* Visualización */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
          Visualización
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="font-medium text-gray-900">Vista compacta</p>
              <p className="text-sm text-gray-500">Muestra más productos en menos espacio</p>
            </div>
            <Toggle checked={compactView} onChange={(v) => handleToggle('compactView', v)} />
          </div>
        </div>
      </div>

      {/* Moneda */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          Moneda
        </h3>
        <select
          value={currency}
          onChange={(e) => {
            setCurrency(e.target.value);
            saveSettings({ currency: e.target.value });
          }}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition bg-white"
        >
          <option value="EUR">Euro (€)</option>
          <option value="USD">Dólar ($)</option>
          <option value="GBP">Libra (£)</option>
        </select>
      </div>

      {/* Feedback de guardado */}
      {saved && (
        <div className="fixed bottom-6 right-6 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 z-50">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#22c55e"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          Ajuste guardado
        </div>
      )}
    </div>
  );
}
