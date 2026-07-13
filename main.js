/* CITÁVEL · motion progressivo.
   Conteúdo 100% legível sem JS (estado escondido só existe sob html.js).
   Com GSAP no ar: tipografia cinética no hero, scroll-reveal com stagger,
   count-up e micro-interações. Sem GSAP: fallback IntersectionObserver. */
(function () {
  "use strict";

  document.documentElement.classList.add("js");

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Sombra/borda na nav ao rolar
  var nav = document.getElementById("nav");
  if (nav) {
    var onScroll = function () { nav.classList.toggle("scrolled", window.scrollY > 8); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  // Form do Diagnóstico Relâmpago -> pedido por e-mail + confirmação automática pro lead
  var form = document.getElementById("diag-form");
  if (form) {
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var v = function (id) { var el = document.getElementById(id); return el ? el.value.trim() : ""; };
      var btn = form.querySelector("button[type=submit]");
      btn.disabled = true;
      btn.innerHTML = "Enviando...";
      fetch("https://formsubmit.co/ajax/4437364dda850b99f7239eb14dc57dd3", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({
          _subject: "Novo pedido de Diagnóstico Relâmpago: " + v("f-empresa"),
          _template: "table",
          _captcha: "false",
          _replyto: v("f-email"),
          _autoresponse: "Recebemos seu pedido de Diagnóstico Relâmpago na CITÁVEL. Vamos rodar as 5 perguntas do seu mercado nas IAs, em sessão limpa, e o resultado chega em até 48 horas neste e-mail e no seu WhatsApp. Sem compromisso. Enquanto isso, a régua que usamos é pública: https://citavel.ai/metodo.html · Endrigo Almada, fundador",
          nome: v("f-nome"),
          empresa: v("f-empresa"),
          setor_e_cidade: v("f-setor"),
          site_ou_instagram: v("f-site"),
          whatsapp: v("f-whats"),
          email: v("f-email"),
          concorrente_referencia: v("f-concorrente") || "(não informado)"
        })
      }).then(function (r) { return r.json(); }).then(function () {
        form.innerHTML = '<div class="diag-ok"><b>Pedido recebido!</b><br>A confirmação já está a caminho do seu e-mail e o resultado chega em até 48 horas. Confere a caixa de spam se não aparecer em alguns minutos.</div>';
      }).catch(function () {
        btn.disabled = false;
        btn.innerHTML = "Tentar de novo →";
      });
    });
  }

  // Faixa de stats viva: o vídeo roda 1x ao entrar na tela; ao concluir, os números
  // acendem em cascata; depois disso o mouse "esfrega" o tempo do vídeo (rollover).
  var statsbar = document.querySelector(".statsbar");
  var statsVid = statsbar ? statsbar.querySelector(".stats-bg") : null;
  if (statsbar && statsVid) {
    var revealStats = function () {
      if (statsbar.classList.contains("revealed")) return;
      statsbar.classList.add("revealed");
      statsbar.querySelectorAll("[data-count]").forEach(function (el) {
        setTimeout(function () { animateCount(el); }, 350);
      });
    };
    if (reduce || !("IntersectionObserver" in window)) {
      revealStats();
    } else {
      new IntersectionObserver(function (es, io) {
        es.forEach(function (e) {
          if (!e.isIntersecting) return;
          io.disconnect();
          var p = statsVid.play();
          if (p && p.catch) p.catch(revealStats);
          statsVid.addEventListener("ended", revealStats, { once: true });
          setTimeout(revealStats, 7000); // rede lenta não segura os números
        });
      }, { threshold: 0.4 }).observe(statsbar);

      var rafScrub = null;
      statsbar.addEventListener("mousemove", function (ev) {
        if (!statsbar.classList.contains("revealed") || !statsVid.duration || rafScrub) return;
        rafScrub = requestAnimationFrame(function () {
          rafScrub = null;
          var r = statsbar.getBoundingClientRect();
          var x = Math.min(Math.max((ev.clientX - r.left) / r.width, 0), 1);
          statsVid.currentTime = x * (statsVid.duration - 0.05);
        });
      });
      statsbar.addEventListener("mouseleave", function () {
        if (statsbar.classList.contains("revealed") && statsVid.duration) {
          statsVid.currentTime = statsVid.duration - 0.05;
        }
      });
    }
  }

  // Autoplay resiliente dos vídeos decorativos (play ao entrar na tela, pause fora)
  document.querySelectorAll("video[autoplay]").forEach(function (v) {
    var tryPlay = function () { var pr = v.play(); if (pr && pr.catch) pr.catch(function () {}); };
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { tryPlay(); } else { v.pause(); } });
      }, { threshold: 0.1 }).observe(v);
    } else { tryPlay(); }
  });

  // Count-up dos números (valor final já está no HTML como fallback)
  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var suffix = el.getAttribute("data-suffix") || "";
    if (isNaN(target)) return;
    var dur = 1100, start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.innerHTML = '<span class="accent">' + Math.round(eased * target) + suffix + "</span>";
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  function watchCounters() {
    var counters = Array.prototype.filter.call(
      document.querySelectorAll("[data-count]"),
      function (el) { return !el.closest(".statsbar"); }
    );
    if (reduce || !("IntersectionObserver" in window)) return;
    var ioC = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { animateCount(e.target); ioC.unobserve(e.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { ioC.observe(el); });
  }

  // Fallback sem GSAP: reveal via IntersectionObserver
  function fallbackReveal() {
    var els = document.querySelectorAll(".reveal");
    if (reduce || !("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    els.forEach(function (el) { io.observe(el); });
  }

  // Motion com GSAP
  function gsapMotion() {
    gsap.registerPlugin(ScrollTrigger, SplitText);
    document.documentElement.classList.add("gsap");

    // Todos os .reveal ficam visíveis pro GSAP animar a partir do estado escondido
    document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("in"); });

    // Hero: tipografia cinética palavra a palavra
    var heroTitle = document.getElementById("hero-title");
    if (heroTitle) {
      var split = new SplitText(heroTitle, { type: "words" });
      gsap.from(split.words, {
        yPercent: 110,
        opacity: 0,
        ease: "back.out(1.4)",
        stagger: 0.045,
        duration: 0.85,
        delay: 0.1
      });
      gsap.from(".hero .eyebrow, .hero .lead, .hero .hero-micro, .hero .hero-actions", {
        y: 26, opacity: 0, ease: "power3.out", stagger: 0.12, duration: 0.9, delay: 0.45
      });
      gsap.from(".hero-visual", { y: 40, opacity: 0, ease: "power3.out", duration: 1.1, delay: 0.55 });
    }

    // Grupos com stagger: cada grid anima os filhos em cascata
    gsap.utils.toArray(".stagger-group").forEach(function (group) {
      var kids = group.querySelectorAll(".reveal, .chip, .founder-stats > div");
      var targets = kids.length ? kids : group.children;
      gsap.from(targets, {
        y: 44, opacity: 0, ease: "power3.out", stagger: 0.09, duration: 0.9,
        scrollTrigger: { trigger: group, start: "top 80%" }
      });
    });

    // Reveals soltos (fora de grupos de stagger)
    gsap.utils.toArray(".reveal").forEach(function (el) {
      if (el.closest(".stagger-group") || el.closest(".hero")) return;
      gsap.from(el, {
        y: 38, opacity: 0, ease: "power3.out", duration: 0.95,
        scrollTrigger: { trigger: el, start: "top 82%" }
      });
    });

    // Fórmula: os termos pulsam ao entrar
    var fvs = document.querySelectorAll(".formula-line .fv");
    if (fvs.length) {
      gsap.from(fvs, {
        scale: 0.6, opacity: 0, ease: "back.out(2.2)", stagger: 0.16, duration: 0.7,
        scrollTrigger: { trigger: ".formula", start: "top 78%" }
      });
    }

    // Micro-interação: cards com lift no hover
    document.querySelectorAll(".plan, .offer-card, .sector, .proof-cell").forEach(function (card) {
      card.addEventListener("mouseenter", function () {
        gsap.to(card, { y: -4, duration: 0.35, ease: "power2.out" });
      });
      card.addEventListener("mouseleave", function () {
        gsap.to(card, { y: 0, duration: 0.45, ease: "power2.out" });
      });
    });
  }

  function start() {
    if (!reduce && window.gsap && window.ScrollTrigger && window.SplitText) {
      try { gsapMotion(); } catch (err) { fallbackReveal(); }
    } else {
      fallbackReveal();
    }
    watchCounters();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
