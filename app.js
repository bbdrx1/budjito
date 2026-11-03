(() => {
'use strict';
const KEY = 'personalBudgetTracker.v1';
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt = (n, d = 2) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: d, maximumFractionDigits: d }).format(n || 0);
const fmt0 = n => fmt(n, 0);
const pc = n => ((n || 0) * 100).toFixed(1) + '%';
const uid = () => Math.random().toString(36).slice(2, 9);
const num = v => { const n = parseFloat(v); return isFinite(n) ? n : 0; };
const sum = (rows, f) => rows.reduce((a, r) => a + (+f(r) || 0), 0);
const iso = (y, m, d) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
const parts = d => { const [y, m, dd] = d.split('-').map(Number); return { y, m: m - 1, d: dd }; };
const key = (y, m) => y * 100 + m;
const fdate = d => { if (!d) return ''; const p = parts(d); return `${String(p.d).padStart(2, '0')} ${MONTHS[p.m].slice(0, 3)} ${p.y}`; };
const today = new Date();
const TY = today.getFullYear(), TM = today.getMonth();

/* ---------- default data ---------- */
const DEFAULT_CATS = [['Electricity Bill','Bills & Housing'],['WiFi / Internet Bill','Bills & Housing'],['Water Bill','Bills & Housing'],
  ['Parent Support','Family Support'],['Food / Groceries','Living Expenses'],['Rent','Bills & Housing'],['Personal Needs','Personal Needs'],
  ['Church Contributions','Church'],['Transportation','Living Expenses'],['Savings','Savings'],['Other Expenses','Other']];
const PLANNED = {'Electricity Bill':1500,'WiFi / Internet Bill':1299,'Water Bill':500,'Parent Support':4000,'Food / Groceries':5000,'Rent':8000,
  'Personal Needs':2500,'Church Contributions':3200,'Transportation':1800,'Savings':4800,'Other Expenses':1500};
const ALLOC = {'Electricity Bill':4,'WiFi / Internet Bill':2.5,'Water Bill':1.5,'Parent Support':10,'Food / Groceries':15,'Rent':25,'Personal Needs':7,
  'Church Contributions':10,'Transportation':5,'Savings':15,'Other Expenses':5};

function sample() {
  const Y = 2026, ex = [];
  const add = (m, d, category, desc, budget, actual, status, due, notes) =>
    ex.push({ id: uid(), date: iso(Y, m, d), category, desc, budget, actual: actual ?? 0, status, due: due || '', notes: notes || '' });
  const elec = [1420,1610,1750,1690,1530,null], water = [460,480,510,520,null,null], fA = [2380,2450,2610,2300,2520,1150],
    fB = [2640,2390,2480,2700,2410,null], pers = [2150,2890,2300,3100,2450,null], trans = [1700,1950,1820,1760,1880,null],
    oth = [1200,2300,700,1500,1850,null], sav = [4800,4800,4800,6000,4800,4800];
  for (let k = 0; k < 6; k++) {
    const m = 5 + k, nov = m === 10;
    add(m, 1, 'Rent', 'Monthly rent', 8000, 8000, 'Paid', iso(Y, m, 5));
    add(m, nov ? 1 : 8, 'Electricity Bill', 'Electricity bill', 1500, elec[k], elec[k] ? 'Paid' : 'Unpaid', iso(Y, m, 15), nov ? 'Bill received' : '');
    add(m, nov ? 1 : 3, 'WiFi / Internet Bill', 'Internet subscription', 1299, nov ? 0 : 1299, nov ? 'Unpaid' : 'Paid', iso(Y, m, 20));
    add(m, nov ? 1 : 5, 'Water Bill', 'Water bill', 500, water[k], water[k] ? 'Paid' : 'Unpaid', m === 9 ? iso(Y, 9, 12) : iso(Y, m, 10), m === 9 ? 'Overdue - pay ASAP' : '');
    add(m, nov ? 1 : 2, 'Parent Support', 'Monthly support for parents', 4000, 4000, 'Paid');
    add(m, nov ? 1 : 7, 'Food / Groceries', 'Groceries - first half', 2500, fA[k], 'Paid');
    if (fB[k]) add(m, 21, 'Food / Groceries', 'Groceries - second half', 2500, fB[k], 'Paid');
    if (pers[k]) add(m, 12, 'Personal Needs', 'Toiletries, clothing, etc.', 2500, pers[k], 'Paid');
    add(m, 1, 'Church Contributions', 'Tithes and offerings', 3200, 3200, 'Paid');
    if (trans[k]) add(m, 15, 'Transportation', 'Commute and fares', 1800, trans[k], 'Paid');
    add(m, 1, 'Savings', 'Transfer to savings account', 4800, sav[k], 'Paid', '', m === 8 ? 'Extra from bonus' : '');
    if (oth[k]) add(m, 18, 'Other Expenses', 'Miscellaneous / unexpected', 1500, oth[k], 'Paid', '', m === 6 ? 'Medical check-up' : '');
  }
  const inc = [[5,0,0],[6,1800,0],[7,0,0],[8,2400,3000],[9,1500,0],[10,0,0]].map(([m, ot, b]) =>
    ({ id: uid(), year: Y, month: m, basic: 32000, additional: 2500, overtime: ot, bonus: b, notes: m === 6 ? 'Overtime - project deadline' : m === 8 ? 'Performance bonus' : '' }));
  return {
    settings: { categories: DEFAULT_CATS.map(([name, group]) => ({ name, group })), groups: ['Bills & Housing','Living Expenses','Family Support','Church','Personal Needs','Savings','Other'],
      openingBalance: 5000, remindDays: 7, threshold: 90, savingsCat: 'Savings' },
    income: inc, expenses: ex, budgets: { ...PLANNED }, alloc: { ...ALLOC }, savingsTarget: 4800,
    extraYears: [],
    goals: [{ id: uid(), name: 'Emergency Fund', target: 100000, date: '2027-06-30', saved: 38000 },
      { id: uid(), name: 'New Laptop', target: 60000, date: '2027-03-31', saved: 12000 },
      { id: uid(), name: 'Travel Fund', target: 40000, date: '2027-12-31', saved: 5000 }]
  };
}
function blank() {
  const s = sample(); return { ...s, income: [], expenses: [], goals: [], settings: { ...s.settings, openingBalance: 0 } };
}

const USERS = 'pbt.users', DATA = 'pbt.data.', SESSION = 'pbt.session', LOCK = 'pbt.lock.';
const mem = {};
const store = {
  get(k, sess) { const m = mem[(sess ? 's:' : 'l:') + k]; if (m != null) return m; try { return (sess ? sessionStorage : localStorage).getItem(k); } catch (e) { return null; } },
  set(k, v, sess) { try { (sess ? sessionStorage : localStorage).setItem(k, v); delete mem[(sess ? 's:' : 'l:') + k]; } catch (e) { mem[(sess ? 's:' : 'l:') + k] = v; } },
  del(k, sess) { delete mem[(sess ? 's:' : 'l:') + k]; try { (sess ? sessionStorage : localStorage).removeItem(k); } catch (e) { /* unavailable */ } }
};
let S = null, USER = null;
const normalize = d => { d.extraYears = Array.isArray(d.extraYears) ? d.extraYears : []; d.goals = d.goals || []; d.budgets = d.budgets || {}; d.alloc = d.alloc || {}; if (d.savingsTarget == null) d.savingsTarget = 4800; return d; };
const save = () => { if (S && USER) store.set(DATA + USER, JSON.stringify(S)); };
const emptySel = () => ({ exp: new Set(), inc: new Set(), bill: new Set(), goal: new Set() });

/* ---------- ui state ---------- */
const ui = { tab: 'dashboard', dash: { month: TM, year: TY, cat: 'All', status: 'All' }, mb: { month: TM, year: TY },
  al: { month: TM, year: TY }, sv: { year: TY }, an: { year: TY }, ex: { month: 'All', status: 'All', q: '' },
  editExp: null, editInc: null, confirm: null, xfer: '', sel: emptySel(), vis: {} };
const TABS = [['dashboard','Dashboard'],['income','Income'],['expenses','Expenses'],['budget','Monthly Budget'],['allocation','Allocation Planner'],
  ['bills','Bill Reminders'],['savings','Savings Tracker'],['annual','Annual Summary'],['settings','Settings'],['help','How to use']];

