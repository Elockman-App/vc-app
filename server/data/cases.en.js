/**
 * VC DEDEKTİFLERİ 2.0 — İNGİLİZCE VAKA METİNLERİ
 *
 * Türkçe veri (cases.js) ile aynı yapıdadır. Sadece oyuncuya gösterilen METİNLER
 * çevrilir; sıra numaraları, bölüm numaraları, kodlar ve görsel adları Türkçe
 * verideki gibi kalır (puanlama ve kilit kodu dile bağlı değildir).
 *
 * Çeviriyi düzeltmek için bu dosyadaki İngilizce metinleri düzenlemeniz yeterlidir.
 */

const BOLUM_EN = [
  {
    baslik: "OUR WAY OF BEING",
    degerler: ["Occupational Health and Safety", "Ethics and Diversity", "Open Communication"],
    facilitatorAcilis: "The first case box is in front of you. All three are small incidents. Why did Internal Audit put them together?",
    notParcasi: "Nobody in this company is lying."
  },
  {
    baslik: "OUR WAY OF DOING BUSINESS",
    degerler: ["Customer Focus", "Trust and Simplicity", "Acting with a Sense of Responsibility"],
    facilitatorAcilis: "The second box comes from a different family: here, nobody is hiding anything. So where is the problem?",
    notParcasi: "Everyone warns once, then goes quiet."
  },
  {
    baslik: "OUR WAY OF DEVELOPING",
    degerler: ["Learning and Development", "Lasting Solutions", "Sustainable Legacy"],
    facilitatorAcilis: "The last box holds the oldest files. The question is no longer 'what happened', but 'why did it take so long'.",
    notParcasi: "And the truth arrives one step behind, every time."
  }
];

