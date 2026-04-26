// src/core/constants/routes.js
// রাউট ডেফিনিশন (groups সহ)

export const STUDENT_ROUTES = [
    { path: 'dashboard', label: 'হোম' },
    { path: 'courses', label: 'কোর্সসমূহ' },
    { path: 'rank', label: 'র‌্যাংক' },
    { path: 'results', label: 'ফলাফল' },
    { path: 'analysis', label: 'অগ্রগতি' },
    { path: 'notices', label: 'নোটিস' },
    { path: 'management', label: 'ম্যানেজমেন্ট' },
    { path: 'profile', label: 'প্রোফাইল' },
];

export const TEACHER_ROUTES = [
    { path: 'home', label: 'হোমপেজ' },
    { path: 'create', label: 'পরীক্ষা তৈরি' },
    { path: 'rank', label: 'র‌্যাংক' },
    { path: 'folders', label: 'লাইব্রেরি' },
    { path: 'management', label: 'ম্যানেজমেন্ট' },
    { path: 'groups', label: 'কোর্স ব্যবস্থাপনা' },
];
