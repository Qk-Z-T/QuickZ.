// src/core/services/auth.service.js
// অথেন্টিকেশন সার্ভিস — লগইন, লগআউট, সেশন ম্যানেজমেন্ট

import { auth, db } from '../config/firebase.js';
import { FirestoreService } from './firestore.service.js';
import { getState, setState, dispatch } from '../state/store.js';
import { EventBus } from '../state/event-bus.js';
import { STORAGE_KEYS } from '../constants/app-constants.js';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

/**
 * স্টুডেন্ট লগইন
 */
async function loginStudent(email, password) {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const { data: userData } = await FirestoreService.getDocument('students', cred.user.uid);
    if (!userData) throw new Error('Student profile not found');
    if (userData.blocked) {
        await signOut(auth);
        throw new Error('Account blocked');
    }
    dispatch({
        role: 'student',
        user: cred.user,
        currentUser: { ...userData, id: cred.user.uid },
        profileCompleted: userData.profileCompleted || false,
        userDisabled: userData.disabled || false,
        teacherCodes: normalizeTeacherCodes(userData.teacherCodes || []),
        joinedGroups: userData.joinedGroups || [],
        classLevel: userData.classLevel || '',
        admissionStream: userData.admissionStream || '',
    });
    localStorage.setItem(STORAGE_KEYS.USER_LOGGED_IN, 'true');
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(userData));
    EventBus.emit('auth:login', { role: 'student' });
}

/**
 * টিচার লগইন
 */
async function loginTeacher(email, password) {
    // টিচারদের auth অ্যাকাউন্ট নেই, সরাসরি Firestore থেকে ভেরিফাই করতে হবে
    const teachers = await FirestoreService.queryDocuments('teachers', [
        { field: 'email', operator: '==', value: email },
        { field: 'password', operator: '==', value: password }
    ]);
    if (teachers.length === 0) throw new Error('Invalid email or password');
    const teacher = teachers[0];
    // Firebase Auth-এ সাইন-ইন করি (ইমেইল/পাসওয়ার্ড ইউজ করলে)
    // যেহেতু টিচারদের auth অ্যাকাউন্ট নেই, Firebase Auth-এ কাস্টম টোকেন দরকার।
    // আপাতত আমরা একটি ডামি Firebase Auth ইউজার তৈরি করবো অথবা সাইন-ইন ছাড়াই স্টেট সেট করব।
    // বর্তমান আর্কিটেকচারে টিচার auth ছাড়াই চলে, তাই আমরা auth.currentUser সেট করি না।
    dispatch({
        role: 'teacher',
        user: { uid: teacher.id, email: teacher.email }, // নকল ইউজার অবজেক্ট
        currentUser: { ...teacher, id: teacher.id },
        profileCompleted: !!(teacher.fullName && teacher.phone),
        selectedGroup: null,
    });
    localStorage.setItem(STORAGE_KEYS.TEACHER_DATA, JSON.stringify(teacher));
    localStorage.setItem('teacher_sess', 'true');
    EventBus.emit('auth:login', { role: 'teacher' });
}

/**
 * টিচার অ্যাকাউন্ট তৈরি (Firestore-এ)
 */
async function createTeacherAccount(teacherData) {
    const existing = await FirestoreService.queryDocuments('teachers', [
        { field: 'email', operator: '==', value: teacherData.email }
    ]);
    if (existing.length > 0) throw new Error('Teacher already exists');
    const id = await FirestoreService.addDocument('teachers', teacherData);
    return id;
}

/**
 * স্টুডেন্ট সাইনআপ
 */
