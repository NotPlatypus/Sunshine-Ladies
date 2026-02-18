/* Sunshine Ladies Cleaning Service - script.js */
(function(){
  'use strict';

  // ===== SCROLL ANIMATIONS (IntersectionObserver) =====
  var fadeEls = document.querySelectorAll('.fade-up');
  if('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    },{threshold:0.12,rootMargin:'0px 0px -40px 0px'});
    fadeEls.forEach(function(el){io.observe(el);});
  } else {
    fadeEls.forEach(function(el){el.classList.add('visible');});
  }

  // ===== SMOOTH NAV SCROLL =====
  document.querySelectorAll('a[href^="#"]').forEach(function(link){
    link.addEventListener('click',function(e){
      var href = this.getAttribute('href');
      if(href === '#') return;
      var target = document.querySelector(href);
      if(target){
        e.preventDefault();
        var navH = document.querySelector('.nav') ? document.querySelector('.nav').offsetHeight : 68;
        var y = target.getBoundingClientRect().top + window.pageYOffset - navH - 8;
        window.scrollTo({top:y,behavior:'smooth'});
      }
    });
  });

  // ===== iOS TOUCH DELAY FIX =====
  document.addEventListener('touchstart',function(){},true);

  // ===== STICKY FLOAT CALL: hide near footer =====
  var floatCall = document.querySelector('.float-call');
  var footer = document.querySelector('footer');
  if(floatCall && footer && 'IntersectionObserver' in window){
    var footerIO = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        floatCall.style.opacity = entry.isIntersecting ? '0' : '1';
        floatCall.style.pointerEvents = entry.isIntersecting ? 'none' : 'auto';
      });
    },{threshold:0.1});
    footerIO.observe(footer);
  }

  // ===== ANIMATE REVIEWS SCORE =====
  var scoreEl = document.querySelector('.score-num');
  if(scoreEl && 'IntersectionObserver' in window){
    var scored = false;
    var scoreIO = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting && !scored){
          scored = true;
          var start = null;
          var duration = 900;
          function step(ts){
            if(!start) start = ts;
            var prog = Math.min((ts - start) / duration, 1);
            scoreEl.textContent = (prog * 4.8).toFixed(1);
            if(prog < 1) requestAnimationFrame(step);
            else scoreEl.textContent = '4.8';
          }
          requestAnimationFrame(step);
          scoreIO.unobserve(entry.target);
        }
      });
    },{threshold:0.5});
    scoreIO.observe(scoreEl);
  }

})();

/* ===== LIGHTBOX (shared by index + gallery) ===== */
var LB = (function(){
  var images = [];
  var current = 0;
  var lb, lbImg, lbCaption, lbCounter;

  function init(){
    lb = document.getElementById('lightbox');
    lbImg = document.getElementById('lb-img');
    lbCaption = document.getElementById('lb-caption');
    lbCounter = document.getElementById('lb-counter');
    if(!lb) return;

    // Collect images from gallery buttons (index) or gallery items (gallery page)
    var btns = document.querySelectorAll('.gp-btn, .gfull-btn');
    btns.forEach(function(btn,i){
      var img = btn.querySelector('img');
      if(img) images.push({src:img.src, alt:img.alt});
      btn.setAttribute('data-lb-index', i);
    });

    // Keyboard navigation
    document.addEventListener('keydown', function(e){
      if(!lb.classList.contains('open')) return;
      if(e.key === 'ArrowLeft') navigate(-1);
      else if(e.key === 'ArrowRight') navigate(1);
      else if(e.key === 'Escape') close();
    });

    // Touch swipe
    var touchStartX = 0;
    lb.addEventListener('touchstart', function(e){ touchStartX = e.touches[0].clientX; }, {passive:true});
    lb.addEventListener('touchend', function(e){
      var diff = touchStartX - e.changedTouches[0].clientX;
      if(Math.abs(diff) > 50) navigate(diff > 0 ? 1 : -1);
    }, {passive:true});
  }

  function open(index){
    if(!lb) init();
    current = index;
    updateImg(false);
    lb.classList.add('open');
    lb.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
    zoomed = false;
    if(lbImg) lbImg.style.transform = '';
    var closeBtn = lb.querySelector('.lb-close');
    if(closeBtn) setTimeout(function(){ closeBtn.focus(); }, 50);
  }

  function close(){
    if(!lb) return;
    lb.classList.remove('open');
    lb.setAttribute('aria-hidden','true');
    document.body.style.overflow = '';
  }

  // Toggle zoom on image click
  var zoomed = false;
  if(lbImg){
    lbImg.style.cursor = 'zoom-in';
    lbImg.style.transition = 'transform .3s ease, opacity .3s ease';
    lbImg.addEventListener('click', function(e){
      e.stopPropagation();
      zoomed = !zoomed;
      lbImg.style.transform = zoomed ? 'scale(1.75)' : '';
      lbImg.style.cursor = zoomed ? 'zoom-out' : 'zoom-in';
    });
  }

  function navigate(dir){
    zoomed = false;
    if(lbImg) lbImg.style.transform = '';
    current = (current + dir + images.length) % images.length;
    updateImg(true);
  }

  function updateImg(animate){
    if(!lbImg) return;
    if(animate){
      lbImg.classList.add('switching');
      setTimeout(function(){
        lbImg.src = images[current].src;
        lbImg.alt = images[current].alt;
        lbImg.classList.remove('switching');
      }, 200);
    } else {
      lbImg.src = images[current].src;
      lbImg.alt = images[current].alt;
    }
    if(lbCaption) lbCaption.textContent = images[current].alt || '';
    if(lbCounter) lbCounter.textContent = (current + 1) + ' / ' + images.length;

    // Show/hide arrows
    var prev = lb.querySelector('.lb-prev');
    var next = lb.querySelector('.lb-next');
    if(prev) prev.style.display = images.length > 1 ? '' : 'none';
    if(next) next.style.display = images.length > 1 ? '' : 'none';
  }

  return { open: open, close: close, navigate: navigate };
})();

// Global functions called from HTML onclick
function openLightbox(i){ LB.open(i); }
function closeLightbox(){ LB.close(); }
function lbNav(dir){ LB.navigate(dir); }