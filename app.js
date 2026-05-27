const state = {
  questions: [],
  exam: [],
  answers: new Map(),
  optionOrders: new Map(),
  checked: new Set(),
  index: 0,
  mode: "intro",
  history: JSON.parse(localStorage.getItem("pedalean2ExamHistory") || "[]"),
  pendingUpdate: null
};

const PASS_GRADE = 6;
const GITHUB_REPO = "Alfonso-Sanchez/ASM-EXAMEN-PRACTICO";

const els = {
  topicFilter: document.querySelector("#topicFilter"),
  typeFilter: document.querySelector("#typeFilter"),
  difficultyFilter: document.querySelector("#difficultyFilter"),
  questionCount: document.querySelector("#questionCount"),
  totalQuestions: document.querySelector("#totalQuestions"),
  lastScore: document.querySelector("#lastScore"),
  avgScore: document.querySelector("#avgScore"),
  weakArea: document.querySelector("#weakArea"),
  passTarget: document.querySelector("#passTarget"),
  topicCards: document.querySelector("#topicCards"),
  intro: document.querySelector("#intro"),
  exam: document.querySelector("#exam"),
  bank: document.querySelector("#bank"),
  report: document.querySelector("#report"),
  questionHost: document.querySelector("#questionHost"),
  examMode: document.querySelector("#examMode"),
  examTitle: document.querySelector("#examTitle"),
  progressText: document.querySelector("#progressText"),
  progressBar: document.querySelector("#progressBar"),
  prevBtn: document.querySelector("#prevBtn"),
  nextBtn: document.querySelector("#nextBtn"),
  checkBtn: document.querySelector("#checkBtn"),
  finishBtn: document.querySelector("#finishBtn"),
  searchBox: document.querySelector("#searchBox"),
  updateBtn: document.querySelector("#updateBtn"),
  updatePanel: document.querySelector("#updatePanel"),
  updateTitle: document.querySelector("#updateTitle"),
  updateStatus: document.querySelector("#updateStatus"),
  applyUpdateBtn: document.querySelector("#applyUpdateBtn"),
  updateModal: document.querySelector("#updateModal"),
  updateModalBody: document.querySelector("#updateModalBody"),
  closeUpdateModalBtn: document.querySelector("#closeUpdateModalBtn"),
  cancelUpdateBtn: document.querySelector("#cancelUpdateBtn"),
  confirmUpdateBtn: document.querySelector("#confirmUpdateBtn")
};

on(document.querySelector("#newExamBtn"), "click", () => startExam("test"));
on(document.querySelector("#reinforceBtn"), "click", () => startExam("reinforcement"));
on(document.querySelector("#bankBtn"), "click", showBank);
on(els.updateBtn, "click", checkForUpdates);
on(els.applyUpdateBtn, "click", openUpdateModal);
on(els.closeUpdateModalBtn, "click", closeUpdateModal);
on(els.cancelUpdateBtn, "click", closeUpdateModal);
on(els.confirmUpdateBtn, "click", applyUpdate);
on(els.prevBtn, "click", () => move(-1));
on(els.nextBtn, "click", () => move(1));
on(els.checkBtn, "click", checkCurrent);
on(els.finishBtn, "click", finishExam);
on(els.searchBox, "input", renderBank);
on(els.questionCount, "input", updatePassTarget);

loadQuestions();
window.addEventListener("load", () => {
  setTimeout(() => checkForUpdates({ silent: true }), 700);
});

function on(element, event, handler) {
  if (element) element.addEventListener(event, handler);
}

async function loadQuestions() {
  try {
    const res = await fetch("data/questions.json");
    if (!res.ok) throw new Error("No se pudo cargar data/questions.json");
    state.questions = await res.json();
  } catch (error) {
    showLoadError(error);
    return;
  }

  hydrateFilters();
  renderStats();
  renderTopicCards();
  updatePassTarget();
}

