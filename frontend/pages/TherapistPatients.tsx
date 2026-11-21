import React, { useState, useEffect } from 'react';
import { Users, Search as SearchIcon, User, MessageSquare } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const TherapistPatients: React.FC = () => {
    const { token } = useAuth();
    const [patients, setPatients] = useState<any[]>([]);

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const res = await fetch(import.meta.env.VITE_API_URL + '/api/patients', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    setPatients(await res.json());
                }
            } catch (e) { console.error('Error fetching patients', e); }
        };
        fetchPatients();
    }, [token]);

    return (
        <div className="w-full max-w-6xl mx-auto px-4 py-8 sm:px-6 sm:py-10">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-8">
                <div>
                    <h1 className="font-serif text-3xl sm:text-4xl font-bold text-sage-800 mb-2">Patient Directory</h1>
                    <p className="text-sage-400 text-sm sm:text-base font-medium">Manage and review your users.</p>
                </div>
                <div className="relative w-full max-w-md">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-sage-300" size={18} />
                    <input
                        type="text"
                        placeholder="Search patients..."
                        className="pl-10 pr-4 py-2 bg-white border border-sage-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sage-300 w-full shadow-sm"
                    />
                </div>
            </div>

            {patients.length === 0 ? (
                <div className="bg-white rounded-3xl border border-sage-100 shadow-sm overflow-hidden">
                    <div className="p-16 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-sage-50 rounded-2xl flex items-center justify-center mb-4 border border-sage-100 shadow-inner">
                            <Users size={28} className="text-sage-400" />
                        </div>
                        <h3 className="text-xl font-bold text-sage-700 mb-2">No Active Patients Yet</h3>
                        <p className="text-sage-400 max-w-sm mb-6">When a user creates an account, they will appear here in your directory.</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {patients.map(p => (
                        <div key={p.id} className="bg-white p-6 rounded-2xl border border-sage-100 shadow-sm hover:shadow-md transition-shadow w-full">
                            <div className="flex items-center gap-4 mb-5">
                                <div className="w-12 h-12 rounded-full bg-sage-100 border-2 border-white shadow-sm flex items-center justify-center text-sage-500 font-bold text-lg">
                                    {p.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="font-bold text-sage-800 text-lg">{p.name}</h3>
                                    <div className="flex items-center gap-1.5 text-xs text-sage-400 font-medium">
                                        <User size={12} /> {p.email}
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button className="flex-1 flex justify-center items-center gap-2 bg-sage-50 text-sage-600 py-2 rounded-xl text-xs font-bold hover:bg-sage-100 transition-colors border border-sage-100">
                                    <MessageSquare size={14} /> Reach Out
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TherapistPatients;
