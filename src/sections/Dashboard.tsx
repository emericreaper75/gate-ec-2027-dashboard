import React from "react";
import { useStore } from "../store";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ProgressBar,
  Badge,
} from "../components/ui";
import { ActivityHeatmap } from "../components/ActivityHeatmap";

import { TargetProgressGauge } from "../components/TargetProgressGauge";

export function Dashboard() {
  const { tasks, pyqLogs, errors, mastery, settings } = useStore();

  const today = new Date();
  const todayStr = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().split("T")[0];
  const gateDate = new Date("2027-02-14");
  const daysToGate = Math.max(
    0,
    Math.ceil((gateDate.getTime() - today.getTime()) / (1000 * 3600 * 24)),
  );

  const phase1End = new Date("2026-11-30");
  const isPhase1 = today <= phase1End;
  const currentPhaseName = isPhase1
    ? "Phase 1: Vigorous Prep"
    : "Phase 2: Ruthless Testing";

  const phase1Total = 153;
  const phase1Elapsed = Math.min(
    phase1Total,
    Math.max(
      0,
      Math.ceil(
        (today.getTime() - new Date("2026-07-01").getTime()) /
          (1000 * 3600 * 24),
      ),
    ),
  );
  const phase1Progress = (phase1Elapsed / phase1Total) * 100;

  const phase2Total = 75;
  const phase2Elapsed = Math.max(
    0,
    Math.ceil((today.getTime() - phase1End.getTime()) / (1000 * 3600 * 24)),
  );
  const phase2Progress = (phase2Elapsed / phase2Total) * 100;

  const daysInCurrentPhase = isPhase1
    ? phase1Total - phase1Elapsed
    : Math.max(0, phase2Total - phase2Elapsed);

  // PYQ target calculation
  const totalTarget = 5000; // rough estimate
  const pyqsDone = pyqLogs.length;
  const pyqsPerDayTarget = Math.ceil(
    Math.max(0, totalTarget - pyqsDone) / (daysToGate || 1),
  );

  // Today's snapshot
  const todaysTasks = tasks.filter((t) => t.date === todayStr);
  const todaysCompletedTasks = todaysTasks.filter((t) => t.completed).length;

  const todaysPyqs = pyqLogs.filter((l) => l.date === todayStr);
  const subjectsStudiedToday = new Set(todaysPyqs.map((l) => l.subject)).size;

  const weakTopicsCount = mastery.filter((m) => m.mastery < 50).length;

  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  const startOfWeekStr = new Date(startOfWeek.getTime() - startOfWeek.getTimezoneOffset() * 60000).toISOString().split("T")[0];
  const errorJournalEntriesThisWeek = errors.filter(
    (e) => e.date >= startOfWeekStr,
  ).length;

  // Recent activity (mocked up from simple parsing of stores)
  const recentActivities = [
    ...pyqLogs
      .slice(-2)
      .map((l) => ({
        id: l.id,
        type: "PYQ",
        text: `Logged PYQ: ${l.subject}`,
        time: l.date,
      })),
    ...tasks
      .filter((t) => t.completed)
      .slice(-2)
      .map((t) => ({
        id: t.id,
        type: "Task",
        text: `Completed: ${t.title}`,
        time: t.date,
      })),
    ...errors
      .slice(-1)
      .map((e) => ({
        id: e.id,
        type: "Error",
        text: `Journaled Error in ${e.subject}`,
        time: e.date,
      })),
  ]
    .sort((a, b) => b.time.localeCompare(a.time))
    .slice(0, 5);

  // Subject Mastery processing
  const subjects = [
    "Networks",
    "Signals & Systems",
    "Engineering Mathematics",
    "Communications",
    "Electromagnetics",
    "Analog Circuits",
    "Digital Circuits",
    "Electronic Devices",
    "Control Systems",
    "General Aptitude",
  ];
  const masteryAverages = subjects.map((sub) => {
    const topics = mastery.filter((m) => m.subject === sub);
    const avg =
      topics.length > 0
        ? topics.reduce((acc, curr) => acc + curr.mastery, 0) / topics.length
        : 0;
    return { subject: sub, average: Math.round(avg) };
  });

  return (
    <div className="space-y-4 pb-12">
      {/* Engine Countdown */}
      <Card className="border border-border bg-bg-card rounded-lg overflow-hidden">
        <CardContent className="p-4 flex flex-col md:flex-row gap-6 justify-between items-center bg-bg-elevated border-b border-border">
          <div>
            <div className="text-[10px] text-text-secondary uppercase font-mono mb-1">
              Time Remaining
            </div>
            <h1 className="text-3xl font-mono text-accent-primary tracking-tighter font-bold">
              {daysToGate} DAYS
            </h1>
            <p className="text-[10px] text-text-muted mt-1 uppercase">
              Until GATE 2027 (FEB 14)
            </p>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-text-secondary uppercase font-mono mb-1">
              Current Phase
            </div>
            <h2 className="text-xl font-bold text-text-primary uppercase">
              {currentPhaseName}
            </h2>
            <p className="text-[10px] text-accent-warning mt-1 uppercase font-mono">
              {daysInCurrentPhase} days remaining
            </p>
          </div>
        </CardContent>
        <CardContent className="p-4 bg-bg-card space-y-4">
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-[10px] font-mono uppercase mb-1">
                <span className="text-text-primary">Phase 1 Progress</span>
                <span className="text-text-primary">
                  {Math.round(phase1Progress)}%{" "}
                  <span className="text-text-muted">
                    ({phase1Elapsed}/{phase1Total}d)
                  </span>
                </span>
              </div>
              <div className="w-full h-1 bg-bg-elevated overflow-hidden">
                <div
                  className="h-full bg-accent-primary"
                  style={{ width: `${phase1Progress}%` }}
                ></div>
              </div>
            </div>

            {!isPhase1 && (
              <div>
                <div className="flex justify-between text-[10px] font-mono uppercase mb-1">
                  <span className="text-text-primary">Phase 2 Progress</span>
                  <span className="text-text-primary">
                    {Math.round(phase2Progress)}%{" "}
                    <span className="text-text-muted">
                      ({phase2Elapsed}/{phase2Total}d)
                    </span>
                  </span>
                </div>
                <div className="w-full h-1 bg-bg-elevated overflow-hidden">
                  <div
                    className="h-full bg-accent-danger"
                    style={{ width: `${phase2Progress}%` }}
                  ></div>
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-between items-center text-[10px] font-mono uppercase border-t border-border mt-4">
              <span className="text-text-secondary">
                PYQ Run Rate Required:
              </span>
              <span className="text-accent-primary font-bold">
                {pyqsPerDayTarget} PYQs / DAY
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Snapshot Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border border-border bg-bg-card rounded-lg">
          <CardContent className="p-4 flex flex-col justify-center">
            <div className="text-[10px] text-text-secondary uppercase font-mono mb-1">
              Today's Tasks
            </div>
            <div className="text-2xl font-mono font-bold text-accent-success">
              {todaysCompletedTasks}
              <span className="text-sm text-text-muted">
                /{todaysTasks.length}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border bg-bg-card rounded-lg">
          <CardContent className="p-4 flex flex-col justify-center">
            <div className="text-[10px] text-text-secondary uppercase font-mono mb-1">
              Subjects Today
            </div>
            <div className="text-2xl font-mono font-bold text-text-primary">
              {subjectsStudiedToday}
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border bg-bg-card rounded-lg">
          <CardContent className="p-4 flex flex-col justify-center">
            <div className="text-[10px] text-text-secondary uppercase font-mono mb-1">
              Weak Topics
            </div>
            <div className="text-2xl font-mono font-bold text-accent-danger">
              {weakTopicsCount}
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border bg-bg-card rounded-lg">
          <CardContent className="p-4 flex flex-col justify-center">
            <div className="text-[10px] text-text-secondary uppercase font-mono mb-1">
              Errors This Week
            </div>
            <div className="text-2xl font-mono font-bold text-accent-warning">
              {errorJournalEntriesThisWeek}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Subject Mastery Overview */}
        <Card className="lg:col-span-8 border border-border bg-bg-card rounded-lg flex flex-col">
          <CardHeader className="p-4 border-b border-border flex justify-between items-center flex-row space-y-0">
            <CardTitle className="font-mono text-sm font-bold flex items-center gap-2 text-text-primary">
              <span className="w-2 h-2 bg-accent-primary"></span>{" "}
              SUBJECT_MASTERY_INDEX
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 bg-bg-card">
            {masteryAverages.map(({ subject, average }) => {
              const color =
                average >= 75
                  ? "bg-accent-success"
                  : average >= 50
                    ? "bg-accent-warning"
                    : "bg-accent-danger";
              const textColor =
                average >= 75
                  ? "text-accent-success"
                  : average >= 50
                    ? "text-accent-warning"
                    : "text-accent-danger";
              return (
                <div key={subject} className="space-y-1">
                  <div className="flex justify-between text-[10px] mb-1 font-mono uppercase">
                    <span className="text-text-primary truncate pr-2">
                      {subject}
                    </span>
                    <span className={textColor}>{average}%</span>
                  </div>
                  <div className="h-1.5 bg-bg-elevated w-full rounded-full overflow-hidden">
                    <div
                      className={`h-full ${color}`}
                      style={{ width: `${average}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Right Column: Activity Heatmap & Recent Activity */}
        <div className="lg:col-span-4 space-y-4 flex flex-col">
          <TargetProgressGauge />
          <ActivityHeatmap />

          <Card className="flex-1 border border-border bg-bg-card rounded-lg flex flex-col">
            <CardHeader className="p-3 border-b border-border bg-bg-elevated space-y-0">
              <CardTitle className="font-mono text-xs font-bold text-text-primary">
                ⏱️ RECENT_ACTIVITY
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-2 overflow-y-auto bg-bg-card">
              {recentActivities.length > 0 ? (
                <div className="space-y-2">
                  {recentActivities.map((act, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 border-b border-border pb-2 last:border-0 last:pb-0"
                    >
                      <div className="flex-1">
                        <div className="text-[11px] font-bold text-text-primary">
                          {act.text}
                        </div>
                        <div className="text-[10px] text-text-muted font-mono">
                          {act.time} // {act.type}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[10px] text-text-muted font-mono">
                  NO_ACTIVITY_DETECTED
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
