export function normalizePhone(raw: string): string | null {
  if (!raw) return null;

  // أزل أي رموز غير الأرقام
  let phone = raw.replace(/[^\d]/g, "");

  // ---------- مصر ----------
  // 01xxxxxxxxx -> 201xxxxxxxxx
  if (/^01[0-5]\d{8}$/.test(phone)) {
    phone = "20" + phone;
    return phone;
  }

  // 201xxxxxxxxx (صحيح)
  if (/^201[0-5]\d{8}$/.test(phone)) {
    return phone;
  }

  // ---------- دول عامة ----------
  // لو بدأ بـ 00 (مثال 00964...)
  if (phone.startsWith("00") && phone.length >= 10) {
    return phone.slice(2);
  }

  // كحالة أخيرة: لو طوله بين 10 و 15 رقم (E.164 بدون +)
  if (phone.length >= 10 && phone.length <= 15) {
    return phone;
  }

  return null; // غير صالح
}