/* ---------- calculations ---------- */
const cfg = () => S.settings;
const incTotal = r => num(r.basic) + num(r.additional) + num(r.overtime) + num(r.bonus);
const isMonth = (p, month) => month === 'All' || p.m === month;
function exps({ year, month, cat, status } = {}) {
  return S.expenses.filter(e => { const p = parts(e.date);
    return (year == null || p.y === year) && isMonth(p, month ?? 'All') && (!cat || cat === 'All' || e.category === cat) && (!status || status === 'All' || e.status === status); });
}
const incs = (year, month) => S.income.filter(r => r.year === year && isMonth({ m: r.month }, month ?? 'All'));
const unpaidAmt = e => e.status === 'Unpaid' ? (num(e.actual) > 0 ? num(e.actual) : num(e.budget)) : 0;
function opening(year, month) {
  const k = key(year, month);
  return num(cfg().openingBalance) + sum(S.income.filter(r => key(r.year, r.month) < k), incTotal)
    - sum(S.expenses.filter(e => { const p = parts(e.date); return key(p.y, p.m) < k; }), e => e.actual);
}
function daysUntil(d) { const p = parts(d); return Math.round((new Date(p.y, p.m, p.d) - new Date(TY, TM, today.getDate())) / 864e5); }
function reminder(e) {
  if (e.status === 'Paid') return 'Paid';
  if (!e.due) return 'No due date';
  const d = daysUntil(e.due);
  return d < 0 ? 'OVERDUE' : d <= num(cfg().remindDays) ? 'DUE SOON' : 'Upcoming';
}
function budgetStatus(cat, budget, actual) {
  budget = num(budget); actual = num(actual);
  if (!budget && !actual) return ['-', 'p-mute'];
  if (!budget) return ['No budget', 'p-mute'];
  if (cat === cfg().savingsCat) return actual >= budget ? ['Goal met', 'p-ok'] : ['Below goal', 'p-warn'];
  if (actual > budget) return ['Over budget', 'p-bad'];
  if (actual >= budget * cfg().threshold / 100 && actual < budget) return ['Approaching', 'p-warn'];
  return ['Within budget', 'p-ok'];
}
const pill = (t, c) => `<span class="pill ${c}">${esc(t)}</span>`;
const remPill = r => pill(r, { OVERDUE: 'p-bad', 'DUE SOON': 'p-warn', Upcoming: 'p-info', Paid: 'p-ok' }[r] || 'p-mute');
const cats = () => cfg().categories.filter(c => c.name);
const opts = (list, sel) => list.map(([v, l]) => `<option value="${esc(v)}"${String(v) === String(sel) ? ' selected' : ''}>${esc(l)}</option>`).join('');
const monthOpts = (sel, all) => opts([...(all ? [['All', 'All months']] : []), ...MONTHS.map((m, i) => [i, m])], sel);
const years = () => { const set = new Set([TY - 1, TY, TY + 1, ...(S.extraYears || [])]); S.income.forEach(r => set.add(r.year)); S.expenses.forEach(e => set.add(parts(e.date).y));
  return [...set].sort((a, b) => a - b).map(y => [y, y]); };
const sel = (path, optionsHtml, label) => `<label class="field"><span>${label}</span><select data-f="${path}">${optionsHtml}</select></label>`;
const catOpts = (selected, all) => opts([...(all ? [['All', 'All categories']] : []), ...cats().map(c => [c.name, c.name])], selected);
const chk = (t, id) => `<td class="ck"><input type="checkbox" data-sel="${t}:${id}" aria-label="Select row"${ui.sel[t].has(id) ? ' checked' : ''}></td>`;
const chkAll = t => { const v = ui.vis[t] || []; return `<th class="ck"><input type="checkbox" data-selall="${t}" aria-label="Select all rows"${v.length && v.every(i => ui.sel[t].has(i)) ? ' checked' : ''}></th>`; };
const paidBtn = t => `<button class="btn ghost sm" data-act="bulk-paid" data-t="${t}">Mark paid</button>`;
const bulk = (t, extra = '') => { const n = ui.sel[t].size; if (!n) return ''; const c = 'bulk' + t;
  return `<div class="bulk"><b>${n} selected</b>${extra}<button class="btn ${ui.confirm === c ? 'danger' : 'ghost'} sm" data-act="bulk-del" data-t="${t}">${ui.confirm === c ? `Confirm: delete ${n}` : 'Delete selected'}</button><button class="btn ghost sm" data-act="bulk-clear" data-t="${t}">Clear selection</button></div>`; };
const addYearCtl = () => `<form id="yearForm" class="field"><span>Add year</span><div class="inl"><input class="in" type="number" name="y" min="1990" max="2100" placeholder="${TY + 2}" style="width:90px" aria-label="Year to add"><button class="btn sm" type="submit">Add</button></div></form>`;
const head = (t, p, right = '') => `<div class="head"><div><h2>${t}</h2>${p ? `<p>${p}</p>` : ''}</div>${right}</div>`;
const wrapT = (inner, cls = '') => `<div class="table-wrap ${cls}"><table>${inner}</table></div>`;
const kpi = (cls, lbl, val, sub, neg) => `<div class="kpi ${cls}"><div class="lbl">${lbl}</div><div class="kpi-value ${neg ? 'neg' : ''}">${val}</div><div class="sub">${sub}</div></div>`;

/* ---------- views ---------- */
function vDashboard() {
  const f = ui.dash, base = { year: f.year, month: f.month };
  const income = sum(incs(f.year, f.month), incTotal);
  const filt = exps({ ...base, cat: f.cat, status: f.status });
  const expF = sum(filt, e => e.actual), budF = sum(filt, e => e.budget);
  const all = sum(exps(base), e => e.actual);
  const remaining = income - all;
  const savings = sum(exps({ ...base, cat: cfg().savingsCat }), e => e.actual);
  const unpRows = exps(base).filter(e => e.status === 'Unpaid');
  const overdue = S.expenses.filter(e => reminder(e) === 'OVERDUE').length;
  const open = opening(f.year, f.month === 'All' ? 0 : f.month);
  const rows = cats().map(c => { const r = exps({ ...base, cat: c.name, status: f.status });
    const b = sum(r, e => e.budget), a = sum(r, e => e.actual); return { c: c.name, b, a }; });
  const totA = sum(rows, r => r.a);
  const catRows = rows.map(r => { const [t, cl] = budgetStatus(r.c, r.b, r.a);
    return `<tr><td>${esc(r.c)}</td><td class="r num">${fmt0(r.b)}</td><td class="r num">${fmt0(r.a)}</td><td class="r num ${r.b - r.a < 0 ? 'neg' : ''}">${fmt0(r.b - r.a)}</td>
      <td class="r num">${totA ? pc(r.a / totA) : '-'}</td><td>${pill(t, cl)}</td></tr>`; }).join('');
  const mRows = MONTHS.map((m, i) => { const iM = sum(incs(f.year, i), incTotal), eM = sum(exps({ year: f.year, month: i }), e => e.actual);
    const sM = sum(exps({ year: f.year, month: i, cat: cfg().savingsCat }), e => e.actual);
    return `<tr><td>${m}</td><td class="r num">${fmt0(iM)}</td><td class="r num">${fmt0(eM)}</td><td class="r num">${fmt0(sM)}</td><td class="r num ${iM - eM < 0 ? 'neg' : ''}">${fmt0(iM - eM)}</td></tr>`; }).join('');
  return head('Dashboard', 'Everything updates as you add income and expenses.',
    `<div class="filters">${sel('dash.month', monthOpts(f.month, true), 'Month')}${sel('dash.year', opts(years(), f.year), 'Year')}${sel('dash.cat', catOpts(f.cat, true), 'Category')}
     ${sel('dash.status', opts([['All', 'All'], ['Paid', 'Paid'], ['Unpaid', 'Unpaid']], f.status), 'Status')}${addYearCtl()}</div>`) + `
  <div class="grid kpis">
    ${kpi('k-income', 'Total monthly income', fmt0(income), 'Salary + additional + overtime + bonus')}
    ${kpi('k-expense', 'Total expenses', fmt0(expF), `Budgeted: ${fmt0(budF)}`)}
    ${kpi('k-income', 'Remaining balance', fmt0(remaining), 'Income minus all actual expenses', remaining < 0)}
    ${kpi('k-saving', 'Total savings', fmt0(savings), `Savings rate: ${pc(income ? savings / income : 0)}`)}
    ${kpi('k-warn', 'Unpaid bills', fmt0(sum(unpRows, unpaidAmt)), `${unpRows.length} unpaid | ${overdue} overdue (all periods)`)}
  </div>
  <div class="strip"><div><div class="lbl">Opening balance (carried in)</div><div class="v">${fmt0(open)}</div></div>
    <div><div class="lbl">Net this period</div><div class="v ${remaining < 0 ? 'neg' : ''}">${fmt0(remaining)}</div></div>
    <div><div class="lbl">Closing balance (carries forward)</div><div class="v ${open + remaining < 0 ? 'neg' : ''}">${fmt0(open + remaining)}</div></div></div>
  <div class="grid charts">
    <div class="card"><h3>Expense breakdown by category</h3><div class="canvas-box"><canvas id="c1"></canvas></div></div>
    <div class="card"><h3>Monthly income vs. expenses</h3><div class="canvas-box"><canvas id="c2"></canvas></div></div>
    <div class="card"><h3>Monthly spending trend</h3><div class="canvas-box"><canvas id="c3"></canvas></div></div>
    <div class="card"><h3>Budget vs. actual by category</h3><div class="canvas-box"><canvas id="c4"></canvas></div></div>
  </div>
  <div class="grid two">
    <div><h3 class="sec">Category summary</h3>${wrapT(`<tr><th>Category</th><th class="r">Budgeted</th><th class="r">Actual</th><th class="r">Variance</th><th class="r">% of total</th><th>Status</th></tr>${catRows}
      <tr class="total"><td>Total</td><td class="r num">${fmt0(sum(rows, r => r.b))}</td><td class="r num">${fmt0(totA)}</td><td class="r num">${fmt0(sum(rows, r => r.b - r.a))}</td><td class="r num">${totA ? '100.0%' : '-'}</td><td></td></tr>`)}</div>
    <div><h3 class="sec">Monthly summary (${f.year})</h3>${wrapT(`<tr><th>Month</th><th class="r">Income</th><th class="r">Expenses</th><th class="r">Savings</th><th class="r">Net</th></tr>${mRows}`)}</div>
  </div>`;
}
function postDashboard() {
  const f = ui.dash, base = { year: f.year, month: f.month }, co = colors();
  const rows = cats().map(c => ({ c: c.name, b: sum(exps({ ...base, cat: c.name, status: f.status }), e => e.budget), a: sum(exps({ ...base, cat: c.name, status: f.status }), e => e.actual) }));
  chart('c1', { type: 'doughnut', data: { labels: rows.map(r => r.c), datasets: [{ data: rows.map(r => r.a), backgroundColor: co.palette, borderColor: co.surface, borderWidth: 2 }] },
    options: { maintainAspectRatio: false, cutout: '58%', plugins: { legend: { position: 'right', labels: { boxWidth: 10, font: { size: 11 } } }, tooltip: { callbacks: { label: c => ` ${c.label}: ${fmt0(c.raw)}` } } } } });
  const inc = MONTHS.map((m, i) => sum(incs(f.year, i), incTotal)), ex = MONTHS.map((m, i) => sum(exps({ year: f.year, month: i }), e => e.actual));
  chart('c2', { type: 'bar', data: { labels: MONTHS.map(m => m.slice(0, 3)), datasets: [{ label: 'Income', data: inc, backgroundColor: co.income }, { label: 'Expenses', data: ex, backgroundColor: co.expense }] }, options: axes() });
  const tr = i => exps({ year: f.year, month: i, cat: f.cat, status: f.status });
  chart('c3', { type: 'line', data: { labels: MONTHS.map(m => m.slice(0, 3)), datasets: [
    { label: 'Actual', data: MONTHS.map((m, i) => sum(tr(i), e => e.actual)), borderColor: co.expense, backgroundColor: co.expense, tension: .25, pointRadius: 4 },
    { label: 'Budgeted', data: MONTHS.map((m, i) => sum(tr(i), e => e.budget)), borderColor: co.ink2, backgroundColor: co.ink2, borderDash: [6, 4], tension: .25, pointRadius: 0 }] }, options: axes() });
  chart('c4', { type: 'bar', data: { labels: rows.map(r => r.c), datasets: [{ label: 'Budgeted', data: rows.map(r => r.b), backgroundColor: co.ink2 }, { label: 'Actual', data: rows.map(r => r.a), backgroundColor: co.expense }] },
    options: { ...axes(), indexAxis: 'y' } });
}

