'use client';
import { useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const userRef = doc(db, 'users', email.toLowerCase().trim());
      const userSnap = await getDoc(userRef);
      if (userSnap.exists() && userSnap.data().role === 'admin') {
        window.location.href = '/admin/dashboard';
      } else {
        setError("Admin user profile not found.");
      }
    } catch (err) {
      setError("Database connection failed. Please check backend port.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md text-center border border-gray-100">
        <div className="flex justify-center mb-6">
          <div className="bg-[#cc0000] p-4 rounded-2xl shadow-lg">
             <div className="w-10 h-10 flex items-center justify-center text-white font-bold text-2xl">W</div>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Portal</h1>
        <p className="text-gray-400 text-sm mb-10">Enter admin credentials to access the dashboard</p>
        
        <form onSubmit={handleLogin} className="space-y-6 text-left">
          <input 
            type="email" 
            className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#cc0000] outline-none text-black transition-all"
            placeholder="info@winespace.co.za"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
          />
          <input 
            type="password" 
            className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#cc0000] outline-none text-black transition-all"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
          />
          <button type="submit" className="w-full bg-[#cc0000] hover:bg-[#b30000] text-white font-bold py-5 rounded-xl shadow-xl transition-all active:scale-95">
            Login
          </button>
        </form>
        {error && (
          <div className="mt-8 p-4 bg-red-50 text-[#cc0000] rounded-xl text-xs font-bold border border-red-100 flex items-center justify-center gap-2">
            ⚠️ {error}
          </div>
        )}
      </div>
    </div>
  );
}
