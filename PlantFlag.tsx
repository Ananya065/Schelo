import React, { useState } from "react";
import { useTasks, useCreateTask } from "@/hooks/use-tasks";
import { Flag, Calendar as CalendarIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { type Task } from "@shared/schema";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PlantFlagProps {
  tasks: Task[];
}

export function PlantFlag({ tasks }: PlantFlagProps) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [parentId, setParentId] = useState<string>("none");
  const { mutate: createFlag, isPending } = useCreateTask();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isPending) return;

    createFlag({
      title: title.trim(),
      isCompleted: false,
      order: tasks.length,
      dueDate: date || null,
      parentId: parentId === "none" ? null : parseInt(parentId),
    });
    setTitle("");
    setParentId("none");
  };

  const mainTasks = tasks.filter(t => !t.parentId);

  return (
    <form 
      onSubmit={handleSubmit}
      className="w-full max-w-4xl mx-auto p-6 bg-card/30 backdrop-blur-md border border-border/50 rounded-2xl flex flex-col gap-4 shadow-2xl"
    >
      <div className="flex flex-col sm:flex-row gap-4 items-end">
        <div className="flex-1 space-y-2 w-full">
          <label className="text-[10px] font-display tracking-[0.2em] text-muted-foreground uppercase px-1">
            New Milestone
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What is the next objective?"
            className="bg-background/50 border-border/50 h-12 text-lg focus-visible:ring-primary/30"
          />
        </div>

        <div className="space-y-2 w-full sm:w-auto">
          <label className="text-[10px] font-display tracking-[0.2em] text-muted-foreground uppercase px-1">
            Deadline
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={`w-full sm:w-[180px] h-12 justify-start text-left font-normal bg-background/50 border-border/50 ${!date && "text-muted-foreground"}`}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2 w-full sm:w-auto">
          <label className="text-[10px] font-display tracking-[0.2em] text-muted-foreground uppercase px-1">
            Part of
          </label>
          <Select value={parentId} onValueChange={setParentId}>
            <SelectTrigger className="w-full sm:w-[200px] h-12 bg-background/50 border-border/50">
              <SelectValue placeholder="Select parent" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Main Journey</SelectItem>
              {mainTasks.map(t => (
                <SelectItem key={t.id} value={t.id.toString()}>{t.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button 
          type="submit" 
          disabled={!title.trim() || isPending}
          size="lg"
          className="h-12 px-8 glow-primary hover:glow-primary-lg transition-all"
        >
          {isPending ? "Planting..." : "Plant Flag"}
          <Flag className="ml-2 w-4 h-4" />
        </Button>
      </div>
    </form>
  );
}
