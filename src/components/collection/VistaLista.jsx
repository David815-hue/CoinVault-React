import React, { useState } from 'react';
import { ArrowLeft, Coins, Banknote, Filter, Grid, List, Play, Plus, Search, X, Download, FileSpreadsheet, FileText } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useCollection } from '../../context/CollectionContext';
import { estadosConservacion, PAISES } from '../../utils/constants';
import CardItem from './CardItem';
import CardItemLista from './CardItemLista';
import Slideshow from './Slideshow';
import CountrySelect from '../common/CountrySelect';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import ModalZoom from './ModalZoom';

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
    const [mostrarMenuExportar, setMostrarMenuExportar] = useState(false);
    const [imagenZoom, setImagenZoom] = useState(null);

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
                        title: `Compartir Reporte de ${esMoneda ? 'Monedas' : 'Billetes'}`,
                        text: `Aquí está mi reporte de ${esMoneda ? 'monedas' : 'billetes'} de CoinVault`,
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
            if (mimeType === 'application/pdf') {
                // For PDF in web, doc.save() is handled by jsPDF, but here we receive base64 or blob?
                // Actually, for PDF web, we can just use doc.save() inside the export function.
                // But to unify, let's keep the logic inside export functions for web specific parts if needed.
                // However, the helper is useful.
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
            } else {
                // Excel web download is handled by XLSX.writeFile usually, but we can do blob too
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
        }
    };

    const exportarExcel = async () => {
        const data = itemsFiltrados.map(item => ({
            Nombre: item.nombre,
            País: item.pais,
            Año: item.ano,
            ...(esMoneda ? { Material: item.material } : { Denominación: item.denominacion }),
            Estado: item.estado,
            'Valor Compra': item.valorComprado ? `L. ${item.valorComprado}` : '-',
            'Valor Venta': item.valorVenta ? `L. ${item.valorVenta}` : '-',
            Descripción: item.descripcion || '-'
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, esMoneda ? "Monedas" : "Billetes");

        if (Capacitor.isNativePlatform()) {
            const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'base64' });
            await saveAndShareFile(
                `Coleccion_${esMoneda ? 'Monedas' : 'Billetes'}_${new Date().toISOString().slice(0, 10)}.xlsx`,
                wbout,
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                true
            );
        } else {
            XLSX.writeFile(wb, `Coleccion_${esMoneda ? 'Monedas' : 'Billetes'}_${new Date().toISOString().slice(0, 10)}.xlsx`);
        }
        setMostrarMenuExportar(false);
    };

    const exportarPDF = async () => {
        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.text(`Reporte de Colección - ${esMoneda ? 'Monedas' : 'Billetes'}`, 14, 22);
        doc.setFontSize(11);
        doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 30);
        doc.text(`Total items: ${itemsFiltrados.length}`, 14, 36);

        let yPosition = 50;
        const pageHeight = doc.internal.pageSize.height;
        const itemHeight = 60; // Altura de cada item con imagen

        for (let i = 0; i < itemsFiltrados.length; i++) {
            const item = itemsFiltrados[i];

            // Verificar si necesitamos nueva página
            if (yPosition + itemHeight > pageHeight - 20) {
                doc.addPage();
                yPosition = 20;
            }

            // Dibujar borde del item
            doc.setDrawColor(200);
            doc.setLineWidth(0.5);
            doc.rect(14, yPosition, 182, itemHeight);

            // Agregar imagen si existe
            if (item.fotoFrontal) {
                try {
                    // Dimensiones de la imagen
                    const imgWidth = 40;
                    const imgHeight = esMoneda ? 40 : 25; // Redondo para monedas, rectangular para billetes
                    doc.addImage(item.fotoFrontal, 'JPEG', 18, yPosition + 5, imgWidth, imgHeight);
                } catch (error) {
                    console.error('Error al agregar imagen al PDF:', error);
                }
            }

            // Información del item
            const textX = 65;
            doc.setFontSize(12);
            doc.setFont(undefined, 'bold');
            doc.text(item.nombre, textX, yPosition + 10);

            doc.setFont(undefined, 'normal');
            doc.setFontSize(10);
            doc.text(`País: ${item.pais}`, textX, yPosition + 18);
            doc.text(`Año: ${item.ano}`, textX, yPosition + 26);
            doc.text(esMoneda ? `Material: ${item.material || '-'}` : `Denominación: ${item.denominacion || '-'}`, textX, yPosition + 34);
            doc.text(`Estado: ${item.estado}`, textX, yPosition + 42);
            doc.text(`Valor Compra: L. ${item.valorComprado || '-'}`, textX, yPosition + 50);

            yPosition += itemHeight + 10;
        }

        if (Capacitor.isNativePlatform()) {
            const pdfOutput = doc.output('datauristring').split(',')[1];
            await saveAndShareFile(
                `Coleccion_${esMoneda ? 'Monedas' : 'Billetes'}_${new Date().toISOString().slice(0, 10)}.pdf`,
                pdfOutput,
                'application/pdf',
                true
            );
        } else {
            doc.save(`Coleccion_${esMoneda ? 'Monedas' : 'Billetes'}_${new Date().toISOString().slice(0, 10)}.pdf`);
        }
        setMostrarMenuExportar(false);
    };

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
        <div className={`min-h-screen ${modoOscuro ? 'bg-[var(--bg-primary-dark)]' : 'bg-[var(--bg-primary-light)]'} p-4 md:p-6 pb-40`}>
            <div className="max-w-7xl mx-auto">
                <button
                    onClick={() => setVista('dashboard')}
                    className="flex items-center gap-2 text-[var(--color-primary)] mb-4 hover:text-[var(--color-primary-hover)] font-semibold"
                >
                    <ArrowLeft size={20} />
                    Volver al Dashboard
                </button>

                <div className={`${modoOscuro ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl p-6 mb-6`}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
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
                                onClick={() => setMostrarFiltros(!mostrarFiltros)}
                                className={`px-4 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 ${filtrosActivos
                                    ? 'bg-purple-600 text-white'
                                    : modoOscuro
                                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                <Filter size={20} />
                                <span className="hidden sm:inline">Filtros</span>
                                {filtrosActivos && <span className="bg-white text-purple-600 text-xs px-1.5 py-0.5 rounded-full">{Object.values(filtros).filter(f => f !== '').length}</span>}
                            </button>

                            <div className="relative">
                                <button
                                    onClick={() => setMostrarMenuExportar(!mostrarMenuExportar)}
                                    className={`px-4 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 ${modoOscuro
                                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                        }`}
                                    title="Exportar"
                                >
                                    <Download size={20} />
                                </button>
                                {mostrarMenuExportar && (
                                    <div className={`absolute top-full right-0 mt-2 w-48 rounded-xl shadow-lg z-20 overflow-hidden ${modoOscuro ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'}`}>
                                        <button
                                            onClick={exportarExcel}
                                            className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-opacity-50 ${modoOscuro ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}`}
                                        >
                                            <FileSpreadsheet size={18} className="text-green-600" />
                                            Excel
                                        </button>
                                        <button
                                            onClick={exportarPDF}
                                            className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-opacity-50 ${modoOscuro ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}`}
                                        >
                                            <FileText size={18} className="text-red-600" />
                                            PDF
                                        </button>
                                    </div>
                                )}
                            </div>

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
                                className="bg-[var(--color-primary)] text-white px-4 md:px-6 py-3 rounded-lg font-semibold hover:bg-[var(--color-primary-hover)] transition-colors flex items-center gap-2"
                            >
                                <Plus size={20} />
                                <span className="hidden sm:inline">Agregar</span>
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
                            className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-lg ${modoOscuro
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
                                        setImagenZoom={setImagenZoom}
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
                                        setImagenZoom={setImagenZoom}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            {imagenZoom && (
                <ModalZoom
                    imagen={imagenZoom}
                    onClose={() => setImagenZoom(null)}
                />
            )}
        </div>
    );
};

export default VistaLista;
