import type { Task, TimetableTemplate } from '../types';

export const timetableTemplate: Task[] = [
  { id: 'wake', time: '07:00–07:15', label: 'Wake up & Fresh', completed: false, completedAt: null, notes: '', xp: 5, category: 'wake', color: '#f59e0b', icon: 'Sparkles', duration: 15, reminder: false },
  { id: 'school', time: '07:15–07:45', label: 'Drop Prajwal to School', completed: false, completedAt: null, notes: '', xp: 5, category: 'rest', color: '#8b5cf6', icon: 'Compass', duration: 30, reminder: false },
  { id: 'park', time: '07:45–08:30', label: 'Park Walk & Jog', completed: false, completedAt: null, notes: '', xp: 10, category: 'exercise', color: '#10b981', icon: 'Activity', duration: 45, reminder: false },
  { id: 'breakfast', time: '08:30–09:00', label: 'Bath & Breakfast', completed: false, completedAt: null, notes: '', xp: 5, category: 'rest', color: '#8b5cf6', icon: 'Coffee', duration: 30, reminder: false },
  { id: 'temple_morning', time: '09:00–09:15', label: 'Morning Temple Visit', completed: false, completedAt: null, notes: '', xp: 10, category: 'temple', color: '#ec4899', icon: 'Heart', duration: 15, reminder: false },
  { id: 'revision', time: '09:20–09:40', label: 'Topic Revision', completed: false, completedAt: null, notes: '', xp: 5, category: 'revision', color: '#3b82f6', icon: 'BookOpen', duration: 20, reminder: false },
  { id: 'python', time: '09:40–11:00', label: 'Python Programming', completed: false, completedAt: null, notes: '', xp: 15, category: 'coding', color: '#06b6d4', icon: 'Terminal', duration: 80, reminder: true },
  { id: 'rest_phone', time: '11:00–13:00', label: 'Rest & Phone Screen', completed: false, completedAt: null, notes: '', xp: 5, category: 'rest', color: '#8b5cf6', icon: 'Smartphone', duration: 120, reminder: false },
  { id: 'lunch_rest', time: '13:00–15:00', label: 'Lunch & Afternoon Rest', completed: false, completedAt: null, notes: '', xp: 5, category: 'rest', color: '#8b5cf6', icon: 'Utensils', duration: 120, reminder: false },
  { id: 'web_dev', time: '15:00–17:00', label: 'Web Development', completed: false, completedAt: null, notes: '', xp: 15, category: 'coding', color: '#06b6d4', icon: 'Terminal', duration: 120, reminder: true },
  { id: 'football', time: '17:00–18:30', label: 'Football Session', completed: false, completedAt: null, notes: '', xp: 10, category: 'exercise', color: '#10b981', icon: 'Activity', duration: 90, reminder: false },
  { id: 'project_dev', time: '18:35–20:30', label: 'Project Development', completed: false, completedAt: null, notes: '', xp: 20, category: 'coding', color: '#06b6d4', icon: 'Terminal', duration: 115, reminder: true },
  { id: 'dinner_rest', time: '20:30–21:00', label: 'Dinner & Relaxation', completed: false, completedAt: null, notes: '', xp: 5, category: 'rest', color: '#8b5cf6', icon: 'Moon', duration: 30, reminder: false },
  { id: 'temple_evening', time: '21:00–22:00', label: 'Evening Temple Prayers', completed: false, completedAt: null, notes: '', xp: 10, category: 'temple', color: '#ec4899', icon: 'Heart', duration: 60, reminder: false },
  { id: 'food_mobile', time: '22:00–23:00', label: 'Late Snacks & Mobile', completed: false, completedAt: null, notes: '', xp: 5, category: 'rest', color: '#8b5cf6', icon: 'Smartphone', duration: 60, reminder: false },
  { id: 'sleep', time: '23:00–07:00', label: 'Night Sleep', completed: false, completedAt: null, notes: '', xp: 10, category: 'sleep', color: '#6366f1', icon: 'Moon', duration: 480, reminder: false }
];