function showLoadError(error) {
  els.intro.innerHTML = `
    <h2>No se ha podido cargar el JSON</h2>
    <p>${escapeHtml(error.message)}. Abre la app con el servidor local de la carpeta: <code>node serve-local.js</code>.</p>
  `;
}

function hydrateFilters() {
  const topics = unique(state.questions.map(q => q.topic)).sort();
  const types = unique(state.questions.map(q => q.type)).sort();
  fillSelect(els.topicFilter, ["all", ...topics], "Todos");
  fillSelect(els.typeFilter, ["all", ...types], "Todos");
  els.totalQuestions.textContent = state.questions.length;
}

function fillSelect(select, values, allLabel) {
  select.innerHTML = "";
  values.forEach(value => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value === "all" ? allLabel : label(value);
    select.appendChild(option);
  });
}

function renderStats() {
  const history = state.history;
  updatePassTarget();
  if (!history.length) {
    els.lastScore.textContent = "-";
    els.avgScore.textContent = "-";
    els.weakArea.textContent = "-";
    return;
  }
  const last = history[history.length - 1];
  els.lastScore.textContent = `${last.grade ?? ((last.score / last.total) * 10).toFixed(1)}/10`;
  const avg = history.reduce((sum, item) => sum + item.percent, 0) / history.length;
  els.avgScore.textContent = `${Math.round(avg)}%`;
  const weak = getWeakAreas(history)[0];
  els.weakArea.textContent = weak ? label(weak.name) : "-";
}

function updatePassTarget() {
  const count = clamp(Number(els.questionCount.value) || 15, 5, 30);
  els.passTarget.textContent = `${Math.ceil(count * PASS_GRADE / 10)}/${count}`;
}

function renderTopicCards() {
  const byTopic = groupBy(state.questions, q => q.topic);
  els.topicCards.innerHTML = Object.entries(byTopic).map(([topic, qs]) => `
    <article class="topic-card">
      <strong>${escapeHtml(label(topic))}</strong>
      <span>${qs.length} preguntas</span>
      <button data-topic="${escapeHtml(topic)}">Entrenar</button>
    </article>
  `).join("");

  els.topicCards.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", () => {
      els.topicFilter.value = btn.dataset.topic;
      startExam("topic");
    });
  });
}

function startExam(mode) {
  const count = clamp(Number(els.questionCount.value) || 15, 5, 30);
  let pool = filteredQuestions();

  if (mode === "reinforcement") {
    const weak = getWeakAreas(state.history);
    const weakNames = weak.slice(0, 3).map(item => item.name);
    const reinforcePool = state.questions.filter(q => weakNames.includes(q.type) || weakNames.includes(q.topic));
    pool = reinforcePool.length >= 5 ? reinforcePool : pool;
  }

  state.exam = shuffle(pool).slice(0, Math.min(count, pool.length));
  state.answers = new Map();
  state.optionOrders = new Map();
  state.checked = new Set();
  state.index = 0;
  state.mode = mode;
  state.exam.forEach(q => {
    if (Array.isArray(q.options)) {
      state.optionOrders.set(q.id, shuffle(q.options.map((_, idx) => idx)));
    }
  });
  showOnly("exam");
  renderQuestion();
}

function filteredQuestions() {
  const topic = els.topicFilter.value;
  const type = els.typeFilter.value;
  const difficulty = els.difficultyFilter.value;
  return state.questions.filter(q => {
    return (topic === "all" || q.topic === topic)
      && (type === "all" || q.type === type)
      && (difficulty === "all" || q.difficulty === difficulty);
  });
}

