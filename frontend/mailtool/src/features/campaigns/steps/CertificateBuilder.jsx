import React, { useState, useRef, useEffect } from 'react';
import Draggable from 'react-draggable';
import { Upload, Type, X, Save, ZoomIn, ZoomOut } from 'lucide-react';

// --- SUB-COMPONENT: Draggable Item ---
const DraggableItem = ({ field, scale, onDrag, onUpdateStyle, onRemove }) => {
  const nodeRef = useRef(null);

  return (
    <Draggable
      nodeRef={nodeRef}
      defaultPosition={{ x: field.x * scale, y: field.y * scale }}
      onStop={(e, data) => {
        onDrag(field.id, {
          x: data.x / scale,
          y: data.y / scale
        });
      }}
      scale={1}
    >
      <div 
        ref={nodeRef}
        className="absolute cursor-move group"
        style={{ 
          fontSize: `${field.fontSize * scale}px`, 
          color: field.color,
          lineHeight: 1,
          margin: 0,
          padding: 0
        }}
      >
        <div className="inline-flex items-center gap-1 bg-white/95 px-2 py-1 rounded shadow-lg border-2 border-blue-400 whitespace-nowrap hover:border-blue-600 transition-colors"
             style={{ transform: 'translate(-50%, -50%)' }}>
           <span className="font-mono font-bold select-none" style={{ lineHeight: 1 }}>{field.text}</span>
           
           <div 
             className="hidden group-hover:flex items-center gap-2 ml-2 border-l pl-2 border-gray-300"
             onMouseDown={(e) => e.stopPropagation()} 
           >
              <input 
                  type="number" 
                  className="w-12 text-xs border rounded p-1 text-black bg-white" 
                  value={field.fontSize}
                  onChange={(e) => onUpdateStyle(field.id, 'fontSize', Math.max(8, parseInt(e.target.value) || 12))}
                  onMouseDown={(e) => e.stopPropagation()}
                  min="8"
                  max="200"
              />
               <input 
                  type="color" 
                  className="w-6 h-6 p-0 border-0 rounded cursor-pointer" 
                  value={field.color}
                  onChange={(e) => onUpdateStyle(field.id, 'color', e.target.value)}
                  onMouseDown={(e) => e.stopPropagation()}
              />
              <button 
                  onClick={() => onRemove(field.id)}
                  className="text-red-500 hover:bg-red-50 rounded p-1 transition-colors"
                  onMouseDown={(e) => e.stopPropagation()}
              >
                  <X size={14} />
              </button>
           </div>
        </div>
      </div>
    </Draggable>
  );
};

