import React from "react";
import { useTasks, useClearCompleted } from "@/hooks/use-tasks";
import { JourneyMap } from "@/components/JourneyMap";
import { ActiveMilestone } from "@/components/ActiveMilestone";
import { PlantFlag } from "@/components/PlantFlag";
import { Map, RotateCcw, Loader2 } from "lucide-react";

export default function Home() {
  const { data: tasks, isLoading, error } = useTasks();
  const { mutate: clearCompleted, isPending: isClearing } = useClearCompleted();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground font-display tracking-widest uppercase">Charting Course...</p>
      </div>
    );
  }

  if (error || !tasks) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center px-4">
        <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mb-6">
          <Map className="w-10 h-10 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Navigation Error</h1>
        <p className="text-muted-foreground mb-6">Could not load your journey map.</p>
      </div>
    );
  }

  // Determine state of the journey
  const mainTasks = tasks.filter(t => !t.parentId).sort((a, b) => a.order - b.order);
  const subTasksMap = tasks.reduce((acc, t) => {
    if (t.parentId) {
      if (!acc[t.parentId]) acc[t.parentId] = [];
      acc[t.parentId].push(t);
    }
    return acc;
  }, {} as Record<number, typeof tasks>);

  // Flattened list for the journey marker
  const flattenedJourney: typeof tasks = [];
  mainTasks.forEach(main => {
    const subs = (subTasksMap[main.id] || []).sort((a, b) => a.order - b.order);
    flattenedJourney.push(...subs);
    flattenedJourney.push(main);
  });

  const activeIndex = flattenedJourney.findIndex((t) => !t.isCompleted);
  const activeTask = activeIndex !== -1 ? flattenedJourney[activeIndex] : undefined;
  
  // Journey is complete if there are tasks and NONE are uncompleted
  const isAllComplete = flattenedJourney.length > 0 && activeIndex === -1;
  const hasCompletedTasks = flattenedJourney.some(t => t.isCompleted);

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden selection:bg-primary/30">
      
      {/* Subtle Background Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-8 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl border border-primary/20 flex items-center justify-center glow-primary">
            <Map className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-display font-bold tracking-[0.2em] text-foreground">
            SCHELO
          </h1>
        </div>

        {hasCompletedTasks && (
          <button
            onClick={() => clearCompleted()}
            disabled={isClearing}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground bg-secondary/50 hover:bg-secondary rounded-lg transition-all"
          >
            <RotateCcw className={`w-4 h-4 ${isClearing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Reset Journey</span>
          </button>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col w-full z-10">
        
        {/* Visualization Area */}
        <div className="w-full min-h-[300px] flex items-center justify-center border-y border-border/50 bg-black/20 backdrop-blur-sm shadow-inner overflow-hidden">
          <JourneyMap tasks={tasks} activeIndex={activeIndex} />
        </div>

        {/* Action Area */}
        <div className="flex-1 flex flex-col items-center pt-12 pb-6 px-4">
          <ActiveMilestone activeTask={activeTask} isAllComplete={isAllComplete} />
          
          <div className="w-full mt-auto pt-12">
            <PlantFlag tasks={tasks} />
          </div>
        </div>

      </main>
    </div>
  );
}
