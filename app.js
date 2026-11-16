/* app.js - page scripts, in original document order (were inline <script> blocks #2-#10). */

/* ===== original inline <script> #2 (document order) ===== */

  (function(){
    var player=document.getElementById('mainPlaylistPlayer');
    if(!player) return;
    var now=document.getElementById('playlistNow');
    var queue=[];
    var items=document.querySelectorAll('#videos .video-grid .video-item');
    Array.prototype.forEach.call(items,function(item){
      var frame=item.querySelector('iframe[src*="youtube.com/embed/"]');
      if(!frame) return;
      var match=(frame.getAttribute('src')||'').match(/embed\/([\w-]{6,})/);
      if(!match) return;
      var id=match[1];
      var titleEl=item.querySelector('.video-item-meta h4');
      var title=titleEl?titleEl.textContent.replace(/\s+/g,' ').trim():'';
      queue.push({id:id,title:title});
      var meta=item.querySelector('.video-item-meta > div');
      if(!meta) return;
      var btn=document.createElement('button');
      btn.type='button';
      btn.className='play-in-main';
      btn.innerHTML='<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg> Play in playlist player';
      btn.addEventListener('click',function(){
        var idx=-1;
        for(var i=0;i<queue.length;i++){ if(queue[i].id===id){ idx=i; break; } }
        if(idx<0) return;
        var rest=queue.slice(idx+1).concat(queue.slice(0,idx)).map(function(q){return q.id;});
        player.src='https://www.youtube.com/embed/'+id+'?playlist='+[id].concat(rest).join(',')+'&rel=0&autoplay=1';
        if(now&&title) now.textContent='Now in the player: '+title+'.';
        var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        player.scrollIntoView({behavior:reduce?'auto':'smooth',block:'center'});
      });
      meta.appendChild(btn);
    });
  })();
  
;

