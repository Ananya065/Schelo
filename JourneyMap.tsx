import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Rocket, Trash2, Calendar as CalendarIcon, ChevronRight } from "lucide-react";
import { type Task } from "@shared/schema";
import { useDeleteTask } from "@/hooks/use-tasks";
import { format } from "date-fns";

interface JourneyMapProps {
  tasks: Task[];
  activeIndex: number;
}

export function JourneyMap({ tasks, activeIndex }: JourneyMapProps) {
  const { mutate: deleteTask } = useDeleteTask();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Group tasks by parentId
  const mainTasks = tasks.filter(t => !t.parentId);
  const subTasksMap = tasks.reduce((acc, t) => {
    if (t.parentId) {
      if (!acc[t.parentId]) acc[t.parentId] = [];
      acc[t.parentId].push(t);
    }
    return acc;
  }, {} as Record<number, Task[]>);

  // Flattened list for the journey marker
  const flattenedJourney: Task[] = [];
  mainTasks.forEach(main => {
    const subs = subTasksMap[main.id] || [];
    flattenedJourney.push(...subs);
    flattenedJourney.push(main);
  });

  const journeyActiveIndex = flattenedJourney.findIndex(t => !t.isCompleted);
  const effectiveActiveIndex = journeyActiveIndex === -1 ? flattenedJourney.length - 1 : journeyActiveIndex;

  useEffect(() => {
    if (scrollRef.current) {
      const activeNode = scrollRef.current.querySelector('[data-active="true"]');
      if (activeNode) {
        activeNode.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      }
    }
  }, [effectiveActiveIndex, flattenedJourney.length]);

  if (flattenedJourney.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground opacity-50">
        <div className="w-16 h-16 border-2 border-dashed border-muted-foreground rounded-full flex items-center justify-center mb-4">
          <Rocket className="w-6 h-6" />
        </div>
        <p className="font-display tracking-widest uppercase">The Map is Empty</p>
      </div>
    );
  }

  return (
    <div 
      ref={scrollRef}
      className="w-full overflow-x-auto py-24 px-8 sm:px-24 flex items-center snap-x snap-mandatory"
    >
      <div className="flex items-center min-w-max mx-auto relative px-12">
        {flattenedJourney.map((task, i) => {
          const isCompleted = task.isCompleted;
          const isActive = i === effectiveActiveIndex;
          const isUpcoming = !isCompleted && !isActive;
          const isSubtask = !!task.parentId;

          return (
            <React.Fragment key={task.id}>
              {/* The Milestone Node */}
              <motion.div 
                layout
                data-active={isActive}
                className={`relative flex flex-col items-center group snap-center z-10 ${isSubtask ? "mt-8" : ""}`}
              >
                {/* The Avatar / Marker */}
                {isActive && (
                  <motion.div 
                    layoutId="player-avatar"
                    className="absolute -top-14 z-20 flex flex-col items-center drop-shadow-xl"
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <div className="bg-primary text-primary-foreground p-3 rounded-full glow-primary">
                      <Rocket className="w-6 h-6" />
                    </div>
                  </motion.div>
                )}

                {/* Node Circle */}
                <div 
                  className={`
                    ${isSubtask ? "w-8 h-8 border-2" : "w-12 h-12 border-4"} 
                    rounded-full flex items-center justify-center transition-all duration-500
                    ${isCompleted ? "bg-primary border-primary text-primary-foreground" : ""}
                    ${isActive ? "bg-card border-primary glow-primary ring-4 ring-primary/20 scale-110" : ""}
                    ${isUpcoming ? "bg-card border-muted text-muted-foreground" : ""}
                  `}
                >
                  {isCompleted && <Check className={isSubtask ? "w-4 h-4" : "w-6 h-6"} />}
                  {isActive && <div className={`${isSubtask ? "w-2 h-2" : "w-3 h-3"} bg-primary rounded-full animate-pulse`} />}
                  {isUpcoming && <span className={`${isSubtask ? "text-[10px]" : "text-sm"} font-bold`}>{i + 1}</span>}
                </div>

                {/* Task Title Tooltip / Label */}
                <div className={`absolute ${isSubtask ? "top-10" : "top-16"} w-32 text-center`}>
                  <p className={`
                    text-xs font-semibold uppercase tracking-wider line-clamp-1
                    ${isCompleted ? "text-primary/70" : ""}
                    ${isActive ? "text-primary text-glow" : ""}
                    ${isUpcoming ? "text-muted-foreground" : ""}
                  `}>
                    {task.title}
                  </p>
                  {task.dueDate && (
                    <div className="flex items-center justify-center gap-1 mt-1 text-[8px] opacity-60">
                      <CalendarIcon className="w-2 h-2" />
                      {format(new Date(task.dueDate), "MMM d")}
                    </div>
                  )}
                </div>

                {/* Delete Button (Hover) */}
                <button
                  onClick={() => deleteTask(task.id)}
                  className="absolute -bottom-10 opacity-0 group-hover:opacity-100 transition-opacity p-2 text-muted-foreground hover:text-destructive"
                  aria-label="Delete milestone"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>

              {/* Connecting Path */}
              {i < flattenedJourney.length - 1 && (
                <div className={`
                  ${isSubtask ? "w-12 sm:w-20" : "w-16 sm:w-32"} 
                  h-1 bg-muted relative mx-1 rounded-full overflow-hidden z-0
                  ${flattenedJourney[i+1].parentId ? "-rotate-6 origin-left" : ""}
                `}>
                  <motion.div
                    className="absolute top-0 bottom-0 left-0 bg-primary shadow-[0_0_10px_rgba(0,255,150,0.5)]"
                    initial={{ width: "0%" }}
                    animate={{ width: isCompleted ? "100%" : "0%" }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
