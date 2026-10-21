// 共通の動き（ヘッダー・フッターは build.py が各ページに静的に埋め込む）
const $ = s => document.querySelector(s);

$("#menuBtn").onclick = () => {
  const open = $("#nav").classList.toggle("open");
  $("#menuBtn").setAttribute("aria-expanded", open);
};

// トップの見出し：スクロール量を CSS 変数に渡し、行ごとに速さを変えて右→左へ流す
const hero = $("#hero");
if (hero && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  let ticking = false;
  addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      hero.style.setProperty("--sx", Math.min(scrollY, hero.offsetHeight));
      ticking = false;
    });
  }, { passive: true });
}

// doggies の循環図：説明カードに触れると対応する犬を光らせる。動きを減らす設定なら流れる点を止める
const loopSvg = $("#loopSvg");
if (loopSvg) {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) loopSvg.pauseAnimations?.();
  const light = n => document.querySelectorAll(".loop [data-n]").forEach(el => el.classList.toggle("on", el.dataset.n === n));
  document.querySelectorAll(".loop [data-n]").forEach(el => {
    el.addEventListener("mouseenter", () => light(el.dataset.n));
    el.addEventListener("mouseleave", () => light(null));
  });
}

// ページ内タブ：今見ている区切りをハイライト
const tabs = [...document.querySelectorAll(".tabs a")];
if (tabs.length) {
  const secs = tabs.map(a => document.querySelector(a.getAttribute("href")));
  const spy = () => {
    let i = 0;
    secs.forEach((s, k) => { if (s.getBoundingClientRect().top < 160) i = k; });
    tabs.forEach((a, k) => a.classList.toggle("cur", k === i));
  };
  addEventListener("scroll", spy, { passive: true });
  spy();
}

// チップ型フィルター（実績・メンバー共通）
document.querySelectorAll("[data-filter-for]").forEach(group => {
  const items = document.querySelectorAll(group.dataset.filterFor);
  group.querySelectorAll("button").forEach(b => b.addEventListener("click", () => {
    group.querySelectorAll("button").forEach(x => x.classList.toggle("on", x === b));
    const f = b.dataset.f;
    items.forEach(el => { el.hidden = f !== "all" && !el.dataset.tags.split(" ").includes(f); });
  }));
});

// お問い合わせフォーム：通常は現行サイトと同じく Formspree へ送信する。
// 共有リンク版（data-demo 付き）だけは送信せず、完了表示に切り替える
const form = $("#contactForm");
if (form) {
  const type = location.hash.slice(1);
  if (type) { const r = document.getElementById(`t-${type}`); if (r) r.checked = true; }
  $("#f-agree").addEventListener("change", e => { $("#f-submit").disabled = !e.target.checked; });
  if (form.dataset.demo !== undefined) {
    form.addEventListener("submit", e => {
      e.preventDefault();
      $("#formBox").classList.add("sent");
    });
  }
}

// メンバー詳細モーダル（people のみ）
const modal = $("#modal");
if (modal) {
  const set = (id, v) => { document.getElementById(id).textContent = v; };
  $("#grid").addEventListener("click", e => {
    const el = e.target.closest(".mem"); if (!el) return;
    const members = JSON.parse($("#members-data")?.textContent || "[]");
    const m = members.find(x => x.id === el.dataset.id);
    $("#mPh").innerHTML = el.querySelector(".ph").innerHTML;
    $("#mPh .badge")?.remove();
    set("mRole", m.role); set("mName", m.name); set("mEn", m.en); set("mSum", m.sum);
    $("#mCareer").innerHTML = m.career.map(c => `<li>${c}</li>`).join("");
    modal.classList.add("open"); $("#mClose").focus();
  });
  const closeModal = () => modal.classList.remove("open");
  $("#mClose").onclick = closeModal;
  modal.addEventListener("click", e => { if (e.target === modal) closeModal(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });
}
