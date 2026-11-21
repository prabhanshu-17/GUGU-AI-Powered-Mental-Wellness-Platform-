// Fallback in-memory database adapter for environments without Cloudflare D1 (e.g. Vercel)
// Implements the D1Database interface (prepare, bind, run, first, all)

interface TableRow {
    [key: string]: any;
}

// In-memory data store
const memoryStore = {
    users: [
        {
            id: 1,
            name: "Dr. Sarah Jenkins",
            email: "sarah.jenkins@gugu.com",
            password_hash: "seed",
            role: "therapist",
        },
        {
            id: 2,
            name: "Dr. Michael Chen",
            email: "michael.chen@gugu.com",
            password_hash: "seed",
            role: "therapist",
        }
    ] as TableRow[],
    therapist_profiles: [
        {
            therapist_id: 1,
            hourly_rate: 140,
            bio: "Clinical psychologist specializing in cognitive behavioral therapy (CBT) and anxiety reduction.",
            specialties: "Anxiety, Stress, CBT, Trauma",
            notify_email: 1,
            notify_sms: 0,
        },
        {
            therapist_id: 2,
            hourly_rate: 160,
            bio: "Psychiatrist with 12 years of experience focusing on mood regulation, depression, and mindfulness.",
            specialties: "Depression, Mindfulness, Relationships",
            notify_email: 1,
            notify_sms: 0,
        }
    ] as TableRow[],
    mood_logs: [] as TableRow[],
    patient_summaries: [] as TableRow[],
    notes: [] as TableRow[],
    appointments: [] as TableRow[],
    therapy_requests: [] as TableRow[],
};

let autoIncIds: { [table: string]: number } = {
    users: 3,
    mood_logs: 1,
    patient_summaries: 1,
    notes: 1,
    appointments: 1,
    therapy_requests: 1,
};

export function createFallbackD1(): any {
    return {
        prepare(sql: string) {
            let boundParams: any[] = [];

            const statement = {
                bind(...params: any[]) {
                    boundParams = params;
                    return statement;
                },
                async run() {
                    return executeSql(sql, boundParams, 'run');
                },
                async first() {
                    const res = await executeSql(sql, boundParams, 'all');
                    return res.results && res.results.length > 0 ? res.results[0] : null;
                },
                async all() {
                    return executeSql(sql, boundParams, 'all');
                }
            };

            return statement;
        }
    };
}

