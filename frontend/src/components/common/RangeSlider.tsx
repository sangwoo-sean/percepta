import React, { useCallback, useEffect, useRef, useState } from 'react';

interface RangeSliderProps {
  label?: string;
  min: number;
  max: number;
  step?: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  labels?: string[];
}

export const RangeSlider: React.FC<RangeSliderProps> = ({
  label,
  min,
  max,
  step = 1,
  value,
  onChange,
  labels,
}) => {
  const [minVal, maxVal] = value;
  const range = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState<'min' | 'max' | null>(null);

  const getPercent = useCallback(
    (val: number) => Math.round(((val - min) / (max - min)) * 100),
    [min, max]
  );

  useEffect(() => {
    const minPercent = getPercent(minVal);
    const maxPercent = getPercent(maxVal);

    if (range.current) {
      range.current.style.left = `${minPercent}%`;
      range.current.style.width = `${maxPercent - minPercent}%`;
    }
  }, [minVal, maxVal, getPercent]);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMin = Math.min(Number(e.target.value), maxVal);
    onChange([newMin, maxVal]);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMax = Math.max(Number(e.target.value), minVal);
    onChange([minVal, newMax]);
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-3">
          {label}
        </label>
      )}

      <div className="relative h-2 mb-6">
        <div className="absolute w-full h-2 rounded bg-gray-200" />
        <div
          ref={range}
          className="absolute h-2 rounded bg-blue-500"
        />

        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={minVal}
          onChange={handleMinChange}
          onMouseDown={() => setIsDragging('min')}
          onMouseUp={() => setIsDragging(null)}
          onTouchStart={() => setIsDragging('min')}
          onTouchEnd={() => setIsDragging(null)}
          className="thumb thumb-left absolute w-full h-2 appearance-none pointer-events-none bg-transparent"
          style={{ zIndex: isDragging === 'min' ? 5 : minVal > max - 10 ? 5 : 3 }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={maxVal}
          onChange={handleMaxChange}
          onMouseDown={() => setIsDragging('max')}
          onMouseUp={() => setIsDragging(null)}
          onTouchStart={() => setIsDragging('max')}
          onTouchEnd={() => setIsDragging(null)}
          className="thumb thumb-right absolute w-full h-2 appearance-none pointer-events-none bg-transparent"
          style={{ zIndex: isDragging === 'max' ? 5 : 4 }}
        />
      </div>

      {labels && labels.length > 0 && (
        <div className="flex justify-between text-xs text-gray-500 -mt-2">
          {labels.map((labelText, index) => (
            <span
              key={index}
              className={`${
                index >= minVal && index <= maxVal
                  ? 'text-blue-600 font-medium'
                  : ''
              }`}
            >
              {labelText}
            </span>
          ))}
        </div>
      )}

      <style>{`
        .thumb {
          -webkit-appearance: none;
          appearance: none;
        }
        .thumb::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #3b82f6;
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
          cursor: pointer;
          pointer-events: auto;
          margin-top: -4px;
        }
        .thumb::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #3b82f6;
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
          cursor: pointer;
          pointer-events: auto;
        }
        .thumb:focus {
          outline: none;
        }
        .thumb:focus::-webkit-slider-thumb {
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
        }
      `}</style>
    </div>
  );
};