export const initialTemplates: TimetableTemplate[] = [
  {
    id: 'default',
    name: 'Standard Daily',
    tasks: timetableTemplate.map(t => ({
      id: t.id,
      time: t.time,
      label: t.label,
      category: t.category,
      color: t.color || '#3b82f6',
      icon: t.icon || 'Activity',
      xp: t.xp,
      duration: t.duration || 60,
      reminder: t.reminder || false
    }))
  },
  {
    id: 'college',
    name: 'College Semester',
    tasks: [
      { id: 'wake', time: '06:30', label: 'Wake Up & Fresh', category: 'wake', color: '#f59e0b', icon: 'Sparkles', xp: 5, duration: 30, reminder: false },
      { id: 'commute_morning', time: '07:00', label: 'Commute to Campus', category: 'rest', color: '#8b5cf6', icon: 'Compass', xp: 5, duration: 60, reminder: false },
      { id: 'lectures', time: '08:00', label: 'Core College Lectures', category: 'coding', color: '#06b6d4', icon: 'BookOpen', xp: 20, duration: 300, reminder: true },
      { id: 'lunch_break', time: '13:00', label: 'Cafeteria Lunch', category: 'rest', color: '#8b5cf6', icon: 'Utensils', xp: 5, duration: 60, reminder: false },
      { id: 'library_session', time: '14:00', label: 'Library Study & Research', category: 'revision', color: '#3b82f6', icon: 'BookOpen', xp: 15, duration: 120, reminder: false },
      { id: 'commute_evening', time: '16:00', label: 'Travel back home', category: 'rest', color: '#8b5cf6', icon: 'Compass', xp: 5, duration: 60, reminder: false },
      { id: 'exercise_gym', time: '17:00', label: 'Cardio Workout', category: 'exercise', color: '#10b981', icon: 'Activity', xp: 10, duration: 90, reminder: false },
      { id: 'project_work', time: '19:00', label: 'React Assignment Sprints', category: 'coding', color: '#06b6d4', icon: 'Terminal', xp: 20, duration: 120, reminder: true },
      { id: 'dinner_rest', time: '21:00', label: 'Dinner & Refresh', category: 'rest', color: '#8b5cf6', icon: 'Coffee', xp: 5, duration: 60, reminder: false },
      { id: 'sleep', time: '22:00', label: 'Bedtime Sleep', category: 'sleep', color: '#6366f1', icon: 'Moon', xp: 10, duration: 510, reminder: false }
    ]
  },
  {
    id: 'gym',
    name: 'Gym & Fitness Day',
    tasks: [
      { id: 'wake', time: '06:00', label: 'Early Rise & Pre-workout hydration', category: 'wake', color: '#f59e0b', icon: 'Sparkles', xp: 5, duration: 30, reminder: false },
      { id: 'gym_workout', time: '06:30', label: 'Heavy Strength Gym Session', category: 'exercise', color: '#10b981', icon: 'Activity', xp: 25, duration: 90, reminder: true },
      { id: 'protein_breakfast', time: '08:00', label: 'Post-workout Shower & Protein Breakfast', category: 'rest', color: '#8b5cf6', icon: 'Coffee', xp: 5, duration: 60, reminder: false },
      { id: 'coding_morning', time: '09:00', label: 'Python Automation Scripts', category: 'coding', color: '#06b6d4', icon: 'Terminal', xp: 20, duration: 180, reminder: true },
      { id: 'lunch_rest', time: '12:00', label: 'High-carb Lunch & Rest', category: 'rest', color: '#8b5cf6', icon: 'Utensils', xp: 5, duration: 120, reminder: false },
      { id: 'web_dev_afternoon', time: '14:00', label: 'UI Tailwind Coding', category: 'coding', color: '#3b82f6', icon: 'Terminal', xp: 15, duration: 180, reminder: true },
      { id: 'evening_stretch', time: '17:00', label: 'Stretching & Jog in park', category: 'exercise', color: '#10b981', icon: 'Activity', xp: 10, duration: 60, reminder: false },
      { id: 'temple_evening', time: '18:30', label: 'Temple Devotional Visit', category: 'temple', color: '#ec4899', icon: 'Heart', xp: 10, duration: 60, reminder: false },
      { id: 'dinner_sleep', time: '20:30', label: 'Dinner & Healthy Sleep prep', category: 'sleep', color: '#6366f1', icon: 'Moon', xp: 10, duration: 570, reminder: false }
    ]
  },
  {
    id: 'office',
    name: 'Office Sprints',
    tasks: [
      { id: 'wake', time: '07:00', label: 'Wake up, Dress & Hydrate', category: 'wake', color: '#f59e0b', icon: 'Sparkles', xp: 5, duration: 30, reminder: false },
      { id: 'office_commute', time: '07:30', label: 'Morning Commute & Audiobooks', category: 'revision', color: '#3b82f6', icon: 'Compass', xp: 5, duration: 90, reminder: false },
      { id: 'standup', time: '09:00', label: 'Agile Morning Standup', category: 'rest', color: '#8b5cf6', icon: 'Compass', xp: 5, duration: 30, reminder: false },
      { id: 'sprint_coding', time: '09:30', label: 'Production Software Dev Sprints', category: 'coding', color: '#06b6d4', icon: 'Terminal', xp: 20, duration: 150, reminder: true },
      { id: 'lunch_networking', time: '12:00', label: 'Team Lunch Break', category: 'rest', color: '#8b5cf6', icon: 'Utensils', xp: 5, duration: 60, reminder: false },
      { id: 'reviews_meetings', time: '13:00', label: 'Code Reviews & Sprint Planning', category: 'coding', color: '#06b6d4', icon: 'BookOpen', xp: 15, duration: 180, reminder: true },
      { id: 'commute_home', time: '16:00', label: 'Evening Travel Home', category: 'rest', color: '#8b5cf6', icon: 'Compass', xp: 5, duration: 90, reminder: false },
      { id: 'park_run', time: '17:30', label: 'Park Run & Stretch', category: 'exercise', color: '#10b981', icon: 'Activity', xp: 10, duration: 60, reminder: false },
      { id: 'dinner_leisure', time: '19:00', label: 'Dinner & Personal side-projects', category: 'coding', color: '#06b6d4', icon: 'Terminal', xp: 20, duration: 180, reminder: false },
      { id: 'sleep', time: '22:00', label: 'Office Day Sleep Recovery', category: 'sleep', color: '#6366f1', icon: 'Moon', xp: 10, duration: 540, reminder: false }
    ]
  },
  {
    id: 'weekend',
    name: 'Weekend Hobbies',
    tasks: [
      { id: 'wake_late', time: '09:00', label: 'Lazy Rise & Slow Tea', category: 'wake', color: '#f59e0b', icon: 'Coffee', xp: 5, duration: 60, reminder: false },
      { id: 'hobby_project', time: '10:00', label: 'Hobby Project Hackathon', category: 'coding', color: '#06b6d4', icon: 'Terminal', xp: 20, duration: 180, reminder: false },
      { id: 'family_lunch', time: '13:00', label: 'Family Lunch & Socializing', category: 'rest', color: '#8b5cf6', icon: 'Utensils', xp: 5, duration: 120, reminder: false },
      { id: 'football_match', time: '15:00', label: 'Football Friendly Match', category: 'exercise', color: '#10b981', icon: 'Activity', xp: 20, duration: 150, reminder: false },
      { id: 'temple_evening', time: '18:00', label: 'Weekend Temple prayers', category: 'temple', color: '#ec4899', icon: 'Heart', xp: 10, duration: 90, reminder: false },
      { id: 'gaming_movies', time: '20:00', label: 'Gaming and Evening movies', category: 'rest', color: '#8b5cf6', icon: 'Smartphone', xp: 5, duration: 180, reminder: false },
      { id: 'sleep', time: '23:30', label: 'Late Bedtime Sleep', category: 'sleep', color: '#6366f1', icon: 'Moon', xp: 10, duration: 570, reminder: false }
    ]
  },
  {
    id: 'exams',
    name: 'Exam Preparation',
    tasks: [
      { id: 'early_wake', time: '05:30', label: 'Early Study Prep & Coffee', category: 'wake', color: '#f59e0b', icon: 'Coffee', xp: 5, duration: 30, reminder: false },
      { id: 'revision_block_1', time: '06:00', label: 'Intense Syllabus Revision Block 1', category: 'revision', color: '#3b82f6', icon: 'BookOpen', xp: 25, duration: 180, reminder: true },
      { id: 'breakfast_shower', time: '09:00', label: 'Shower & Breakfast Boost', category: 'rest', color: '#8b5cf6', icon: 'Coffee', xp: 5, duration: 60, reminder: false },
      { id: 'revision_block_2', time: '10:00', label: 'Formula & Coding Syntaxes Block 2', category: 'coding', color: '#06b6d4', icon: 'Terminal', xp: 20, duration: 180, reminder: true },
      { id: 'lunch_rest', time: '13:00', label: 'Power nap & quick lunch', category: 'rest', color: '#8b5cf6', icon: 'Utensils', xp: 5, duration: 90, reminder: false },
      { id: 'mock_exam', time: '14:30', label: 'Timed Mock Practice Exam', category: 'revision', color: '#3b82f6', icon: 'BookOpen', xp: 30, duration: 180, reminder: true },
      { id: 'park_air', time: '17:30', label: 'Park walking for fresh air', category: 'exercise', color: '#10b981', icon: 'Activity', xp: 10, duration: 60, reminder: false },
      { id: 'temple_peace', time: '18:30', label: 'Temple for mental peace', category: 'temple', color: '#ec4899', icon: 'Heart', xp: 10, duration: 60, reminder: false },
      { id: 'dinner_rest', time: '19:30', label: 'Dinner & Final Notes Review', category: 'revision', color: '#3b82f6', icon: 'BookOpen', xp: 15, duration: 120, reminder: false },
      { id: 'early_sleep', time: '21:30', label: 'Deep Sleep recovery', category: 'sleep', color: '#6366f1', icon: 'Moon', xp: 10, duration: 480, reminder: false }
    ]
  }
];
