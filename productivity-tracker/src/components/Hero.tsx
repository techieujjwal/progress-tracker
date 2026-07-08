import { useEffect, useState, useRef } from 'react';
import { useTrackerStore } from '../store/useTrackerStore';
import { calculateDayEfficiency } from '../utils/trackerCalculations';
import { formatDateLabel } from '../utils/dateHelpers';
import gsap from 'gsap';
import { Flame, Calendar, Clock, Quote, Sparkles } from 'lucide-react';

export default function Hero() {
  const selectedDate = useTrackerStore(state => state.selectedDate);
  const logs = useTrackerStore(state => state.logs);
  const streakState = useTrackerStore(state => state.streakState);
  const level = useTrackerStore(state => state.level);
  
  const [time, setTime] = useState(new Date());
  
  const greetingRef = useRef<HTMLHeadingElement>(null);
  const timeRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<SVGCircleElement>(null);

  const quotes = [
    "Consistency is the compound interest of self-improvement.",
    "Focus on being productive instead of busy.",
    "Make each day your masterpiece.",
    "The secret of getting ahead is getting started.",
    "Don't count the days, make the days count.",
    "Small daily improvements over time lead to stunning results.",
    "Amateurs sit and wait for inspiration, the rest of us just get up and go to work."
  ];

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const dayIndex = new Date(selectedDate).getDate() % quotes.length;
  const quote = quotes[dayIndex];

  const todayTasks = logs[selectedDate] || [];
  const efficiency = calculateDayEfficiency(todayTasks);
  const radius = 54;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (efficiency / 100) * circumference;

  useEffect(() => {
    const tl = gsap.timeline();
    tl.fromTo(
      greetingRef.current,
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
    );
    tl.fromTo(
      timeRef.current,
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1, duration: 0.6, ease: 'power2.out' },
      '-=0.4'
    );
    tl.fromTo(
      statsRef.current?.children || [],
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, stagger: 0.1, duration: 0.6, ease: 'power2.out' },
      '-=0.3'
    );

    return () => {
      tl.kill();
    };
  }, []);

  useEffect(() => {
    if (ringRef.current) {
      gsap.to(ringRef.current, {
        strokeDashoffset,
        duration: 1.2,
        ease: 'power2.out'
      });
    }
  }, [strokeDashoffset]);

  const getGreetingText = () => {
    const hours = time.getHours();
    if (hours < 12) return 'Good Morning Ujjwal 👋';
    if (hours < 17) return 'Good Afternoon Ujjwal 👋';
    return 'Good Evening Ujjwal 👋';
  };

  return (
    <div className="relative overflow-hidden bg-[#111827]/40 border border-white/5 p-6 sm:p-8 rounded-[24px] backdrop-blur-xl flex flex-col lg:flex-row justify-between items-stretch gap-8 shadow-2xl">
      <div className="flex-1 flex flex-col justify-between gap-6">
        <div className="flex flex-col gap-2">
          <h1 ref={greetingRef} className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            {getGreetingText()}
          </h1>
          <div ref={timeRef} className="flex flex-wrap items-center gap-4 text-white/50 text-sm mt-1">
            <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
              <Calendar className="w-4 h-4 text-blue-400" />
              {formatDateLabel(selectedDate)}
            </span>
            <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/5 font-mono">
              <Clock className="w-4 h-4 text-purple-400" />
              {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>
        </div>

        <div className="flex items-start gap-3 bg-white/5 border border-white/5 p-4 rounded-2xl relative max-w-xl">
          <Quote className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
          <p className="text-white/70 text-sm italic leading-relaxed">
            {quote}
          </p>
        </div>
      </div>

      <div ref={statsRef} className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8 justify-around lg:justify-end shrink-0 border-t lg:border-t-0 lg:border-l border-white/5 pt-6 lg:pt-0 lg:pl-8">
        <div className="flex items-center gap-4 bg-white/5 border border-white/5 px-5 py-4 rounded-[20px] min-w-[140px] justify-center hover:bg-white/10 transition-colors">
          <div className="flex flex-col items-center">
            <span className="text-white/40 text-xs font-semibold uppercase tracking-wider">Streak</span>
            <div className="flex items-center gap-1 mt-1">
              <Flame className="w-5 h-5 text-orange-500 fill-orange-500 animate-bounce" />
              <span className="text-2xl font-bold">{streakState.currentStreak}</span>
            </div>
            <span className="text-white/30 text-[10px] mt-0.5">Best: {streakState.longestStreak}</span>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-white/5 border border-white/5 px-5 py-4 rounded-[20px] min-w-[140px] justify-center hover:bg-white/10 transition-colors">
          <div className="flex flex-col items-center">
            <span className="text-white/40 text-xs font-semibold uppercase tracking-wider">Level</span>
            <div className="flex items-center gap-1 mt-1">
              <Sparkles className="w-5 h-5 text-purple-400 fill-purple-400/20" />
              <span className="text-2xl font-bold">{level}</span>
            </div>
            <span className="text-white/30 text-[10px] mt-0.5">Focus Mode</span>
          </div>
        </div>

        <div className="relative flex flex-col items-center justify-center bg-white/5 border border-white/5 p-4 rounded-[24px] w-[140px] h-[140px]">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              className="text-white/5"
              strokeWidth={stroke}
              stroke="currentColor"
              fill="transparent"
              r={normalizedRadius}
              cx={radius}
              cy={radius}
            />
            <circle
              ref={ringRef}
              className="text-blue-500 transition-all duration-300"
              strokeWidth={stroke}
              strokeDasharray={circumference + ' ' + circumference}
              strokeDashoffset={circumference}
              strokeLinecap="round"
              stroke="url(#heroGrad)"
              fill="transparent"
              r={normalizedRadius}
              cx={radius}
              cy={radius}
            />
            <defs>
              <linearGradient id="heroGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-2xl font-extrabold tracking-tight">{efficiency}%</span>
            <span className="text-[10px] text-white/40 font-medium">Efficiency</span>
          </div>
        </div>
      </div>
    </div>
  );
}