function vIncome() {
  const ed = S.income.find(r => r.id === ui.editInc) || { year: TY, month: TM, basic: 32000, additional: 0, overtime: 0, bonus: 0, notes: '' };
  const rows = [...S.income].sort((a, b) => key(b.year, b.month) - key(a.year, a.month)); ui.vis.inc = rows.map(r => r.id);
  const body = rows.map(r => `<tr>${chk('inc', r.id)}<td>${r.year}</td><td>${MONTHS[r.month]}</td><td class="r num">${fmt(r.basic)}</td><td class="r num">${fmt(r.additional)}</td><td class="r num">${fmt(r.overtime)}</td>
    <td class="r num">${fmt(r.bonus)}</td><td class="r num"><b>${fmt(incTotal(r))}</b></td><td class="wrap">${esc(r.notes)}</td>
    <td><div class="actions"><button class="btn ghost sm" data-act="edit-inc" data-id="${r.id}">Edit</button>${delBtn('inc', r.id)}</div></td></tr>`).join('');
  return head('Income', 'One row per month. Total Income = Basic Salary + Additional Income + Overtime Pay + Bonuses.', `<div class="filters">${addYearCtl()}</div>`) + `
  <form class="card form" id="incForm"><label class="field"><span>Year</span><select class="in" name="year">${opts(years(), ed.year)}</select></label>
    <label class="field"><span>Month</span><select class="in" name="month">${monthOpts(ed.month)}</select></label>
    ${['basic:Monthly basic salary', 'additional:Additional income', 'overtime:Overtime pay', 'bonus:Bonuses / other'].map(x => { const [k, l] = x.split(':');
      return `<label class="field"><span>${l}</span><input class="in" type="number" min="0" step="0.01" name="${k}" value="${ed[k]}"></label>`; }).join('')}
    <label class="field wide"><span>Notes</span><input class="in" name="notes" value="${esc(ed.notes)}"></label>
    <div class="actions"><button class="btn" type="submit">${ui.editInc ? 'Save changes' : 'Add income'}</button>${ui.editInc ? '<button type="button" class="btn ghost" data-act="cancel-inc">Cancel</button>' : ''}</div></form>
  ${bulk('inc')}${wrapT(`<tr>${chkAll('inc')}<th>Year</th><th>Month</th><th class="r">Basic salary</th><th class="r">Additional</th><th class="r">Overtime</th><th class="r">Bonuses</th><th class="r">Total income</th><th>Notes</th><th></th></tr>${body || '<tr><td colspan="10">No income yet. Add your first month above.</td></tr>'}`)}`;
}
const delBtn = (t, id) => `<button class="btn ${ui.confirm === t + id ? 'danger' : 'ghost'} sm" data-act="del-${t}" data-id="${id}">${ui.confirm === t + id ? 'Confirm delete' : 'Delete'}</button>`;

function vExpenses() {
  const ed = S.expenses.find(e => e.id === ui.editExp) || { date: iso(TY, TM, today.getDate()), category: cats()[0]?.name, desc: '', budget: 0, actual: 0, status: 'Paid', due: '', notes: '' };
  const q = ui.ex.q.trim().toLowerCase();
  const rows = S.expenses.filter(e => (ui.ex.month === 'All' || parts(e.date).m === ui.ex.month) && (ui.ex.status === 'All' || e.status === ui.ex.status)
    && (!q || `${e.desc} ${e.category} ${e.notes}`.toLowerCase().includes(q))).sort((a, b) => b.date.localeCompare(a.date)); ui.vis.exp = rows.map(e => e.id);
  const body = rows.map(e => { const p = parts(e.date), a = num(e.actual), b = num(e.budget), thr = cfg().threshold / 100;
    let cl = ''; if (a > 0 || e.status === 'Paid') cl = e.category === cfg().savingsCat ? (a >= b ? 'cell-ok' : 'cell-warn') : b > 0 ? (a > b ? 'cell-bad' : a >= b * thr && a < b ? 'cell-warn' : 'cell-ok') : '';
    return `<tr>${chk('exp', e.id)}<td>${fdate(e.date)}</td><td>${MONTHS[p.m]}</td><td>${esc(e.category)}</td><td class="wrap">${esc(e.desc)}</td><td class="r num">${fmt(b)}</td>
      <td class="r num ${cl}">${a ? fmt(a) : '-'}</td><td class="r num ${b - a < 0 ? 'neg' : ''}">${a ? fmt(b - a) : '-'}</td><td>${pill(e.status, e.status === 'Paid' ? 'p-ok' : 'p-warn')}</td>
      <td>${fdate(e.due)}</td><td>${e.status === 'Unpaid' ? remPill(reminder(e)) : ''}</td><td class="wrap">${esc(e.notes)}</td>
      <td><div class="actions"><button class="btn ghost sm" data-act="edit-exp" data-id="${e.id}">Edit</button>${delBtn('exp', e.id)}</div></td></tr>`; }).join('');
  return head('Expenses', 'Add, edit and delete expenses. For an unpaid bill, enter the budgeted amount, leave Actual at 0 and set a due date.') + `
  <form class="card form" id="expForm">
    <label class="field"><span>Date</span><input class="in" type="date" name="date" required value="${ed.date}"></label>
    <label class="field"><span>Category</span><select class="in" name="category">${catOpts(ed.category)}</select></label>
    <label class="field wide"><span>Description</span><input class="in" name="desc" value="${esc(ed.desc)}"></label>
    <label class="field"><span>Budgeted amount</span><input class="in" type="number" min="0" step="0.01" name="budget" value="${ed.budget}"></label>
    <label class="field"><span>Actual amount</span><input class="in" type="number" min="0" step="0.01" name="actual" value="${ed.actual}"></label>
    <label class="field"><span>Payment status</span><select class="in" name="status">${opts([['Paid', 'Paid'], ['Unpaid', 'Unpaid']], ed.status)}</select></label>
    <label class="field"><span>Due date (optional)</span><input class="in" type="date" name="due" value="${ed.due}"></label>
    <label class="field wide"><span>Notes</span><input class="in" name="notes" value="${esc(ed.notes)}"></label>
    <div class="actions"><button class="btn" type="submit">${ui.editExp ? 'Save changes' : 'Add expense'}</button>${ui.editExp ? '<button type="button" class="btn ghost" data-act="cancel-exp">Cancel</button>' : ''}</div></form>
  <div class="filters">${sel('ex.month', monthOpts(ui.ex.month, true), 'Month')}${sel('ex.status', opts([['All', 'All'], ['Paid', 'Paid'], ['Unpaid', 'Unpaid']], ui.ex.status), 'Status')}
    ${addYearCtl()}<label class="field"><span>Search</span><input id="exSearch" data-f="ex.q" value="${esc(ui.ex.q)}" placeholder="Description, category, notes"></label>
    <p class="note">${rows.length} of ${S.expenses.length} records | Actual: ${fmt(sum(rows, e => e.actual))}</p></div>
  ${bulk('exp', paidBtn('exp'))}${wrapT(`<tr>${chkAll('exp')}<th>Date</th><th>Month</th><th>Category</th><th>Description</th><th class="r">Budgeted</th><th class="r">Actual</th><th class="r">Variance</th><th>Status</th><th>Due</th><th>Reminder</th><th>Notes</th><th></th></tr>${body || '<tr><td colspan="13">No expenses match.</td></tr>'}`, 'scroll-y')}`;
}