function renderQuestion() {
  const q = state.exam[state.index];
  if (!q) {
    els.questionHost.innerHTML = "<p>No hay preguntas con esos filtros.</p>";
    return;
  }

  els.examMode.textContent = state.mode === "reinforcement" ? "Refuerzo inteligente" : "Test";
  els.examTitle.textContent = `Pregunta ${state.index + 1}`;
  els.progressText.textContent = `${state.index + 1}/${state.exam.length}`;
  els.progressBar.style.width = `${((state.index + 1) / state.exam.length) * 100}%`;
  els.prevBtn.disabled = state.index === 0;
  els.nextBtn.disabled = state.index === state.exam.length - 1;

  const checked = state.checked.has(q.id);
  const answer = state.answers.get(q.id);
  const answered = state.exam.filter(item => state.answers.has(item.id)).length;
  const passNeeded = Math.ceil(state.exam.length * PASS_GRADE / 10);
  els.questionHost.innerHTML = `
    <div class="question-meta">
      <span class="pill">${escapeHtml(label(q.topic))}</span>
      <span class="pill">${escapeHtml(label(q.type))}</span>
      <span class="pill">${escapeHtml(label(q.difficulty))}</span>
    </div>
    <div class="question-stats">
      <span>Respondidas: ${answered}/${state.exam.length}</span>
      <span>Aprobado: ${passNeeded}/${state.exam.length}</span>
      <span>Fallos no restan</span>
    </div>
    <div class="prompt">${escapeHtml(q.question)}</div>
    ${q.code ? `<pre><code>${escapeHtml(q.code)}</code></pre>` : ""}
    <div id="answerHost"></div>
    <div id="feedbackHost"></div>
  `;

  renderAnswerControl(q, answer);
  if (checked) renderFeedback(q);
}

function renderAnswerControl(q, answer) {
  const host = document.querySelector("#answerHost");
  const optionOrder = state.optionOrders.get(q.id) || q.options?.map((_, idx) => idx) || [];
  if (q.type === "ordenar-codigo") {
    const picked = Array.isArray(answer) ? answer : [];
    const remaining = optionOrder.filter(idx => !picked.includes(idx));
    host.innerHTML = `
      <div class="order-board">
        <div>
          <strong>Tu orden</strong>
          <div class="drop-zone" id="pickedZone"></div>
        </div>
        <div>
          <strong>Fragmentos</strong>
          <div class="choice-zone" id="choiceZone"></div>
        </div>
      </div>
    `;
    renderOrderZone(q, picked, remaining);
    return;
  }

  if (q.type === "completar-codigo") {
    host.innerHTML = `
      <label>Respuesta exacta o concepto clave
        <input id="fillAnswer" value="${escapeHtml(answer || "")}" placeholder="Escribe aqui">
      </label>
    `;
    host.querySelector("input").addEventListener("input", event => {
      state.answers.set(q.id, event.target.value);
    });
    return;
  }

  if (q.type === "revisar-codigo") {
    const current = answer || { verdict: "", fix: "" };
    host.innerHTML = `
      <div class="review-box">
        <strong>Veredicto</strong>
        <div class="options review-verdicts">
          ${(q.verdictOptions || ["correcto", "incorrecto", "parcial"]).map(value => `
            <button class="option${current.verdict === value ? " selected" : ""}" type="button" data-verdict="${escapeHtml(value)}">${escapeHtml(label(value))}</button>
          `).join("")}
        </div>
        <label>Como lo arreglarias o que explicarias en el examen
          <textarea id="reviewFix" rows="5" placeholder="Escribe el diagnostico y el arreglo concreto...">${escapeHtml(current.fix || "")}</textarea>
        </label>
      </div>
    `;
    host.querySelectorAll("[data-verdict]").forEach(btn => {
      btn.addEventListener("click", () => {
        state.answers.set(q.id, { ...current, verdict: btn.dataset.verdict });
        renderQuestion();
      });
    });
    host.querySelector("#reviewFix").addEventListener("input", event => {
      state.answers.set(q.id, { ...current, fix: event.target.value });
    });
    return;
  }

  host.innerHTML = `<div class="options"></div>`;
  const optionsHost = host.querySelector(".options");
  optionOrder.forEach(idx => {
    const text = q.options[idx];
    const btn = document.createElement("button");
    const selected = Array.isArray(answer) ? answer.includes(idx) : answer === idx;
    btn.className = `option ${q.type === "multiple" ? "multi-option" : "single-option"}${selected ? " selected" : ""}`;
    btn.innerHTML = `
      <span class="choice-indicator" aria-hidden="true"></span>
      <span>${escapeHtml(text)}</span>
    `;
    btn.addEventListener("click", () => selectOption(q, idx));
    optionsHost.appendChild(btn);
  });
}

