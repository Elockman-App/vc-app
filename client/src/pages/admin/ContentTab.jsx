import React, { useCallback, useEffect, useState } from "react";
import { api } from "../../api";

/**
 * "Vaka İçeriği" sekmesi: 9 mini vakanın metinlerini (Türkçe ve İngilizce) panelden düzenler.
 * Değişiklik anında oyunculara yansır. "Özgün metne dön" kodla gelen metni geri getirir.
 */

function toForm(cur) {
  return {
    baslik: cur.baslik,
    ozet: cur.olayAni.ozet,
    kon1: (cur.olayAni.konusanlar || [])[0] || "",
    kon2: (cur.olayAni.konusanlar || [])[1] || "",
    balon1: cur.olayAni.balonlar[0] || "",
    balon2: cur.olayAni.balonlar[1] || "",
    kararSorusu: cur.kararSorusu,
    dogruCozum: cur.dogruCozum,
    finalIcgorusu: cur.finalIcgorusu,
    kanitlar: cur.kanitAni.map((k) => ({
      type: k.type,
      baslik: k.baslik || "",
      from: k.from || "",
      time: k.time || "",
      who: k.who || "",
      text: k.text || "",
      rowsText: (k.rows || []).map((r) => `${r[0]} | ${r[1]}`).join("\n")
    }))
  };
}

function fromForm(f) {
  return {
    baslik: f.baslik,
    olayAni: { ozet: f.ozet, konusanlar: [f.kon1, f.kon2], balonlar: [f.balon1, f.balon2] },
    kararSorusu: f.kararSorusu,
    dogruCozum: f.dogruCozum,
    finalIcgorusu: f.finalIcgorusu,
    kanitAni: f.kanitlar.map((k) => {
      if (k.type === "data") {
        return {
          type: "data",
          baslik: k.baslik,
          rows: k.rowsText
            .split("\n")
            .map((l) => l.trim())
            .filter(Boolean)
            .map((l) => {
              const i = l.indexOf("|");
              return i === -1 ? [l, ""] : [l.slice(0, i).trim(), l.slice(i + 1).trim()];
            })
        };
      }
      if (k.type === "quote") return { type: "quote", baslik: k.baslik, who: k.who, text: k.text };
      return { type: k.type, baslik: k.baslik, from: k.from, time: k.time, text: k.text };
    })
  };
}

const box = { width: "100%", boxSizing: "border-box", padding: "0.45rem", fontSize: "0.9rem", borderRadius: 6, border: "1px solid #c9d1e3", fontFamily: "inherit" };
const lbl = { display: "block", fontSize: "0.78rem", color: "#5a6b96", margin: "8px 0 3px", fontWeight: 700 };

