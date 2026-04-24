// src/pages/CalendarPage.jsx
import * as React from "react";
import {
  add, eachDayOfInterval, endOfMonth, endOfWeek, format,
  isEqual, isSameDay, isSameMonth, isToday, parse, startOfToday,
  startOfWeek, isBefore, startOfDay,
} from "date-fns";
import {
  ChevronLeftIcon, ChevronRightIcon, Clock, MapPin, Bell, BellOff,
  Calendar as CalendarIcon, BookOpen, FlaskConical, FileText, GraduationCap, Plus, Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import Sidebar from "../components/Sidebar";
import { examsApi } from "../hooks/useApi";

const examTypeColors = {
  midterm:   "bg-blue-500 hover:bg-blue-600",
  final:     "bg-red-500 hover:bg-red-600",
  quiz:      "bg-green-500 hover:bg-green-600",
  practical: "bg-purple-500 hover:bg-purple-600",
};
const examTypeBadgeColors = {
  midterm:   "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  final:     "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  quiz:      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  practical: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
};
const examTypeIcons = { midterm: BookOpen, final: GraduationCap, quiz: FileText, practical: FlaskConical };
const cn = (...classes) => classes.filter(Boolean).join(" ");

export default function CalendarPage({ isDarkMode, toggleTheme }) {
  const today = startOfToday();
  const [selectedDay,  setSelectedDay]  = React.useState(today);
  const [currentMonth, setCurrentMonth] = React.useState(format(today, "MMM-yyyy"));
  const [selectedExam, setSelectedExam] = React.useState(null);
  const [viewMode,     setViewMode]     = React.useState("month");
  const [exams,        setExams]        = React.useState([]);
  const [loading,      setLoading]      = React.useState(true);
  const [showAddForm,  setShowAddForm]  = React.useState(false);
  const [newExam,      setNewExam]      = React.useState({ subject: '', type: 'midterm', date: '', time: '', location: '', duration: '', notes: '' });
  const [addError,     setAddError]     = React.useState('');

  const loadExams = () => {
    examsApi.getAll()
      .then(data => setExams(data.map(e => ({ ...e, date: new Date(e.date) }))))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  React.useEffect(() => { loadExams(); }, []);

  const firstDayCurrentMonth = parse(currentMonth, "MMM-yyyy", new Date());
  const days = eachDayOfInterval({
    start: startOfWeek(firstDayCurrentMonth),
    end:   endOfWeek(endOfMonth(firstDayCurrentMonth)),
  });
  const weekDays = eachDayOfInterval({
    start: startOfWeek(selectedDay),
    end:   endOfWeek(selectedDay),
  });

  const previousMonth = () => setCurrentMonth(format(add(firstDayCurrentMonth, { months: -1 }), "MMM-yyyy"));
  const nextMonth     = () => setCurrentMonth(format(add(firstDayCurrentMonth, { months:  1 }), "MMM-yyyy"));
  const previousWeek  = () => setSelectedDay(add(selectedDay, { weeks: -1 }));
  const nextWeek      = () => setSelectedDay(add(selectedDay, { weeks:  1 }));
  const previousDay   = () => setSelectedDay(add(selectedDay, { days:  -1 }));
  const nextDay       = () => setSelectedDay(add(selectedDay, { days:   1 }));
  const goToToday     = () => { setCurrentMonth(format(today, "MMM-yyyy")); setSelectedDay(today); };

  const getExamsForDay = (day) => exams.filter(e => isSameDay(e.date, day));
  const upcomingExams  = exams
    .filter(e => !isBefore(e.date, startOfDay(today)))
    .sort((a, b) => a.date - b.date)
    .slice(0, 5);

  const handleReminderToggle = async (examId, type) => {
    const exam = exams.find(e => e._id === examId);
    if (!exam) return;
    const updated = { reminders: { ...exam.reminders, [type]: !exam.reminders[type] } };
    try {
      const res = await examsApi.update(examId, updated);
      setExams(prev => prev.map(e => e._id === examId ? { ...res, date: new Date(res.date) } : e));
      if (selectedExam?._id === examId) setSelectedExam({ ...res, date: new Date(res.date) });
    } catch {}
  };

  const handleDeleteExam = async (examId) => {
    try {
      await examsApi.remove(examId);
      setExams(prev => prev.filter(e => e._id !== examId));
      setSelectedExam(null);
    } catch {}
  };

  const handleAddExam = async (e) => {
    e.preventDefault();
    setAddError('');
    if (!newExam.subject || !newExam.date || !newExam.time) {
      setAddError('Subject, date and time are required.');
      return;
    }
    try {
      const res = await examsApi.create({ ...newExam, reminders: { oneDayBefore: false, oneHourBefore: false } });
      setExams(prev => [...prev, { ...res, date: new Date(res.date) }]);
      setShowAddForm(false);
      setNewExam({ subject: '', type: 'midterm', date: '', time: '', location: '', duration: '', notes: '' });
    } catch (err) {
      setAddError(err.message);
    }
  };

  return (
    <div className={`min-h-screen flex ${isDarkMode ? "dark bg-gray-900" : "bg-gray-50"}`}>
      <Sidebar isDarkMode={isDarkMode} toggleTheme={toggleTheme} />

      <main className="flex-1 overflow-y-auto">
        <header className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Calendar</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">View and manage your exam schedule</p>
            </div>
            <Button onClick={() => setShowAddForm(true)} className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
              <Plus className="h-4 w-4" /> Add Exam
            </Button>
          </div>
        </header>

        <div className="p-6 flex flex-col lg:flex-row gap-6">

          {/* Upcoming Exams Panel */}
          <Card className="lg:w-80 h-fit bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                <CalendarIcon className="h-5 w-5" /> Upcoming Exams
              </CardTitle>
              <CardDescription className="text-gray-500 dark:text-gray-400">Next 5 scheduled exams</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-3">
                  {loading ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">Loading...</p>
                  ) : upcomingExams.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">No upcoming exams</p>
                  ) : upcomingExams.map((exam) => {
                    const Icon = examTypeIcons[exam.type];
                    return (
                      <button key={exam._id} onClick={() => setSelectedExam(exam)}
                        className="w-full text-left p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className={cn("p-2 rounded-lg", examTypeColors[exam.type])}>
                            <Icon className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="font-medium text-sm truncate text-gray-900 dark:text-white">{exam.subject}</p>
                              {exam.isGlobal && <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded flex-shrink-0">Admin</span>}
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{format(exam.date, "MMM d, yyyy")}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{exam.time}</p>
                            <Badge className={cn("mt-1 text-xs", examTypeBadgeColors[exam.type])}>{exam.type}</Badge>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Main Calendar */}
          <div className="flex-1">
            <Card className="bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle className="text-2xl text-gray-900 dark:text-white">Exam Calendar</CardTitle>
                    <CardDescription className="text-gray-500 dark:text-gray-400">Track all your upcoming exams</CardDescription>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Tabs value={viewMode} onValueChange={setViewMode}>
                      <TabsList className="bg-gray-100 dark:bg-gray-800">
                        <TabsTrigger value="month" className="dark:data-[state=active]:bg-gray-950 dark:text-gray-300">Month</TabsTrigger>
                        <TabsTrigger value="week"  className="dark:data-[state=active]:bg-gray-950 dark:text-gray-300">Week</TabsTrigger>
                        <TabsTrigger value="day"   className="dark:data-[state=active]:bg-gray-950 dark:text-gray-300">Day</TabsTrigger>
                      </TabsList>
                    </Tabs>
                    <div className="flex gap-1 rounded-lg border border-gray-200 dark:border-gray-700 p-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-700 dark:text-gray-300"
                        onClick={viewMode === "month" ? previousMonth : viewMode === "week" ? previousWeek : previousDay}>
                        <ChevronLeftIcon className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" className="h-8 px-3 text-sm text-gray-700 dark:text-gray-300" onClick={goToToday}>
                        Today
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-700 dark:text-gray-300"
                        onClick={viewMode === "month" ? nextMonth : viewMode === "week" ? nextWeek : nextDay}>
                        <ChevronRightIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                {/* Month View */}
                {viewMode === "month" && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{format(firstDayCurrentMonth, "MMMM yyyy")}</h3>
                    <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                      {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
                        <div key={d} className="bg-gray-100 dark:bg-gray-800 p-2 text-center text-xs font-medium text-gray-600 dark:text-gray-400">{d}</div>
                      ))}
                      {days.map(day => {
                        const dayExams   = getExamsForDay(day);
                        const isSelected = isEqual(day, selectedDay);
                        const isThisMonth = isSameMonth(day, firstDayCurrentMonth);
                        return (
                          <button key={day.toString()} onClick={() => setSelectedDay(day)}
                            className={cn("min-h-[100px] p-2 bg-white dark:bg-gray-950 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors text-left",
                              !isThisMonth && "bg-gray-50 dark:bg-gray-900 text-gray-400 dark:text-gray-600",
                              isSelected && "ring-2 ring-blue-500")}>
                            <time dateTime={format(day, "yyyy-MM-dd")}
                              className={cn("flex h-6 w-6 items-center justify-center rounded-full text-sm text-gray-900 dark:text-white",
                                isToday(day) && "bg-blue-600 text-white font-semibold")}>
                              {format(day, "d")}
                            </time>
                            <div className="mt-1 space-y-1">
                              {dayExams.slice(0, 2).map(exam => (
                                <button key={exam._id} onClick={e => { e.stopPropagation(); setSelectedExam(exam); }}
                                  className={cn("w-full text-left px-1 py-0.5 rounded text-xs text-white truncate", examTypeColors[exam.type])}>
                                  {exam.isGlobal ? "🔒 " : ""}{exam.subject}
                                </button>
                              ))}
                              {dayExams.length > 2 && <div className="text-xs text-gray-500">+{dayExams.length - 2} more</div>}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Week View */}
                {viewMode === "week" && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      {format(weekDays[0], "MMM d")} – {format(weekDays[6], "MMM d, yyyy")}
                    </h3>
                    <div className="grid grid-cols-7 gap-2">
                      {weekDays.map(day => {
                        const dayExams = getExamsForDay(day);
                        return (
                          <div key={day.toString()} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-white dark:bg-gray-900">
                            <div className="text-center mb-2">
                              <div className="text-xs text-gray-500 dark:text-gray-400">{format(day, "EEE")}</div>
                              <div className={cn("text-lg font-semibold text-gray-900 dark:text-white", isToday(day) && "text-blue-600")}>{format(day, "d")}</div>
                            </div>
                            <div className="space-y-1">
                              {dayExams.map(exam => {
                                const Icon = examTypeIcons[exam.type];
                                return (
                                  <button key={exam._id} onClick={() => setSelectedExam(exam)}
                                    className={cn("w-full text-left p-2 rounded text-xs text-white", examTypeColors[exam.type])}>
                                    <div className="flex items-center gap-1"><Icon className="h-3 w-3" /><span className="truncate">{exam.subject}</span></div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Day View */}
                {viewMode === "day" && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{format(selectedDay, "EEEE, MMMM d, yyyy")}</h3>
                    <ScrollArea className="h-[500px]">
                      <div className="space-y-3">
                        {getExamsForDay(selectedDay).length === 0 ? (
                          <p className="text-center text-gray-500 dark:text-gray-400 py-8">No exams scheduled for this day</p>
                        ) : getExamsForDay(selectedDay).map(exam => {
                          const Icon = examTypeIcons[exam.type];
                          return (
                            <button key={exam._id} onClick={() => setSelectedExam(exam)}
                              className="w-full text-left p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                              <div className="flex items-start gap-4">
                                <div className={cn("p-3 rounded-lg", examTypeColors[exam.type])}>
                                  <Icon className="h-6 w-6 text-white" />
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-semibold text-lg text-gray-900 dark:text-white">{exam.subject}</h4>
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    <Badge className={examTypeBadgeColors[exam.type]}>{exam.type}</Badge>
                                    <span className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400"><Clock className="h-3 w-3" />{exam.time}</span>
                                    {exam.location && <span className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400"><MapPin className="h-3 w-3" />{exam.location}</span>}
                                  </div>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Add Exam Dialog */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="max-w-md bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white">Add New Exam</DialogTitle>
            <DialogDescription className="text-gray-500 dark:text-gray-400">Schedule a new exam or quiz</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddExam} className="space-y-3">
            {addError && <p className="text-red-500 text-sm">{addError}</p>}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Subject *</label>
              <input value={newExam.subject} onChange={e => setNewExam({...newExam, subject: e.target.value})}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Type *</label>
              <select value={newExam.type} onChange={e => setNewExam({...newExam, type: e.target.value})}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm">
                <option value="midterm">Midterm</option>
                <option value="final">Final</option>
                <option value="quiz">Quiz</option>
                <option value="practical">Practical</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Date *</label>
                <input type="date" value={newExam.date} onChange={e => setNewExam({...newExam, date: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Time *</label>
                <input value={newExam.time} onChange={e => setNewExam({...newExam, time: e.target.value})}
                  placeholder="9:00 AM - 11:00 AM"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Location</label>
                <input value={newExam.location} onChange={e => setNewExam({...newExam, location: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Duration</label>
                <input value={newExam.duration} onChange={e => setNewExam({...newExam, duration: e.target.value})}
                  placeholder="2 hours"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Notes</label>
              <textarea value={newExam.notes} onChange={e => setNewExam({...newExam, notes: e.target.value})}
                rows={2}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm resize-none" />
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">Add Exam</Button>
              <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}
                className="flex-1 dark:border-gray-700 dark:text-gray-300">Cancel</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Exam Detail Dialog */}
      <Dialog open={!!selectedExam} onOpenChange={() => setSelectedExam(null)}>
        <DialogContent className="max-w-md bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              {selectedExam && (() => { const Icon = examTypeIcons[selectedExam.type]; return <Icon className="h-5 w-5" />; })()}
              {selectedExam?.subject}
            </DialogTitle>
            <DialogDescription className="text-gray-500 dark:text-gray-400">Exam details and reminder settings</DialogDescription>
          </DialogHeader>

          {selectedExam && (
            <div className="space-y-4">
              <Badge className={examTypeBadgeColors[selectedExam.type]}>{selectedExam.type}</Badge>
              <Separator className="dark:bg-gray-800" />
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CalendarIcon className="h-4 w-4 mt-0.5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Date</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{format(selectedExam.date, "EEEE, MMMM d, yyyy")}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-4 w-4 mt-0.5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Time</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{selectedExam.time}</p>
                  </div>
                </div>
                {selectedExam.location && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 mt-0.5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Location</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{selectedExam.location}</p>
                    </div>
                  </div>
                )}
                {selectedExam.notes && (
                  <div className="flex items-start gap-3">
                    <FileText className="h-4 w-4 mt-0.5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Notes</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{selectedExam.notes}</p>
                    </div>
                  </div>
                )}
              </div>
              <Separator className="dark:bg-gray-800" />
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2"><Bell className="h-4 w-4" /> Reminders</h4>
                {[{ key: "oneDayBefore", label: "1 day before" }, { key: "oneHourBefore", label: "1 hour before" }].map(({ key, label }) => (
                  <div key={key} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                    <div className="flex items-center gap-2">
                      {selectedExam.reminders[key] ? <Bell className="h-4 w-4 text-blue-600" /> : <BellOff className="h-4 w-4 text-gray-400" />}
                      <span className="text-sm text-gray-900 dark:text-white">{label}</span>
                    </div>
                    <Switch checked={selectedExam.reminders[key]}
                      onCheckedChange={() => handleReminderToggle(selectedExam._id, key)}
                      className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-300" />
                  </div>
                ))}
              </div>
              {selectedExam.isGlobal ? (
                <div className="text-xs text-center text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-lg">
                  🔒 This exam was set by an admin and cannot be deleted
                </div>
              ) : (
                <Button variant="outline" size="sm"
                  onClick={() => handleDeleteExam(selectedExam._id)}
                  className="w-full text-red-500 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20 flex items-center gap-2">
                  <Trash2 className="h-4 w-4" /> Delete Exam
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