function renderOrderZone(q, picked, remaining) {
  const pickedZone = document.querySelector("#pickedZone");
  const choiceZone = document.querySelector("#choiceZone");
  pickedZone.innerHTML = "";
  choiceZone.innerHTML = "";

  picked.forEach((idx, pos) => {
    const btn = document.createElement("button");
    btn.className = "line-chip selected";
    btn.textContent = `${pos + 1}. ${q.options[idx]}`;
    btn.addEventListener("click", () => {
      const next = picked.filter(item => item !== idx);
      state.answers.set(q.id, next);
      renderAnswerControl(q, next);
    });
    pickedZone.appendChild(btn);
  });

  remaining.forEach(idx => {
    const btn = document.createElement("button");
    btn.className = "line-chip";
    btn.textContent = q.options[idx];
    btn.addEventListener("click", () => {
      const next = [...picked, idx];
      state.answers.set(q.id, next);
      renderAnswerControl(q, next);
    });
    choiceZone.appendChild(btn);
  });
}

function selectOption(q, idx) {
  const current = state.answers.get(q.id);
  if (q.type === "multiple") {
    const next = new Set(Array.isArray(current) ? current : []);
    next.has(idx) ? next.delete(idx) : next.add(idx);
    state.answers.set(q.id, [...next].sort((a, b) => a - b));
  } else {
    state.answers.set(q.id, idx);
  }
  renderQuestion();
}

function checkCurrent() {
  const q = state.exam[state.index];
  if (!q) return;
  state.checked.add(q.id);
  renderQuestion();
}

function renderFeedback(q) {
  const host = document.querySelector("#feedbackHost");
  const answer = state.answers.get(q.id);
  const ok = isCorrect(q, answer);
  markOptions(q);
  host.innerHTML = `
    <div class="feedback ${ok ? "ok" : "bad"}">
      <strong>${ok ? "Correcta" : "Revisa esta"}</strong>
      <p>${escapeHtml(q.explanation)}</p>
      ${q.type === "revisar-codigo" ? renderReviewExpected(q, answer) : ""}
      ${q.type === "completar-codigo" ? renderFillExpected(q) : ""}
      ${q.trap ? `<p><strong>Trampa:</strong> ${escapeHtml(q.trap)}</p>` : ""}
    </div>
  `;
}

function renderReviewExpected(q, answer) {
  const keywords = q.answer?.keywords || [];
  const fix = normalizeText(answer?.fix || "");
  const missing = keywords.filter(keyword => !fix.includes(normalizeText(keyword)));
  const verdictText = answer?.verdict ? label(answer.verdict) : "Sin marcar";
  return `
    <div class="expected">
      <p><strong>Tu veredicto:</strong> ${escapeHtml(verdictText)}. <strong>Esperado:</strong> ${escapeHtml(label(q.answer.verdict))}.</p>
      <p><strong>Palabras clave esperadas:</strong> ${escapeHtml(keywords.join(", ")) || "-"}.</p>
      ${missing.length ? `<p><strong>Te faltaria mencionar:</strong> ${escapeHtml(missing.join(", "))}.</p>` : "<p><strong>Diagnostico:</strong> contiene las claves principales.</p>"}
    </div>
  `;
}

function renderFillExpected(q) {
  return `<p class="expected"><strong>Respuestas aceptadas:</strong> ${escapeHtml(q.answer.join(", "))}.</p>`;
}

