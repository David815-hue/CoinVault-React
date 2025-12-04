import React, { useState, useEffect } from 'react';
import { Users, Coins, Banknote, Book, RefreshCw, ArrowLeft, Clock } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { getAllUsersStats } from '../../services/firebase';

const AdminPanel = ({ onBack }) => {
    const { modoOscuro } = useTheme();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadUsers = async () => {
        setLoading(true);
        setError(null);
        const result = await getAllUsersStats();
        if (result.success) {
            setUsers(result.users);
        } else {
            setError(result.error);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadUsers();
    }, []);

    // Calculate totals
    const totals = users.reduce((acc, user) => ({
        monedas: acc.monedas + (user.monedas || 0),
        billetes: acc.billetes + (user.billetes || 0),
        albums: acc.albums + (user.albums || 0)
    }), { monedas: 0, billetes: 0, albums: 0 });

    const formatDate = (isoString) => {
        if (!isoString) return 'Nunca';
        const date = new Date(isoString);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className={`min-h-screen ${modoOscuro ? 'bg-[var(--bg-primary-dark)]' : 'bg-[var(--bg-primary-light)]'} p-4 md:p-8 pb-40 transition-colors duration-300`}>
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onBack}
                            className={`p-2 rounded-xl transition-all ${modoOscuro
                                ? 'bg-slate-800 hover:bg-slate-700 text-white'
                                : 'bg-white hover:bg-slate-100 text-slate-800 shadow-md'}`}
                        >
                            <ArrowLeft size={24} />
                        </button>
                        <h1 className={`text-2xl md:text-3xl font-bold ${modoOscuro ? 'text-white' : 'text-slate-800'}`}>
                            Panel de Administración
                        </h1>
                    </div>
                    <button
                        onClick={loadUsers}
                        disabled={loading}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${modoOscuro
                            ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                            : 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-md'}`}
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                        <span className="hidden md:inline">Actualizar</span>
                    </button>
                </div>

                {/* Stats Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className={`rounded-2xl p-6 ${modoOscuro
                        ? 'bg-gradient-to-br from-indigo-500/20 to-purple-600/10 border border-indigo-500/20'
                        : 'bg-white border border-slate-200 shadow-xl'}`}>
                        <div className="flex items-center gap-3 mb-2">
                            <Users className={modoOscuro ? 'text-indigo-400' : 'text-indigo-500'} size={24} />
                            <span className={`text-sm ${modoOscuro ? 'text-slate-400' : 'text-slate-500'}`}>Usuarios</span>
                        </div>
                        <div className={`text-3xl font-bold ${modoOscuro ? 'text-white' : 'text-slate-800'}`}>
                            {users.length}
                        </div>
                    </div>

                    <div className={`rounded-2xl p-6 ${modoOscuro
                        ? 'bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/20'
                        : 'bg-white border border-slate-200 shadow-xl'}`}>
                        <div className="flex items-center gap-3 mb-2">
                            <Coins className={modoOscuro ? 'text-amber-400' : 'text-amber-500'} size={24} />
                            <span className={`text-sm ${modoOscuro ? 'text-slate-400' : 'text-slate-500'}`}>Monedas</span>
                        </div>
                        <div className={`text-3xl font-bold ${modoOscuro ? 'text-amber-400' : 'text-amber-500'}`}>
                            {totals.monedas}
                        </div>
                    </div>

                    <div className={`rounded-2xl p-6 ${modoOscuro
                        ? 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/20'
                        : 'bg-white border border-slate-200 shadow-xl'}`}>
                        <div className="flex items-center gap-3 mb-2">
                            <Banknote className={modoOscuro ? 'text-emerald-400' : 'text-emerald-500'} size={24} />
                            <span className={`text-sm ${modoOscuro ? 'text-slate-400' : 'text-slate-500'}`}>Billetes</span>
                        </div>
                        <div className={`text-3xl font-bold ${modoOscuro ? 'text-emerald-400' : 'text-emerald-500'}`}>
                            {totals.billetes}
                        </div>
                    </div>

                    <div className={`rounded-2xl p-6 ${modoOscuro
                        ? 'bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/20'
                        : 'bg-white border border-slate-200 shadow-xl'}`}>
                        <div className="flex items-center gap-3 mb-2">
                            <Book className={modoOscuro ? 'text-purple-400' : 'text-purple-500'} size={24} />
                            <span className={`text-sm ${modoOscuro ? 'text-slate-400' : 'text-slate-500'}`}>Álbumes</span>
                        </div>
                        <div className={`text-3xl font-bold ${modoOscuro ? 'text-purple-400' : 'text-purple-500'}`}>
                            {totals.albums}
                        </div>
                    </div>
                </div>

                {/* Users Table */}
                <div className={`rounded-2xl overflow-hidden ${modoOscuro
                    ? 'bg-slate-800/50 border border-slate-700/50'
                    : 'bg-white border border-slate-200 shadow-xl'}`}>
                    <div className={`px-6 py-4 border-b ${modoOscuro ? 'border-slate-700' : 'border-slate-200'}`}>
                        <h2 className={`text-lg font-semibold ${modoOscuro ? 'text-white' : 'text-slate-800'}`}>
                            Usuarios Registrados
                        </h2>
                    </div>

                    {loading ? (
                        <div className="p-12 text-center">
                            <RefreshCw size={32} className={`mx-auto animate-spin ${modoOscuro ? 'text-slate-500' : 'text-slate-400'}`} />
                            <p className={`mt-4 ${modoOscuro ? 'text-slate-400' : 'text-slate-500'}`}>Cargando usuarios...</p>
                        </div>
                    ) : error ? (
                        <div className="p-12 text-center">
                            <p className="text-red-400">{error}</p>
                            <button
                                onClick={loadUsers}
                                className="mt-4 px-4 py-2 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30"
                            >
                                Reintentar
                            </button>
                        </div>
                    ) : users.length === 0 ? (
                        <div className="p-12 text-center">
                            <Users size={48} className={`mx-auto ${modoOscuro ? 'text-slate-600' : 'text-slate-300'}`} />
                            <p className={`mt-4 ${modoOscuro ? 'text-slate-400' : 'text-slate-500'}`}>
                                No hay usuarios registrados aún
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className={modoOscuro ? 'bg-slate-700/50' : 'bg-slate-50'}>
                                        <th className={`px-6 py-3 text-left text-sm font-semibold ${modoOscuro ? 'text-slate-300' : 'text-slate-600'}`}>
                                            Email
                                        </th>
                                        <th className={`px-6 py-3 text-center text-sm font-semibold ${modoOscuro ? 'text-amber-400' : 'text-amber-600'}`}>
                                            <div className="flex items-center justify-center gap-1">
                                                <Coins size={16} />
                                                Monedas
                                            </div>
                                        </th>
                                        <th className={`px-6 py-3 text-center text-sm font-semibold ${modoOscuro ? 'text-emerald-400' : 'text-emerald-600'}`}>
                                            <div className="flex items-center justify-center gap-1">
                                                <Banknote size={16} />
                                                Billetes
                                            </div>
                                        </th>
                                        <th className={`px-6 py-3 text-center text-sm font-semibold ${modoOscuro ? 'text-purple-400' : 'text-purple-600'}`}>
                                            <div className="flex items-center justify-center gap-1">
                                                <Book size={16} />
                                                Álbumes
                                            </div>
                                        </th>
                                        <th className={`px-6 py-3 text-right text-sm font-semibold ${modoOscuro ? 'text-slate-300' : 'text-slate-600'}`}>
                                            <div className="flex items-center justify-end gap-1">
                                                <Clock size={16} />
                                                Última Sync
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user, index) => (
                                        <tr
                                            key={user.id}
                                            className={`border-t ${modoOscuro
                                                ? 'border-slate-700 hover:bg-slate-700/30'
                                                : 'border-slate-100 hover:bg-slate-50'} transition-colors`}
                                        >
                                            <td className={`px-6 py-4 text-sm ${modoOscuro ? 'text-white' : 'text-slate-800'}`}>
                                                {user.email}
                                            </td>
                                            <td className={`px-6 py-4 text-center text-sm font-medium ${modoOscuro ? 'text-amber-400' : 'text-amber-600'}`}>
                                                {user.monedas || 0}
                                            </td>
                                            <td className={`px-6 py-4 text-center text-sm font-medium ${modoOscuro ? 'text-emerald-400' : 'text-emerald-600'}`}>
                                                {user.billetes || 0}
                                            </td>
                                            <td className={`px-6 py-4 text-center text-sm font-medium ${modoOscuro ? 'text-purple-400' : 'text-purple-600'}`}>
                                                {user.albums || 0}
                                            </td>
                                            <td className={`px-6 py-4 text-right text-xs ${modoOscuro ? 'text-slate-400' : 'text-slate-500'}`}>
                                                {formatDate(user.lastSync)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;