/* ===== original inline <script> #3 (document order) ===== */

  document.getElementById('yr').textContent = new Date().getFullYear();

  // Count-up for real stats — animates to the true final numbers when visible
  (function(){
    var counters = document.querySelectorAll('.count[data-target]');
    if(!counters.length) return;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function animate(el){
      var target = parseInt(el.getAttribute('data-target'), 10) || 0;
      if(reduce || !target){ el.textContent = target; return; }
      // Pure enhancement: start from a high floor so "0" is never displayed.
      // HTML already contains the real final value; this only adds motion
      // and always ends exactly on the target.
      var from = Math.max(1, Math.floor(target * 0.65));
      var dur = 900, start = null;
      el.textContent = from;
      function step(ts){
        if(!start) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        // ease-out
        var eased = 1 - Math.pow(1 - p, 3);
        var val = Math.round(from + eased * (target - from));
        el.textContent = Math.max(from, val);
        if(p < 1) requestAnimationFrame(step);
        else el.textContent = target;
      }
      requestAnimationFrame(step);
    }
    if('IntersectionObserver' in window){
      var seen = new WeakSet();
      var io = new IntersectionObserver(function(entries){
        entries.forEach(function(e){
          if(e.isIntersecting && !seen.has(e.target)){ seen.add(e.target); animate(e.target); io.unobserve(e.target); }
        });
      }, {threshold: 0.4});
      counters.forEach(function(c){ io.observe(c); });
    } else {
      counters.forEach(animate);
    }
  })();

  // Installable app — the Get the App section gives the Add to Home Screen
  // steps for Android/Chrome and iPhone/Safari. When the site is already
  // running as the installed app, confirm it in that section.
  (function(){
    var done = document.getElementById('installedMsg');
    if(!done) return;
    var standalone = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true;
    if(standalone) done.classList.add('show');
    window.addEventListener('appinstalled', function(){ done.classList.add('show'); });
  })();

  // Sticky background player — "We Argue" on Spotify
  // (track 5DGuSnzXoF4zKx7BxLbrvk, single 2opK5c74vhfs8umuikh0oD).
  // Same bar, same spot as before: cover thumbnail, title and the gold
  // play/pause button — no caption or status text on the bar. Starts
  // paused: browsers block autoplay with sound, so playback only begins
  // on the visitor's tap. The Spotify embed lives tucked inside the
  // bar's thumbnail slot, hidden behind the cover art, so the audio
  // keeps playing in the background while the visitor scrolls the whole
  // page. Play/pause is sent to that embed via the Spotify IFrame API;
  // if that API cannot load, a plain Spotify embed for the same track
  // is inserted into the same slot and revealed in the thumbnail.
  (function(){
    var bar = document.getElementById('stickyPlayer');
    var btn = document.getElementById('spToggle');
    var slot = document.getElementById('spSpotifySlot');
    var thumb = document.getElementById('spThumb');
    if(!bar || !btn || !slot) return;
    var TRACK_URI = 'spotify:track:5DGuSnzXoF4zKx7BxLbrvk';
    var EMBED_SRC = 'https://open.spotify.com/embed/track/5DGuSnzXoF4zKx7BxLbrvk?utm_source=generator&theme=0';
    var controller = null;
    var controllerReady = false;
    var wantPlay = false;
    var fallbackUsed = false;
    var playing = false;

    function setUI(){
      bar.classList.toggle('is-playing', playing);
      btn.setAttribute('aria-pressed', playing ? 'true' : 'false');
      btn.setAttribute('aria-label', playing
        ? 'Pause We Argue by Fort Worth Pac featuring Beauty'
        : 'Play We Argue by Fort Worth Pac featuring Beauty');
    }
    function useFallbackEmbed(){
      if(fallbackUsed || controllerReady) return;
      fallbackUsed = true;
      var iframe = document.createElement('iframe');
      iframe.title = 'Fort Worth Pac — We Argue ft. Beauty on Spotify';
      iframe.src = EMBED_SRC;
      iframe.allow = 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';
      iframe.setAttribute('allowfullscreen', '');
      iframe.loading = 'lazy';
      slot.appendChild(iframe);
      // Reveal the embed in the thumbnail slot so its own play button
      // can be tapped; the bar's layout, title and button stay as-is.
      if(thumb) thumb.classList.add('is-playing');
    }
    function createController(IFrameAPI){
      var holder = document.createElement('div');
      holder.setAttribute('aria-hidden', 'true');
      slot.appendChild(holder);
      IFrameAPI.createController(holder, { width: '100%', height: '100%', uri: TRACK_URI }, function(ctrl){
        controller = ctrl;
        ctrl.addListener('ready', function(){
          controllerReady = true;
          if(wantPlay && controller){ controller.play(); }
        });
        ctrl.addListener('playback_update', function(e){
          if(e && e.data && typeof e.data.isPaused === 'boolean'){
            playing = !e.data.isPaused;
            setUI();
          }
        });
      });
    }
    // Load the Spotify IFrame API and build the (silent, paused)
    // controller up front so the first tap on the button plays at once.
    if(window.onSpotifyIframeApiReady){
      var prevReady = window.onSpotifyIframeApiReady;
      window.onSpotifyIframeApiReady = function(IFrameAPI){
        prevReady(IFrameAPI);
        createController(IFrameAPI);
      };
    } else {
      window.onSpotifyIframeApiReady = function(IFrameAPI){ createController(IFrameAPI); };
    }
    var apiScript = document.createElement('script');
    apiScript.src = 'https://open.spotify.com/embed/iframe-api/v1';
    apiScript.async = true;
    apiScript.onerror = function(){ if(wantPlay) useFallbackEmbed(); };
    document.head.appendChild(apiScript);

    btn.addEventListener('click', function(){
      if(fallbackUsed) return;
      if(controllerReady && controller){
        if(playing){ controller.pause(); playing = false; }
        else { controller.play(); playing = true; }
        setUI();
        return;
      }
      // Controller still loading: remember the tap and play as soon as
      // it is ready; if the API never arrives, fall back to the plain
      // Spotify embed for the same track in the same slot.
      wantPlay = !wantPlay;
      playing = wantPlay;
      setUI();
      if(wantPlay){
        setTimeout(function(){
          if(!controllerReady && wantPlay) useFallbackEmbed();
        }, 4000);
      }
    });
  })();

  // Countdown — "We Argue" ft. Beauty, all-platforms release:
  // November 10, 2026, 00:00 America/Chicago (CST = UTC-6 in November).
  (function(){
    var box = document.getElementById('countdown');
    if(!box) return;
    var target = Date.UTC(2026, 10, 10, 6, 0, 0);
    var dEl = document.getElementById('cdDays'), hEl = document.getElementById('cdHours'),
        mEl = document.getElementById('cdMins'), sEl = document.getElementById('cdSecs'),
        title = document.getElementById('countdownTitle'), sub = document.getElementById('countdownSub');
    var timer = null;
    function pad(n){ return (n < 10 ? '0' : '') + n; }
    function tick(){
      var diff = target - Date.now();
      if(diff <= 0){
        box.classList.add('is-live');
        if(title) title.innerHTML = 'We Argue — <span>OUT NOW</span> on all platforms';
        if(sub) sub.textContent = '“We Argue” ft. Beauty is live everywhere — Spotify, Apple Music, Pandora & more. Run it up.';
        box.setAttribute('aria-label', 'We Argue is out now on all platforms');
        if(timer) clearInterval(timer);
        return;
      }
      var d = Math.floor(diff / 86400000);
      var h = Math.floor(diff % 86400000 / 3600000);
      var m = Math.floor(diff % 3600000 / 60000);
      var s = Math.floor(diff % 60000 / 1000);
      if(dEl) dEl.textContent = d;
      if(hEl) hEl.textContent = pad(h);
      if(mEl) mEl.textContent = pad(m);
      if(sEl) sEl.textContent = pad(s);
    }
    tick();
    timer = setInterval(tick, 1000);
  })();

  // Hazel lightbox — tapping Hazel's portrait in Meet the Cast opens her
  // 43-second MoPlicity video with sound and controls; closing it pauses
  // the video and returns the visitor to the cast row.
  (function(){
    var box = document.getElementById('hazelLightbox');
    var video = document.getElementById('hazelLightboxVideo');
    var openers = document.querySelectorAll('[data-hazel-open]');
    if(!box || !video || !openers.length) return;
    var lastFocus = null;
    function open(){
      lastFocus = document.activeElement;
      box.hidden = false;
      document.body.style.overflow = 'hidden';
      var closeBtn = box.querySelector('[data-hazel-close].hazel-lightbox-close') || box.querySelector('.hazel-lightbox-close');
      if(closeBtn) closeBtn.focus();
      var p = video.play();
      if(p && p.catch) p.catch(function(){ /* controls stay available for a manual tap */ });
    }
    function close(){
      video.pause();
      box.hidden = true;
      document.body.style.overflow = '';
      if(lastFocus && lastFocus.focus) lastFocus.focus();
    }
    openers.forEach(function(btn){ btn.addEventListener('click', open); });
    box.querySelectorAll('[data-hazel-close]').forEach(function(el){ el.addEventListener('click', close); });
    document.addEventListener('keydown', function(e){
      if(e.key === 'Escape' && !box.hidden) close();
    });
  })();

  // Purse 360 lightbox — tapping any purse picture (MoDiamond page
  // section or the dedicated MD Purse Collection page) opens that bag's
  // 360° spin video with sound off by default browser rules, controls
  // on, looping; the Limited Edition ribbon stays on the video frame.
  // Closing pauses the spin and returns the visitor to the picture.
  (function(){
    var box = document.getElementById('purseLightbox');
    var video = document.getElementById('purseLightboxVideo');
    var titleEl = document.getElementById('purseLightboxTitle');
    var openers = document.querySelectorAll('[data-purse-open]');
    if(!box || !video || !openers.length) return;
    var lastFocus = null;
    function openPurse(btn){
      lastFocus = btn;
      var src = btn.getAttribute('data-purse-video');
      var poster = btn.getAttribute('data-purse-poster');
      var name = btn.getAttribute('data-purse-title') || 'MoDiamond Purse';
      if(titleEl) titleEl.innerHTML = name + ' <span>— 360° View</span>';
      if(src && video.getAttribute('src') !== src) video.src = src;
      if(poster) video.poster = poster;
      video.setAttribute('title', name + ' — MoDiamond 360 degree spin view');
      box.hidden = false;
      document.body.style.overflow = 'hidden';
      var closeBtn = box.querySelector('.purse-lightbox-close');
      if(closeBtn) closeBtn.focus();
      var p = video.play();
      if(p && p.catch) p.catch(function(){ /* controls stay available for a manual tap */ });
    }
    function closePurse(){
      video.pause();
      box.hidden = true;
      document.body.style.overflow = '';
      if(lastFocus && lastFocus.focus) lastFocus.focus();
    }
    openers.forEach(function(btn){ btn.addEventListener('click', function(){ openPurse(btn); }); });
    box.querySelectorAll('[data-purse-close]').forEach(function(el){ el.addEventListener('click', closePurse); });
    document.addEventListener('keydown', function(e){
      if(e.key === 'Escape' && !box.hidden) closePurse();
    });
  })();

  // Copy helper — used by the share rows, the PAC List signup, the merch
  // checkout and the booking form to hand the visitor a ready-to-send text.
  function pacCopyText(text, done){
    function fallback(){
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch(e){ ok = false; }
      ta.remove();
      if(done) done(ok);
    }
    if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(text).then(function(){ if(done) done(true); }, fallback);
    } else { fallback(); }
  }

  // Share buttons — share the site's public address (fortworthpac.com),
  // or the row's own link when a row carries one (the MoPlicity row
  // shares straight to the MoPlicity section). WhatsApp / X / Facebook
  // open their own composers; Instagram and TikTok have no web composer,
  // so they use the device share sheet when there is one and otherwise
  // copy the link with a note to paste it in the app.
  (function(){
    var rows = document.querySelectorAll('[data-share-row]');
    if(!rows.length) return;
    var defaultText = 'Fort Worth Pac — official music site. Listen, watch & follow @fortworthpac.';
    rows.forEach(function(row){
      var status = row.querySelector('[data-share-status]');
      function say(msg){ if(status){ status.textContent = msg; setTimeout(function(){ status.textContent=''; }, 4000); } }
      var url = row.getAttribute('data-share-url') || 'https://fortworthpac.com/';
      var shareText = row.getAttribute('data-share-text') || defaultText;
      row.querySelectorAll('[data-share]').forEach(function(btn){
        btn.addEventListener('click', function(){
          var kind = btn.getAttribute('data-share');
          var target = '';
          if(kind === 'whatsapp') target = 'https://wa.me/?text=' + encodeURIComponent(shareText + ' ' + url);
          else if(kind === 'x') target = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(shareText) + '&url=' + encodeURIComponent(url);
          else if(kind === 'facebook') target = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url);
          if(target){ window.open(target, '_blank', 'noopener,width=640,height=560'); return; }
          if(kind === 'instagram' || kind === 'tiktok'){
            var appName = kind === 'instagram' ? 'Instagram' : 'TikTok';
            if(navigator.share){
              navigator.share({ title: 'Fort Worth Pac', text: shareText, url: url }).catch(function(){ /* share sheet closed — nothing to do */ });
            } else {
              pacCopyText(url, function(ok){ say(ok ? 'Link copied — paste it in ' + appName + ' to share.' : url); });
            }
            return;
          }
        });
      });
    });
  })();

  // View counter removed for this publish at Fort's direction
  // (2026-11-14) so the new merch store can go live. The Abacus
  // totals under the "fortworthpac" namespace stay saved on the
  // counter service — nothing is deleted. The Abacus widget itself
  // stays off the page for good. (The visit-logging hookup to the
  // Fort Worth Pac Admin app that briefly sat here was taken back
  // out on 2026-11-14 at Fort's direction: Muse sharing refused to
  // publish the build with it in, so the site ships clean and the
  // admin app carries on standalone.)

  // PAC List — the fan email list. The form checks the name and email,
  // builds the signup as one ready-to-send message, copies it, and opens
  // Pac's Instagram so the fan sends it to him; that message is what puts
  // their email on the list he sends new-music and MoPlicity drops to.
  (function(){
    var form = document.getElementById('pacListForm');
    if(!form) return;
    var nameEl = document.getElementById('pacName');
    var emailEl = document.getElementById('pacEmail');
    var interestEl = document.getElementById('pacInterest');
    var status = document.getElementById('pacListStatus');
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var name = nameEl.value.trim();
      var email = emailEl.value.trim();
      if(!name){ status.textContent = 'Add your name first.'; nameEl.focus(); return; }
      if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){ status.textContent = 'Add a valid email — that is the address Pac sends the drops to.'; emailEl.focus(); return; }
      var msg = 'PAC LIST SIGNUP — from fortworthpac.com\nName: ' + name + '\nEmail: ' + email + '\nI want to hear about: ' + interestEl.value + '\nPut me on the list for new music and MoPlicity drops.';
      pacCopyText(msg, function(ok){
        status.textContent = ok
          ? 'You’re almost in — your signup was copied. Paste it into Pac’s Instagram DMs and you’re on the PAC List.'
          : 'You’re almost in — send Pac a DM on Instagram with your name and this email to join the PAC List.';
        window.open('https://www.instagram.com/FortWorthPac', '_blank', 'noopener');
      });
    });
  })();

  // Merch checkout — tapping Buy Now copies the order (item, size and
  // price) so the fan can paste it into the Cash App payment note, then
  // follows the button through to Cash App with the price filled in.
  (function(){
    var status = document.getElementById('checkoutStatus');
    document.querySelectorAll('.merch-buy').forEach(function(btn){
      btn.addEventListener('click', function(){
        var card = btn.closest('.merch-card');
        var sizeEl = card ? card.querySelector('[data-merch-size]') : null;
        var item = btn.getAttribute('data-item') || 'Merch';
        var price = btn.getAttribute('data-price') || '';
        var size = sizeEl ? sizeEl.value : '';
        var sizeLabel = sizeEl ? (sizeEl.getAttribute('data-order-label') || 'Size') : '';
        var order = 'ORDER — fortworthpac.com\nItem: ' + item + (price ? ' (' + price + ')' : '') + (size ? '\n' + sizeLabel + ': ' + size : '') + '\nPaying on Cash App: $FortWorthPac';
        pacCopyText(order, function(){});
        if(status) status.textContent = 'Opening Cash App for the ' + item + (price ? ' — ' + price : '') + '. Your order details were copied — paste them into the payment note.';
      });
    });
  })();

  // New-drop front/back views — the Front/Back buttons on a merch card
  // swap the product photo between the approved front and back shots.
  (function(){
    document.querySelectorAll('.merch-flip').forEach(function(group){
      var visual = group.closest('.merch-visual');
      var img = visual ? visual.querySelector('img') : null;
      if(!img) return;
      group.querySelectorAll('.merch-flip-btn').forEach(function(btn){
        btn.addEventListener('click', function(){
          var view = btn.getAttribute('data-view');
          var src = view === 'back' ? img.getAttribute('data-back') : img.getAttribute('data-front');
          var alt = view === 'back' ? img.getAttribute('data-alt-back') : img.getAttribute('data-alt-front');
          if(src) img.src = src;
          if(alt) img.alt = alt;
          group.querySelectorAll('.merch-flip-btn').forEach(function(b){
            var on = b === btn;
            b.classList.toggle('is-active', on);
            b.setAttribute('aria-pressed', on ? 'true' : 'false');
          });
        });
      });
    });
  })();

  // ThugHouse colorways — tapping a color swatch on a ThugHouse card
  // swaps the product photo to that colorway and names it.
  (function(){
    document.querySelectorAll('[data-th-card]').forEach(function(card){
      var img = card.querySelector('[data-th-img]');
      var nameOut = card.querySelector('[data-th-name-out]');
      if(!img) return;
      card.querySelectorAll('.th-swatch').forEach(function(sw){
        sw.addEventListener('click', function(){
          var src = sw.getAttribute('data-th-src');
          var alt = sw.getAttribute('data-th-alt');
          if(src) img.src = src;
          if(alt) img.alt = alt;
          if(nameOut) nameOut.textContent = sw.getAttribute('data-th-name') || '';
          card.querySelectorAll('.th-swatch').forEach(function(b){
            var on = b === sw;
            b.classList.toggle('is-active', on);
            b.setAttribute('aria-pressed', on ? 'true' : 'false');
          });
        });
      });
    });
  })();

  // Contact / booking form — builds the whole inquiry as one message,
  // copies it, and opens Pac's Instagram so it reaches him complete with
  // the sender's contact info for a reply.
  (function(){
    var form = document.getElementById('bookingForm');
    if(!form) return;
    var nameEl = document.getElementById('bkName');
    var contactEl = document.getElementById('bkContact');
    var typeEl = document.getElementById('bkType');
    var whenEl = document.getElementById('bkWhen');
    var msgEl = document.getElementById('bkMsg');
    var status = document.getElementById('bookingStatus');
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var name = nameEl.value.trim();
      var contact = contactEl.value.trim();
      var msg = msgEl.value.trim();
      if(!name){ status.textContent = 'Add your name first.'; nameEl.focus(); return; }
      if(!contact){ status.textContent = 'Add your email or phone so Pac can reply.'; contactEl.focus(); return; }
      if(!msg){ status.textContent = 'Write your message first — what do you need Pac for?'; msgEl.focus(); return; }
      var full = 'BOOKING / CONTACT — from fortworthpac.com\nName: ' + name + '\nContact: ' + contact + '\nAbout: ' + typeEl.value + (whenEl.value.trim() ? '\nDate & city: ' + whenEl.value.trim() : '') + '\nMessage: ' + msg;
      pacCopyText(full, function(ok){
        status.textContent = ok
          ? 'Your message was copied, complete with your contact info. Paste it into Pac’s Instagram DMs to send it.'
          : 'Send Pac a DM on Instagram with your message and your contact info — he’ll take it from there.';
        window.open('https://www.instagram.com/FortWorthPac', '_blank', 'noopener');
      });
    });
  })();

  // Drop alerts — notification opt-in for this device. The button asks
  // the browser for notification permission and always shows the real
  // state: on, off, blocked, or not supported by this browser.
  (function(){
    var btn = document.getElementById('pushBtn');
    var status = document.getElementById('pushStatus');
    if(!btn || !status) return;
    if(!('Notification' in window)){
      btn.disabled = true;
      btn.textContent = 'Drop Alerts Not Supported Here';
      status.textContent = 'This browser doesn’t support notifications — join the PAC List and follow @fortworthpac so you never miss a drop.';
      return;
    }
    function showState(){
      if(Notification.permission === 'granted'){
        btn.textContent = 'Drop Alerts: On';
        status.textContent = 'Drop alerts are on for this device — you’re opted in.';
      } else if(Notification.permission === 'denied'){
        btn.textContent = 'Drop Alerts: Blocked';
        status.textContent = 'Notifications are blocked for this site in your browser settings. Allow them there, then tap again.';
      }
    }
    showState();
    btn.addEventListener('click', function(){
      if(Notification.permission === 'granted'){ showState(); return; }
      try {
        var p = Notification.requestPermission(function(){ showState(); });
        if(p && p.then) p.then(showState).catch(function(){});
      } catch(e){
        status.textContent = 'This browser couldn’t open the notification prompt — join the PAC List so you don’t miss a drop.';
      }
    });
  })();

  // MoPlicity Comments — posting adds the comment to the conversation
  // in this visit (built with text nodes so visitor text is never
  // treated as markup); the Instagram button in the form is how the
  // same comment reaches Pac to keep.
  (function(){
    var form = document.getElementById('mopcForm');
    var list = document.getElementById('mopcList');
    var empty = document.getElementById('mopcEmpty');
    var countEl = document.getElementById('mopcCount');
    var status = document.getElementById('mopcStatus');
    var nameEl = document.getElementById('mopcName');
    var topicEl = document.getElementById('mopcTopic');
    var textEl = document.getElementById('mopcText');
    if(!form || !list || !nameEl || !topicEl || !textEl) return;
    var count = 0;
    function updateCount(){
      if(countEl) countEl.textContent = count + (count === 1 ? ' comment' : ' comments');
    }
    // Discussion prompts drop their question into the comment box.
    document.querySelectorAll('[data-mopc-prompt]').forEach(function(btn){
      btn.addEventListener('click', function(){
        var q = btn.getAttribute('data-mopc-prompt') || '';
        if(!textEl.value.trim()) textEl.value = q;
        else if(textEl.value.indexOf(q.trim()) === -1) textEl.value = textEl.value.replace(/\s+$/, '') + ' ' + q;
        textEl.focus();
        textEl.setSelectionRange(textEl.value.length, textEl.value.length);
      });
    });
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var name = nameEl.value.trim();
      var topic = topicEl.value || 'The Series';
      var text = textEl.value.trim();
      if(!name || !text){
        if(status) status.textContent = !name && !text ? 'Add your name and your comment first.' : (!name ? 'Add your name first.' : 'Write your comment first.');
        (!name ? nameEl : textEl).focus();
        return;
      }
      if(empty) empty.remove();
      var card = document.createElement('article');
      card.className = 'mopc-comment';
      var top = document.createElement('div');
      top.className = 'mopc-comment-top';
      var avatar = document.createElement('span');
      avatar.className = 'mopc-avatar';
      avatar.setAttribute('aria-hidden', 'true');
      avatar.textContent = name.charAt(0) || 'M';
      var meta = document.createElement('div');
      meta.className = 'mopc-meta';
      var b = document.createElement('b');
      b.textContent = name;
      var small = document.createElement('small');
      small.textContent = 'Just now • MoPlicity';
      meta.appendChild(b);
      meta.appendChild(small);
      var badge = document.createElement('span');
      badge.className = 'mopc-topic';
      badge.textContent = topic;
      top.appendChild(avatar);
      top.appendChild(meta);
      top.appendChild(badge);
      var body = document.createElement('p');
      body.className = 'mopc-text';
      body.textContent = text;
      var like = document.createElement('button');
      like.type = 'button';
      like.className = 'mopc-like';
      like.setAttribute('aria-pressed', 'false');
      var likes = 0;
      like.textContent = '♥ Love it · 0';
      like.addEventListener('click', function(){
        var on = like.classList.toggle('is-liked');
        likes += on ? 1 : -1;
        if(likes < 0) likes = 0;
        like.setAttribute('aria-pressed', on ? 'true' : 'false');
        like.textContent = '♥ Love it · ' + likes;
      });
      card.appendChild(top);
      card.appendChild(body);
      card.appendChild(like);
      list.insertBefore(card, list.firstChild);
      count += 1;
      updateCount();
      if(status) status.textContent = 'You’re in — your comment is at the top of the conversation. Send it to Pac on Instagram to make it stick.';
      textEl.value = '';
      card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  })();