function markOptions(q) {
  if (q.type !== "single" && q.type !== "multiple") return;
  const buttons = [...document.querySelectorAll(".option")];
  const answer = state.answers.get(q.id);
  const correct = Array.isArray(q.answer) ? q.answer : [q.answer];
  const optionOrder = state.optionOrders.get(q.id) || q.options.map((_, idx) => idx);
  buttons.forEach((btn, visibleIdx) => {
    const idx = optionOrder[visibleIdx];
    const selected = Array.isArray(answer) ? answer.includes(idx) : answer === idx;
    if (correct.includes(idx)) btn.classList.add("correct");
    if (selected && !correct.includes(idx)) btn.classList.add("wrong");
  });
}

function move(step) {
  state.index = clamp(state.index + step, 0, state.exam.length - 1);
  renderQuestion();
}

function finishExam() {
  if (!state.exam.length) return;
  const results = state.exam.map(q => ({
    id: q.id,
    topic: q.topic,
    type: q.type,
    difficulty: q.difficulty,
    correct: isCorrect(q, state.answers.get(q.id))
  }));
  const score = results.filter(r => r.correct).length;
  const summary = {
    date: new Date().toISOString(),
    score,
    total: results.length,
    percent: Math.round((score / results.length) * 100),
    grade: Number(((score / results.length) * 10).toFixed(2)),
    passed: (score / results.length) >= PASS_GRADE / 10,
    byTopic: summarize(results, "topic"),
    byType: summarize(results, "type"),
    byDifficulty: summarize(results, "difficulty")
  };
  state.history.push(summary);
  localStorage.setItem("pedalean2ExamHistory", JSON.stringify(state.history.slice(-50)));
  renderStats();
  renderReport(summary, results);
}

function renderReport(summary, results) {
  showOnly("report");
  els.report.innerHTML = `
    <p class="eyebrow">Informe</p>
    <h2>${summary.score}/${summary.total} correctas (${summary.percent}%) - Nota ${summary.grade}/10</h2>
    <div class="result-banner ${summary.passed ? "pass" : "fail"}">
      <strong>${summary.passed ? "Aprobado" : "Suspenso"}</strong>
      <span>Minimo para aprobar: ${PASS_GRADE}/10. Las incorrectas no restan.</span>
    </div>
    <div class="report-grid">
      ${renderSummaryTable("Por tipo", summary.byType)}
      ${renderSummaryTable("Por tema", summary.byTopic)}
      ${renderSummaryTable("Por dificultad", summary.byDifficulty)}
      <article>
        <h3>Plan de refuerzo</h3>
        <p>${escapeHtml(recommend(summary))}</p>
        <button id="reportReinforce" class="primary">Entrenar debilidades</button>
      </article>
    </div>
    <h3 style="margin-top:18px">Fallos</h3>
    <div class="bank-list">
      ${results.filter(r => !r.correct).map(r => {
        const q = state.questions.find(item => item.id === r.id);
        return `<article class="bank-item"><strong>${escapeHtml(q.question)}</strong><p>${escapeHtml(q.explanation)}</p></article>`;
      }).join("") || "<p>Sin fallos. Sube dificultad a 'A matar'.</p>"}
    </div>
  `;
  document.querySelector("#reportReinforce").addEventListener("click", () => startExam("reinforcement"));
}

function renderSummaryTable(title, data) {
  const rows = Object.entries(data).sort((a, b) => a[1].percent - b[1].percent);
  return `
    <article>
      <h3>${title}</h3>
      <div class="table">
        <div class="row head"><span>Area</span><span>Acierto</span><span>Preg.</span></div>
        ${rows.map(([name, item]) => `
          <div class="row"><span>${escapeHtml(label(name))}</span><span>${item.percent}%</span><span>${item.correct}/${item.total}</span></div>
        `).join("")}
      </div>
    </article>
  `;
}

function showBank() {
  showOnly("bank");
  renderBank();
}

