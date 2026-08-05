function bookingHtml(booking, settings, manageToken) {
  const date = new Date(booking.startsAt || booking.starts_at);
  const formatted = new Intl.DateTimeFormat('sk-SK', { dateStyle: 'full', timeStyle: 'short', timeZone: settings.timezone }).format(date);
  const manageUrl = `${process.env.APP_URL || 'http://localhost:3000'}/?manage=${encodeURIComponent(manageToken || '')}`;
  return `<!doctype html><html><body style="margin:0;background:#070707;color:#f3efe6;font-family:Arial,sans-serif"><div style="max-width:560px;margin:auto;padding:40px 24px"><div style="color:#d3a437;letter-spacing:3px;font-weight:800">KOTRASKO</div><h1 style="font-size:34px">Tvoj termín je potvrdený ✂️</h1><div style="border:1px solid #4d3b15;border-radius:18px;padding:22px;background:#121418"><p><b>${settings.serviceName}</b> · 10 € · 60 min</p><p>${formatted}</p><p>${settings.shopName}, ${settings.location}</p></div><p style="color:#b6b0a5">Pri zrušení rezervácie najskôr telefonicky kontaktuj prevádzku a potom ju zruš cez web.</p><a href="${manageUrl}" style="display:inline-block;margin-top:12px;padding:14px 20px;border-radius:12px;background:#d3a437;color:#070707;text-decoration:none;font-weight:700">Spravovať rezerváciu</a></div></body></html>`;
}

export async function sendConfirmation(booking, settings, manageToken) {
  if (!process.env.RESEND_API_KEY) return { skipped: true };
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.BOOKING_FROM_EMAIL || 'Kotrasko Booking <onboarding@resend.dev>',
      to: [booking.customerEmail || booking.customer_email],
      subject: 'Tvoj termín u Kotraska je potvrdený ✂️',
      html: bookingHtml(booking, settings, manageToken)
    })
  });
  if (!response.ok) throw new Error(`RESEND_${response.status}_${await response.text()}`);
  return response.json();
}

export async function sendAdminNotification(booking, settings) {
  if (!process.env.RESEND_API_KEY) return { skipped: true };
  const date = new Intl.DateTimeFormat('sk-SK', { dateStyle: 'medium', timeStyle: 'short', timeZone: settings.timezone }).format(new Date(booking.startsAt || booking.starts_at));
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.BOOKING_FROM_EMAIL || 'Kotrasko Booking <onboarding@resend.dev>',
      to: [process.env.ADMIN_NOTIFICATION_EMAIL || settings.email],
      subject: `Nová rezervácia: ${booking.customerName || booking.customer_name} — ${date}`,
      html: `<p>Nová zaplatená rezervácia.</p><p><b>${booking.customerName || booking.customer_name}</b><br>${date}<br>${booking.customerPhone || booking.customer_phone}<br>${booking.customerEmail || booking.customer_email}</p>`
    })
  });
  if (!response.ok) throw new Error(`RESEND_${response.status}_${await response.text()}`);
  return response.json();
}
