"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Play, Square } from "lucide-react"
import { createTimeEntry } from "@/actions/time-entries"
import { toast } from "sonner"
import { format } from "date-fns"

interface TimerProps {
    projects: { id: string; name: string; client: { name: string } }[]
}

const DEFAULT_TITLE = "FreelanceOS"

export function Timer({ projects }: TimerProps) {
    const [isRunning, setIsRunning] = useState(false)
    const [elapsed, setElapsed] = useState(0)
    const [startTime, setStartTime] = useState<number | null>(null)
    const [selectedProject, setSelectedProject] = useState<string>("")
    const [description, setDescription] = useState("")
    const intervalRef = useRef<NodeJS.Timeout | null>(null)
    const originalTitleRef = useRef<string>(DEFAULT_TITLE)

    // Store original title on mount
    useEffect(() => {
        originalTitleRef.current = document.title || DEFAULT_TITLE
        return () => {
            // Reset title on unmount
            document.title = originalTitleRef.current
        }
    }, [])

    useEffect(() => {
        // Load state from localStorage
        const storedStart = localStorage.getItem("timerStartTime")
        const storedProject = localStorage.getItem("timerProject")
        const storedDesc = localStorage.getItem("timerDescription")

        if (storedStart) {
            const start = parseInt(storedStart)
            setStartTime(start)
            setIsRunning(true)
            setElapsed(Math.floor((Date.now() - start) / 1000))
            if (storedProject) setSelectedProject(storedProject)
            if (storedDesc) setDescription(storedDesc)
        }
    }, [])

    useEffect(() => {
        if (isRunning && startTime) {
            intervalRef.current = setInterval(() => {
                setElapsed(Math.floor((Date.now() - startTime) / 1000))
            }, 1000)
        } else {
            if (intervalRef.current) clearInterval(intervalRef.current)
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current)
        }
    }, [isRunning, startTime])

    // Update browser tab title with elapsed time while timer is running
    useEffect(() => {
        if (isRunning) {
            document.title = `⏱ ${formatTime(elapsed)} - ${DEFAULT_TITLE}`
        } else {
            document.title = originalTitleRef.current
        }
    }, [isRunning, elapsed])

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600)
        const m = Math.floor((seconds % 3600) / 60)
        const s = seconds % 60
        return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
    }

    const handleStart = () => {
        if (!selectedProject) {
            toast.error("Please select a project first")
            return
        }
        const now = Date.now()
        setStartTime(now)
        setIsRunning(true)
        localStorage.setItem("timerStartTime", now.toString())
        localStorage.setItem("timerProject", selectedProject)
        localStorage.setItem("timerDescription", description)
    }

    const handleStop = async () => {
        if (!startTime) return

        const endTime = new Date()
        const result = await createTimeEntry({
            projectId: selectedProject,
            description,
            startTime: new Date(startTime),
            endTime
        })

        if (result.success) {
            toast.success("Time entry saved")
            setIsRunning(false)
            setStartTime(null)
            setElapsed(0)
            setDescription("")
            localStorage.removeItem("timerStartTime")
            localStorage.removeItem("timerProject")
            localStorage.removeItem("timerDescription")
        } else {
            toast.error("Failed to save time entry")
        }
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Time Tracker</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="flex-1 w-full">
                        <Input 
                            placeholder="What are you working on?" 
                            value={description}
                            onChange={(e) => {
                                setDescription(e.target.value)
                                if (isRunning) localStorage.setItem("timerDescription", e.target.value)
                            }}
                        />
                    </div>
                    <div className="w-full md:w-[200px]">
                        <Select 
                            value={selectedProject} 
                            onValueChange={(val) => {
                                setSelectedProject(val)
                                if (isRunning) localStorage.setItem("timerProject", val)
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select Project" />
                            </SelectTrigger>
                            <SelectContent>
                                {projects.map(p => (
                                    <SelectItem key={p.id} value={p.id}>{p.name} ({p.client.name})</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="text-2xl font-mono font-bold min-w-[100px] text-center">
                        {formatTime(elapsed)}
                    </div>
                    <Button 
                        size="icon" 
                        variant={isRunning ? "destructive" : "default"}
                        onClick={isRunning ? handleStop : handleStart}
                    >
                        {isRunning ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
