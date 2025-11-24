import React, { useState } from 'react';
import { Coins, Banknote, Globe, Heart, DollarSign, BarChart3, Star, X } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useCollection } from '../../context/CollectionContext';
import MapaMundial from './MapaMundial';

const Dashboard = ({ setVista, setMostrarFavoritos }) => {
    const { modoOscuro } = useTheme();
    const { monedas, billetes, calcularValorTotal } = useCollection();
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
        <div className={`min-h-screen ${modoOscuro ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'} p-4 md:p-6 pb-40`}>
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className={`text-4xl md:text-5xl font-bold ${modoOscuro ? 'text-white' : 'text-gray-800'} mb-2`}>
                        📖 Dashboard de Colección
                    </h1>
                    <p className={modoOscuro ? 'text-gray-400' : 'text-gray-600'}>Gestiona y visualiza tu colección numismática</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div
                        onClick={() => setVista('monedas')}
                        className="bg-gradient-to-br from-amber-500 to-yellow-600 rounded-2xl shadow-2xl p-8 text-white cursor-pointer transform hover:scale-105 transition-all hover:shadow-amber-500/50"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <Coins size={52} className="drop-shadow-lg" />
                            <div className="text-right">
                                <div className="text-3xl font-bold">{monedas.length}</div>
                                <div className="text-amber-100 text-sm">Total</div>
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Monedas</h2>
                        <div className="space-y-1 text-amber-100">
                            <p className="flex items-center gap-2">
                                <Globe size={16} />
                                {totalPaisesMonedas} países
                            </p>
                            <p className="flex items-center gap-2">
                                <Heart size={16} />
                                {monedas.filter(m => m.favorito).length} favoritas
                            </p>
                            {valores.totalMonedas > 0 && (
                                <p className="flex items-center gap-2 font-semibold text-lg mt-2">
                                    <DollarSign size={16} />
                                    ${valores.totalMonedas.toFixed(2)}
                                </p>
                            )}
                        </div>
                    </div>

                    <div
                        onClick={() => setVista('billetes')}
                        className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-2xl p-8 text-white cursor-pointer transform hover:scale-105 transition-all hover:shadow-green-500/50"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <Banknote size={52} className="drop-shadow-lg" />
                            <div className="text-right">
                                <div className="text-3xl font-bold">{billetes.length}</div>
                                <div className="text-green-100 text-sm">Total</div>
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Billetes</h2>
                        <div className="space-y-1 text-green-100">
                            <p className="flex items-center gap-2">
                                <Globe size={16} />
                                {totalPaisesBilletes} países
                            </p>
                            <p className="flex items-center gap-2">
                                <Heart size={16} />
                                {billetes.filter(b => b.favorito).length} favoritos
                            </p>
                            {valores.totalBilletes > 0 && (
                                <p className="flex items-center gap-2 font-semibold text-lg mt-2">
                                    <DollarSign size={16} />
                                    ${valores.totalBilletes.toFixed(2)}
                                </p>
                            )}
                        </div>
                    </div>

                    <div
                        className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl shadow-2xl p-8 text-white"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <BarChart3 size={52} className="drop-shadow-lg" />
                            <Star size={40} className="text-yellow-300 drop-shadow-lg" />
                        </div>
                        <h2 className="text-2xl font-bold mb-4">Resumen Total</h2>
                        <div className="space-y-3">
                            <div className="bg-white/20 rounded-lg p-3 backdrop-blur-sm">
                                <div className="text-sm text-indigo-100">Elementos</div>
                                <div className="text-2xl font-bold">{monedas.length + billetes.length}</div>
                            </div>
                            {valores.total > 0 && (
                                <div className="bg-white/20 rounded-lg p-3 backdrop-blur-sm">
                                    <div className="text-sm text-indigo-100">Valor Total</div>
                                    <div className="text-2xl font-bold">${valores.total.toFixed(2)}</div>
                                </div>
                            )}
                            <button
                                onClick={() => setMostrarFavoritos(true)}
                                className="w-full bg-yellow-400 text-indigo-900 py-3 rounded-lg font-bold hover:bg-yellow-300 transition-colors flex items-center justify-center gap-2"
                            >
                                <Star size={20} />
                                Ver Favoritos
                            </button>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
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
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                        onClick={() => setPaisSeleccionado(null)}
                    >
                        <div
                            className={`${modoOscuro ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className={`text-2xl font-bold ${modoOscuro ? 'text-white' : 'text-gray-800'}`}>
                                    🌍 {paisSeleccionado}
                                </h2>
                                <button
                                    onClick={() => setPaisSeleccionado(null)}
                                    className={`${modoOscuro ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {monedas.filter(m => m.pais === paisSeleccionado).length > 0 && (
                                    <div>
                                        <h3 className="font-bold text-lg text-amber-600 mb-3 flex items-center gap-2">
                                            <Coins size={20} />
                                            Monedas ({monedas.filter(m => m.pais === paisSeleccionado).length})
                                        </h3>
                                        <div className="space-y-2">
                                            {monedas.filter(m => m.pais === paisSeleccionado).map(m => (
                                                <div key={m.id} className={`p-3 rounded-lg border ${modoOscuro ? 'bg-amber-900 border-amber-700' : 'bg-amber-50 border-amber-200'}`}>
                                                    <div className={`font-semibold ${modoOscuro ? 'text-amber-100' : ''}`}>{m.nombre}</div>
                                                    <div className={`text-sm ${modoOscuro ? 'text-gray-300' : 'text-gray-600'}`}>Año: {m.ano} - Estado: {m.estado}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {billetes.filter(b => b.pais === paisSeleccionado).length > 0 && (
                                    <div>
                                        <h3 className="font-bold text-lg text-green-600 mb-3 flex items-center gap-2">
                                            <Banknote size={20} />
                                            Billetes ({billetes.filter(b => b.pais === paisSeleccionado).length})
                                        </h3>
                                        <div className="space-y-2">
                                            {billetes.filter(b => b.pais === paisSeleccionado).map(b => (
                                                <div key={b.id} className={`p-3 rounded-lg border ${modoOscuro ? 'bg-green-900 border-green-700' : 'bg-green-50 border-green-200'}`}>
                                                    <div className={`font-semibold ${modoOscuro ? 'text-green-100' : ''}`}>{b.nombre}</div>
                                                    <div className={`text-sm ${modoOscuro ? 'text-gray-300' : 'text-gray-600'}`}>Año: {b.ano} - Estado: {b.estado}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => setPaisSeleccionado(null)}
                                className="mt-6 w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700"
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
