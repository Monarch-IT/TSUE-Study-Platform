import { supabase } from '@/lib/supabase';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface TeacherGroup {
    id: number;
    teacher_uuid: string;
    group_name: string;
    created_at: number;
}

export interface Assignment {
    id: number;
    teacher_uuid: string;
    title: string;
    description: string;
    type: 'quiz' | 'code' | 'theory';
    mode: 'auto' | 'manual';
    source_file_url?: string;
    generated_content: any[];
    manual_content: any[];
    target_groups: string[];
    grading_mode: 'ai' | 'manual';
    deadline?: number;
    status: string;
    created_at: number;
}

export interface AssignmentSubmission {
    id: number;
    assignment_id: number;
    student_uuid: string;
    student_name: string;
    student_tsue_id: string;
    code?: string;
    answers?: any;
    ai_score?: number;
    ai_feedback?: string;
    ai_metrics?: any;
    teacher_score?: number;
    teacher_feedback?: string;
    status: string;
    submitted_at: number;
    graded_at?: number;
}

export interface ActivityLog {
    id: number;
    assignment_id: number;
    student_uuid: string;
    student_name: string;
    action: string;
    details: any;
    created_at: number;
}

// ─── Teacher Invite Code ─────────────────────────────────────────────────────

export const generateTeacherCode = (): string => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'TEACH-';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
};

// ─── Teacher Groups ──────────────────────────────────────────────────────────

export const getTeacherGroups = async (teacherUuid: string): Promise<TeacherGroup[]> => {
    const { data, error } = await supabase
        .from('teacher_groups')
        .select('*')
        .eq('teacher_uuid', teacherUuid)
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
};

export const addTeacherGroup = async (teacherUuid: string, groupName: string): Promise<TeacherGroup> => {
    const { data, error } = await supabase
        .from('teacher_groups')
        .insert({ teacher_uuid: teacherUuid, group_name: groupName })
        .select()
        .single();
    if (error) throw error;
    return data;
};

export const deleteTeacherGroup = async (groupId: number): Promise<void> => {
    const { error } = await supabase.from('teacher_groups').delete().eq('id', groupId);
    if (error) throw error;
};

// ─── Students in Groups ──────────────────────────────────────────────────────

export const getStudentsInGroup = async (groupName: string) => {
    const { data, error } = await supabase
        .from('users')
        .select('uuid, id, "fullName", email, "group", course, role')
        .eq('group', groupName)
        .eq('role', 'student');
    if (error) throw error;
    return data || [];
};

export const getStudentsInGroups = async (groupNames: string[]) => {
    if (!groupNames.length) return [];
    const { data, error } = await supabase
        .from('users')
        .select('uuid, id, "fullName", email, "group", course, role')
        .in('group', groupNames)
        .eq('role', 'student');
    if (error) throw error;
    return data || [];
};

// ─── Assignments ─────────────────────────────────────────────────────────────

export const getTeacherAssignments = async (teacherUuid: string): Promise<Assignment[]> => {
    const { data, error } = await supabase
        .from('assignments')
        .select('*')
        .eq('teacher_uuid', teacherUuid)
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
};

export const createAssignment = async (assignment: Partial<Assignment>): Promise<Assignment> => {
    const { data, error } = await supabase
        .from('assignments')
        .insert(assignment)
        .select()
        .single();
    if (error) throw error;
    return data;
};

export const updateAssignment = async (id: number, updates: Partial<Assignment>): Promise<void> => {
    const { error } = await supabase.from('assignments').update(updates).eq('id', id);
    if (error) throw error;
};

export const deleteAssignment = async (id: number): Promise<void> => {
    const { error } = await supabase.from('assignments').delete().eq('id', id);
    if (error) throw error;
};

// ─── Submissions ─────────────────────────────────────────────────────────────

export const getSubmissionsForAssignment = async (assignmentId: number): Promise<AssignmentSubmission[]> => {
    const { data, error } = await supabase
        .from('assignment_submissions')
        .select('*')
        .eq('assignment_id', assignmentId)
        .order('submitted_at', { ascending: false });
    if (error) throw error;
    return data || [];
};

export const submitAssignment = async (submission: Partial<AssignmentSubmission>): Promise<AssignmentSubmission> => {
    // Try INSERT first; if duplicate, UPDATE instead
    const { data: inserted, error: insertErr } = await supabase
        .from('assignment_submissions')
        .insert(submission)
        .select()
        .single();

    if (!insertErr) return inserted;

    // If unique-violation (23505), update existing row
    if (insertErr.code === '23505') {
        const { data: updated, error: updateErr } = await supabase
            .from('assignment_submissions')
            .update({
                code: submission.code,
                answers: submission.answers,
                status: submission.status || 'submitted',
                submitted_at: submission.submitted_at || Date.now(),
            })
            .eq('assignment_id', submission.assignment_id!)
            .eq('student_uuid', submission.student_uuid!)
            .select()
            .single();
        if (updateErr) throw updateErr;
        return updated;
    }

    throw insertErr;
};

export const updateSubmissionGrade = async (id: number, updates: Partial<AssignmentSubmission>): Promise<void> => {
    const { error } = await supabase.from('assignment_submissions').update(updates).eq('id', id);
    if (error) throw error;
};

// ─── Activity Logs ───────────────────────────────────────────────────────────

export const logActivity = async (log: Partial<ActivityLog>): Promise<void> => {
    await supabase.from('activity_logs').insert(log);
};

export const getActivityLogs = async (assignmentId: number): Promise<ActivityLog[]> => {
    const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('assignment_id', assignmentId)
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
};

// ─── Student-facing: get assignments for my group ────────────────────────────

export const getAssignmentsForGroup = async (groupName: string): Promise<Assignment[]> => {
    const { data, error } = await supabase
        .from('assignments')
        .select('*')
        .contains('target_groups', [groupName])
        .eq('status', 'active')
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
};

// ─── Student: get my submission for a specific assignment ─────────────────────

export const getMySubmissionForAssignment = async (
    assignmentId: number, studentUuid: string
): Promise<AssignmentSubmission | null> => {
    const { data, error } = await supabase
        .from('assignment_submissions')
        .select('*')
        .eq('assignment_id', assignmentId)
        .eq('student_uuid', studentUuid)
        .maybeSingle();
    if (error) throw error;
    return data;
};

export const getStudentSubmissions = async (studentUuid: string): Promise<AssignmentSubmission[]> => {
    const { data, error } = await supabase
        .from('assignment_submissions')
        .select('*')
        .eq('student_uuid', studentUuid)
        .order('submitted_at', { ascending: false });
    if (error) throw error;
    return data || [];
};