;

/* ===== original inline <script> #4 (document order) ===== */

  // MoPlicity Merch page — the top-nav "MoPlicity Merch" link opens a
  // dedicated merch-only page (route #merch) instead of jumping down
  // the homepage: the homepage <main id="top"> is swapped out for the
  // merch page block, with the site header, footer and sticky player
  // left in place, and a Back to Home link on the page returns here.
  // Any other route shows the homepage again, exactly as before — the
  // in-page #moplicity-merch section stays put as the fallback, and
  // the direct-link landing script below ignores #merch (no element
  // carries that id), so the two never fight.
  //
  // Why a direct visit to fortworthpac.com/#merch used to land on the
  // homepage hero: the first version of this router read ONLY this
  // document's own location.hash. On the live site the custom domain
  // 302-redirects to the hosted share page, which runs this page
  // inside a frame — so the #merch the visitor opened with sits on
  // the FRAMING page's address, this document's own hash stays empty,
  // and the router never fired. The fix reads the route from every
  // channel the fragment can arrive through, in this order:
  //   1. this document's own hash (in-page nav clicks, and any visit
  //      where the fragment does reach this document directly);
  //   2. a fragment handed down by the framing page in a message;
  //   3. the parent / top window's hash, when same-origin readable;
  //   4. the opening fragment captured in <head> (window.__fwOpenHash).
  // A non-empty own hash always wins, so once the visitor navigates
  // inside the page (Back to Home → #top, Music → #music, …) a stale
  // opening or outer #merch can never trap them on the merch page.
  // The route is also re-checked on a poll for the first minute, so
  // an outer fragment that only appears after this document loads
  // (redirect chain, shell setting its address late) is still caught.
  (function(){
    var page = document.getElementById('merch-page');
    var home = document.getElementById('top');
    if(!page || !home) return;
    var homeTitle = document.title;
    var onMerch = false;
    var msgHash = '';

    function hashFromString(s){
      if(!s || typeof s !== 'string') return '';
      var i = s.indexOf('#');
      if(i === -1) return '';
      var h = s.slice(i);
      return h.length > 1 ? h : '';
    }
    function framedHash(){
      try {
        if (window.parent && window.parent !== window && window.parent.location.hash) return window.parent.location.hash;
      } catch(e){ /* cross-origin host — its address is not readable */ }
      try {
        if (window.top && window.top !== window && window.top.location.hash) return window.top.location.hash;
      } catch(e){ /* cross-origin host — its address is not readable */ }
      return '';
    }
    function effectiveHash(){
      var own = window.location.hash || '';
      if(own) return own;
      if(msgHash) return msgHash;
      var framed = framedHash();
      if(framed) return framed;
      return window.__fwOpenHash || '';
    }

    function toTop(){
      var root = document.documentElement;
      var prev = root.style.scrollBehavior;
      root.style.scrollBehavior = 'auto';
      window.scrollTo(0, 0);
      root.style.scrollBehavior = prev;
    }
    function route(){
      var isMerch = effectiveHash() === '#merch';
      if(isMerch && !onMerch){
        // Park anything playing on the homepage while the merch
        // page is up.
        home.querySelectorAll('video, audio').forEach(function(m){
          try { m.pause(); } catch(e){ /* not playing */ }
        });
        home.hidden = true;
        page.hidden = false;
        document.documentElement.classList.add('fw-merch-route');
        document.title = 'MoPlicity Merch — Fort Worth Pac';
        onMerch = true;
        toTop();
      } else if(!isMerch && onMerch){
        page.hidden = true;
        home.hidden = false;
        document.documentElement.classList.remove('fw-merch-route');
        document.title = homeTitle;
        onMerch = false;
      }
      // No "already on merch" branch: route() re-runs on the poll
      // below, and scrolling the visitor back to the top on every
      // tick would fight them while they browse the merch page.
    }

    // A framing page can hand the fragment down in a message; accept
    // one only when it actually carries a fragment.
    window.addEventListener('message', function(ev){
      if(window.parent === window) return;
      var d = ev.data, s = '';
      if(typeof d === 'string') s = d;
      else if(d && typeof d === 'object') s = d.hash || d.fragment || d.url || d.href || '';
      var h = hashFromString(s);
      if(h){ msgHash = h; route(); }
    });

    window.addEventListener('hashchange', route);
    route();

    // Poll every channel for the first minute: catches a #merch that
    // shows up late on the framing page's address.
    var pollStart = Date.now();
    var poller = setInterval(function(){
      if(Date.now() - pollStart > 60000){ clearInterval(poller); return; }
      route();
    }, 250);
  })();

