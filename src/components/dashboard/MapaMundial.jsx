import React, { useState } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { scaleLinear } from 'd3-scale';
import { Map, Minus, Plus, RefreshCw, X, PieChart } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { COUNTRY_NAME_MAP } from '../../utils/constants';

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const MapaMundial = ({ datos, tipo, titulo, setPaisSeleccionado }) => {
    const { modoOscuro } = useTheme();
    const [position, setPosition] = useState({ coordinates: [0, 0], zoom: 1 });
    const [tooltipContent, setTooltipContent] = useState('');
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [viewMode, setViewMode] = useState('map'); // 'map' or 'chart'

    const maxCantidad = Math.max(...Object.values(datos), 1);
    const totalItems = Object.values(datos).reduce((sum, val) => sum + val, 0);

    // Sort countries by quantity for pie chart
    const sortedCountries = Object.entries(datos)
        .filter(([_, count]) => count > 0)
        .sort((a, b) => b[1] - a[1]);

    const colorScale = scaleLinear()
        .domain([0, maxCantidad])
        .range(tipo === 'monedas'
            ? ["#FFF7ED", "#D97706"]
            : ["#F0FDF4", "#059669"]
        );

    // Colors for pie chart
    const pieColors = tipo === 'monedas'
        ? ['#D97706', '#F59E0B', '#FBBF24', '#FCD34D', '#FDE68A', '#FEF3C7']
        : ['#059669', '#10B981', '#34D399', '#6EE7B7', '#A7F3D0', '#D1FAE5'];

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

    const toggleFullScreen = () => {
        setIsFullScreen(!isFullScreen);
        setPosition({ coordinates: [0, 0], zoom: 1 });
    };

    // Render pie chart
    const renderPieChart = () => {
        const size = isFullScreen ? 300 : 200;
        const center = size / 2;
        const radius = size / 2 - 10;

        let currentAngle = -90; // Start from top

        return (
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 p-4 h-full">
                {/* Pie Chart SVG */}
                <div className="relative">
                    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                        {sortedCountries.map(([country, count], index) => {
                            const percentage = (count / totalItems) * 100;
                            const angle = (percentage / 100) * 360;
                            const startAngle = currentAngle;
                            const endAngle = currentAngle + angle;
                            currentAngle = endAngle;

                            // Calculate arc path
                            const startRad = (startAngle * Math.PI) / 180;
                            const endRad = (endAngle * Math.PI) / 180;
                            const x1 = center + radius * Math.cos(startRad);
                            const y1 = center + radius * Math.sin(startRad);
                            const x2 = center + radius * Math.cos(endRad);
                            const y2 = center + radius * Math.sin(endRad);
                            const largeArc = angle > 180 ? 1 : 0;

                            const pathD = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

                            return (
                                <path
                                    key={country}
                                    d={pathD}
                                    fill={pieColors[index % pieColors.length]}
                                    stroke={modoOscuro ? '#1F2937' : '#FFF'}
                                    strokeWidth="2"
                                    className="cursor-pointer hover:opacity-80 transition-opacity"
                                    onClick={() => setPaisSeleccionado(country)}
                                >
                                    <title>{`${country}: ${count} (${percentage.toFixed(1)}%)`}</title>
                                </path>
                            );
                        })}
                        {/* Center circle for donut effect */}
                        <circle
                            cx={center}
                            cy={center}
                            r={radius * 0.5}
                            fill={modoOscuro ? '#1F2937' : '#FFF'}
                        />
                        <text
                            x={center}
                            y={center - 10}
                            textAnchor="middle"
                            className={`text-2xl font-bold ${modoOscuro ? 'fill-white' : 'fill-gray-800'}`}
                        >
                            {totalItems}
                        </text>
                        <text
                            x={center}
                            y={center + 15}
                            textAnchor="middle"
                            className={`text-sm ${modoOscuro ? 'fill-gray-400' : 'fill-gray-500'}`}
                        >
                            {tipo}
                        </text>
                    </svg>
                </div>

                {/* Legend */}
                <div className={`grid grid-cols-2 gap-2 max-h-60 overflow-y-auto ${isFullScreen ? 'text-base' : 'text-sm'}`}>
                    {sortedCountries.slice(0, 10).map(([country, count], index) => (
                        <div
                            key={country}
                            className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer hover:bg-opacity-20 ${modoOscuro ? 'hover:bg-white' : 'hover:bg-gray-500'}`}
                            onClick={() => setPaisSeleccionado(country)}
                        >
                            <div
                                className="w-3 h-3 rounded-full flex-shrink-0"
                                style={{ backgroundColor: pieColors[index % pieColors.length] }}
                            />
                            <span className={`truncate ${modoOscuro ? 'text-gray-300' : 'text-gray-700'}`}>
                                {country}
                            </span>
                            <span className={`font-semibold ${modoOscuro ? 'text-white' : 'text-gray-900'}`}>
                                {count}
                            </span>
                        </div>
                    ))}
                    {sortedCountries.length > 10 && (
                        <div className={`col-span-2 text-center ${modoOscuro ? 'text-gray-500' : 'text-gray-400'}`}>
                            +{sortedCountries.length - 10} más
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderMapContent = () => (
        <div className="relative w-full h-full">
            <ComposableMap
                projectionConfig={{
                    rotate: [-10, 0, 0],
                    scale: isFullScreen ? 200 : 240
                }}
                height={isFullScreen ? 500 : 600}
                width={isFullScreen ? 900 : 800}
                style={{ width: "100%", height: "100%" }}
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

            {tooltipContent && (
                <div className={`absolute top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg shadow-lg ${modoOscuro ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'
                    } border ${modoOscuro ? 'border-gray-600' : 'border-gray-200'} font-semibold z-10 pointer-events-none`}>
                    {tooltipContent}
                </div>
            )}

            <div className="absolute bottom-4 right-4 flex gap-2">
                <button onClick={handleZoomOut} className={`p-2 rounded-lg shadow-lg ${modoOscuro ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-white hover:bg-gray-100 text-gray-700'}`}>
                    <Minus size={20} />
                </button>
                <button onClick={handleReset} className={`p-2 rounded-lg shadow-lg ${modoOscuro ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-white hover:bg-gray-100 text-gray-700'}`}>
                    <RefreshCw size={20} />
                </button>
                <button onClick={handleZoomIn} className={`p-2 rounded-lg shadow-lg ${modoOscuro ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-white hover:bg-gray-100 text-gray-700'}`}>
                    <Plus size={20} />
                </button>
            </div>
        </div>
    );

    // Toggle button component
    const ViewToggle = () => (
        <div className={`flex rounded-lg p-1 ${modoOscuro ? 'bg-gray-700' : 'bg-gray-200'}`}>
            <button
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'map'
                    ? (tipo === 'monedas' ? 'bg-amber-500 text-white' : 'bg-green-500 text-white')
                    : (modoOscuro ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900')
                    }`}
            >
                <Map size={16} />
                <span className="hidden sm:inline">Mapa</span>
            </button>
            <button
                onClick={() => setViewMode('chart')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'chart'
                    ? (tipo === 'monedas' ? 'bg-amber-500 text-white' : 'bg-green-500 text-white')
                    : (modoOscuro ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900')
                    }`}
            >
                <PieChart size={16} />
                <span className="hidden sm:inline">Gráfica</span>
            </button>
        </div>
    );

    if (isFullScreen) {
        return (
            <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-fade-in">
                <div className={`w-full h-full max-w-7xl max-h-[90vh] rounded-2xl overflow-hidden relative ${modoOscuro ? 'bg-gray-800' : 'bg-white'}`}>
                    <div className="absolute top-4 left-4 z-10 flex items-center gap-4">
                        <h2 className={`text-2xl font-bold ${modoOscuro ? 'text-white' : 'text-gray-800'}`}>{titulo}</h2>
                        <ViewToggle />
                    </div>
                    <button
                        onClick={toggleFullScreen}
                        className={`absolute top-4 right-4 z-10 p-2 rounded-lg shadow-lg ${modoOscuro ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-white hover:bg-gray-100 text-gray-700'}`}
                    >
                        <X size={20} />
                    </button>
                    {viewMode === 'map' ? renderMapContent() : renderPieChart()}
                </div>
            </div>
        );
    }

    return (
        <div className={`${modoOscuro ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl p-6`}>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    {viewMode === 'map' ? (
                        <Map className={tipo === 'monedas' ? 'text-amber-500' : 'text-green-500'} size={32} />
                    ) : (
                        <PieChart className={tipo === 'monedas' ? 'text-amber-500' : 'text-green-500'} size={32} />
                    )}
                    <div>
                        <h2 className={`text-2xl font-bold ${modoOscuro ? 'text-white' : 'text-gray-800'}`}>{titulo}</h2>
                        <p className={modoOscuro ? 'text-gray-400' : 'text-gray-600'}>
                            {Object.keys(datos).length} países representados
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <ViewToggle />
                    {viewMode === 'map' && (
                        <button onClick={toggleFullScreen} className={`p-2 rounded-lg shadow-lg ${modoOscuro ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}>
                            <Map size={20} />
                        </button>
                    )}
                </div>
            </div>

            <div className={`rounded-xl overflow-hidden border relative ${modoOscuro ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-blue-50'}`} style={{ height: "300px" }}>
                {viewMode === 'map' ? renderMapContent() : renderPieChart()}
            </div>
        </div>
    );
};

export default MapaMundial;