const VAKA_EN = [
  {
    baslik: "THE SLIPPERY MOMENT",
    olayAni: {
      ozet: "Hasanoğlan Ready-Mix Plant, raw material yard. An operator notices a small hydraulic leak and warns a colleague verbally, but never enters it into the official system.",
      balonlar: ["The floor is shiny here, be careful.", "Well, it always leaks a little anyway."]
    },
    kanitAni: [
      { type: "whatsapp", baslik: "On-Site Messaging", from: "Operator", time: "11:15", text: "There's a leak over there, watch out, it's slippery." },
      { type: "data", baslik: "Hazard Reporting System", rows: [["Reports Logged Today", "0"]] },
      { type: "quote", baslik: "Witness Statement", who: "Visiting Contractor Engineer", text: "I almost fell. There wasn't even a warning sign." }
    ],
    kararSorusu: "This near-miss was preventable. At exactly what moment, and by doing what, would it have been prevented?",
    dogruCozum: "The signal was truly seen and shared — but it never entered the official system because it was judged \"small\". Every hazard, regardless of size, should have been entered into the official system within seconds.",
    finalIcgorusu: "The signal that looked small never entered the official system."
  },
  {
    baslik: "THE PARTNER IN THE SHADOWS",
    olayAni: {
      ozet: "Ankara Plant (Head Office), at night. The Maintenance Manager buys parts from a newly founded supplier owned by a relative; the relationship is never declared.",
      balonlar: ["A phone rings in the middle of the night.", "Don't worry, someone I know is taking care of it."]
    },
    kanitAni: [
      { type: "whatsapp", baslik: "Personal Line", from: "Supplier Owner", time: "22:10", text: "Bro, we found the crusher motor... I'll come by for my sister's breakfast too 😄" },
      { type: "data", baslik: "SAP Supplier Record", rows: [["Related Party Declaration", "NO"], ["Registration Date", "Same day as the first order"]] },
      { type: "quote", baslik: "Witness Statement", who: "Maintenance Manager", text: "Nobody asked, and I didn't bring it up." }
    ],
    kararSorusu: "Which single step in this process would have made everything transparent from the start?",
    dogruCozum: "The relationship should have been declared up front on the supplier registration form. A \"good result\" does not legitimize an undeclared conflict of interest.",
    finalIcgorusu: "The right result can make the wrong method invisible."
  },
  {
    baslik: "THE BROKEN CHAIN",
    olayAni: {
      ozet: "Sivas Plant, night shift. A conveyor's guard cover stays missing for 4 days; the information is passed on verbally and never reaches the inexperienced operator.",
      balonlar: ["Where did that guard cover go?", "Forget it, it's been like this for a few days."]
    },
    kanitAni: [
      { type: "whatsapp", baslik: "Shift Group", from: "Night Operator", time: "07:08", text: "Cover's missing, saw it, what happened? → \"It was repaired, we're used to this kind of thing.\"" },
      { type: "data", baslik: "Shift Handover Form (4 Days)", rows: [["Open Risks Section", "[ EMPTY ]"]] },
      { type: "quote", baslik: "Witness Statement", who: "New Operator", text: "Nobody told me. I thought, 'maybe it's normal, and asking would look silly'." }
    ],
    kararSorusu: "Exactly which link in the information chain broke?",
    dogruCozum: "Verbal handover lost its reliability after 3-4 people. The \"Open Risks\" section should have been filled in.",
    finalIcgorusu: "Something everyone knows can officially be 'unknown'."
  },

  {
    baslik: "JUST THIS ONCE",
    olayAni: {
      ozet: "Kayaş Ready-Mix Plant, at night. When a major customer threatens to cancel the contract, the site supervisor sends a driver on an extra delivery and changes the exit record.",
      balonlar: ["My shift is over but the phone won't stop ringing.", "Let's find a solution, just this once."]
    },
    kanitAni: [
      { type: "whatsapp", baslik: "Dispatch Team", from: "Site Supervisor", time: "20:52", text: "Just this once, bear with it, I'll take care of the timesheet." },
      { type: "data", baslik: "SAP Time & Attendance Log", rows: [["Actual Exit", "23:52"], ["Recorded in System", "19:00 (manually changed, 23:58)"]] },
      { type: "data", baslik: "KPI — Shift Overrun Frequency", rows: [["Last 3 Weeks Trend", "Steadily Rising"]] }
    ],
    kararSorusu: "Which of the decisions made could have been reversed, and which could not?",
    dogruCozum: "The extra delivery was a debatable commercial decision; changing the record was an irreversible breach of integrity.",
    finalIcgorusu: "Once 'just this once' was said, it became a habit."
  },
  {
    baslik: "BELOW THE THRESHOLD",
    olayAni: {
      ozet: "Ankara Plant (Head Office). A single signature is made sufficient for purchases under 50,000 TL; an engineer has the same pump repaired 9 times in 9 months, always below the threshold.",
      balonlar: ["Was the same failure logged again?", "No need to blow it up, we'll sort it out right away."]
    },
    kanitAni: [
      { type: "whatsapp", baslik: "Maintenance Planning", from: "Planning Engineer", time: "—", text: "I don't want to deal with a big investment process, let's just get by for now." },
      { type: "data", baslik: "SAP Purchasing History", rows: [["9 Orders", "All in the 42-48K TL Range"], ["Approval Type", "All Single Signature"]] },
      { type: "teams", baslik: "Process Improvement (Archive)", from: "Financial Planning and Control Officer", time: "—", text: "Should we add a repeated-spend alert? → \"Noted, later.\" (never implemented)" }
    ],
    kararSorusu: "Which single change in the system would have caught this pattern much earlier?",
    dogruCozum: "No rule was broken — but if there had been an alert tracking the number of repeats, a permanent-solution discussion would have opened at the 2nd or 3rd repeat.",
    finalIcgorusu: "The rule wasn't broken, but its purpose had long since been defeated."
  },
  {
    baslik: "THE EMPTY CHAIR",
    olayAni: {
      ozet: "Yozgat Plant. The Quality Development Supervisor notices a trend but does not open a formal report; the topic is postponed on the meeting agenda and never comes back.",
      balonlar: ["These numbers keep going in the same direction.", "It's not on the agenda for now, we'll look later."]
    },
    kanitAni: [
      { type: "whatsapp", baslik: "Quality–Production Coordination", from: "Process Engineer", time: "—", text: "It's hard to get approval without a formal request... Shall we raise it at the meeting?" },
      { type: "data", baslik: "Meeting Note", rows: [["Decision", "Not discussed due to lack of time, postponed."]] },
      { type: "data", baslik: "SAP Quality Trend", rows: [["9-Week Trend", "Uninterrupted Rise"], ["Automatic Alert", "None"]] }
    ],
    kararSorusu: "Which of the five characters could have escalated the issue, even without clear authority?",
    dogruCozum: "Everyone stayed within the limits of their own job description; real ownership means following a risk through to the end regardless of formal authority.",
    finalIcgorusu: "An 'observation' was voiced once but never turned into a 'request'."
  },

  {
    baslik: "THE WRONG NAME",
    olayAni: {
      ozet: "Nevşehir Plant. A pilot project is declared a success in week 2 and announced early; when problems begin, the person in charge blames an operator without evidence.",
      balonlar: ["Everyone is celebrating but I'm uneasy.", "Now is not the time to talk about this."]
    },
    kanitAni: [
      { type: "teams", baslik: "Early Announcement", from: "Organizational Development Manager", time: "Week 2", text: "The first 2 weeks are great! I'll share it with regional management tomorrow 🎉" },
      { type: "whatsapp", baslik: "Project Team", from: "Project Engineer", time: "Week 5", text: "Saying there's a problem would look very bad... This is the most likely explanation, it's hard to explain otherwise." },
      { type: "data", baslik: "SAP Compliance Comparison", rows: [["Blamed Operator's Compliance", "Higher Than the Non-Blamed Shift Too"]] }
    ],
    kararSorusu: "Which moment could have changed everything with an honest 'this isn't going well' sentence?",
    dogruCozum: "The early, public success announcement created pressure of no return. Blame without evidence is unacceptable under any circumstances.",
    finalIcgorusu: "Hiding the mistake blew up costlier than the mistake."
  },
  {
    baslik: "THE INVISIBLE STOP",
    olayAni: {
      ozet: "Samsun Plant. 'Micro-stops' under 15 minutes, 15-20 times a week, are never counted as official breakdowns; the KPI always looks green.",
      balonlar: ["The line stopped for a few minutes again.", "It's nothing, it starts right back up anyway."]
    },
    kanitAni: [
      { type: "whatsapp", baslik: "Maintenance Tracking", from: "Machine Maintenance Foreman", time: "—", text: "I said it for months, it felt like talking to a wall." },
      { type: "data", baslik: "Maintenance Log vs Dispatch Log", rows: [["The Same 4 Dates", "Both Micro-Stops and Delays at Their Peak"]] },
      { type: "data", baslik: "KPI Dashboard", rows: [["OEE", "89% (Green)"], ["Dealer On-Time Delivery (Separate Dashboard)", "78% (Red)"]] }
    ],
    kararSorusu: "Which two reports, if placed side by side, would have solved the problem months ago?",
    dogruCozum: "The problem was not in a person but in the measurement definition — repeats below the threshold were never tracked.",
    finalIcgorusu: "Two correct reports meant nothing because they were never placed side by side."
  },
  {
    baslik: "BEYOND THE WALL",
    olayAni: {
      ozet: "Ankara Plant (Head Office). The plant exceeds no legal limit, yet there have been dust complaints for 2 years; the fix is postponed 3 times on the grounds of 'no legal obligation'.",
      balonlar: ["Another complaint came from the other side of the wall.", "We're doing what we can anyway."]
    },
    kanitAni: [
      { type: "teams", baslik: "Investment Proposals (Archive)", from: "Environmental Engineer", time: "For 2 Years", text: "The proposal was postponed 2 years in a row on the grounds of 'no legal obligation'." },
      { type: "data", baslik: "Complaint Record", rows: [["3-Year Trend", "7 → 11 → 14+1 Formal Petitions"]] },
      { type: "data", baslik: "Measurement Note", rows: [["3 Years of Measurement Days", "Always Taken on Windless Days"]] }
    ],
    kararSorusu: "The company broke no law. Does that justify a two-year delay?",
    dogruCozum: "Legal compliance should be the floor of responsibility, not its ceiling. After two years of delay it ended up costing more than the investment itself would have.",
    finalIcgorusu: "The pattern had been there for 2 years — nobody saw it as a single line."
  }
];