async function executeSql(sql: string, params: any[], mode: 'run' | 'all'): Promise<any> {
    const trimmed = sql.trim();
    const upper = trimmed.toUpperCase();

    // 1. Users table
    if (upper.startsWith('INSERT INTO USERS')) {
        const [name, email, password_hash, role] = params;
        const exists = memoryStore.users.find(u => u.email.toLowerCase() === (email || '').toLowerCase());
        if (exists) {
            throw new Error('UNIQUE constraint failed: users.email');
        }
        const id = autoIncIds.users++;
        memoryStore.users.push({ id, name, email, password_hash, role });
        return { meta: { last_row_id: id, changes: 1 } };
    }

    if (upper.startsWith('SELECT * FROM USERS WHERE EMAIL = ?')) {
        const [email] = params;
        const user = memoryStore.users.find(u => u.email.toLowerCase() === (email || '').toLowerCase());
        return { results: user ? [user] : [] };
    }

    // 2. Therapists & Profiles
    if (upper.includes('FROM USERS U') && upper.includes('THERAPIST_PROFILES P') && upper.includes("ROLE = 'THERAPIST'")) {
        const therapists = memoryStore.users.filter(u => u.role === 'therapist');
        let results = therapists.map(t => {
            const prof = memoryStore.therapist_profiles.find(p => p.therapist_id === t.id);
            return {
                id: t.id,
                name: t.name,
                email: t.email,
                hourly_rate: prof?.hourly_rate || 150,
                bio: prof?.bio || 'Licensed mental health professional ready to support your journey.',
                specialties: prof?.specialties || 'General Therapy, Anxiety, Stress'
            };
        });

        if (params && params.length >= 2) {
            const query = (params[0] || '').replace(/%/g, '').toLowerCase();
            results = results.filter(r =>
                r.specialties.toLowerCase().includes(query) || r.bio.toLowerCase().includes(query)
            );
        }

        return { results };
    }

    if (upper.startsWith('SELECT * FROM THERAPIST_PROFILES WHERE THERAPIST_ID = ?')) {
        const [tid] = params;
        const prof = memoryStore.therapist_profiles.find(p => p.therapist_id == tid);
        return { results: prof ? [prof] : [] };
    }

    if (upper.startsWith('INSERT INTO THERAPIST_PROFILES')) {
        const [therapist_id, hourly_rate, bio, specialties, notify_email, notify_sms] = params;
        const idx = memoryStore.therapist_profiles.findIndex(p => p.therapist_id == therapist_id);
        const entry = { therapist_id, hourly_rate, bio, specialties, notify_email, notify_sms };
        if (idx >= 0) {
            memoryStore.therapist_profiles[idx] = entry;
        } else {
            memoryStore.therapist_profiles.push(entry);
        }
        return { meta: { changes: 1 } };
    }

    if (upper.startsWith('UPDATE THERAPIST_PROFILES')) {
        const [hourly_rate, bio, specialties, notify_email, notify_sms, therapist_id] = params;
        const idx = memoryStore.therapist_profiles.findIndex(p => p.therapist_id == therapist_id);
        const entry = { therapist_id, hourly_rate, bio, specialties, notify_email, notify_sms };
        if (idx >= 0) {
            memoryStore.therapist_profiles[idx] = entry;
        } else {
            memoryStore.therapist_profiles.push(entry);
        }
        return { meta: { changes: 1 } };
    }

    // 3. Patient Summaries
    if (upper.startsWith('INSERT INTO PATIENT_SUMMARIES')) {
        const [patient_id, summary, severity, conversation_snippet] = params;
        const id = autoIncIds.patient_summaries++;
        memoryStore.patient_summaries.push({
            id,
            patient_id,
            summary,
            severity,
            status: 'pending',
            conversation_snippet,
            timestamp: new Date().toISOString()
        });
        return { meta: { last_row_id: id, changes: 1 } };
    }

    if (upper.includes('FROM PATIENT_SUMMARIES S') && upper.includes('JOIN USERS U')) {
        if (upper.includes('WHERE S.ID = ?')) {
            const [sid] = params;
            const s = memoryStore.patient_summaries.find(item => item.id == sid);
            const u = s ? memoryStore.users.find(usr => usr.id == s.patient_id) : null;
            return { results: u ? [{ name: u.name }] : [] };
        }
        const results = memoryStore.patient_summaries.map(s => {
            const u = memoryStore.users.find(usr => usr.id == s.patient_id);
            return {
                ...s,
                patientName: u?.name || 'Patient',
                patientEmail: u?.email || ''
            };
        });
        return { results };
    }

    if (upper.startsWith('UPDATE PATIENT_SUMMARIES SET STATUS = ? WHERE ID = ?')) {
        const [status, id] = params;
        const item = memoryStore.patient_summaries.find(s => s.id == id);
        if (item) item.status = status;
        return { meta: { changes: item ? 1 : 0 } };
    }

    if (upper.includes('FROM PATIENT_SUMMARIES S WHERE S.PATIENT_ID = ?')) {
        const [pid] = params;
        const list = memoryStore.patient_summaries.filter(s => s.patient_id == pid);
        return { results: list.slice(-3) };
    }

    // 4. Notes
    if (upper.startsWith('SELECT * FROM NOTES WHERE THERAPIST_ID = ?')) {
        const [tid] = params;
        const list = memoryStore.notes.filter(n => n.therapist_id == tid);
        return { results: list };
    }

    if (upper.startsWith('INSERT INTO NOTES')) {
        const [therapist_id, title, content] = params;
        const id = autoIncIds.notes++;
        memoryStore.notes.push({ id, therapist_id, title, content, timestamp: new Date().toISOString() });
        return { meta: { last_row_id: id, changes: 1 } };
    }

    if (upper.startsWith('DELETE FROM NOTES WHERE ID = ? AND THERAPIST_ID = ?')) {
        const [id, tid] = params;
        const idx = memoryStore.notes.findIndex(n => n.id == id && n.therapist_id == tid);
        if (idx >= 0) memoryStore.notes.splice(idx, 1);
        return { meta: { changes: idx >= 0 ? 1 : 0 } };
    }

    // 5. Appointments
    if (upper.startsWith('SELECT * FROM APPOINTMENTS WHERE THERAPIST_ID = ?')) {
        const [tid] = params;
        const list = memoryStore.appointments.filter(a => a.therapist_id == tid && (a.status || 'scheduled') === 'scheduled');
        return { results: list };
    }

    if (upper.includes('FROM APPOINTMENTS A') && upper.includes('WHERE A.PATIENT_NAME = ?')) {
        const [pname] = params;
        const list = memoryStore.appointments.filter(a => a.patient_name === pname);
        const results = list.map(a => {
            const u = memoryStore.users.find(usr => usr.id == a.therapist_id);
            return {
                id: a.id,
                date: a.date,
                time: a.time,
                type: a.type,
                therapist_name: u?.name || 'Therapist'
            };
        });
        return { results };
    }

    if (upper.startsWith('INSERT INTO APPOINTMENTS')) {
        const [therapist_id, patient_name, date, time, type] = params;
        const id = autoIncIds.appointments++;
        memoryStore.appointments.push({
            id,
            therapist_id,
            patient_name,
            date,
            time,
            type,
            status: 'scheduled',
            timestamp: new Date().toISOString()
        });
        return { meta: { last_row_id: id, changes: 1 } };
    }

    if (upper.startsWith('UPDATE APPOINTMENTS SET STATUS = \'COMPLETED\'')) {
        if (params.length === 2) {
            const [pname, tid] = params;
            memoryStore.appointments.forEach(a => {
                if (a.patient_name === pname && a.therapist_id == tid) a.status = 'completed';
            });
        } else if (params.length === 1) {
            const [id] = params;
            const a = memoryStore.appointments.find(it => it.id == id);
            if (a) a.status = 'completed';
        }
        return { meta: { changes: 1 } };
    }

    if (upper.startsWith('UPDATE APPOINTMENTS SET DATE = ?, TIME = ?, TYPE = ?')) {
        const [date, time, type, id, tid] = params;
        const a = memoryStore.appointments.find(it => it.id == id && it.therapist_id == tid);
        if (a) {
            a.date = date;
            a.time = time;
            a.type = type;
        }
        return { meta: { changes: a ? 1 : 0 } };
    }

    if (upper.startsWith('DELETE FROM APPOINTMENTS WHERE ID = ?')) {
        const [id, tid] = params;
        const idx = memoryStore.appointments.findIndex(a => a.id == id && a.therapist_id == tid);
        if (idx >= 0) memoryStore.appointments.splice(idx, 1);
        return { meta: { changes: idx >= 0 ? 1 : 0 } };
    }

    if (upper.startsWith('SELECT PATIENT_NAME FROM APPOINTMENTS WHERE ID = ?')) {
        const [id] = params;
        const a = memoryStore.appointments.find(it => it.id == id);
        return { results: a ? [{ patient_name: a.patient_name }] : [] };
    }

    if (upper.startsWith('SELECT COUNT(*) AS COUNT FROM APPOINTMENTS WHERE PATIENT_NAME = ?')) {
        const [pname] = params;
        const count = memoryStore.appointments.filter(a => a.patient_name === pname).length;
        return { results: [{ count }] };
    }

    // 6. Mood Logs
    if (upper.startsWith('INSERT INTO MOOD_LOGS')) {
        const [user_id, score] = params;
        const id = autoIncIds.mood_logs++;
        memoryStore.mood_logs.push({ id, user_id, score, timestamp: new Date().toISOString() });
        return { meta: { last_row_id: id, changes: 1 } };
    }

    if (upper.startsWith('SELECT SCORE, TIMESTAMP FROM MOOD_LOGS WHERE USER_ID = ?')) {
        const [uid] = params;
        const logs = memoryStore.mood_logs.filter(m => m.user_id == uid);
        return { results: logs };
    }

    // 7. Therapy Requests
    if (upper.startsWith('INSERT INTO THERAPY_REQUESTS')) {
        const [patient_id, patient_name, ai_summary, domain, severity] = params;
        const id = autoIncIds.therapy_requests++;
        memoryStore.therapy_requests.push({
            id,
            patient_id,
            patient_name,
            ai_summary,
            domain: domain || 'general',
            severity: severity || 'moderate',
            status: 'pending',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        });
        return { meta: { last_row_id: id, changes: 1 } };
    }

    if (upper.startsWith('SELECT * FROM THERAPY_REQUESTS WHERE STATUS = \'PENDING\'')) {
        const list = memoryStore.therapy_requests.filter(r => r.status === 'pending');
        return { results: list };
    }

    if (upper.includes('FROM THERAPY_REQUESTS T') && upper.includes('WHERE T.PATIENT_ID = ?')) {
        const [pid] = params;
        const list = memoryStore.therapy_requests.filter(r => r.patient_id == pid);
        const results = list.map(t => {
            const u = t.therapist_id ? memoryStore.users.find(usr => usr.id == t.therapist_id) : null;
            return {
                ...t,
                therapist_name: u?.name || null
            };
        });
        return { results };
    }

    if (upper.startsWith('UPDATE THERAPY_REQUESTS SET STATUS = \'APPROVED\'')) {
        const [tid, note, id] = params;
        const r = memoryStore.therapy_requests.find(it => it.id == id && it.status === 'pending');
        if (r) {
            r.status = 'approved';
            r.therapist_id = tid;
            r.therapist_note = note;
            r.updated_at = new Date().toISOString();
        }
        return { meta: { changes: r ? 1 : 0 } };
    }

    if (upper.startsWith('UPDATE THERAPY_REQUESTS SET STATUS = \'REJECTED\'')) {
        const [tid, note, id] = params;
        const r = memoryStore.therapy_requests.find(it => it.id == id && it.status === 'pending');
        if (r) {
            r.status = 'rejected';
            r.therapist_id = tid;
            r.therapist_note = note;
            r.updated_at = new Date().toISOString();
        }
        return { meta: { changes: r ? 1 : 0 } };
    }

    if (upper.startsWith('UPDATE THERAPY_REQUESTS SET STATUS = \'SCHEDULED\'')) {
        const [date, time, id, tid] = params;
        const r = memoryStore.therapy_requests.find(it => it.id == id && it.therapist_id == tid);
        if (r) {
            r.status = 'scheduled';
            r.scheduled_date = date;
            r.scheduled_time = time;
            r.updated_at = new Date().toISOString();
        }
        return { meta: { changes: r ? 1 : 0 } };
    }

    if (upper.startsWith('SELECT PATIENT_NAME FROM THERAPY_REQUESTS WHERE ID = ?')) {
        const [id] = params;
        const r = memoryStore.therapy_requests.find(it => it.id == id);
        return { results: r ? [{ patient_name: r.patient_name }] : [] };
    }

    if (upper.startsWith('UPDATE THERAPY_REQUESTS SET THERAPIST_ID = ? WHERE ID = ?')) {
        const [tid, id] = params;
        const r = memoryStore.therapy_requests.find(it => it.id == id);
        if (r) r.therapist_id = tid;
        return { meta: { changes: r ? 1 : 0 } };
    }

    if (upper.includes('SELECT DISTINCT U.ID, U.NAME, U.EMAIL FROM USERS U JOIN THERAPY_REQUESTS T')) {
        const [tid] = params;
        const myReqs = memoryStore.therapy_requests.filter(r => r.therapist_id == tid);
        const patientNames = Array.from(new Set(myReqs.map(r => r.patient_name)));
        const results = memoryStore.users.filter(u => patientNames.includes(u.name));
        return { results };
    }

    // Default empty result for any other unhandled queries
    return { results: [], meta: { changes: 0, last_row_id: 0 } };
}