function Field({ label, value, onChange, multiline, rows = 2 }) {
  return (
    <>
      <label style={lbl}>{label}</label>
      {multiline ? (
        <textarea style={{ ...box, minHeight: rows * 24 }} value={value} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input style={box} value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </>
  );
}

export default function ContentTab({ onChanged }) {
  const [data, setData] = useState(null);
  const [sira, setSira] = useState(1);
  const [lang, setLang] = useState("tr");
  const [form, setForm] = useState(null);
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setData(await api.getContent());
    } catch (e) {
      setMsg({ ok: false, text: e.message || "Yüklenemedi." });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const view = data?.cases?.find((c) => c.sira === sira)?.[lang];

  // Vaka ya da dil değişince (ya da kayıt/geri alma sonrası) formu güncel metinle doldur
  useEffect(() => {
    if (view) setForm(toForm(view.current));
  }, [sira, lang, data]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setMsg(null);
  }, [sira, lang]);

  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }
  function setKanit(i, k, v) {
    setForm((f) => ({ ...f, kanitlar: f.kanitlar.map((x, j) => (j === i ? { ...x, [k]: v } : x)) }));
  }

  async function save() {
    setBusy(true);
    setMsg(null);
    try {
      await api.saveContent(sira, lang, fromForm(form));
      await load();
      setMsg({ ok: true, text: "Kaydedildi. Oyunculara hemen yansıdı." });
      if (onChanged) onChanged();
    } catch (e) {
      setMsg({ ok: false, text: e.message || "Kaydedilemedi." });
    } finally {
      setBusy(false);
    }
  }

  async function reset() {
    if (!window.confirm("Bu vakanın bu dildeki metni kodla gelen özgün haline döndürülsün mü? Yaptığınız düzenleme silinir.")) return;
    setBusy(true);
    try {
      await api.resetContent(sira, lang);
      await load();
      setMsg({ ok: true, text: "Özgün metne dönüldü." });
      if (onChanged) onChanged();
    } catch (e) {
      setMsg({ ok: false, text: e.message || "İşlem başarısız." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-card">
      <p className="muted" style={{ fontSize: "0.85rem", marginTop: 0 }}>
        Vaka metinlerini buradan düzenleyebilirsiniz; kaydedince oyunculara hemen yansır. Sunucu yeniden başlarsa düzenlemeler,
        panelin tarayıcıda tuttuğu yedekten geri yüklenir (üstteki uyarıyı kullanın). Görsel dosyaları ve Son Gece / Final
        metinleri buradan değiştirilemez.
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
        {(data?.cases || []).map((c) => (
          <button
            key={c.sira}
            className={"chip" + (c.sira === sira ? " on" : "")}
            style={{ cursor: "pointer", border: "1px solid #c9d1e3" }}
            onClick={() => setSira(c.sira)}
          >
            {c.sira}. {c.tr.current.baslik}
            {(c.tr.edited || c.en.edited) && " ✎"}
          </button>
        ))}
      </div>
      <div style={{ marginBottom: 8 }}>
        {["tr", "en"].map((l) => (
          <button
            key={l}
            className={"chip" + (lang === l ? " on" : "")}
            style={{ cursor: "pointer", border: "1px solid #c9d1e3", marginRight: 6 }}
            onClick={() => setLang(l)}
          >
            {l === "tr" ? "Türkçe" : "English"}
            {data?.cases?.find((c) => c.sira === sira)?.[l]?.edited ? " ✎" : ""}
          </button>
        ))}
      </div>

      {!form && <p className="muted">Yükleniyor...</p>}
      {form && (
        <>
          {view?.edited && (
            <div style={{ background: "#fff8e1", border: "1px solid #f0d98a", borderRadius: 6, padding: "0.4rem 0.7rem", fontSize: "0.82rem" }}>
              ✎ Bu metin düzenlenmiş. Özgün hali için “Özgün metne dön”.
            </div>
          )}
          <Field label="Vaka başlığı" value={form.baslik} onChange={(v) => set("baslik", v)} />
          <Field label="Olay özeti" value={form.ozet} onChange={(v) => set("ozet", v)} multiline rows={3} />
          <Field label="Konuşan 1 (rol)" value={form.kon1} onChange={(v) => set("kon1", v)} />
          <Field label="Konuşma balonu 1" value={form.balon1} onChange={(v) => set("balon1", v)} />
          <Field label="Konuşan 2 (rol)" value={form.kon2} onChange={(v) => set("kon2", v)} />
          <Field label="Konuşma balonu 2" value={form.balon2} onChange={(v) => set("balon2", v)} />

          {form.kanitlar.map((k, i) => (
            <div key={i} style={{ border: "1px solid #dfe4f0", borderRadius: 8, padding: "0.5rem 0.8rem", marginTop: 12, background: "#f8f9fd" }}>
              <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "#101b3d" }}>
                Kanıt {i + 1} <span className="muted">({{ whatsapp: "WhatsApp", teams: "Teams", data: "Veri tablosu", quote: "Tanık ifadesi" }[k.type]})</span>
              </div>
              <Field label="Başlık" value={k.baslik} onChange={(v) => setKanit(i, "baslik", v)} />
              {(k.type === "whatsapp" || k.type === "teams") && (
                <>
                  <Field label="Gönderen" value={k.from} onChange={(v) => setKanit(i, "from", v)} />
                  <Field label="Saat / zaman" value={k.time} onChange={(v) => setKanit(i, "time", v)} />
                  <Field label="Mesaj" value={k.text} onChange={(v) => setKanit(i, "text", v)} multiline />
                </>
              )}
              {k.type === "quote" && (
                <>
                  <Field label="Kim söylüyor" value={k.who} onChange={(v) => setKanit(i, "who", v)} />
                  <Field label="İfade" value={k.text} onChange={(v) => setKanit(i, "text", v)} multiline />
                </>
              )}
              {k.type === "data" && (
                <Field
                  label="Satırlar (her satır: etiket | değer)"
                  value={k.rowsText}
                  onChange={(v) => setKanit(i, "rowsText", v)}
                  multiline
                  rows={3}
                />
              )}
            </div>
          ))}

          <Field label="Karar sorusu" value={form.kararSorusu} onChange={(v) => set("kararSorusu", v)} multiline />
          <Field label="Referans çözüm (takım cevapladıktan sonra gösterilir)" value={form.dogruCozum} onChange={(v) => set("dogruCozum", v)} multiline rows={3} />
          <Field label="Final'e taşınan içgörü" value={form.finalIcgorusu} onChange={(v) => set("finalIcgorusu", v)} />

          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
            <button className="btn" style={{ width: "auto", margin: 0 }} disabled={busy} onClick={save}>
              {busy ? "Kaydediliyor..." : "Kaydet"}
            </button>
            {view?.edited && (
              <button
                className="btn secondary"
                style={{ width: "auto", margin: 0, color: "#101b3d", borderColor: "#101b3d" }}
                disabled={busy}
                onClick={reset}
              >
                Özgün metne dön
              </button>
            )}
          </div>
          {msg && <p style={{ fontWeight: 700, color: msg.ok ? "#2e7d32" : "#c62828" }}>{msg.text}</p>}
        </>
      )}
    </div>
  );
}