async function signupStudent(email, password) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const userData = {
        uid: cred.user.uid,
        email,
        name: '',
        phone: '',
        fatherPhone: '',
        motherPhone: '',
        schoolName: '',
        collegeName: '',
        teacherCodes: [],
        joinedGroups: [],
        profileCompleted: false,
        blocked: false,
        disabled: false,
        joined: new Date(),
    };
    await FirestoreService.setDocument('students', cred.user.uid, userData);
    dispatch({
        role: 'student',
        user: cred.user,
        currentUser: { ...userData, id: cred.user.uid },
        profileCompleted: false,
        teacherCodes: [],
        joinedGroups: [],
    });
    localStorage.setItem(STORAGE_KEYS.USER_LOGGED_IN, 'true');
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(userData));
    EventBus.emit('auth:signup', { role: 'student' });
}

/**
 * লগআউট
 */
async function logout() {
    localStorage.setItem(STORAGE_KEYS.EXPLICIT_LOGOUT, 'true');
    // টিচার হলে Auth-এ সাইন-ইন নেই, শুধুমাত্র স্টুডেন্ট হলে সাইনআউট
    if (getState('role') === 'student') {
        await signOut(auth);
    }
    // সব ক্লিন
    [
        STORAGE_KEYS.USER_LOGGED_IN,
        STORAGE_KEYS.USER_PROFILE,
        STORAGE_KEYS.TEACHER_DATA,
        'teacher_sess',
        STORAGE_KEYS.SELECTED_GROUP,
        STORAGE_KEYS.ACTIVE_GROUP,
    ].forEach(k => localStorage.removeItem(k));
    // স্টেট রিসেট
    import('../state/store.js').then(m => m.resetState());
    EventBus.emit('auth:logout');
}

/**
 * অথ স্টেট চেঞ্জ লিসেনার (Firebase onAuthStateChanged)
 */
function initAuthListener() {
    onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
            // স্টুডেন্ট অটো-লগইন
            try {
                const { data } = await FirestoreService.getDocument('students', firebaseUser.uid);
                if (data && !data.blocked) {
                    dispatch({
                        role: 'student',
                        user: firebaseUser,
                        currentUser: { ...data, id: firebaseUser.uid },
                        profileCompleted: data.profileCompleted || false,
                        userDisabled: data.disabled || false,
                        teacherCodes: normalizeTeacherCodes(data.teacherCodes || []),
                        joinedGroups: data.joinedGroups || [],
                    });
                    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(data));
                    EventBus.emit('auth:login', { role: 'student' });
                } else {
                    logout(); // blocked বা প্রোফাইল নেই
                }
            } catch (e) {
                console.warn('Auto-login failed:', e);
                logout();
            }
        } else {
            // ইউজার সাইন আউট করেছে (অথবা টিচার মোডে)
            // টিচার মোডের জন্য আমরা আলাদাভাবে হ‍্যান্ডেল করব
            const explicit = localStorage.getItem(STORAGE_KEYS.EXPLICIT_LOGOUT) === 'true';
            if (explicit) {
                logout();
            }
            // যদি টিচার লোকাল সেশন থাকে, সেটা রিস্টোর করব
            const teacherData = localStorage.getItem(STORAGE_KEYS.TEACHER_DATA);
            if (teacherData && !explicit) {
                const teacher = JSON.parse(teacherData);
                dispatch({
                    role: 'teacher',
                    user: { uid: teacher.id, email: teacher.email },
                    currentUser: { ...teacher, id: teacher.id },
                    profileCompleted: !!(teacher.fullName && teacher.phone),
                });
                EventBus.emit('auth:login', { role: 'teacher' });
            }
        }
    });
}

// হেল্পার: পুরনো ফরম্যাটের teacherCodes গুলোকে [{code, active}] ফরম্যাটে আনা
function normalizeTeacherCodes(codes) {
    if (!Array.isArray(codes)) return [];
    return codes.map(c => (typeof c === 'string' ? { code: c, active: false } : c));
}

export const AuthService = {
    loginStudent,
    loginTeacher,
    signupStudent,
    createTeacherAccount,
    logout,
    initAuthListener,
};

window.AuthService = AuthService;