const FINAL_EN = {
  notTam: [
    "Nobody in this company is lying.",
    "Everyone warns once, then goes quiet.",
    "And the truth arrives one step behind, every time."
  ],
  parcaA: {
    gorev: "What is the one-sentence diagnosis to present to Internal Audit?",
    dogruCozumReferansi: "People in this company see risks and speak up — but the organization has no safe, systematic mechanism that automatically escalates a warning."
  },
  koprucumlesi: "Now we'll see: was this lesson really learned?",
  sonGece: {
    lokasyon: "Ankara Plant (Head Office)",
    zamanCizelgesi: [
      { saat: "21:40", olay: "Hot spot detected on the kiln shell" },
      { saat: "22:04", olay: "Decision made for accelerated controlled cooling" },
      { saat: "23:45", olay: "Process completed safely" }
    ],
    kanitAni: [
      { type: "whatsapp", baslik: "URGENT – Kiln Status", from: "Production Shift Engineer", time: "21:42", text: "I detected a hot spot, zone 4. 80 min to the stop. Need an urgent talk." },
      { type: "whatsapp", baslik: "URGENT – Kiln Status", from: "Occupational Health and Safety Chief", time: "22:04", text: "Proposal: accelerated controlled cooling, not a full emergency stop. We can start within 15 min." },
      { type: "data", baslik: "Thermal Scan (22:03)", rows: [["Shell Surface Temperature", "412°C (Critical Threshold: 450°C)"], ["Temperature Rise Rate", "+18°C / 30 min"]] }
    ],
    ucYolSinavi: [
      {
        yolculuk: "Our Way of Being",
        kanit: "As soon as the hot spot was detected, 3 people were given clear information AT THE SAME TIME",
        dogruMiniVakaBaslik: "THE BROKEN CHAIN"
      },
      {
        yolculuk: "Our Way of Doing Business",
        kanit: "The decision was openly owned by three people",
        dogruMiniVakaBaslik: "THE EMPTY CHAIR"
      },
      {
        yolculuk: "Our Way of Developing",
        kanit: "Trend data was examined, a lasting solution was planned",
        dogruMiniVakaBaslik: "THE INVISIBLE STOP"
      }
    ],
    gercekcilikCapasi: "This scenario is fiction, but the decision process is real crisis-management practice."
  },
  kapanisMesaji: "In these nine files there was not a single ill-intentioned person. Just nine different moments, pointing at the same gap: a signal was seen, said once, then buried in silence. The Final Night showed us that the opposite is possible too — because that night the three journeys of the VC Way worked not separately, but together.",
  kapanisSorusu: "Tomorrow, when someone in your area sees a small signal, will this company hear it?"
};

/** Türkçe verinin üzerine İngilizce metinleri bindirir. */
module.exports = function buildEn(BOLUMLER, MINI_VAKALAR, FINAL) {
  const bolumler = BOLUMLER.map((b, i) => ({
    ...b,
    baslik: BOLUM_EN[i].baslik,
    degerler: BOLUM_EN[i].degerler,
    facilitatorAcilis: BOLUM_EN[i].facilitatorAcilis,
    anaKanit: { ...b.anaKanit, notParcasi: BOLUM_EN[i].notParcasi }
  }));
  const vakalar = MINI_VAKALAR.map((mv, i) => ({ ...mv, ...VAKA_EN[i] }));
  const final = {
    ...FINAL,
    ...FINAL_EN,
    sonGece: {
      ...FINAL.sonGece,
      ...FINAL_EN.sonGece,
      ucYolSinavi: FINAL.sonGece.ucYolSinavi.map((r, i) => ({ ...r, ...FINAL_EN.sonGece.ucYolSinavi[i] }))
    }
  };
  return { BOLUMLER: bolumler, MINI_VAKALAR: vakalar, FINAL: final };
};
