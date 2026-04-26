import { escapeHtml } from '../../core/utils/sanitize.js';

export function renderAuthScreen() {
    const div = document.createElement('div');
    div.id = 'auth-screen';
    div.className = 'fixed inset-0 z-40 hidden flex flex-col items-center justify-center p-6';
    div.style.background = 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)';
    div.innerHTML = `
        <div class="w-full max-w-md">
            <div class="flex justify-center mb-6">
                <div class="flex bg-white/10 rounded-xl p-1">
                    <button id="role-student-btn" class="px-6 py-2 rounded-lg font-bold text-sm text-white bg-indigo-600 transition" onclick="switchAuthRole('student')">Student</button>
                    <button id="role-teacher-btn" class="px-6 py-2 rounded-lg font-bold text-sm text-white/60 transition" onclick="switchAuthRole('teacher')">Teacher</button>
                </div>
            </div>
            <div id="student-auth-form" class="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
                <h2 class="text-white text-xl font-bold mb-4 text-center">Student Login</h2>
                <input type="email" id="s-email" class="w-full p-3 bg-white/10 border border-white/20 rounded-xl mb-3 text-white placeholder-white/40" placeholder="Email">
                <div class="relative mb-4">
                    <input type="password" id="s-pass" class="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40" placeholder="Password">
                    <i class="fas fa-eye absolute right-4 top-1/2 -translate-y-1/2 text-white/40 cursor-pointer" onclick="togglePassword('s-pass', this)"></i>
                </div>
                <button id="student-login-btn" class="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold mb-2" onclick="handleStudentLogin()">Login as Student</button>
                <p class="text-white/50 text-sm text-center mt-2">No account? <span class="text-indigo-400 cursor-pointer font-bold" onclick="signupStudent()">Sign Up</span></p>
            </div>
            <div id="teacher-auth-form" class="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 hidden">
                <h2 class="text-white text-xl font-bold mb-4 text-center">Teacher Login</h2>
                <input type="email" id="t-email" class="w-full p-3 bg-white/10 border border-white/20 rounded-xl mb-3 text-white placeholder-white/40" placeholder="Email">
                <div class="relative mb-4">
                    <input type="password" id="t-pass" class="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40" placeholder="Password">
                    <i class="fas fa-eye absolute right-4 top-1/2 -translate-y-1/2 text-white/40 cursor-pointer" onclick="togglePassword('t-pass', this)"></i>
                </div>
                <button id="teacher-login-btn" class="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold" onclick="handleTeacherLogin()">Login as Teacher</button>
            </div>
        </div>
    `;
    document.body.appendChild(div);

    // গ্লোবাল হেল্পার ফাংশন (এই কম্পোনেন্টের বাইরে থেকেও কল হতে পারে)
    window.switchAuthRole = (role) => {
        const studentBtn = document.getElementById('role-student-btn');
        const teacherBtn = document.getElementById('role-teacher-btn');
        const studentForm = document.getElementById('student-auth-form');
        const teacherForm = document.getElementById('teacher-auth-form');
        if (role === 'student') {
            studentBtn.className = 'px-6 py-2 rounded-lg font-bold text-sm text-white bg-indigo-600 transition';
            teacherBtn.className = 'px-6 py-2 rounded-lg font-bold text-sm text-white/60 transition';
            studentForm.classList.remove('hidden');
            teacherForm.classList.add('hidden');
        } else {
            teacherBtn.className = 'px-6 py-2 rounded-lg font-bold text-sm text-white bg-emerald-600 transition';
            studentBtn.className = 'px-6 py-2 rounded-lg font-bold text-sm text-white/60 transition';
            teacherForm.classList.remove('hidden');
            studentForm.classList.add('hidden');
        }
    };

    window.togglePassword = (id, el) => {
        const inp = document.getElementById(id);
        if (inp.type === 'password') { inp.type = 'text'; el.classList.replace('fa-eye', 'fa-eye-slash'); }
        else { inp.type = 'password'; el.classList.replace('fa-eye-slash', 'fa-eye'); }
    };

    window.handleStudentLogin = async () => {
        const { AuthService } = await import('../../core/services/auth.service.js');
        try {
            await AuthService.loginStudent(
                document.getElementById('s-email').value,
                document.getElementById('s-pass').value
            );
        } catch (e) { Swal.fire('Error', e.message, 'error'); }
    };

    window.handleTeacherLogin = async () => {
        const { AuthService } = await import('../../core/services/auth.service.js');
        try {
            await AuthService.loginTeacher(
                document.getElementById('t-email').value,
                document.getElementById('t-pass').value
            );
        } catch (e) { Swal.fire('Error', e.message, 'error'); }
    };

    window.signupStudent = async () => {
        const { value: email } = await Swal.fire({ title: 'Sign Up', input: 'email', inputLabel: 'Email', showCancelButton: true });
        if (!email) return;
        const { value: password } = await Swal.fire({ title: 'Password', input: 'password', inputLabel: 'Password', showCancelButton: true });
        if (!password) return;
        const { AuthService } = await import('../../core/services/auth.service.js');
        try { await AuthService.signupStudent(email, password); } catch (e) { Swal.fire('Error', e.message, 'error'); }
    };
}
