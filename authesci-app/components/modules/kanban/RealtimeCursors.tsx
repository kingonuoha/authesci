'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Cursor } from '@/components/ui/cursor';

interface RealtimeCursorsProps {
  projectId: string;
  userId: string;
  userName: string;
  userColor: string;
}

interface CursorData {
  x: number;
  y: number;
  name: string;
  color: string;
  userId: string;
  updatedAt: number;
}

export function RealtimeCursors({ projectId, userId, userName, userColor }: RealtimeCursorsProps) {
  const [cursors, setCursors] = useState<Record<string, CursorData>>({});
  const supabase = createClient();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const channel = supabase.channel(`kanban-cursors-${projectId}`);

    channel
      .on('broadcast', { event: 'cursor-move' }, ({ payload }) => {
        if (payload.userId !== userId) {
          setCursors((prev) => ({
            ...prev,
            [payload.userId]: { ...payload, updatedAt: Date.now() },
          }));
        }
      })
      .subscribe();

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      
      // Check if mouse is within the container bounds
      if (
        e.clientX < rect.left ||
        e.clientX > rect.right ||
        e.clientY < rect.top ||
        e.clientY > rect.bottom
      ) {
        return;
      }

      // Calculate position relative to the container
      // We add scrollLeft/scrollTop of the container itself if it scrolls?
      // The containerRef is absolute inset-0, so it should match the parent's scrollable area content?
      // If the parent is the scrollable element, we need to be careful.
      // In KanbanBoard, the wrapper is `kanban-wrapper`.
      // If we place this INSIDE `kanban-wrapper`, it will scroll with it.
      
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      channel.send({
        type: 'broadcast',
        event: 'cursor-move',
        payload: {
          x,
          y,
          name: userName,
          color: userColor,
          userId: userId,
        },
      });
    };

    const throttledMouseMove = throttle(handleMouseMove, 50);

    window.addEventListener('mousemove', throttledMouseMove);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener('mousemove', throttledMouseMove);
    };
  }, [projectId, userId, userName, userColor, supabase]);

  // Cleanup old cursors
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setCursors((prev) => {
        const next = { ...prev };
        let changed = false;
        Object.keys(next).forEach((key) => {
          if (now - next[key].updatedAt > 5000) { // Remove after 5 seconds of inactivity
            delete next[key];
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
      {Object.values(cursors).map((cursor) => (
        <Cursor
          key={cursor.userId}
          color={cursor.color}
          name={cursor.name}
          style={{
            transform: `translate(${cursor.x}px, ${cursor.y}px)`,
          }}
        />
      ))}
    </div>
  );
}

function throttle(func: Function, limit: number) {
  let inThrottle: boolean;
  return function(this: any, ...args: any[]) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
