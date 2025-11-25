import React, { useState } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { scaleLinear } from 'd3-scale';
import { Map, Minus, Plus, RefreshCw } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { COUNTRY_NAME_MAP } from '../../utils/constants';

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const MapaMundial = ({ datos, tipo, titulo, setPaisSeleccionado }) => {
    const { modoOscuro } = useTheme();
    const [position, setPosition] = useState({ coordinates: [0, 0], zoom: 1 });
    const [tooltipContent, setTooltipContent] = useState('');

    const maxCantidad = Math.max(...Object.values(datos), 1);

    const colorScale = scaleLinear()
        .domain([0, maxCantidad])
        .range(tipo === 'monedas'
            ? ["#FFF7ED", "#D97706"]
            : ["#F0FDF4", "#059669"]
        );

    const handleZoomIn = () => {
        if (position.zoom >= 4) return;
        setPosition(pos => ({ ...pos, zoom: pos.zoom * 1.2 }));
    };

    const handleZoomOut = () => {
        if (position.zoom <= 1) return;
        setPosition(pos => ({ ...pos, zoom: pos.zoom / 1.2 }));
    };

    const handleMoveEnd = (position) => {
        setPosition(position);
    };

    const handleReset = () => {
        setPosition({ coordinates: [0, 0], zoom: 1 });
    };

    const getPaisEspanol = (nombreIngles) => {
        return COUNTRY_NAME_MAP[nombreIngles] || nombreIngles;
    };

    return (
        <div className={`${modoOscuro ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl p-6`}>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <Map className={tipo === 'monedas' ? 'text-amber-500' : 'text-green-500'} size={32} />
                    <div>
                        <h2 className={`text-2xl font-bold ${modoOscuro ? 'text-white' : 'text-gray-800'}`}>{titulo}</h2>
                        <p className={modoOscuro ? 'text-gray-400' : 'text-gray-600'}>
                            {Object.keys(datos).length} países representados
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={handleZoomOut} className={`p-2 rounded-lg ${modoOscuro ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}>
                        <Minus size={20} />
                    </button>
                    <button onClick={handleReset} className={`p-2 rounded-lg ${modoOscuro ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}>
                        <RefreshCw size={20} />
                    </button>
                    <button onClick={handleZoomIn} className={`p-2 rounded-lg ${modoOscuro ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}>
                        <Plus size={20} />
                    </button>
                </div>
            </div>

            <div className="relative">
                <div className={`rounded-xl overflow-hidden border ${modoOscuro ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-blue-50'}`} style={{ height: "200px" }}>
                    <ComposableMap
                        projectionConfig={{
                            rotate: [-10, 0, 0],
                            scale: 147
                        }}
                        height={200}
                    >
                        <ZoomableGroup
                            zoom={position.zoom}
                            center={position.coordinates}
                            onMoveEnd={handleMoveEnd}
                            maxZoom={4}
                        >
                            <Geographies geography={geoUrl}>
                                {({ geographies }) =>
                                    geographies.map((geo) => {
                                        const countryNameEnglish = geo.properties.name;
                                        const countryNameSpanish = getPaisEspanol(countryNameEnglish);
                                        const cantidad = datos[countryNameSpanish] || 0;

                                        return (
                                            <Geography
                                                key={geo.rsmKey}
                                                geography={geo}
                                                onMouseEnter={() => {
                                                    setTooltipContent(`${countryNameSpanish}: ${cantidad} ${tipo}`);
                                                }}
                                                onMouseLeave={() => {
                                                    setTooltipContent('');
                                                }}
                                                onClick={() => {
                                                    if (cantidad > 0) {
                                                        setPaisSeleccionado(countryNameSpanish);
                                                    }
                                                }}
                                                style={{
                                                    default: {
                                                        fill: cantidad > 0 ? colorScale(cantidad) : (modoOscuro ? "#374151" : "#D1D5DB"),
                                                        outline: "none",
                                                        stroke: modoOscuro ? "#1F2937" : "#FFF",
                                                        strokeWidth: 0.5
                                                    },
                                                    hover: {
                                                        fill: cantidad > 0 ? (tipo === 'monedas' ? "#B45309" : "#047857") : (modoOscuro ? "#4B5563" : "#9CA3AF"),
                                                        outline: "none",
                                                        cursor: cantidad > 0 ? "pointer" : "default",
                                                        stroke: modoOscuro ? "#FFF" : "#000",
                                                        strokeWidth: 1
                                                    },
                                                    pressed: {
                                                        fill: "#E63946",
                                                        outline: "none"
                                                    }
                                                }}
                                            />
                                        );
                                    })
                                }
                            </Geographies>
                        </ZoomableGroup>
                    </ComposableMap>
                </div>

                {tooltipContent && (
                    <div className={`absolute top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg shadow-lg ${modoOscuro ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'
                        } border ${modoOscuro ? 'border-gray-600' : 'border-gray-200'} font-semibold z-10`}>
                        {tooltipContent}
                    </div>
                )}
            </div>

            <div className="mt-4 flex flex-wrap gap-2 justify-center">
                {Object.entries(datos)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([pais, cantidad]) => (
                        <div
                            key={pais}
                            onClick={() => setPaisSeleccionado(pais)}
                            className={`px-3 py-1 rounded-full text-sm cursor-pointer transition-colors border ${tipo === 'monedas'
                                ? (modoOscuro ? 'bg-amber-900/30 border-amber-700 text-amber-200 hover:bg-amber-900/50' : 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100')
                                : (modoOscuro ? 'bg-green-900/30 border-green-700 text-green-200 hover:bg-green-900/50' : 'bg-green-50 border-green-200 text-green-800 hover:bg-green-100')
                                }`}
                        >
                            <span className="font-bold mr-1">{cantidad}</span>
                            {pais}
                        </div>
                    ))}
            </div>
        </div>
    );
};

export default MapaMundial;
