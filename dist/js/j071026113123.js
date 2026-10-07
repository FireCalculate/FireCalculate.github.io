/* ===== 每日预算配额（budget.html） ===== */

const WEEK = ['日', '一', '二', '三', '四', '五', '六'];
const DEFAULT_BIRTH = '1990-12-26';
const DEFAULT_FUND = 166.2;
const MIN_BIRTH = '1900-01-01';
const MAX_BIRTH = '2100-12-31';
const LS_BIRTH_KEY = 'budget_birth_date';
const LS_FUND_KEY = 'budget_fund';

/* ===== 通用工具 ===== */
const pad = n => String(n).padStart(2, '0');
const fmt = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
const dayStart = d => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const dayDiff = (a, b) => Math.round((dayStart(b) - dayStart(a)) / 86400000);
const grp = n => n.toLocaleString('en-US');
const money = n => n.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
const isLeapY = y => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;

// 一律按北京时间（Asia/Shanghai）计算，避免本机时区不是 +8 时「今天」错位一天
const TZF = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit',
    day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
});

function nowBJ() {
    const p = {};
    for (const x of TZF.formatToParts(new Date())) p[x.type] = x.value;
    let h = +p.hour;
    if (h === 24) h = 0;
    return new Date(+p.year, +p.month - 1, +p.day, h, +p.minute, +p.second);
}

/* ===== 可调项：出生日期 + 专项预算 ===== */
let BIRTH, FUND;

function lsGet(k) {
    try {
        return localStorage.getItem(k);
    } catch (e) {
        return null;
    }
}

function lsSet(k, v) {
    try {
        localStorage.setItem(k, v);
    } catch (e) {
    }
}

function parseD(s) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || '');
    if (!m) return null;
    const d = new Date(+m[1], +m[2] - 1, +m[3]);
    // 0~99 年会被 Date 当成 19xx（逐位敲年份时会出现 0001-12-26 这种值），一律视为无效
    return (d.getFullYear() === +m[1] && d.getMonth() === +m[2] - 1) ? d : null;
}

function birthInRange(d) {
    return !!d && d >= parseD(MIN_BIRTH) && d <= parseD(MAX_BIRTH);
}

function loadBirth() {
    const d = parseD(lsGet(LS_BIRTH_KEY));
    return birthInRange(d) ? d : parseD(DEFAULT_BIRTH);
}

function loadFund() {
    const v = parseFloat(lsGet(LS_FUND_KEY));
    return (isFinite(v) && v >= 0) ? v : DEFAULT_FUND;
}

function setBirth(d) {
    BIRTH = d;
    // 值没变就不回写，避免打断正在键入的日期
    if ($('#birthInput').val() !== fmt(BIRTH)) $('#birthInput').val(fmt(BIRTH));
    lsSet(LS_BIRTH_KEY, fmt(BIRTH));
    render();
}

function setFund(v, syncInput) {
    FUND = (isFinite(v) && v >= 0) ? v : 0;
    if (syncInput) $('#fundInput').val(FUND);
    lsSet(LS_FUND_KEY, String(FUND));
    render();
}

// -/+ 按钮：每次 ±1 万元，不低于 0
function stepFund(delta) {
    const v = parseFloat($('#fundInput').val()) || 0;
    setFund(Math.max(0, +(v + delta).toFixed(4)), true);
}

// 第 age 个生日的公历日期（2 月 29 出生时，平年落在 2 月 28）
function anniv(age) {
    const y = BIRTH.getFullYear() + age, m = BIRTH.getMonth(), d = BIRTH.getDate();
    if (m === 1 && d === 29 && !isLeapY(y)) return new Date(y, 1, 28);
    return new Date(y, m, d);
}

function ageParts(from, to) {
    let y = to.getFullYear() - from.getFullYear();
    let m = to.getMonth() - from.getMonth();
    let d = to.getDate() - from.getDate();
    if (d < 0) {
        m--;
        d += new Date(to.getFullYear(), to.getMonth(), 0).getDate();
    }
    if (m < 0) {
        y--;
        m += 12;
    }
    return {y, m, d};
}

