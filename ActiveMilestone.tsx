import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Trophy, ChevronRight } from "lucide-react";
import confetti from "canvas-confetti";
import { type Task } from "@shared/schema";
import { useUpdateTask, useTasks } from "@/hooks/use-tasks";

interface ActiveMilestoneProps {
  activeTask?: Task;
  isAllComplete: boolean;
}

export function ActiveMilestone({ activeTask, isAllComplete }: ActiveMilestoneProps) {
  const { mutate: completeTask, isPending } = useUpdateTask();
  const { data: tasks } = useTasks();

  useEffect(() => {
    if (isAllComplete) {
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#00ff96', '#ffffff']
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#00ff96', '#ffffff']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [isAllComplete]);

  // Find parent task if this is a subtask
  const parentTask = tasks?.find(t => t.id === activeTask?.parentId);

  return (
    <div className="w-full max-w-2xl mx-auto mt-8 flex flex-col items-center justify-center min-h-[250px]">
      <AnimatePresence mode="wait">
        {isAllComplete ? (
          <motion.div
            key="complete"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="flex flex-col items-center text-center p-8 bg-card border border-primary/20 rounded-3xl glow-primary-lg"
          >
            <Trophy className="w-16 h-16 text-primary mb-6 animate-bounce" />
            <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">
              Journey Complete!
            </h2>
            <p className="text-muted-foreground text-lg">
              You've conquered all your milestones for today. Rest well.
            </p>
          </motion.div>
        ) : activeTask ? (
          <motion.div
            key={activeTask.id}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="flex flex-col items-center w-full px-4"
          >
            <span className="text-sm font-display tracking-[0.3em] text-primary mb-4 uppercase flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              {activeTask.parentId ? "Next Sub-Task" : "Main Objective"}
            </span>
            
            {parentTask && (
              <div className="flex items-center gap-2 text-muted-foreground mb-2 opacity-60">
                <span className="text-xs font-bold uppercase tracking-wider">{parentTask.title}</span>
                <ChevronRight className="w-3 h-3" />
              </div>
            )}

            <h2 className="text-3xl md:text-5xl font-display font-bold text-center text-foreground mb-12 max-w-3xl leading-tight">
              {activeTask.title}
            </h2>
            
            <button
              onClick={() => completeTask({ id: activeTask.id, isCompleted: true })}
              disabled={isPending}
              className="
                group relative flex items-center justify-center gap-4
                px-10 py-5 bg-primary text-primary-foreground 
                rounded-full font-display font-bold text-xl tracking-wide
                overflow-hidden transition-all duration-300
                hover:scale-105 active:scale-95 disabled:opacity-50
                glow-primary hover:glow-primary-lg
              "
            >
              {/* Shine effect */}
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
              
              {isPending ? "Advancing..." : "MOVE FORWARD"}
              <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-2" />
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-muted-foreground"
          >
            <p className="text-lg">Plant your first milestone below to begin your journey.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