;

/* ===== original inline <script> #5 (document order) ===== */

  // MoDiamond page — the top-nav "MoDiamond" link and the homepage
  // spotlight open MoDiamond's own dedicated page (route #modiamond)
  // instead of a section jump: the homepage <main id="top"> is swapped
  // out for the MoDiamond page block, with the site header, footer and
  // sticky player left in place, and a Back to Home link returns here.
  // Mirrors the #merch router above and reads the route from the same
  // channels (own hash, framed hash, framing-page message, and the
  // opening fragment captured in <head>), so a direct visit to
  // fortworthpac.com/#modiamond lands on her page. No element carries
  // the id "modiamond", so the direct-link landing script below
  // ignores this route and the two never fight. The two routers also
  // compose: each only ever shows its own page or hands the homepage
  // back, so #merch → #modiamond → #top all land right.
  (function(){
    var page = document.getElementById('modiamond-page');
    var home = document.getElementById('top');
    if(!page || !home) return;
    var homeTitle = 'Fort Worth Pac — Official Music Site | Fort Worth, TX Hip-Hop';
    var onDiamond = false;
    var msgHash = '';

    function hashFromString(s){
      if(!s || typeof s !== 'string') return '';
      var i = s.indexOf('#');
      if(i === -1) return '';
      var h = s.slice(i);
      return h.length > 1 ? h : '';
    }
    function framedHash(){
      try {
        if (window.parent && window.parent !== window && window.parent.location.hash) return window.parent.location.hash;
      } catch(e){ /* cross-origin host — its address is not readable */ }
      try {
        if (window.top && window.top !== window && window.top.location.hash) return window.top.location.hash;
      } catch(e){ /* cross-origin host — its address is not readable */ }
      return '';
    }
    function effectiveHash(){
      var own = window.location.hash || '';
      if(own) return own;
      if(msgHash) return msgHash;
      var framed = framedHash();
      if(framed) return framed;
      return window.__fwOpenHash || '';
    }
    function toTop(){
      var root = document.documentElement;
      var prev = root.style.scrollBehavior;
      root.style.scrollBehavior = 'auto';
      window.scrollTo(0, 0);
      root.style.scrollBehavior = prev;
    }
    function route(){
      var isDiamond = effectiveHash() === '#modiamond';
      if(isDiamond && !onDiamond){
        home.querySelectorAll('video, audio').forEach(function(m){
          try { m.pause(); } catch(e){ /* not playing */ }
        });
        home.hidden = true;
        page.hidden = false;
        document.documentElement.classList.add('fw-modiamond-route');
        document.title = 'MoDiamond — Created by MoPlicity | Fort Worth Pac';
        onDiamond = true;
        toTop();
      } else if(!isDiamond && onDiamond){
        page.hidden = true;
        // Heading to #merch, #modiamond-heels or #md-purses? Those
        // routers have already swapped their page in and parked the
        // homepage — don't hand the homepage back underneath them.
        if(effectiveHash() !== '#merch' && effectiveHash() !== '#modiamond-heels' && effectiveHash() !== '#md-purses') home.hidden = false;
        document.documentElement.classList.remove('fw-modiamond-route');
        document.title = homeTitle;
        onDiamond = false;
      }
    }

    window.addEventListener('message', function(ev){
      if(window.parent === window) return;
      var d = ev.data, s = '';
      if(typeof d === 'string') s = d;
      else if(d && typeof d === 'object') s = d.hash || d.fragment || d.url || d.href || '';
      var h = hashFromString(s);
      if(h){ msgHash = h; route(); }
    });

    window.addEventListener('hashchange', route);
    route();

    var pollStart = Date.now();
    var poller = setInterval(function(){
      if(Date.now() - pollStart > 60000){ clearInterval(poller); return; }
      route();
    }, 250);
  })();

;

/* ===== original inline <script> #6 (document order) ===== */

  // MoDiamond Heels page — the top-nav "MoDiamond Heels" link and the
  // link on the MoDiamond page open the heels' own dedicated page
  // (route #modiamond-heels) instead of a section jump: the homepage
  // <main id="top"> is swapped out for the heels page block, with the
  // site header, footer and sticky player left in place, and a Back to
  // MoDiamond link returns to Diamond's page. Mirrors the #modiamond
  // router above and reads the route from the same channels, so a
  // direct visit to fortworthpac.com/#modiamond-heels lands on the
  // heels page. No element carries the id "modiamond-heels", so the
  // direct-link landing script below ignores this route. The routers
  // compose: each only ever shows its own page or hands the homepage
  // back, so #merch → #modiamond → #modiamond-heels → #top all land
  // right.
  (function(){
    var page = document.getElementById('modiamond-heels-page');
    var home = document.getElementById('top');
    if(!page || !home) return;
    var homeTitle = 'Fort Worth Pac — Official Music Site | Fort Worth, TX Hip-Hop';
    var onHeels = false;
    var msgHash = '';

    function hashFromString(s){
      if(!s || typeof s !== 'string') return '';
      var i = s.indexOf('#');
      if(i === -1) return '';
      var h = s.slice(i);
      return h.length > 1 ? h : '';
    }
    function framedHash(){
      try {
        if (window.parent && window.parent !== window && window.parent.location.hash) return window.parent.location.hash;
      } catch(e){ /* cross-origin host — its address is not readable */ }
      try {
        if (window.top && window.top !== window && window.top.location.hash) return window.top.location.hash;
      } catch(e){ /* cross-origin host — its address is not readable */ }
      return '';
    }
    function effectiveHash(){
      var own = window.location.hash || '';
      if(own) return own;
      if(msgHash) return msgHash;
      var framed = framedHash();
      if(framed) return framed;
      return window.__fwOpenHash || '';
    }
    function toTop(){
      var root = document.documentElement;
      var prev = root.style.scrollBehavior;
      root.style.scrollBehavior = 'auto';
      window.scrollTo(0, 0);
      root.style.scrollBehavior = prev;
    }
    function route(){
      var isHeels = effectiveHash() === '#modiamond-heels';
      if(isHeels && !onHeels){
        home.querySelectorAll('video, audio').forEach(function(m){
          try { m.pause(); } catch(e){ /* not playing */ }
        });
        home.hidden = true;
        page.hidden = false;
        document.documentElement.classList.add('fw-heels-route');
        document.title = 'MoDiamond Heels — Created by MoPlicity | Fort Worth Pac';
        onHeels = true;
        toTop();
      } else if(!isHeels && onHeels){
        page.hidden = true;
        // Heading to #merch, #modiamond or #md-purses? Those routers
        // have already swapped their page in and parked the homepage —
        // don't hand the homepage back underneath them.
        var h = effectiveHash();
        if(h !== '#merch' && h !== '#modiamond' && h !== '#md-purses') home.hidden = false;
        document.documentElement.classList.remove('fw-heels-route');
        document.title = homeTitle;
        onHeels = false;
      }
    }

    window.addEventListener('message', function(ev){
      if(window.parent === window) return;
      var d = ev.data, s = '';
      if(typeof d === 'string') s = d;
      else if(d && typeof d === 'object') s = d.hash || d.fragment || d.url || d.href || '';
      var h = hashFromString(s);
      if(h){ msgHash = h; route(); }
    });

    window.addEventListener('hashchange', route);
    route();

    var pollStart = Date.now();
    var poller = setInterval(function(){
      if(Date.now() - pollStart > 60000){ clearInterval(poller); return; }
      route();
    }, 250);
  })();

;

