import React, { useState } from 'react';
import { X, Plus, Trash2, Download, List, FileText, FileSpreadsheet, File } from 'lucide-react';
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

const ModalWishlist = ({ onClose }) => {
    const { modoOscuro } = useTheme();
    const { wishlist, addToWishlist, removeFromWishlist } = useCollection();
    const [mostrarMenuExportar, setMostrarMenuExportar] = useState(false);

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

                await Share.share({
                    title: 'Compartir Lista de Deseos',
                    text: 'Aquí está mi lista de deseos de CoinVault',
                    url: savedFile.uri,
                    dialogTitle: 'Compartir archivo'
                });
            } catch (error) {
                console.error('Error saving/sharing file:', error);
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
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={onClose}
        >
            <div
                className={`${modoOscuro ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto flex flex-col`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className={`text-2xl font-bold ${modoOscuro ? 'text-white' : 'text-gray-800'} flex items-center gap-2`}>
                        <List className="text-[var(--color-primary)]" size={32} />
                        Lista de Deseos
                    </h2>
                    <button
                        onClick={onClose}
                        className={`${modoOscuro ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Formulario de Agregar */}
                <div className={`p-4 rounded-xl mb-6 ${modoOscuro ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <h3 className={`font-semibold mb-3 ${modoOscuro ? 'text-gray-200' : 'text-gray-700'}`}>Agregar Nuevo Deseo</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                        <input
                            type="text"
                            placeholder="Nombre (ej: Moneda Romana)"
                            value={newItem.nombre}
                            onChange={(e) => setNewItem({ ...newItem, nombre: e.target.value })}
                            className={`px-3 py-2 rounded-lg border ${modoOscuro ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                        />
                        <CountrySelect
                            value={newItem.pais}
                            onChange={(pais) => setNewItem({ ...newItem, pais })}
                            countries={PAISES}
                        />
                        <input
                            type="text"
                            placeholder="Denominación (ej: 1 Denario)"
                            value={newItem.denominacion}
                            onChange={(e) => setNewItem({ ...newItem, denominacion: e.target.value })}
                            className={`px-3 py-2 rounded-lg border ${modoOscuro ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                        />
                    </div>
                    <button
                        onClick={handleAdd}
                        className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white py-2 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors"
                    >
                        <Plus size={18} />
                        Agregar a la Lista
                    </button>
                </div>

                {/* Lista de Items */}
                <div className="flex-1 overflow-y-auto min-h-[200px]">
                    {wishlist.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            No hay items en tu lista de deseos aún.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {wishlist.map((item) => (
                                <div
                                    key={item.id}
                                    className={`flex items-center justify-between p-3 rounded-lg border ${modoOscuro ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-100 shadow-sm'}`}
                                >
                                    <div>
                                        <h4 className={`font-bold ${modoOscuro ? 'text-white' : 'text-gray-800'}`}>{item.nombre}</h4>
                                        <p className={`text-sm ${modoOscuro ? 'text-gray-400' : 'text-gray-500'}`}>
                                            {item.pais} • {item.denominacion}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => removeFromWishlist(item.id)}
                                        className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-full transition-colors"
                                        title="Eliminar"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                {wishlist.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 relative">
                        <button
                            onClick={() => setMostrarMenuExportar(!mostrarMenuExportar)}
                            className={`w-full py-3 rounded-lg border-2 font-semibold flex items-center justify-center gap-2 transition-colors ${modoOscuro
                                ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            <Download size={20} />
                            Exportar Lista de Deseos
                        </button>

                        {mostrarMenuExportar && (
                            <div className={`absolute bottom-full left-0 right-0 mb-2 rounded-xl shadow-lg overflow-hidden border ${modoOscuro ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
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
                )}
            </div>
        </div>
    );
};

export default ModalWishlist;
