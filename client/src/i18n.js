import { useEffect, useState } from "react";

/**
 * Basit çok dilli yapı (Türkçe / İngilizce).
 * - Seçilen dil tarayıcıda saklanır (vc_lang) ve her API isteğine ?lang= olarak eklenir.
 * - Vaka metinlerini sunucu dile göre gönderir; ekran yazıları buradaki tablodan gelir.
 * - Yeni bir dil eklemek için: LANGS listesine ve STRINGS tablosuna ekleyin.
 */
export const LANGS = [
  { code: "tr", label: "Türkçe", short: "TR" },
  { code: "en", label: "English", short: "EN" }
];

const KEY = "vc_lang";

function read() {
  try {
    const v = localStorage.getItem(KEY);
    if (v === "tr" || v === "en") return v;
  } catch (e) {}
  return "tr";
}

let current = read();
const listeners = new Set();

export function getLang() {
  return current;
}

export function setLang(code) {
  if (code !== "tr" && code !== "en") return;
  current = code;
  try {
    localStorage.setItem(KEY, code);
  } catch (e) {}
  listeners.forEach((fn) => fn(code));
}

const STRINGS = {
  tr: {
    connecting: "Sunucuya bağlanılıyor... İlk açılış bir dakikaya kadar sürebilir, lütfen sayfayı kapatmayın.",
    loading: "Yükleniyor...",
    netBanner: "Bağlantı kesildi, yeniden bağlanılıyor... Cevabınız kaybolmaz, sayfayı kapatmayın.",
    map: "Harita",
    mapTitle: "Vaka Haritası",
    soundTitle: "Ses Aç / Kapa",
    langTitle: "Dil / Language",
    next: "Devam Et →",
    retry: "Tekrar Dene",
    "net.issue": "Bağlantı sorunu.",
    "net.fail": "Sunucuya bağlanılamadı. Bağlantınızı kontrol edin.",
    "net.gateway": "Sunucu şu an yanıt vermiyor, yeniden deneniyor.",
    "net.error": "Bir hata oluştu.",

    "team.eyebrow": "PROJE AYNA",
    "team.title": "VC Dedektifleri 2.0",
    "team.sub": "Dedektif ekibinin adını gir, soruşturmaya başlayalım.",
    "team.name": "Takım Adı",
    "team.namePh": "Örn: Sarı Bariyer Ekibi",
    "team.members": "Takım Üyeleri (opsiyonel)",
    "team.membersPh": "Örn: Ayşe, Mehmet, Can",
    "team.needName": "Lütfen bir takım adı girin.",
    "team.failed": "Takım oluşturulamadı.",
    "team.creating": "Oluşturuluyor...",
    "team.start": "Soruşturmaya Başla",

    "brief.eyebrow": "DOSYA BRİFİNGİ",
    "brief.welcome": "Hoş Geldiniz, {name}",
    "brief.p1a": "Altı ay önce İç Denetim'e imzasız bir not ulaştı. 9 dosya. 3 bölüm. Tek soru:",
    "brief.p1b": " notu yazan kişi neyi gördü?",
    "brief.p2": "Not, üç parçaya bölündü. Her bölüm sonunda bir parça + bir kod kazanacaksınız. Üç kod, Final Dosyası'nın kilidini açacak.",
    "brief.noteTitle": "İMZASIZ NOT",
    "brief.noteBody": "İÇERİK: [ ERİŞİM KISITLI ]",

    "chapter": "BÖLÜM {n}",
    "beat.event": "OLAY ANI",
    "beat.evidence": "KANIT ANI",
    "beat.decision": "KARAR ANI",
    "miniCase": "Mini Vaka {n} — {title}",
    "event.next": "Devam Et → Kanıt Anı",
    "evidence.hint": "Kanıtları incelemek veya büyütmek için kartlara tıklayın ↓",
    "evidence.next": "Devam Et → Karar Anı",
    "inspect": "🔍 Detaylı İncele / Büyüt",

    "dec.placeholder": "Takımınızın cevabını buraya yazın...",
    "dec.depth": "Analiz Derinliği:",
    "dec.q0": "Henüz yazılmadı",
    "dec.q1": "Kısa Yanıt",
    "dec.q2": "Yeterli Detay",
    "dec.q3": "Kapsamlı Analiz ✨",
    "dec.chars": "{n} karakter",
    "dec.needText": "Lütfen bir cevap yazın.",
    "dec.sendFail": "Cevap gönderilemedi.",
    "dec.send": "Cevabı Gönder",
    "dec.sending": "Gönderiliyor...",
    "dec.ref": "Referans Çözüm:",
    "dec.insight": "Final'e Taşınan İçgörü:",
    "dec.gmScores": "Oyun Yöneticisi puanınızı ayrıca değerlendirecek.",
    "dec.already": "Bu vaka için cevabınız daha önce kaydedildi; ilk cevabınız geçerlidir.",

    "clue.eyebrow": "ANA KANIT {h}",
    "clue.unlocking": "Kilit açılıyor...",
    "clue.hint": "Bu kodu saklayın — Final Dosyası'nın kilidini açmak için gerekecek.",

    "lock.eyebrow": "FİNAL DOSYASI",
    "lock.title": "Aynadaki Örüntü",
    "lock.hint": "Üç Ana Kanıt kodunu birleştirin ve girin.",
    "lock.open": "Kilidi Aç",
    "lock.checking": "Kontrol ediliyor...",
    "lock.wrong": "Kod hatalı, tekrar deneyin.",

    "pa.tag": "FİNAL — PARÇA A",
    "pa.title": "Örüntü Haritası",
    "pa.question": "İç Denetim'e sunulacak tek cümlelik teşhis nedir?",
    "pa.placeholder": "Bu şirketin asıl sorunu...",
    "pa.send": "Teşhisi Gönder",
    "pa.sendFail": "Gönderilemedi, tekrar deneyin.",
    "pa.already": "Bu teşhis daha önce kaydedildi; ilk cevabınız geçerlidir.",
    "pa.ref": "Referans:",
    "pa.next": "Devam Et → Son Gece",

    "night.title": "SON GECE",
    "night.note": "Bu bir gizem değil, bir örnek.",
    "nightEv.title": "Son Gece",
    "nightEv.next": "Devam Et → Üç Yolun Sınavı",

    "quiz.tag": "ÜÇ YOLUN SINAVI",
    "quiz.intro": "Bu gecedeki her kanıt için, tam tersini gösteren mini vakayı seçin.",
    "quiz.select": "Bir mini vaka seçin...",
    "quiz.correct": "✔ Doğru!",
    "quiz.wrong": "✘ Doğru cevap: Mini Vaka {n} — {title}",
    "quiz.send": "Cevapları Gönder",
    "quiz.score": "Puanınız: {s} / {m}",
    "quiz.already": "İlk gönderiminiz geçerlidir.",
    "quiz.next": "Devam Et → Kapanış",

    "end.eyebrow": "KAPANIŞ",
    "end.quote": "Bu dokuz dosyada tek bir kötü niyetli insan yoktu. Sadece dokuz farklı an, aynı boşluğu gösteriyordu. Son Gece bize bunun tersinin de mümkün olduğunu gösterdi.",
    "end.question": "Yarın, sizin sahanızda birisi küçük bir sinyal gördüğünde, bu şirket onu duyacak mı?",
    "end.score": "TAKIM PUANINIZ (canlı güncellenir)",
    "end.gm": "Oyun Yöneticisi kazanan takımı açıklayacak. 🏆",

    "rec.eyebrow": "BİLGİLENDİRME",
    "rec.title": "Oturum yenilendi",
    "rec.p1": "Sunucu yeniden başlatılmış ya da oturum sıfırlanmış olabilir, takım kaydınız bulunamıyor.",
    "rec.p2a": "Oyun yöneticisi verileri geri yüklüyorsa bu ekranda birkaç saniye bekleyin",
    "rec.p2b": ", kendiliğinden kaldığınız yerden devam edeceksiniz. Beklemek istemezseniz aşağıdaki düğmeyi kullanın; bu durumda puanlarınız sıfırdan başlar, oyun yöneticisine bildirin.",
    "rec.failed": "Takım geri yüklenemedi, tekrar deneyin.",
    "rec.restoring": "Geri yükleniyor...",
    "rec.restore": "Beklemeden yeni kayıtla devam et",
    "rec.fresh": "Yeni takımla başla",

    "map.title": "🗺️ VAKA HARİTASI & DEDEKTİF İLERLEMESİ",
    "map.team": "Takım:",
    "map.unknown": "Bilinmiyor",
    "map.score": "Puan:",
    "map.case": "Vaka #{n}",
    "map.done": "✅ Tamamlandı",
    "map.current": "🔍 İnceleniyor",
    "map.locked": "🔒 Kilitli",
    "map.close": "Haritayı Kapat",
    "bc.badge": "📢 OYUN YÖNETİCİSİ DUYURUSU",
    "bc.ok": "Anlaşıldı, Devam Et",
    "timer.up": "00:00 — Süre Doldu",
    "ev.title": "🔍 DETAYLI KANIT İNCELEMESİ — {t}",
    "ev.fallback": "KANIT",
    "ev.close": "İncelemeyi Kapat",

    "case.1": "KAYAN AN",
    "case.2": "GÖLGEDEKİ ORTAK",
    "case.3": "KIRIK ZİNCİR",
    "case.4": "BU SEFERLİK",
    "case.5": "EŞİĞİN ALTINDA",
    "case.6": "BOŞ SANDALYE",
    "case.7": "YANLIŞ İSİM",
    "case.8": "GÖRÜNMEYEN DURUŞ",
    "case.9": "DUVARIN ÖTESİ"
  },
  en: {
    connecting: "Connecting to the server... The first start can take up to a minute, please don't close the page.",
    loading: "Loading...",
    netBanner: "Connection lost, reconnecting... Your answer is safe, please don't close the page.",
    map: "Map",
    mapTitle: "Case Map",
    soundTitle: "Sound On / Off",
    langTitle: "Dil / Language",
    next: "Continue →",
    retry: "Try Again",
    "net.issue": "Connection problem.",
    "net.fail": "Could not reach the server. Please check your connection.",
    "net.gateway": "The server is not responding right now, retrying.",
    "net.error": "Something went wrong.",

    "team.eyebrow": "PROJECT MIRROR",
    "team.title": "VC Detectives 2.0",
    "team.sub": "Enter your detective team's name and let's start the investigation.",
    "team.name": "Team Name",
    "team.namePh": "E.g. The Yellow Barrier Crew",
    "team.members": "Team Members (optional)",
    "team.membersPh": "E.g. Ayşe, Mehmet, Can",
    "team.needName": "Please enter a team name.",
    "team.failed": "Could not create the team.",
    "team.creating": "Creating...",
    "team.start": "Start the Investigation",

    "brief.eyebrow": "CASE BRIEFING",
    "brief.welcome": "Welcome, {name}",
    "brief.p1a": "Six months ago an unsigned note reached Internal Audit. 9 files. 3 chapters. One question:",
    "brief.p1b": " what did the person who wrote the note see?",
    "brief.p2": "The note was split into three pieces. At the end of each chapter you will earn a piece + a code. The three codes will unlock the Final File.",
    "brief.noteTitle": "UNSIGNED NOTE",
    "brief.noteBody": "CONTENT: [ ACCESS RESTRICTED ]",

    "chapter": "CHAPTER {n}",
    "beat.event": "THE INCIDENT",
    "beat.evidence": "THE EVIDENCE",
    "beat.decision": "THE DECISION",
    "miniCase": "Mini Case {n} — {title}",
    "event.next": "Continue → The Evidence",
    "evidence.hint": "Tap the cards to inspect or enlarge the evidence ↓",
    "evidence.next": "Continue → The Decision",
    "inspect": "🔍 Inspect / Enlarge",

    "dec.placeholder": "Write your team's answer here...",
    "dec.depth": "Depth of Analysis:",
    "dec.q0": "Nothing written yet",
    "dec.q1": "Short Answer",
    "dec.q2": "Enough Detail",
    "dec.q3": "Thorough Analysis ✨",
    "dec.chars": "{n} characters",
    "dec.needText": "Please write an answer.",
    "dec.sendFail": "Could not send the answer.",
    "dec.send": "Submit Answer",
    "dec.sending": "Sending...",
    "dec.ref": "Reference Solution:",
    "dec.insight": "Insight Carried to the Final:",
    "dec.gmScores": "The Game Master will score your answer separately.",
    "dec.already": "Your answer for this case was already saved; your first answer counts.",

    "clue.eyebrow": "KEY EVIDENCE {h}",
    "clue.unlocking": "Unlocking...",
    "clue.hint": "Keep this code — you will need it to unlock the Final File.",

    "lock.eyebrow": "FINAL FILE",
    "lock.title": "The Pattern in the Mirror",
    "lock.hint": "Combine the three Key Evidence codes and enter them.",
    "lock.open": "Unlock",
    "lock.checking": "Checking...",
    "lock.wrong": "Wrong code, try again.",

    "pa.tag": "FINAL — PART A",
    "pa.title": "Pattern Map",
    "pa.question": "What is the one-sentence diagnosis to present to Internal Audit?",
    "pa.placeholder": "The real problem of this company is...",
    "pa.send": "Submit Diagnosis",
    "pa.sendFail": "Could not send, please try again.",
    "pa.already": "This diagnosis was already saved; your first answer counts.",
    "pa.ref": "Reference:",
    "pa.next": "Continue → The Final Night",

    "night.title": "THE FINAL NIGHT",
    "night.note": "This is not a mystery, it is an example.",
    "nightEv.title": "The Final Night",
    "nightEv.next": "Continue → The Test of Three Paths",

    "quiz.tag": "THE TEST OF THREE PATHS",
    "quiz.intro": "For each piece of evidence tonight, pick the mini case that shows the exact opposite.",
    "quiz.select": "Select a mini case...",
    "quiz.correct": "✔ Correct!",
    "quiz.wrong": "✘ Correct answer: Mini Case {n} — {title}",
    "quiz.send": "Submit Answers",
    "quiz.score": "Your score: {s} / {m}",
    "quiz.already": "Your first submission counts.",
    "quiz.next": "Continue → Closing",

    "end.eyebrow": "CLOSING",
    "end.quote": "In these nine files there was not a single ill-intentioned person. Just nine different moments, pointing at the same gap. The Final Night showed us that the opposite is possible too.",
    "end.question": "Tomorrow, when someone in your area sees a small signal, will this company hear it?",
    "end.score": "YOUR TEAM SCORE (updates live)",
    "end.gm": "The Game Master will announce the winning team. 🏆",

    "rec.eyebrow": "NOTICE",
    "rec.title": "Session renewed",
    "rec.p1": "The server may have restarted or the session may have been reset, your team record cannot be found.",
    "rec.p2a": "If the Game Master is restoring the data, wait a few seconds on this screen",
    "rec.p2b": " and you will automatically continue where you left off. If you don't want to wait, use the button below; in that case your score starts from zero, so let the Game Master know.",
    "rec.failed": "Could not restore the team, please try again.",
    "rec.restoring": "Restoring...",
    "rec.restore": "Continue with a new record without waiting",
    "rec.fresh": "Start with a new team",

    "map.title": "🗺️ CASE MAP & DETECTIVE PROGRESS",
    "map.team": "Team:",
    "map.unknown": "Unknown",
    "map.score": "Score:",
    "map.case": "Case #{n}",
    "map.done": "✅ Completed",
    "map.current": "🔍 Investigating",
    "map.locked": "🔒 Locked",
    "map.close": "Close Map",
    "bc.badge": "📢 GAME MASTER ANNOUNCEMENT",
    "bc.ok": "Got it, Continue",
    "timer.up": "00:00 — Time's Up",
    "ev.title": "🔍 DETAILED EVIDENCE REVIEW — {t}",
    "ev.fallback": "EVIDENCE",
    "ev.close": "Close Review",

    "case.1": "THE SLIPPERY MOMENT",
    "case.2": "THE PARTNER IN THE SHADOWS",
    "case.3": "THE BROKEN CHAIN",
    "case.4": "JUST THIS ONCE",
    "case.5": "BELOW THE THRESHOLD",
    "case.6": "THE EMPTY CHAIR",
    "case.7": "THE WRONG NAME",
    "case.8": "THE INVISIBLE STOP",
    "case.9": "BEYOND THE WALL"
  }
};

/** React dışında (ör. api.js) kullanılabilen çeviri fonksiyonu */
export function translate(lang, key, vars) {
  let s = (STRINGS[lang] && STRINGS[lang][key]) ?? STRINGS.tr[key] ?? key;
  if (vars) {
    Object.keys(vars).forEach((k) => {
      s = s.split("{" + k + "}").join(String(vars[k]));
    });
  }
  return s;
}

/** Bileşenlerde: const { t, lang, setLang } = useLang(); */
export function useLang() {
  const [lang, setL] = useState(current);
  useEffect(() => {
    const fn = (c) => setL(c);
    listeners.add(fn);
    setL(current); // kayıt sırasında değişmiş olabilir
    return () => listeners.delete(fn);
  }, []);
  const t = (key, vars) => translate(lang, key, vars);
  return { lang, setLang, t };
}
