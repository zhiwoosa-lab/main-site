const healthPaths = {
  metrics: "../content/health/metrics.json",
  journalIndex: "../content/health/journal/index.json",
  journalBase: "../content/health/journal/",
  principles: "../content/health/principles.md",
};

const metricIcons = {
  sleep: "moon",
  steps: "steps",
  exercise: "rings",
  weight: "scale",
  bodyFat: "scale",
  restingHeartRate: "heart",
  heartRateAverage: "heart",
  distance: "steps",
  activeEnergy: "spark",
  energy: "spark",
};

const fieldLabels = {
  bodyStatus: "身体状态",
  movement: "运动记录",
  food: "饮食记录",
  reflection: "健康反思",
};

document.documentElement.classList.add("js-ready");
document.addEventListener("DOMContentLoaded", () => {
  loadHealthDashboard();
  loadHealthTimeline();
  loadHealthPrinciples();
});

async function loadHealthDashboard() {
  const container = document.querySelector("#health-metrics");
  try {
    const data = await fetchJson(healthPaths.metrics);
    document.querySelector("#health-updated").textContent = formatDate(data.updatedAt);
    document.querySelector("#health-source").textContent = data.sync?.sourceLabel || "Local JSON";

    container.innerHTML = data.metrics
      .map((metric) => {
        const icon = metricIcons[metric.id] || "dot";
        return `
          <article class="health-metric-card" data-status="${escapeHtml(metric.status || "stable")}">
            <div class="metric-topline">
              <span class="metric-icon metric-icon-${icon}" aria-hidden="true"></span>
              <span>${escapeHtml(metric.label)}</span>
            </div>
            <strong>${escapeHtml(metric.value)}</strong>
            <p>${escapeHtml(metric.note)}</p>
            <small>${escapeHtml(metric.trend)}</small>
          </article>
        `;
      })
      .join("");
  } catch (error) {
    renderError(container, "健康数据读取失败。请检查 content/health/metrics.json。", error);
  }
}

async function loadHealthTimeline() {
  const container = document.querySelector("#health-timeline");
  try {
    const index = await fetchJson(healthPaths.journalIndex);
    const entries = await Promise.all(
      index.entries.map(async (entry) => {
        const markdown = await fetchText(`${healthPaths.journalBase}${entry.file}`);
        return parseJournalMarkdown(markdown, entry.file);
      }),
    );

    container.innerHTML = entries
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .map(renderJournalEntry)
      .join("");
  } catch (error) {
    renderError(container, "健康时间线读取失败。请检查 content/health/journal/。", error);
  }
}

async function loadHealthPrinciples() {
  const container = document.querySelector("#health-principles");
  try {
    const markdown = await fetchText(healthPaths.principles);
    container.innerHTML = renderMarkdownBlocks(markdown);
  } catch (error) {
    renderError(container, "长期健康原则读取失败。请检查 content/health/principles.md。", error);
  }
}

async function fetchJson(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`${response.status} ${path}`);
  return response.json();
}

async function fetchText(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`${response.status} ${path}`);
  return response.text();
}

function parseJournalMarkdown(markdown, file) {
  const frontmatter = markdown.match(/^---\n([\s\S]*?)\n---\n?/);
  const meta = frontmatter ? parseFrontmatter(frontmatter[1]) : {};
  const body = frontmatter ? markdown.slice(frontmatter[0].length).trim() : markdown.trim();

  return {
    file,
    date: meta.date || "",
    bodyStatus: meta.bodyStatus || "",
    movement: meta.movement || "",
    food: meta.food || "",
    reflection: meta.reflection || "",
    energy: meta.energy || "",
    energyLabel: meta.energyLabel || "energy",
    body,
  };
}

function parseFrontmatter(source) {
  return source.split("\n").reduce((meta, line) => {
    const separator = line.indexOf(":");
    if (separator === -1) return meta;
    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim().replace(/^["']|["']$/g, "");
    meta[key] = value;
    return meta;
  }, {});
}

function renderJournalEntry(entry) {
  const fields = ["bodyStatus", "movement", "food", "reflection"]
    .filter((key) => entry[key])
    .map(
      (key) => `
        <div class="journal-field">
          <span>${fieldLabels[key]}</span>
          <p>${escapeHtml(entry[key])}</p>
        </div>
      `,
    )
    .join("");

  return `
    <article class="journal-card">
      <time datetime="${escapeHtml(entry.date)}">${formatDate(entry.date)}</time>
      <div class="journal-card-body">
        <div class="journal-energy" aria-label="精力状态">
          <span>${escapeHtml(entry.energy || "-")}</span>
          <small>${escapeHtml(entry.energyLabel)}</small>
        </div>
        <div class="journal-fields">${fields}</div>
        ${entry.body ? `<div class="journal-note">${renderMarkdownBlocks(entry.body)}</div>` : ""}
      </div>
    </article>
  `;
}

function renderMarkdownBlocks(markdown) {
  const lines = markdown.trim().split("\n");
  const html = [];
  let listItems = [];

  const flushList = () => {
    if (!listItems.length) return;
    html.push(`<ul>${listItems.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`);
    listItems = [];
  };

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      return;
    }

    if (trimmed.startsWith("## ")) {
      flushList();
      html.push(`<h3>${escapeHtml(trimmed.slice(3))}</h3>`);
      return;
    }

    if (trimmed.startsWith("- ")) {
      listItems.push(trimmed.slice(2));
      return;
    }

    flushList();
    html.push(`<p>${escapeHtml(trimmed)}</p>`);
  });

  flushList();
  return html.join("");
}

function formatDate(value) {
  if (!value) return "未记录";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

function renderError(container, message, error) {
  console.error(message, error);
  container.innerHTML = `<p class="health-error">${escapeHtml(message)}</p>`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