/* ===== 渲染 ===== */
function render() {
    const now = nowBJ(), today = dayStart(now);
    const born = now >= BIRTH;

    /* 现在 */
    $('#clock').text(fmt(now) + ' ' + pad(now.getHours()) + ':' + pad(now.getMinutes()) + ':' + pad(now.getSeconds()) + '  北京时间（周' + WEEK[now.getDay()] + '）');

    const a = born ? ageParts(BIRTH, now) : ageParts(now, BIRTH);
    $('#livedLabel').text(born ? '已经活了' : '距离出生还有');
    $('#livedText').text(a.y + ' 岁 ' + a.m + ' 个月 ' + a.d + ' 天');

    const d50 = anniv(50);
    const pct = Math.max(0, Math.min(100, (now - BIRTH) / (d50 - BIRTH) * 100));
    $('#lifeBar').css('width', pct.toFixed(3) + '%');
    $('#lifePct').text(pct.toFixed(4) + '%');

    /* 距离 50 岁：天 / 小时 / 分钟 / 秒（到 50 岁生日当天 00:00 的实时剩余） */
    const target = dayStart(d50), left = target - now, days = dayDiff(today, d50);
    if (left > 0) {
        $('#cdHead').text('距离 50 岁');
        $('#cdD').text(grp(Math.floor(left / 86400000)));
        $('#cdH').text(pad(Math.floor(left / 3600000) % 24));
        $('#cdM').text(pad(Math.floor(left / 60000) % 60));
        $('#cdS').text(pad(Math.floor(left / 1000) % 60));
        const r = ageParts(today, d50);
        $('#cdNote').text(fmt(d50) + ' 周' + WEEK[d50.getDay()] + '　·　还有 ' + r.y + ' 年 ' + r.m + ' 个月 ' + r.d + ' 天');
    } else {
        $('#cdHead').text('50 岁已过');
        $('#cdD, #cdH, #cdM, #cdS').text('0');
        $('#cdNote').text(fmt(d50) + '　·　已过 ' + grp(-days) + ' 天');
    }

    /* 预算配额 */
    const total = FUND * 10000;
    $('#fundDisplay').text('¥' + grp(total));
    if (days > 0) {
        const perDay = total / days;
        $('#qDay').text('¥' + money(perDay));
        $('#qWeek').text('¥' + money(perDay * 7));
        $('#qMonth').text('¥' + money(perDay * 365.2425 / 12));
        $('#quotaNote').text(FUND + ' 万元（¥' + grp(total) + '）÷ 剩余 ' + grp(days) + ' 天，50 岁前花完');
    } else {
        $('#qDay').text('¥' + money(total));
        $('#qWeek, #qMonth').text('—');
        $('#quotaNote').text('50 岁已过，无法再按「50 岁前花完」折算每日额度');
    }

    /* 已活时长 */
    const ms = Math.abs(now - BIRTH);
    $('#livedHead').text(born ? '已活时长' : '距出生还有');
    $('#livedNote').text((born ? '出生 ' : '到 ') + fmt(BIRTH) + (born ? ' 起累计' : ' 为止'));
    $('#ld').text(grp(Math.floor(ms / 86400000)));
    $('#lh').text(grp(Math.floor(ms / 3600000)));
    $('#lm').text(grp(Math.floor(ms / 60000)));
    $('#ls').text(grp(Math.floor(ms / 1000)));
}

$(document).ready(function () {
    BIRTH = loadBirth();
    FUND = loadFund();
    $('#birthInput').val(fmt(BIRTH));
    $('#fundInput').val(FUND);

    // 键盘逐位输入年份时每敲一位都会触发 change：不完整/越界的值先忽略，失焦时再还原
    $('#birthInput').on('change', function () {
        const d = parseD($(this).val());
        if (birthInRange(d)) setBirth(d);
    }).on('blur', function () {
        $(this).val(fmt(BIRTH));
    });
    $('#fundInput').on('input', function () {
        setFund(parseFloat($(this).val()), false);
    });
    $('#resetBirth').on('click', function () {
        setBirth(parseD(DEFAULT_BIRTH));
    });
    $('#resetFund').on('click', function () {
        setFund(DEFAULT_FUND, true);
    });
    $('#fundMinus').on('click', function () {
        stepFund(-1);
    });
    $('#fundPlus').on('click', function () {
        stepFund(1);
    });

    render();
    setInterval(render, 1000);
});
