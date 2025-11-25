import React, { useState } from 'react';
import { Coins, Banknote, Globe, Heart, DollarSign, BarChart3, Star, X, Book } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useCollection } from '../../context/CollectionContext';
import MapaMundial from './MapaMundial';

const Dashboard = ({ setVista, setMostrarFavoritos }) => {
    const { modoOscuro } = useTheme();
    const { monedas, billetes, albums, calcularValorTotal } = useCollection();
    const [paisSeleccionado, setPaisSeleccionado] = useState(null);

    const contarPorPais = (items) => {
        const conteo = {};
        items.forEach(item => {
            if (item.pais) {
                conteo[item.pais] = (conteo[item.pais] || 0) + 1;
            }
        });
        return conteo;
    };

    const monedasPorPais = contarPorPais(monedas);
    const billetesPorPais = contarPorPais(billetes);
    const totalPaisesMonedas = Object.keys(monedasPorPais).length;
    const totalPaisesBilletes = Object.keys(billetesPorPais).length;
    const valores = calcularValorTotal();

    return (
        <div className={`min-h-screen ${modoOscuro ? 'bg-slate-900' : 'bg-slate-50'} p-4 md:p-8 pb-40 transition-colors duration-300`}>
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {/* Monedas Card */}
                    <div
                        onClick={() => setVista('monedas')}
                        className={`relative overflow-hidden rounded-3xl p-8 cursor-pointer transition-all duration-300 group ${modoOscuro
                            ? 'bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/20 hover:border-amber-500/40'
                            : 'bg-white border border-slate-200 hover:border-amber-200 shadow-xl shadow-slate-200/50'
                            } hover:transform hover:-translate-y-2`}
                    >
                        <div className={`absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity ${modoOscuro ? 'text-amber-500' : 'text-amber-600'}`}>
                            <Coins size={120} />
                        </div>

                        <div className="relative z-10">
                            <div className={`inline-flex p-3 rounded-2xl mb-6 ${modoOscuro ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-50 text-amber-600'}`}>
                                <Coins size={32} />
                            </div>
                            <h2 className={`text-3xl font-bold mb-2 ${modoOscuro ? 'text-white' : 'text-slate-800'}`}>Monedas</h2>
                            <div className={`text-5xl font-bold mb-6 ${modoOscuro ? 'text-amber-400' : 'text-amber-500'}`}>
                                {monedas.length}
                            </div>

                            <div className="space-y-2">
                                <div className={`flex items-center gap-2 text-sm ${modoOscuro ? 'text-slate-400' : 'text-slate-500'}`}>
                                    <Globe size={16} />
                                    <span>{totalPaisesMonedas} países</span>
                                </div>
                                <div className={`flex items-center gap-2 text-sm ${modoOscuro ? 'text-slate-400' : 'text-slate-500'}`}>
                                    <Heart size={16} />
                                    <span>{monedas.filter(m => m.favorito).length} favoritas</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Billetes Card */}
                    <div
                        onClick={() => setVista('billetes')}
                        className={`relative overflow-hidden rounded-3xl p-8 cursor-pointer transition-all duration-300 group ${modoOscuro
                            ? 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/20 hover:border-emerald-500/40'
                            : 'bg-white border border-slate-200 hover:border-emerald-200 shadow-xl shadow-slate-200/50'
                            } hover:transform hover:-translate-y-2`}
                    >
                        <div className={`absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity ${modoOscuro ? 'text-emerald-500' : 'text-emerald-600'}`}>
                            <Banknote size={120} />
                        </div>

                        <div className="relative z-10">
                            <div className={`inline-flex p-3 rounded-2xl mb-6 ${modoOscuro ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
                                <Banknote size={32} />
                            </div>
                            <h2 className={`text-3xl font-bold mb-2 ${modoOscuro ? 'text-white' : 'text-slate-800'}`}>Billetes</h2>
                            <div className={`text-5xl font-bold mb-6 ${modoOscuro ? 'text-emerald-400' : 'text-emerald-500'}`}>
                                {billetes.length}
                            </div>

                            <div className="space-y-2">
                                <div className={`flex items-center gap-2 text-sm ${modoOscuro ? 'text-slate-400' : 'text-slate-500'}`}>
                                    <Globe size={16} />
                                    <span>{totalPaisesBilletes} países</span>
                                </div>
                                <div className={`flex items-center gap-2 text-sm ${modoOscuro ? 'text-slate-400' : 'text-slate-500'}`}>
                                    <Heart size={16} />
                                    <span>{billetes.filter(b => b.favorito).length} favoritos</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Álbumes Card */}
                    <div
                        onClick={() => setVista('albumes')}
                        className={`relative overflow-hidden rounded-3xl p-8 cursor-pointer transition-all duration-300 group ${modoOscuro
                            ? 'bg-gradient-to-br from-indigo-500/20 to-indigo-600/10 border border-indigo-500/20 hover:border-indigo-500/40'
                            : 'bg-white border border-slate-200 hover:border-indigo-200 shadow-xl shadow-slate-200/50'
                            } hover:transform hover:-translate-y-2`}
                    >
                        <div className={`absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity ${modoOscuro ? 'text-indigo-500' : 'text-indigo-600'}`}>
                            <Book size={120} />
                        </div>

                        <div className="relative z-10">
                            <div className={`inline-flex p-3 rounded-2xl mb-6 ${modoOscuro ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                                <Book size={32} />
                            </div>
                            <h2 className={`text-3xl font-bold mb-2 ${modoOscuro ? 'text-white' : 'text-slate-800'}`}>Álbumes</h2>
                            <div className={`text-5xl font-bold mb-6 ${modoOscuro ? 'text-indigo-400' : 'text-indigo-500'}`}>
                                {albums.length}
                            </div>

                            <div className="space-y-2">
                                <div className={`flex items-center gap-2 text-sm ${modoOscuro ? 'text-slate-400' : 'text-slate-500'}`}>
                                    <Star size={16} />
                                    <span>Colecciones temáticas</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Resumen Card */}
                    <div className={`relative overflow-hidden rounded-3xl p-8 transition-all duration-300 ${modoOscuro
                        ? 'bg-gradient-to-br from-indigo-500/20 to-purple-600/10 border border-indigo-500/20'
                        : 'bg-white border border-slate-200 shadow-xl shadow-slate-200/50'
                        }`}>
                        <div className="flex items-center justify-between mb-8">
                            <div className={`inline-flex p-3 rounded-2xl ${modoOscuro ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                                <BarChart3 size={32} />
                            </div>
                            <div className={`p-2 rounded-full ${modoOscuro ? 'bg-slate-800' : 'bg-slate-100'}`}>
                                <Star size={24} className="text-yellow-400 fill-yellow-400" />
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <div className={`text-sm font-medium mb-1 ${modoOscuro ? 'text-slate-400' : 'text-slate-500'}`}>Valor Total Estimado</div>
                                <div className={`text-4xl font-bold ${modoOscuro ? 'text-white' : 'text-slate-800'}`}>
                                    L. {valores.total.toFixed(2)}
                                </div>
                            </div>

                            <div className={`h-px w-full ${modoOscuro ? 'bg-slate-700' : 'bg-slate-100'}`}></div>

                            <div className="flex justify-between items-center">
                                <div className={`text-sm ${modoOscuro ? 'text-slate-400' : 'text-slate-500'}`}>Total Elementos</div>
                                <div className={`text-xl font-bold ${modoOscuro ? 'text-white' : 'text-slate-800'}`}>
                                    {monedas.length + billetes.length}
                                </div>
                            </div>

                            <button
                                onClick={() => setMostrarFavoritos(true)}
                                className="w-full py-3 rounded-xl font-semibold bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] transition-all shadow-lg hover:shadow-indigo-500/25 flex items-center justify-center gap-2"
                            >
                                <Star size={18} />
                                Ver Favoritos
                            </button>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <MapaMundial
                        datos={monedasPorPais}
                        tipo="monedas"
                        titulo="Mapa de Monedas por País"
                        setPaisSeleccionado={setPaisSeleccionado}
                    />

                    <MapaMundial
                        datos={billetesPorPais}
                        tipo="billetes"
                        titulo="Mapa de Billetes por País"
                        setPaisSeleccionado={setPaisSeleccionado}
                    />
                </div>

                {paisSeleccionado && (
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in"
                        onClick={() => setPaisSeleccionado(null)}
                    >
                        <div
                            className={`${modoOscuro ? 'bg-slate-800' : 'bg-white'} rounded-3xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className={`text-2xl font-bold ${modoOscuro ? 'text-white' : 'text-slate-800'} flex items-center gap-3`}>
                                    <Globe className="text-indigo-500" />
                                    {paisSeleccionado}
                                </h2>
                                <button
                                    onClick={() => setPaisSeleccionado(null)}
                                    className={`p-2 rounded-full transition-colors ${modoOscuro ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-6">
                                {monedas.filter(m => m.pais === paisSeleccionado).length > 0 && (
                                    <div>
                                        <h3 className="font-bold text-lg text-amber-500 mb-4 flex items-center gap-2">
                                            <Coins size={20} />
                                            Monedas ({monedas.filter(m => m.pais === paisSeleccionado).length})
                                        </h3>
                                        <div className="grid gap-3">
                                            {monedas.filter(m => m.pais === paisSeleccionado).map(m => (
                                                <div key={m.id} className={`p-4 rounded-xl border transition-all ${modoOscuro ? 'bg-slate-700/50 border-slate-600 hover:bg-slate-700' : 'bg-slate-50 border-slate-200 hover:bg-white hover:shadow-md'}`}>
                                                    <div className={`font-bold text-lg ${modoOscuro ? 'text-slate-200' : 'text-slate-800'}`}>{m.nombre}</div>
                                                    <div className={`text-sm mt-1 ${modoOscuro ? 'text-slate-400' : 'text-slate-500'}`}>
                                                        Año: <span className="font-medium">{m.ano}</span> • Estado: <span className="font-medium">{m.estado}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {billetes.filter(b => b.pais === paisSeleccionado).length > 0 && (
                                    <div>
                                        <h3 className="font-bold text-lg text-emerald-500 mb-4 flex items-center gap-2">
                                            <Banknote size={20} />
                                            Billetes ({billetes.filter(b => b.pais === paisSeleccionado).length})
                                        </h3>
                                        <div className="grid gap-3">
                                            {billetes.filter(b => b.pais === paisSeleccionado).map(b => (
                                                <div key={b.id} className={`p-4 rounded-xl border transition-all ${modoOscuro ? 'bg-slate-700/50 border-slate-600 hover:bg-slate-700' : 'bg-slate-50 border-slate-200 hover:bg-white hover:shadow-md'}`}>
                                                    <div className={`font-bold text-lg ${modoOscuro ? 'text-slate-200' : 'text-slate-800'}`}>{b.nombre}</div>
                                                    <div className={`text-sm mt-1 ${modoOscuro ? 'text-slate-400' : 'text-slate-500'}`}>
                                                        Año: <span className="font-medium">{b.ano}</span> • Estado: <span className="font-medium">{b.estado}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => setPaisSeleccionado(null)}
                                className="mt-8 w-full bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200 py-3 rounded-xl font-semibold transition-colors"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
