/* EmptyHands wellbeing assessment ("Discover your wellbeing practice", wellbeing.html).
   Everything is worked out here in the browser and kept only on this device. The optional AI report
   sends the answers (numbers and choices only) to the wellbeingReport Cloud Function. */
(function () {
  'use strict';
  var root = document.getElementById('wb');
  if (!root) return;
  var API = root.getAttribute('data-ai') || '';
  var KEY = 'eh-wellbeing-2';  // answers from the first version of the questions are left alone

  /* ------------------------------------------------------------------ the questions
     Each one points towards something EmptyHands teaches: mind (Tai Chi, Yoga, coaching), body (Yoga,
     Tai Chi, Shiatsu), strength and confidence (Karate, coaching) and direction (coaching). */
  var SCALES = [
    { id: 'stress', q: 'How stressed or anxious do you feel?', lo: 'Not at all', hi: 'Extremely', invert: true, name: 'Stress', good: 'Stress in check', bad: 'Stress and worry' },
    { id: 'sleep', q: 'How well do you sleep?', lo: 'Very badly', hi: 'Very well', name: 'Sleep', good: 'Sleeping well', bad: 'Poor sleep' },
    { id: 'energy', q: 'How much energy do you have?', lo: 'Very little', hi: 'Plenty', name: 'Energy', good: 'Good energy', bad: 'Low energy' },
    { id: 'pain', q: 'How much pain, tension or stiffness do you carry in your body?', lo: 'None', hi: 'A lot', invert: true, name: 'Aches & tension', good: 'A body free of aches', bad: 'Aches and tension' },
    { id: 'flexibility', q: 'How flexible and supple does your body feel?', lo: 'Very stiff', hi: 'Very supple', name: 'Flexibility', good: 'Flexible and supple', bad: 'Stiffness' },
    { id: 'balance', q: 'How steady are your balance and posture?', lo: 'Very unsteady', hi: 'Very steady', name: 'Balance & posture', good: 'Good balance and posture', bad: 'Balance and posture' },
    { id: 'fitness', q: 'How fit and strong do you feel?', lo: 'Not at all', hi: 'Very', name: 'Fitness', good: 'Fit and strong', bad: 'Fitness and strength' },
    { id: 'confidence', q: 'How confident do you feel in yourself?', lo: 'Not at all', hi: 'Very', name: 'Confidence', good: 'Confident in yourself', bad: 'Confidence' },
    { id: 'focus', q: 'How easily can you focus and concentrate?', lo: 'Hardly at all', hi: 'Very easily', name: 'Focus', good: 'Good focus', bad: 'Focus and concentration' },
    { id: 'direction', q: 'How clear do you feel about your goals and direction in life?', lo: 'Not at all', hi: 'Very clear', name: 'Direction', good: 'A clear sense of direction', bad: 'Direction and purpose' }
  ];
  var CHALLENGES = [
    ['Mind', ['Stress', 'Anxiety or worry', 'Overthinking', 'Feeling low']],
    ['Body', ['Back, neck or shoulder pain', 'Stiff joints or muscles', 'Recovering from an injury', 'Low fitness']],
    ['Rest and energy', ['Poor sleep', 'Tiredness', 'Burnout', 'Work pressure']],
    ['Personal growth', ['Low confidence', 'Lack of focus', 'Lack of direction', 'Wanting more discipline']]
  ];
  // [goal, short description, how it reads in a sentence]
  var GOALS = [
    ['Feel calmer', 'Less stress, a quieter mind', 'to feel calmer'],
    ['Sleep better', 'Rest that leaves you refreshed', 'to sleep better'],
    ['Ease pain and tension', 'Including recovering from an injury', 'to ease pain and tension'],
    ['Become more flexible', 'Move freely and easily', 'to become more flexible'],
    ['Improve balance and posture', 'Stand and move with ease', 'to improve your balance and posture'],
    ['Get fitter and stronger', 'Energy, strength and stamina', 'to get fitter and stronger'],
    ['Learn self-defence', 'Skills and awareness to stay safe', 'to learn self-defence'],
    ['Build confidence', 'Believe in yourself', 'to build your confidence'],
    ['Sharpen focus and discipline', 'Get more done, with less effort', 'to sharpen your focus and discipline'],
    ['Find direction and purpose', 'Know where you’re heading', 'to find direction and purpose']
  ];
  var GOAL_PHRASE = {};
  GOALS.forEach(function (g) { GOAL_PHRASE[g[0]] = g[2]; });
  var PREFS = {
    format: { q: 'How would you like to practise?', opts: ['In a group class', 'One to one', 'Online, from home', 'No preference'] },
    pace: { q: 'What pace suits you?', opts: ['Gentle and slow', 'Steady', 'Energetic', 'Not sure'] }
  };
  var STEPS = SCALES.length + 3;

  /* ------------------------------------------------------------------ what EmptyHands offers */
  var SERVICES = {
    taichi: { name: 'Tai Chi Chuan', k: '太極拳', page: 'tai-chi.html', interest: 'Tai Chi Chuan', cta: 'Book a trial class', first: 'your first Tai Chi class',
      when: 'Thursdays 6pm to 7pm in Ilford · £10 a class · book ahead',
      about: 'Slow, flowing Yang family Tai Chi with deep, steady breathing. Often called meditation in motion, it suits every age and fitness level.',
      benefits: ['Calms a busy mind and body', 'Better balance and posture', 'Gentle strength and suppleness, with deeper breathing'] },
    yoga: { name: 'Yoga', k: 'ヨガ', page: 'yoga.html', interest: 'Yoga', cta: 'Book a first class', first: 'your first Yoga class',
      when: 'Thursdays 8pm to 9pm in Ilford · drop in · £10 a class',
      about: 'Himalayan Hatha Yoga with Irm Sensei: breath, posture and stillness to ease the stresses of everyday life.',
      benefits: ['Stretches for a more flexible, supple body', 'Breathing practice that quietens the mind', 'Helps you wind down for better sleep'] },
    shiatsu: { name: 'Shiatsu', k: '指圧', page: 'shiatsu.html', interest: 'Shiatsu', cta: 'Book a free consultation', first: 'your free Shiatsu consultation',
      when: 'One to one in Ilford, by appointment · free 15-minute consultation',
      about: 'Japanese finger-pressure therapy with a Shiatsu Society registered practitioner, for mental wellbeing, self-care and recovery.',
      benefits: ['Eases aches, pain and tension', 'Support for recovery from injury', 'Deep, hands-on relaxation'] },
    coaching: { name: 'Wellbeing coaching', k: '指導', page: 'coaching.html', interest: 'Coaching', cta: 'Book a free consultation', first: 'your free coaching consultation',
      when: 'One to one in Ilford or on Teams · free 15-minute consultation, then £25 an hour',
      about: 'Person-centred coaching, including Coaching for Mental Health sessions, with Azeem Sensei (MA Coaching).',
      benefits: ['Space to talk through what’s holding you back', 'Builds confidence, focus and purpose', 'Small, practical steps you choose yourself'] },
    karate: { name: 'Karate-Dō', k: '空手道', page: 'karate.html', interest: 'Karate-Dō', cta: 'Book a trial class', first: 'your first Karate class',
      when: 'Thursdays 7pm to 9pm in Ilford · children and adults · £10 a lesson to start',
      about: 'Traditional Shotokan Karate for children (from 4) and adults, taught patiently, with the Dojo Kun at the close of every class.',
      benefits: ['Fitness, strength and self-defence skills', 'Confidence and self-belief', 'Focus, discipline and respect, with a friendly dojo family'] }
  };
  var ORDER = ['taichi', 'yoga', 'coaching', 'shiatsu', 'karate'];
  var BY_NAME = {};
  ORDER.forEach(function (k) { BY_NAME[SERVICES[k].name] = k; });

  /* How each answer points towards a service: [question, condition, points per service, reason shown to the visitor] */
  var SCALE_RULES = [
    ['stress', function (v) { return v >= 7; }, { taichi: 3, yoga: 2, shiatsu: 1, coaching: 1 }, 'You rated your stress {v} out of 10'],
    ['stress', function (v) { return v >= 9; }, { coaching: 1 }, ''],
    ['sleep', function (v) { return v <= 4; }, { yoga: 3, shiatsu: 2, taichi: 1 }, 'You rated your sleep {v} out of 10'],
    ['energy', function (v) { return v <= 4; }, { shiatsu: 2, taichi: 1, yoga: 1 }, 'Your energy is {v} out of 10'],
    ['pain', function (v) { return v >= 6; }, { shiatsu: 3, yoga: 1, taichi: 1 }, 'You carry pain or tension ({v} out of 10)'],
    ['flexibility', function (v) { return v <= 4; }, { yoga: 3, taichi: 1 }, 'Your flexibility is {v} out of 10'],
    ['balance', function (v) { return v <= 4; }, { taichi: 3, yoga: 1 }, 'Your balance and posture are {v} out of 10'],
    ['fitness', function (v) { return v <= 4; }, { karate: 2, taichi: 1, yoga: 1 }, 'Your fitness is {v} out of 10'],
    ['fitness', function (v) { return v >= 7; }, { karate: 1 }, ''],
    ['confidence', function (v) { return v <= 4; }, { karate: 2, coaching: 2 }, 'Your confidence is {v} out of 10'],
    ['focus', function (v) { return v <= 4; }, { karate: 2, taichi: 1, coaching: 1 }, 'Your focus is {v} out of 10'],
    ['direction', function (v) { return v <= 4; }, { coaching: 3 }, 'Your sense of direction is {v} out of 10']
  ];
  var CHALLENGE_RULES = {
    'Stress': { taichi: 2, yoga: 2, shiatsu: 1 }, 'Anxiety or worry': { taichi: 2, coaching: 2, yoga: 1 },
    'Overthinking': { taichi: 2, yoga: 1, coaching: 1 }, 'Feeling low': { coaching: 3, shiatsu: 1, taichi: 1 },
    'Back, neck or shoulder pain': { shiatsu: 3, yoga: 1, taichi: 1 }, 'Stiff joints or muscles': { yoga: 3, taichi: 2 },
    'Recovering from an injury': { shiatsu: 3, taichi: 1 }, 'Low fitness': { karate: 2, taichi: 1, yoga: 1 },
    'Poor sleep': { yoga: 2, shiatsu: 2 }, 'Tiredness': { shiatsu: 2, taichi: 1, yoga: 1 },
    'Burnout': { shiatsu: 2, coaching: 2, yoga: 1 }, 'Work pressure': { coaching: 2, taichi: 1 },
    'Low confidence': { karate: 2, coaching: 2 }, 'Lack of focus': { karate: 2, taichi: 1 },
    'Lack of direction': { coaching: 3 }, 'Wanting more discipline': { karate: 3 }
  };
  var GOAL_RULES = {
    'Feel calmer': { taichi: 4, yoga: 3 }, 'Sleep better': { yoga: 4, shiatsu: 3 },
    'Ease pain and tension': { shiatsu: 4, yoga: 2, taichi: 1 }, 'Become more flexible': { yoga: 4, taichi: 2 },
    'Improve balance and posture': { taichi: 4, yoga: 2 }, 'Get fitter and stronger': { karate: 4, taichi: 1, yoga: 1 },
    'Learn self-defence': { karate: 5 }, 'Build confidence': { karate: 3, coaching: 3 },
    'Sharpen focus and discipline': { karate: 4, taichi: 1 }, 'Find direction and purpose': { coaching: 4 }
  };
  var PREF_RULES = {
    'In a group class': [{ taichi: 1, yoga: 1, karate: 1 }, ''],
    'One to one': [{ shiatsu: 2, coaching: 2 }, 'You’d like one-to-one sessions'],
    'Online, from home': [{ coaching: 3 }, 'You’d like to practise online'],
    'Gentle and slow': [{ taichi: 2, yoga: 2, shiatsu: 1, karate: -2 }, 'You’d like a gentle pace'],
    'Steady': [{ yoga: 1, taichi: 1 }, ''],
    'Energetic': [{ karate: 3 }, 'You’d like something energetic']
  };

  /* Daily practices, chosen by matching their tags to the answers */
  var PRACTICES = {
    box: { name: 'Box breathing', min: 3, breath: 'box', tags: ['stress', 'Stress', 'Anxiety or worry', 'Overthinking', 'Work pressure', 'Feel calmer', 'focus'],
      steps: ['Sit tall and let your shoulders drop.', 'Breathe in through your nose for 4, hold for 4, breathe out for 4, hold for 4.', 'Repeat for 3 minutes. If holding feels uncomfortable, just breathe in for 4 and out for 4.'],
      why: 'Slowing your breath is one of the quickest ways to settle a racing mind.' },
    sleep: { name: 'Wind-down breath', min: 5, breath: 'sleep', tags: ['sleep', 'Poor sleep', 'Sleep better', 'Tiredness'],
      steps: ['In bed with the lights off, rest one hand on your belly.', 'Breathe in quietly through your nose for 4, hold for 7, then breathe out slowly through your mouth for 8.', 'Do 4 rounds, then let your breathing find its own rhythm. Skip the hold if it feels uncomfortable.'],
      why: 'A long, slow out-breath tells your body it’s safe to rest.' },
    calm: { name: 'Calm breathing', min: 5, breath: 'calm', tags: ['stress', 'Anxiety or worry', 'Feeling low', 'Burnout', 'Feel calmer'],
      steps: ['Sit or lie comfortably.', 'Breathe in gently through your nose for 4, then out for 6.', 'Keep going for 5 minutes, letting each out-breath be a little softer.'],
      why: 'Breathing out for longer than you breathe in helps you settle when feelings run high.' },
    wuchi: { name: 'Wu Chi standing', keepCase: true, min: 5, tags: ['balance', 'Improve balance and posture', 'Overthinking', 'Feel calmer', 'Find direction and purpose', 'focus'],
      steps: ['Stand with your feet shoulder-width apart, knees soft and arms hanging loosely.', 'Imagine a thread gently lifting the crown of your head, and let your weight sink into your feet.', 'Breathe slowly into your belly for 3 to 5 minutes, noticing your body without judging it.'],
      why: 'The standing meditation that begins Tai Chi practice. It steadies your posture and brings you into the present moment.' },
    oneleg: { name: 'One-leg balance', min: 3, tags: ['balance', 'Improve balance and posture', 'Recovering from an injury'],
      steps: ['Stand next to a wall or the back of a chair, so you can steady yourself.', 'Lift one foot a little and hold for 30 seconds, eyes on a point in front of you, breathing slowly.', 'Swap legs, and do two rounds each side. As it gets easier, let go of the support.'],
      why: 'A little balance practice every day builds steadiness, just as Tai Chi does.' },
    stretch: { name: 'Gentle morning stretch', min: 5, tags: ['flexibility', 'pain', 'Stiff joints or muscles', 'Become more flexible', 'Back, neck or shoulder pain', 'Ease pain and tension'],
      steps: ['Stand tall, breathe in and reach both arms up.', 'Breathe out and fold forward with soft knees, letting your head and arms hang. Roll up slowly.', 'Finish with five slow shoulder rolls and gentle neck turns each way. Move gently and stop if anything hurts.'],
      why: 'A few minutes of easy movement each morning keeps your body supple.' },
    scan: { name: 'Body scan', min: 10, tags: ['pain', 'sleep', 'Back, neck or shoulder pain', 'Ease pain and tension', 'Stiff joints or muscles', 'Feeling low'],
      steps: ['Lie down and close your eyes.', 'Move your attention slowly from your toes to the top of your head.', 'At each part of your body, notice any tightness and let it soften as you breathe out.'],
      why: 'Noticing where you hold tension is the first step to letting it go.' },
    palms: { name: 'Warm palms (Shiatsu self-care)', min: 2, tags: ['energy', 'pain', 'Tiredness', 'Burnout', 'Work pressure', 'Back, neck or shoulder pain'],
      steps: ['Rub your palms together briskly until they feel warm.', 'Cup them gently over your closed eyes and breathe slowly for 30 seconds.', 'Then press and circle gently with your fingertips along your shoulders and the base of your skull.'],
      why: 'A two-minute reset for tired eyes and a tense neck.' },
    horse: { name: 'Horse stance', min: 3, tags: ['fitness', 'Low fitness', 'Get fitter and stronger', 'Learn self-defence', 'Wanting more discipline', 'Sharpen focus and discipline'],
      steps: ['Stand with your feet about twice shoulder-width apart, toes pointing forward.', 'Bend your knees and sink down only as far as is comfortable, keeping your back straight.', 'Hold for 30 seconds while breathing steadily, rest, and repeat three times.'],
      why: 'Kiba-dachi, the horse-riding stance of Karate, builds leg strength, stamina and determination.' },
    walk: { name: 'Brisk mindful walk', min: 15, tags: ['energy', 'fitness', 'Low fitness', 'Tiredness', 'Feeling low', 'Get fitter and stronger'],
      steps: ['Take a 15-minute walk, outside if you can, at a pace that warms you up.', 'Notice five things you can see, four you can hear and three you can feel.', 'Let your breathing settle into the rhythm of your steps.'],
      why: 'Movement and fresh air lift your energy and mood.' },
    good: { name: 'Three good things', min: 5, tags: ['confidence', 'Low confidence', 'Build confidence', 'Feeling low'],
      steps: ['Each evening, write down three things that went well today, however small.', 'Next to each one, note what you did to help it happen.', 'On Sunday, read back over your week.'],
      why: 'It trains your attention to notice what’s going right, and what you’re capable of.' },
    mokuso: { name: 'One-minute mokuso', min: 1, tags: ['focus', 'Lack of focus', 'Sharpen focus and discipline', 'Wanting more discipline', 'Work pressure', 'Learn self-defence'],
      steps: ['Before something important, sit tall and close your eyes, as karateka do before training.', 'Breathe slowly and let your thoughts settle, like sand sinking in still water.', 'Open your eyes, choose one thing to do next, and do it.'],
      why: 'Mokuso, the meditation of Karate, clears your head before you act.' },
    step: { name: 'One small step', min: 5, tags: ['direction', 'confidence', 'Lack of direction', 'Find direction and purpose', 'Build confidence', 'Wanting more discipline'],
      steps: ['Each morning, finish this sentence: “Today, one small step towards the life I want is…”.', 'Make it something you can do in under 15 minutes.', 'Tick it off in the evening.'],
      why: 'Confidence and purpose grow from small promises you keep to yourself.' }
  };
  var BREATHS = {
    box: { name: 'Box breathing', phases: [['in', 4], ['hold', 4], ['out', 4], ['hold', 4]], rounds: 8 },
    sleep: { name: 'Wind-down breath', phases: [['in', 4], ['hold', 7], ['out', 8]], rounds: 4 },
    calm: { name: 'Calm breathing', phases: [['in', 4], ['out', 6]], rounds: 30 }
  };
  var GOAL_TIPS = {
    'Feel calmer': ['Choose a daily cue, like the kettle boiling, to take three slow breaths.', 'Spend ten minutes a day with no screens or noise.'],
    'Sleep better': ['Put screens away 30 minutes before bed.', 'Get up at the same time every day, even at weekends.'],
    'Ease pain and tension': ['If you sit a lot, stand up every hour, roll your shoulders and stretch for a minute.', 'Notice when you clench your jaw or shoulders, and let them soften as you breathe out.'],
    'Become more flexible': ['Stretch gently after a warm shower, when your muscles are warm.', 'Never force a stretch: ease into it on an out-breath and stop before it hurts.'],
    'Improve balance and posture': ['Each time you sit down, check your posture: feet flat, back tall, shoulders relaxed.', 'Practise standing on one leg while you brush your teeth, near something to hold.'],
    'Get fitter and stronger': ['Take the stairs and walk briskly whenever you can.', 'Add a few minutes to your daily movement each week.'],
    'Learn self-defence': ['Walk with your head up and your phone away: awareness is the first rule of self-defence.', 'Practise a strong, calm voice. Saying “Stop!” clearly is a self-defence skill too.'],
    'Build confidence': ['Do one small thing each day that feels slightly outside your comfort zone, and note it down.', 'Notice how you speak to yourself, and swap one harsh thought for a kinder one.'],
    'Sharpen focus and discipline': ['Give one task a day 25 minutes of full attention, with your phone in another room.', 'Keep one small promise to yourself every day, like your practice time.'],
    'Find direction and purpose': ['Write a paragraph about who you want to be a year from now.', 'Read your paragraph each Sunday and choose next week’s small step.']
  };

  /* ------------------------------------------------------------------ helpers */
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function $(sel, el) { return (el || root).querySelector(sel); }
  function $$(sel, el) { return Array.prototype.slice.call((el || root).querySelectorAll(sel)); }
  function load() { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; } }
  function save(d) { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) { /* private browsing: results just aren't kept */ } }
  function goodOf(s, v) { return s.invert ? 11 - v : v; }
  function fmtDate(t) { return new Date(t).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }); }
  function joinList(a) { return a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]; }
  function scrollToTop() {
    var y = root.getBoundingClientRect().top + window.scrollY - 110;
    if (Math.abs(window.scrollY - y) > 40) window.scrollTo({ top: y, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }

  var intro = $('.wb-intro'), quiz = $('.wb-quiz'), results = $('.wb-results');
  var answers, step;

  /* ------------------------------------------------------------------ the quiz */
  function start() {
    answers = { scores: {}, challenges: [], goal: '', format: '', pace: '' };
    step = 0;
    intro.hidden = true; results.hidden = true; quiz.hidden = false;
    showStep(true);
  }

  function stepHTML() {
    if (step < SCALES.length) {
      var s = SCALES[step], v = answers.scores[s.id];
      var pills = '';
      for (var i = 1; i <= 10; i++) {
        pills += '<label><input type="radio" name="wb-' + s.id + '" value="' + i + '"' + (v === i ? ' checked' : '') + '><span>' + i + '</span></label>';
      }
      return '<fieldset class="wb-q"><legend tabindex="-1"><span class="wb-sec">Section 1 of 4 · Your wellbeing today</span><span class="wb-qtext">' + esc(s.q) + '</span></legend>' +
        '<div class="wb-scale" role="radiogroup">' + pills + '</div>' +
        '<div class="wb-ends" aria-hidden="true"><span>1 · ' + esc(s.lo) + '</span><span>10 · ' + esc(s.hi) + '</span></div></fieldset>';
    }
    if (step === SCALES.length) {
      var groups = CHALLENGES.map(function (g) {
        return '<div class="wb-group"><h3>' + esc(g[0]) + '</h3><div class="choices">' + g[1].map(function (c) {
          return '<label><input type="checkbox" value="' + esc(c) + '"' + (answers.challenges.indexOf(c) >= 0 ? ' checked' : '') + '><span>' + esc(c) + '</span></label>';
        }).join('') + '</div></div>';
      }).join('');
      return '<fieldset class="wb-q"><legend tabindex="-1"><span class="wb-sec">Section 2 of 4 · What’s holding you back</span><span class="wb-qtext">What would you most like help with?</span></legend>' +
        '<p class="wb-hint">Choose up to three. <span class="wb-count" aria-live="polite"></span></p><div class="wb-groups">' + groups + '</div></fieldset>';
    }
    if (step === SCALES.length + 1) {
      var goals = GOALS.map(function (g) {
        return '<label class="wb-goal"><input type="radio" name="wb-goal" value="' + esc(g[0]) + '"' + (answers.goal === g[0] ? ' checked' : '') + '><span><strong>' + esc(g[0]) + '</strong><small>' + esc(g[1]) + '</small></span></label>';
      }).join('');
      return '<fieldset class="wb-q"><legend tabindex="-1"><span class="wb-sec">Section 3 of 4 · Your main goal</span><span class="wb-qtext">What would you most like to achieve?</span></legend>' +
        '<p class="wb-hint">Choose one.</p><div class="wb-goals">' + goals + '</div></fieldset>';
    }
    return '<div class="wb-q"><p class="wb-sec" id="wb-pref-h" tabindex="-1">Section 4 of 4 · How you like to train</p>' + Object.keys(PREFS).map(function (k) {
      return '<fieldset class="wb-pref"><legend class="wb-qtext">' + esc(PREFS[k].q) + '</legend><div class="wb-opts">' + PREFS[k].opts.map(function (o) {
        return '<label class="wb-goal"><input type="radio" name="wb-' + k + '" value="' + esc(o) + '"' + (answers[k] === o ? ' checked' : '') + '><span><strong>' + esc(o) + '</strong></span></label>';
      }).join('') + '</div></fieldset>';
    }).join('') + '</div>';
  }

  function canGoOn() {
    if (step < SCALES.length) return !!answers.scores[SCALES[step].id];
    if (step === SCALES.length) return true;
    if (step === SCALES.length + 1) return !!answers.goal;
    return !!(answers.format && answers.pace);
  }

  function showStep(focus) {
    var pct = Math.round(step / STEPS * 100);
    $('.wb-bar span', quiz).style.width = Math.max(4, pct) + '%';
    $('.wb-count-q', quiz).textContent = 'Question ' + (step + 1) + ' of ' + STEPS;
    $('.wb-body', quiz).innerHTML = stepHTML();
    $('[data-act="back"]', quiz).textContent = step ? 'Back' : 'Cancel';
    updateNext();
    if (step === SCALES.length) updateChallenges();
    scrollToTop();
    if (focus) { var lg = $('legend, #wb-pref-h', quiz); if (lg) lg.focus({ preventScroll: true }); }
  }

  function updateNext() {
    var next = $('[data-act="next"]', quiz);
    next.disabled = !canGoOn();
    next.textContent = step === STEPS - 1 ? 'See my results' : (step === SCALES.length && !answers.challenges.length ? 'Skip' : 'Next');
  }

  function updateChallenges() {
    var boxes = $$('.wb-groups input', quiz), n = answers.challenges.length;
    boxes.forEach(function (b) { b.disabled = !b.checked && n >= 3; });
    $('.wb-count', quiz).textContent = n ? n + ' of 3 chosen' : '';
  }

  function next() {
    if (!canGoOn()) return;
    if (step < STEPS - 1) { step++; showStep(true); }
    else finish();
  }

  quiz.addEventListener('change', function (e) {
    var t = e.target;
    if (step < SCALES.length && t.type === 'radio') answers.scores[SCALES[step].id] = Number(t.value);
    else if (t.type === 'checkbox') {
      answers.challenges = $$('.wb-groups input:checked', quiz).map(function (b) { return b.value; });
      updateChallenges();
    } else if (t.name === 'wb-goal') answers.goal = t.value;
    else if (t.name === 'wb-format' || t.name === 'wb-pace') answers[t.name.slice(3)] = t.value;
    updateNext();
  });
  // Tapping a number moves straight on (keyboard users choose with the arrow keys, then press Next).
  var autoTimer;
  quiz.addEventListener('pointerup', function (e) {
    var label = e.target.closest && e.target.closest('.wb-scale label');
    if (!label) return;
    clearTimeout(autoTimer);
    var at = step;
    autoTimer = setTimeout(function () { if (step === at && canGoOn()) next(); }, 280);
  });
  quiz.addEventListener('click', function (e) {
    var b = e.target.closest('[data-act]');
    if (!b) return;
    if (b.getAttribute('data-act') === 'next') next();
    if (b.getAttribute('data-act') === 'back') {
      if (step) { step--; showStep(true); }
      else { quiz.hidden = true; intro.hidden = false; scrollToTop(); }
    }
  });

  function finish() {
    var old = load();
    var rec = { at: Date.now(), a: answers, done: {}, ai: null };
    if (old && old.a) rec.prev = { at: old.at, scores: old.a.scores };
    save(rec);
    showResults(rec);
  }

  /* ------------------------------------------------------------------ working out the results */
  function analyse(a) {
    var pts = {}, why = {};
    ORDER.forEach(function (k) { pts[k] = 0; why[k] = []; });
    function add(map, reason, weight) {
      Object.keys(map).forEach(function (k) {
        var w = map[k] * (weight || 1);
        pts[k] += w;
        if (reason && w > 0) why[k].push({ t: reason, w: w });
      });
    }
    SCALE_RULES.forEach(function (r) {
      var v = a.scores[r[0]];
      if (r[1](v)) add(r[2], r[3].replace('{v}', v));
    });
    a.challenges.forEach(function (c) { add(CHALLENGE_RULES[c] || {}, 'You chose ' + c.toLowerCase() + ' as a challenge'); });
    add(GOAL_RULES[a.goal] || {}, 'You want ' + (GOAL_PHRASE[a.goal] || a.goal.toLowerCase()), 1.5);
    [a.format, a.pace].forEach(function (p) { var r = PREF_RULES[p]; if (r) add(r[0], r[1]); });
    ORDER.forEach(function (k) {
      why[k] = why[k].sort(function (x, y) { return y.w - x.w; }).map(function (x) { return x.t; });
    });
    var ranked = ORDER.slice().sort(function (x, y) { return pts[y] - pts[x] || ORDER.indexOf(x) - ORDER.indexOf(y); })
      .filter(function (k) { return pts[k] > 0; }).slice(0, 3);

    var dims = SCALES.map(function (s) { var v = a.scores[s.id]; return { s: s, v: v, g: goodOf(s, v) }; });
    var mean = dims.reduce(function (t, d) { return t + d.g; }, 0) / dims.length;
    var byGood = dims.slice().sort(function (x, y) { return y.g - x.g; });
    var strengths = byGood.filter(function (d) { return d.g >= 6; }).slice(0, 2);
    var focus = byGood.slice().reverse().filter(function (d) { return d.g <= 5; }).slice(0, 2);

    // Practices: goal counts most, then challenges, then low scores.
    var signals = {};
    signals[a.goal] = 3;
    a.challenges.forEach(function (c) { signals[c] = (signals[c] || 0) + 2; });
    dims.forEach(function (d) { if (d.g <= 4) signals[d.s.id] = (signals[d.s.id] || 0) + (d.g <= 2 ? 2 : 1); });
    var pr = Object.keys(PRACTICES).map(function (k) {
      return { k: k, n: PRACTICES[k].tags.reduce(function (t, tag) { return t + (signals[tag] || 0); }, 0) };
    }).sort(function (x, y) { return y.n - x.n; });
    var practices = [], breaths = 0;
    pr.forEach(function (p) {
      if (practices.length >= 3) return;
      if (PRACTICES[p.k].breath && breaths >= 2) return;
      if (PRACTICES[p.k].breath) breaths++;
      practices.push(p.k);
    });

    var band = mean < 4 ? ['Running on empty', 'Things feel heavy right now. That makes this a good moment to put yourself first, gently and one small step at a time.']
      : mean < 5.5 ? ['Under pressure', 'You’re carrying a lot. A few steady habits and the right support can make a real difference.']
        : mean < 7.5 ? ['Finding your balance', 'There’s plenty going well, and a few areas that would benefit from some care.']
          : ['In a good place', 'You’re doing well. It’s a great time to build on it and keep growing.'];
    var worry = a.scores.stress >= 9 || mean < 4 || (a.challenges.indexOf('Feeling low') >= 0 && (mean < 5 || a.scores.stress >= 7));
    return { pts: pts, why: why, ranked: ranked, dims: dims, mean: mean, strengths: strengths, focus: focus, practices: practices, band: band, worry: worry };
  }

  function inSentence(p) { return p.keepCase ? p.name : p.name.charAt(0).toLowerCase() + p.name.slice(1); }
  function planFor(a, r) {
    var main = SERVICES[r.ranked[0]], second = r.ranked[1] ? SERVICES[r.ranked[1]] : null;
    var p = r.practices.map(function (k) { return PRACTICES[k]; });
    var tips = GOAL_TIPS[a.goal] || ['', ''];
    return [
      ['Begin', ['Practise ' + inSentence(p[0]) + ' every day (' + p[0].min + ' minute' + (p[0].min > 1 ? 's' : '') + ').', 'Book ' + main.first + '.', 'Each evening, sum up how you feel in one word.']],
      ['Build', [p[1] ? 'Add ' + inSentence(p[1]) + ' on at least four days.' : 'Keep up your daily practice.', 'Go to ' + main.first + ' and notice how you feel afterwards.', tips[0]]],
      ['Deepen', [p[2] ? 'Try ' + inSentence(p[2]) + ', or repeat your favourite practice.' : 'Repeat your favourite practice.', second ? 'Keep going with ' + main.name + ', and try ' + second.name + ' if it appeals.' : 'Keep going with ' + main.name + '.', tips[1]]],
      ['Reflect', ['Keep your daily practice going: it’s becoming a habit.', 'Take this assessment again and see what’s changed.', 'Choose what you’ll carry on with next month.']]
    ];
  }

  /* ------------------------------------------------------------------ showing the results */
  function serviceCard(k, r, main) {
    var s = SERVICES[k], reasons = r.why[k].slice(0, 3);
    return '<article class="wb-svc' + (main ? ' wb-svc--main' : '') + '">' +
      '<div class="wb-svc-head"><span class="k kanji" aria-hidden="true">' + s.k + '</span><div>' + (main ? '<span class="wb-tag">Best match</span>' : '<span class="wb-tag wb-tag--soft">Also suits you</span>') +
      '<h3>' + esc(s.name) + '</h3><p class="wb-when">' + esc(s.when) + '</p></div></div>' +
      '<p>' + esc(s.about) + '</p>' +
      (reasons.length ? '<p class="wb-why-h">Why it suits you</p><ul class="wb-why">' + reasons.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' : '') +
      (main ? '<p class="wb-why-h">How it can help</p><ul class="wb-benefits">' + s.benefits.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' : '') +
      '<div class="btn-row"><a class="btn ' + (main ? 'btn--seal' : 'btn--ghost') + '" href="' + joinLink(k, r) + '">' + esc(s.cta) + '</a><a class="link-arrow" href="' + s.page + '">About ' + esc(s.name) + '</a></div></article>';
  }

  function joinLink(k, r) {
    var names = [k].concat(r.ranked.filter(function (x) { return x !== k; })).slice(0, 2).map(function (x) { return SERVICES[x].interest; });
    return 'join.html?interest=' + encodeURIComponent(names.join('|')) + '&from=wellbeing';
  }

  function ring(score) {
    var c = 2 * Math.PI * 52, off = c * (1 - score / 100);
    return '<svg class="wb-ring" viewBox="0 0 120 120" role="img" aria-label="Balance today: ' + score + ' out of 100"><circle cx="60" cy="60" r="52" class="wb-ring-bg"/>' +
      '<circle cx="60" cy="60" r="52" class="wb-ring-fg" stroke-dasharray="' + c.toFixed(1) + '" stroke-dashoffset="' + off.toFixed(1) + '"/>' +
      '<text x="60" y="58" text-anchor="middle" class="wb-ring-n">' + score + '</text><text x="60" y="80" text-anchor="middle" class="wb-ring-l">out of 100</text></svg>';
  }

  function showResults(rec) {
    var a = rec.a, r = analyse(a), plan = planFor(a, r), score = Math.round((r.mean - 1) / 9 * 100);
    var prev = rec.prev && rec.prev.scores;
    var bars = r.dims.map(function (d) {
      var lvl = d.g <= 4 ? 'low' : d.g <= 6 ? 'mid' : 'high';
      var change = '';
      if (prev && prev[d.s.id]) {
        var diff = d.g - goodOf(d.s, prev[d.s.id]);
        if (diff) change = '<span class="wb-diff ' + (diff > 0 ? 'up' : 'down') + '" title="Since ' + fmtDate(rec.prev.at) + '">' + (diff > 0 ? '▲' : '▼') + Math.abs(diff) + '</span>';
      }
      return '<li class="wb-dim wb-dim--' + lvl + '"><span class="wb-dim-name">' + esc(d.s.name) + '</span><span class="wb-dim-bar"><i style="width:' + (d.v * 10) + '%"></i></span>' +
        '<span class="wb-dim-v">' + d.v + '<small>/10</small>' + change + '</span></li>';
    }).join('');
    var strengths = r.strengths.length ? r.strengths.map(function (d) { return '<li>' + esc(d.s.good) + ' <span class="muted">(' + d.v + '/10)</span></li>'; }).join('')
      : '<li>You’ve taken the first step by stopping to check in with yourself.</li>';
    var focus = r.focus.length ? r.focus.map(function (d) { return '<li>' + esc(d.s.bad) + ' <span class="muted">(' + d.v + '/10)</span></li>'; }).join('')
      : '<li>Nothing stands out. Keep doing what’s working.</li>';
    var practices = r.practices.map(function (k, i) {
      var p = PRACTICES[k];
      return '<article class="wb-prac"><div class="wb-prac-head"><span class="wb-num">' + (i + 1) + '</span><h3>' + esc(p.name) + '</h3><span class="wb-min">' + p.min + ' min</span></div>' +
        '<ol>' + p.steps.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ol><p class="muted">' + esc(p.why) + '</p>' +
        (p.breath ? '<button class="btn btn--ghost wb-breathe" type="button" data-breath="' + p.breath + '">Breathe along with me</button>' : '') + '</article>';
    }).join('');
    var weeks = plan.map(function (w, i) {
      return '<div class="wb-week"><p class="wb-week-h"><span>Week ' + (i + 1) + '</span>' + esc(w[0]) + '</p><ul>' + w[1].filter(Boolean).map(function (x, j) {
        var id = 'w' + i + '-' + j;
        return '<li><label class="check"><input type="checkbox" data-done="' + id + '"' + (rec.done && rec.done[id] ? ' checked' : '') + '> <span>' + esc(x) + '</span></label></li>';
      }).join('') + '</ul></div>';
    }).join('');
    var others = r.ranked.slice(1).map(function (k) { return serviceCard(k, r, false); }).join('');
    var shareText = 'Hello, I’ve just done the EmptyHands wellbeing assessment. My suggested path is ' + joinList(r.ranked.map(function (k) { return SERVICES[k].name; })) +
      ', and I want ' + (GOAL_PHRASE[a.goal] || a.goal.toLowerCase()) + '. Could we arrange a first session?';

    results.innerHTML =
      '<div class="wb-top">' + ring(score) + '<div><span class="eyebrow">Your results · ' + fmtDate(rec.at) + '</span><h2 tabindex="-1">' + esc(r.band[0]) + '</h2><p>' + esc(r.band[1]) + '</p>' +
        '<p class="wb-goalline">You want <strong>' + esc(GOAL_PHRASE[a.goal] || a.goal.toLowerCase()) + '</strong>' + (a.challenges.length ? ', with help for ' + esc(joinList(a.challenges.map(function (c) { return c.charAt(0).toLowerCase() + c.slice(1); }))) : '') + '.</p></div></div>' +
      (r.worry ? '<aside class="wb-alert" role="note"><h3>Please look after yourself</h3><p>Your answers suggest things are hard right now. You don’t have to wait for a class or a plan. Talk to your GP, call <strong>NHS 111</strong> and choose the mental health option, or call <strong>Samaritans free on 116 123</strong>, day or night. You can also text <strong>SHOUT to 85258</strong>. If you’re in danger, call <strong>999</strong>.</p></aside>' : '') +
      '<section class="wb-block"><h2 class="wb-h">Where you are today</h2><ul class="wb-dims">' + bars + '</ul>' +
        '<p class="wb-dims-key"><span><i style="background:var(--ok)"></i>Going well</span><span><i style="background:var(--mid)"></i>Okay</span><span><i style="background:var(--low)"></i>Needs care</span></p>' +
        (prev ? '<p class="wb-fine">Arrows show the change since ' + fmtDate(rec.prev.at) + ' (▲ better, ▼ harder).</p>' : '') +
        '<div class="wb-two"><div><h3>Your strengths</h3><ul class="wb-list wb-list--good">' + strengths + '</ul></div><div><h3>Areas to care for</h3><ul class="wb-list wb-list--care">' + focus + '</ul></div></div></section>' +
      '<section class="wb-block"><h2 class="wb-h">Your recommended path</h2>' + serviceCard(r.ranked[0], r, true) + (others ? '<div class="wb-others">' + others + '</div>' : '') + '</section>' +
      '<section class="wb-block"><h2 class="wb-h">Start today: three daily practices</h2><p class="wb-sub">Simple things you can do at home. Breathwork, mindfulness and meditation are also part of our Tai Chi and Yoga classes.</p><div class="wb-pracs">' + practices + '</div></section>' +
      '<section class="wb-block"><h2 class="wb-h">Your 30-day plan</h2><p class="wb-sub">Tick things off as you go. Your ticks are saved on this device.</p><div class="wb-weeks">' + weeks + '</div></section>' +
      '<section class="wb-block wb-ai" hidden></section>' +
      '<div class="wb-actions btn-row"><a class="btn btn--seal" href="' + joinLink(r.ranked[0], r) + '">' + esc(SERVICES[r.ranked[0]].cta) + '</a>' +
        '<a class="btn btn--ghost" href="https://wa.me/447931300470?text=' + encodeURIComponent(shareText) + '" target="_blank" rel="noopener">Talk it over on WhatsApp</a>' +
        '<button class="btn btn--ghost" type="button" data-act="print">Save or print</button><button class="btn btn--ghost" type="button" data-act="again">Take the assessment again</button></div>' +
      '<p class="wb-fine">This is a guide to general wellbeing, not a medical or psychological assessment. If you’re worried about your health, please speak to your GP. Your answers are kept only on this device.</p>';

    intro.hidden = true; quiz.hidden = true; results.hidden = false;
    scrollToTop();
    var h = $('h2', results); if (h) h.focus({ preventScroll: true });
    setUpAI(rec);
  }

  results.addEventListener('change', function (e) {
    var id = e.target.getAttribute('data-done');
    if (!id) return;
    var rec = load(); if (!rec) return;
    rec.done = rec.done || {};
    rec.done[id] = e.target.checked;
    save(rec);
  });
  results.addEventListener('click', function (e) {
    var b = e.target.closest('button');
    if (!b) return;
    if (b.getAttribute('data-act') === 'print') window.print();
    if (b.getAttribute('data-act') === 'again') start();
    if (b.getAttribute('data-breath')) breathe(b.getAttribute('data-breath'), b);
  });

  /* ------------------------------------------------------------------ the AI report */
  function setUpAI(rec) {
    var box = $('.wb-ai', results);
    if (!API || !box || !window.fetch) return;
    if (rec.ai) { box.hidden = false; box.innerHTML = aiHTML(rec.ai); return; }
    fetch(API, { method: 'GET', cache: 'no-store' }).then(function (r) { return r.json(); }).then(function (d) {
      if (!d || !d.ready) return;
      box.hidden = false;
      box.innerHTML = '<h2 class="wb-h">Want a fuller picture?</h2><div class="wb-ai-offer"><p>Get a personal report written by AI from your answers: your main challenges, strengths, the service that suits you best, daily practices and a 30-day plan, written just for you. It takes up to a minute.</p>' +
        '<label class="check"><input type="checkbox" class="wb-consent"> <span>I agree to send my answers (the numbers and choices only, never my name or contact details) to EmptyHands and to Anthropic, the company that makes the AI Claude, to write my report. EmptyHands doesn’t keep them, and Anthropic doesn’t use them to train its AI. <a href="privacy.html#wellbeing">Privacy</a></span></label>' +
        '<div class="btn-row"><button class="btn btn--seal wb-ai-go" type="button" disabled>Write my personal report</button></div><p class="wb-ai-status" role="status"></p></div>';
      var consent = $('.wb-consent', box), go = $('.wb-ai-go', box);
      consent.addEventListener('change', function () { go.disabled = !consent.checked; });
      go.addEventListener('click', function () { askAI(rec, box, go); });
    }).catch(function () { /* reports unavailable: just leave the offer out */ });
  }

  function askAI(rec, box, go) {
    var status = $('.wb-ai-status', box), lines = ['Reading your answers…', 'Looking at what you’d like help with…', 'Matching you with the right practice…', 'Writing your 30-day plan…', 'Nearly there…'], i = 0;
    go.disabled = true;
    status.textContent = lines[0];
    box.classList.add('is-busy');
    var tick = setInterval(function () { i = Math.min(i + 1, lines.length - 1); status.textContent = lines[i]; }, 6000);
    fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ consent: true, scores: rec.a.scores, challenges: rec.a.challenges, goal: rec.a.goal, format: rec.a.format, pace: rec.a.pace }) })
      .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, code: r.status, d: d }; }); })
      .then(function (res) {
        clearInterval(tick); box.classList.remove('is-busy');
        if (res.ok && res.d && res.d.report) {
          var cur = load() || rec;
          cur.ai = res.d.report; save(cur);
          box.innerHTML = aiHTML(res.d.report);
          box.scrollIntoView({ behavior: 'smooth', block: 'start' });
          return;
        }
        go.disabled = false;
        status.textContent = res.code === 429 ? 'We’ve written as many reports as we can for today. Please try again tomorrow.' : 'Sorry, your report couldn’t be written just now. Please try again in a few minutes.';
      })
      .catch(function () { clearInterval(tick); box.classList.remove('is-busy'); go.disabled = false; status.textContent = 'Sorry, we couldn’t connect. Please check your internet connection and try again.'; });
  }

  function aiHTML(rep) {
    function list(a) { return '<ul class="wb-list">' + (a || []).map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>'; }
    function svc(s, main) {
      var k = BY_NAME[s.service], meta = k ? SERVICES[k] : null;
      return '<div class="wb-ai-svc' + (main ? ' is-main' : '') + '"><h4>' + esc(s.service) + (meta ? ' <span class="k kanji">' + meta.k + '</span>' : '') + '</h4><p>' + esc(s.why) + '</p>' +
        (meta ? '<p><a class="link-arrow" href="' + meta.page + '">About ' + esc(meta.name) + '</a></p>' : '') + '</div>';
    }
    return '<h2 class="wb-h">Your personal report</h2><div class="wb-ai-report">' +
      '<h3 class="wb-ai-headline">' + esc(rep.headline) + '</h3><p>' + esc(rep.summary) + '</p>' +
      '<div class="wb-two"><div><h4>Main challenge: ' + esc(rep.primary_challenge.title) + '</h4><p>' + esc(rep.primary_challenge.explanation) + '</p></div>' +
      '<div><h4>Also: ' + esc(rep.secondary_challenge.title) + '</h4><p>' + esc(rep.secondary_challenge.explanation) + '</p></div></div>' +
      '<div class="wb-two"><div><h4>Your strengths</h4>' + list(rep.strengths) + '</div><div><h4>Things to keep an eye on</h4>' + list(rep.concerns) + '</div></div>' +
      '<h4>Recommended for you</h4>' + svc(rep.recommended_service, true) + (rep.also_consider || []).map(function (s) { return svc(s, false); }).join('') +
      '<h4>Daily practices</h4><div class="wb-pracs">' + (rep.daily_practices || []).map(function (p, i) {
        return '<article class="wb-prac"><div class="wb-prac-head"><span class="wb-num">' + (i + 1) + '</span><h3>' + esc(p.name) + '</h3><span class="wb-min">' + esc(p.minutes) + ' min</span></div><p>' + esc(p.how) + '</p><p class="muted">' + esc(p.why) + '</p></article>';
      }).join('') + '</div>' +
      '<h4>Your 30 days</h4><div class="wb-weeks">' + (rep.plan || []).map(function (w) {
        return '<div class="wb-week"><p class="wb-week-h"><span>Week ' + esc(w.week) + '</span>' + esc(w.focus) + '</p>' + list(w.actions) + '</div>';
      }).join('') + '</div>' +
      '<p class="wb-ai-closing">' + esc(rep.closing) + '</p>' +
      '<p class="wb-fine">Written by AI (Claude, made by Anthropic) from your answers. It can get things wrong and isn’t medical advice.</p></div>';
  }

  /* ------------------------------------------------------------------ guided breathing */
  var dlg = document.getElementById('wb-breath');
  var breathTimer = null, opener = null;
  function breathe(id, from) {
    var b = BREATHS[id];
    if (!dlg || !b) return;
    opener = from;
    var circle = dlg.querySelector('.wb-orb'), word = dlg.querySelector('.wb-orb-word'), count = dlg.querySelector('.wb-orb-count'), round = dlg.querySelector('.wb-breath-round');
    dlg.querySelector('h2').textContent = b.name;
    var phase = 0, left = 0, r = 1, size = 0.55;
    var words = { 'in': 'Breathe in', 'hold': 'Hold', 'out': 'Breathe out' };
    function setPhase() {
      var p = b.phases[phase];
      left = p[1];
      word.textContent = words[p[0]];
      if (p[0] === 'in') size = 1; else if (p[0] === 'out') size = 0.55;
      circle.style.transitionDuration = p[0] === 'hold' ? '0s' : p[1] + 's';
      circle.style.transform = 'scale(' + size + ')';
      count.textContent = left;
      round.textContent = 'Round ' + r + ' of ' + b.rounds;
    }
    function tick() {
      left--;
      if (left > 0) { count.textContent = left; return; }
      phase++;
      if (phase >= b.phases.length) { phase = 0; r++; }
      if (r > b.rounds) { stop(); word.textContent = 'Well done'; count.textContent = ''; round.textContent = 'Notice how you feel now.'; return; }
      setPhase();
    }
    function stop() { clearInterval(breathTimer); breathTimer = null; }
    stop();
    circle.style.transitionDuration = '0s';
    circle.style.transform = 'scale(0.55)';
    word.textContent = 'Get comfortable'; count.textContent = '3'; round.textContent = '';
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
    var lead = 3;
    breathTimer = setInterval(function () {
      lead--;
      if (lead > 0) { count.textContent = lead; return; }
      clearInterval(breathTimer);
      setPhase();
      breathTimer = setInterval(tick, 1000);
    }, 1000);
  }
  if (dlg) {
    var closeBreath = function () { clearInterval(breathTimer); breathTimer = null; if (dlg.open && dlg.close) dlg.close(); else dlg.removeAttribute('open'); };
    dlg.querySelector('[data-act="close"]').addEventListener('click', closeBreath);
    dlg.addEventListener('close', function () { clearInterval(breathTimer); breathTimer = null; if (opener) opener.focus(); });
  }

  /* ------------------------------------------------------------------ start up */
  quiz.innerHTML = '<div class="wb-progress"><div class="wb-bar"><span></span></div><span class="wb-count-q" aria-live="polite"></span></div><div class="wb-body"></div>' +
    '<div class="wb-nav"><button class="btn btn--ghost" type="button" data-act="back">Back</button><button class="btn btn--seal" type="button" data-act="next">Next</button></div>';
  var last = load();
  var lastBtn = $('[data-act="last"]', intro);
  if (last && last.a && lastBtn) {
    lastBtn.hidden = false;
    lastBtn.textContent = 'See my results from ' + fmtDate(last.at);
    lastBtn.addEventListener('click', function () { showResults(load()); });
  }
  $('[data-act="start"]', intro).addEventListener('click', start);
  intro.classList.add('is-ready');
})();