/* ===== original inline <script> #7 (document order) ===== */

  // MD Purse Collection page — the top-nav "MD Purse Collection" link
  // and the link on the MoDiamond page open the purses' own dedicated
  // page (route #md-purses) instead of a section jump: the homepage
  // <main id="top"> is swapped out for the purses page block, with the
  // site header, footer and sticky player left in place, and a Back to
  // MoDiamond link returns to Diamond's page. Mirrors the
  // #modiamond-heels router above and reads the route from the same
  // channels, so a direct visit to fortworthpac.com/#md-purses lands
  // on the purse page. No element carries the id "md-purses", so the
  // direct-link landing script below ignores this route. The routers
  // compose: each only ever shows its own page or hands the homepage
  // back, so #merch → #modiamond → #modiamond-heels → #md-purses →
  // #top all land right.
  (function(){
    var page = document.getElementById('modiamond-purses-page');
    var home = document.getElementById('top');
    if(!page || !home) return;
    var homeTitle = 'Fort Worth Pac — Official Music Site | Fort Worth, TX Hip-Hop';
    var onPurses = false;
    var msgHash = '';

    function hashFromString(s){
      if(!s || typeof s !== 'string') return '';
      var i = s.indexOf('#');
      if(i === -1) return '';
      var h = s.slice(i);
      return h.length > 1 ? h : '';
    }
    function framedHash(){
      try {
        if (window.parent && window.parent !== window && window.parent.location.hash) return window.parent.location.hash;
      } catch(e){ /* cross-origin host — its address is not readable */ }
      try {
        if (window.top && window.top !== window && window.top.location.hash) return window.top.location.hash;
      } catch(e){ /* cross-origin host — its address is not readable */ }
      return '';
    }
    function effectiveHash(){
      var own = window.location.hash || '';
      if(own) return own;
      if(msgHash) return msgHash;
      var framed = framedHash();
      if(framed) return framed;
      return window.__fwOpenHash || '';
    }
    function toTop(){
      var root = document.documentElement;
      var prev = root.style.scrollBehavior;
      root.style.scrollBehavior = 'auto';
      window.scrollTo(0, 0);
      root.style.scrollBehavior = prev;
    }
    function route(){
      var isPurses = effectiveHash() === '#md-purses';
      if(isPurses && !onPurses){
        home.querySelectorAll('video, audio').forEach(function(m){
          try { m.pause(); } catch(e){ /* not playing */ }
        });
        home.hidden = true;
        page.hidden = false;
        document.documentElement.classList.add('fw-purses-route');
        document.title = 'MD Purse Collection — MoDiamond | Fort Worth Pac';
        onPurses = true;
        toTop();
      } else if(!isPurses && onPurses){
        page.hidden = true;
        // Heading to #merch, #modiamond or #modiamond-heels? Those
        // routers have already swapped their page in and parked the
        // homepage — don't hand the homepage back underneath them.
        var h = effectiveHash();
        if(h !== '#merch' && h !== '#modiamond' && h !== '#modiamond-heels') home.hidden = false;
        document.documentElement.classList.remove('fw-purses-route');
        document.title = homeTitle;
        onPurses = false;
      }
    }

    window.addEventListener('message', function(ev){
      if(window.parent === window) return;
      var d = ev.data, s = '';
      if(typeof d === 'string') s = d;
      else if(d && typeof d === 'object') s = d.hash || d.fragment || d.url || d.href || '';
      var h = hashFromString(s);
      if(h){ msgHash = h; route(); }
    });

    window.addEventListener('hashchange', route);
    route();

    var pollStart = Date.now();
    var poller = setInterval(function(){
      if(Date.now() - pollStart > 60000){ clearInterval(poller); return; }
      route();
    }, 250);
  })();

;

