import React, { useState } from 'react';
import { X, Save, Coins, Banknote, Check, Search, Palette, Layout } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useCollection } from '../../context/CollectionContext';

const ModalCrearAlbum = ({ onClose }) => {
    const { modoOscuro } = useTheme();
    const { monedas, billetes, crearNuevoAlbum } = useCollection();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        color: 'indigo',
        design: 'classic',
        items: []
    });

    const [searchTerm, setSearchTerm] = useState('');

    const toggleItem = (id) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.includes(id)
                ? prev.items.filter(itemId => itemId !== id)
                : [...prev.items, id]
        }));
    };

    const handleSubmit = async () => {
        if (!formData.title) return alert('El título es obligatorio');

        const success = await crearNuevoAlbum(formData);
        if (success) onClose();
    };

    const filteredMonedas = monedas.filter(m =>
        m.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.pais.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.ano.toString().includes(searchTerm)
    );

    const filteredBilletes = billetes.filter(b =>
        b.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.pais.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.ano.toString().includes(searchTerm)
    );



    const designs = [
        { id: 'classic', name: 'Clásico' },
        { id: 'modern', name: 'Moderno' },
        { id: 'minimal', name: 'Minimalista' },
        { id: 'vintage', name: 'Vintage' },
        { id: 'grid', name: 'Cuadrícula' },
        { id: 'elegant', name: 'Elegante' },
    ];

    const colors = [
        { id: 'indigo', class: 'bg-indigo-500' },
        { id: 'emerald', class: 'bg-emerald-500' },
        { id: 'rose', class: 'bg-rose-500' },
        { id: 'amber', class: 'bg-amber-500' },
        { id: 'cyan', class: 'bg-cyan-500' },
        { id: 'slate', class: 'bg-slate-500' },
        { id: 'violet', class: 'bg-violet-500' },
        { id: 'crimson', class: 'bg-red-600' },
        { id: 'teal', class: 'bg-teal-500' },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className={`w-full max-w-4xl h-[90vh] rounded-2xl flex flex-col ${modoOscuro ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
                {/* Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-2xl font-bold">Crear Nuevo Álbum</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Título del Álbum</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                className={`w-full p-3 rounded-lg border ${modoOscuro ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                                placeholder="Ej: Monedas del Siglo XIX"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Descripción</label>
                            <textarea
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                className={`w-full p-3 rounded-lg border ${modoOscuro ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                                rows={3}
                                placeholder="Descripción opcional..."
                            />
                        </div>
                    </div>

                    {/* Customization */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                                <Palette size={16} /> Color del Álbum
                            </label>
                            <div className="flex flex-wrap gap-3">
                                {colors.map(c => (
                                    <button
                                        key={c.id}
                                        onClick={() => setFormData({ ...formData, color: c.id })}
                                        className={`w-10 h-10 rounded-full ${c.class} transition-transform hover:scale-110 flex items-center justify-center ${formData.color === c.id ? 'ring-4 ring-offset-2 ring-gray-400' : ''}`}
                                        title={c.id}
                                    >
                                        {formData.color === c.id && <Check size={16} className="text-white" />}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                                <Layout size={16} /> Diseño
                            </label>
                            <select
                                value={formData.design}
                                onChange={e => setFormData({ ...formData, design: e.target.value })}
                                className={`w-full p-3 rounded-lg border appearance-none ${modoOscuro ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                            >
                                {designs.map(d => (
                                    <option key={d.id} value={d.id}>{d.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Item Selection */}
                    <div>
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
                            <h3 className="text-lg font-bold">Seleccionar Elementos ({formData.items.length})</h3>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Buscar monedas o billetes..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className={`pl-10 pr-4 py-2 rounded-lg border w-full md:w-64 ${modoOscuro ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                                />
                            </div>
                        </div>

                        <div className="space-y-6">
                            {/* Monedas */}
                            {filteredMonedas.length > 0 && (
                                <div>
                                    <h4 className="flex items-center gap-2 font-semibold text-amber-500 mb-3">
                                        <Coins size={20} /> Monedas
                                    </h4>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                        {filteredMonedas.map(m => (
                                            <div
                                                key={m.id}
                                                onClick={() => toggleItem(m.id)}
                                                className={`cursor-pointer p-3 rounded-xl border-2 transition-all relative ${formData.items.includes(m.id)
                                                    ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)]/20'
                                                    : 'border-transparent bg-gray-50 dark:bg-gray-700 hover:bg-gray-100'
                                                    }`}
                                            >
                                                {formData.items.includes(m.id) && (
                                                    <div className="absolute top-2 right-2 bg-[var(--color-primary)] text-white p-1 rounded-full">
                                                        <Check size={12} />
                                                    </div>
                                                )}
                                                <img
                                                    src={m.fotoFrontal || 'https://via.placeholder.com/150'}
                                                    alt={m.nombre}
                                                    className="w-full h-24 object-cover rounded-lg mb-2"
                                                />
                                                <p className="text-sm font-medium truncate">{m.nombre}</p>
                                                <p className="text-xs text-gray-500 truncate">{m.pais} • {m.ano}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Billetes */}
                            {filteredBilletes.length > 0 && (
                                <div>
                                    <h4 className="flex items-center gap-2 font-semibold text-green-500 mb-3">
                                        <Banknote size={20} /> Billetes
                                    </h4>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                        {filteredBilletes.map(b => (
                                            <div
                                                key={b.id}
                                                onClick={() => toggleItem(b.id)}
                                                className={`cursor-pointer p-3 rounded-xl border-2 transition-all relative ${formData.items.includes(b.id)
                                                    ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)]/20'
                                                    : 'border-transparent bg-gray-50 dark:bg-gray-700 hover:bg-gray-100'
                                                    }`}
                                            >
                                                {formData.items.includes(b.id) && (
                                                    <div className="absolute top-2 right-2 bg-[var(--color-primary)] text-white p-1 rounded-full">
                                                        <Check size={12} />
                                                    </div>
                                                )}
                                                <img
                                                    src={b.fotoFrontal || 'https://via.placeholder.com/150'}
                                                    alt={b.nombre}
                                                    className="w-full h-24 object-cover rounded-lg mb-2"
                                                />
                                                <p className="text-sm font-medium truncate">{b.nombre}</p>
                                                <p className="text-xs text-gray-500 truncate">{b.pais} • {b.ano}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {filteredMonedas.length === 0 && filteredBilletes.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    No se encontraron elementos que coincidan con tu búsqueda.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-6 py-2 rounded-lg bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] flex items-center gap-2"
                    >
                        <Save size={20} />
                        Guardar Álbum
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalCrearAlbum;
