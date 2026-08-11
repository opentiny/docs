<template>
  <section
    v-if="items.length"
    class="projects-section"
  >
    <div class="section-header">
      <div class="section-title">最新更新</div>
      <p class="section-subtitle">文档更新、版本发布、消息发布</p>
    </div>
    <div class="updates-grid">
      <a
        v-for="(item, i) in items"
        :key="i"
        :href="item.url"
        target="_blank"
        rel="noopener noreferrer"
        class="update-card"
      >
        <span v-if="i === 0" class="new-badge">NEW</span>
        <div class="update-card-title">{{ item.project }} {{ item.toVersion }}</div>
        <div class="update-card-desc" :title="item.summary">{{ item.summary }}</div>
      </a>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from "vue";

// 监控的仓库列表：以 GitHub Releases 作为「版本发布 / 文档更新 / 消息发布」的实时数据源
// repo 为 GitHub 仓库路径，name 为卡片展示名
const repos = [
  { name: "WebMCP-SDKs", repo: "webmcp-sdk" },
  { name: "GenUI SDK", repo: "genui-sdk" },
  { name: "TinyRobot", repo: "tiny-robot" },
  { name: "TinyVue", repo: "tiny-vue" },
  { name: "TinyEditor", repo: "tiny-editor" },
  { name: "TinyEngine", repo: "tiny-engine" },
  { name: "WebAgent", repo: "web-agent" },
];

// 本地缓存：规避 GitHub 未授权接口 60 次/小时/IP 的速率限制
// - 命中缓存且未过期：直接渲染，不发请求
// - 携带 ETag 发 If-None-Match：304 不消耗配额，复用缓存项
// - 收到 403：标记 rateLimitedUntil，进入静默窗口，暂停请求
// - 无缓存时回退读上一版本：保证限速期间仍有旧数据展示，不致区段消失
const CACHE_KEY = "home-updates-cache-v10"; // v10：cleanMessage 增加裸 #PR 清理，旧摘要失效
const FALLBACK_CACHE_KEY = "home-updates-cache-v9"; // v10 缺失时回退读取，限速期间保底展示
const CACHE_TTL = 60 * 60 * 1000; // 1 小时（有 ETag 兜底，刷新几乎零成本）

const items = ref([]);

// 将 Release 的 Markdown 正文清洗为可读纯文本
function cleanMarkdown(md) {
  if (!md) return "";
  return md
    .replace(/```[\s\S]*?```/g, " ")            // 代码块
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")        // 图片
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")      // 链接保留文字
    .replace(/^#{1,6}\s+/gm, "")                  // 标题
    .replace(/^\s*[-*+]\s+/gm, "")                // 无序列表
    .replace(/^\s*\d+\.\s+/gm, "")                // 有序列表
    .replace(/[`*_~>#]/g, "")                     // 行内标记
    .replace(/\n{2,}/g, "\n")                     // 合并空行
    .replace(/\s+/g, " ")
    .trim();
}

// 去掉 conventional commits 前缀、修改人、PR 引用，只留修改点文字
const CM_RE = /^(feat|fix|chore|docs|style|refactor|perf|test|build|ci|revert|improvement|release|mod|update)(\([^)]*\))?(!)?[:：]\s*/i;
function cleanMessage(text) {
  if (!text) return "";
  return text
    .replace(CM_RE, "")
    .replace(/\s+by\s+@[\w.-]+/gi, "")
    .replace(/\s+in\s+(#?\d+|https?:\/\/\S+)/gi, "")
    .replace(/\s*\(#\d+(?:\s*,\s*#?\d+)*\)/gi, "")
    .replace(/(?:^|\s)#\d+(?:\s*,\s*#?\d+)*/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function buildSummary(release) {
  const raw = cleanMarkdown(release.body || release.name || "");
  if (!raw) return release.name || release.tag_name || "";
  // 按行提取修改点：优先取 conventional commits 行，过滤标题/空行，取前 3 条
  const lines = raw.split("\n").map((l) => l.trim());
  const cm = lines
    .filter((l) => CM_RE.test(l))
    .map((l) => cleanMessage(l))
    .filter(Boolean);
  const picked = cm.length
    ? cm
    : lines.map((l) => cleanMessage(l)).filter(Boolean);
  const text = picked.slice(0, 3).join("；");
  if (!text) return release.name || release.tag_name || "";
  return text.length > 120 ? text.slice(0, 120) + "…" : text;
}

function mapRelease(meta, release) {
  return {
    project: meta.name,
    toVersion: release.tag_name || release.name || "",
    summary: buildSummary(release),
    url: release.html_url || `https://github.com/opentiny/${meta.repo}`,
    date: release.published_at || "",
  };
}

// 缓存结构：{ ts, data(渲染用 top4), perRepo(每仓库 etag+item), rateLimitedUntil }
function readCache() {
  try {
    let raw = localStorage.getItem(CACHE_KEY);
    let fromFallback = false;
    if (!raw) {
      // 当前版本无缓存（如刚升级且尚未成功拉取）：回退读上一版本，保证限速期间仍能展示旧数据
      raw = localStorage.getItem(FALLBACK_CACHE_KEY);
      fromFallback = !!raw;
    }
    if (!raw) return null;
    const { ts, data, perRepo, rateLimitedUntil } = JSON.parse(raw);
    return {
      ts: ts || 0,
      data: data || [],
      // 旧版本缓存无 ETag/perRepo，不复用，新拉取时走全量请求
      perRepo: fromFallback ? {} : (perRepo || {}),
      rateLimitedUntil: rateLimitedUntil || 0,
    };
  } catch {
    return null;
  }
}

function writeCache({ data, perRepo, rateLimitedUntil = 0 }) {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ ts: Date.now(), data, perRepo, rateLimitedUntil })
    );
  } catch {
    /* 忽略配额异常 */
  }
}

