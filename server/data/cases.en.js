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
    facilitatorAcilis: "The first case box is in front of you. All three are small incidents. Why might Internal Audit have put these three together?",
    notParcasi: "Nobody in this company is lying."
  },
  {
    baslik: "OUR WAY OF DOING BUSINESS",
    degerler: ["Customer Focus", "Trust and Simplicity", "Acting with a Sense of Responsibility"],
    facilitatorAcilis: "The second box is different: here nobody is hiding anything, everything is out in the open. So where is the problem?",
    notParcasi: "Everyone warns once, then goes quiet."
  },
  {
    baslik: "OUR WAY OF DEVELOPING",
    degerler: ["Learning and Development", "Lasting Solutions", "Sustainable Legacy"],
    facilitatorAcilis: "The last box holds the oldest files. The question is no longer 'what happened', but 'why did this take so long?'",
    notParcasi: "And the truth arrives one step behind, every time."
  }
];

const VAKA_EN = [
  {
    baslik: "THE SLIPPERY MOMENT",
    olayAni: {
      ozet: "Hasanoğlan Ready-Mix Plant, raw material yard. An operator sees a small hydraulic oil leak on the floor. He tells the people nearby out loud, but never enters it into the company's official reporting system.",
      konusanlar: ["Operator", "Shift Supervisor"],
      balonlar: ["There's oil spilled over there, the floor is slippery. Should I file a report?", "Forget it, they'll wipe it up by the end of the day. Don't bother with the paperwork."]
    },
    kanitAni: [
      { type: "whatsapp", baslik: "Site Message Group", from: "Operator and Shift Supervisor", time: "11:15", text: "Operator: There's an oil leak over there, be careful, the floor is slippery.\nShift Supervisor: I saw it. Let's not open a report, it'll be wiped up at the end of the day.\nOperator: But what if someone slips and falls?" },
      { type: "data", baslik: "Hazard Reporting System", rows: [["Reports entered today", "0"]] },
      { type: "quote", baslik: "Witness Statement", who: "Visiting Contractor Engineer", text: "Internal Audit: Was there a warning sign there?\nVisiting Contractor Engineer: I almost fell. There wasn't even a warning sign." }
    ],
    kararSorusu: "This could have turned into an accident (this is called a \"near miss\"). At what moment, and by doing what, would the problem have been prevented from the start?",
    dogruCozum: "The operator saw the hazard and told the people around him; but because it looked \"small\", he did not enter it into the official system. No matter how small a hazard is, it should be recorded in the official system immediately. That way everyone would know and the leak would be fixed.",
    finalIcgorusu: "The hazard that looked small never entered the official system."
  },
  {
    baslik: "THE PARTNER IN THE SHADOWS",
    olayAni: {
      ozet: "Ankara Plant, at night. The Maintenance Manager buys spare parts from a company that was just founded by his nephew. He tells no one at the company about this family connection.",
      konusanlar: ["Purchasing Specialist", "Maintenance Manager"],
      balonlar: ["Sir, I haven't seen this company in the system before. Shall we fill in the registration form?", "No need, my nephew founded this company. I trust him."]
    },
    kanitAni: [
      { type: "whatsapp", baslik: "Personal Line", from: "The Manager and his nephew (supplier owner)", time: "22:10", text: "Maintenance Manager: Were you able to find a solution for the crusher motor, nephew?\nNephew (supplier): I found it, uncle, I'll bring it tomorrow morning. I'm also coming to the Saturday dinner, mom asked about you 😄\nMaintenance Manager: How nice, give your mom a kiss from me." },
      { type: "data", baslik: "SAP Supplier Record", rows: [["Family / ownership relationship declared", "NO"], ["Registration date", "Same day as the first order"]] },
      { type: "quote", baslik: "Witness Statement", who: "Maintenance Manager", text: "Internal Audit: Why didn't you tell anyone anything about the supplier company?\nMaintenance Manager: Nobody asked, and I didn't say anything." }
    ],
    kararSorusu: "Which single step in this process would have made everything transparent from the very start?",
    dogruCozum: "The family relationship should have been declared right at the start, on the supplier registration form. Even if the part was good and cheap, an undeclared conflict of interest is not acceptable.",
    finalIcgorusu: "When the result is good, the wrong method can go unnoticed."
  },
  {
    baslik: "THE BROKEN CHAIN",
    olayAni: {
      ozet: "Sivas Plant, night shift. The guard cover of a conveyor belt has been missing for 4 days. This information is only passed on by word of mouth from shift to shift, and never reaches the new operator.",
      konusanlar: ["New Operator", "Night Operator"],
      balonlar: ["Where is this conveyor's guard cover? Nobody told me anything.", "It's been gone for a while, we're used to it. Just be careful."]
    },
    kanitAni: [
      { type: "whatsapp", baslik: "Shift Group", from: "Shift Group (New Operator and Night Operator)", time: "07:08", text: "New Operator: The cover on that belt is missing, I saw it. What happened?\nNight Operator: It went for repair, we're used to this kind of thing.\nNew Operator: So nobody wrote it down?" },
      { type: "data", baslik: "Shift Handover Form (4 Days)", rows: [["\"Open Risks\" section", "[ EMPTY ]"]] },
      { type: "quote", baslik: "Witness Statement", who: "New Operator", text: "Internal Audit: Why didn't you ask about the missing cover?\nNew Operator: Nobody told me. I thought, \"maybe it's normal, and asking would look silly\"." }
    ],
    kararSorusu: "Exactly which link in the information chain broke?",
    dogruCozum: "The information got lost after passing verbally through 3-4 people. The \"Open Risks\" section of the shift handover form should have been filled in, so that everyone new would see the situation in writing.",
    finalIcgorusu: "Everyone thinking that everyone knows can actually mean that nobody knows."
  },

  {
    baslik: "JUST THIS ONCE",
    olayAni: {
      ozet: "Kayaş Ready-Mix Plant, at night. A major customer threatens to cancel the contract. The site supervisor sends a driver on an extra delivery and changes the driver's exit time in the records.",
      konusanlar: ["Driver", "Site Supervisor"],
      balonlar: ["My shift is over but the customer is still waiting. How will this delivery be recorded?", "You go, I'll fix the record. Let's get by just this once."]
    },
    kanitAni: [
      { type: "whatsapp", baslik: "Dispatch Team", from: "Site Supervisor and Driver", time: "20:52", text: "Site Supervisor: Just this once, bear with it, I'll fix the timesheet.\nDriver: My shift ended at 20:00, won't the record show that?\nSite Supervisor: Don't worry, I'll handle it." },
      { type: "data", baslik: "SAP Entry-Exit (Turnstile) Record", rows: [["Actual exit time", "23:52"], ["Recorded in the system", "19:00 (manually changed at 23:58)"]] },
      { type: "data", baslik: "Performance Indicator — Shift Overruns", rows: [["Trend over the last 3 weeks", "Steadily rising"]] }
    ],
    kararSorusu: "Of the decisions made in this event, which one could have been corrected later, and which one could not?",
    dogruCozum: "The extra delivery was a debatable business decision; it could have been reviewed afterwards. But changing the exit record was an irreversible breach of integrity.",
    finalIcgorusu: "Once \"just this once\" was said, it became a habit."
  },
  {
    baslik: "BELOW THE THRESHOLD",
    olayAni: {
      ozet: "Ankara Plant. For purchases under 50,000 TL, one signature is enough. An engineer has the same pump repaired 9 times in 9 months, and each time keeps the amount below this limit.",
      konusanlar: ["Purchasing Specialist", "Planning Engineer"],
      balonlar: ["A failure report was opened for this pump again. How many times is this now?", "The amount is always under 50 thousand, one signature is enough. No need to make it a big deal."]
    },
    kanitAni: [
      { type: "whatsapp", baslik: "Maintenance Planning", from: "Planning Engineer and Purchasing Specialist", time: "—", text: "Purchasing Specialist: Should we open a new investment request for this pump?\nPlanning Engineer: I don't want to go through the big investment process, let's just get by for now." },
      { type: "data", baslik: "SAP Purchasing History", rows: [["9 orders", "All between 42-48 thousand TL"], ["Approval type", "All with a single signature"]] },
      { type: "teams", baslik: "Process Improvement (Archive)", from: "Financial Planning and Control Officer", time: "—", text: "Should we add an alert for repeated spending? → \"Noted, we'll look at it later.\" (never done)" }
    ],
    kararSorusu: "Which single change in the system would have caught this repetition much earlier?",
    dogruCozum: "No rule was broken. But if there had been an alert tracking how many times the same failure repeated, at the 2nd or 3rd repeat someone would have said \"let's find a lasting solution\".",
    finalIcgorusu: "The rule wasn't broken, but the purpose of the rule had long been defeated."
  },
  {
    baslik: "THE EMPTY CHAIR",
    olayAni: {
      ozet: "Yozgat Plant. The Quality Development Supervisor notices quality figures getting worse over time, but does not open a formal report. When the topic is postponed in a meeting, it never comes up again.",
      konusanlar: ["Process Engineer", "Quality Development Supervisor"],
      balonlar: ["The quality figures have been getting worse for 9 weeks. Should we take it to the meeting?", "The agenda is full this week. Let's leave it for now and look at it later."]
    },
    kanitAni: [
      { type: "whatsapp", baslik: "Quality–Production Coordination", from: "Process Engineer and Quality Development Chief", time: "—", text: "Process Engineer: It's hard to get approval without a formal request... Shall we talk about it in the meeting?\nQuality Development Chief: The agenda is full this week, let's leave it for now." },
      { type: "data", baslik: "Meeting Note", rows: [["Decision", "Could not be discussed for lack of time, postponed."]] },
      { type: "data", baslik: "SAP Quality Trend", rows: [["Trend over the last 9 weeks", "Rose without stopping"], ["Automatic alert", "None"]] }
    ],
    kararSorusu: "Which of the people in this event could have taken the issue to senior management, even without a clear job description for it?",
    dogruCozum: "Everyone stayed within the limits of their own job description. Real ownership means following a risk through to the end, even without formal authority.",
    finalIcgorusu: "The problem that was noticed was said once but never turned into a formal request."
  },

  {
    baslik: "THE WRONG NAME",
    olayAni: {
      ozet: "Nevşehir Plant. A new trial project (pilot project) is declared \"successful\" in week 2 and announced to everyone. When problems begin, the person in charge blames an operator without any evidence.",
      konusanlar: ["Project Engineer", "Organizational Development Manager"],
      balonlar: ["Everyone is celebrating but the problems in the field aren't over, I'm uneasy.", "Now is not the time to talk about this. Let's not spoil the success."]
    },
    kanitAni: [
      { type: "teams", baslik: "Early Announcement", from: "Organizational Development Manager", time: "Week 2", text: "The first 2 weeks went great! I'll share it with regional management tomorrow too 🎉" },
      { type: "whatsapp", baslik: "Project Team", from: "Project Team (Project Engineer and Teammate)", time: "Week 5", text: "Teammate: What could be causing the problem on the site?\nProject Engineer: Saying there's a problem would look very bad... The most likely cause is this operator, it's hard to explain otherwise." },
      { type: "data", baslik: "SAP Compliance Comparison", rows: [["Blamed operator's compliance", "Even higher than the shift that was not blamed"]] }
    ],
    kararSorusu: "At which moment, if someone had honestly said \"this isn't going well\", would everything have changed?",
    dogruCozum: "Declaring the project a success early and publicly made it harder to go back. Blaming someone without evidence is unacceptable under any circumstances.",
    finalIcgorusu: "Hiding the mistake blew up costlier than the mistake itself."
  },
  {
    baslik: "THE INVISIBLE STOP",
    olayAni: {
      ozet: "Samsun Plant. 15-20 times a week, small stops (micro-stops) of less than 15 minutes each occur. Because they are not counted as official breakdowns, the performance indicators always look green.",
      konusanlar: ["Maintenance Foreman", "Production Supervisor"],
      balonlar: ["The line stopped a few times again this week. Should we log it?", "They're all under 15 minutes, that doesn't count as a breakdown. It starts right back up anyway."]
    },
    kanitAni: [
      { type: "whatsapp", baslik: "Maintenance Tracking", from: "Maintenance Tracking (Foreman and Production Supervisor)", time: "—", text: "Production Supervisor: The belt stopped again, what's going on?\nMaintenance Foreman: I said it for months, it felt like talking to a wall." },
      { type: "data", baslik: "Maintenance Record and Dispatch Record", rows: [["The same 4 dates", "Both small stops and delivery delays at their highest"]] },
      { type: "data", baslik: "Performance Dashboard", rows: [["Machine efficiency dashboard (OEE: how efficiently the machine runs)", "89% → Green (looks good)"], ["On-time delivery to dealers dashboard (separate report)", "78% → Red (bad)"], ["Result", "The two dashboards sit in separate reports, nobody put them side by side"]] }
    ],
    kararSorusu: "Which two reports, if placed side by side, would have revealed the problem months ago?",
    dogruCozum: "The problem was not in a person but in the way of measuring: stops shorter than 15 minutes were never counted. If the maintenance records and the delivery delays had been put side by side, the link would have been seen.",
    finalIcgorusu: "Two correct reports told us nothing because they were never put side by side."
  },
  {
    baslik: "BEYOND THE WALL",
    olayAni: {
      ozet: "Ankara Plant. The plant does not exceed any legal limit, but neighbors have been complaining about dust for 2 years. The dust-prevention investment is postponed 3 times on the grounds of \"no legal obligation\".",
      konusanlar: ["Environmental Engineer", "Plant Management"],
      balonlar: ["Another dust complaint came from the neighbors. Shall we finally make the dust-prevention investment?", "There's no legal obligation, we're doing what we can anyway. Not this year either."]
    },
    kanitAni: [
      { type: "teams", baslik: "Investment Proposals (Archive)", from: "Environmental Engineer", time: "For 2 years", text: "The dust-prevention investment was proposed but postponed 2 years in a row on the grounds of \"no legal obligation\"." },
      { type: "data", baslik: "Complaint Record", rows: [["Dust complaints from neighbors (by year)", "Year 1: 7 → Year 2: 11 → Year 3: 14"], ["Formal (written) petition", "1"], ["Result", "Complaints rise every year, the problem is not going away by itself"]] },
      { type: "data", baslik: "Measurement Note", rows: [["Measurement days over 3 years", "Always taken on windless days"]] }
    ],
    kararSorusu: "The company broke no law. Does that justify the 2-year delay?",
    dogruCozum: "Obeying the law is not enough, it is only the lowest bar. After waiting two years, it ended up costing more than making the investment in the first place.",
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
    gorev: "What is the one-sentence diagnosis you will present to Internal Audit? (What is this company's real problem?)",
    dogruCozumReferansi: "People in this company see risks and speak up — but there is no safe, regular way to make a warning grow and reach the right place."
  },
  koprucumlesi: "Now we'll see: was this lesson really learned?",
  sonGece: {
    lokasyon: "Ankara Plant (Head Office)",
    zamanCizelgesi: [
      { saat: "21:40", olay: "An extremely hot spot was found on the outer surface of the kiln" },
      { saat: "22:04", olay: "Decision made to cool the kiln quickly but under control" },
      { saat: "23:45", olay: "Process completed safely" }
    ],
    kanitAni: [
      { type: "whatsapp", baslik: "URGENT – Kiln Status", from: "Production Shift Engineer", time: "21:42", text: "I found a hot spot, zone 4. 80 min until the planned stop. We need an urgent talk." },
      { type: "whatsapp", baslik: "URGENT – Kiln Status", from: "Occupational Health and Safety Chief", time: "22:04", text: "My proposal: instead of a full stop, let's cool it quickly but under control. We can start within 15 min." },
      { type: "data", baslik: "Thermal Scan (22:03)", rows: [["Kiln surface temperature", "412°C (danger limit: 450°C)"], ["Temperature rise rate", "+18°C in 30 min"]] }
    ],
    ucYolSinavi: [
      {
        yolculuk: "Our Way of Being",
        kanit: "As soon as the hot spot was found, 3 people were given clear information AT THE SAME TIME",
        dogruMiniVakaBaslik: "THE BROKEN CHAIN"
      },
      {
        yolculuk: "Our Way of Doing Business",
        kanit: "Three people openly took ownership of the decision",
        dogruMiniVakaBaslik: "THE EMPTY CHAIR"
      },
      {
        yolculuk: "Our Way of Developing",
        kanit: "The temperature data was examined, a lasting solution was planned",
        dogruMiniVakaBaslik: "THE INVISIBLE STOP"
      }
    ],
    gercekcilikCapasi: "This scenario is fiction, but the decisions follow real crisis-management practice."
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
