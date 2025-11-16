import { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";

interface PatternLockProps {
  onPatternSubmit: (pattern: number[]) => void;
  isLoading?: boolean;
  error?: string | null;
  onCancel?: () => void;
  gridSize?: number;
}

interface Point {
  x: number;
  y: number;
  index: number;
}

export default function PatternLock({
  onPatternSubmit,
  isLoading = false,
  error,
  onCancel,
  gridSize = 3,
}: PatternLockProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pattern, setPattern] = useState<number[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentX, setCurrentX] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [selectedPoints, setSelectedPoints] = useState<Point[]>([]);

  const dotRadius = 25;
  const canvasSize = gridSize * 120;
  const spacing = canvasSize / gridSize;
  const offsetX = spacing / 2;

  // Generate grid points
  const points: Point[] = [];
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      points.push({
        x: offsetX + i * spacing,
        y: offsetX + j * spacing,
        index: i * gridSize + j,
      });
    }
  }

  // Draw pattern
  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw dots
    points.forEach((point) => {
      ctx.fillStyle = selectedPoints.some((p) => p.index === point.index)
        ? "#FF6B6B"
        : "#E0E0E0";
      ctx.beginPath();
      ctx.arc(point.x, point.y, dotRadius, 0, 2 * Math.PI);
      ctx.fill();

      // Draw index number
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 12px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(
        point.index.toString(),
        point.x,
        point.y
      );
    });

    // Draw lines between selected points
    if (selectedPoints.length > 0) {
      ctx.strokeStyle = "#FF6B6B";
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      ctx.beginPath();
      ctx.moveTo(selectedPoints[0].x, selectedPoints[0].y);

      for (let i = 1; i < selectedPoints.length; i++) {
        ctx.lineTo(selectedPoints[i].x, selectedPoints[i].y);
      }

      // Draw line to current mouse position while drawing
      if (isDrawing) {
        ctx.lineTo(currentX, currentY);
      }

      ctx.stroke();
    }
  };

  useEffect(() => {
    draw();
  }, [selectedPoints, currentX, currentY, isDrawing]);

  const getPointAtCoordinates = (x: number, y: number): Point | undefined => {
    return points.find(
      (point) => Math.hypot(point.x - x, point.y - y) <= dotRadius
    );
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isLoading) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const point = getPointAtCoordinates(x, y);
    if (point && !selectedPoints.some((p) => p.index === point.index)) {
      const newPattern = [...pattern, point.index];
      const newSelected = [...selectedPoints, point];

      setPattern(newPattern);
      setSelectedPoints(newSelected);
      setIsDrawing(true);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setCurrentX(x);
    setCurrentY(y);

    // Snap to nearby points while drawing
    if (isDrawing) {
      const point = getPointAtCoordinates(x, y);
      if (
        point &&
        !selectedPoints.some((p) => p.index === point.index) &&
        pattern.length < gridSize * gridSize
      ) {
        const newPattern = [...pattern, point.index];
        const newSelected = [...selectedPoints, point];

        setPattern(newPattern);
        setSelectedPoints(newSelected);
      }
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);

    // Auto-submit if pattern has minimum length
    if (pattern.length >= 4) {
      setTimeout(() => {
        onPatternSubmit(pattern);
      }, 300);
    }
  };

  const handleReset = () => {
    setPattern([]);
    setSelectedPoints([]);
  };

  return (
    <div className="space-y-6">
      {/* Canvas */}
      <div className="flex justify-center bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
        <canvas
          ref={canvasRef}
          width={canvasSize}
          height={canvasSize}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="border-2 border-gray-200 dark:border-gray-700 rounded-lg cursor-crosshair"
        />
      </div>

      {/* Pattern Info */}
      <div className="text-center">
        <p className="text-sm font-semibold text-gray-900 dark:text-white">
          Pattern Points: {pattern.length}
        </p>
        {pattern.length < 4 && (
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Draw at least 4 points
          </p>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="text-center text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={() => onPatternSubmit(pattern)}
          disabled={isLoading || pattern.length < 4}
          className="w-full bg-primary hover:bg-primary/90 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white font-bold py-3 rounded-lg transition-colors disabled:cursor-not-allowed"
        >
          {isLoading ? "Verifying..." : "Confirm Pattern"}
        </button>

        <button
          onClick={handleReset}
          disabled={isLoading}
          className="w-full bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-semibold py-3 rounded-lg transition-colors disabled:cursor-not-allowed"
        >
          Clear
        </button>

        {onCancel && (
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="w-full bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:cursor-not-allowed"
          >
            <X className="w-5 h-5" />
            Cancel
          </button>
        )}
      </div>

      {/* Info Text */}
      <p className="text-center text-xs text-gray-600 dark:text-gray-400">
        Draw a pattern by connecting at least 4 dots
      </p>
    </div>
  );
}