function vBudget() {
  const { month, year } = ui.mb, r = cats().map(c => { const rows = exps({ year, month, cat: c.name });
    return { c: c.name, planned: num(S.budgets[c.name]), entry: sum(rows, e => e.budget), actual: sum(rows, e => e.actual) }; });
  const body = r.map(x => { const [t, cl] = budgetStatus(x.c, x.planned, x.actual);
    return `<tr><td>${esc(x.c)}</td><td class="r"><input class="in" type="number" min="0" step="0.01" data-bud="${esc(x.c)}" value="${x.planned}" style="width:120px"></td>
      <td class="r num">${fmt(x.entry)}</td><td class="r num">${fmt(x.actual)}</td><td class="r num ${x.planned - x.actual < 0 ? 'neg' : ''}">${fmt(x.planned - x.actual)}</td>
      <td style="min-width:110px"><div class="bar"><i style="width:${Math.min(100, x.planned ? x.actual / x.planned * 100 : 0)}%"></i></div><span class="note">${x.planned ? Math.round(x.actual / x.planned * 100) + '%' : ''}</span></td><td>${pill(t, cl)}</td></tr>`; }).join('');
  const income = sum(incs(year, month), incTotal), mex = exps({ year, month }), act = sum(mex, e => e.actual), sv = sum(exps({ year, month, cat: cfg().savingsCat }), e => e.actual);
  const open = opening(year, month);
  const lines = [['Total monthly income', income], ['Total budgeted expenses (entries)', sum(mex, e => e.budget)], ['Total actual expenses', act],
    ['Total paid expenses', sum(mex.filter(e => e.status === 'Paid'), e => e.actual)], ['Total unpaid expenses', sum(mex, unpaidAmt)], ['Remaining balance (income - actual)', income - act],
    ['Total savings', sv], ['Savings rate (savings / income x 100)', null, pc(income ? sv / income : 0)], ['Budget variance (budgeted - actual)', sum(mex, e => e.budget) - act],
    ['Balance carried in (rollover)', open], ['Closing balance (carried to next month)', open + income - act]];
  return head('Monthly Budget', 'Planned budget per category against actual spending. Edit the planned amounts.', `<div class="filters">${sel('mb.month', monthOpts(month), 'Month')}${sel('mb.year', opts(years(), year), 'Year')}</div>`) + `
  ${wrapT(`<tr><th>Category</th><th class="r">Planned budget</th><th class="r">Entry budgeted</th><th class="r">Actual</th><th class="r">Variance</th><th>% used</th><th>Status</th></tr>${body}
    <tr class="total"><td>Total</td><td class="r num">${fmt(sum(r, x => x.planned))}</td><td class="r num">${fmt(sum(r, x => x.entry))}</td><td class="r num">${fmt(sum(r, x => x.actual))}</td><td class="r num">${fmt(sum(r, x => x.planned - x.actual))}</td><td></td><td></td></tr>`)}
  <div class="card"><h3>Summary for ${MONTHS[month]} ${year}</h3>${wrapT(lines.map(([l, v, t]) => `<tr><td>${l}</td><td class="r num"><b class="${v < 0 ? 'neg' : ''}">${t || fmt(v)}</b></td></tr>`).join(''))}</div>`;
}

function vAllocation() {
  const { month, year } = ui.al, income = sum(incs(year, month), incTotal);
  const rows = cats().map(c => { const pctv = num(S.alloc[c.name]); return { c, pctv, sugg: income * pctv / 100, plan: num(S.budgets[c.name]),
    act: sum(exps({ year, month, cat: c.name }), e => e.actual) }; });
  const tot = sum(rows, r => r.pctv), plan = sum(rows, r => r.plan), ok = Math.abs(tot - 100) < 0.0001;
  const body = rows.map(r => `<tr><td>${esc(r.c.name)}</td><td>${esc(r.c.group)}</td><td class="r"><input class="in" type="number" min="0" step="0.1" data-al="${esc(r.c.name)}" value="${r.pctv}" style="width:90px"> %</td>
    <td class="r num">${fmt(r.sugg)}</td><td class="r num">${fmt(r.plan)}</td><td class="r num ${r.sugg - r.plan < 0 ? 'neg' : ''}">${fmt(r.sugg - r.plan)}</td><td class="r num">${fmt(r.act)}</td><td class="r num ${r.sugg - r.act < 0 ? 'neg' : ''}">${fmt(r.sugg - r.act)}</td></tr>`).join('');
  const groups = cfg().groups.map(g => { const rs = rows.filter(r => r.c.group === g); return { g, p: sum(rs, r => r.pctv), a: sum(rs, r => r.sugg), s: sum(rs, r => r.act) }; });
  return head('Salary Allocation Planner', 'Split your income across bills, family support, church, personal needs and savings. Edit the % column.',
    `<div class="filters">${sel('al.month', monthOpts(month), 'Month')}${sel('al.year', opts(years(), year), 'Year')}</div>`) + `
  <div class="strip"><div><div class="lbl">Income for the period</div><div class="v" style="color:var(--income)">${fmt(income)}</div></div>
    <div><div class="lbl">Allocation check</div><div class="v">${ok ? pill('OK - totals 100%', 'p-ok') : pill(tot < 100 ? `Unallocated: ${(100 - tot).toFixed(1)}%` : `Over-allocated by ${(tot - 100).toFixed(1)}%`, 'p-bad')}</div></div>
    <div><div class="lbl">Planned budgets vs income</div><div class="v">${income ? pc(plan / income) : '-'}</div></div></div>
  ${wrapT(`<tr><th>Category</th><th>Group</th><th class="r">Allocation %</th><th class="r">Suggested amount</th><th class="r">Planned budget</th><th class="r">Suggested - planned</th><th class="r">Actual spent</th><th class="r">Allocation left</th></tr>${body}
    <tr class="total"><td>Total</td><td></td><td class="r num">${tot.toFixed(1)}%</td><td class="r num">${fmt(sum(rows, r => r.sugg))}</td><td class="r num">${fmt(plan)}</td><td class="r num">${fmt(sum(rows, r => r.sugg - r.plan))}</td><td class="r num">${fmt(sum(rows, r => r.act))}</td><td class="r num">${fmt(sum(rows, r => r.sugg - r.act))}</td></tr>`)}
  <div class="grid two"><div class="card"><h3>Allocated vs. actual by group</h3><div class="canvas-box"><canvas id="c5"></canvas></div></div>
  <div>${wrapT(`<tr><th>Group</th><th class="r">Allocation %</th><th class="r">Allocated</th><th class="r">Actual</th><th class="r">Left</th></tr>${groups.map(g => `<tr><td>${esc(g.g)}</td><td class="r num">${g.p.toFixed(1)}%</td><td class="r num">${fmt0(g.a)}</td><td class="r num">${fmt0(g.s)}</td><td class="r num ${g.a - g.s < 0 ? 'neg' : ''}">${fmt0(g.a - g.s)}</td></tr>`).join('')}`)}</div></div>`;
}
function postAllocation() {
  const { month, year } = ui.al, income = sum(incs(year, month), incTotal), co = colors();
  const gs = cfg().groups, rs = gs.map(g => cats().filter(c => c.group === g));
  chart('c5', { type: 'bar', data: { labels: gs, datasets: [{ label: 'Allocated', data: rs.map(cs => sum(cs, c => income * num(S.alloc[c.name]) / 100)), backgroundColor: co.saving },
    { label: 'Actual', data: rs.map(cs => sum(cs, c => sum(exps({ year, month, cat: c.name }), e => e.actual))), backgroundColor: co.expense }] }, options: axes() });
}