function renderBank() {
  const query = els.searchBox.value.trim().toLowerCase();
  const list = state.questions.filter(q => JSON.stringify(q).toLowerCase().includes(query));
  els.bankList.innerHTML = list.map(q => `
    <article class="bank-item">
      <div class="question-meta">
        <span class="pill">${escapeHtml(label(q.topic))}</span>
        <span class="pill">${escapeHtml(label(q.type))}</span>
        <span class="pill">${escapeHtml(label(q.difficulty))}</span>
      </div>
      <strong>${escapeHtml(q.question)}</strong>
      <p>${escapeHtml(q.explanation)}</p>
    </article>
  `).join("");
}

function isCorrect(q, answer) {
  if (q.type === "completar-codigo") {
    const normalized = normalizeText(answer || "");
    return q.answer.some(item => normalized === normalizeText(item));
  }
  if (q.type === "revisar-codigo") {
    if (!answer || answer.verdict !== q.answer.verdict) return false;
    const fix = normalizeText(answer.fix || "");
    return (q.answer.keywords || []).every(keyword => fix.includes(normalizeText(keyword)));
  }
  if (Array.isArray(q.answer)) {
    return Array.isArray(answer) && q.answer.length === answer.length && q.answer.every((item, idx) => item === answer[idx]);
  }
  return answer === q.answer;
}

function summarize(results, key) {
  const grouped = groupBy(results, item => item[key]);
  return Object.fromEntries(Object.entries(grouped).map(([name, items]) => {
    const correct = items.filter(item => item.correct).length;
    return [name, { correct, total: items.length, percent: Math.round((correct / items.length) * 100) }];
  }));
}

function recommend(summary) {
  const weakTypes = Object.entries(summary.byType).filter(([, v]) => v.percent < 70).map(([k]) => label(k));
  const weakTopics = Object.entries(summary.byTopic).filter(([, v]) => v.percent < 70).map(([k]) => label(k));
  if (!summary.passed) return `Ahora estas por debajo del ${PASS_GRADE}/10. Prioridad: subir ${weakTypes.join(", ") || "los tipos con fallos"} en ${weakTopics.join(", ") || "los temas flojos"} hasta asegurar el minimo de aciertos.`;
  if (!weakTypes.length && !weakTopics.length) return "Vas por encima del minimo. Entrena dificultad 'A matar' y preguntas inversas para subir margen.";
  return `Apruebas, pero refuerza ${weakTypes.join(", ") || "tipos variados"} en ${weakTopics.join(", ") || "temas variados"} para no depender de preguntas faciles.`;
}

function getWeakAreas(history) {
  const rows = [];
  history.slice(-10).forEach(item => {
    Object.entries(item.byType || {}).forEach(([name, data]) => rows.push({ name, ...data }));
    Object.entries(item.byTopic || {}).forEach(([name, data]) => rows.push({ name, ...data }));
  });
  const grouped = groupBy(rows, item => item.name);
  return Object.entries(grouped).map(([name, items]) => {
    const correct = items.reduce((sum, item) => sum + item.correct, 0);
    const total = items.reduce((sum, item) => sum + item.total, 0);
    return { name, percent: total ? Math.round((correct / total) * 100) : 100 };
  }).sort((a, b) => a.percent - b.percent);
}

function showOnly(id) {
  [els.intro, els.exam, els.report, els.bank].forEach(el => el.classList.add("hidden"));
  els[id].classList.remove("hidden");
}

