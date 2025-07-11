async function loadChants() {
  const response = await fetch('chants.json');
  const chants = await response.json();
  return chants;
}

function debounce(func, delay) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
}

async function searchByPurpose() {
  const query = document.getElementById("purposeSearch").value.trim().toLowerCase();
  const resultsEl = document.getElementById("chantResults");
  resultsEl.innerHTML = "";

  if (!query) return;

  const chants = await loadChants();
  const results = chants.filter(chant =>
    chant.purpose.some(purpose => purpose.toLowerCase().includes(query))
  );

  if (results.length === 0) {
    resultsEl.innerHTML = "<li>ไม่พบบทสวดที่ตรงกับจุดประสงค์</li>";
    return;
  }

  results.forEach(chant => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${chant.title}</strong><br><small>วัตถุประสงค์: ${chant.purpose.join(", ")}</small>`;
    li.onclick = () => showChantContent(chant);
    resultsEl.appendChild(li);
  });
}

function showChantContent(chant) {
  const chantContainer = document.getElementById("chantContainer");
  chantContainer.innerHTML = `
    <h3>${chant.title}</h3>
    <p>${chant.content.th}</p>
    <hr>
    <p><em>${chant.content.en}</em></p>
  `;
}

document.getElementById("purposeSearch")
  .addEventListener("input", debounce(searchByPurpose, 300));

async function getChantSuggestion() {
  const input = document.getElementById("feelingInput").value.trim();
  const outputEl = document.getElementById("aiSuggestion");
  outputEl.innerHTML = "⏳ กำลังวิเคราะห์...";

  if (!input) {
    outputEl.innerHTML = "กรุณาพิมพ์ความรู้สึกของคุณก่อน";
    return;
  }

  const apiKey = "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";

  const prompt = `คุณคือผู้ช่วยแนะนำบทสวดมนต์ในแบบไทยพุทธ ให้คำแนะนำบทสวดที่เหมาะกับความรู้สึกของผู้ใช้ พร้อมอธิบายสั้นๆ ว่าทำไมจึงเหมาะสม:\n\nผู้ใช้: ${input}\nตอบในรูปแบบ:\n- แนะนำบท: [ชื่อบทสวด]\n- เหตุผล: [สั้นๆ 1-2 ประโยค]`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "เกิดข้อผิดพลาด";

    outputEl.innerHTML = `<pre style="white-space: pre-wrap;">${reply}</pre>`;
  } catch (err) {
    outputEl.innerHTML = "⚠️ เกิดข้อผิดพลาดในการเชื่อมต่อ GPT";
    console.error(err);
  }
}