// 翻译缓存：按版本长期复用，避免同一版本每次刷新都重复调用翻译接口
const TR_CACHE_KEY = "home-updates-tr-cache-v5"; // v5：cleanMessage 增加裸 #PR 清理，源文本变化旧翻译失效重译
const TR_TTL = 7 * 24 * 60 * 60 * 1000; // 7 天（Release 内容发布后基本不变）

function readTrCache() {
  try {
    const raw = localStorage.getItem(TR_CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

// 写回时顺带清理过期条目，防止 localStorage 无限膨胀
function writeTrCache(map) {
  try {
    const now = Date.now();
    for (const k of Object.keys(map)) {
      if (now - map[k].ts > TR_TTL) delete map[k];
    }
    localStorage.setItem(TR_CACHE_KEY, JSON.stringify(map));
  } catch {
    /* 忽略配额异常 */
  }
}

// 带超时的 fetch：防止外部接口卡住导致 Promise 永不结算
function fetchWithTimeout(url, options = {}, timeoutMs = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...options, signal: controller.signal })
    .finally(() => clearTimeout(timer));
}

// 调用免费翻译接口（先 Google，失败兜底 MyMemory）；都失败抛错由调用方回退英文
async function translateToZh(text) {
  if (!text) return "";
  // 1) Google 非官方接口（无需 key，返回 [[["译文",...]],...]）
  try {
    const g = await fetchWithTimeout(
      "https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=zh-CN&dt=t&q=" +
        encodeURIComponent(text)
    );
    if (g.ok) {
      const d = await g.json();
      const segs = Array.isArray(d) && Array.isArray(d[0]) ? d[0] : [];
      const zh = segs.map((s) => (Array.isArray(s) && s[0] ? s[0] : "")).join("");
      if (zh) return zh;
    }
  } catch {
    /* 转试 MyMemory */
  }
  // 2) 兜底：MyMemory（返回 {responseData:{translatedText}} ）
  try {
    const m = await fetchWithTimeout(
      "https://api.mymemory.translated.net/get?q=" +
        encodeURIComponent(text) + "&langpair=en%7Czh-CN"
    );
    if (m.ok) {
      const d = await m.json();
      const t = d && d.responseData && d.responseData.translatedText;
      if (t && !/MYMEMORY WARNING/i.test(t)) return t;
    }
  } catch {
    /* 都失败 */
  }
  throw new Error("translate failed");
}

// 对每条 Release 的摘要做翻译；命中翻译缓存的不重复请求，失败回退英文原文
async function withTranslation(rawItems) {
  const trMap = readTrCache();
  const now = Date.now();
  const tasks = rawItems.map(async (it) => {
    const vKey = `${it.url}#${it.toVersion}`;
    const cached = trMap[vKey];
    if (cached && now - cached.ts < TR_TTL && cached.zh) {
      return { ...it, summary: cached.zh };
    }
    try {
      const zh = await translateToZh(it.summary);
      if (zh) {
        trMap[vKey] = { ts: now, zh };
        return { ...it, summary: zh };
      }
    } catch {
      /* 翻译失败，保留英文原文 */
    }
    return it;
  });
  const out = await Promise.all(tasks);
  writeTrCache(trMap);
  return out;
}

// 条件请求：携带 If-None-Match；304 复用缓存不消耗配额，200 取新数据与 ETag，
// 403 触发限速标记，其它错误返回 error 由调用方跳过该仓库
async function fetchConditional(url, etag) {
  const headers = { Accept: "application/vnd.github+json" };
  if (etag) headers["If-None-Match"] = etag;
  let res;
  try {
    res = await fetchWithTimeout(url, { headers });
  } catch {
    return { status: "error" };
  }
  if (res.status === 304) return { status: 304 };
  if (res.status === 403) return { status: 403 };
  if (!res.ok) return { status: "error" };
  try {
    const data = await res.json();
    return { status: 200, data, etag: res.headers.get("etag") || "" };
  } catch {
    return { status: "error" };
  }
}

// 收到 403 时置位；onMounted 结束后据此写 rateLimitedUntil
let _rateLimitedAt = 0;

// 拉取每个仓库最新 Release：返回 { 'repo/release': { etag, ts, item } }
// 走 Releases API，200 用新数据，304 复用缓存，403/error 跳过
async function fetchLatest(perRepo) {
  const out = {};
  await Promise.all(
    repos.map(async (r) => {
      const key = `${r.repo}/release`;
      const cached = perRepo[key];
      const url = `https://api.github.com/repos/opentiny/${r.repo}/releases?per_page=1`;
      const result = await fetchConditional(url, cached && cached.etag);
      if (result.status === 403) _rateLimitedAt = Date.now();
      if (result.status === 200 && Array.isArray(result.data) && result.data[0]) {
        out[key] = { etag: result.etag, ts: Date.now(), item: mapRelease(r, result.data[0]) };
      } else if (cached) {
        // 304 复用缓存项；403/error 复用旧缓存保底，避免限速仓库卡片消失与 ETag 丢失
        out[key] = cached;
      }
    })
  );
  return out;
}

// 拉取每个仓库最近一次提交，作为「文档/代码更新」动态
// 返回 { 'repo/commit': { etag, ts, item } }，304 复用缓存项
async function fetchDocsUpdates(perRepo) {
  const out = {};
  await Promise.all(
    repos.map(async (r) => {
      const key = `${r.repo}/commit`;
      const cached = perRepo[key];
      const url = `https://api.github.com/repos/opentiny/${r.repo}/commits?per_page=1`;
      const result = await fetchConditional(url, cached && cached.etag);
      if (result.status === 403) _rateLimitedAt = Date.now();
      if (result.status === 200 && Array.isArray(result.data) && result.data[0]) {
        const c = result.data[0];
        const msg = (c.commit && c.commit.message) || "";
        out[key] = {
          etag: result.etag,
          ts: Date.now(),
          item: {
            project: r.name,
            toVersion: "",
            summary: cleanMessage(msg.split("\n")[0]) || "",
            url: c.html_url || "",
            date: (c.commit && c.commit.author && c.commit.author.date) || "",
          },
        };
      } else if (cached) {
        // 304 复用缓存项；403/error 复用旧缓存保底，避免限速仓库卡片消失与 ETag 丢失
        out[key] = cached;
      }
    })
  );
  return out;
}

onMounted(async () => {
  // 先用缓存即时渲染，避免接口未返回时出现空白
  const cache = readCache();
  if (cache && cache.data) items.value = cache.data;

  const now = Date.now();
  // 仍在限速静默窗口内：直接用缓存，不再发请求
  if (cache && cache.rateLimitedUntil && now < cache.rateLimitedUntil && cache.data.length) return;
  // 缓存未过期：直接用缓存
  if (cache && now - cache.ts < CACHE_TTL && cache.data.length) return;

  _rateLimitedAt = 0;
  const perRepo = (cache && cache.perRepo) || {};
  try {
    // 并行拉取版本发布与各库最新提交；任一失败不影响另一方
    const [relR, docR] = await Promise.allSettled([
      fetchLatest(perRepo),
      fetchDocsUpdates(perRepo),
    ]);
    const newPerRepo = {
      ...(relR.status === "fulfilled" ? relR.value : {}),
      ...(docR.status === "fulfilled" ? docR.value : {}),
    };
    // 合并所有仓库最新条目，按时间倒序取前 4 条
    // 同一仓库的 release 与 commit 只保留较新的一条，避免同一项目重复出现
    const seen = new Set();
    const merged = Object.values(newPerRepo)
      .filter((x) => x && x.item)
      .map((x) => x.item)
      .sort((a, b) => (b.date > a.date ? 1 : b.date < a.date ? -1 : 0))
      .filter((it) => {
        if (seen.has(it.project)) return false;
        seen.add(it.project);
        return true;
      })
      .slice(0, 4);

    if (!merged.length) {
      // 全部失败（多半是限速）：保留旧缓存并进入静默窗口，1 小时后再试
      if (_rateLimitedAt) {
        writeCache({
          data: cache ? cache.data : [],
          perRepo,
          rateLimitedUntil: Date.now() + 60 * 60 * 1000,
        });
      }
      return;
    }

    const translated = await withTranslation(merged);
    items.value = translated;
    writeCache({
      data: translated,
      perRepo: newPerRepo,
      rateLimitedUntil: _rateLimitedAt ? Date.now() + 60 * 60 * 1000 : 0,
    });
  } catch {
    // 未预期错误：保留缓存数据（无缓存则区段隐藏）
  }
});
</script>