/* ===== original inline <script> #8 (document order) ===== */

  // Direct-link landing — opening a link like
  // fortworthpac.com/#moplicity-merch must land on that section.
  // Why earlier passes did not stick on the live site: the public
  // domain 302-redirects to the hosted share page, which runs this
  // page inside a frame. The fragment the visitor opened with can
  // therefore arrive through several different channels — this
  // document's own address, the framing page's address (readable
  // only when the frame is same-origin), or a message from the
  // framing page — and this long page keeps laying out afterwards
  // (fonts, posters, embeds above the section push it down), so a
  // single jump gets stranded near the top. So this handler:
  //   • checks every channel, and keeps re-checking on a poll for
  //     the first minute, so a fragment that shows up late — on
  //     either address — is still caught;
  //   • lands with scrollIntoView first, which scrolls every
  //     scrollable ancestor including the outer page when framed,
  //     then corrects with a direct window scroll when the section
  //     is still off-screen;
  //   • keeps re-landing while the page settles — poll ticks, a
  //     ResizeObserver on the document, each resource that finishes
  //     loading above the section, the load event and font loading —
  //     for up to ~30 seconds after the target is armed;
  //   • stops the moment the visitor scrolls, drags, taps or types
  //     on their own, and re-arms on any later hash change (the
  //     MERCH nav link, the printed direct link in the section).
  (function(){
    var OFFSET = 84;      // fixed header height + breathing room
    var ARM_MS = 30000;   // how long a landing stays armed
    var userMoved = false;
    var armedId = '';
    var armedUntil = 0;
    var observer = null;
    var msgHash = '';

    function stopWatching(){
      if(observer){ observer.disconnect(); observer = null; }
    }
    function markMoved(){ userMoved = true; stopWatching(); }
    ['wheel','touchstart','touchmove','pointerdown'].forEach(function(evt){
      window.addEventListener(evt, markMoved, { passive: true });
    });
    document.addEventListener('keydown', function(e){
      if(['ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' '].indexOf(e.key) !== -1) markMoved();
    });

    function cleanHash(h){
      if(!h || typeof h !== 'string') return '';
      var i = h.indexOf('#');
      if(i === -1) return '';
      var id = h.slice(i + 1);
      if(!id) return '';
      try { id = decodeURIComponent(id); } catch(e){ /* keep raw id */ }
      return document.getElementById(id) ? id : '';
    }
    function rawHash(){
      var own = window.location.hash || window.__fwOpenHash || '';
      if(own && own.length > 1) return own;
      if(msgHash) return msgHash;
      // Framed by a host page on the same origin: the fragment the
      // visitor opened with can live on the outer address instead.
      try {
        if(window.parent && window.parent !== window && window.parent.location.hash) return window.parent.location.hash;
      } catch(e){ /* cross-origin host — its address is not readable */ }
      try {
        if(window.top && window.top !== window && window.top.location.hash) return window.top.location.hash;
      } catch(e){ /* cross-origin host — its address is not readable */ }
      return own || '';
    }
    function targetId(){ return cleanHash(rawHash()); }
    function targetEl(){
      var id = armedId || targetId();
      return id ? document.getElementById(id) : null;
    }

    function land(){
      if(userMoved) return;
      var el = targetEl();
      if(!el) return;
      var root = document.documentElement;
      var prevBehavior = root.style.scrollBehavior;
      root.style.scrollBehavior = 'auto'; // land directly, no glide
      // scrollIntoView first: it also pulls scrollable ancestors —
      // including the outer page — along when this document is
      // framed, and the section's scroll-margin keeps it clear of
      // the fixed header there.
      try { el.scrollIntoView({ block: 'start' }); } catch(e){ /* older engine — window scroll below stands */ }
      // If the section still is not at the top (a scroller ignored
      // scrollIntoView, or the two disagree), correct directly.
      var rect = el.getBoundingClientRect();
      if(rect.top > 140 || rect.top < -40){
        window.scrollTo(0, Math.max(0, rect.top + window.pageYOffset - OFFSET));
      }
      root.style.scrollBehavior = prevBehavior;
    }
    function watch(){
      stopWatching();
      if(!('ResizeObserver' in window)) return;
      var last = 0;
      observer = new ResizeObserver(function(){
        if(userMoved || Date.now() > armedUntil){ stopWatching(); return; }
        var now = Date.now();
        if(now - last < 120) return; // throttle bursts of shifts
        last = now;
        land();
      });
      observer.observe(document.documentElement);
      if(document.body) observer.observe(document.body);
    }
    function arm(id){
      if(!id) return;
      armedId = id;
      userMoved = false;
      armedUntil = Date.now() + ARM_MS;
      land();
      watch();
      if(document.fonts && document.fonts.ready){
        document.fonts.ready.then(function(){ if(!userMoved && Date.now() <= armedUntil) land(); });
      }
    }
    function refresh(){
      var id = targetId();
      if(!id) return;
      if(id !== armedId){ arm(id); return; }
      if(!userMoved){
        armedUntil = Date.now() + ARM_MS;
        land();
        watch();
      }
    }

    // A framing page can hand the fragment down in a message; accept
    // one only when it names a section that actually exists here.
    window.addEventListener('message', function(ev){
      if(window.parent === window) return;
      var d = ev.data, s = '';
      if(typeof d === 'string') s = d;
      else if(d && typeof d === 'object') s = d.hash || d.fragment || d.url || d.href || '';
      if(!s) return;
      var id = cleanHash(s);
      if(id){ msgHash = '#' + id; if(id !== armedId) arm(id); else if(!userMoved) land(); }
    });

    // Every resource that finishes loading can shift the section
    // down the page; re-land while a landing is armed.
    document.addEventListener('load', function(){
      if(armedId && !userMoved && Date.now() <= armedUntil + 10000) land();
    }, true);

    // Poll every channel for the first minute: catches a fragment
    // that appears late on either address, and keeps re-landing
    // while late layout shifts settle.
    var pollStart = Date.now();
    var poller = setInterval(function(){
      if(Date.now() - pollStart > 60000){ clearInterval(poller); return; }
      var id = targetId();
      if(id && id !== armedId){ arm(id); return; }
      if(id && !userMoved && Date.now() <= armedUntil) land();
    }, 250);

    if(targetId()) arm(targetId());
    window.addEventListener('load', refresh);
    window.addEventListener('pageshow', refresh);
    window.addEventListener('hashchange', refresh);
  })();

;

/* ===== original inline <script> #9 (document order) ===== */

  // Shopping cart — one cart for every merch surface on the site: the
  // Shop, MoPlicity Merch (the homepage section and the #merch page) and
  // ThugHouseEnt. It lives in this page's memory, so it holds everything
  // while the visitor browses — across sections and the merch page view.
  // Checkout pays the cart total to Cash App $FortWorthPac with the order
  // summary copied for the payment note. Cash App checkout on this site
  // is the only order path — there is no DM ordering.
  (function(){
    var CASHAPP_BASE = 'https://cash.app/$FortWorthPac';
    // Fort Worth, TX combined sales tax: 6.25% state + 2% local = 8.25%.
    // Charged on the subtotal AFTER any promo discount; item prices
    // themselves stay as listed.
    var TAX_RATE = 0.0825;
    var cart = [];
    // The one code on the cart right now: the built-in DIAMOND card
    // promo ({kind:'diamond'}). One at a time — applying a new code
    // replaces the one before it.
    var appliedCode = null;

    var drawer = document.getElementById('cartDrawer');
    if(!drawer) return;
    var backdrop = document.querySelector('.cart-backdrop');
    var itemsEl = document.getElementById('cartItems');
    var subtotalEl = document.getElementById('cartSubtotal');
    var discountRow = document.getElementById('cartDiscountRow');
    var discountEl = document.getElementById('cartDiscount');
    var discountLabelEl = document.getElementById('cartDiscountLabel');
    var taxEl = document.getElementById('cartTax');
    var totalEl = document.getElementById('cartTotal');
    var summaryEl = document.getElementById('cartSummary');
    var checkoutEl = document.getElementById('cartCheckout');
    var stripeEl = document.getElementById('cartStripe');
    var copyBtn = document.getElementById('cartCopy');
    var promoInput = document.getElementById('cartPromo');
    var promoMsg = document.getElementById('cartPromoMsg');
    var toastEl = document.getElementById('cartToast');

    function fmt(n){ return '$' + (Math.round(n * 100) / 100).toLocaleString('en-US'); }
    function parsePrice(text){
      var m = /\$\s*([\d,]+(?:\.\d+)?)/.exec(text || '');
      return { amount: m ? parseFloat(m[1].replace(/,/g, '')) : 0, monthly: /\/\s*month/i.test(text || '') };
    }
    function copyText(text, done){
      if(typeof window.pacCopyText === 'function'){ window.pacCopyText(text, done); return; }
      function fallback(){
        var ta = document.createElement('textarea');
        ta.value = text; ta.setAttribute('readonly', '');
        ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        var ok = false;
        try { ok = document.execCommand('copy'); } catch(e){ ok = false; }
        ta.remove(); if(done) done(ok);
      }
      if(navigator.clipboard && navigator.clipboard.writeText){
        navigator.clipboard.writeText(text).then(function(){ if(done) done(true); }, fallback);
      } else { fallback(); }
    }

    function totals(){
      var sub = 0, count = 0, diamondQty = 0;
      cart.forEach(function(it){
        sub += it.price * it.qty;
        count += it.qty;
        if(it.name.indexOf('Diamond Gold Card') > -1) diamondQty += it.qty;
      });
      var discount = 0;
      if(appliedCode && appliedCode.kind === 'diamond'){
        discount = Math.min(diamondQty * 50, sub);
      }
      var taxedBase = sub - discount;
      var tax = Math.round(taxedBase * TAX_RATE * 100) / 100;
      return { subtotal: sub, discount: discount, tax: tax, total: taxedBase + tax, count: count };
    }

    function summaryText(){
      if(!cart.length) return 'Your cart is empty.';
      var t = totals();
      var lines = ['ORDER — fortworthpac.com'];
      var hasMonthly = false;
      cart.forEach(function(it){
        if(it.monthly) hasMonthly = true;
        lines.push('• ' + it.name + (it.variant ? ' — ' + it.variant : '') + ' × ' + it.qty + ' — ' + fmt(it.price * it.qty) + (it.monthly ? ' (per month)' : ''));
      });
      lines.push('Subtotal: ' + fmt(t.subtotal));
      if(t.discount) lines.push('Promo code DIAMOND: −' + fmt(t.discount));
      lines.push('Tax (8.25%): ' + fmt(t.tax));
      lines.push('Total: ' + fmt(t.total));
      if(hasMonthly) lines.push('Note: the MoPlicity Book Club is a $20/month membership.');
      lines.push('Paying on Cash App: $FortWorthPac');
      return lines.join('\n');
    }

    function render(){
      var t = totals();
      document.querySelectorAll('[data-cart-count]').forEach(function(el){
        el.textContent = t.count;
        el.hidden = t.count === 0;
      });
      itemsEl.innerHTML = '';
      if(!cart.length){
        var d = document.createElement('p');
        d.className = 'cart-empty';
        d.textContent = 'Your cart is empty — add some merch and it will show up here, ready to check out with Cash App.';
        itemsEl.appendChild(d);
      } else {
        cart.forEach(function(it, idx){
          var box = document.createElement('div'); box.className = 'cart-item';
          var top = document.createElement('div'); top.className = 'cart-item-top';
          var left = document.createElement('div');
          var nm = document.createElement('div'); nm.className = 'cart-item-name'; nm.textContent = it.name; left.appendChild(nm);
          if(it.variant){ var vr = document.createElement('div'); vr.className = 'cart-item-variant'; vr.textContent = it.variant; left.appendChild(vr); }
          var un = document.createElement('div'); un.className = 'cart-item-unit'; un.textContent = fmt(it.price) + (it.monthly ? '/month' : '') + ' each'; left.appendChild(un);
          var rm = document.createElement('button'); rm.type = 'button'; rm.className = 'cart-remove'; rm.textContent = 'Remove';
          rm.setAttribute('data-act', 'rem'); rm.setAttribute('data-idx', idx);
          rm.setAttribute('aria-label', 'Remove ' + it.name + ' from cart');
          top.appendChild(left); top.appendChild(rm);
          var bottom = document.createElement('div'); bottom.className = 'cart-item-bottom';
          var qty = document.createElement('div'); qty.className = 'cart-qty';
          var dec = document.createElement('button'); dec.type = 'button'; dec.textContent = '−';
          dec.setAttribute('data-act', 'dec'); dec.setAttribute('data-idx', idx); dec.setAttribute('aria-label', 'One less ' + it.name);
          var n = document.createElement('b'); n.textContent = it.qty;
          var inc = document.createElement('button'); inc.type = 'button'; inc.textContent = '+';
          inc.setAttribute('data-act', 'inc'); inc.setAttribute('data-idx', idx); inc.setAttribute('aria-label', 'One more ' + it.name);
          qty.appendChild(dec); qty.appendChild(n); qty.appendChild(inc);
          var lt = document.createElement('span'); lt.className = 'cart-line-total';
          lt.textContent = fmt(it.price * it.qty) + (it.monthly ? '/mo' : '');
          bottom.appendChild(qty); bottom.appendChild(lt);
          box.appendChild(top); box.appendChild(bottom);
          itemsEl.appendChild(box);
        });
      }
      subtotalEl.textContent = fmt(t.subtotal);
      discountRow.hidden = !(t.discount > 0);
      discountEl.textContent = '−' + fmt(t.discount);
      if(t.discount > 0 && discountLabelEl){
        discountLabelEl.textContent = 'Code DIAMOND — Diamond Card';
      }
      taxEl.textContent = fmt(t.tax);
      totalEl.textContent = fmt(t.total);
      summaryEl.textContent = summaryText();
      checkoutEl.href = t.total > 0 ? CASHAPP_BASE + '/' + (t.total % 1 ? t.total.toFixed(2) : String(t.total)) : CASHAPP_BASE;
      checkoutEl.classList.toggle('is-disabled', !cart.length);
      checkoutEl.textContent = cart.length ? 'Checkout — Pay ' + fmt(t.total) + ' with Cash App ↗' : 'Checkout — Pay with Cash App ↗';
      if(stripeEl){
        stripeEl.classList.toggle('is-disabled', !cart.length);
        stripeEl.textContent = cart.length ? 'Pay with card (Stripe) — enter ' + fmt(t.total) + ' on the secure Stripe page ↗' : 'Pay with card (Stripe) ↗';
      }
    }

    itemsEl.addEventListener('click', function(e){
      var b = e.target.closest ? e.target.closest('[data-act]') : null;
      if(!b) return;
      var idx = parseInt(b.getAttribute('data-idx'), 10);
      var it = cart[idx];
      if(!it) return;
      var act = b.getAttribute('data-act');
      if(act === 'inc') it.qty++;
      else if(act === 'dec'){ it.qty--; if(it.qty < 1) cart.splice(idx, 1); }
      else if(act === 'rem') cart.splice(idx, 1);
      render();
    });

    // Drawer open / close
    var lastFocus = null;
    function openCart(){
      lastFocus = document.activeElement;
      drawer.hidden = false;
      if(backdrop) backdrop.hidden = false;
      requestAnimationFrame(function(){
        drawer.classList.add('is-open');
        if(backdrop) backdrop.classList.add('is-open');
      });
      document.body.style.overflow = 'hidden';
      var c = drawer.querySelector('.cart-close');
      if(c) c.focus();
    }
    function closeCart(){
      drawer.classList.remove('is-open');
      if(backdrop) backdrop.classList.remove('is-open');
      document.body.style.overflow = '';
      setTimeout(function(){ drawer.hidden = true; if(backdrop) backdrop.hidden = true; }, 300);
      if(lastFocus && lastFocus.focus) lastFocus.focus();
    }
    document.querySelectorAll('[data-cart-open]').forEach(function(b){ b.addEventListener('click', openCart); });
    document.querySelectorAll('[data-cart-close]').forEach(function(b){ b.addEventListener('click', closeCart); });
    document.addEventListener('keydown', function(e){
      if(e.key === 'Escape' && !drawer.hidden) closeCart();
    });

    // ---- Code at checkout --------------------------------------------
    // One code works in this box, built right into the page:
    //  • DIAMOND — the Diamond Gold Card Replica's own promo
    //    ($50 off each card, per the note on its product card).
    // The cart is fully self-contained: the code is checked right
    // here on the page, with no outside admin or storage hookup.
    function normalizeShopCode(raw){
      return (raw || '').trim().toUpperCase().replace(/[^A-Z0-9-]/g, '');
    }

    // Promo code — one code at a time; entering a new code replaces
    // the one before it.
    function applyShopCode(){
      var code = normalizeShopCode(promoInput.value);
      if(!code){ promoMsg.textContent = ''; return; }
      if(code === 'DIAMOND'){
        var has = cart.some(function(it){ return it.name.indexOf('Diamond Gold Card') > -1; });
        if(has){ appliedCode = { kind: 'diamond' }; promoMsg.textContent = 'Code applied — $50 off each Diamond Gold Card Replica in your cart.'; }
        else { appliedCode = null; promoMsg.textContent = 'That code takes $50 off the MoPlicity Diamond Gold Card Replica — add it to your cart to use the code.'; }
      } else {
        appliedCode = null;
        promoMsg.textContent = 'That code is not one Pac is running right now.';
      }
      render();
    }
    document.getElementById('cartPromoApply').addEventListener('click', applyShopCode);
    promoInput.addEventListener('keydown', function(e){
      if(e.key === 'Enter'){ e.preventDefault(); applyShopCode(); }
    });

    copyBtn.addEventListener('click', function(){
      copyText(summaryText(), function(ok){
        copyBtn.textContent = ok ? 'Copied ✓ — paste it in the Cash App note' : 'Copy order summary';
        setTimeout(function(){ copyBtn.textContent = 'Copy order summary'; }, 2200);
      });
    });
    checkoutEl.addEventListener('click', function(){
      if(!cart.length) return;
      copyText(summaryText(), function(){});
    });

    var toastTimer = null;
    function showToast(msg){
      toastEl.textContent = msg;
      toastEl.classList.add('is-show');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(function(){ toastEl.classList.remove('is-show'); }, 1800);
    }
    function flashAdded(b){
      if(b.getAttribute('data-orig-text') === null) b.setAttribute('data-orig-text', b.textContent);
      b.classList.add('added');
      b.textContent = 'Added to Cart ✓';
      clearTimeout(b._fwT);
      b._fwT = setTimeout(function(){
        b.classList.remove('added');
        b.textContent = b.getAttribute('data-orig-text');
      }, 1300);
    }

    function collectVariant(container, btn){
      var parts = [];
      if(container){
        var sizeEl = container.querySelector('[data-merch-size]');
        if(sizeEl && sizeEl.value) parts.push((sizeEl.getAttribute('data-order-label') || 'Size') + ': ' + sizeEl.value);
        container.querySelectorAll('[data-cart-variant]').forEach(function(sel){
          if(sel.value) parts.push(sel.getAttribute('data-cart-variant') + ': ' + sel.value);
        });
        var colorOut = container.querySelector('[data-th-name-out]');
        if(colorOut && colorOut.textContent.trim()) parts.push('Color: ' + colorOut.textContent.trim());
      }
      if(btn && btn.getAttribute('data-cart-color')) parts.push('Color: ' + btn.getAttribute('data-cart-color'));
      return parts.join(' · ');
    }

    function addItem(name, variant, price, monthly){
      var k = name + '||' + variant;
      for(var i = 0; i < cart.length; i++){
        if(cart[i].key === k){ cart[i].qty++; render(); return; }
      }
      cart.push({ key: k, name: name, variant: variant, price: price, monthly: !!monthly, qty: 1 });
      render();
    }

    // Shop cards with a Buy Now button get an Add to Cart right under it,
    // reading the same item name and price the Buy Now button carries.
    document.querySelectorAll('.merch-buy').forEach(function(buy){
      var p = parsePrice(buy.getAttribute('data-price') || '');
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'btn btn-ghost btn-block add-cart-btn';
      b.textContent = 'Add to Cart';
      b.setAttribute('data-cart-name', buy.getAttribute('data-item') || 'Merch');
      b.setAttribute('data-cart-price', String(p.amount));
      if(p.monthly) b.setAttribute('data-cart-monthly', '1');
      buy.insertAdjacentElement('afterend', b);
    });

    // MoPlicity cards (homepage section + the #merch page — same markup):
    // priced off the sale row on the card; apparel gets a size picker.
    document.querySelectorAll('.mmerch-card').forEach(function(card){
      var body = card.querySelector('.mmerch-body');
      if(!body || card.querySelector('.add-cart-btn')) return;
      var h3 = card.querySelector('h3');
      var rawName = h3 ? h3.textContent.trim() : 'Merch';
      var name = /^MoPlicity/.test(rawName) ? rawName : 'MoPlicity ' + rawName;
      var saleVal = card.querySelector('.mmerch-price-row.sale .val');
      var p = parsePrice(saleVal ? saleVal.textContent : '');
      var tag = card.querySelector('.mmerch-tag');
      var firstAdded = null;
      if(tag && tag.textContent.trim() === 'Apparel'){
        var label = document.createElement('label');
        label.className = 'merch-size';
        label.appendChild(document.createTextNode('Size'));
        var sel = document.createElement('select');
        sel.setAttribute('data-merch-size', '');
        sel.setAttribute('aria-label', 'Size for ' + name);
        var sizes = /Socks/i.test(rawName) ? ['One Size'] : ['Small', 'Medium', 'Large', 'XL', '2XL', '3XL'];
        sizes.forEach(function(s){
          var o = document.createElement('option');
          o.textContent = s;
          if(s === 'Medium') o.selected = true;
          sel.appendChild(o);
        });
        label.appendChild(sel);
        body.appendChild(label);
        firstAdded = label;
      }
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'btn btn-gold btn-block add-cart-btn';
      b.textContent = 'Add to Cart — ' + (saleVal ? saleVal.textContent.trim() : fmt(p.amount));
      b.setAttribute('data-cart-name', name);
      b.setAttribute('data-cart-price', String(p.amount));
      if(p.monthly) b.setAttribute('data-cart-monthly', '1');
      body.appendChild(b);
      if(!firstAdded) firstAdded = b;
      firstAdded.style.marginTop = 'auto';
    });

    // Every Add to Cart button — written into the cards or added above —
    // runs through this one handler.
    document.querySelectorAll('.add-cart-btn').forEach(function(b){
      b.addEventListener('click', function(){
        var container = b.closest('.merch-card, .mmerch-card, figure') || b.parentElement;
        var name = b.getAttribute('data-cart-name') || 'Merch';
        addItem(name, collectVariant(container, b), parseFloat(b.getAttribute('data-cart-price')) || 0, b.getAttribute('data-cart-monthly') === '1');
        flashAdded(b);
        showToast(name + ' added to your cart');
      });
    });

    render();
  })();

;

/* ===== original inline <script> #10 (document order) ===== */

  // Pick a Number — playable demo (in-memory only; the full game is coming soon).
  // Locked rules: pick 1 of 5, press the diamond to spin. 5 in a row earns
  // 3 free spins where a miss does not count. 10 in a row wins $25. Any
  // other miss resets the streak to zero.
  (function(){
    var board = document.getElementById('panBoard');
    if(!board) return;
    var picks = Array.prototype.slice.call(board.querySelectorAll('[data-pan-pick]'));
    var lanes = Array.prototype.slice.call(board.querySelectorAll('[data-pan-lane]'));
    var spinBtn = document.getElementById('panSpin');
    var status = document.getElementById('panStatus');
    var streakEl = document.getElementById('panStreak');
    var freeEl = document.getElementById('panFree');
    var spinsEl = document.getElementById('panSpins');
    var bestEl = document.getElementById('panBest');
    var winBox = document.getElementById('panWin');
    var againBtn = document.getElementById('panAgain');
    var resetBtn = document.getElementById('panReset');
    var reduced = false;
    try { reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch(e) {}
    var pick = 0, streak = 0, freeSpins = 0, spinsPlayed = 0, bestStreak = 0, spinning = false;

    function render(){
      streakEl.textContent = String(streak);
      freeEl.textContent = String(freeSpins);
      spinsEl.textContent = String(spinsPlayed);
      bestEl.textContent = String(bestStreak);
    }
    function clearLanes(){
      lanes.forEach(function(l){ l.classList.remove('is-lit'); l.classList.remove('is-winner'); });
    }
    picks.forEach(function(btn){
      btn.addEventListener('click', function(){
        if(spinning) return;
        pick = parseInt(btn.getAttribute('data-pan-pick'), 10) || 0;
        picks.forEach(function(b){
          var on = b === btn;
          b.classList.toggle('is-picked', on);
          b.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        status.innerHTML = 'Your number is <b>' + pick + '</b>. Press the diamond and let Money call it.';
      });
    });
    function finishSpin(winner, wasFree){
      spinning = false;
      spinBtn.disabled = false;
      clearLanes();
      var winLane = lanes[winner - 1];
      if(winLane) winLane.classList.add('is-winner');
      if(winner === pick){
        streak++;
        if(streak > bestStreak) bestStreak = streak;
        if(streak >= 10){
          streak = 0;
          freeSpins = 0;
          winBox.hidden = false;
          status.innerHTML = 'Money opened on <b>' + winner + '</b> — that\'s <b>10 in a row</b>. Winner.';
        } else if(streak === 5){
          freeSpins += 3;
          status.innerHTML = 'Money opened on <b>' + winner + '</b> — <b>5 in a row!</b> You just banked <b>3 free spins</b> where a miss doesn\'t count. Streak: <b>' + streak + '</b>.';
        } else {
          status.innerHTML = 'Money opened on <b>' + winner + '</b> — that\'s a hit. Streak: <b>' + streak + '</b> in a row. ' + (streak < 5 ? (5 - streak) + ' more to the free spins.' : (10 - streak) + ' more to the $25.');
        }
      } else if(wasFree){
        status.innerHTML = 'Money opened on <b>' + winner + '</b> — a miss, but that was a <b>free spin</b>, so it doesn\'t count. Streak stays at <b>' + streak + '</b>.';
      } else {
        streak = 0;
        status.innerHTML = 'Money opened on <b>' + winner + '</b> — miss. Your streak goes back to <b>zero</b>. Pick your number and run it back.';
      }
      render();
    }
    spinBtn.addEventListener('click', function(){
      if(spinning) return;
      if(!pick){
        status.innerHTML = 'Pick your number first — <b>1 through 5</b> — then press the diamond.';
        return;
      }
      winBox.hidden = true;
      var wasFree = freeSpins > 0;
      if(wasFree){
        freeSpins--;
      }
      spinsPlayed++;
      render();
      spinning = true;
      spinBtn.disabled = true;
      clearLanes();
      var winner = 1 + Math.floor(Math.random() * 5);
      if(reduced){
        finishSpin(winner, wasFree);
        return;
      }
      status.textContent = 'The lanes are spinning…';
      var ticks = 0, total = 14 + Math.floor(Math.random() * 6);
      var timer = setInterval(function(){
        clearLanes();
        var lane = lanes[ticks % lanes.length];
        if(lane) lane.classList.add('is-lit');
        ticks++;
        if(ticks >= total){
          clearInterval(timer);
          finishSpin(winner, wasFree);
        }
      }, 70);
    });
    function resetAll(msg){
      pick = 0; streak = 0; freeSpins = 0; spinsPlayed = 0; bestStreak = 0; spinning = false;
      spinBtn.disabled = false;
      winBox.hidden = true;
      clearLanes();
      picks.forEach(function(b){ b.classList.remove('is-picked'); b.setAttribute('aria-pressed', 'false'); });
      status.innerHTML = msg;
      render();
    }
    againBtn.addEventListener('click', function(){ resetAll('New run. Pick a number above, then press the diamond. <b>Money\'s waiting.</b>'); });
    resetBtn.addEventListener('click', function(){ resetAll('Demo reset. Pick a number above, then press the diamond. <b>Money\'s waiting.</b>'); });
    render();
  })();

  // Diamond Diamond Enterprise — playable slot demo (in-memory only; the
  // full game is coming soon). Rules: pick 1 of 5 reels, $1 demo dollar a
  // spin from a $20 demo balance. 5 in a row earns 1 free spin (a miss on
  // a free spin holds the streak). 10 in a row pays $50 demo dollars,
  // 20 in a row pays $100. Any other paid miss resets the streak to zero.
  (function(){
    var board = document.getElementById('ddeBoard');
    if(!board) return;
    var reelsBox = document.getElementById('ddeReels');
    var status = document.getElementById('ddeStatus');
    var spinBtn = document.getElementById('ddeSpin');
    var leverBtn = document.getElementById('ddeLever');
    var costEl = document.getElementById('ddeCost');
    var refillBtn = document.getElementById('ddeRefill');
    var resetBtn = document.getElementById('ddeReset');
    var balanceEl = document.getElementById('ddeBalance');
    var streakEl = document.getElementById('ddeStreak');
    var freeEl = document.getElementById('ddeFree');
    var bestEl = document.getElementById('ddeBest');
    var historyEl = document.getElementById('ddeHistory');
    var reduced = false;
    try { reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch(e) {}

    function diamondSVG(idSuffix, main, light, dark){
      var g = 'dde' + idSuffix;
      return '<svg viewBox="0 0 100 84" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Diamond">'
        + '<defs>'
        + '<linearGradient id="' + g + 't" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + light + '"/><stop offset="1" stop-color="' + main + '"/></linearGradient>'
        + '<linearGradient id="' + g + 'b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + main + '"/><stop offset="1" stop-color="' + dark + '"/></linearGradient>'
        + '</defs>'
        + '<polygon points="28,8 72,8 92,34 8,34" fill="url(#' + g + 't)"/>'
        + '<polygon points="8,34 92,34 50,78" fill="url(#' + g + 'b)"/>'
        + '<polygon points="28,8 42,34 8,34" fill="' + light + '" opacity="0.55"/>'
        + '<polygon points="72,8 92,34 58,34" fill="' + dark + '" opacity="0.35"/>'
        + '<polygon points="42,34 58,34 50,78" fill="' + light + '" opacity="0.28"/>'
        + '<polygon points="28,8 72,8 58,34 42,34" fill="#ffffff" opacity="0.35"/>'
        + '<polyline points="28,8 42,34 50,78" fill="none" stroke="#ffffff" stroke-opacity="0.65" stroke-width="1"/>'
        + '<polyline points="72,8 58,34 50,78" fill="none" stroke="#ffffff" stroke-opacity="0.45" stroke-width="1"/>'
        + '<line x1="8" y1="34" x2="92" y2="34" stroke="#ffffff" stroke-opacity="0.7" stroke-width="1"/>'
        + '<polygon points="50,2 52.5,9 50,16 47.5,9" fill="#ffffff" opacity="0.9"/>'
        + '</svg>';
    }
    var PALETTES = [
      ['#f7e7b0', '#ffffff', '#c9a227'],
      ['#f3d98a', '#fffbe6', '#b8962e'],
      ['#e8c268', '#fff6d6', '#a67c1a'],
      ['#f9ecc0', '#ffffff', '#cfa93a'],
      ['#eed88a', '#fffdf0', '#b8912a']
    ];

    var reelEls = [], gemEls = [], numBtns = [];
    for(var i = 0; i < 5; i++){
      var reel = document.createElement('div');
      reel.className = 'slot-reel';
      var p = PALETTES[i];
      reel.innerHTML = '<button type="button" class="slot-reel-num" data-dde-pick="' + (i + 1) + '" aria-pressed="false" aria-label="Pick reel ' + (i + 1) + '">' + (i + 1) + '</button>'
        + '<div class="slot-gem">' + diamondSVG('lane' + i, p[0], p[1], p[2]) + '</div>';
      reelsBox.appendChild(reel);
      reelEls.push(reel);
      gemEls.push(reel.querySelector('.slot-gem'));
      numBtns.push(reel.querySelector('[data-dde-pick]'));
    }

    var pick = 0, balance = 20, streak = 0, bestStreak = 0, freeSpins = 0, spinsPlayed = 0, spinning = false;

    function render(){
      balanceEl.textContent = '$' + balance;
      streakEl.textContent = String(streak);
      freeEl.textContent = String(freeSpins);
      bestEl.textContent = String(bestStreak);
      reelEls.forEach(function(reel, idx){ reel.classList.toggle('is-picked', pick === idx + 1); });
      numBtns.forEach(function(btn, idx){ btn.setAttribute('aria-pressed', pick === idx + 1 ? 'true' : 'false'); });
      if(freeSpins > 0){
        costEl.textContent = 'Free spin — no demo dollars';
        costEl.classList.add('is-free');
      } else {
        costEl.textContent = '$1 demo dollar to play';
        costEl.classList.remove('is-free');
      }
      var broke = balance < 1 && freeSpins === 0;
      refillBtn.hidden = !broke;
      spinBtn.disabled = spinning || broke;
      leverBtn.disabled = spinning || broke;
    }
    function setStatus(html, kind){
      status.innerHTML = html;
      status.classList.toggle('is-win', kind === 'win');
      status.classList.toggle('is-miss', kind === 'miss');
    }
    function clearMarks(){
      reelEls.forEach(function(reel){ reel.classList.remove('is-winner'); reel.classList.remove('is-loser'); });
    }
    function addHistory(text, tagHtml){
      var empty = historyEl.querySelector('.h-empty');
      if(empty) empty.remove();
      var li = document.createElement('li');
      li.innerHTML = '<span>' + text + '</span><b>' + tagHtml + '</b>';
      historyEl.insertBefore(li, historyEl.firstChild);
      while(historyEl.children.length > 6) historyEl.removeChild(historyEl.lastChild);
    }
    numBtns.forEach(function(btn){
      btn.addEventListener('click', function(){
        if(spinning) return;
        pick = parseInt(btn.getAttribute('data-dde-pick'), 10) || 0;
        clearMarks();
        setStatus('Reel <b>' + pick + '</b> locked in. Pull the lever or press Spin.', '');
        render();
      });
    });
    function finishSpin(winner, wasFree){
      spinning = false;
      gemEls.forEach(function(gem){ gem.classList.remove('is-spinning'); });
      reelEls.forEach(function(reel, idx){
        if(idx === winner - 1) reel.classList.add('is-winner');
        else reel.classList.add('is-loser');
      });
      var spinNo = spinsPlayed;
      if(winner === pick){
        streak++;
        if(streak > bestStreak) bestStreak = streak;
        if(streak === 5){
          freeSpins++;
          setStatus('Diamond <b>' + winner + '</b> — <b>five in a row!</b> You just banked <b>1 free spin</b>. Streak: <b>' + streak + '</b>.', 'win');
        } else if(streak === 10){
          balance += 50;
          setStatus('Diamond <b>' + winner + '</b> — <b>TEN in a row!</b> The diamonds pay <b>$50</b> demo dollars. Streak: <b>' + streak + '</b>.', 'win');
        } else if(streak === 20){
          balance += 100;
          setStatus('Diamond <b>' + winner + '</b> — <b>TWENTY in a row!</b> The big diamond pays <b>$100</b> demo dollars. Streak: <b>' + streak + '</b>.', 'win');
        } else {
          setStatus('Diamond <b>' + winner + '</b> — that\'s your number. Streak: <b>' + streak + '</b> in a row.', 'win');
        }
        addHistory('Spin ' + spinNo + ' — picked ' + pick + ', diamond ' + winner, '<span class="h-win">HIT</span>');
      } else if(wasFree){
        setStatus('Diamond <b>' + winner + '</b> — a miss, but that was a <b>free spin</b>, so your streak of <b>' + streak + '</b> holds.', '');
        addHistory('Spin ' + spinNo + ' — picked ' + pick + ', diamond ' + winner + ' (free)', '<span class="h-miss">MISS</span>');
      } else {
        streak = 0;
        setStatus('Diamond <b>' + winner + '</b> — not your number. Your streak goes back to <b>zero</b>. Pick your reel and run it back.', 'miss');
        addHistory('Spin ' + spinNo + ' — picked ' + pick + ', diamond ' + winner, '<span class="h-miss">MISS</span>');
      }
      render();
    }
    function doSpin(){
      if(spinning) return;
      if(!pick){
        setStatus('Pick your reel first — <b>1 through 5</b> — then pull the lever or press Spin.', '');
        return;
      }
      var wasFree = freeSpins > 0;
      if(wasFree){
        freeSpins--;
      } else {
        if(balance < 1){ render(); return; }
        balance--;
      }
      spinsPlayed++;
      spinning = true;
      clearMarks();
      render();
      var winner = 1 + Math.floor(Math.random() * 5);
      if(reduced){
        finishSpin(winner, wasFree);
        return;
      }
      setStatus('The diamonds are spinning…', '');
      gemEls.forEach(function(gem){ gem.classList.add('is-spinning'); });
      var order = [0, 1, 2, 3, 4].filter(function(n){ return n !== winner - 1; });
      order.push(winner - 1);
      order.forEach(function(laneIdx, pos){
        setTimeout(function(){
          gemEls[laneIdx].classList.remove('is-spinning');
          if(laneIdx === winner - 1) finishSpin(winner, wasFree);
        }, 650 + pos * 260);
      });
    }
    spinBtn.addEventListener('click', doSpin);
    leverBtn.addEventListener('click', function(){
      if(spinning) return;
      leverBtn.classList.add('is-pulled');
      setTimeout(function(){ leverBtn.classList.remove('is-pulled'); }, 560);
      doSpin();
    });
    refillBtn.addEventListener('click', function(){
      balance += 20;
      setStatus('Fresh demo money added. Pick your reel and pull the lever.', '');
      render();
    });
    resetBtn.addEventListener('click', function(){
      if(spinning) return;
      pick = 0; balance = 20; streak = 0; bestStreak = 0; freeSpins = 0; spinsPlayed = 0;
      clearMarks();
      historyEl.innerHTML = '<li class="h-empty">No spins yet — your results land here.</li>';
      setStatus('Demo reset. Pick a reel above, then pull the lever or press Spin. <b>Diamond\'s waiting.</b>', '');
      render();
    });
    render();
  })();

;
