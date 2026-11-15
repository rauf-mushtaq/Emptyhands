/* EmptyHands wellbeing assessment ("Discover your wellbeing practice", wellbeing.html).
   Two versions: teens and adults, and children aged 6 to 11 with simple questions and
   smiley-face answers. Everything is worked out in the browser and kept only on this device.
   The optional AI report (grown-ups only) sends the answers, numbers and choices only, to the
   wellbeingReport Cloud Function. */
(function () {
  'use strict';
  var root = document.getElementById('wb');
  if (!root) return;
  var API = root.getAttribute('data-ai') || '';
  var KEY = 'eh-wellbeing-3';  // results saved by earlier versions of the questions are left alone

  /* ================================================================== what EmptyHands offers */
  var SERVICES = {
    taichi: { name: 'Tai Chi Chuan', k: '太極拳', page: 'tai-chi.html', interest: 'Tai Chi Chuan', cta: 'Book a trial class', first: 'your first Tai Chi class',
      when: 'Thursdays 6pm to 7pm in Ilford · £10 a class · book ahead' },
    yoga: { name: 'Yoga', k: 'ヨガ', page: 'yoga.html', interest: 'Yoga', cta: 'Book a first class', first: 'your first Yoga class',
      when: 'Thursdays 8pm to 9pm in Ilford · drop in · £10 a class' },
    shiatsu: { name: 'Shiatsu', k: '指圧', page: 'shiatsu.html', interest: 'Shiatsu', cta: 'Book a free consultation', first: 'your free Shiatsu consultation',
      when: 'One to one in Ilford · free 15-minute consultation' },
    coaching: { name: 'Wellbeing coaching', k: '指導', page: 'coaching.html', interest: 'Coaching', cta: 'Book a free consultation', first: 'your free coaching consultation',
      when: 'One to one in Ilford or on Teams · free 15-minute consultation' },
    karate: { name: 'Karate-Dō', k: '空手道', page: 'karate.html', interest: 'Karate-Dō', cta: 'Book a trial class', first: 'your first Karate class',
      when: 'Thursdays 7pm to 9pm in Ilford · £10 a lesson to start' },
    kids: { name: 'Karate-Dō for children', link: 'About our Karate classes', k: '空手道', page: 'karate.html', interest: 'Karate-Dō', cta: 'Book a trial class', first: 'your first Karate class',
      when: 'Thursdays 7pm to 9pm in Ilford · from age 4 · £10 a lesson to start' }
  };
  var ORDER = ['taichi', 'yoga', 'coaching', 'shiatsu', 'karate'];
  var BY_NAME = {};
  ORDER.forEach(function (k) { BY_NAME[SERVICES[k].name] = k; });

  /* ================================================================== grown-ups' questions
     Each one points towards something EmptyHands teaches. */
  var A = {};
  A.scales = [
    { id: 'stress', grp: 'Your mind', q: 'How stressed or anxious do you feel?', lo: 'Not at all', hi: 'Extremely', invert: true, name: 'Stress', good: 'Stress in check', bad: 'Stress and worry' },
    { id: 'sleep', grp: 'Your mind', q: 'How well do you sleep?', lo: 'Very badly', hi: 'Very well', name: 'Sleep', good: 'Sleeping well', bad: 'Sleep' },
    { id: 'focus', grp: 'Your mind', q: 'How easily can you focus and concentrate?', lo: 'Hardly at all', hi: 'Very easily', name: 'Focus', good: 'Good focus', bad: 'Focus' },
    { id: 'energy', grp: 'Your body', q: 'How much energy do you have?', lo: 'Very little', hi: 'Plenty', name: 'Energy', good: 'Good energy', bad: 'Energy' },
    { id: 'breathing', grp: 'Your body', q: 'How easily can you breathe slowly and deeply?', lo: 'Very hard', hi: 'Very easily', name: 'Breathing', good: 'Calm, deep breathing', bad: 'Breathing' },
    { id: 'pain', grp: 'Your body', q: 'How much pain, tension or stiffness do you carry in your body?', lo: 'None', hi: 'A lot', invert: true, name: 'Aches & tension', good: 'Few aches and pains', bad: 'Aches and tension' },
    { id: 'flexibility', grp: 'Your body', q: 'How flexible and supple does your body feel?', lo: 'Very stiff', hi: 'Very supple', name: 'Flexibility', good: 'Flexible', bad: 'Flexibility' },
    { id: 'balance', grp: 'Your body', q: 'How steady are your balance and posture?', lo: 'Very unsteady', hi: 'Very steady', name: 'Balance', good: 'Good balance', bad: 'Balance and posture' },
    { id: 'fitness', grp: 'Your body', q: 'How fit and strong do you feel?', lo: 'Not at all', hi: 'Very', name: 'Fitness', good: 'Fit and strong', bad: 'Fitness' },
    { id: 'confidence', grp: 'You', q: 'How confident do you feel in yourself?', lo: 'Not at all', hi: 'Very', name: 'Confidence', good: 'Confident', bad: 'Confidence' },
    { id: 'safety', grp: 'You', q: 'How confident are you that you could keep yourself safe?', lo: 'Not at all', hi: 'Very', name: 'Self-defence', good: 'Able to keep safe', bad: 'Feeling safe' },
    { id: 'selfcare', grp: 'You', q: 'How often do you make time to look after yourself?', lo: 'Never', hi: 'Every day', name: 'Self-care', good: 'Time for yourself', bad: 'Time for yourself' },
    { id: 'direction', grp: 'You', q: 'How clear do you feel about your goals and direction in life?', lo: 'Not at all', hi: 'Very clear', name: 'Direction', good: 'Clear direction', bad: 'Direction' }
  ];
  A.challenges = [
    ['Mind', ['Stress', 'Anxiety or worry', 'Overthinking', 'Feeling low']],
    ['Body', ['Back, neck or shoulder pain', 'Stiff joints or muscles', 'Recovering from an injury', 'Low fitness']],
    ['Rest and energy', ['Poor sleep', 'Tiredness', 'Burnout', 'Work pressure']],
    ['Personal growth', ['Low confidence', 'Lack of focus', 'Lack of direction', 'Wanting more discipline']]
  ];
  A.goals = [ // [goal, short description, how it reads in a sentence]
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
  A.formats = ['In a group class', 'One to one', 'Online, from home', 'No preference'];
  A.paces = ['Gentle and slow', 'Steady', 'Energetic', 'Not sure'];
  A.appeals = [ // [what appeals, points, reason]
    ['Martial arts', { karate: 2 }, 'Martial arts appeal to you'],
    ['Slow, flowing movement', { taichi: 2 }, 'Slow, flowing movement appeals to you'],
    ['Stretching and breathing', { yoga: 2 }, 'Stretching and breathing appeal to you'],
    ['Hands-on therapy', { shiatsu: 2 }, 'Hands-on therapy appeals to you'],
    ['Talking things through', { coaching: 2 }, 'Talking things through appeals to you'],
    ['Meditation', { taichi: 1, yoga: 1 }, 'Meditation appeals to you']
  ];
  // [question, condition, points per service, reason shown to the visitor]
  A.scaleRules = [
    ['stress', function (v) { return v >= 7; }, { taichi: 3, yoga: 2, shiatsu: 1, coaching: 1 }, 'You rated your stress {v} out of 10'],
    ['stress', function (v) { return v >= 9; }, { coaching: 1 }, ''],
    ['sleep', function (v) { return v <= 4; }, { yoga: 3, shiatsu: 2, taichi: 1 }, 'You rated your sleep {v} out of 10'],
    ['focus', function (v) { return v <= 4; }, { karate: 2, taichi: 1, coaching: 1 }, 'Your focus is {v} out of 10'],
    ['energy', function (v) { return v <= 4; }, { shiatsu: 2, taichi: 1, yoga: 1 }, 'Your energy is {v} out of 10'],
    ['breathing', function (v) { return v <= 4; }, { taichi: 2, yoga: 2 }, 'Slow, deep breathing is hard for you ({v} out of 10)'],
    ['pain', function (v) { return v >= 6; }, { shiatsu: 3, yoga: 1, taichi: 1 }, 'You carry pain or tension ({v} out of 10)'],
    ['flexibility', function (v) { return v <= 4; }, { yoga: 3, taichi: 1 }, 'Your flexibility is {v} out of 10'],
    ['balance', function (v) { return v <= 4; }, { taichi: 3, yoga: 1 }, 'Your balance and posture are {v} out of 10'],
    ['fitness', function (v) { return v <= 4; }, { karate: 2, taichi: 1, yoga: 1 }, 'Your fitness is {v} out of 10'],
    ['fitness', function (v) { return v >= 7; }, { karate: 1 }, ''],
    ['confidence', function (v) { return v <= 4; }, { karate: 2, coaching: 2 }, 'Your confidence is {v} out of 10'],
    ['safety', function (v) { return v <= 4; }, { karate: 3 }, 'You’d like to feel safer ({v} out of 10)'],
    ['selfcare', function (v) { return v <= 4; }, { shiatsu: 2, yoga: 1, coaching: 1 }, 'You rarely make time for yourself ({v} out of 10)'],
    ['direction', function (v) { return v <= 4; }, { coaching: 3 }, 'Your sense of direction is {v} out of 10']
  ];
  A.challengeRules = {
    'Stress': { taichi: 2, yoga: 2, shiatsu: 1 }, 'Anxiety or worry': { taichi: 2, coaching: 2, yoga: 1 },
    'Overthinking': { taichi: 2, yoga: 1, coaching: 1 }, 'Feeling low': { coaching: 3, shiatsu: 1, taichi: 1 },
    'Back, neck or shoulder pain': { shiatsu: 3, yoga: 1, taichi: 1 }, 'Stiff joints or muscles': { yoga: 3, taichi: 2 },
    'Recovering from an injury': { shiatsu: 3, taichi: 1 }, 'Low fitness': { karate: 2, taichi: 1, yoga: 1 },
    'Poor sleep': { yoga: 2, shiatsu: 2 }, 'Tiredness': { shiatsu: 2, taichi: 1, yoga: 1 },
    'Burnout': { shiatsu: 2, coaching: 2, yoga: 1 }, 'Work pressure': { coaching: 2, taichi: 1 },
    'Low confidence': { karate: 2, coaching: 2 }, 'Lack of focus': { karate: 2, taichi: 1 },
    'Lack of direction': { coaching: 3 }, 'Wanting more discipline': { karate: 3 }
  };
  A.goalRules = {
    'Feel calmer': { taichi: 4, yoga: 3 }, 'Sleep better': { yoga: 4, shiatsu: 3 },
    'Ease pain and tension': { shiatsu: 4, yoga: 2, taichi: 1 }, 'Become more flexible': { yoga: 4, taichi: 2 },
    'Improve balance and posture': { taichi: 4, yoga: 2 }, 'Get fitter and stronger': { karate: 4, taichi: 1, yoga: 1 },
    'Learn self-defence': { karate: 5 }, 'Build confidence': { karate: 3, coaching: 3 },
    'Sharpen focus and discipline': { karate: 4, taichi: 1 }, 'Find direction and purpose': { coaching: 4 }
  };
  A.prefRules = {
    'In a group class': [{ taichi: 1, yoga: 1, karate: 1 }, ''],
    'One to one': [{ shiatsu: 2, coaching: 2 }, 'You’d like one-to-one sessions'],
    'Online, from home': [{ coaching: 3 }, 'You’d like to practise online'],
    'Gentle and slow': [{ taichi: 2, yoga: 2, shiatsu: 1, karate: -2 }, 'You’d like a gentle pace'],
    'Steady': [{ yoga: 1, taichi: 1 }, ''],
    'Energetic': [{ karate: 3 }, 'You’d like something energetic']
  };
  A.practices = {
    box: { name: 'Box breathing', todo: 'Practise box breathing', min: 3, breath: 'box', tags: ['stress', 'breathing', 'Stress', 'Anxiety or worry', 'Overthinking', 'Work pressure', 'Feel calmer', 'focus'],
      steps: ['Sit tall and let your shoulders drop.', 'Breathe in through your nose for 4, hold for 4, breathe out for 4, hold for 4.', 'Repeat for 3 minutes. If holding feels uncomfortable, just breathe in for 4 and out for 4.'],
      why: 'Slowing your breath is one of the quickest ways to settle a racing mind.' },
    sleep: { name: 'Wind-down breath', todo: 'Do the wind-down breath at bedtime', min: 5, breath: 'sleep', tags: ['sleep', 'Poor sleep', 'Sleep better', 'Tiredness'],
      steps: ['In bed with the lights off, rest one hand on your belly.', 'Breathe in quietly through your nose for 4, hold for 7, then breathe out slowly through your mouth for 8.', 'Do 4 rounds, then let your breathing find its own rhythm. Skip the hold if it feels uncomfortable.'],
      why: 'A long, slow out-breath tells your body it’s safe to rest.' },
    calm: { name: 'Calm breathing', todo: 'Practise calm breathing', min: 5, breath: 'calm', tags: ['stress', 'breathing', 'Anxiety or worry', 'Feeling low', 'Burnout', 'Feel calmer', 'Meditation'],
      steps: ['Sit or lie comfortably.', 'Breathe in gently through your nose for 4, then out for 6.', 'Keep going for 5 minutes, letting each out-breath be a little softer.'],
      why: 'Breathing out for longer than you breathe in helps you settle when feelings run high.' },
    wuchi: { name: 'Wu Chi standing', todo: 'Practise Wu Chi standing', min: 5, tags: ['balance', 'breathing', 'Improve balance and posture', 'Overthinking', 'Feel calmer', 'Find direction and purpose', 'focus', 'Slow, flowing movement', 'Meditation'],
      steps: ['Stand with your feet shoulder-width apart, knees soft and arms hanging loosely.', 'Imagine a thread gently lifting the crown of your head, and let your weight sink into your feet.', 'Breathe slowly into your belly for 3 to 5 minutes, noticing your body without judging it.'],
      why: 'The standing meditation that begins Tai Chi practice. It steadies your posture and brings you into the present moment.' },
    oneleg: { name: 'One-leg balance', todo: 'Practise your one-leg balance', min: 3, tags: ['balance', 'Improve balance and posture', 'Recovering from an injury'],
      steps: ['Stand next to a wall or the back of a chair, so you can steady yourself.', 'Lift one foot a little and hold for 30 seconds, eyes on a point in front of you, breathing slowly.', 'Swap legs, and do two rounds each side. As it gets easier, let go of the support.'],
      why: 'A little balance practice every day builds steadiness, just as Tai Chi does.' },
    stretch: { name: 'Gentle morning stretch', todo: 'Do the gentle morning stretch', min: 5, tags: ['flexibility', 'pain', 'Stiff joints or muscles', 'Become more flexible', 'Back, neck or shoulder pain', 'Ease pain and tension', 'Stretching and breathing'],
      steps: ['Stand tall, breathe in and reach both arms up.', 'Breathe out and fold forward with soft knees, letting your head and arms hang. Roll up slowly.', 'Finish with five slow shoulder rolls and gentle neck turns each way. Move gently and stop if anything hurts.'],
      why: 'A few minutes of easy movement each morning keeps your body supple.' },
    scan: { name: 'Body scan', todo: 'Do a body scan', min: 10, tags: ['pain', 'sleep', 'selfcare', 'Back, neck or shoulder pain', 'Ease pain and tension', 'Feeling low', 'Hands-on therapy'],
      steps: ['Lie down and close your eyes.', 'Move your attention slowly from your toes to the top of your head.', 'At each part of your body, notice any tightness and let it soften as you breathe out.'],
      why: 'Noticing where you hold tension is the first step to letting it go.' },
    palms: { name: 'Warm palms (Shiatsu self-care)', todo: 'Give yourself the warm palms reset', min: 2, tags: ['energy', 'pain', 'selfcare', 'Tiredness', 'Burnout', 'Work pressure', 'Back, neck or shoulder pain', 'Hands-on therapy'],
      steps: ['Rub your palms together briskly until they feel warm.', 'Cup them gently over your closed eyes and breathe slowly for 30 seconds.', 'Then press and circle gently with your fingertips along your shoulders and the base of your skull.'],
      why: 'A two-minute reset for tired eyes and a tense neck.' },
    horse: { name: 'Horse riding stance', todo: 'Hold horse riding stance', min: 3, tags: ['fitness', 'Low fitness', 'Get fitter and stronger', 'Learn self-defence', 'Wanting more discipline', 'Sharpen focus and discipline', 'Martial arts'],
      steps: ['Stand with your feet about twice shoulder-width apart, toes pointing forward.', 'Bend your knees and sink down only as far as is comfortable, keeping your back straight.', 'Hold for 30 seconds while breathing steadily, rest, and repeat three times.'],
      why: 'Kiba-dachi, the horse riding stance of Karate, builds leg strength, stamina and determination.' },
    voice: { name: 'Strong stance, strong voice', todo: 'Practise your strong stance and strong voice', min: 2, tags: ['safety', 'confidence', 'Learn self-defence', 'Build confidence', 'Low confidence'],
      steps: ['Stand tall with your feet apart, knees soft and hands raised, open palms facing forward.', 'Look straight ahead and say “Stop!” or “Back off!” in a loud, firm voice.', 'Practise until it feels natural. Your stance and voice are your first line of self-defence.'],
      why: 'Karate teaches you to stand your ground calmly and confidently.' },
    walk: { name: 'Brisk mindful walk', todo: 'Take a brisk mindful walk', min: 15, tags: ['energy', 'fitness', 'Low fitness', 'Tiredness', 'Feeling low', 'Get fitter and stronger'],
      steps: ['Take a 15-minute walk, outside if you can, at a pace that warms you up.', 'Notice five things you can see, four you can hear and three you can feel.', 'Let your breathing settle into the rhythm of your steps.'],
      why: 'Movement and fresh air lift your energy and mood.' },
    good: { name: 'Three good things', todo: 'Write down three good things', min: 5, tags: ['confidence', 'selfcare', 'Low confidence', 'Build confidence', 'Feeling low'],
      steps: ['Each evening, write down three things that went well today, however small.', 'Next to each one, note what you did to help it happen.', 'On Sunday, read back over your week.'],
      why: 'It trains your attention to notice what’s going right, and what you’re capable of.' },
    mokuso: { name: 'One-minute mokuso', todo: 'Do a one-minute mokuso', min: 1, tags: ['focus', 'Lack of focus', 'Sharpen focus and discipline', 'Wanting more discipline', 'Work pressure', 'Meditation', 'Martial arts'],
      steps: ['Before something important, sit tall and close your eyes, as karateka do before training.', 'Breathe slowly and let your thoughts settle, like sand sinking in still water.', 'Open your eyes, choose one thing to do next, and do it.'],
      why: 'Mokuso, the meditation of Karate, clears your head before you act.' },
    step: { name: 'One small step', todo: 'Choose one small step', min: 5, tags: ['direction', 'confidence', 'Lack of direction', 'Find direction and purpose', 'Build confidence', 'Talking things through'],
      steps: ['Each morning, finish this sentence: “Today, one small step towards the life I want is…”.', 'Make it something you can do in under 15 minutes.', 'Tick it off in the evening.'],
      why: 'Confidence and purpose grow from small promises you keep to yourself.' }
  };
  A.tips = {
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

  /* ================================================================== children's questions (ages 6 to 11)
     Short yes-or-no questions, answered with faces. A grown-up can read them aloud. */
  var C = {};
  C.faces = [['😢', 'No'], ['🙁', 'Not really'], ['😐', 'Sort of'], ['🙂', 'Yes'], ['😄', 'Yes, lots!']];
  C.scales = [
    { id: 'happy', q: 'Do you feel happy most days?', name: 'Happy', good: 'Happy', grow: 'Feeling happy', why: 'Karate is fun, and every new belt is something to be proud of' },
    { id: 'calm', q: 'Can you stay calm when something goes wrong?', name: 'Calm', good: 'Calm', grow: 'Staying calm', why: 'Karate teaches you to stay calm and in control' },
    { id: 'sleep', q: 'Do you sleep well at night?', name: 'Sleep', good: 'Good sleeper', grow: 'Sleeping well', why: 'Being active in class can help you sleep well' },
    { id: 'focus', q: 'Is it easy to sit still and listen?', name: 'Listening', good: 'Great listener', grow: 'Sitting still and listening', why: 'Karate helps you listen, concentrate and follow instructions' },
    { id: 'brave', q: 'Do you feel brave when you try something new?', name: 'Brave', good: 'Brave', grow: 'Feeling brave', why: 'Karate builds bravery, one belt at a time' },
    { id: 'friends', q: 'Is it easy to make friends?', name: 'Friends', good: 'Friendly', grow: 'Making friends', why: 'You’ll train with a friendly dojo family' },
    { id: 'balance', q: 'Can you balance on one leg?', name: 'Balance', good: 'Great balance', grow: 'Balance', why: 'Kicks and stances build great balance' },
    { id: 'bendy', q: 'Is your body bendy? Can you touch your toes?', name: 'Bendy', good: 'Bendy', grow: 'Being bendy', why: 'Warm-ups and kicks make you more flexible' },
    { id: 'strong', q: 'Do you feel strong and full of energy?', name: 'Strong', good: 'Strong', grow: 'Getting stronger', why: 'Karate makes you fit and strong' },
    { id: 'safe', q: 'Do you feel safe at school and when you’re out?', name: 'Safe', good: 'Feeling safe', grow: 'Feeling safe', why: 'You’ll learn how to keep yourself safe' }
  ];
  C.challenges = [ // [label, emoji, the question it relates to]
    ['Feeling worried', '😟', 'calm'], ['Getting cross', '😠', 'calm'], ['Feeling shy', '🙈', 'brave'], ['Sleeping', '😴', 'sleep'],
    ['Sitting still', '🪑', 'focus'], ['Making friends', '🤝', 'friends'], ['Someone being unkind to me', '💬', 'safe'], ['Being more active', '🏃', 'strong']
  ];
  C.goals = [ // [goal, emoji, how it reads in a sentence]
    ['Be more confident', '🦁', 'to be more confident'], ['Feel calm', '🌊', 'to feel calm'], ['Get fit and strong', '💪', 'to get fit and strong'],
    ['Learn to keep myself safe', '🛡️', 'to learn to keep yourself safe'], ['Make new friends', '🤝', 'to make new friends'],
    ['Listen and concentrate better', '🎯', 'to listen and concentrate better'], ['Earn my karate belts', '🥋', 'to earn your karate belts']
  ];
  C.practices = {
    balloon: { name: 'Balloon breathing', todo: 'Do balloon breathing', min: 2, breath: 'balloon', tags: ['calm', 'sleep', 'Feeling worried', 'Getting cross', 'Sleeping', 'Feel calm'],
      steps: ['Sit or lie down and put your hands on your tummy.', 'Breathe in slowly through your nose and feel your tummy blow up like a balloon.', 'Breathe out slowly and let the balloon go down. Do it 5 times.'],
      why: 'Slow breaths help you feel calm when you’re worried or cross.' },
    turtle: { name: 'Turtle time', todo: 'Have turtle time', min: 1, tags: ['focus', 'calm', 'Sitting still', 'Getting cross', 'Listen and concentrate better'],
      steps: ['Sit still like a quiet turtle and close your eyes.', 'Listen carefully. How many different sounds can you hear?', 'After one minute, open your eyes and tell a grown-up what you heard.'],
      why: 'In Karate, sitting quietly like this is called mokuso. It helps you listen and concentrate.' },
    flamingo: { name: 'Flamingo balance', todo: 'Do the flamingo balance', min: 2, tags: ['balance', 'Being more active'],
      steps: ['Stand tall next to something you can hold.', 'Lift one foot like a flamingo and count to 10.', 'Swap legs. Can you do it without holding on?'],
      why: 'Good balance makes your karate kicks strong and steady.' },
    horse: { name: 'Horse riding stance challenge', todo: 'Do the horse riding stance challenge', min: 2, tags: ['strong', 'Being more active', 'Get fit and strong', 'Earn my karate belts'],
      steps: ['Stand with your feet wide apart, toes pointing forward.', 'Bend your knees as if you’re riding a horse, and keep your back straight.', 'Count to 20, rest, and try again. Can you count a bit higher each day?'],
      why: 'This karate stance makes your legs super strong.' },
    star: { name: 'Brave star', todo: 'Give yourself a brave star', min: 2, tags: ['brave', 'happy', 'Feeling shy', 'Be more confident'],
      steps: ['At bedtime, tell a grown-up one brave or kind thing you did today.', 'Give yourself a star for it.', 'At the end of the week, count your stars!'],
      why: 'Noticing the brave things you do helps you feel more confident.' },
    cat: { name: 'Cat and cow stretch', todo: 'Do the cat and cow stretch', min: 2, tags: ['bendy', 'Being more active', 'Earn my karate belts'],
      steps: ['Kneel on your hands and knees.', 'Round your back up high like a cat, then let your tummy dip down like a cow.', 'Do it slowly 5 times, breathing in and out.'],
      why: 'Gentle stretches make your body bendy for kicks.' },
    hello: { name: 'Friendly hello', todo: 'Say a friendly hello', min: 1, tags: ['friends', 'happy', 'Making friends', 'Feeling shy', 'Make new friends'],
      steps: ['Each day, smile and say hello to someone.', 'Ask them one question, like “What’s your favourite game?”', 'Tell a grown-up how it went.'],
      why: 'Small hellos are how friendships begin.' },
    sleepy: { name: 'Sleepy body', todo: 'Do sleepy body at bedtime', min: 3, tags: ['sleep', 'Sleeping', 'Feeling worried'],
      steps: ['Lie in bed and squeeze your toes tight, then let them go floppy.', 'Do the same with your legs, tummy, hands and face.', 'Feel your whole body go soft and sleepy.'],
      why: 'Letting your muscles go floppy helps you drift off to sleep.' },
    voice: { name: 'Strong voice', todo: 'Practise your strong voice', min: 1, tags: ['safe', 'brave', 'Someone being unkind to me', 'Learn to keep myself safe'],
      steps: ['Stand tall with your feet apart and your hands up in front of you.', 'Look straight ahead and say “Stop!” in a loud, strong voice.', 'Practise with a grown-up. Standing tall and speaking clearly helps keep you safe.'],
      why: 'Karate teaches you to stand tall, speak up and stay safe.' }
  };

  var BREATHS = {
    box: { name: 'Box breathing', phases: [['in', 4], ['hold', 4], ['out', 4], ['hold', 4]], rounds: 8 },
    sleep: { name: 'Wind-down breath', phases: [['in', 4], ['hold', 7], ['out', 8]], rounds: 4 },
    calm: { name: 'Calm breathing', phases: [['in', 4], ['out', 6]], rounds: 30 },
    balloon: { name: 'Balloon breathing', phases: [['in', 4], ['out', 4]], rounds: 5 }
  };

  /* ================================================================== helpers */
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function $(sel, el) { return (el || root).querySelector(sel); }
  function $$(sel, el) { return Array.prototype.slice.call((el || root).querySelectorAll(sel)); }
  function load() { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; } }
  function save(d) { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) { /* private browsing: results just aren't kept */ } }
  function goodOf(s, v) { return s.invert ? 11 - v : v; }
  function fmtDate(t) { return new Date(t).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }); }
  function joinList(a) { return a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]; }
  function lc(t) { return t.charAt(0).toLowerCase() + t.slice(1); }
  function phraseOf(list, goal) { for (var i = 0; i < list.length; i++) if (list[i][0] === goal) return list[i][2]; return lc(goal); }
  // Several goals in one sentence: 'to feel calmer, sleep better and build your confidence'.
  function goalsText(list, goals) { return joinList(goals.map(function (g, i) { var p = phraseOf(list, g); return i ? p.replace(/^to /, '') : p; })); }
  // Results saved before goals and preferences allowed more than one answer.
  function norm(a) {
    a.goals = a.goals || (a.goal ? [a.goal] : []);
    a.formats = a.formats || (a.format ? [a.format] : []);
    a.paces = a.paces || (a.pace ? [a.pace] : []);
    a.appeals = a.appeals || []; a.challenges = a.challenges || [];
    return a;
  }
  function ul(items, cls) { return '<ul class="' + (cls || 'wb-list') + '">' + items.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>'; }
  function scrollToTop() {
    var y = root.getBoundingClientRect().top + window.scrollY - 110;
    if (Math.abs(window.scrollY - y) > 40) window.scrollTo({ top: y, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }
  // Picks up to three practices whose tags best match what matters most to this person.
  function pickPractices(lib, signals) {
    var ranked = Object.keys(lib).map(function (k) {
      return { k: k, n: lib[k].tags.reduce(function (t, tag) { return t + (signals[tag] || 0); }, 0) };
    }).sort(function (x, y) { return y.n - x.n; });
    var out = [], breaths = 0;
    ranked.forEach(function (p) {
      if (out.length >= 3) return;
      if (lib[p.k].breath && breaths >= 2) return;
      if (lib[p.k].breath) breaths++;
      out.push(p.k);
    });
    return out;
  }

  var intro = $('.wb-intro'), quiz = $('.wb-quiz'), results = $('.wb-results');
  var answers, steps, step;

  /* ================================================================== the questions, one screen at a time */
  function fresh(who) { return { who: who || '', scores: {}, challenges: [], goals: [], formats: [], paces: [], appeals: [] }; }
  // Questions where any number of answers can be chosen: which answers list each one fills.
  var MULTI = { ch: 'challenges', goal: 'goals', format: 'formats', pace: 'paces', ap: 'appeals' };
  var EXCLUSIVE = ['No preference', 'Not sure'];  // choosing one of these clears the others, and the other way round
  function stepsFor(who) {
    var s = [{ t: 'who' }];
    if (!who) return s;
    (who === 'child' ? C : A).scales.forEach(function (q) { s.push({ t: 'scale', q: q }); });
    s.push({ t: 'challenges' }, { t: 'goal' });
    if (who === 'adult') s.push({ t: 'prefs' }, { t: 'appeal' });
    return s;
  }
  function start(who) {
    answers = fresh(who);
    steps = stepsFor(who);
    step = who ? 1 : 0;
    intro.hidden = true; results.hidden = true; quiz.hidden = false;
    showStep(true);
  }

  function legend(sec, q) { return '<legend tabindex="-1"><span class="wb-sec">' + esc(sec) + '</span><span class="wb-qtext">' + esc(q) + '</span></legend>'; }
  function radioCard(name, value, checked, inner) {
    return '<label class="wb-goal"><input type="radio" name="' + name + '" value="' + esc(value) + '"' + (checked ? ' checked' : '') + '><span>' + inner + '</span></label>';
  }
  function multiCard(k, value, inner) {
    var on = answers[MULTI[k]].indexOf(value) >= 0;
    return '<label class="wb-goal is-multi"><input type="checkbox" data-k="' + k + '" value="' + esc(value) + '"' + (on ? ' checked' : '') + '><span>' + inner + '</span></label>';
  }

  function stepHTML() {
    var st = steps[step], kid = answers.who === 'child';
    if (st.t === 'who') {
      return '<fieldset class="wb-q">' + legend('Before you start', 'Who is this assessment for?') + '<div class="wb-who">' +
        radioCard('wb-who', 'adult', answers.who === 'adult', '<b class="wb-emoji" aria-hidden="true">🧑</b><strong>Teen or adult</strong><small>Ages 12 and up</small>') +
        radioCard('wb-who', 'child', answers.who === 'child', '<b class="wb-emoji" aria-hidden="true">🧒</b><strong>A child aged 6 to 11</strong><small>Simple questions with smiley faces. Younger children can answer with a grown-up.</small>') +
        '</div></fieldset>';
    }
    if (st.t === 'scale') {
      var s = st.q, v = answers.scores[s.id], opts = '';
      if (kid) {
        C.faces.forEach(function (f, i) {
          opts += '<label><input type="radio" name="wb-' + s.id + '" value="' + (i + 1) + '"' + (v === i + 1 ? ' checked' : '') + '><span><b aria-hidden="true">' + f[0] + '</b><small>' + f[1] + '</small></span></label>';
        });
        return '<fieldset class="wb-q">' + legend('Part 1 of 3 · How are you?', s.q) + '<div class="wb-faces" role="radiogroup">' + opts + '</div></fieldset>';
      }
      for (var i = 1; i <= 10; i++) opts += '<label><input type="radio" name="wb-' + s.id + '" value="' + i + '"' + (v === i ? ' checked' : '') + '><span>' + i + '</span></label>';
      return '<fieldset class="wb-q">' + legend('Section 1 of 4 · ' + s.grp, s.q) + '<div class="wb-scale" role="radiogroup">' + opts + '</div>' +
        '<div class="wb-ends" aria-hidden="true"><span>1 · ' + esc(s.lo) + '</span><span>10 · ' + esc(s.hi) + '</span></div></fieldset>';
    }
    if (st.t === 'challenges') {
      var box = function (c, emoji) {
        return '<label><input type="checkbox" data-k="ch" value="' + esc(c) + '"' + (answers.challenges.indexOf(c) >= 0 ? ' checked' : '') + '><span>' + (emoji ? '<b aria-hidden="true">' + emoji + '</b>' : '') + esc(c) + '</span></label>';
      };
      var body = kid ? '<div class="choices wb-kidch">' + C.challenges.map(function (c) { return box(c[0], c[1]); }).join('') + '</div>'
        : '<div class="wb-groups">' + A.challenges.map(function (g) { return '<div class="wb-group"><h3>' + esc(g[0]) + '</h3><div class="choices">' + g[1].map(function (c) { return box(c); }).join('') + '</div></div>'; }).join('') + '</div>';
      return '<fieldset class="wb-q">' + legend(kid ? 'Part 2 of 3 · Things you’d like help with' : 'Section 2 of 4 · What’s holding you back', kid ? 'Is anything a bit tricky for you?' : 'What would you most like help with?') +
        '<p class="wb-hint">Choose as many as you like' + (kid ? ', or skip.' : '.') + ' <span class="wb-count" aria-live="polite"></span></p>' + body + '</fieldset>';
    }
    if (st.t === 'goal') {
      var goals = kid ? C.goals.map(function (g) { return multiCard('goal', g[0], '<b class="wb-emoji" aria-hidden="true">' + g[1] + '</b><strong>' + esc(g[0]) + '</strong>'); })
        : A.goals.map(function (g) { return multiCard('goal', g[0], '<strong>' + esc(g[0]) + '</strong><small>' + esc(g[1]) + '</small>'); });
      return '<fieldset class="wb-q">' + legend(kid ? 'Part 3 of 3 · Your big goals' : 'Section 3 of 4 · Your goals', kid ? 'What would you like?' : 'What would you like to achieve?') +
        '<p class="wb-hint">Choose as many as you like. <span class="wb-count" aria-live="polite"></span></p><div class="wb-goals' + (kid ? ' wb-goals--kid' : '') + '">' + goals.join('') + '</div></fieldset>';
    }
    if (st.t === 'prefs') {
      var pref = function (k, q, opts) {
        return '<fieldset class="wb-pref"><legend class="wb-qtext">' + esc(q) + '</legend><p class="wb-hint">Choose as many as you like.</p><div class="wb-opts">' + opts.map(function (o) { return multiCard(k, o, '<strong>' + esc(o) + '</strong>'); }).join('') + '</div></fieldset>';
      };
      return '<div class="wb-q"><p class="wb-sec wb-sec-h" tabindex="-1">Section 4 of 4 · How you like to train</p>' + pref('format', 'How would you like to practise?', A.formats) + pref('pace', 'What pace suits you?', A.paces) + '</div>';
    }
    return '<fieldset class="wb-q">' + legend('Section 4 of 4 · How you like to train', 'Which of these appeal to you?') + '<p class="wb-hint">Choose as many as you like, or skip.</p><div class="wb-opts">' +
      A.appeals.map(function (p) { return multiCard('ap', p[0], '<strong>' + esc(p[0]) + '</strong>'); }).join('') + '</div></fieldset>';
  }

  function canGoOn() {
    var st = steps[step];
    if (st.t === 'who') return !!answers.who;
    if (st.t === 'scale') return !!answers.scores[st.q.id];
    if (st.t === 'goal') return answers.goals.length > 0;
    if (st.t === 'prefs') return answers.formats.length > 0 && answers.paces.length > 0;
    return true;
  }

  function showStep(focus) {
    var total = steps.length - 1;
    $('.wb-bar span', quiz).style.width = Math.max(4, Math.round(step / Math.max(total, 1) * 100)) + '%';
    $('.wb-count-q', quiz).textContent = step ? 'Question ' + step + ' of ' + total : 'Getting started';
    $('.wb-body', quiz).innerHTML = stepHTML();
    $('[data-act="back"]', quiz).textContent = step ? 'Back' : 'Cancel';
    quiz.classList.toggle('is-kid', answers.who === 'child');
    updateNext();
    updateChecks();
    scrollToTop();
    if (focus) { var lg = $('legend, .wb-sec-h', quiz); if (lg) lg.focus({ preventScroll: true }); }
  }

  function updateNext() {
    var next = $('[data-act="next"]', quiz), st = steps[step], last = step === steps.length - 1 && answers.who;
    next.disabled = !canGoOn();
    var empty = (st.t === 'challenges' && !answers.challenges.length) || (st.t === 'appeal' && !answers.appeals.length);
    next.textContent = last ? 'See my results' : empty ? 'Skip' : 'Next';
  }

  function updateChecks() {
    var c = $('.wb-count', quiz), st = steps[step];
    if (!c) return;
    var n = st.t === 'goal' ? answers.goals.length : answers.challenges.length;
    c.textContent = n ? n + ' chosen' : '';
  }

  function next() {
    if (!canGoOn()) return;
    if (step < steps.length - 1 || !answers.who) { step++; showStep(true); }
    else finish();
  }

  quiz.addEventListener('change', function (e) {
    var t = e.target, st = steps[step];
    if (t.name === 'wb-who') {
      if (t.value !== answers.who) answers = fresh(t.value);
      steps = stepsFor(answers.who);
    } else if (st.t === 'scale' && t.type === 'radio') answers.scores[st.q.id] = Number(t.value);
    else if (MULTI[t.getAttribute('data-k')]) {
      var k = t.getAttribute('data-k'), group = $$('input[data-k="' + k + '"]', quiz);
      if (t.checked) group.forEach(function (b) { if (b !== t && (EXCLUSIVE.indexOf(t.value) >= 0 || EXCLUSIVE.indexOf(b.value) >= 0)) b.checked = false; });
      answers[MULTI[k]] = group.filter(function (b) { return b.checked; }).map(function (b) { return b.value; });
      updateChecks();
    }
    updateNext();
  });
  // Choosing an answer only selects it: Next moves on.
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
    if (old && old.a && old.a.who === answers.who) rec.prev = { at: old.at, scores: old.a.scores };
    save(rec);
    showResults(rec);
  }

  /* ================================================================== working out the results */
  function analyseAdult(a) {
    var pts = {}, why = {};
    ORDER.forEach(function (k) { pts[k] = 0; why[k] = []; });
    function add(map, reason, weight) {
      Object.keys(map).forEach(function (k) {
        var w = map[k] * (weight || 1);
        pts[k] += w;
        if (reason && w > 0) why[k].push({ t: reason, w: w });
      });
    }
    A.scaleRules.forEach(function (r) { var v = a.scores[r[0]]; if (r[1](v)) add(r[2], r[3].replace('{v}', v)); });
    a.challenges.forEach(function (c) { add(A.challengeRules[c] || {}, 'You’d like help with ' + lc(c)); });
    // Goals count most; when many are chosen, each counts for a little less.
    var gw = a.goals.length <= 2 ? 1.5 : 3 / a.goals.length;
    a.goals.forEach(function (g) { add(A.goalRules[g] || {}, 'You want ' + phraseOf(A.goals, g), gw); });
    a.formats.concat(a.paces).forEach(function (p) { var r = A.prefRules[p]; if (r) add(r[0], r[1]); });
    A.appeals.forEach(function (p) { if (a.appeals.indexOf(p[0]) >= 0) add(p[1], p[2]); });
    ORDER.forEach(function (k) { why[k] = why[k].sort(function (x, y) { return y.w - x.w; }).map(function (x) { return x.t; }); });
    var ranked = ORDER.slice().sort(function (x, y) { return pts[y] - pts[x] || ORDER.indexOf(x) - ORDER.indexOf(y); })
      .filter(function (k) { return pts[k] > 0; }).slice(0, 3);

    var dims = A.scales.map(function (s) { var v = a.scores[s.id]; return { s: s, v: v, g: goodOf(s, v) }; });
    var mean = dims.reduce(function (t, d) { return t + d.g; }, 0) / dims.length;
    var byGood = dims.slice().sort(function (x, y) { return y.g - x.g; });
    var strengths = byGood.filter(function (d) { return d.g >= 7; }).slice(0, 3);
    if (!strengths.length) strengths = byGood.filter(function (d) { return d.g >= 6; }).slice(0, 2);
    var focus = byGood.slice().reverse().filter(function (d) { return d.g <= 5; }).slice(0, 3);

    var signals = {};
    a.goals.forEach(function (g) { signals[g] = a.goals.length <= 2 ? 3 : Math.max(1, 6 / a.goals.length); });
    a.challenges.forEach(function (c) { signals[c] = (signals[c] || 0) + 2; });
    a.appeals.forEach(function (c) { signals[c] = (signals[c] || 0) + 1; });
    dims.forEach(function (d) { if (d.g <= 4) signals[d.s.id] = (signals[d.s.id] || 0) + (d.g <= 2 ? 2 : 1); });

    var band = mean < 4 ? ['Running on empty', 'Things feel heavy right now, so put yourself first, gently and one small step at a time.']
      : mean < 5.5 ? ['Under pressure', 'You’re carrying a lot. A few steady habits and the right support can make a real difference.']
        : mean < 7.5 ? ['Finding your balance', 'Plenty is going well, and a few areas would benefit from some care.']
          : ['In a good place', 'You’re doing well. It’s a great time to build on it and keep growing.'];
    var worry = a.scores.stress >= 9 || mean < 4 || (a.challenges.indexOf('Feeling low') >= 0 && (mean < 5 || a.scores.stress >= 7));
    return { why: why, ranked: ranked, dims: dims, mean: mean, strengths: strengths, focus: focus, practices: pickPractices(A.practices, signals), band: band, worry: worry };
  }

  function analyseChild(a) {
    var dims = C.scales.map(function (s) { return { s: s, v: a.scores[s.id] }; });
    var powers = dims.filter(function (d) { return d.v >= 4; }).sort(function (x, y) { return y.v - x.v; }).slice(0, 3);
    var grow = dims.filter(function (d) { return d.v <= 2; }).sort(function (x, y) { return x.v - y.v; }).slice(0, 3);
    if (!grow.length) grow = dims.filter(function (d) { return d.v === 3; }).slice(0, 2);
    // Why Karate suits this child: their goal first, then what they find tricky, then their lowest answers.
    var why = ['You want ' + goalsText(C.goals, a.goals.slice(0, 2))];
    var byId = {};
    C.scales.forEach(function (s) { byId[s.id] = s; });
    a.challenges.forEach(function (c) { C.challenges.forEach(function (x) { if (x[0] === c && why.indexOf(byId[x[2]].why) < 0) why.push(byId[x[2]].why); }); });
    grow.forEach(function (d) { if (why.indexOf(d.s.why) < 0) why.push(d.s.why); });
    var signals = {};
    a.goals.forEach(function (g) { signals[g] = a.goals.length <= 2 ? 3 : Math.max(1, 6 / a.goals.length); });
    a.challenges.forEach(function (c) { signals[c] = (signals[c] || 0) + 2; });
    dims.forEach(function (d) { if (d.v <= 3) signals[d.s.id] = (signals[d.s.id] || 0) + (d.v <= 2 ? 2 : 1); });
    var worry = a.scores.safe <= 2 || a.scores.happy <= 1 || a.challenges.indexOf('Someone being unkind to me') >= 0 || (a.scores.calm <= 1 && a.scores.happy <= 2);
    return { why: why.slice(0, 3), dims: dims, powers: powers, grow: grow, practices: pickPractices(C.practices, signals), worry: worry };
  }

  function planFor(a, r) {
    if (a.who === 'child') {
      var k = r.practices.map(function (x) { return C.practices[x]; });
      return [
        ['Get started', [k[0].todo + ' every day.', 'Book your first Karate class with a grown-up.']],
        ['Keep going', [k[1] ? k[1].todo + ' on most days, too.' : 'Keep going every day.', 'After class, tell a grown-up one thing you learned.']],
        ['Level up', [k[2] ? k[2].todo + ' as well.' : 'Do your favourite one again.', 'Practise your favourite karate move at home.']],
        ['Look how you’ve grown', ['Count up all your ticks!', 'Do this assessment again and see what’s changed.']]
      ];
    }
    var main = SERVICES[r.ranked[0]], second = r.ranked[1] ? SERVICES[r.ranked[1]] : null;
    var p = r.practices.map(function (x) { return A.practices[x]; });
    var g1 = A.tips[a.goals[0]] || ['', ''], g2 = a.goals[1] && A.tips[a.goals[1]];
    var tips = [g1[0], g2 ? g2[0] : g1[1]];
    return [
      ['Begin', [p[0].todo + ' every day (' + p[0].min + ' minute' + (p[0].min > 1 ? 's' : '') + ').', 'Book ' + main.first + '.']],
      ['Build', [p[1] ? p[1].todo + ' on at least four days.' : 'Keep up your daily practice.', tips[0]]],
      ['Deepen', [p[2] ? p[2].todo + ', or repeat your favourite.' : 'Repeat your favourite practice.', second ? 'Try ' + second.name + ' too, if it appeals.' : tips[1]]],
      ['Reflect', ['Keep your daily practice going.', 'Take this assessment again and see what’s changed.']]
    ];
  }

  /* ================================================================== showing the results (kept short; details fold away) */
  function joinLink(k, ranked) {
    var names = [k].concat((ranked || []).filter(function (x) { return x !== k; })).slice(0, 2).map(function (x) { return SERVICES[x].interest; });
    return 'join.html?interest=' + encodeURIComponent(names.join('|')) + '&from=wellbeing';
  }

  function matchCard(k, reasons, ranked, tag) {
    var s = SERVICES[k];
    return '<article class="wb-svc wb-svc--main"><div class="wb-svc-head"><span class="k kanji" aria-hidden="true">' + s.k + '</span><div><span class="wb-tag">' + tag + '</span>' +
      '<h3>' + esc(s.name) + '</h3><p class="wb-when">' + esc(s.when) + '</p></div></div>' +
      (reasons.length ? ul(reasons, 'wb-why') : '') +
      '<div class="btn-row"><a class="btn btn--seal" href="' + joinLink(k, ranked) + '">' + esc(s.cta) + '</a><a class="link-arrow" href="' + s.page + '">' + esc(s.link || 'About ' + s.name) + '</a></div></article>';
  }

  function practicesHTML(lib, keys, kid) {
    return '<div class="wb-pracs">' + keys.map(function (k, i) {
      var p = lib[k];
      return '<details class="wb-prac"' + (i === 0 ? ' open' : '') + '><summary><span class="wb-num">' + (i + 1) + '</span><span class="wb-prac-name">' + esc(p.name) + '</span><span class="wb-min">' + p.min + ' min</span></summary>' +
        '<ol>' + p.steps.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ol><p class="muted">' + esc(p.why) + '</p>' +
        (p.breath ? '<button class="btn btn--ghost wb-breathe" type="button" data-breath="' + p.breath + '">' + (kid ? 'Breathe along with the balloon' : 'Breathe along with me') + '</button>' : '') + '</details>';
    }).join('') + '</div>';
  }

  function planHTML(plan, rec, title, sub) {
    return '<section class="wb-block"><h2 class="wb-h">' + title + '</h2><p class="wb-sub">' + sub + '</p><ol class="wb-plan">' + plan.map(function (w, i) {
      return '<li><p class="wb-week-h"><span>Week ' + (i + 1) + '</span>' + esc(w[0]) + '</p>' + w[1].filter(Boolean).map(function (x, j) {
        var id = 'w' + i + '-' + j;
        return '<label class="check"><input type="checkbox" data-done="' + id + '"' + (rec.done && rec.done[id] ? ' checked' : '') + '> <span>' + esc(x) + '</span></label>';
      }).join('') + '</li>';
    }).join('') + '</ol></section>';
  }

  function chips(items, cls) { return '<p class="wb-chips">' + items.map(function (x) { return '<span class="wb-chip ' + cls + '">' + esc(x) + '</span>'; }).join('') + '</p>'; }

  function ring(score) {
    var c = 2 * Math.PI * 52, off = c * (1 - score / 100);
    return '<svg class="wb-ring" viewBox="0 0 120 120" role="img" aria-label="Balance today: ' + score + ' out of 100"><circle cx="60" cy="60" r="52" class="wb-ring-bg"/>' +
      '<circle cx="60" cy="60" r="52" class="wb-ring-fg" stroke-dasharray="' + c.toFixed(1) + '" stroke-dashoffset="' + off.toFixed(1) + '"/>' +
      '<text x="60" y="58" text-anchor="middle" class="wb-ring-n">' + score + '</text><text x="60" y="80" text-anchor="middle" class="wb-ring-l">out of 100</text></svg>';
  }

  var ALERT_ADULT = '<aside class="wb-alert" role="note"><h3>Please look after yourself</h3><p>Your answers suggest things are hard right now. You don’t have to wait for a class: talk to your GP, call <strong>NHS 111</strong> and choose the mental health option, or call <strong>Samaritans free on 116 123</strong>, day or night. You can also text <strong>SHOUT to 85258</strong>. If you’re in danger, call <strong>999</strong>.</p></aside>';
  var ALERT_CHILD = '<aside class="wb-alert" role="note"><h3>Talk to a grown-up you trust</h3><p>If you feel unhappy or unsafe, or someone is being unkind to you, please tell a grown-up you trust, like a parent, carer or teacher. You can also call <strong>Childline free on 0800 1111</strong>, any time.</p><p class="wb-fine">Grown-ups: if you’re worried about a child, talk to their school or GP. In an emergency, call 999.</p></aside>';

  function actions(primary, shareText, kid) {
    return '<div class="wb-actions btn-row">' + primary +
      '<a class="btn btn--ghost" href="https://wa.me/447931300470?text=' + encodeURIComponent(shareText) + '" target="_blank" rel="noopener">Ask us on WhatsApp</a>' +
      '<button class="btn btn--ghost" type="button" data-act="again">' + (kid ? 'Do it again' : 'Take it again') + '</button></div>' +
      '<p class="wb-fine">A guide to general wellbeing, not a medical or psychological assessment. Your answers are kept only on this device. <button class="link-btn" type="button" data-act="print">Save or print</button></p>';
  }

  function adultResults(rec) {
    var a = rec.a, r = analyseAdult(a), plan = planFor(a, r), score = Math.round((r.mean - 1) / 9 * 100), main = r.ranked[0];
    var prev = rec.prev && rec.prev.scores;
    var bars = r.dims.map(function (d) {
      var lvl = d.g <= 4 ? 'low' : d.g <= 6 ? 'mid' : 'high', change = '';
      if (prev && prev[d.s.id]) {
        var diff = d.g - goodOf(d.s, prev[d.s.id]);
        if (diff) change = '<span class="wb-diff ' + (diff > 0 ? 'up' : 'down') + '" title="Since ' + fmtDate(rec.prev.at) + '">' + (diff > 0 ? '▲' : '▼') + Math.abs(diff) + '</span>';
      }
      return '<li class="wb-dim wb-dim--' + lvl + '"><span class="wb-dim-name">' + esc(d.s.name) + '</span><span class="wb-dim-bar"><i style="width:' + (d.v * 10) + '%"></i></span><span class="wb-dim-v">' + d.v + '<small>/10</small>' + change + '</span></li>';
    }).join('');
    var also = r.ranked.slice(1).map(function (k) { return '<a class="wb-also-link" href="' + SERVICES[k].page + '"><span class="kanji">' + SERVICES[k].k + '</span>' + esc(SERVICES[k].name) + '</a>'; }).join('');
    var share = 'Hello, I’ve just done the EmptyHands wellbeing assessment. My suggested path is ' + joinList(r.ranked.map(function (k) { return SERVICES[k].name; })) + ', and I want ' + goalsText(A.goals, a.goals) + '. Could we arrange a first session?';
    return '<div class="wb-top">' + ring(score) + '<div><span class="eyebrow">Your results · ' + fmtDate(rec.at) + '</span><h2 tabindex="-1">' + esc(r.band[0]) + '</h2><p>' + esc(r.band[1]) + '</p></div></div>' +
      (r.worry ? ALERT_ADULT : '') +
      '<section class="wb-block"><h2 class="wb-h">Your best match</h2>' + matchCard(main, r.why[main].slice(0, 3), r.ranked, 'Best match') +
        (also ? '<p class="wb-also"><span>Also good for you:</span>' + also + '</p>' : '') + '</section>' +
      '<section class="wb-block"><h2 class="wb-h">At a glance</h2><div class="wb-two"><div><h3>Strengths</h3>' + (r.strengths.length ? chips(r.strengths.map(function (d) { return d.s.good; }), 'is-good') : '<p class="muted">Taking this step is a strength in itself.</p>') + '</div>' +
        '<div><h3>To work on</h3>' + (r.focus.length ? chips(r.focus.map(function (d) { return d.s.bad; }), 'is-care') : '<p class="muted">Nothing stands out. Keep doing what works.</p>') + '</div></div>' +
        '<details class="wb-more"><summary>See all your answers</summary><ul class="wb-dims">' + bars + '</ul>' +
        '<p class="wb-dims-key"><span><i style="background:var(--ok)"></i>Going well</span><span><i style="background:var(--mid)"></i>Okay</span><span><i style="background:var(--low)"></i>Needs care</span></p>' +
        (prev ? '<p class="wb-fine">Arrows show the change since ' + fmtDate(rec.prev.at) + ' (▲ better, ▼ harder).</p>' : '') + '</details></section>' +
      '<section class="wb-block"><h2 class="wb-h">Start today</h2><p class="wb-sub">Three simple practices for home. Tap one to see how.</p>' + practicesHTML(A.practices, r.practices, false) + '</section>' +
      planHTML(plan, rec, 'Your 30-day plan', 'Tick things off as you go. Your ticks are saved on this device.') +
      '<section class="wb-block wb-ai" hidden></section>' +
      actions('<a class="btn btn--seal" href="' + joinLink(main, r.ranked) + '">' + esc(SERVICES[main].cta) + '</a>', share, false);
  }

  function childResults(rec) {
    var a = rec.a, r = analyseChild(a), plan = planFor(a, r);
    var powers = r.powers.map(function (d) { return d.s.good; });
    var answersList = r.dims.map(function (d) { var f = C.faces[d.v - 1]; return '<li><span>' + esc(d.s.q) + '</span><span class="wb-face-a"><b aria-hidden="true">' + f[0] + '</b> ' + esc(f[1]) + '</span></li>'; }).join('');
    var share = 'Hello, my child has just done the EmptyHands wellbeing assessment and would like to try Karate. Could we book a trial class?';
    return '<div class="wb-top wb-top--kid"><span class="wb-star" aria-hidden="true">⭐</span><div><span class="eyebrow">Your results · ' + fmtDate(rec.at) + '</span><h2 tabindex="-1">Well done for finishing!</h2>' +
        '<p>' + (powers.length ? 'Your superpowers: <strong>' + esc(joinList(powers)) + '</strong>.' : 'Every black belt started as a beginner. Let’s grow together!') + '</p></div></div>' +
      (r.worry ? ALERT_CHILD : '') +
      '<section class="wb-block"><h2 class="wb-h">Your best match</h2>' + matchCard('kids', r.why, ['kids'], 'Perfect for you') + '</section>' +
      '<section class="wb-block"><h2 class="wb-h">At a glance</h2><div class="wb-two"><div><h3>Superpowers</h3>' + (powers.length ? chips(powers, 'is-good') : '<p class="muted">You’re just getting started!</p>') + '</div>' +
        '<div><h3>Things to grow</h3>' + chips(r.grow.map(function (d) { return d.s.grow; }), 'is-care') + '</div></div>' +
        '<details class="wb-more"><summary>See all your answers</summary><ul class="wb-face-list">' + answersList + '</ul></details></section>' +
      '<section class="wb-block"><h2 class="wb-h">Fun things to try at home</h2><p class="wb-sub">Tap one to see how. Ask a grown-up to help.</p>' + practicesHTML(C.practices, r.practices, true) + '</section>' +
      planHTML(plan, rec, 'Your 4-week challenge', 'Tick each one when you’ve done it!') +
      '<p class="wb-grownup">Grown-ups: there’s a version for you too, covering Tai Chi, Yoga, Shiatsu, coaching and Karate. <button class="link-btn" type="button" data-act="adult">Take the grown-ups’ assessment</button></p>' +
      actions('<a class="btn btn--seal" href="' + joinLink('kids', ['kids']) + '">Book a trial class</a>', share, true);
  }

  function showResults(rec) {
    norm(rec.a);
    results.innerHTML = rec.a.who === 'child' ? childResults(rec) : adultResults(rec);
    results.classList.toggle('is-kid', rec.a.who === 'child');
    intro.hidden = true; quiz.hidden = true; results.hidden = false;
    scrollToTop();
    var h = $('h2', results); if (h) h.focus({ preventScroll: true });
    if (rec.a.who === 'adult') setUpAI(rec);
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
    var act = b.getAttribute('data-act');
    if (act === 'print') window.print();
    if (act === 'again') start(load() && load().a ? load().a.who : '');
    if (act === 'adult') start('adult');
    if (b.getAttribute('data-breath')) breathe(b.getAttribute('data-breath'), b);
  });

  /* ================================================================== the AI report (grown-ups only) */
  function setUpAI(rec) {
    var box = $('.wb-ai', results);
    if (!API || !box || !window.fetch) return;
    if (rec.ai) { box.hidden = false; box.innerHTML = aiHTML(rec.ai); return; }
    fetch(API, { method: 'GET', cache: 'no-store' }).then(function (r) { return r.json(); }).then(function (d) {
      if (!d || !d.ready) return;
      box.hidden = false;
      box.innerHTML = '<h2 class="wb-h">Want a fuller picture?</h2><div class="wb-ai-offer"><p>Get a personal report written by AI from your answers, with your strengths, the practice that suits you best and a 30-day plan. It takes up to a minute.</p>' +
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
    var a = rec.a;
    fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ consent: true, scores: a.scores, challenges: a.challenges, goals: a.goals, formats: a.formats, paces: a.paces, appeals: a.appeals }) })
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
    function svc(s, main) {
      var k = BY_NAME[s.service], meta = k ? SERVICES[k] : null;
      return '<div class="wb-ai-svc' + (main ? ' is-main' : '') + '"><h4>' + esc(s.service) + (meta ? ' <span class="k kanji">' + meta.k + '</span>' : '') + '</h4><p>' + esc(s.why) + '</p>' +
        (meta ? '<p><a class="link-arrow" href="' + meta.page + '">About ' + esc(meta.name) + '</a></p>' : '') + '</div>';
    }
    return '<h2 class="wb-h">Your personal report</h2><div class="wb-ai-report">' +
      '<h3 class="wb-ai-headline">' + esc(rep.headline) + '</h3><p>' + esc(rep.summary) + '</p>' +
      '<div class="wb-two"><div><h4>Main challenge: ' + esc(rep.primary_challenge.title) + '</h4><p>' + esc(rep.primary_challenge.explanation) + '</p></div>' +
      '<div><h4>Also: ' + esc(rep.secondary_challenge.title) + '</h4><p>' + esc(rep.secondary_challenge.explanation) + '</p></div></div>' +
      '<div class="wb-two"><div><h4>Your strengths</h4>' + ul(rep.strengths || []) + '</div><div><h4>Things to keep an eye on</h4>' + ul(rep.concerns || []) + '</div></div>' +
      '<h4>Recommended for you</h4>' + svc(rep.recommended_service, true) + (rep.also_consider || []).map(function (s) { return svc(s, false); }).join('') +
      '<details class="wb-more"><summary>Daily practices and your 30 days</summary>' +
      '<h4>Daily practices</h4>' + (rep.daily_practices || []).map(function (p, i) {
        return '<p><strong>' + (i + 1) + '. ' + esc(p.name) + '</strong> (' + esc(p.minutes) + ' min): ' + esc(p.how) + ' <span class="muted">' + esc(p.why) + '</span></p>';
      }).join('') +
      '<h4>Your 30 days</h4>' + (rep.plan || []).map(function (w) { return '<p><strong>Week ' + esc(w.week) + ': ' + esc(w.focus) + '.</strong> ' + esc((w.actions || []).join(' ')) + '</p>'; }).join('') +
      '</details><p class="wb-ai-closing">' + esc(rep.closing) + '</p>' +
      '<p class="wb-fine">Written by AI (Claude, made by Anthropic) from your answers. It can get things wrong and isn’t medical advice.</p></div>';
  }

  /* ================================================================== guided breathing */
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

  /* ================================================================== start up */
  quiz.innerHTML = '<div class="wb-progress"><div class="wb-bar"><span></span></div><span class="wb-count-q" aria-live="polite"></span></div><div class="wb-body"></div>' +
    '<div class="wb-nav"><button class="btn btn--ghost" type="button" data-act="back">Back</button><button class="btn btn--seal" type="button" data-act="next">Next</button></div>';
  var last = load();
  var lastBtn = $('[data-act="last"]', intro);
  if (last && last.a && lastBtn) {
    lastBtn.hidden = false;
    lastBtn.textContent = 'See my results from ' + fmtDate(last.at);
    lastBtn.addEventListener('click', function () { showResults(load()); });
  }
  $('[data-act="start"]', intro).addEventListener('click', function () { start(''); });
  intro.classList.add('is-ready');
})();
