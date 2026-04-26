// src/features/student/views/courses.view.js
// কোর্সসমূহ পেজ

import { StudentData } from '../student.data.js';
import { getState } from '../../../core/state/store.js';
import { renderCourseList } from '../components/course-card.js';

export async function renderCourses(container) {
    container.innerHTML = `<div class="p-5 pb-20"><h2 class="text-2xl font-bold mb-4">Courses</h2><div id="courses-list" class="grid grid-cols-1 md:grid-cols-2 gap-4"></div></div>`;
    const courses = await StudentData.loadAvailableCourses();
    const joinedIds = (getState('joinedGroups') || []).map(g => g.groupId);
    document.getElementById('courses-list').innerHTML = renderCourseList(courses, joinedIds);
}