function vBills() {
  const unpaid = S.expenses.filter(e => e.status === 'Unpaid').sort((a, b) => (a.due || '9999').localeCompare(b.due || '9999')); ui.vis.bill = unpaid.map(e => e.id);
  const c = r => unpaid.filter(e => reminder(e) === r).length;
  const body = unpaid.map((e, i) => { const d = e.due ? daysUntil(e.due) : null, r = reminder(e);
    return `<tr>${chk('bill', e.id)}<td>${i + 1}</td><td>${fdate(e.due) || '-'}</td><td class="wrap">${esc(e.desc)}</td><td>${esc(e.category)}</td><td class="r num">${fmt(unpaidAmt(e))}</td>
      <td class="r num ${d < 0 ? 'neg' : ''}">${d ?? '-'}</td><td>${remPill(r)}</td><td>${MONTHS[parts(e.date).m]}</td><td class="wrap">${esc(e.notes)}</td>
      <td><button class="btn sm" data-act="mark-paid" data-id="${e.id}">Mark paid</button></td></tr>`; }).join('');
  return head('Bill Payment Reminders', `Unpaid bills sorted by due date. Reminder window: ${cfg().remindDays} days (change in Settings). Today: ${fdate(iso(TY, TM, today.getDate()))}.`) + `
  <div class="grid kpis">${kpi('k-expense', 'Overdue', c('OVERDUE'), 'Past the due date')}${kpi('k-warn', 'Due soon', c('DUE SOON'), `Within ${cfg().remindDays} days`)}
    ${kpi('k-saving', 'Upcoming', c('Upcoming'), 'Beyond the window')}${kpi('', 'No due date', c('No due date'), 'Add a due date to track')}${kpi('k-warn', 'Total outstanding', fmt0(sum(unpaid, unpaidAmt)), 'All unpaid bills')}</div>
  ${bulk('bill', paidBtn('bill'))}${wrapT(`<tr>${chkAll('bill')}<th>#</th><th>Due date</th><th>Description</th><th>Category</th><th class="r">Amount due</th><th class="r">Days until due</th><th>Reminder</th><th>Bill month</th><th>Notes</th><th></th></tr>${body || '<tr><td colspan="11">All bills are paid.</td></tr>'}`)}
  <p class="note">"Mark paid" sets the status to Paid. If the Actual amount is 0, it is set to the budgeted amount.</p>`;
}

function vSavings() {
  const y = ui.sv.year, sc = cfg().savingsCat;
  ui.vis.goal = S.goals.map(g => g.id);
  const goals = S.goals.map(g => { const left = Math.max(0, num(g.target) - num(g.saved)); let ml = '';
    if (g.date) { const p = parts(g.date); ml = Math.max(0, (p.y - TY) * 12 + p.m - TM); }
    return `<tr>${chk('goal', g.id)}<td><input class="in" data-goal="${g.id}:name" value="${esc(g.name)}"></td><td class="r"><input class="in" type="number" min="0" data-goal="${g.id}:target" value="${g.target}" style="width:120px"></td>
      <td><input class="in" type="date" data-goal="${g.id}:date" value="${g.date}"></td><td class="r"><input class="in" type="number" min="0" data-goal="${g.id}:saved" value="${g.saved}" style="width:120px"></td>
      <td style="min-width:110px"><div class="bar"><i style="width:${g.target ? Math.min(100, g.saved / g.target * 100) : 0}%"></i></div><span class="note">${g.target ? Math.round(Math.min(1, g.saved / g.target) * 100) + '%' : ''}</span></td>
      <td class="r num">${fmt0(left)}</td><td class="r num">${ml}</td><td class="r num">${ml === '' ? '' : fmt0(left === 0 ? 0 : ml === 0 ? left : left / ml)}</td>
      <td>${delBtn('goal', g.id)}</td></tr>`; }).join('');
  const t = num(S.savingsTarget); let cum = 0;
  const mrows = MONTHS.map((m, i) => { const inc = sum(incs(y, i), incTotal), made = sum(exps({ year: y, month: i, cat: sc }), e => e.actual); cum += made;
    return `<tr><td>${m}</td><td class="r num">${fmt0(inc)}</td><td class="r num">${fmt0(made)}</td><td class="r num">${fmt0(t)}</td><td class="r num"><span class="${made - t < 0 ? 'neg' : ''}">${fmt0(made - t)}</span></td><td class="r num">${inc ? pc(made / inc) : '-'}</td><td class="r num">${fmt0(cum)}</td></tr>`; }).join('');
  const allTime = sum(S.expenses.filter(e => e.category === sc), e => e.actual);
  return head('Savings Tracker', `Monthly savings come from expenses in the "${esc(sc)}" category. Goal progress is entered by hand.`,
    `<div class="filters">${sel('sv.year', opts(years(), y), 'Year')}<label class="field"><span>Monthly savings target</span><input class="in" type="number" min="0" data-sv-target value="${t}" style="width:140px"></label></div>`) + `
  <div class="strip"><div><div class="lbl">Savings recorded (all time)</div><div class="v" style="color:var(--saving)">${fmt0(allTime)}</div></div>
    <div><div class="lbl">Goals saved to date</div><div class="v">${fmt0(sum(S.goals, g => g.saved))}</div></div><div><div class="lbl">Goals target</div><div class="v">${fmt0(sum(S.goals, g => g.target))}</div></div></div>
  <h3 class="sec">Savings goals</h3>
  ${bulk('goal')}${wrapT(`<tr>${chkAll('goal')}<th>Goal</th><th class="r">Target</th><th>Target date</th><th class="r">Saved to date</th><th>Progress</th><th class="r">Remaining</th><th class="r">Months left</th><th class="r">Needed / month</th><th></th></tr>${goals || '<tr><td colspan="10">No goals yet.</td></tr>'}`)}
  <div><button class="btn" data-act="add-goal">Add goal</button></div>
  <div class="grid two"><div class="card"><h3>Monthly savings vs. target (${y})</h3><div class="canvas-box"><canvas id="c6"></canvas></div></div>
  <div>${wrapT(`<tr><th>Month</th><th class="r">Income</th><th class="r">Saved</th><th class="r">Target</th><th class="r">Variance</th><th class="r">Rate</th><th class="r">Cumulative</th></tr>${mrows}`)}</div></div>`;
}
function postSavings() {
  const y = ui.sv.year, co = colors();
  chart('c6', { type: 'bar', data: { labels: MONTHS.map(m => m.slice(0, 3)), datasets: [{ label: 'Saved', data: MONTHS.map((m, i) => sum(exps({ year: y, month: i, cat: cfg().savingsCat }), e => e.actual)), backgroundColor: co.saving },
    { label: 'Target', data: MONTHS.map(() => num(S.savingsTarget)), backgroundColor: co.line }] }, options: axes() });
}

function vAnnual() {
  const y = ui.an.year; let bal = opening(y, 0);
  const rows = MONTHS.map((m, i) => { const inc = sum(incs(y, i), incTotal), mx = exps({ year: y, month: i }), act = sum(mx, e => e.actual), op = bal; bal = op + inc - act;
    return { m, inc, bud: sum(mx, e => e.budget), act, sav: sum(exps({ year: y, month: i, cat: cfg().savingsCat }), e => e.actual), net: inc - act, op, cl: bal, unp: sum(mx, unpaidAmt) }; });
  const T = f => sum(rows, f), rate = T(r => r.inc) ? T(r => r.sav) / T(r => r.inc) : 0;
  const body = rows.map(r => `<tr><td>${r.m}</td><td class="r num">${fmt0(r.inc)}</td><td class="r num">${fmt0(r.bud)}</td><td class="r num">${fmt0(r.act)}</td><td class="r num">${fmt0(r.sav)}</td>
    <td class="r num ${r.net < 0 ? 'neg' : ''}">${fmt0(r.net)}</td><td class="r num">${r.inc ? pc(r.sav / r.inc) : '-'}</td><td class="r num">${fmt0(r.op)}</td><td class="r num">${fmt0(r.cl)}</td><td class="r num">${fmt0(r.unp)}</td></tr>`).join('');
  const act = T(r => r.act), active = rows.filter(r => r.act > 0).length || 1;
  const crow = cats().map(c => { const rs = exps({ year: y, cat: c.name }), b = sum(rs, e => e.budget), a = sum(rs, e => e.actual);
    return `<tr><td>${esc(c.name)}</td><td class="r num">${fmt0(b)}</td><td class="r num">${fmt0(a)}</td><td class="r num ${b - a < 0 ? 'neg' : ''}">${fmt0(b - a)}</td><td class="r num">${act ? pc(a / act) : '-'}</td><td class="r num">${fmt0(a / active)}</td></tr>`; }).join('');
  return head('Annual Summary', 'Yearly totals and a month-by-month comparison. The balance rolls forward each month.', `<div class="filters">${sel('an.year', opts(years(), y), 'Year')}</div>`) + `
  <div class="grid kpis">${kpi('k-income', 'Total annual income', fmt0(T(r => r.inc)), '')}${kpi('k-expense', 'Total expenses', fmt0(act), '')}${kpi('k-saving', 'Total savings', fmt0(T(r => r.sav)), '')}
    ${kpi('k-income', 'Net balance', fmt0(T(r => r.net)), 'Income minus expenses', T(r => r.net) < 0)}${kpi('k-saving', 'Average savings rate', pc(rate), '')}</div>
  ${wrapT(`<tr><th>Month</th><th class="r">Income</th><th class="r">Budgeted</th><th class="r">Actual</th><th class="r">Savings</th><th class="r">Net</th><th class="r">Savings rate</th><th class="r">Opening bal.</th><th class="r">Closing bal.</th><th class="r">Unpaid</th></tr>${body}
    <tr class="total"><td>Total / year</td><td class="r num">${fmt0(T(r => r.inc))}</td><td class="r num">${fmt0(T(r => r.bud))}</td><td class="r num">${fmt0(act)}</td><td class="r num">${fmt0(T(r => r.sav))}</td><td class="r num">${fmt0(T(r => r.net))}</td><td class="r num">${pc(rate)}</td><td class="r num">${fmt0(rows[0].op)}</td><td class="r num">${fmt0(rows[11].cl)}</td><td class="r num">${fmt0(T(r => r.unp))}</td></tr>`)}
  <div class="grid two"><div class="card"><h3>Closing balance by month</h3><div class="canvas-box"><canvas id="c7"></canvas></div></div>
  <div>${wrapT(`<tr><th>Category</th><th class="r">Budgeted</th><th class="r">Actual</th><th class="r">Variance</th><th class="r">% of expenses</th><th class="r">Avg / active month</th></tr>${crow}`)}</div></div>`;
}
function postAnnual() {
  const y = ui.an.year, co = colors(); let bal = opening(y, 0);
  const data = MONTHS.map((m, i) => bal += sum(incs(y, i), incTotal) - sum(exps({ year: y, month: i }), e => e.actual));
  chart('c7', { type: 'line', data: { labels: MONTHS.map(m => m.slice(0, 3)), datasets: [{ label: 'Closing balance', data, borderColor: co.saving, backgroundColor: co.saving, tension: .2, pointRadius: 4 }] }, options: axes(false) });
}

const accountCard = () => `<div class="card"><h3>Account</h3><p class="note" style="margin-bottom:10px">Signed in as <b>${esc(USER)}</b>. Your data is stored in this browser under this account.</p>
  <form class="form" id="pwForm"><label class="field wide"><span>Current password</span><input type="password" name="cur" autocomplete="current-password" required></label>
  <label class="field"><span>New password</span><input type="password" name="n1" autocomplete="new-password" minlength="8" required></label>
  <label class="field"><span>Confirm new password</span><input type="password" name="n2" autocomplete="new-password" minlength="8" required></label>
  <div class="actions"><button class="btn" type="submit">Change password</button></div></form>
  <div class="actions" style="margin-top:14px;flex-wrap:wrap;align-items:end"><button class="btn ghost" data-act="logout">Log out</button>
  <label class="field" style="margin-left:auto"><span>Password to delete account</span><input type="password" id="delpw" autocomplete="current-password"></label><button class="btn danger" data-act="rm-account">Delete my account</button></div></div>`;
const yearsCard = () => { const ex = (S.extraYears || []).slice().sort(), used = y => S.income.some(r => r.year === y) || S.expenses.some(e => parts(e.date).y === y);
  return `<div class="card"><h3>Years</h3><p class="note">${TY - 1} to ${TY + 1} and any year that has records always appear in the year dropdowns. Add more here.</p><div style="margin:10px 0">${addYearCtl()}</div>
  <div class="actions" style="flex-wrap:wrap">${ex.map(y => used(y) ? `<span class="pill p-info">${y} (has data)</span>` : `<button class="btn ghost sm" data-act="rm-year" data-id="${y}">Remove ${y}</button>`).join('') || '<span class="note">No extra years added yet.</span>'}</div></div>`; };
function vSettings() {
  const s = cfg(), used = n => S.expenses.some(e => e.category === n);
  const crows = s.categories.map((c, i) => `<tr><td><input class="in" data-cat="${i}:name" value="${esc(c.name)}"></td><td><select class="in" data-cat="${i}:group">${opts(s.groups.map(g => [g, g]), c.group)}</select></td>
    <td>${used(c.name) ? '<span class="note">in use</span>' : delBtn('cat', i)}</td></tr>`).join('');
  return head('Settings', 'Account, years, categories and options that drive dropdowns and calculations.') + `
  <div class="grid two">${accountCard()}${yearsCard()}</div>
  <div class="grid two">
    <div class="card"><h3>Options</h3><div class="form">
      <label class="field"><span>Opening balance before your first record</span><input class="in" type="number" step="0.01" data-set="openingBalance" value="${s.openingBalance}"></label>
      <label class="field"><span>Bill reminder window (days)</span><input class="in" type="number" min="0" data-set="remindDays" value="${s.remindDays}"></label>
      <label class="field"><span>"Approaching budget" threshold (%)</span><input class="in" type="number" min="1" max="100" data-set="threshold" value="${s.threshold}"></label>
      <label class="field"><span>Savings category</span><select class="in" data-set="savingsCat">${catOpts(s.savingsCat)}</select></label></div></div>
    <div class="card"><h3>Allocation groups</h3><div class="form"><label class="field wide"><span>Comma-separated list</span><input class="in" data-set="groups" value="${esc(s.groups.join(', '))}"></label></div>
      <p class="note">Each category belongs to one group. Used by the Allocation Planner.</p></div></div>
  <div class="card"><h3>Expense categories</h3>${wrapT(`<tr><th>Category</th><th>Allocation group</th><th></th></tr>${crows}`)}
    <p class="note">Renaming a category updates existing expenses. Categories with expenses cannot be deleted.</p><div style="margin-top:10px"><button class="btn" data-act="add-cat">Add category</button></div></div>
  <div class="card"><h3>Your data</h3><p class="note">Data is saved in this browser only. Use Export to copy a backup, and paste it into the box and press Import to restore it elsewhere.</p>
    <textarea id="xfer" spellcheck="false" placeholder="Export fills this box. Paste a backup here to import.">${esc(ui.xfer)}</textarea>
    <div class="actions" style="margin-top:10px;flex-wrap:wrap"><button class="btn" data-act="export">Export backup</button><button class="btn ghost" data-act="import">Import</button>
    <button class="btn ghost" data-act="load-sample">Load sample data</button><button class="btn ${ui.confirm === 'wipe' ? 'danger' : 'ghost'}" data-act="wipe">${ui.confirm === 'wipe' ? 'Confirm: erase everything' : 'Start fresh (erase all)'}</button></div></div>`;
}

function vHelp() {
  const dl = a => `<dl>${a.map(([t, d]) => `<dt>${t}</dt><dd>${d}</dd>`).join('')}</dl>`;
  return head('How to use this tracker', 'Yellow-tinted fields are inputs. Everything else calculates by itself.') + `<div class="card help">
  <h3>One-time setup</h3>${dl([['Settings', 'Set your opening balance and add or rename categories.'], ['Monthly Budget', 'Pick a month, then set the planned budget for each category.'], ['Allocation Planner', 'Set the % of income for each category. The check shows when it totals 100%.']])}
  <h3>Every month</h3>${dl([['Income', 'Add the month\'s salary, additional income, overtime and bonuses.'], ['Expenses', 'Add one record per expense. For a bill you have not paid, enter the budgeted amount, leave Actual at 0, set Unpaid and add a due date.'],
    ['Bill Reminders', 'Unpaid bills show as OVERDUE, DUE SOON or Upcoming. Press Mark paid when done.'], ['Dashboard', 'Filter by month, year, category and status. Cards, charts and tables update at once.'], ['Savings / Annual', 'Review goals and compare months.']])}
  <h3>How the numbers work</h3>${dl([['Total income', 'Basic salary + additional income + overtime + bonuses.'], ['Remaining balance', 'Total income - total actual expenses. Savings is an expense category, so what remains is unallocated cash.'],
    ['Savings rate', 'Total savings / total income.'], ['Budget variance', 'Budgeted - actual. Positive means under budget.'], ['Unpaid amount', 'The actual amount if entered, otherwise the budgeted amount.'],
    ['Monthly rollover', 'Opening balance = your opening balance + all earlier income - all earlier expenses. Each closing balance carries into the next month, including across years.'],
    ['Colours', 'Green = within budget, amber = approaching the limit (threshold in Settings), red = over budget. Savings turns amber when below goal.'],
    ['Dashboard filters', 'Balance and savings follow Month and Year. Total expenses also follows Category and Status. The doughnut and budget charts ignore Category.']])}</div>`;
}

/* ---------- charts ---------- */
let charts = [];
const cssv = v => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
function colors() {
  return { income: cssv('--income'), expense: cssv('--expense'), saving: cssv('--saving'), ink: cssv('--ink'), ink2: cssv('--ink-2'), line: cssv('--line'), surface: cssv('--surface'),
    palette: ['#1d58b8','#c2352a','#17803f','#e0a100','#7b4fbf','#0e9aa7','#e67e22','#8e9aaf','#d94f8b','#5d6d7e','#2e4057','#a3b18a','#bc6c25'] };
}
function axes(legend = true) {
  const co = colors();
  return { maintainAspectRatio: false, plugins: { legend: { display: legend, position: 'bottom', labels: { boxWidth: 10 } }, tooltip: { callbacks: { label: c => ` ${c.dataset.label}: ${fmt0(c.raw)}` } } },
    scales: { x: { grid: { display: false }, ticks: { color: co.ink2 } }, y: { beginAtZero: true, grid: { color: co.line }, ticks: { color: co.ink2, callback: v => v.toLocaleString('en-PH') } } } };
}
function chart(id, conf) {
  const el = document.getElementById(id); if (!el || !window.Chart) return;
  const co = colors(); Chart.defaults.color = co.ink2; Chart.defaults.font.family = cssv('--font-body');
  if (conf.options?.indexAxis === 'y') { conf.options.scales = { x: { beginAtZero: true, grid: { color: co.line }, ticks: { color: co.ink2 } }, y: { grid: { display: false }, ticks: { color: co.ink2, font: { size: 11 } } } }; }
  charts.push(new Chart(el, conf));
}

/* ---------- render ---------- */
const VIEWS = { dashboard: [vDashboard, postDashboard], income: [vIncome], expenses: [vExpenses], budget: [vBudget], allocation: [vAllocation, postAllocation],
  bills: [vBills], savings: [vSavings, postSavings], annual: [vAnnual, postAnnual], settings: [vSettings], help: [vHelp] };
function render(keepFocus) {
  if (!S) return;
  charts.forEach(c => c.destroy()); charts = [];
  const exIds = new Set(S.expenses.map(x => x.id)), have = { exp: exIds, bill: exIds, inc: new Set(S.income.map(x => x.id)), goal: new Set(S.goals.map(x => x.id)) };
  for (const k in ui.sel) ui.sel[k] = new Set([...ui.sel[k]].filter(i => have[k].has(i)));
  const sy = $('.scroll-y') ? $('.scroll-y').scrollTop : 0;
  $('#whoName').textContent = USER || '';
  const focusId = keepFocus && document.activeElement && document.activeElement.id;
  $('#tabs').innerHTML = TABS.map(([k, l]) => `<button class="tab" role="tab" data-tab="${k}" aria-selected="${k === ui.tab}">${l}</button>`).join('');
  const [v, post] = VIEWS[ui.tab]; $('#view').innerHTML = v(); post && post();
  if (sy && $('.scroll-y')) $('.scroll-y').scrollTop = sy;
  if (focusId) { const el = document.getElementById(focusId); if (el) { el.focus(); try { el.setSelectionRange(el.value.length, el.value.length); } catch (e) { /* not a text input */ } } }
}
let tt; function toast(m) { const t = $('#toast'); t.textContent = m; t.hidden = false; clearTimeout(tt); tt = setTimeout(() => t.hidden = true, 2400); }
const commit = (msg, keep) => { save(); render(keep); if (msg) toast(msg); };

/* ---------- accounts (stored in this browser only) ---------- */
let authMode = 'login';
const getUsers = () => { try { return JSON.parse(store.get(USERS) || '{}'); } catch (e) { return {}; } };
const putUsers = u => store.set(USERS, JSON.stringify(u));
const hex = buf => [...new Uint8Array(buf)].map(x => x.toString(16).padStart(2, '0')).join('');
const canCrypto = () => !!(window.crypto && crypto.subtle && crypto.getRandomValues);
const rand = () => hex(crypto.getRandomValues(new Uint8Array(16)));
async function hashPw(pw, saltHex) {
  const salt = Uint8Array.from(saltHex.match(/../g).map(h => parseInt(h, 16)));
  const k = await crypto.subtle.importKey('raw', new TextEncoder().encode(pw), 'PBKDF2', false, ['deriveBits']);
  return hex(await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 150000, hash: 'SHA-256' }, k, 256));
}
const authErr = m => { const el = $('#authMsg'); if (el) el.textContent = m; else toast(m); return false; };
const NOCRYPTO = 'This browser cannot create secure accounts. Use a current version of Chrome, Edge, Firefox or Safari.';
function openUser(id) {
  let d = null; try { d = JSON.parse(store.get(DATA + id) || 'null'); } catch (e) { d = null; }
  S = normalize(d && d.settings ? d : blank()); USER = id;
  ui.tab = 'dashboard'; ui.sel = emptySel(); ui.confirm = null; ui.editExp = null; ui.editInc = null;
  $('#auth').hidden = true; $('#app').hidden = false; render(); window.scrollTo(0, 0);
}
function startSession(id, remember) { store.del(SESSION); store.del(SESSION, true); store.set(SESSION, id, !remember); openUser(id); }
function logout() { save(); S = null; USER = null; store.del(SESSION); store.del(SESSION, true); charts.forEach(c => c.destroy()); charts = []; authMode = 'login'; renderAuth(); }
async function doRegister(d) {
  if (!canCrypto()) return authErr(NOCRYPTO);
  const name = (d.username || '').trim(), id = name.toLowerCase(), users = getUsers();
  if (!/^[a-z0-9_.-]{3,24}$/i.test(name)) return authErr('Username needs 3 to 24 letters, numbers, dots, dashes or underscores.');
  if (users[id]) return authErr('That username is taken. Pick another, or log in.');
  if ((d.password || '').length < 8) return authErr('Password must be at least 8 characters.');
  if (d.password !== d.confirm) return authErr('The two passwords do not match.');
  const salt = rand(); users[id] = { display: name, salt, hash: await hashPw(d.password, salt), created: Date.now() };
  let data = null, adopted = false;
  if (Object.keys(users).length === 1) { try { const raw = store.get('personalBudgetTracker.v1'); data = raw ? JSON.parse(raw) : null; adopted = !!(data && data.settings); } catch (e) { data = null; } }
  if (!adopted) data = d.sample ? sample() : blank();
  putUsers(users); store.set(DATA + id, JSON.stringify(normalize(data)));
  if (adopted) store.del('personalBudgetTracker.v1');
  startSession(id, !!d.remember); toast(adopted ? 'Account created. Your earlier data was added to it.' : 'Account created');
}
async function doLogin(d) {
  if (!canCrypto()) return authErr(NOCRYPTO);
  const id = (d.username || '').trim().toLowerCase(), users = getUsers(); let lock = {};
  try { lock = JSON.parse(store.get(LOCK + id) || '{}'); } catch (e) { lock = {}; }
  if (lock.until > Date.now()) return authErr(`Too many attempts. Try again in ${Math.ceil((lock.until - Date.now()) / 1000)} seconds.`);
  const u = users[id], ok = !!u && (await hashPw(d.password || '', u.salt)) === u.hash;
  if (!ok) { const n = (lock.n || 0) + 1; store.set(LOCK + id, JSON.stringify(n >= 5 ? { n: 0, until: Date.now() + 30000 } : { n }));
    return authErr(n >= 5 ? 'Too many attempts. Try again in 30 seconds.' : 'Wrong username or password.'); }
  store.del(LOCK + id); startSession(id, !!d.remember);
}
async function changePw(d, form) {
  const users = getUsers(), u = users[USER];
  if (!canCrypto()) return toast(NOCRYPTO);
  if (!u || (await hashPw(d.cur, u.salt)) !== u.hash) return toast('Current password is wrong');
  if (d.n1.length < 8) return toast('New password must be at least 8 characters');
  if (d.n1 !== d.n2) return toast('The new passwords do not match');
  u.salt = rand(); u.hash = await hashPw(d.n1, u.salt); putUsers(users); form.reset(); toast('Password changed');
}
async function deleteAccount() {
  const users = getUsers(), u = users[USER], pw = ($('#delpw') || {}).value || '';
  if (!pw) return toast('Enter your password to delete the account');
  if (!u || (await hashPw(pw, u.salt)) !== u.hash) return toast('Password is wrong');
  const id = USER; delete users[id]; putUsers(users); store.del(DATA + id); S = null; USER = null; logout(); toast('Account deleted');
}
function renderAuth() {
  $('#app').hidden = true; const a = $('#auth'); a.hidden = false;
  const reg = authMode === 'register', first = !Object.keys(getUsers()).length, legacy = first && !!store.get('personalBudgetTracker.v1');
  a.innerHTML = `<div class="auth-wrap"><div class="card auth-card">
    <div class="auth-top"><div class="brand auth-brand">Budjito<small>${reg ? 'Create your account' : 'Track mo ang budget mo!'}</small></div><button type="button" class="theme-btn js-theme">Lights on's / lights off</button></div>
    <div class="seg"><button type="button" class="${reg ? '' : 'on'}" data-act="auth-mode" data-id="login">Log in</button><button type="button" class="${reg ? 'on' : ''}" data-act="auth-mode" data-id="register">Create account</button></div>
    ${reg ? `<form class="stack" id="regForm"><label class="field"><span>Username</span><input name="username" autocomplete="username" required minlength="3" maxlength="24" autofocus></label>
      <label class="field"><span>Password (8+ characters)</span><input type="password" name="password" autocomplete="new-password" required minlength="8"></label>
      <label class="field"><span>Confirm password</span><input type="password" name="confirm" autocomplete="new-password" required minlength="8"></label>
      ${legacy ? '<p class="note">Your existing tracker data on this browser will be added to this account.</p>' : '<label class="chk"><input type="checkbox" name="sample" checked> Start with sample data (June to November 2026)</label>'}
      <label class="chk"><input type="checkbox" data-showpw> Show passwords</label><label class="chk"><input type="checkbox" name="remember" checked> Keep me logged in on this browser</label>
      <button class="btn" type="submit">Create account</button></form>`
    : `<form class="stack" id="loginForm"><label class="field"><span>Username</span><input name="username" autocomplete="username" required autofocus></label>
      <label class="field"><span>Password</span><input type="password" name="password" autocomplete="current-password" required></label>
      <label class="chk"><input type="checkbox" data-showpw> Show password</label><label class="chk"><input type="checkbox" name="remember" checked> Keep me logged in on this browser</label>
      <button class="btn" type="submit">Log in</button></form>`}
    <p class="msg" id="authMsg" role="alert"></p>
    <p class="note">Accounts and data live in this browser only. There is no password recovery, and anyone who can open this browser's site data can read them. Use Settings > Export backup to keep a copy.</p></div></div>`;
}

