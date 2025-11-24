import React, { useState } from 'react';
import { ArrowLeft, Coins, Banknote, Filter, Grid, List, Play, Plus, Search, X } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useCollection } from '../../context/CollectionContext';
import { estadosConservacion, PAISES } from '../../utils/constants';
import CardItem from './CardItem';
import CardItemLista from './CardItemLista';
import Slideshow from './Slideshow';
import CountrySelect from '../common/CountrySelect';

const VistaLista = ({ tipo, setVista, setTipoFormulario, setItemEditando, iniciarSlideshow }) => {
    const { modoOscuro } = useTheme();
    const { monedas, billetes } = useCollection();
    const esMoneda = tipo === 'monedas';
    const items = esMoneda ? monedas : billetes;

    const [busqueda, setBusqueda] = useState('');
    const [filtros, setFiltros] = useState({
        pais: '',
        material: '',
        anoDesde: '',
        anoHasta: '',
        estado: ''
    });
    const [mostrarFiltros, setMostrarFiltros] = useState(false);
    const [vistaDisplay, setVistaDisplay] = useState('cuadricula');
    const [slideshowActivo, setSlideshowActivo] = useState(false);

    const aplicarFiltros = (items) => {
        return items.filter(item => {
            if (filtros.pais && item.pais !== filtros.pais) return false;
            if (filtros.material && item.material !== filtros.material) return false;
            if (filtros.estado && item.estado !== filtros.estado) return false;
            if (filtros.anoDesde && parseInt(item.ano) < parseInt(filtros.anoDesde)) return false;
            if (filtros.anoHasta && parseInt(item.ano) > parseInt(filtros.anoHasta)) return false;
            return true;
        });
    };

    const limpiarFiltros = () => {
        setFiltros({
            pais: '',
            material: '',
            anoDesde: '',
            anoHasta: '',
            estado: ''
        });
    };

    let itemsFiltrados = items.filter(item => {
        const searchLower = busqueda.toLowerCase();
        return (
            item.nombre?.toLowerCase().includes(searchLower) ||
            item.pais?.toLowerCase().includes(searchLower) ||
            item.ano?.toString().includes(searchLower) ||
            item.descripcion?.toLowerCase().includes(searchLower) ||
            (item.denominacion && item.denominacion.toString().includes(searchLower)) ||
            (item.material && item.material.toLowerCase().includes(searchLower))
        );
    });

    itemsFiltrados = aplicarFiltros(itemsFiltrados);

    const materialesUnicos = [...new Set(items.map(i => i.material))].filter(Boolean);
    const filtrosActivos = Object.values(filtros).some(f => f !== '');

    if (slideshowActivo) {
        return (
            <Slideshow
                items={itemsFiltrados}
                onClose={() => setSlideshowActivo(false)}
                tipo={tipo}
            />
        );
    }

    return (
        <div className={`min-h-screen ${modoOscuro ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-indigo-50'} p-4 md:p-6 pb-40`}>
            <div className="max-w-7xl mx-auto">
                <button
                    onClick={() => setVista('dashboard')}
                    className="flex items-center gap-2 text-indigo-600 mb-4 hover:text-indigo-800 font-semibold"
                >
                    <ArrowLeft size={20} />
                    Volver al Dashboard
                </button>

                <div className={`${modoOscuro ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl p-6 mb-6`}>
                    <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                        <h1 className={`text-3xl font-bold ${modoOscuro ? 'text-white' : 'text-gray-800'} flex items-center gap-3`}>
                            {esMoneda ? (
                                <>
                                    <Coins className="text-amber-500" size={36} />
                                    Mis Monedas
                                </>
                            ) : (
                                <>
                                    <Banknote className="text-green-500" size={36} />
                                    Mis Billetes
                                </>
                            )}
                            <span className={`text-2xl ${modoOscuro ? 'text-gray-400' : 'text-gray-500'}`}>({items.length})</span>
                        </h1>

                        <div className="flex gap-2">
                            <button
                                onClick={() => setMostrarFiltros(!mostrarFiltros)}
                                className={`px-4 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 ${filtrosActivos
                                    ? 'bg-purple-600 text-white'
                                    : modoOscuro
                                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                <Filter size={20} />
                                Filtros {filtrosActivos && `(${Object.values(filtros).filter(f => f !== '').length})`}
                            </button>

                            <button
                                onClick={() => setVistaDisplay(vistaDisplay === 'cuadricula' ? 'lista' : 'cuadricula')}
                                className={`px-4 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 ${modoOscuro
                                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                title={vistaDisplay === 'cuadricula' ? 'Vista de lista' : 'Vista de cuadrícula'}
                            >
                                {vistaDisplay === 'cuadricula' ? <List size={20} /> : <Grid size={20} />}
                            </button>

                            <button
                                onClick={() => setSlideshowActivo(true)}
                                className={`px-4 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 ${modoOscuro
                                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                title="Modo presentación"
                            >
                                <Play size={20} />
                                <span className="hidden md:inline">Slideshow</span>
                            </button>

                            <button
                                onClick={() => {
                                    setTipoFormulario(tipo);
                                    setVista('formulario');
                                }}
                                className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2"
                            >
                                <Plus size={20} />
                                Agregar
                            </button>
                        </div>
                    </div>

                    {mostrarFiltros && (
                        <div className={`mb-6 p-4 rounded-xl border-2 ${modoOscuro ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div>
                                    <label className={`block text-sm font-semibold mb-2 ${modoOscuro ? 'text-gray-300' : 'text-gray-700'}`}>
                                        País
                                    </label>
                                    <CountrySelect
                                        value={filtros.pais}
                                        onChange={(pais) => setFiltros({ ...filtros, pais })}
                                        countries={PAISES}
                                        placeholder="Todos los países"
                                    />
                                </div>

                                {esMoneda && (
                                    <div>
                                        <label className={`block text-sm font-semibold mb-2 ${modoOscuro ? 'text-gray-300' : 'text-gray-700'}`}>
                                            Material
                                        </label>
                                        <select
                                            value={filtros.material}
                                            onChange={(e) => setFiltros({ ...filtros, material: e.target.value })}
                                            className={`w-full px-3 py-2 border rounded-lg ${modoOscuro ? 'bg-gray-600 border-gray-500 text-white' : 'border-gray-300'
                                                }`}
                                        >
                                            <option value="">Todos los materiales</option>
                                            {materialesUnicos.map(m => (
                                                <option key={m} value={m}>{m}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div>
                                    <label className={`block text-sm font-semibold mb-2 ${modoOscuro ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Estado
                                    </label>
                                    <select
                                        value={filtros.estado}
                                        onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
                                        className={`w-full px-3 py-2 border rounded-lg ${modoOscuro ? 'bg-gray-600 border-gray-500 text-white' : 'border-gray-300'
                                            }`}
                                    >
                                        <option value="">Todos los estados</option>
                                        {estadosConservacion.map(e => (
                                            <option key={e} value={e}>{e}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className={`block text-sm font-semibold mb-2 ${modoOscuro ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Año desde
                                    </label>
                                    <input
                                        type="number"
                                        value={filtros.anoDesde}
                                        onChange={(e) => setFiltros({ ...filtros, anoDesde: e.target.value })}
                                        placeholder="Ej: 1990"
                                        className={`w-full px-3 py-2 border rounded-lg ${modoOscuro ? 'bg-gray-600 border-gray-500 text-white' : 'border-gray-300'
                                            }`}
                                    />
                                </div>

                                <div>
                                    <label className={`block text-sm font-semibold mb-2 ${modoOscuro ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Año hasta
                                    </label>
                                    <input
                                        type="number"
                                        value={filtros.anoHasta}
                                        onChange={(e) => setFiltros({ ...filtros, anoHasta: e.target.value })}
                                        placeholder="Ej: 2024"
                                        className={`w-full px-3 py-2 border rounded-lg ${modoOscuro ? 'bg-gray-600 border-gray-500 text-white' : 'border-gray-300'
                                            }`}
                                    />
                                </div>
                            </div>

                            {filtrosActivos && (
                                <button
                                    onClick={limpiarFiltros}
                                    className="flex items-center gap-2 text-red-600 hover:text-red-700 font-semibold"
                                >
                                    <X size={18} />
                                    Limpiar filtros
                                </button>
                            )}
                        </div>
                    )}

                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            placeholder="Buscar por nombre, país, año, descripción..."
                            className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg ${modoOscuro
                                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                : 'border-gray-200'
                                }`}
                        />
                    </div>
                </div>

                {itemsFiltrados.length === 0 ? (
                    <div className={`${modoOscuro ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl p-12 text-center`}>
                        <div className="text-gray-400 mb-4">
                            {esMoneda ? <Coins size={64} className="mx-auto" /> : <Banknote size={64} className="mx-auto" />}
                        </div>
                        {busqueda || filtrosActivos ? (
                            <>
                                <p className={`text-xl ${modoOscuro ? 'text-gray-300' : 'text-gray-600'} mb-2`}>No se encontraron resultados</p>
                                <p className={modoOscuro ? 'text-gray-400' : 'text-gray-500'}>Intenta con otros términos o filtros</p>
                            </>
                        ) : (
                            <>
                                <p className={`text-xl ${modoOscuro ? 'text-gray-300' : 'text-gray-600'} mb-2`}>No hay {tipo} en tu colección</p>
                                <p className={modoOscuro ? 'text-gray-400' : 'text-gray-500'}>Comienza agregando tu primer {esMoneda ? 'moneda' : 'billete'}</p>
                            </>
                        )}
                    </div>
                ) : (
                    <>
                        {(busqueda || filtrosActivos) && (
                            <div className={`mb-4 font-semibold ${modoOscuro ? 'text-gray-300' : 'text-gray-600'}`}>
                                Encontrados: {itemsFiltrados.length}
                            </div>
                        )}

                        {vistaDisplay === 'cuadricula' ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {itemsFiltrados.map((item) => (
                                    <CardItem
                                        key={item.id}
                                        item={item}
                                        tipo={tipo}
                                        setVista={setVista}
                                        setItemEditando={setItemEditando}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {itemsFiltrados.map((item) => (
                                    <CardItemLista
                                        key={item.id}
                                        item={item}
                                        tipo={tipo}
                                        setVista={setVista}
                                        setItemEditando={setItemEditando}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

        </div>
    );
};

export default VistaLista;