// --- MAIN COMPONENT ---
const CertificateBuilder = ({ onSave, onBack, availableVariables = [] }) => {
  const [bgImage, setBgImage] = useState(null);
  const [fields, setFields] = useState([]);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageNaturalSize, setImageNaturalSize] = useState({ width: 0, height: 0 });
  const [scale, setScale] = useState(1);
  const [maxCanvasWidth, setMaxCanvasWidth] = useState(1000);
  
  // Prepare variables with curly braces for display
  const variableButtons = availableVariables.length > 0 
    ? availableVariables.map(v => `{{${v}}}`)
    : ['{{firstName}}', '{{lastName}}', '{{email}}', '{{company}}']; // fallback
  
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // Calculate optimal scale based on available space
  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current && imageNaturalSize.width > 0) {
        const containerWidth = containerRef.current.clientWidth - 64; // padding
        const containerHeight = containerRef.current.clientHeight - 64;
        
        const scaleWidth = containerWidth / imageNaturalSize.width;
        const scaleHeight = containerHeight / imageNaturalSize.height;
        
        const optimalScale = Math.min(scaleWidth, scaleHeight, 1.5);
        setScale(optimalScale);
        setMaxCanvasWidth(containerWidth);
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [imageNaturalSize]);
  
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setBgImage(event.target.result);
        setImageLoaded(false);
        setFields([]);
      };
      reader.readAsDataURL(file);
    }
  };

  const onImgLoad = ({ target: img }) => {
    setImageNaturalSize({ 
      width: img.naturalWidth, 
      height: img.naturalHeight 
    });
    setImageLoaded(true);
  };

  const addField = (variableName) => {
    const newField = {
      id: Date.now(),
      text: variableName,
      x: 50,
      y: 50,
      fontSize: 24,
      color: '#000000'
    };
    setFields([...fields, newField]);
  };

  const handleDrag = (id, position) => {
    const clampedX = Math.max(0, Math.min(position.x, imageNaturalSize.width - 50));
    const clampedY = Math.max(0, Math.min(position.y, imageNaturalSize.height - 20));
    
    setFields(prev => prev.map(f => 
      f.id === id ? { ...f, x: clampedX, y: clampedY } : f
    ));
  };

  const updateFieldStyle = (id, key, value) => {
    setFields(prev => prev.map(f => f.id === id ? { ...f, [key]: value } : f));
  };

  const removeField = (id) => setFields(prev => prev.filter(f => f.id !== id));

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.1, 0.3));

  const canvasWidth = imageNaturalSize.width * scale;
  const canvasHeight = imageNaturalSize.height * scale;

  return (
    <div className="flex flex-col lg:flex-row h-screen border-t bg-gray-50">
      
      {/* Sidebar Controls */}
      <div className="w-full lg:w-80 bg-white border-r p-6 flex flex-col shadow-lg overflow-y-auto">
        <h3 className="font-bold text-gray-800 mb-6 text-xl flex items-center gap-2">
          <Type size={20} />
          Certificate Builder
        </h3>
        
        {/* Upload */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wide">
            1. Upload Template
          </label>
          <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition-all group">
            <Upload size={28} className="text-gray-400 mb-2 group-hover:text-blue-500 transition-colors" />
            <p className="text-sm text-gray-600 font-medium">Click to upload</p>
            <p className="text-xs text-gray-400 mt-1">Any image size supported</p>
            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
          </label>
          {imageLoaded && (
            <div className="mt-3 text-xs text-gray-500 bg-gray-50 p-2 rounded">
              <div className="font-mono">Original: {imageNaturalSize.width} × {imageNaturalSize.height}px</div>
              <div className="font-mono">Scale: {(scale * 100).toFixed(0)}%</div>
            </div>
          )}
        </div>

        {/* Zoom Controls */}
        {imageLoaded && (
          <div className="mb-6">
            <label className="block text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wide">
              Zoom
            </label>
            <div className="flex gap-2">
              <button
                onClick={handleZoomOut}
                className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <ZoomOut size={16} />
                <span className="text-sm font-medium">Out</span>
              </button>
              <button
                onClick={handleZoomIn}
                className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <ZoomIn size={16} />
                <span className="text-sm font-medium">In</span>
              </button>
            </div>
          </div>
        )}

        {/* Variables */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wide">
            2. Add Variables
          </label>
          <div className="grid grid-cols-2 gap-2">
            {variableButtons.map(v => (
              <button 
                key={v}
                onClick={() => addField(v)}
                disabled={!imageLoaded}
                className={`flex items-center justify-center gap-2 px-3 py-2.5 border rounded-lg text-xs font-semibold transition-all ${
                  imageLoaded 
                    ? 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 text-blue-700 hover:from-blue-100 hover:to-blue-200 hover:shadow-md' 
                    : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Type size={12} /> {v.replace(/{{|}}/g, '')}
              </button>
            ))}
          </div>
        </div>

        {/* Fields List */}
        {fields.length > 0 && (
          <div className="mb-6">
            <label className="block text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wide">
              Active Fields ({fields.length})
            </label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {fields.map(f => (
                <div key={f.id} className="text-xs bg-gray-50 p-2 rounded flex justify-between items-center">
                  <span className="font-mono font-medium">{f.text}</span>
                  <span className="text-gray-400">{f.fontSize}px</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <button 
            onClick={() => onSave({ 
              bgImage, 
              fields,
              imageSize: imageNaturalSize
            })}
            disabled={!bgImage || fields.length === 0}
            className={`mt-auto w-full py-3 rounded-lg flex justify-center items-center gap-2 font-bold shadow-md transition-all ${
                bgImage && fields.length > 0
                  ? 'bg-gradient-to-r from-green-600 to-green-500 text-white hover:from-green-700 hover:to-green-600' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
        >
            <Save size={18} /> Save Template
        </button>
      </div>

      {/* Canvas Area */}
      <div 
        ref={containerRef}
        className="flex-1 bg-gradient-to-br from-gray-100 to-gray-200 overflow-auto flex items-center justify-center p-4"
      >
        {!bgImage ? (
          <div className="text-center text-gray-400">
            <Upload size={48} className="mx-auto mb-4 opacity-40" />
            <p className="text-lg font-medium">Upload a certificate template to begin</p>
            <p className="text-sm mt-2 opacity-75">Supports any image size and format</p>
          </div>
        ) : (
          <div 
            ref={canvasRef}
            className="relative shadow-2xl bg-white overflow-hidden"
            style={{ 
              width: `${canvasWidth}px`, 
              height: `${canvasHeight}px`
            }} 
          >
            <img 
                src={bgImage} 
                alt="Certificate Template" 
                onLoad={onImgLoad}
                className="block w-full h-full pointer-events-none select-none" 
                draggable={false}
                style={{ userSelect: 'none' }}
            />

            <div className="absolute inset-0 pointer-events-none">
              {imageLoaded && fields.map((field) => (
                <div key={field.id} className="pointer-events-auto">
                  <DraggableItem 
                    field={field}
                    scale={scale}
                    onDrag={handleDrag}
                    onUpdateStyle={updateFieldStyle}
                    onRemove={removeField}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CertificateBuilder;