async function checkForUpdates(options = {}) {
  const silent = options.silent === true;
  if (!silent) setUpdatePanel("Comprobando GitHub...", `Repositorio: ${GITHUB_REPO}`, "ready");
  try {
    const response = await fetch("/api/check-update");
    if (!response.ok) throw new Error("El servidor local no expone /api/check-update. Arranca con node serve-local.js.");
    const info = await response.json();
    state.pendingUpdate = info;
    if (!info.available) {
      if (silent) {
        hideUpdatePanel();
        return;
      }
      setUpdatePanel("Sin update disponible", `Version local: ${info.currentCommit || "local"}; GitHub: ${shortSha(info.latestCommit)}.`, "done");
      return;
    }
    const packageText = info.packageAvailable
      ? "Hay paquete de app en el repo y se puede aplicar."
      : "Hay commit distinto, pero el repo aun no contiene los archivos de la app para autoactualizar.";
    setUpdatePanel("Update detectada", `${packageText} GitHub: ${shortSha(info.latestCommit)}.`, info.packageAvailable ? "ready" : "error");
    els.applyUpdateBtn.classList.toggle("hidden", !info.packageAvailable);
  } catch (error) {
    if (!silent) setUpdatePanel("No se pudo comprobar", error.message, "error");
  }
}

async function applyUpdate() {
  if (!state.pendingUpdate?.packageAvailable) return;
  closeUpdateModal();
  setUpdatePanel("Aplicando update...", "Descargando archivos desde GitHub.", "ready");
  try {
    const response = await fetch("/api/apply-update", { method: "POST" });
    const result = await response.json();
    if (!response.ok || !result.ok) throw new Error(result.error || "No se pudo aplicar la update.");
    setUpdatePanel("Update aplicada", `Archivos actualizados: ${result.updatedFiles.join(", ")}. Reiniciando servidor y recargando...`, "done");
    setTimeout(waitForServerAndReload, 1200);
  } catch (error) {
    setUpdatePanel("Fallo al aplicar", error.message, "error");
  }
}

function openUpdateModal() {
  const info = state.pendingUpdate;
  if (!info?.packageAvailable) return;
  els.updateModalBody.innerHTML = `
    <p>Se descargara la version publica mas reciente desde <strong>${escapeHtml(GITHUB_REPO)}</strong>.</p>
    <p class="modal-warning">Esta accion sobrescribe los archivos locales de esta app de examen y reinicia el servidor local.</p>
    <ul class="modal-list">
      <li><strong>Commit local:</strong> ${escapeHtml(shortSha(info.currentCommit))}</li>
      <li><strong>Commit GitHub:</strong> ${escapeHtml(shortSha(info.latestCommit))}</li>
      <li><strong>Archivos:</strong> index.html, app.js, styles.css, README.md y data/questions.json</li>
      <li><strong>Despues:</strong> se espera a que el servidor responda y se recarga la pagina automaticamente.</li>
    </ul>
    <p>Tu historial de notas se guarda en el navegador y no se borra al actualizar los archivos.</p>
  `;
  els.updateModal.classList.remove("hidden");
  els.confirmUpdateBtn.focus();
}

function closeUpdateModal() {
  els.updateModal.classList.add("hidden");
}

async function waitForServerAndReload() {
  const deadline = Date.now() + 15000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch("/api/health", { cache: "no-store" });
      if (response.ok) {
        location.reload();
        return;
      }
    } catch {
      // The local server is restarting.
    }
    await sleep(500);
  }
  location.reload();
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function setUpdatePanel(title, status, kind) {
  els.updatePanel.classList.remove("hidden", "ready", "done", "error");
  els.updatePanel.classList.add(kind);
  els.updateTitle.textContent = title;
  els.updateStatus.textContent = status;
  if (kind !== "ready") els.applyUpdateBtn.classList.add("hidden");
}

function hideUpdatePanel() {
  els.updatePanel.classList.add("hidden");
  els.applyUpdateBtn.classList.add("hidden");
}

function shortSha(value) {
  return value ? value.slice(0, 7) : "-";
}

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function unique(items) {
  return [...new Set(items)];
}

function groupBy(items, fn) {
  return items.reduce((acc, item) => {
    const key = fn(item);
    acc[key] ||= [];
    acc[key].push(item);
    return acc;
  }, {});
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function label(value) {
  return String(value)
    .replaceAll("-", " ")
    .replace(/\b\w/g, char => char.toUpperCase());
}

function normalizeText(value) {
  return String(value).trim().toLowerCase().replace(/\s+/g, " ");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
