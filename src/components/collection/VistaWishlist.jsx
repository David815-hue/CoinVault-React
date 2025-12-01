import React, { useState } from 'react';
import { ArrowLeft, Plus, Trash2, Download, List, FileText, FileSpreadsheet, File, X } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useCollection } from '../../context/CollectionContext';
import CountrySelect from '../common/CountrySelect';
import { PAISES } from '../../utils/constants';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

const VistaWishlist = ({ setVista }) => {
    const { modoOscuro } = useTheme();
    const { wishlist, addToWishlist, removeFromWishlist } = useCollection();
    const [mostrarMenuExportar, setMostrarMenuExportar] = useState(false);
    const [mostrarModalAgregar, setMostrarModalAgregar] = useState(false);

    const [newItem, setNewItem] = useState({
        nombre: '',
        pais: '',
        denominacion: ''
    });

    const handleAdd = () => {
        if (!newItem.nombre || !newItem.pais || !newItem.denominacion) {
            alert('Por favor completa todos los campos');
            return;
        }
        addToWishlist(newItem);
        setNewItem({ nombre: '', pais: '', denominacion: '' });
        setMostrarModalAgregar(false);
    };

    const saveAndShareFile = async (fileName, data, mimeType, isBase64 = false) => {
        if (Capacitor.isNativePlatform()) {
            try {
                const savedFile = await Filesystem.writeFile({
                    path: fileName,
                    data: data,
                    directory: Directory.Cache,
                    encoding: isBase64 ? undefined : Encoding.UTF8
                });

                try {
                    await Share.share({
                        title: 'Compartir Lista de Deseos',
                        text: 'Aquí está mi lista de deseos de CoinVault',
                        url: savedFile.uri,
                        dialogTitle: 'Compartir archivo'
                    });
                } catch (shareError) {
                    console.log('User cancelled share or share failed', shareError);
                }
            } catch (error) {
                console.error('Error saving file:', error);
                alert('Error al guardar el archivo. Verifica los permisos.');
            }
        } else {
            // Web fallback
            const blob = isBase64
                ? await (await fetch(`data:${mimeType};base64,${data}`)).blob()
                : new Blob([data], { type: mimeType });

            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    };

    const exportarTxt = async () => {
        const textContent = wishlist.map(item =>
            `Nombre: ${item.nombre}\nPaís: ${item.pais}\nDenominación: ${item.denominacion}\n-------------------`
        ).join('\n\n');

        await saveAndShareFile('wishlist.txt', textContent, 'text/plain');
        setMostrarMenuExportar(false);
    };

    const exportarExcel = async () => {
        const data = wishlist.map(item => ({
            Nombre: item.nombre,
            País: item.pais,
            Denominación: item.denominacion
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Wishlist");

        // Get base64 for mobile
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'base64' });

        await saveAndShareFile(
            `wishlist_${new Date().toISOString().slice(0, 10)}.xlsx`,
            wbout,
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            true
        );
        setMostrarMenuExportar(false);
    };

    const exportarPDF = async () => {
        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.text('Mi Lista de Deseos - CoinVault', 14, 22);
        doc.setFontSize(11);
        doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 30);

        const tableColumn = ["Nombre", "País", "Denominación"];
        const tableRows = wishlist.map(item => [
            item.nombre,
            item.pais,
            item.denominacion
        ]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 40,
        });

        // Get base64 for mobile
        const pdfOutput = doc.output('datauristring').split(',')[1];

        await saveAndShareFile(
            `wishlist_${new Date().toISOString().slice(0, 10)}.pdf`,
            pdfOutput,
            'application/pdf',
            true
        );
        setMostrarMenuExportar(false);
    };

    return (
        <div className={`min-h-screen ${modoOscuro ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-indigo-50'} p-4 md:p-6 pb-40`}>
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => setVista('dashboard')}
                    className="flex items-center gap-2 text-indigo-600 mb-4 hover:text-indigo-800 font-semibold"
                >
                    <ArrowLeft size={20} />
                    Volver al Dashboard
                </button>

                <div className={`${modoOscuro ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl p-6 md:p-8`}>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className={`text-2xl md:text-3xl font-bold ${modoOscuro ? 'text-white' : 'text-gray-800'} flex items-center gap-3`}>
                            <List className="text-[var(--color-primary)]" size={32} />
                            Lista de Deseos
                        </h2>

                        <div className="flex gap-2 relative">
                            <button
                                onClick={() => setMostrarModalAgregar(true)}
                                className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white p-2 rounded-lg transition-colors"
                                title="Agregar Deseo"
                            >
                                <Plus size={20} />
                            </button>

                            <button
                                onClick={() => setMostrarMenuExportar(!mostrarMenuExportar)}
                                className={`p-2 rounded-lg border transition-colors ${modoOscuro
                                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                    }`}
                                title="Exportar"
                            >
                                <Download size={20} />
                            </button>

                            {mostrarMenuExportar && (
                                <div className={`absolute top-full right-0 mt-2 w-48 rounded-xl shadow-lg overflow-hidden border z-20 ${modoOscuro ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                                    <button
                                        onClick={exportarTxt}
                                        className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-opacity-50 ${modoOscuro ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}`}
                                    >
                                        <File size={18} className="text-gray-500" />
                                        Texto (.txt)
                                    </button>
                                    <button
                                        onClick={exportarExcel}
                                        className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-opacity-50 ${modoOscuro ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}`}
                                    >
                                        <FileSpreadsheet size={18} className="text-green-600" />
                                        Excel (.xlsx)
                                    </button>
                                    <button
                                        onClick={exportarPDF}
                                        className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-opacity-50 ${modoOscuro ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}`}
                                    >
                                        <FileText size={18} className="text-red-600" />
                                        PDF (.pdf)
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Lista de Items */}
                    <div className="mb-8">
                        {wishlist.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                No hay items en tu lista de deseos aún.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {wishlist.map((item) => (
                                    <div
                                        key={item.id}
                                        className={`flex items-center justify-between p-4 rounded-lg border ${modoOscuro ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-100 shadow-sm'}`}
                                    >
                                        <div>
                                            <h4 className={`font-bold text-lg ${modoOscuro ? 'text-white' : 'text-gray-800'}`}>{item.nombre}</h4>
                                            <p className={`text-sm ${modoOscuro ? 'text-gray-400' : 'text-gray-500'}`}>
                                                {item.pais} • {item.denominacion}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => removeFromWishlist(item.id)}
                                            className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-full transition-colors"
                                            title="Eliminar"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal Agregar */}
            {mostrarModalAgregar && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className={`w-full max-w-md rounded-2xl p-6 shadow-2xl ${modoOscuro ? 'bg-gray-800' : 'bg-white'}`}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className={`text-xl font-bold ${modoOscuro ? 'text-white' : 'text-gray-800'}`}>
                                Agregar Nuevo Deseo
                            </h3>
                            <button
                                onClick={() => setMostrarModalAgregar(false)}
                                className={`p-1 rounded-full ${modoOscuro ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className={`block text-sm font-medium mb-1 ${modoOscuro ? 'text-gray-300' : 'text-gray-700'}`}>Nombre</label>
                                <input
                                    type="text"
                                    placeholder="Ej: Moneda Romana"
                                    value={newItem.nombre}
                                    onChange={(e) => setNewItem({ ...newItem, nombre: e.target.value })}
                                    className={`w-full px-4 py-2 rounded-lg border ${modoOscuro ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                                />
                            </div>
                            <div>
                                <label className={`block text-sm font-medium mb-1 ${modoOscuro ? 'text-gray-300' : 'text-gray-700'}`}>País</label>
                                <CountrySelect
                                    value={newItem.pais}
                                    onChange={(pais) => setNewItem({ ...newItem, pais })}
                                    countries={PAISES}
                                />
                            </div>
                            <div>
                                <label className={`block text-sm font-medium mb-1 ${modoOscuro ? 'text-gray-300' : 'text-gray-700'}`}>Denominación</label>
                                <input
                                    type="text"
                                    placeholder="Ej: 1 Denario"
                                    value={newItem.denominacion}
                                    onChange={(e) => setNewItem({ ...newItem, denominacion: e.target.value })}
                                    className={`w-full px-4 py-2 rounded-lg border ${modoOscuro ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                                />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    onClick={() => setMostrarModalAgregar(false)}
                                    className={`flex-1 py-2 rounded-lg font-medium border ${modoOscuro ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleAdd}
                                    className="flex-1 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white py-2 rounded-lg font-medium transition-colors"
                                >
                                    Agregar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VistaWishlist;
