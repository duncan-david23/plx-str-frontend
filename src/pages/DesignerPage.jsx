// src/pages/TextDesigner.jsx
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Download, Type, Palette, Paintbrush, 
  Eraser, Undo, Redo, Trash2, 
  Circle, Square, Minus, RotateCw,
  Bold, Italic, Underline, AlignLeft,
  AlignCenter, AlignRight, Sparkles,
  Layers, Move, PenTool, Grid
} from 'lucide-react';

const TextDesigner = () => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [activeTool, setActiveTool] = useState('text');
  const [text, setText] = useState('DESIGN YOUR TEXT');
  const [fontSize, setFontSize] = useState(64);
  const [fontFamily, setFontFamily] = useState('Impact');
  const [fontColor, setFontColor] = useState('#3b82f6');
  const [backgroundColor, setBackgroundColor] = useState('transparent');
  const [textShadow, setTextShadow] = useState({ x: 2, y: 2, blur: 4, color: '#00000040' });
  const [textStroke, setTextStroke] = useState({ width: 0, color: '#ffffff' });
  const [position, setPosition] = useState({ x: 300, y: 250 });
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);
  const [fontWeight, setFontWeight] = useState('bold');
  const [fontStyle, setFontStyle] = useState('normal');
  const [textDecoration, setTextDecoration] = useState('none');
  const [textAlign, setTextAlign] = useState('center');
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [lineHeight, setLineHeight] = useState(1.2);
  const [opacity, setOpacity] = useState(1);
  const [gradient, setGradient] = useState({ enabled: false, colors: ['#3b82f6', '#1d4ed8'], angle: 90 });
  
  // Drawing tools
  const [drawingColor, setDrawingColor] = useState('#000000');
  const [drawingSize, setDrawingSize] = useState(5);
  const [brushType, setBrushType] = useState('round');
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawings, setDrawings] = useState([]);
  const [drawingHistory, setDrawingHistory] = useState([]);
  const [drawingHistoryIndex, setDrawingHistoryIndex] = useState(-1);
  const [currentDrawing, setCurrentDrawing] = useState([]);
  
  // Shapes
  const [shapes, setShapes] = useState([]);
  const [selectedShape, setSelectedShape] = useState(null);
  const [isDraggingShape, setIsDraggingShape] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDrawingShape, setIsDrawingShape] = useState(false);
  const [currentShapePoints, setCurrentShapePoints] = useState(null);
  
  // History for undo/redo
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Track if we're interacting with canvas
  const [isCanvasInteraction, setIsCanvasInteraction] = useState(false);

  // Fonts list
  const fonts = [
    'Impact',
    'Arial Black',
    'Helvetica',
    'Times New Roman',
    'Courier New',
    'Georgia',
    'Verdana',
    'Comic Sans MS',
    'Trebuchet MS',
    'Palatino',
    'Garamond',
    'Bookman',
    'Baskerville',
    'Calibri',
    'Cambria',
    'Century Gothic',
    'Consolas',
    'Futura',
    'Gill Sans',
    'Lucida Console',
    'Monaco',
    'Optima',
    'Segoe UI',
    'Tahoma',
    'Roboto',
    'Open Sans',
    'Lato',
    'Montserrat',
    'Oswald',
    'Raleway',
    'Playfair Display',
    'Merriweather',
    'Dancing Script',
    'Pacifico',
    'Caveat',
    'Great Vibes',
    'Satisfy'
  ];

  const gradients = [
    { name: 'Blue Ocean', colors: ['#3b82f6', '#1d4ed8'] },
    { name: 'Deep Blue', colors: ['#1e40af', '#0c4a6e'] },
    { name: 'Blue Gray', colors: ['#4b5563', '#1f2937'] },
    { name: 'Electric', colors: ['#3b82f6', '#8b5cf6'] },
    { name: 'Sky', colors: ['#0ea5e9', '#3b82f6'] },
    { name: 'Steel', colors: ['#94a3b8', '#475569'] },
    { name: 'Midnight', colors: ['#1e3a8a', '#000000'] },
    { name: 'Azure', colors: ['#1d4ed8', '#06b6d4'] }
  ];

  // Save to history
  const saveToHistory = () => {
    const state = {
      text, fontSize, fontFamily, fontColor, backgroundColor,
      textShadow, textStroke, position, rotation, scale,
      fontWeight, fontStyle, textDecoration, textAlign,
      letterSpacing, lineHeight, opacity, gradient,
      drawings: [...drawings], shapes: [...shapes]
    };
    
    const newHistory = [...history.slice(0, historyIndex + 1), state];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // Save drawing history
  const saveDrawingHistory = () => {
    const newHistory = [...drawingHistory.slice(0, drawingHistoryIndex + 1), [...drawings]];
    setDrawingHistory(newHistory);
    setDrawingHistoryIndex(drawingHistoryIndex + 1);
  };

  // Undo/Redo
  const handleUndo = () => {
    if (activeTool === 'draw' && drawingHistoryIndex > 0) {
      const prevState = drawingHistory[drawingHistoryIndex - 1];
      setDrawings(prevState);
      setDrawingHistoryIndex(drawingHistoryIndex - 1);
    } else if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      restoreState(prevState);
      setHistoryIndex(historyIndex - 1);
    }
  };

  const handleRedo = () => {
    if (activeTool === 'draw' && drawingHistoryIndex < drawingHistory.length - 1) {
      const nextState = drawingHistory[drawingHistoryIndex + 1];
      setDrawings(nextState);
      setDrawingHistoryIndex(drawingHistoryIndex + 1);
    } else if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      restoreState(nextState);
      setHistoryIndex(historyIndex + 1);
    }
  };

  const restoreState = (state) => {
    setText(state.text);
    setFontSize(state.fontSize);
    setFontFamily(state.fontFamily);
    setFontColor(state.fontColor);
    setBackgroundColor(state.backgroundColor);
    setTextShadow(state.textShadow);
    setTextStroke(state.textStroke);
    setPosition(state.position);
    setRotation(state.rotation);
    setScale(state.scale);
    setFontWeight(state.fontWeight);
    setFontStyle(state.fontStyle);
    setTextDecoration(state.textDecoration);
    setTextAlign(state.textAlign);
    setLetterSpacing(state.letterSpacing);
    setLineHeight(state.lineHeight);
    setOpacity(state.opacity);
    setGradient(state.gradient);
    setDrawings(state.drawings);
    setShapes(state.shapes);
  };

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const container = containerRef.current;
    if (!container) return;

    const resizeCanvas = () => {
      const containerWidth = container.clientWidth;
      const containerHeight = Math.min(container.clientHeight, 600);
      
      canvas.width = containerWidth;
      canvas.height = containerHeight;
      
      // Update position if canvas resizes
      if (position.x > containerWidth) {
        setPosition(prev => ({ ...prev, x: containerWidth / 2 }));
      }
      if (position.y > containerHeight) {
        setPosition(prev => ({ ...prev, y: containerHeight / 2 }));
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  // Check if point is inside shape
  const isPointInShape = (x, y, shape) => {
    if (shape.type === 'circle') {
      const dx = x - shape.x;
      const dy = y - shape.y;
      return dx * dx + dy * dy <= shape.radius * shape.radius;
    } else if (shape.type === 'square') {
      const halfSize = shape.size / 2;
      return x >= shape.x - halfSize && x <= shape.x + halfSize && 
             y >= shape.y - halfSize && y <= shape.y + halfSize;
    } else if (shape.type === 'line') {
      const distance = distanceToLine(x, y, shape.x1, shape.y1, shape.x2, shape.y2);
      return distance < 10;
    }
    return false;
  };

  const distanceToLine = (x, y, x1, y1, x2, y2) => {
    const A = x - x1;
    const B = y - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;
    if (lenSq !== 0) param = dot / lenSq;

    let xx, yy;
    if (param < 0) {
      xx = x1;
      yy = y1;
    } else if (param > 1) {
      xx = x2;
      yy = y2;
    } else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }

    const dx = x - xx;
    const dy = y - yy;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Mouse handlers
  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Only process if click is inside canvas
    if (x < 0 || x > canvas.width || y < 0 || y > canvas.height) return;
    
    setIsCanvasInteraction(true);
    
    if (activeTool === 'draw') {
      setIsDrawing(true);
      setCurrentDrawing([{ x, y }]);
    } else if (activeTool === 'eraser') {
      setIsDrawing(true);
      // Erase drawings near the click
      const newDrawings = drawings.filter(drawing => {
        return !drawing.points.some(point => {
          const dx = point.x - x;
          const dy = point.y - y;
          return Math.sqrt(dx * dx + dy * dy) < drawingSize * 2;
        });
      });
      if (newDrawings.length !== drawings.length) {
        setDrawings(newDrawings);
      }
      setCurrentDrawing([{ x, y }]);
    } else if (activeTool === 'text') {
      const ctx = canvas.getContext('2d');
      ctx.font = `${fontWeight} ${fontStyle} ${fontSize}px ${fontFamily}`;
      const textWidth = ctx.measureText(text).width * scale;
      const textHeight = fontSize * scale;
      const textLeft = position.x - textWidth / 2;
      const textTop = position.y - textHeight / 2;
      const textRight = position.x + textWidth / 2;
      const textBottom = position.y + textHeight / 2;
      
      if (x >= textLeft && x <= textRight && y >= textTop && y <= textBottom) {
        const dragState = {
          startX: x,
          startY: y,
          startPos: { ...position }
        };
        canvas.dataset.dragState = JSON.stringify(dragState);
      }
    } else if (activeTool === 'move') {
      for (let i = shapes.length - 1; i >= 0; i--) {
        const shape = shapes[i];
        if (isPointInShape(x, y, shape)) {
          setSelectedShape(i);
          setIsDraggingShape(true);
          setDragOffset({
            x: x - shape.x,
            y: y - shape.y
          });
          break;
        }
      }
    } else if (activeTool.startsWith('shape-')) {
      const shapeType = activeTool.replace('shape-', '');
      setIsDrawingShape(true);
      if (shapeType === 'line') {
        setCurrentShapePoints({ x1: x, y1: y, x2: x, y2: y });
      } else {
        setCurrentShapePoints({ x, y });
      }
    }
  };

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Only process if inside canvas
    if (x < 0 || x > canvas.width || y < 0 || y > canvas.height) {
      handleMouseUp();
      return;
    }
    
    if (activeTool === 'draw' && isDrawing) {
      setCurrentDrawing(prev => [...prev, { x, y }]);
    } else if (activeTool === 'eraser' && isDrawing) {
      const newDrawings = drawings.filter(drawing => {
        return !drawing.points.some(point => {
          const dx = point.x - x;
          const dy = point.y - y;
          return Math.sqrt(dx * dx + dy * dy) < drawingSize * 2;
        });
      });
      if (newDrawings.length !== drawings.length) {
        setDrawings(newDrawings);
      }
      setCurrentDrawing(prev => [...prev, { x, y }]);
    } else if (activeTool === 'text' && canvas.dataset.dragState) {
      const dragState = JSON.parse(canvas.dataset.dragState);
      const deltaX = x - dragState.startX;
      const deltaY = y - dragState.startY;
      
      setPosition({
        x: dragState.startPos.x + deltaX,
        y: dragState.startPos.y + deltaY
      });
    } else if (activeTool === 'move' && isDraggingShape && selectedShape !== null) {
      setShapes(prev => prev.map((shape, index) => 
        index === selectedShape 
          ? { ...shape, x: x - dragOffset.x, y: y - dragOffset.y }
          : shape
      ));
    } else if (isDrawingShape && currentShapePoints) {
      const shapeType = activeTool.replace('shape-', '');
      if (shapeType === 'circle') {
        const dx = x - currentShapePoints.x;
        const dy = y - currentShapePoints.y;
        const radius = Math.sqrt(dx * dx + dy * dy);
        setCurrentShapePoints({ ...currentShapePoints, radius });
      } else if (shapeType === 'square') {
        const dx = Math.abs(x - currentShapePoints.x);
        const dy = Math.abs(y - currentShapePoints.y);
        const size = Math.max(dx, dy) * 2;
        setCurrentShapePoints({ ...currentShapePoints, size });
      } else if (shapeType === 'line') {
        setCurrentShapePoints({ ...currentShapePoints, x2: x, y2: y });
      }
    }
  };

  const handleMouseUp = () => {
    const canvas = canvasRef.current;
    
    if (activeTool === 'draw' && isDrawing) {
      if (currentDrawing.length > 1) {
        const newDrawing = {
          id: Date.now(),
          color: drawingColor,
          size: drawingSize,
          brushType,
          points: [...currentDrawing]
        };
        setDrawings(prev => [...prev, newDrawing]);
        saveDrawingHistory();
      }
      setIsDrawing(false);
      setCurrentDrawing([]);
    } else if (activeTool === 'eraser' && isDrawing) {
      setIsDrawing(false);
      setCurrentDrawing([]);
      saveDrawingHistory();
    } else if (activeTool === 'text' && canvas?.dataset.dragState) {
      delete canvas.dataset.dragState;
      saveToHistory();
    } else if (activeTool === 'move' && isDraggingShape) {
      setIsDraggingShape(false);
      saveToHistory();
    } else if (isDrawingShape && currentShapePoints) {
      const shapeType = activeTool.replace('shape-', '');
      let newShape;
      
      if (shapeType === 'circle' && currentShapePoints.radius > 5) {
        newShape = {
          type: 'circle',
          x: currentShapePoints.x,
          y: currentShapePoints.y,
          radius: currentShapePoints.radius,
          color: drawingColor,
          borderColor: '#3b82f6',
          borderWidth: 2,
          fill: true
        };
      } else if (shapeType === 'square' && currentShapePoints.size > 10) {
        newShape = {
          type: 'square',
          x: currentShapePoints.x,
          y: currentShapePoints.y,
          size: currentShapePoints.size,
          color: drawingColor,
          borderColor: '#3b82f6',
          borderWidth: 2,
          fill: true
        };
      } else if (shapeType === 'line') {
        const dx = currentShapePoints.x2 - currentShapePoints.x1;
        const dy = currentShapePoints.y2 - currentShapePoints.y1;
        const length = Math.sqrt(dx * dx + dy * dy);
        if (length > 10) {
          newShape = {
            type: 'line',
            x1: currentShapePoints.x1,
            y1: currentShapePoints.y1,
            x2: currentShapePoints.x2,
            y2: currentShapePoints.y2,
            color: drawingColor,
            borderColor: drawingColor,
            borderWidth: 2
          };
        }
      }
      
      if (newShape) {
        setShapes(prev => [...prev, newShape]);
        setSelectedShape(shapes.length);
        saveToHistory();
      }
      
      setIsDrawingShape(false);
      setCurrentShapePoints(null);
    }
    
    setIsCanvasInteraction(false);
  };

  // Touch handlers - fixed to only prevent on canvas
  const handleTouchStart = (e) => {
    // Only prevent default if we're interacting with the canvas
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const touch = e.touches[0];
    if (!touch) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    // Check if touch is inside canvas area
    if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
      e.preventDefault();
      e.stopPropagation();
      handleMouseDown({ clientX: touch.clientX, clientY: touch.clientY });
    }
    // If touch is outside canvas, don't prevent default - allow normal scrolling
  };

  const handleTouchMove = (e) => {
    if (isCanvasInteraction) {
      e.preventDefault();
      e.stopPropagation();
      
      const touch = e.touches[0];
      if (!touch) return;
      
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const rect = canvas.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      
      // Only process if inside canvas area
      if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
        handleMouseMove({ clientX: touch.clientX, clientY: touch.clientY });
      } else {
        // If touch moves outside canvas, end the current action
        handleMouseUp();
      }
    }
    // If not canvas interaction, allow normal scrolling
  };

  const handleTouchEnd = (e) => {
    if (isCanvasInteraction) {
      e.preventDefault();
      e.stopPropagation();
      handleMouseUp();
    }
  };

  // Clear canvas
  const handleClearAll = () => {
    setDrawings([]);
    setShapes([]);
    setSelectedShape(null);
    setText('DESIGN YOUR TEXT');
    setFontSize(64);
    setFontFamily('Impact');
    setFontColor('#3b82f6');
    setBackgroundColor('transparent');
    setTextShadow({ x: 2, y: 2, blur: 4, color: '#00000040' });
    setTextStroke({ width: 0, color: '#ffffff' });
    setPosition({ x: 300, y: 250 });
    setRotation(0);
    setScale(1);
    setFontWeight('bold');
    setFontStyle('normal');
    setTextDecoration('none');
    setTextAlign('center');
    setLetterSpacing(0);
    setLineHeight(1.2);
    setOpacity(1);
    setGradient({ enabled: false, colors: ['#3b82f6', '#1d4ed8'], angle: 90 });
    setDrawingHistory([]);
    setDrawingHistoryIndex(-1);
    saveToHistory();
  };

  // Download design with transparent background
  const downloadDesign = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create a temporary canvas for export
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    
    // Clear with transparent background
    tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
    
    // Draw shapes
    shapes.forEach(shape => {
      tempCtx.save();
      tempCtx.fillStyle = shape.color;
      tempCtx.strokeStyle = shape.borderColor;
      tempCtx.lineWidth = shape.borderWidth;
      
      switch (shape.type) {
        case 'circle':
          tempCtx.beginPath();
          tempCtx.arc(shape.x, shape.y, shape.radius, 0, Math.PI * 2);
          if (shape.fill) tempCtx.fill();
          if (shape.borderWidth > 0) tempCtx.stroke();
          break;
        case 'square':
          if (shape.fill) {
            tempCtx.fillRect(shape.x - shape.size/2, shape.y - shape.size/2, shape.size, shape.size);
          }
          if (shape.borderWidth > 0) {
            tempCtx.strokeRect(shape.x - shape.size/2, shape.y - shape.size/2, shape.size, shape.size);
          }
          break;
        case 'line':
          tempCtx.beginPath();
          tempCtx.moveTo(shape.x1, shape.y1);
          tempCtx.lineTo(shape.x2, shape.y2);
          tempCtx.stroke();
          break;
      }
      tempCtx.restore();
    });

    // Draw freehand drawings
    drawings.forEach(drawing => {
      tempCtx.strokeStyle = drawing.color;
      tempCtx.lineWidth = drawing.size;
      tempCtx.lineCap = 'round';
      tempCtx.lineJoin = 'round';
      
      tempCtx.beginPath();
      drawing.points.forEach((point, index) => {
        if (index === 0) {
          tempCtx.moveTo(point.x, point.y);
        } else {
          tempCtx.lineTo(point.x, point.y);
        }
      });
      tempCtx.stroke();
    });

    // Draw text
    tempCtx.save();
    tempCtx.translate(position.x, position.y);
    tempCtx.rotate(rotation * Math.PI / 180);
    tempCtx.scale(scale, scale);
    tempCtx.globalAlpha = opacity;
    
    // Create gradient if enabled
    let fillStyle = fontColor;
    if (gradient.enabled) {
      const grad = tempCtx.createLinearGradient(
        -100, 0, 100, 0
      );
      gradient.colors.forEach((color, index) => {
        grad.addColorStop(index / (gradient.colors.length - 1), color);
      });
      fillStyle = grad;
    }
    
    // Apply text shadow
    if (textShadow.x !== 0 || textShadow.y !== 0) {
      tempCtx.shadowColor = textShadow.color;
      tempCtx.shadowBlur = textShadow.blur;
      tempCtx.shadowOffsetX = textShadow.x;
      tempCtx.shadowOffsetY = textShadow.y;
    }
    
    // Draw text stroke
    if (textStroke.width > 0) {
      tempCtx.strokeStyle = textStroke.color;
      tempCtx.lineWidth = textStroke.width;
      tempCtx.lineJoin = 'round';
      tempCtx.textBaseline = 'middle';
      tempCtx.textAlign = textAlign;
      tempCtx.font = `${fontWeight} ${fontStyle} ${fontSize}px ${fontFamily}`;
      tempCtx.letterSpacing = `${letterSpacing}px`;
      tempCtx.strokeText(text, 0, 0);
    }
    
    // Draw text fill
    tempCtx.fillStyle = fillStyle;
    tempCtx.textBaseline = 'middle';
    tempCtx.textAlign = textAlign;
    tempCtx.font = `${fontWeight} ${fontStyle} ${fontSize}px ${fontFamily}`;
    tempCtx.letterSpacing = `${letterSpacing}px`;
    tempCtx.fillText(text, 0, 0);
    
    // Apply text decoration
    if (textDecoration !== 'none') {
      const textWidth = tempCtx.measureText(text).width;
      tempCtx.strokeStyle = fillStyle;
      tempCtx.lineWidth = 2;
      tempCtx.beginPath();
      
      if (textDecoration === 'underline') {
        tempCtx.moveTo(-textWidth/2, fontSize/2 + 5);
        tempCtx.lineTo(textWidth/2, fontSize/2 + 5);
      } else if (textDecoration === 'line-through') {
        tempCtx.moveTo(-textWidth/2, 0);
        tempCtx.lineTo(textWidth/2, 0);
      } else if (textDecoration === 'overline') {
        tempCtx.moveTo(-textWidth/2, -fontSize/2 - 5);
        tempCtx.lineTo(textWidth/2, -fontSize/2 - 5);
      }
      tempCtx.stroke();
    }
    
    tempCtx.restore();

    // Download as PNG with transparent background
    const link = document.createElement('a');
    link.download = `plangex-design-${Date.now()}.png`;
    link.href = tempCanvas.toDataURL('image/png');
    link.click();
  };

  // Apply gradient preset
  const applyGradientPreset = (gradientPreset) => {
    setGradient({
      enabled: true,
      colors: gradientPreset.colors,
      angle: 90
    });
  };

  // Draw everything
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw dark gray background for better visibility
    if (backgroundColor === 'transparent') {
      // Draw dark gray background (for editor only, won't be in download)
      ctx.fillStyle = '#1f2937'; // Dark gray
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw subtle grid for better visibility
      const size = 20;
      ctx.strokeStyle = '#374151';
      ctx.lineWidth = 1;
      
      // Vertical lines
      for (let x = 0; x < canvas.width; x += size) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      
      // Horizontal lines
      for (let y = 0; y < canvas.height; y += size) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    } else {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Draw shapes
    shapes.forEach((shape, index) => {
      ctx.save();
      ctx.fillStyle = shape.color;
      ctx.strokeStyle = shape.borderColor;
      ctx.lineWidth = shape.borderWidth;
      
      switch (shape.type) {
        case 'circle':
          ctx.beginPath();
          ctx.arc(shape.x, shape.y, shape.radius, 0, Math.PI * 2);
          if (shape.fill) ctx.fill();
          if (shape.borderWidth > 0) ctx.stroke();
          break;
        case 'square':
          if (shape.fill) {
            ctx.fillRect(shape.x - shape.size/2, shape.y - shape.size/2, shape.size, shape.size);
          }
          if (shape.borderWidth > 0) {
            ctx.strokeRect(shape.x - shape.size/2, shape.y - shape.size/2, shape.size, shape.size);
          }
          break;
        case 'line':
          ctx.beginPath();
          ctx.moveTo(shape.x1, shape.y1);
          ctx.lineTo(shape.x2, shape.y2);
          ctx.stroke();
          break;
      }
      
      // Draw selection box if shape is selected and move tool is active
      if (index === selectedShape && activeTool === 'move') {
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        
        if (shape.type === 'circle') {
          ctx.strokeRect(
            shape.x - shape.radius - 5,
            shape.y - shape.radius - 5,
            shape.radius * 2 + 10,
            shape.radius * 2 + 10
          );
        } else if (shape.type === 'square') {
          ctx.strokeRect(
            shape.x - shape.size/2 - 5,
            shape.y - shape.size/2 - 5,
            shape.size + 10,
            shape.size + 10
          );
        } else if (shape.type === 'line') {
          const minX = Math.min(shape.x1, shape.x2);
          const maxX = Math.max(shape.x1, shape.x2);
          const minY = Math.min(shape.y1, shape.y2);
          const maxY = Math.max(shape.y1, shape.y2);
          ctx.strokeRect(minX - 5, minY - 5, maxX - minX + 10, maxY - minY + 10);
        }
        
        ctx.setLineDash([]);
      }
      
      ctx.restore();
    });

    // Draw current shape being drawn
    if (isDrawingShape && currentShapePoints) {
      ctx.save();
      const shapeType = activeTool.replace('shape-', '');
      ctx.strokeStyle = drawingColor;
      ctx.fillStyle = drawingColor + '80'; // Semi-transparent
      ctx.lineWidth = 2;
      
      if (shapeType === 'circle' && currentShapePoints.radius) {
        ctx.beginPath();
        ctx.arc(currentShapePoints.x, currentShapePoints.y, currentShapePoints.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else if (shapeType === 'square' && currentShapePoints.size) {
        const halfSize = currentShapePoints.size / 2;
        ctx.fillRect(currentShapePoints.x - halfSize, currentShapePoints.y - halfSize, currentShapePoints.size, currentShapePoints.size);
        ctx.strokeRect(currentShapePoints.x - halfSize, currentShapePoints.y - halfSize, currentShapePoints.size, currentShapePoints.size);
      } else if (shapeType === 'line' && currentShapePoints.x2 && currentShapePoints.y2) {
        ctx.beginPath();
        ctx.moveTo(currentShapePoints.x1, currentShapePoints.y1);
        ctx.lineTo(currentShapePoints.x2, currentShapePoints.y2);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Draw freehand drawings
    drawings.forEach(drawing => {
      ctx.strokeStyle = drawing.color;
      ctx.lineWidth = drawing.size;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      ctx.beginPath();
      drawing.points.forEach((point, index) => {
        if (index === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      });
      ctx.stroke();
    });

    // Draw current drawing
    if (currentDrawing.length > 0) {
      ctx.strokeStyle = activeTool === 'eraser' ? '#ffffff' : drawingColor;
      ctx.lineWidth = drawingSize;
      ctx.lineCap = brushType === 'round' ? 'round' : 'square';
      ctx.lineJoin = 'round';
      
      ctx.beginPath();
      currentDrawing.forEach((point, index) => {
        if (index === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      });
      ctx.stroke();
    }

    // Draw text
    ctx.save();
    ctx.translate(position.x, position.y);
    ctx.rotate(rotation * Math.PI / 180);
    ctx.scale(scale, scale);
    ctx.globalAlpha = opacity;
    
    // Create gradient if enabled
    let fillStyle = fontColor;
    if (gradient.enabled) {
      const grad = ctx.createLinearGradient(
        -100, 0, 100, 0
      );
      gradient.colors.forEach((color, index) => {
        grad.addColorStop(index / (gradient.colors.length - 1), color);
      });
      fillStyle = grad;
    }
    
    // Apply text shadow
    if (textShadow.x !== 0 || textShadow.y !== 0) {
      ctx.shadowColor = textShadow.color;
      ctx.shadowBlur = textShadow.blur;
      ctx.shadowOffsetX = textShadow.x;
      ctx.shadowOffsetY = textShadow.y;
    }
    
    // Draw text stroke
    if (textStroke.width > 0) {
      ctx.strokeStyle = textStroke.color;
      ctx.lineWidth = textStroke.width;
      ctx.lineJoin = 'round';
      ctx.textBaseline = 'middle';
      ctx.textAlign = textAlign;
      ctx.font = `${fontWeight} ${fontStyle} ${fontSize}px ${fontFamily}`;
      ctx.letterSpacing = `${letterSpacing}px`;
      ctx.strokeText(text, 0, 0);
    }
    
    // Draw text fill
    ctx.fillStyle = fillStyle;
    ctx.textBaseline = 'middle';
    ctx.textAlign = textAlign;
    ctx.font = `${fontWeight} ${fontStyle} ${fontSize}px ${fontFamily}`;
    ctx.letterSpacing = `${letterSpacing}px`;
    ctx.fillText(text, 0, 0);
    
    // Apply text decoration
    if (textDecoration !== 'none') {
      const textWidth = ctx.measureText(text).width;
      ctx.strokeStyle = fillStyle;
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      if (textDecoration === 'underline') {
        ctx.moveTo(-textWidth/2, fontSize/2 + 5);
        ctx.lineTo(textWidth/2, fontSize/2 + 5);
      } else if (textDecoration === 'line-through') {
        ctx.moveTo(-textWidth/2, 0);
        ctx.lineTo(textWidth/2, 0);
      } else if (textDecoration === 'overline') {
        ctx.moveTo(-textWidth/2, -fontSize/2 - 5);
        ctx.lineTo(textWidth/2, -fontSize/2 - 5);
      }
      ctx.stroke();
    }
    
    ctx.restore();
  }, [
    text, fontSize, fontFamily, fontColor, backgroundColor,
    textShadow, textStroke, position, rotation, scale,
    fontWeight, fontStyle, textDecoration, textAlign,
    letterSpacing, lineHeight, opacity, gradient,
    drawings, shapes, currentDrawing, activeTool,
    drawingColor, drawingSize, brushType, selectedShape,
    isDrawingShape, currentShapePoints
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white py-4 md:py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-2 md:mb-4 text-white">
            Plangex Designing Tool
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto text-sm md:text-base">
            Create stunning text designs with advanced tools. Download as PNG with transparent background.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Left Panel - Tools */}
          <div className="lg:col-span-1 space-y-4">
            {/* Tools Navigation */}
            <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-gray-700 shadow-lg">
              <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4 text-white flex items-center gap-2">
                <Layers size={18} className="text-blue-400" />
                Design Tools
              </h3>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'text', icon: <Type size={16} />, label: 'Text' },
                  { id: 'draw', icon: <Paintbrush size={16} />, label: 'Draw' },
                  { id: 'eraser', icon: <Eraser size={16} />, label: 'Erase' },
                  { id: 'move', icon: <Move size={16} />, label: 'Move' },
                  { id: 'shape-circle', icon: <Circle size={16} />, label: 'Circle' },
                  { id: 'shape-square', icon: <Square size={16} />, label: 'Square' },
                  { id: 'shape-line', icon: <Minus size={16} />, label: 'Line' },
                  { id: 'color', icon: <Palette size={16} />, label: 'Color' }
                ].map(tool => (
                  <button
                    key={tool.id}
                    onClick={() => {
                      setActiveTool(tool.id);
                      if (tool.id !== 'move') setSelectedShape(null);
                      setIsDrawingShape(false);
                      setCurrentShapePoints(null);
                    }}
                    className={`p-2 md:p-3 rounded-lg flex flex-col items-center justify-center transition-all duration-200 ${
                      activeTool === tool.id 
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md scale-105' 
                        : 'bg-gray-700/50 hover:bg-gray-700 text-gray-300 hover:text-white'
                    }`}
                  >
                    {tool.icon}
                    <span className="text-xs mt-1">{tool.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Text Controls */}
            {activeTool === 'text' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-gray-700 shadow-lg space-y-3 md:space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-base md:text-lg font-semibold text-white flex items-center gap-2">
                    <Type size={18} className="text-blue-400" />
                    Text Settings
                  </h3>
                  <div className="flex gap-1 md:gap-2">
                    <button
                      onClick={() => setFontWeight(fontWeight === 'bold' ? 'normal' : 'bold')}
                      className={`p-1 md:p-2 rounded ${fontWeight === 'bold' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'}`}
                      title="Bold"
                    >
                      <Bold size={14} />
                    </button>
                    <button
                      onClick={() => setFontStyle(fontStyle === 'italic' ? 'normal' : 'italic')}
                      className={`p-1 md:p-2 rounded ${fontStyle === 'italic' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'}`}
                      title="Italic"
                    >
                      <Italic size={14} />
                    </button>
                    <button
                      onClick={() => setTextDecoration(textDecoration === 'underline' ? 'none' : 'underline')}
                      className={`p-1 md:p-2 rounded ${textDecoration === 'underline' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'}`}
                      title="Underline"
                    >
                      <Underline size={14} />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Text Content
                  </label>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="w-full p-2 text-sm md:text-base bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                    rows="2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Font Family
                  </label>
                  <select
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value)}
                    className="w-full p-2 text-sm md:text-base bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                    style={{ fontFamily }}
                    // Allow normal scrolling on mobile for dropdowns
                    onTouchStart={(e) => e.stopPropagation()}
                    onTouchMove={(e) => e.stopPropagation()}
                  >
                    {fonts.map(font => (
                      <option key={font} value={font} className="bg-gray-900 text-white">
                        {font}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Size: {fontSize}px
                    </label>
                    <input
                      type="range"
                      min="12"
                      max="200"
                      value={fontSize}
                      onChange={(e) => setFontSize(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Spacing
                    </label>
                    <input
                      type="range"
                      min="-5"
                      max="20"
                      value={letterSpacing}
                      onChange={(e) => setLetterSpacing(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Rotation: {rotation}°
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={rotation}
                      onChange={(e) => setRotation(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Scale: {scale.toFixed(1)}x
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="3"
                      step="0.1"
                      value={scale}
                      onChange={(e) => setScale(parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Text Align
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setTextAlign('left')}
                      className={`p-2 rounded flex-1 ${textAlign === 'left' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'}`}
                    >
                      <AlignLeft size={14} />
                    </button>
                    <button
                      onClick={() => setTextAlign('center')}
                      className={`p-2 rounded flex-1 ${textAlign === 'center' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'}`}
                    >
                      <AlignCenter size={14} />
                    </button>
                    <button
                      onClick={() => setTextAlign('right')}
                      className={`p-2 rounded flex-1 ${textAlign === 'right' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'}`}
                    >
                      <AlignRight size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Drawing Tools */}
            {(activeTool === 'draw' || activeTool === 'eraser') && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-gray-700 shadow-lg space-y-3 md:space-y-4"
              >
                <h3 className="text-base md:text-lg font-semibold text-white flex items-center gap-2">
                  {activeTool === 'draw' ? <Paintbrush size={18} className="text-blue-400" /> : <Eraser size={18} className="text-blue-400" />}
                  {activeTool === 'draw' ? 'Drawing Tools' : 'Eraser Tools'}
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    {activeTool === 'draw' ? 'Brush Color' : 'Eraser Size'}
                  </label>
                  {activeTool === 'draw' ? (
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={drawingColor}
                        onChange={(e) => setDrawingColor(e.target.value)}
                        className="w-8 h-8 md:w-10 md:h-10 cursor-pointer rounded border border-gray-600"
                      />
                      <input
                        type="text"
                        value={drawingColor}
                        onChange={(e) => setDrawingColor(e.target.value)}
                        className="flex-1 p-2 text-sm bg-gray-900 border border-gray-600 rounded-lg text-white"
                      />
                    </div>
                  ) : (
                    <div>
                      <input
                        type="range"
                        min="5"
                        max="50"
                        value={drawingSize}
                        onChange={(e) => setDrawingSize(parseInt(e.target.value))}
                        className="w-full"
                      />
                      <div className="text-center text-sm text-gray-400 mt-1">{drawingSize}px</div>
                    </div>
                  )}
                </div>

                {activeTool === 'draw' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Brush Size: {drawingSize}px
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="30"
                      value={drawingSize}
                      onChange={(e) => setDrawingSize(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                )}

                {activeTool === 'draw' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Brush Type
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setBrushType('round')}
                        className={`p-2 rounded flex-1 ${brushType === 'round' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'}`}
                      >
                        Round
                      </button>
                      <button
                        onClick={() => setBrushType('square')}
                        className={`p-2 rounded flex-1 ${brushType === 'square' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'}`}
                      >
                        Square
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Color & Effects */}
            {activeTool === 'color' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-gray-700 shadow-lg space-y-3 md:space-y-4"
              >
                <h3 className="text-base md:text-lg font-semibold text-white flex items-center gap-2">
                  <Palette size={18} className="text-blue-400" />
                  Color & Effects
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Text Color
                  </label>
                  <input
                    type="color"
                    value={fontColor}
                    onChange={(e) => setFontColor(e.target.value)}
                    className="w-full h-10 md:h-12 cursor-pointer rounded border border-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1 flex items-center gap-2">
                    <Sparkles size={14} className="text-blue-400" />
                    Gradient Presets
                  </label>
                  <div className="grid grid-cols-4 gap-1 md:gap-2">
                    {gradients.map((grad, index) => (
                      <button
                        key={index}
                        onClick={() => applyGradientPreset(grad)}
                        className="h-6 md:h-8 rounded overflow-hidden relative group"
                        title={grad.name}
                      >
                        <div
                          className="absolute inset-0"
                          style={{
                            background: `linear-gradient(90deg, ${grad.colors.join(', ')})`
                          }}
                        />
                        <span className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] md:text-xs flex items-center justify-center text-white">
                          {grad.name.split(' ')[0]}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Text Shadow
                  </label>
                  <div className="space-y-1 md:space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs w-6 text-gray-400">X:</span>
                      <input
                        type="range"
                        min="-20"
                        max="20"
                        value={textShadow.x}
                        onChange={(e) => setTextShadow(prev => ({ ...prev, x: parseInt(e.target.value) }))}
                        className="flex-1"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs w-6 text-gray-400">Y:</span>
                      <input
                        type="range"
                        min="-20"
                        max="20"
                        value={textShadow.y}
                        onChange={(e) => setTextShadow(prev => ({ ...prev, y: parseInt(e.target.value) }))}
                        className="flex-1"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs w-6 text-gray-400">Blur:</span>
                      <input
                        type="range"
                        min="0"
                        max="20"
                        value={textShadow.blur}
                        onChange={(e) => setTextShadow(prev => ({ ...prev, blur: parseInt(e.target.value) }))}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Opacity: {opacity.toFixed(1)}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={opacity}
                    onChange={(e) => setOpacity(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
              </motion.div>
            )}
          </div>

          {/* Center Panel - Canvas */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg p-3 md:p-4 border border-gray-700">
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <h3 className="text-base md:text-lg font-semibold text-white flex items-center gap-2">
                  <Grid size={18} className="text-blue-400" />
                  Design Canvas
                </h3>
                <div className="text-xs md:text-sm text-gray-400 text-right">
                  {activeTool === 'text' ? 'Click and drag text to move' : 
                   activeTool === 'draw' ? 'Click and drag to draw' :
                   activeTool === 'eraser' ? 'Click and drag to erase' :
                   activeTool === 'move' ? 'Click and drag shapes to move' :
                   activeTool.startsWith('shape-') ? 'Click and drag to create shape' :
                   'Select a tool to start designing'}
                </div>
              </div>
              
              <div 
                ref={containerRef}
                className="relative bg-gray-900 rounded-lg border-2 border-gray-700 overflow-hidden"
                style={{ height: '400px', minHeight: '400px' }}
              >
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  style={{ 
                    cursor: 
                      activeTool === 'text' ? 'move' :
                      activeTool === 'draw' ? 'crosshair' :
                      activeTool === 'eraser' ? 'crosshair' :
                      activeTool === 'move' ? 'move' :
                      activeTool.startsWith('shape-') ? 'crosshair' : 'default',
                    touchAction: 'none'
                  }}
                />
                
                <div className="absolute bottom-2 left-2 text-xs text-gray-400">
                  Dark gray background for editing • Download has transparent background
                </div>
              </div>
            </div>

            {/* Action Buttons - Mobile Optimized */}
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
              <button
                onClick={handleUndo}
                disabled={(activeTool === 'draw' ? drawingHistoryIndex <= 0 : historyIndex <= 0)}
                className="bg-gray-700 hover:bg-gray-600 text-white py-2 md:py-3 px-3 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 md:gap-2 text-sm md:text-base"
              >
                <Undo size={16} />
                <span className="hidden sm:inline">Undo</span>
              </button>
              
              <button
                onClick={handleRedo}
                disabled={(activeTool === 'draw' ? drawingHistoryIndex >= drawingHistory.length - 1 : historyIndex >= history.length - 1)}
                className="bg-gray-700 hover:bg-gray-600 text-white py-2 md:py-3 px-3 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 md:gap-2 text-sm md:text-base"
              >
                <Redo size={16} />
                <span className="hidden sm:inline">Redo</span>
              </button>
              
              <button
                onClick={handleClearAll}
                className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white py-2 md:py-3 px-3 rounded-lg font-medium transition-all flex items-center justify-center gap-1 md:gap-2 text-sm md:text-base"
              >
                <Trash2 size={16} />
                <span className="hidden sm:inline">Clear All</span>
              </button>
              
              <button
                onClick={downloadDesign}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-2 md:py-3 px-3 rounded-lg font-medium transition-all flex items-center justify-center gap-1 md:gap-2 text-sm md:text-base shadow-sm hover:shadow"
              >
                <Download size={16} />
                Download PNG
              </button>
            </div>

            {/* Quick Tips - Light Gray Text */}
            <div className="mt-4 md:mt-6 bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-xl p-3 md:p-4">
              <h4 className="text-sm md:text-base font-semibold text-gray-300 mb-2 flex items-center gap-2">
                <PenTool size={16} className="text-gray-400" />
                Quick Tips
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs md:text-sm text-gray-400">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-gray-500 rounded-full mt-1"></div>
                  <span><strong className="text-gray-300">Text Tool:</strong> Click & drag to position text</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-gray-500 rounded-full mt-1"></div>
                  <span><strong className="text-gray-300">Move Tool:</strong> Click shapes to select & drag</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-gray-500 rounded-full mt-1"></div>
                  <span><strong className="text-gray-300">Eraser Tool:</strong> Click & drag to erase drawings</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-gray-500 rounded-full mt-1"></div>
                  <span><strong className="text-gray-300">Download:</strong> Transparent PNG for printing</span>
                </div>
                <div className="flex items-start gap-2 md:col-span-2">
                  <div className="w-1.5 h-1.5 bg-gray-500 rounded-full mt-1"></div>
                  <span><strong className="text-gray-300">Shapes:</strong> Click, drag, release to create shape</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Presets & Info */}
          <div className="lg:col-span-1 space-y-4">
            {/* Color Presets */}
            <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-gray-700 shadow-lg">
              <h3 className="text-base md:text-lg font-semibold mb-3 text-white">Color Presets</h3>
              <div className="grid grid-cols-6 gap-1 md:gap-2">
                {['#3b82f6', '#1d4ed8', '#4b5563', '#1f2937', '#000000', '#ffffff', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'].map(color => (
                  <button
                    key={color}
                    onClick={() => setFontColor(color)}
                    className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-gray-600 hover:scale-110 transition-transform shadow-sm"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>

            {/* Background Options */}
            <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-gray-700 shadow-lg">
              <h3 className="text-base md:text-lg font-semibold mb-3 text-white">Background</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setBackgroundColor('transparent')}
                  className={`w-full p-2 rounded-lg text-left ${backgroundColor === 'transparent' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'}`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 border border-gray-500" style={{
                      backgroundImage: `linear-gradient(45deg, #374151 25%, transparent 25%), 
                                       linear-gradient(-45deg, #374151 25%, transparent 25%), 
                                       linear-gradient(45deg, transparent 75%, #374151 75%), 
                                       linear-gradient(-45deg, transparent 75%, #374151 75%)`,
                      backgroundSize: '20px 20px',
                      backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                    }}></div>
                    <span className="text-sm">Transparent</span>
                  </div>
                </button>
                {['#1f2937', '#111827', '#000000', '#374151'].map(color => (
                  <button
                    key={color}
                    onClick={() => setBackgroundColor(color)}
                    className={`w-full p-2 rounded-lg text-left ${backgroundColor === color ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'}`}
                  >
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-6 h-6 rounded border border-gray-600"
                        style={{ backgroundColor: color }}
                      ></div>
                      <span className="text-sm">{color === '#1f2937' ? 'Dark Gray' : 
                             color === '#111827' ? 'Very Dark Gray' : 
                             color === '#000000' ? 'Black' : 'Medium Gray'}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Design Stats */}
            <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-gray-700 shadow-lg">
              <h3 className="text-base md:text-lg font-semibold mb-3 text-white">Design Stats</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Text Length</span>
                  <span className="font-semibold text-blue-400">{text.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Font Size</span>
                  <span className="font-semibold text-blue-400">{fontSize}px</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Drawings</span>
                  <span className="font-semibold text-blue-400">{drawings.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Shapes</span>
                  <span className="font-semibold text-blue-400">{shapes.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Rotation</span>
                  <span className="font-semibold text-blue-400">{rotation}°</span>
                </div>
              </div>
            </div>

            {/* Export Info */}
            <div className="bg-gradient-to-r from-blue-900/30 to-blue-800/30 border border-blue-700/50 rounded-xl p-3 md:p-4">
              <h4 className="text-sm md:text-base font-semibold text-blue-300 mb-2">
                Export Ready
              </h4>
              <p className="text-xs md:text-sm text-blue-200">
                Downloads as <strong>PNG with transparent background</strong>
              </p>
              <ul className="text-xs text-blue-300 mt-2 space-y-1">
                <li>• Perfect for printing</li>
                <li>• Social media ready</li>
                <li>• High quality</li>
                <li>• No background included</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextDesigner;