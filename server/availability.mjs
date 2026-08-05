import { addMinutes } from './utils.mjs';

function datePartsInZone(date, timeZone) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone, year:'numeric', month:'2-digit', day:'2-digit' }).formatToParts(date);
  return Object.fromEntries(parts.filter(p=>p.type!=='literal').map(p=>[p.type,Number(p.value)]));
}

function offsetMinutes(date, timeZone) {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone, hour12:false, year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit', second:'2-digit' }).formatToParts(date);
  const map = Object.fromEntries(parts.filter(p=>p.type!=='literal').map(p=>[p.type,Number(p.value)]));
  const asUtc = Date.UTC(map.year,map.month-1,map.day,map.hour===24?0:map.hour,map.minute,map.second);
  return (asUtc-date.getTime())/60000;
}

function zonedTimeToUtc(dateKey, hhmm, timeZone) {
  const [year, month, day] = dateKey.split('-').map(Number);
  const [hour, minute] = hhmm.split(':').map(Number);
  const wallAsUtc = new Date(Date.UTC(year,month-1,day,hour,minute,0,0));
  let result = new Date(wallAsUtc.getTime()-offsetMinutes(wallAsUtc,timeZone)*60000);
  result = new Date(wallAsUtc.getTime()-offsetMinutes(result,timeZone)*60000);
  return result;
}

export function overlaps(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd;
}

export function generateAvailability(settings, bookings, from = new Date()) {
  const result = [];
  const timezone = settings.timezone || 'Europe/Bratislava';
  const base = datePartsInZone(from, timezone);
  const minimum = addMinutes(new Date(), settings.minimumNoticeHours * 60);
  const active = bookings.filter(b => ['PENDING_PAYMENT', 'CONFIRMED'].includes(b.status) && (!b.holdExpiresAt || new Date(b.holdExpiresAt) > new Date() || b.status === 'CONFIRMED'));

  for (let dayOffset = 0; dayOffset <= settings.bookingHorizonDays; dayOffset++) {
    const anchor = new Date(Date.UTC(base.year, base.month - 1, base.day + dayOffset, 12, 0, 0));
    const year=anchor.getUTCFullYear(), month=anchor.getUTCMonth()+1, day=anchor.getUTCDate();
    const dateKey = `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    const dayOfWeek = anchor.getUTCDay();
    const windows = settings.weeklyAvailability[String(dayOfWeek)] || [];
    const slots = [];
    for (const window of windows) {
      let cursor = zonedTimeToUtc(dateKey, window.start, timezone);
      const end = zonedTimeToUtc(dateKey, window.end, timezone);
      while (addMinutes(cursor, settings.durationMinutes) <= end) {
        const slotEnd = addMinutes(cursor, settings.durationMinutes);
        const iso = cursor.toISOString();
        const blocked = (settings.blockedSlots || []).some(s => s.startsAt === iso);
        const collision = active.some(b => overlaps(cursor, slotEnd, new Date(b.startsAt), new Date(b.endsAt)));
        if (cursor >= minimum && !blocked && !collision) {
          slots.push({ startsAt: iso, endsAt: slotEnd.toISOString(), label: new Intl.DateTimeFormat('sk-SK',{timeZone:timezone,hour:'2-digit',minute:'2-digit'}).format(cursor) });
        }
        cursor = slotEnd;
      }
    }
    result.push({
      date: dateKey,
      weekday: new Intl.DateTimeFormat('sk-SK',{timeZone:'UTC',weekday:'short'}).format(anchor),
      label: new Intl.DateTimeFormat('sk-SK',{timeZone:'UTC',day:'numeric',month:'short'}).format(anchor),
      slots
    });
  }
  return result;
}
