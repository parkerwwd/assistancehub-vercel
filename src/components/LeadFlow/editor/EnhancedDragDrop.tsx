import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { motion, AnimatePresence } from 'framer-motion';
import { GripVertical } from 'lucide-react';

interface EnhancedDragDropProps {
  items: any[];
  onReorder: (items: any[]) => void;
  renderItem: (item: any, index: number, dragHandleProps: any) => React.ReactNode;
  className?: string;
  emptyState?: React.ReactNode;
}

export default function EnhancedDragDrop({ 
  items, 
  onReorder, 
  renderItem, 
  className = '',
  emptyState
}: EnhancedDragDropProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (result: any) => {
    setIsDragging(true);
    setDraggedIndex(result.source.index);
  };

  const handleDragEnd = (result: DropResult) => {
    setIsDragging(false);
    setDraggedIndex(null);

    if (!result.destination) return;

    const newItems = Array.from(items);
    const [removed] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, removed);

    onReorder(newItems);
  };

  return (
    <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <Droppable droppableId="enhanced-droppable">
        {(provided, snapshot) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className={`${className} ${snapshot.isDraggingOver ? 'bg-blue-50/50 rounded-lg' : ''} transition-colors duration-200`}
          >
            {items.length === 0 && emptyState}
            
            <AnimatePresence>
              {items.map((item, index) => (
                <Draggable
                  key={item.id || item.tempId || index}
                  draggableId={item.id || item.tempId || index.toString()}
                  index={index}
                >
                  {(provided, snapshot) => (
                    <motion.div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ 
                        opacity: 1, 
                        y: 0,
                        scale: snapshot.isDragging ? 1.05 : 1,
                        zIndex: snapshot.isDragging ? 999 : 'auto'
                      }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2 }}
                      className={`
                        ${snapshot.isDragging ? 'shadow-2xl rotate-2' : 'shadow-sm'}
                        ${draggedIndex !== null && index === draggedIndex + 1 && !snapshot.isDragging ? 'mt-20' : ''}
                        ${draggedIndex !== null && index === draggedIndex - 1 && !snapshot.isDragging ? 'mb-20' : ''}
                        transition-all duration-200
                      `}
                    >
                      <div className="relative">
                        {/* Drag Handle Indicator */}
                        <div
                          {...provided.dragHandleProps}
                          className={`
                            absolute -left-8 top-1/2 -translate-y-1/2
                            ${snapshot.isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
                            transition-opacity duration-200 cursor-grab active:cursor-grabbing
                          `}
                        >
                          <GripVertical className="w-5 h-5 text-gray-400" />
                        </div>

                        {/* Drop Indicator */}
                        {isDragging && !snapshot.isDragging && (
                          <motion.div
                            initial={{ scaleY: 0 }}
                            animate={{ scaleY: 1 }}
                            className="absolute -top-1 left-0 right-0 h-0.5 bg-blue-500 rounded-full"
                          />
                        )}

                        {/* Item Content */}
                        <div className="group">
                          {renderItem(item, index, provided.dragHandleProps)}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </Draggable>
              ))}
            </AnimatePresence>
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
