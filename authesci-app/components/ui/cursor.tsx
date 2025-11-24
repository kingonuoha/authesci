import { cn } from '@/lib/utils'
import { MousePointer2 } from 'lucide-react'
import React from 'react'

export const Cursor = ({
  className,
  style,
  color,
  name,
}: {
  className?: string
  style?: React.CSSProperties
  color: string
  name: string
}) => {
  return (
    <div className={cn('pointer-events-none absolute top-0 left-0 z-50 transition-transform duration-100 ease-linear', className)} style={style}>
      <MousePointer2 color={color} fill={color} size={20} />

      <div
        className="mt-1 px-2 py-1 rounded text-xs font-bold text-white text-center whitespace-nowrap"
        style={{ backgroundColor: color }}
      >
        {name}
      </div>
    </div>
  )
}