/* ---------- events ---------- */
function setPath(path, raw) {
  const [a, b] = path.split('.'); ui[a][b] = (b === 'cat' || b === 'status' || b === 'q') ? raw : (raw === 'All' ? 'All' : /^\d+$/.test(raw) ? +raw : raw);
}
document.addEventListener('click', e => {
  const tab = e.target.closest('[data-tab]'); if (tab) { ui.tab = tab.dataset.tab; ui.confirm = null; ui.sel = emptySel(); render(); window.scrollTo(0, 0); return; }
  const b = e.target.closest('[data-act]'); if (!b) return;
  const id = b.dataset.id, act = b.dataset.act, ck = act.replace('del-', '') + id;
  if (act === 'edit-exp') { ui.editExp = id; render(); window.scrollTo(0, 0); }
  else if (act === 'cancel-exp') { ui.editExp = null; render(); }
  else if (act === 'edit-inc') { ui.editInc = id; render(); window.scrollTo(0, 0); }
  else if (act === 'cancel-inc') { ui.editInc = null; render(); }
  else if (act.startsWith('del-')) {
    if (ui.confirm !== ck) { ui.confirm = ck; render(); return; }
    ui.confirm = null;
    if (act === 'del-exp') S.expenses = S.expenses.filter(x => x.id !== id);
    if (act === 'del-inc') S.income = S.income.filter(x => x.id !== id);
    if (act === 'del-goal') S.goals = S.goals.filter(x => x.id !== id);
    if (act === 'del-cat') { const c = cfg().categories[+id]; cfg().categories.splice(+id, 1); delete S.budgets[c.name]; delete S.alloc[c.name]; }
    commit('Deleted');
  }
  else if (act === 'auth-mode') { authMode = b.dataset.id; renderAuth(); }
  else if (act === 'logout') logout();
  else if (act === 'rm-account') deleteAccount();
  else if (act === 'rm-year') { S.extraYears = S.extraYears.filter(y => y !== +id); commit('Year removed'); }
  else if (act === 'bulk-clear') { ui.sel[b.dataset.t] = new Set(); ui.confirm = null; render(); }
  else if (act === 'bulk-paid') { const ids = ui.sel[b.dataset.t], n = ids.size; S.expenses.forEach(x => { if (ids.has(x.id)) { x.status = 'Paid'; if (!num(x.actual)) x.actual = num(x.budget); } });
    ui.sel[b.dataset.t] = new Set(); commit(`${n} marked as paid`); }
  else if (act === 'bulk-del') { const t = b.dataset.t, c = 'bulk' + t; if (ui.confirm !== c) { ui.confirm = c; render(); return; }
    const ids = ui.sel[t], n = ids.size;
    if (t === 'exp' || t === 'bill') S.expenses = S.expenses.filter(x => !ids.has(x.id)); else if (t === 'inc') S.income = S.income.filter(x => !ids.has(x.id)); else S.goals = S.goals.filter(x => !ids.has(x.id));
    ui.sel[t] = new Set(); ui.confirm = null; commit(`Deleted ${n} ${n === 1 ? 'record' : 'records'}`); }
  else if (act === 'mark-paid') { const x = S.expenses.find(r => r.id === id); x.status = 'Paid'; if (!num(x.actual)) x.actual = num(x.budget); commit('Marked as paid'); }
  else if (act === 'add-goal') { S.goals.push({ id: uid(), name: 'New goal', target: 10000, date: '', saved: 0 }); commit(); }
  else if (act === 'add-cat') { if (cats().length >= 20) return toast('Up to 20 categories'); cfg().categories.push({ name: 'New category', group: cfg().groups[0] || 'Other' }); commit(); }
  else if (act === 'export') { ui.xfer = JSON.stringify(S, null, 1); render(); const t = $('#xfer'); t.select(); try { navigator.clipboard.writeText(ui.xfer).then(() => toast('Backup copied'), () => toast('Select the text and copy it')); } catch (x) { toast('Select the text and copy it'); } }
  else if (act === 'import') { try { const d = JSON.parse($('#xfer').value); if (!d.settings || !d.expenses || !d.income) throw 0; S = normalize(d); ui.xfer = ''; commit('Backup imported'); } catch (x) { toast('That is not a valid backup'); } }
  else if (act === 'load-sample') { S = normalize(sample()); commit('Sample data loaded'); }
  else if (act === 'wipe') { if (ui.confirm !== 'wipe') { ui.confirm = 'wipe'; render(); return; } ui.confirm = null; S = normalize(blank()); commit('All data erased'); }
});
document.addEventListener('change', e => {
  const t = e.target;
  if (t.dataset.sel) { const [k, id] = t.dataset.sel.split(':'); if (t.checked) ui.sel[k].add(id); else ui.sel[k].delete(id); ui.confirm = null; render(); return; }
  if (t.dataset.selall) { const k = t.dataset.selall, v = ui.vis[k] || []; v.forEach(i => t.checked ? ui.sel[k].add(i) : ui.sel[k].delete(i)); ui.confirm = null; render(); return; }
  if (t.hasAttribute('data-showpw')) { document.querySelectorAll('#auth input[type="password"], #auth input[data-pw]').forEach(i => { i.type = t.checked ? 'text' : 'password'; i.dataset.pw = '1'; }); return; }
  if (t.dataset.f) { setPath(t.dataset.f, t.value); render(t.id === 'exSearch'); return; }
  if (t.dataset.bud) { S.budgets[t.dataset.bud] = num(t.value); commit(); }
  else if (t.dataset.al) { S.alloc[t.dataset.al] = num(t.value); commit(); }
  else if (t.dataset.goal) { const [id, f] = t.dataset.goal.split(':'); const g = S.goals.find(x => x.id === id); g[f] = (f === 'name' || f === 'date') ? t.value : num(t.value); commit(); }
  else if (t.hasAttribute('data-sv-target')) { S.savingsTarget = num(t.value); commit(); }
  else if (t.dataset.set) {
    const k = t.dataset.set, s = cfg();
    if (k === 'groups') { s.groups = t.value.split(',').map(x => x.trim()).filter(Boolean); s.categories.forEach(c => { if (!s.groups.includes(c.group)) c.group = s.groups[0] || 'Other'; }); }
    else if (k === 'savingsCat') s[k] = t.value;
    else s[k] = num(t.value);
    commit('Saved');
  }
  else if (t.dataset.cat) {
    const [i, f] = t.dataset.cat.split(':'), c = cfg().categories[+i];
    if (f === 'name') { const n = t.value.trim(), old = c.name;
      if (!n || cfg().categories.some((x, j) => j !== +i && x.name === n)) { toast('Category names must be unique and not empty'); render(); return; }
      c.name = n; S.expenses.forEach(x => { if (x.category === old) x.category = n; });
      [S.budgets, S.alloc].forEach(o => { if (old in o) { o[n] = o[old]; delete o[old]; } }); if (cfg().savingsCat === old) cfg().savingsCat = n; }
    else c.group = t.value;
    commit('Saved');
  }
});
document.addEventListener('input', e => { if (e.target.id === 'exSearch') { ui.ex.q = e.target.value; render(true); } });
document.addEventListener('submit', e => {
  e.preventDefault(); const f = e.target, d = Object.fromEntries(new FormData(f));
  if (f.id === 'loginForm') return void doLogin(d);
  if (f.id === 'regForm') return void doRegister(d);
  if (f.id === 'pwForm') return void changePw(d, f);
  if (f.id === 'yearForm') { const y = parseInt(d.y, 10); if (!(y >= 1990 && y <= 2100)) return toast('Enter a year between 1990 and 2100');
    const had = years().some(([v]) => v === y); if (!had) S.extraYears.push(y);
    ui.dash.year = ui.mb.year = ui.al.year = ui.sv.year = ui.an.year = y; return commit(had ? `Showing ${y}` : `Year ${y} added`); }
  if (f.id === 'expForm') {
    const rec = { date: d.date, category: d.category, desc: d.desc.trim(), budget: num(d.budget), actual: num(d.actual), status: d.status, due: d.due, notes: d.notes.trim() };
    if (!rec.date || !rec.category) return toast('Enter a date and category');
    if (ui.editExp) Object.assign(S.expenses.find(x => x.id === ui.editExp), rec); else S.expenses.push({ id: uid(), ...rec });
    const edited = !!ui.editExp; ui.editExp = null; commit(edited ? 'Expense updated' : 'Expense added');
  } else if (f.id === 'incForm') {
    const rec = { year: +d.year, month: +d.month, basic: num(d.basic), additional: num(d.additional), overtime: num(d.overtime), bonus: num(d.bonus), notes: d.notes.trim() };
    let target = S.income.find(x => x.id === ui.editInc) || S.income.find(x => x.year === rec.year && x.month === rec.month);
    if (target) Object.assign(target, rec); else S.income.push({ id: uid(), ...rec });
    const upd = !!target; ui.editInc = null; commit(upd ? 'Income updated' : 'Income added');
  }
});
document.addEventListener('click', e => {
  if (!e.target.closest('.js-theme')) return;
  const r = document.documentElement, dark = r.dataset.theme ? r.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  r.dataset.theme = dark ? 'light' : 'dark'; if (S) render();
});
matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', () => { if (S) render(); });
const sess = store.get(SESSION, true) || store.get(SESSION);
if (sess && getUsers()[sess]) openUser(sess); else { authMode = Object.keys(getUsers()).length ? 'login' : 'register'; renderAuth(); }
})();
