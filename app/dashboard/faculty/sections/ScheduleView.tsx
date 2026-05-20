'use client';
import { useState, useEffect } from 'react';

export default function ScheduleView() {
  const [schedule, setSchedule] = useState([]);

  useEffect(() => {
    fetch('/api/faculty/submit-grade/portal?section=Schedule')
      .then(res => res.json())
      .then(d => setSchedule(d.schedule || []))
      .catch(err => console.error('Failed to load schedule:', err));
  }, []);

  return (
    <div className="bg-white border p-6 rounded-xl shadow-sm space-y-4">
      <h3 className="text-sm font-bold text-slate-900">Weekly Lecture Timetable</h3>
      <div className="divide-y border rounded-lg overflow-hidden">
        {schedule.map((slot: any, i) => (
          <div key={i} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white text-xs">
            <div>
              <span className="font-extrabold text-slate-400 uppercase font-mono tracking-wider">{slot.day}</span>
              <p className="text-sm font-bold text-slate-800 mt-0.5">{slot.course}</p>
            </div>
            <div className="sm:text-right">
              <p className="font-bold text-indigo-600">{slot.time}</p>
              <p className="text-slate-400 font-medium mt-0.5">Location: {slot.room}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}