/* Yuki — vanilla JavaScript, no client-side API secrets or dependencies. */
(() => {
  'use strict';

  const STORAGE_KEY = 'yuki-learning-v1';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const icon = (name, extra = '') => `<svg class="icon ${extra}" aria-hidden="true"><use href="#i-${name}"></use></svg>`;
  const escapeHTML = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const WORDS = [
    { id: 'konnichiwa', jp: 'こんにちは', romaji: 'Konnichiwa', si: 'ආයුබෝවන් / සුබ දවසක්', category: 'greetings', example: 'こんにちは、ユキです。', exampleSi: 'ආයුබෝවන්, මම Yuki.' },
    { id: 'arigatou', jp: 'ありがとう', romaji: 'Arigatō', si: 'ස්තුතියි', category: 'greetings', example: 'ありがとう、たすかりました。', exampleSi: 'ස්තුතියි, උදව්වක් වුණා.' },
    { id: 'ohayou', jp: 'おはようございます', romaji: 'Ohayō gozaimasu', si: 'සුබ උදෑසනක්', category: 'greetings', example: '先生、おはようございます。', exampleSi: 'ගුරුතුමනි, සුබ උදෑසනක්.' },
    { id: 'sayounara', jp: 'さようなら', romaji: 'Sayōnara', si: 'සමුගන්නම්', category: 'greetings', example: 'またね、さようなら。', exampleSi: 'නැවත හමුවෙමු, සමුගන්නම්.' },
    { id: 'hai', jp: 'はい', romaji: 'Hai', si: 'ඔව්', category: 'greetings', example: 'はい、そうです。', exampleSi: 'ඔව්, එහෙමයි.' },
    { id: 'iie', jp: 'いいえ', romaji: 'Iie', si: 'නැහැ', category: 'greetings', example: 'いいえ、ちがいます。', exampleSi: 'නැහැ, එය වෙනස්.' },
    { id: 'watashi', jp: 'わたし', romaji: 'Watashi', si: 'මම', category: 'people', example: 'わたしは学生です。', exampleSi: 'මම ශිෂ්‍යයෙක් / ශිෂ්‍යාවක්.' },
    { id: 'tomodachi', jp: 'ともだち', romaji: 'Tomodachi', si: 'මිතුරා / මිතුරිය', category: 'people', example: 'かれはともだちです。', exampleSi: 'ඔහු මගේ මිතුරා.' },
    { id: 'sensei', jp: 'せんせい', romaji: 'Sensei', si: 'ගුරුවරයා / ගුරුවරිය', category: 'people', example: '先生はやさしいです。', exampleSi: 'ගුරුවරයා කරුණාවන්තයි.' },
    { id: 'namae', jp: 'なまえ', romaji: 'Namae', si: 'නම', category: 'people', example: 'お名前は何ですか。', exampleSi: 'ඔබේ නම කුමක්ද?' },
    { id: 'mizu', jp: 'みず', romaji: 'Mizu', si: 'වතුර', category: 'food', example: '水をください。', exampleSi: 'කරුණාකර වතුර දෙන්න.' },
    { id: 'ocha', jp: 'おちゃ', romaji: 'Ocha', si: 'තේ', category: 'food', example: 'お茶を飲みます。', exampleSi: 'මම තේ බොනවා.' },
    { id: 'gohan', jp: 'ごはん', romaji: 'Gohan', si: 'බත් / ආහාරය', category: 'food', example: 'ごはんを食べます。', exampleSi: 'මම බත් කනවා.' },
    { id: 'sushi', jp: 'すし', romaji: 'Sushi', si: 'සුෂි', category: 'food', example: 'すしが好きです。', exampleSi: 'මම සුෂිවලට කැමතියි.' },
    { id: 'neko', jp: 'ねこ', romaji: 'Neko', si: 'බළලා', category: 'daily', example: 'ねこがいます。', exampleSi: 'බළලෙක් ඉන්නවා.' },
    { id: 'hon', jp: 'ほん', romaji: 'Hon', si: 'පොත', category: 'daily', example: 'これは本です。', exampleSi: 'මෙය පොතක්.' },
    { id: 'gakkou', jp: 'がっこう', romaji: 'Gakkō', si: 'පාසල', category: 'daily', example: '学校へ行きます。', exampleSi: 'මම පාසලට යනවා.' },
    { id: 'eki', jp: 'えき', romaji: 'Eki', si: 'දුම්රිය ස්ථානය', category: 'daily', example: '駅はどこですか。', exampleSi: 'දුම්රිය ස්ථානය කොහෙද?' }
  ];
  const CATEGORIES = [
    { id: 'all', label: 'සියල්ල' }, { id: 'greetings', label: 'සුබපැතුම්' },
    { id: 'people', label: 'පුද්ගලයන්' }, { id: 'food', label: 'ආහාර' }, { id: 'daily', label: 'දෛනික' }
  ];
  const categoryName = (id) => CATEGORIES.find((category) => category.id === id)?.label || 'දෛනික';

  const LESSONS = [
    { id: 'desu', title: 'です — ආචාරශීලී වාක්‍ය', subtitle: 'Desu · ප්‍රකාශය', description: 'ජපන් භාෂාවේ සරල ආචාරශීලී ප්‍රකාශයක් අවසන් කිරීමට 「です」 යොදනවා. එය සිංහල “වේ / යි” වැනි අදහසක් ලබා දෙනවා. නමක්, රැකියාවක් හෝ හඳුනාගැනීමක් කියන විට මෙය ඉතා ප්‍රයෝජනවත්.', rule: 'නම හෝ විස්තරය + です。 උදාහරණයට “ශිෂ්‍යයෙක්” + “වේ” → 学生です。', examples: [ ['わたしは学生です。', 'Watashi wa gakusei desu.', 'මම ශිෂ්‍යයෙක් / ශිෂ්‍යාවක්.'], ['これは本です。', 'Kore wa hon desu.', 'මෙය පොතක්.'] ], question: '“මෙය පොතක්.” කියන්නේ කොහොමද?', options: ['これは本です。', 'これは本か。', '本をです。', 'わたしは本。'], answer: 0, explanation: '「これは本です。」 යනු “මෙය පොතක්.” කියන ආචාරශීලී වාක්‍යයයි.' },
    { id: 'wa', title: 'は — මාතෘකාව හඳුන්වමු', subtitle: 'Wa · Topic particle', description: '「は」 වාක්‍යයේ කතා කරන මාතෘකාව පෙන්වන අංශුවයි. ලියන්නේ “ha” වුවත් අංශුවක් ලෙස කියවන්නේ “wa” කියලා. “මම ගැන නම්…” වැනි අදහසක් එයින් ලැබෙනවා.', rule: 'මාතෘකාව + は + විස්තරය + です。 「わたしは…」 = “මම ගැන නම්…”', examples: [ ['わたしはスリランカ人です。', 'Watashi wa Suriranka-jin desu.', 'මම ශ්‍රී ලාංකිකයෙක් / ශ්‍රී ලාංකිකාවක්.'], ['これはお茶です。', 'Kore wa ocha desu.', 'මෙය තේ.'] ], question: '“මම ශිෂ්‍යයෙක්.” සඳහා හරි අංශුව කුමක්ද?', options: ['わたしを学生です。', 'わたしは学生です。', 'わたしが学生を。', '学生はわたしを。'], answer: 1, explanation: 'මෙහි “මම” මාතෘකාව නිසා 「は」 යොදන්න. එය “wa” ලෙස කියවෙනවා.' },
    { id: 'o', title: 'を — ක්‍රියාවේ වස්තුව', subtitle: 'O · Object particle', description: 'ක්‍රියාව බලපාන දෙය පෙන්වන්න 「を」 භාවිත කරනවා. “තේ බොනවා” කියන විට බොන දෙය “තේ” නිසා 「お茶を飲みます」 කියනවා. මෙම අංශුව “o” ලෙස කියවෙනවා.', rule: 'වස්තුව + を + ක්‍රියාව。 උදා: お茶を飲みます。', examples: [ ['水を飲みます。', 'Mizu o nomimasu.', 'මම වතුර බොනවා.'], ['ごはんを食べます。', 'Gohan o tabemasu.', 'මම බත් කනවා.'] ], question: '“මම තේ බොනවා.” කියන්න නිවැරදි වාක්‍යය?', options: ['お茶は飲みますです。', 'お茶を飲みます。', 'お茶か飲みます。', 'お茶です飲みます。'], answer: 1, explanation: 'බොන දෙය “තේ” නිසා 「お茶を飲みます。」 යොදන්න.' },
    { id: 'ka', title: 'か — ප්‍රශ්න අසමු', subtitle: 'Ka · Question particle', description: 'ආචාරශීලී වාක්‍යයක අගට 「か」 යෙදීමෙන් එය ප්‍රශ්නයක් වෙනවා. ජපන් භාෂාවේ සාමාන්‍යයෙන් “?” වෙනුවට 「。」 ද ලියන්න පුළුවන්.', rule: 'ප්‍රකාශය + か。 → ප්‍රශ්නය. 「学生です。」 → 「学生ですか。」', examples: [ ['これは何ですか。', 'Kore wa nan desu ka.', 'මෙය කුමක්ද?'], ['元気ですか。', 'Genki desu ka.', 'ඔබ සුවෙන්ද?'] ], question: '“ඔබ සුවෙන්ද?” කියන්න නිවැරදි වාක්‍යය?', options: ['元気です。', '元気をです。', '元気ですか。', 'か元気です。'], answer: 2, explanation: 'අවසානයේ 「か」 එක් කළ විට ආචාරශීලී ප්‍රශ්නයක් වෙනවා.' },
    { id: 'ga', title: 'が — කැමැත්ත කියමු', subtitle: 'Ga · Likes', description: '“කැමතියි” යන්න 「好きです」 ලෙස කියන විට කැමති දෙයට පසුව බොහෝ විට 「が」 යොදනවා. 「を」 නොයොදා 「が」 යොදන එක මෙහි වැදගත්.', rule: 'කැමති දෙය + が + 好きです。 උදා: 日本語が好きです。', examples: [ ['日本語が好きです。', 'Nihongo ga suki desu.', 'මම ජපන් භාෂාවට කැමතියි.'], ['すしが好きです。', 'Sushi ga suki desu.', 'මම සුෂිවලට කැමතියි.'] ], question: '“මම සුෂිවලට කැමතියි.” කියන්න නිවැරදි වාක්‍යය?', options: ['すしを好きです。', 'すしは好きか。', 'すしが好きです。', 'すしです好き。'], answer: 2, explanation: '「好きです」 සමඟ කැමති දෙයට පසුව 「が」 යොදන්න.' }
  ];

  const LISTENING = [
    { jp: 'おはようございます。', romaji: 'Ohayō gozaimasu.', si: 'සුබ උදෑසනක්.', options: ['සුබ උදෑසනක්.', 'සුබ රාත්‍රියක්.', 'ස්තුතියි.'], answer: 0 },
    { jp: '水をください。', romaji: 'Mizu o kudasai.', si: 'කරුණාකර වතුර දෙන්න.', options: ['මට තේ එපා.', 'කරුණාකර වතුර දෙන්න.', 'මෙය කුමක්ද?'], answer: 1 },
    { jp: 'これは本です。', romaji: 'Kore wa hon desu.', si: 'මෙය පොතක්.', options: ['මෙය බළලෙක්.', 'මම පාසලට යනවා.', 'මෙය පොතක්.'], answer: 2 },
    { jp: '駅はどこですか。', romaji: 'Eki wa doko desu ka.', si: 'දුම්රිය ස්ථානය කොහෙද?', options: ['දුම්රිය ස්ථානය කොහෙද?', 'ඔබේ නම කුමක්ද?', 'පාසලට යන්නෙ කවදාද?'], answer: 0 },
    { jp: '日本語が好きです。', romaji: 'Nihongo ga suki desu.', si: 'මම ජපන් භාෂාවට කැමතියි.', options: ['මට වතුර ඕන.', 'මම ජපන් භාෂාවට කැමතියි.', 'ඔබ සුවෙන්ද?'], answer: 1 }
  ];

  const TOPICS = [
    { id: 'introduce', emoji: '🌸', si: 'හඳුන්වා දීම', jp: '自己紹介', suggestions: ['はじめまして。', 'わたしはスリランカから来ました。', '日本語を勉強しています。'], samples: [
      { japanese: 'はじめまして！お名前は何ですか？', romaji: 'Hajimemashite! Onamae wa nan desu ka?', sinhala: 'ඔබව හමුවීම සතුටක්! ඔබේ නම කුමක්ද?' },
      { japanese: 'スリランカから来ましたか？すてきですね！', romaji: 'Suriranka kara kimashita ka? Suteki desu ne!', sinhala: 'ඔබ ශ්‍රී ලංකාවෙන් ආවාද? හරිම හොඳයි නේ!' },
      { japanese: '日本語の勉強は楽しいですか？', romaji: 'Nihongo no benkyō wa tanoshii desu ka?', sinhala: 'ජපන් ඉගෙනීම විනෝදජනකද?' },
      { japanese: 'いいですね！いっしょに練習しましょう。', romaji: 'Ii desu ne! Issho ni renshū shimashō.', sinhala: 'හරිම හොඳයි! අපි එකට පුහුණු වෙමු.' }
    ] },
    { id: 'cafe', emoji: '🍵', si: 'කැෆේ එකේ', jp: 'カフェで', suggestions: ['お茶をください。', 'これはいくらですか？', 'ありがとうございます。'], samples: [
      { japanese: 'いらっしゃいませ！何にしますか？', romaji: 'Irasshaimase! Nani ni shimasu ka?', sinhala: 'සාදරයෙන් පිළිගනිමු! මොනවාද ගන්නේ?' },
      { japanese: 'お茶ですね。ほかに何かいりますか？', romaji: 'Ocha desu ne. Hoka ni nanika irimasu ka?', sinhala: 'තේ නේද? තව මොනවා හරි ඕනද?' },
      { japanese: '三百円です。ありがとうございます！', romaji: 'Sanbyaku-en desu. Arigatō gozaimasu!', sinhala: 'යෙන් 300යි. බොහොම ස්තුතියි!' },
      { japanese: 'どうぞ、ごゆっくり！', romaji: 'Dōzo, goyukkuri!', sinhala: 'කරුණාකර, සුවසේ කාලය ගත කරන්න!' }
    ] },
    { id: 'daily', emoji: '☀️', si: 'දිනපතා කතාබහ', jp: '日常会話', suggestions: ['おはようございます。', '今日はいい天気ですね。', '元気ですか？'], samples: [
      { japanese: 'おはようございます！今日は元気ですか？', romaji: 'Ohayō gozaimasu! Kyō wa genki desu ka?', sinhala: 'සුබ උදෑසනක්! අද ඔබ සුවෙන්ද?' },
      { japanese: 'はい、元気です。今日はいい天気ですね。', romaji: 'Hai, genki desu. Kyō wa ii tenki desu ne.', sinhala: 'ඔව්, මම සුවෙන්. අද ලස්සන කාලගුණයක් නේද?' },
      { japanese: '週末は何をしますか？', romaji: 'Shūmatsu wa nani o shimasu ka?', sinhala: 'සති අන්තයේ ඔබ මොනවාද කරන්නේ?' },
      { japanese: '楽しそうですね！また話しましょう。', romaji: 'Tanoshisō desu ne! Mata hanashimashō.', sinhala: 'විනෝදජනක වගේ! නැවත කතා කරමු.' }
    ] },
    { id: 'travel', emoji: '🗺️', si: 'ගමන් බිමන්', jp: '旅行', suggestions: ['駅はどこですか？', 'ここへ行きたいです。', 'ありがとうございます。'], samples: [
      { japanese: 'こんにちは！どこへ行きたいですか？', romaji: 'Konnichiwa! Doko e ikitai desu ka?', sinhala: 'ආයුබෝවන්! කොහෙටද යන්න කැමති?' },
      { japanese: '駅ですね。この道をまっすぐ行ってください。', romaji: 'Eki desu ne. Kono michi o massugu itte kudasai.', sinhala: 'දුම්රිය ස්ථානය නේද? මේ පාර දිගේ කෙළින් යන්න.' },
      { japanese: '歩いて五分ぐらいです。', romaji: 'Aruite gofun gurai desu.', sinhala: 'පයින් විනාඩි පහක් පමණයි.' },
      { japanese: 'どういたしまして。よい旅を！', romaji: 'Dōitashimashite. Yoi tabi o!', sinhala: 'සුළු දෙයක්. සුබ ගමන්!' }
    ] }
  ];

  const PHRASES = [
    { jp: '少しずつ、がんばりましょう。', si: 'ටිකෙන් ටික උත්සාහ කරමු.' },
    { jp: 'いっしょに練習しましょう。', si: 'අපි එකට පුහුණු වෙමු.' },
    { jp: '今日もいい一日にしましょう。', si: 'අදත් හොඳ දවසක් කරගමු.' },
    { jp: '日本語は楽しいです。', si: 'ජපන් භාෂාව විනෝදජනකයි.' }
  ];
  const CHALLENGES = [
    { id: 'chat', title: 'කතාබහක් අරඹන්න', description: 'Yuki වෙත ජපන් පණිවිඩයක් යවන්න.', icon: 'chat', goal: 1, reward: 15, page: 'chat', metric: (daily) => daily.messages },
    { id: 'words', title: 'වචන 3ක් ඉගෙන ගන්න', description: 'අද අලුත් වචන තුනක් ඉගෙන ගත් බව ලකුණු කරන්න.', icon: 'cards', goal: 3, reward: 20, page: 'vocabulary', metric: (daily) => daily.learnedIds.length },
    { id: 'listen', title: 'අසා පිළිතුරු දෙන්න', description: 'සවන්දීමේ ප්‍රශ්නයකට නිවැරදි පිළිතුරක් දෙන්න.', icon: 'headphones', goal: 1, reward: 15, page: 'listening', metric: (daily) => daily.correctListening }
  ];
  const PAGE_TITLES = { dashboard: 'මුල් පිටුව', chat: 'Yuki සමඟ කතාබහ', vocabulary: 'වචන කාඩ්පත්', grammar: 'ව්‍යාකරණ', listening: 'සවන්දීම', challenges: 'දෛනික අභියෝග', settings: 'සැකසුම්' };
  const INITIAL_MESSAGE = { role: 'assistant', source: 'welcome', japanese: 'こんにちは！わたしはユキです。いっしょに日本語を練習しましょう！', romaji: 'Konnichiwa! Watashi wa Yuki desu. Issho ni Nihongo o renshū shimashō!', sinhala: 'ආයුබෝවන්! මම Yuki. අපි එකට ජපන් පුහුණු වෙමු!' };

  function localDay(date = new Date()) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }
  function dayNumber(iso) {
    const parts = String(iso).split('-').map(Number);
    return parts.length === 3 && parts.every(Number.isFinite) ? Math.floor(Date.UTC(parts[0], parts[1] - 1, parts[2]) / 86400000) : 0;
  }
  const freshDaily = () => ({ date: localDay(), messages: 0, learnedIds: [], correctListening: 0, claimed: [] });
  const defaultState = () => ({
    onboarded: false,
    settings: { name: '', theme: 'light', romaji: true, ttsSpeed: 1, level: 'beginner' },
    progress: { learnedWords: [], completedLessons: [], messagesSent: 0, listeningAttempts: 0, listeningCorrect: 0, streak: 0, lastActiveDay: '', xp: 0, daily: freshDaily() },
    chatHistory: []
  });
  function safeNumber(value) { return Number.isFinite(Number(value)) ? clamp(Math.floor(Number(value)), 0, 1000000) : 0; }
  function readState() {
    const base = defaultState();
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (!raw || typeof raw !== 'object') return base;
      const settings = raw.settings || {};
      const progress = raw.progress || {};
      const daily = progress.daily || {};
      base.onboarded = raw.onboarded === true;
      base.settings.name = typeof settings.name === 'string' ? settings.name.trim().slice(0, 30) : '';
      base.settings.theme = settings.theme === 'dark' ? 'dark' : 'light';
      base.settings.romaji = settings.romaji !== false;
      base.settings.ttsSpeed = Number.isFinite(Number(settings.ttsSpeed)) ? Math.round(clamp(Number(settings.ttsSpeed), .7, 1.2) * 10) / 10 : 1;
      base.progress.learnedWords = Array.isArray(progress.learnedWords) ? [...new Set(progress.learnedWords.filter((id) => WORDS.some((word) => word.id === id)))] : [];
      base.progress.completedLessons = Array.isArray(progress.completedLessons) ? [...new Set(progress.completedLessons.filter((id) => LESSONS.some((lesson) => lesson.id === id)))] : [];
      base.progress.messagesSent = safeNumber(progress.messagesSent);
      base.progress.listeningAttempts = safeNumber(progress.listeningAttempts);
      base.progress.listeningCorrect = safeNumber(progress.listeningCorrect);
      base.progress.streak = safeNumber(progress.streak);
      base.progress.xp = safeNumber(progress.xp);
      base.progress.lastActiveDay = typeof progress.lastActiveDay === 'string' ? progress.lastActiveDay : '';
      if (daily.date === localDay()) {
        base.progress.daily = {
          date: localDay(), messages: safeNumber(daily.messages),
          learnedIds: Array.isArray(daily.learnedIds) ? [...new Set(daily.learnedIds.filter((id) => WORDS.some((word) => word.id === id)))] : [],
          correctListening: safeNumber(daily.correctListening),
          claimed: Array.isArray(daily.claimed) ? [...new Set(daily.claimed.filter((id) => CHALLENGES.some((challenge) => challenge.id === id)))] : []
        };
      }
      if (Array.isArray(raw.chatHistory)) {
        base.chatHistory = raw.chatHistory.slice(-30).filter((item) => item && ['user', 'assistant'].includes(item.role)).map((item) => ({
          role: item.role, source: ['welcome', 'demo', 'ai'].includes(item.source) ? item.source : 'demo',
          japanese: String(item.japanese || '').slice(0, 1000), romaji: String(item.romaji || '').slice(0, 1000),
          sinhala: String(item.sinhala || '').slice(0, 1000),
          feedback: item.feedback && typeof item.feedback === 'object' ? {
            explanation: String(item.feedback.explanation || '').slice(0, 600),
            corrected: String(item.feedback.corrected || '').slice(0, 300)
          } : null
        }));
      }
    } catch (_) { /* Corrupt or unavailable storage: continue safely in memory. */ }
    return base;
  }
  let state = readState();
  let storageWarningShown = false;
  function saveState() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
    catch (_) { if (!storageWarningShown) { storageWarningShown = true; toast('මෙම බ්‍රවුසරයේ දත්ත සුරැකීම අක්‍රියයි. ප්‍රගතිය නැවත පිවිසීමේදී නැති විය හැක.', 'error'); } }
  }
  function ensureDaily() {
    if (state.progress.daily.date !== localDay()) { state.progress.daily = freshDaily(); saveState(); }
  }
  function visibleStreak() {
    const gap = dayNumber(localDay()) - dayNumber(state.progress.lastActiveDay);
    return gap >= 0 && gap <= 1 ? state.progress.streak : 0;
  }
  function recordActivity(type, detail) {
    ensureDaily();
    const today = localDay();
    if (state.progress.lastActiveDay !== today) {
      state.progress.streak = dayNumber(today) - dayNumber(state.progress.lastActiveDay) === 1 ? state.progress.streak + 1 : 1;
      state.progress.lastActiveDay = today;
    }
    if (type === 'chat') { state.progress.messagesSent += 1; state.progress.daily.messages += 1; state.progress.xp += 5; }
    if (type === 'word' && !state.progress.daily.learnedIds.includes(detail)) { state.progress.daily.learnedIds.push(detail); state.progress.xp += 5; }
    if (type === 'listening') {
      state.progress.listeningAttempts += 1;
      if (detail === true) { state.progress.listeningCorrect += 1; state.progress.daily.correctListening += 1; state.progress.xp += 8; }
    }
    if (type === 'lesson') state.progress.xp += 10;
    saveState();
    refreshSharedUI();
  }
  function completedChallenges() { ensureDaily(); return CHALLENGES.filter((challenge) => challenge.metric(state.progress.daily) >= challenge.goal).length; }
  function currentTopic() { return TOPICS.find((topic) => topic.id === ui.topic) || TOPICS[0]; }
  function currentDeck() { return ui.deckOrder.map((id) => WORDS.find((word) => word.id === id)).filter((word) => word && (ui.category === 'all' || word.category === ui.category)); }
  function dateLabel() {
    const date = new Date();
    const months = ['ජනවාරි', 'පෙබරවාරි', 'මාර්තු', 'අප්‍රේල්', 'මැයි', 'ජූනි', 'ජූලි', 'අගෝස්තු', 'සැප්තැම්බර්', 'ඔක්තෝබර්', 'නොවැම්බර්', 'දෙසැම්බර්'];
    const weekdays = ['ඉරිදා', 'සඳුදා', 'අඟහරුවාදා', 'බදාදා', 'බ්‍රහස්පතින්දා', 'සිකුරාදා', 'සෙනසුරාදා'];
    return `${months[date.getMonth()]} ${date.getDate()} · ${weekdays[date.getDay()]}`;
  }
  function greeting() {
    const hour = new Date().getHours();
    return hour < 11 ? 'සුබ උදෑසනක්' : hour < 17 ? 'සුබ දවසක්' : 'සුබ සන්ධ්‍යාවක්';
  }
  function phraseToday() { return PHRASES[dayNumber(localDay()) % PHRASES.length]; }

  const ui = {
    page: 'dashboard', mode: 'demo', serverAvailable: false, forceDemo: false,
    topic: 'introduce', demoSteps: {}, chatDraft: '', chatBusy: false, chatError: false, retryInput: '', chatRequestId: 0,
    category: 'all', deckOrder: WORDS.map((word) => word.id), cardIndex: 0, cardFlipped: false,
    lessonIndex: 0, quizStates: {}, listenIndex: 0, listenAnswer: null, listenRevealed: false,
    recognition: null, micListening: false, utterance: null
  };
  const speechSupported = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  function toast(message, type = 'info') {
    const root = $('#toast-root');
    if (!root) return;
    const item = document.createElement('div');
    item.className = `toast ${type === 'error' ? 'error' : ''}`;
    item.innerHTML = `${icon(type === 'error' ? 'info' : 'sparkles')}<span>${escapeHTML(message)}</span>`;
    root.append(item);
    setTimeout(() => { item.style.opacity = '0'; item.style.transform = 'translateY(9px)'; setTimeout(() => item.remove(), 250); }, 4700);
    if (root.children.length > 3) root.firstElementChild.remove();
  }
  function applyTheme() {
    document.documentElement.dataset.theme = state.settings.theme;
    const use = $('.theme-icon use');
    if (use) use.setAttribute('href', state.settings.theme === 'dark' ? '#i-sun' : '#i-moon');
    const label = $('.theme-label');
    if (label) label.textContent = state.settings.theme === 'dark' ? 'එළිය තේමාව' : 'අඳුරු තේමාව';
    const meta = $('meta[name="theme-color"]');
    if (meta) meta.content = state.settings.theme === 'dark' ? '#171522' : '#faf8fe';
  }
  function refreshSharedUI() {
    ensureDaily();
    $$('.nav-link[data-page], .mobile-bottom-nav [data-page]').forEach((button) => {
      const active = button.dataset.page === ui.page;
      button.classList.toggle('active', active);
      if (active) button.setAttribute('aria-current', 'page'); else button.removeAttribute('aria-current');
    });
    const moreButton = $('.mobile-bottom-nav [data-action="open-menu"]');
    if (moreButton) moreButton.classList.toggle('active', !['dashboard', 'chat', 'vocabulary', 'listening'].includes(ui.page));
    const breadcrumb = $('#breadcrumb-current');
    if (breadcrumb) breadcrumb.textContent = PAGE_TITLES[ui.page];
    const count = completedChallenges();
    const goalText = $('#sidebar-goal-text');
    const goalFill = $('#sidebar-goal-fill');
    if (goalText) goalText.textContent = `${count} / 3 සම්පූර්ණයි`;
    if (goalFill) goalFill.style.width = `${count / 3 * 100}%`;
    const pill = $('.mode-pill');
    if (pill) pill.classList.toggle('mode-live', ui.mode === 'ai');
    $$('[data-mode-label]').forEach((element) => { element.textContent = ui.mode === 'ai' ? 'AI සකසා ඇත' : 'Demo mode'; });
    applyTheme();
  }
  function showApp() {
    $('#welcome-screen').hidden = true;
    $('#app-shell').hidden = false;
    renderPage();
  }
  function enterApp(saveName = false) {
    if (saveName) state.settings.name = ($('#welcome-name')?.value || '').trim().slice(0, 30);
    state.onboarded = true;
    saveState();
    showApp();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function navigate(page) {
    if (!(page in PAGE_TITLES)) return;
    if (ui.page !== page) { stopSpeech(); stopRecognition(); }
    ui.page = page;
    $('#app-shell')?.classList.remove('menu-open');
    renderPage();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function pageIntro(kicker, title, description, right = '') {
    return `<div class="page-intro"><div><span class="intro-kicker">${escapeHTML(kicker)}</span><h1>${escapeHTML(title)}</h1><p>${escapeHTML(description)}</p></div>${right}</div>`;
  }
  function renderPage() {
    ensureDaily();
    refreshSharedUI();
    const root = $('#page-root');
    if (!root) return;
    const pages = { dashboard: renderDashboard, chat: renderChat, vocabulary: renderVocabulary, grammar: renderGrammar, listening: renderListening, challenges: renderChallenges, settings: renderSettings };
    root.innerHTML = `<div class="page-fade">${pages[ui.page]()}</div>`;
    if (ui.page === 'chat') scrollChat();
  }

  function renderDashboard() {
    const phrase = phraseToday();
    const name = state.settings.name ? `, ${escapeHTML(state.settings.name)}` : '';
    const cards = [
      { page: 'chat', icon: 'chat', color: 'purple', title: 'කතාබහ පුහුණුව', detail: 'ජපන් වාක්‍ය කියමින් පුහුණු වෙන්න' },
      { page: 'vocabulary', icon: 'cards', color: 'pink', title: 'අලුත් වචන', detail: 'කාඩ්පත් පෙරළමින් ඉගෙන ගන්න' },
      { page: 'listening', icon: 'headphones', color: 'peach', title: 'සවන් දීම', detail: 'ජපන් වාක්‍ය අසා තේරුම් ගන්න' }
    ];
    return `<div class="dashboard-head"><div><h1>${greeting()}${name}! <span aria-hidden="true">🌸</span></h1><p>ඔබේ ජපන් ගමනේ අදත් පුංචි පියවරක් ඉදිරියට යමු.</p></div><span class="date-chip">${icon('clock')}${escapeHTML(dateLabel())}</span></div>
      <section class="hero-card" aria-label="Yuki සමඟ ඉගෙන ගන්න"><div class="hero-copy"><span class="hero-kicker">✦ YUKI සමඟ අදත් ඉගෙන ගමු</span><h2>ජපන් කතා කරන්න<br><span>බය වෙන්න එපා!</span></h2><p>වැරදි වුණත් කමක් නැහැ. Yuki එක්ක කතා කරමින්, සිංහලෙන් තේරුම් ගනිමින්, ඔබේම වේගයෙන් ඉගෙන ගන්න.</p><div class="hero-actions"><button type="button" class="button button-primary" data-page="chat">Yuki එක්ක කතා කරන්න ${icon('arrow-right')}</button><button type="button" class="hero-secondary" data-page="grammar">පාඩමක් බලමු ${icon('arrow-right')}</button></div></div><div class="hero-art"><span class="hero-bubble">いっしょに がんばろう！</span><img src="assets/yuki.png" alt="Yuki ඔබට අත වනයි"><span class="hero-sakura">✿</span></div></section>
      <div class="stats-grid"><div class="stat-card card"><span class="stat-icon purple">${icon('flame')}</span><div class="stat-copy"><small>ඉගෙනුම් දින පෙළ</small><strong>${visibleStreak()}<span>දින</span></strong></div></div><div class="stat-card card"><span class="stat-icon pink">${icon('cards')}</span><div class="stat-copy"><small>ඉගෙන ගත් වචන</small><strong>${state.progress.learnedWords.length}<span>වචන</span></strong></div></div><div class="stat-card card"><span class="stat-icon peach">${icon('chat')}</span><div class="stat-copy"><small>යැවූ පුහුණු පණිවිඩ</small><strong>${state.progress.messagesSent}<span>පණිවිඩ</span></strong></div></div></div>
      <div class="dashboard-grid"><section><div class="section-heading"><div><h2>අද මොනවද ඉගෙන ගන්නේ?</h2><p>ඔබට කැමති තැනකින් පටන් ගන්න</p></div></div><div class="route-grid">${cards.map((card) => `<button type="button" class="route-card" data-page="${card.page}"><span class="route-icon ${card.color}">${icon(card.icon)}</span><strong>${card.title}</strong><small>${card.detail}</small>${icon('arrow-right')}</button>`).join('')}</div></section><section><div class="section-heading"><div><h2>දෛනික අභියෝග</h2><p>පුංචි ඉලක්ක, ලොකු ප්‍රගතියක්</p></div><button class="text-button" type="button" data-page="challenges">සියල්ල බලන්න ${icon('arrow-right')}</button></div><div class="challenge-preview card"><div class="challenge-preview-top"><span class="challenge-preview-icon">${icon('target')}</span><div><strong>අද ඉලක්කය</strong><small>දිනපතා ටිකෙන් ටික ඉදිරියට</small></div></div><div class="challenge-preview-count"><b>${completedChallenges()} / 3</b><span>අභියෝග සම්පූර්ණයි</span></div><div class="progress-track"><span style="width:${completedChallenges() / 3 * 100}%"></span></div><button class="text-button" type="button" data-page="challenges">අභියෝග බලන්න →</button></div></section></div>
      <section class="daily-phrase"><span class="phrase-flower">✿</span><div class="phrase-copy"><small>අද ජපන් වාක්‍යය</small><strong>${escapeHTML(phrase.jp)}</strong><span>${escapeHTML(phrase.si)}</span></div><button class="icon-button" type="button" aria-label="අද වාක්‍යය අසන්න" data-action="speak" data-text="${escapeHTML(phrase.jp)}">${icon('volume')}</button></section>`;
  }

  function ensureChat() {
    if (!state.chatHistory.length) { state.chatHistory = [{ ...INITIAL_MESSAGE }]; saveState(); }
  }
  function messageMarkup(message) {
    if (message.role === 'user') return `<div class="message-row user"><div class="message-bubble"><p class="message-jp" dir="auto">${escapeHTML(message.japanese)}</p></div></div>`;
    const source = message.source === 'ai' ? 'Yuki · AI පිළිතුර' : message.source === 'welcome' ? 'Yuki · ආරම්භක පණිවිඩය' : 'Yuki · පෙර සකස් කළ ආදර්ශය';
    const feedback = message.feedback?.explanation ? `<div class="grammar-feedback"><strong>✦ සිංහලෙන් ව්‍යාකරණ සටහන${message.source === 'demo' ? ' · සීමිත නීති-පදනම්' : ''}</strong><p>${escapeHTML(message.feedback.explanation)}</p>${message.feedback.corrected ? `<span class="correction">${escapeHTML(message.feedback.corrected)}</span>` : ''}</div>` : '';
    return `<div class="message-row assistant"><div class="message-avatar">ゆ</div><div class="message-bubble"><span class="message-source">${source}</span><p class="message-jp" lang="ja">${escapeHTML(message.japanese)}</p>${state.settings.romaji && message.romaji ? `<p class="message-romaji">${escapeHTML(message.romaji)}</p>` : ''}${message.sinhala ? `<p class="message-si">${escapeHTML(message.sinhala)}</p>` : ''}${feedback}<div class="message-tools"><button type="button" data-action="speak" data-text="${escapeHTML(message.japanese)}" aria-label="ජපන් වාක්‍යය නැවත අසන්න">${icon('volume')} නැවත අසන්න</button></div></div></div>`;
  }
  function chatMessagesMarkup() {
    return `<div class="chat-date">අපි ජපන් පුහුණුව පටන් ගමු ✧</div>${state.chatHistory.map(messageMarkup).join('')}${ui.chatBusy ? `<div class="message-row assistant"><div class="message-avatar">ゆ</div><div class="message-bubble typing-bubble" aria-label="පිළිතුර සූදානම් වෙමින්"><span></span><span></span><span></span></div></div>` : ''}${ui.chatError ? `<div class="chat-error">${icon('info')} AI සේවාවට දැන් සම්බන්ධ විය නොහැක. <button type="button" data-action="retry-chat">නැවත උත්සාහ කරන්න</button><button type="button" data-action="switch-demo">Demo වෙත යන්න</button></div>` : ''}`;
  }
  function renderChat() {
    ensureChat();
    const topic = currentTopic();
    const demo = ui.mode === 'demo';
    return `${pageIntro('SPEAK & PRACTICE', 'Yuki එක්ක ජපන් කතා කරමු', 'ලියන්න හෝ මයික් භාවිත කරන්න. ජපන් පිළිතුර, romaji සහ සිංහල අර්ථය එක තැනක.')}
      <div class="chat-layout"><section class="chat-panel card" aria-label="ජපන් සංවාදය"><div class="chat-header"><span class="yuki-avatar"><img src="assets/yuki.png" alt=""></span><div class="chat-header-copy"><strong>Yuki <span aria-hidden="true">✿</span></strong><small>${demo ? 'ආදර්ශ සංවාද මාදිලිය' : 'AI mode සකසා ඇත'} · ${escapeHTML(topic.si)}</small></div><button class="icon-button" type="button" data-action="reset-chat" aria-label="සංවාදය නැවත අරඹන්න" title="සංවාදය නැවත අරඹන්න">${icon('refresh')}</button></div>
      <div class="demo-notice ${demo ? '' : 'live-notice'}">${icon('info')}<span>${demo ? 'Demo mode: පිළිතුරු පෙර සකස් කළ ආදර්ශ වාක්‍ය වේ; ඔබේ සෑම පණිවිඩයකටම අනුව සකස් කරන AI පිළිතුරු නොවේ. වැරදි පිළිබඳ සටහන් සීමිත නීති කිහිපයකට පමණයි.' : 'AI mode: ආරක්ෂිත server එක හරහා පිළිතුරු ලැබේ. කරුණු හා ව්‍යාකරණ නිවැරදි බව ඉගෙනීමේදී සසඳා බලන්න.'}</span></div>
      <div id="chat-messages" class="chat-messages" role="log" aria-live="polite">${chatMessagesMarkup()}</div><div class="chat-composer"><div class="suggestion-row">${topic.suggestions.map((suggestion) => `<button type="button" class="suggestion-chip" data-action="prefill" data-text="${escapeHTML(suggestion)}">${escapeHTML(suggestion)}</button>`).join('')}</div><div class="composer-box"><textarea id="chat-input" rows="1" maxlength="500" aria-label="ජපන් පණිවිඩයක් ලියන්න" placeholder="ජපන් භාෂාවෙන් මෙතැන ලියන්න..." ${ui.chatBusy ? 'disabled' : ''}>${escapeHTML(ui.chatDraft)}</textarea><button class="icon-button mic-button ${ui.micListening ? 'is-listening' : ''}" type="button" data-action="microphone" aria-label="ජපන් හඬ හඳුනාගැනීම ${ui.micListening ? 'නවත්වන්න' : 'ආරම්භ කරන්න'}" title="${Recognition ? 'කතා කිරීමට තට්ටු කරන්න; නවත්වන්න නැවත තට්ටු කරන්න' : 'මෙම බ්‍රවුසරයේ හඬ හඳුනාගැනීම නොමැත'}" ${Recognition && !ui.chatBusy ? '' : 'disabled'}>${icon('mic')}</button><button class="send-button" type="button" data-action="send-chat" aria-label="පණිවිඩය යවන්න" ${ui.chatBusy ? 'disabled' : ''}>${icon('send')}</button></div><div class="composer-hint"><span>${Recognition ? '🎙 මයික් තට්ටු කර කතා කරන්න · පණිවිඩය යවීමට පෙර පරීක්ෂා කරන්න' : 'මයික් පහසුකම මෙම බ්‍රවුසරයේ නොමැත · ලිවීමෙන් පුහුණු වෙන්න'}</span><span>Enter යවයි · Shift + Enter නව පේළිය</span></div></div></section>
      <aside class="chat-side"><div class="side-card card"><h3>කතාබහ මාතෘකාව</h3><p>පුහුණු වෙන්න කැමති දෙයක් තෝරන්න</p><div class="topic-list">${TOPICS.map((item) => `<button class="topic-option ${ui.topic === item.id ? 'active' : ''}" type="button" data-action="topic" data-id="${item.id}"><span>${item.emoji}</span><span><strong>${item.si}</strong><small>${item.jp}</small></span></button>`).join('')}</div></div><div class="side-card card tip-card"><span class="tip-icon">💡</span><h3>පුංචි ඉඟියක්</h3><p>වැරදි වුණත් බය වෙන්න එපා! පළමුව සරල වාක්‍යයක් ලියන්න. ජපන් පෙළට යටින් සිංහල තේරුම කියවන්න.</p></div></aside></div>`;
  }
  function scrollChat() { const box = $('#chat-messages'); if (box) box.scrollTop = box.scrollHeight; }
  function updateChatMessages() {
    if (ui.page !== 'chat' || $('#app-shell').hidden) return;
    const box = $('#chat-messages');
    if (box) { box.innerHTML = chatMessagesMarkup(); scrollChat(); }
    const input = $('#chat-input');
    if (input) input.disabled = ui.chatBusy;
    const send = $('.send-button'); if (send) send.disabled = ui.chatBusy;
    const mic = $('.mic-button'); if (mic) mic.disabled = ui.chatBusy || !Recognition;
  }
  function demoGrammar(input) {
    const text = input.replace(/\s/g, '');
    if (/(すし|日本語|お茶|水|コーヒー)を好きです/.test(text)) return { explanation: '「好きです」 සමඟ කැමති දෙයට පසුව 「が」 යොදන්න. මෙහි 「を」 නොයොදයි.', corrected: text.replace('を好きです', 'が好きです。').replace('です。。', 'です。') };
    if (/(私|わたし)です学生/.test(text)) return { explanation: 'මාතෘකාව වන “මම” පසු 「は」 යොදා, ආචාරශීලී 「です」 වාක්‍යය අගට දමන්න.', corrected: 'わたしは学生です。' };
    if (/こんにちはです/.test(text)) return { explanation: '「こんにちは」 දැනටමත් සුබපැතුමක්. මෙහි අගට 「です」 අවශ්‍ය නැහැ.', corrected: 'こんにちは。' };
    if (/ありがとうです/.test(text)) return { explanation: 'ආචාරශීලීව “ස්තුතියි” කියන්න 「ありがとうございます」 භාවිත කරන්න.', corrected: 'ありがとうございます。' };
    if (/(私|わたし)を.+です/.test(text)) return { explanation: '“මම” වාක්‍යයේ මාතෘකාව නම් 「を」 වෙනුවට 「は」 යොදන්න. 「は」 අංශුව “wa” ලෙස කියවෙනවා.', corrected: text.replace('を', 'は') };
    return null;
  }
  function demoReply(input) {
    const topic = currentTopic();
    const step = ui.demoSteps[topic.id] || 0;
    ui.demoSteps[topic.id] = step + 1;
    return { role: 'assistant', source: 'demo', ...topic.samples[step % topic.samples.length], feedback: demoGrammar(input) };
  }
  async function requestAI(message) {
    const history = state.chatHistory.slice(0, -1).slice(-8).map((item) => ({ role: item.role, content: item.japanese }));
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 25000);
    try {
      const response = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message, topic: ui.topic, history }), signal: controller.signal });
      let body;
      try { body = await response.json(); } catch (_) { throw new Error('සේවාවෙන් වලංගු පිළිතුරක් ලැබුණේ නැහැ.'); }
      if (!response.ok) throw new Error(response.status === 429 ? 'මිනිත්තුවකට ඉල්ලීම් සීමාව ඉක්මවා ඇත. මොහොතකින් යළි උත්සාහ කරන්න.' : (body.error || 'AI සේවාවට සම්බන්ධ විය නොහැක.'));
      if (!body.reply || typeof body.reply.japanese !== 'string' || typeof body.reply.sinhala !== 'string') throw new Error('AI පිළිතුරේ අවශ්‍ය කොටස් නොමැත.');
      return { role: 'assistant', source: 'ai', japanese: body.reply.japanese, romaji: body.reply.romaji || '', sinhala: body.reply.sinhala, feedback: body.reply.feedback || null };
    } finally { clearTimeout(timer); }
  }
  async function runReply(input, requestId) {
    try {
      let reply;
      if (ui.mode === 'demo') { await new Promise((resolve) => setTimeout(resolve, 750)); reply = demoReply(input); }
      else reply = await requestAI(input);
      if (requestId !== ui.chatRequestId) return;
      state.chatHistory.push(reply);
      state.chatHistory = state.chatHistory.slice(-30);
      ui.chatError = false;
      saveState();
    } catch (error) {
      if (requestId !== ui.chatRequestId) return;
      ui.chatError = true;
      ui.retryInput = input;
      toast(error.name === 'AbortError' ? 'AI පිළිතුරට වැඩි වේලාවක් ගියා. නැවත උත්සාහ කරන්න.' : error.message, 'error');
    } finally {
      if (requestId === ui.chatRequestId) { ui.chatBusy = false; updateChatMessages(); }
    }
  }
  function sendChat() {
    if (ui.chatBusy) return;
    const input = ($('#chat-input')?.value || ui.chatDraft).trim();
    if (!input) { toast('පළමුව ජපන් වාක්‍යයක් ලියන්න.'); $('#chat-input')?.focus(); return; }
    if (input.length > 500) { toast('පණිවිඩය අකුරු 500කට අඩු කරන්න.', 'error'); return; }
    ensureChat();
    state.chatHistory.push({ role: 'user', source: 'demo', japanese: input, romaji: '', sinhala: '' });
    state.chatHistory = state.chatHistory.slice(-30);
    ui.chatDraft = '';
    ui.chatBusy = true;
    ui.chatError = false;
    ui.retryInput = input;
    const requestId = ++ui.chatRequestId;
    recordActivity('chat');
    const inputBox = $('#chat-input'); if (inputBox) inputBox.value = '';
    updateChatMessages();
    runReply(input, requestId);
  }
  function retryChat() {
    if (ui.chatBusy || !ui.retryInput) return;
    ui.chatError = false;
    ui.chatBusy = true;
    const requestId = ++ui.chatRequestId;
    updateChatMessages();
    runReply(ui.retryInput, requestId);
  }

  function renderVocabulary() {
    const deck = currentDeck();
    if (ui.cardIndex >= deck.length) ui.cardIndex = 0;
    const word = deck[ui.cardIndex];
    const learned = state.progress.learnedWords.includes(word.id);
    const totalLearned = state.progress.learnedWords.length;
    return `${pageIntro('WORDS TO REMEMBER', 'අලුත් වචන, පුංචි පියවරෙන්', 'කාඩ්පත තට්ටු කර පෙරළන්න. ජපන් කියවීම, සිංහල තේරුම සහ උදාහරණය මතක තබාගන්න.', `<button class="button button-outline" type="button" data-action="shuffle">${icon('shuffle')} කාඩ්පත් කලවම් කරන්න</button>`)}
      <div class="vocab-stats"><span class="vocab-stat">${icon('cards')} වචන <strong>${WORDS.length}</strong></span><span class="vocab-stat">${icon('check')} ඉගෙන ගත්තා <strong>${totalLearned}</strong></span><span class="vocab-stat">${icon('star')} අද අලුත් <strong>${state.progress.daily.learnedIds.length}</strong></span></div>
      <div class="filter-row" role="group" aria-label="වචන වර්ගය">${CATEGORIES.map((category) => `<button class="filter-chip ${ui.category === category.id ? 'active' : ''}" type="button" data-action="category" data-id="${category.id}" aria-pressed="${ui.category === category.id}">${category.label}</button>`).join('')}</div>
      <div class="vocab-layout"><section class="flashcard-panel card"><div class="flashcard-topline"><span>කාඩ්පත තට්ටු කර සිංහල තේරුම බලන්න ✧</span><strong>${ui.cardIndex + 1} / ${deck.length}</strong></div><div class="flashcard-scene"><button class="flashcard ${ui.cardFlipped ? 'is-flipped' : ''}" type="button" data-action="flip-card" aria-label="කාඩ්පත පෙරළන්න" aria-pressed="${ui.cardFlipped}"><span class="flashcard-inner"><span class="flashcard-face flashcard-front"><span class="flashcard-category">${categoryName(word.category)}</span><span class="flashcard-jp" lang="ja">${escapeHTML(word.jp)}</span>${state.settings.romaji ? `<span class="flashcard-romaji">${escapeHTML(word.romaji)}</span>` : ''}<span class="flashcard-tap">තේරුම බලන්න තට්ටු කරන්න ↗</span></span><span class="flashcard-face flashcard-back"><span class="flashcard-category">සිංහල තේරුම</span><span class="flashcard-meaning">${escapeHTML(word.si)}</span><span class="flashcard-example" lang="ja">${escapeHTML(word.example)}</span><span class="flashcard-example-si">${escapeHTML(word.exampleSi)}</span><span class="flashcard-tap">ආපසු හැරවීමට තට්ටු කරන්න ↗</span></span></span></button></div><div class="flashcard-controls"><div class="flashcard-controls-left"><button class="icon-button" type="button" data-action="previous-word" aria-label="පෙර වචනය">${icon('arrow-left')}</button><button class="button button-outline" type="button" data-action="speak" data-text="${escapeHTML(word.jp)}">${icon('volume')} අසන්න</button><button class="icon-button" type="button" data-action="next-word" aria-label="ඊළඟ වචනය">${icon('arrow-right')}</button></div><div class="flashcard-controls-right"><button class="button ${learned ? 'button-soft' : 'button-primary'}" type="button" data-action="toggle-learned" data-id="${word.id}">${icon('check')} ${learned ? 'ඉගෙන ගත්තා ✓' : 'මතක තබාගත්තා'}</button></div></div></section>
      <aside class="deck-side"><div class="deck-progress card"><h3>ඔබේ වචන ප්‍රගතිය</h3><p>ඉගෙන ගත් කාඩ්පත් මෙතැන ගණන් වේ</p><div class="deck-count"><strong>${totalLearned} / ${WORDS.length}</strong><span>${Math.round(totalLearned / WORDS.length * 100)}%</span></div><div class="progress-track"><span style="width:${totalLearned / WORDS.length * 100}%"></span></div></div><div class="deck-tip card"><span class="tip-icon">🌷</span><strong>මතක තබාගැනීමේ ඉඟිය</strong><p>වචනය හඬින් අහන්න, කියවන්න, ඊට පස්සේ කාඩ්පත පෙරළා සිංහල අර්ථය පරීක්ෂා කරන්න.</p></div></aside></div>`;
  }
  function updateWord(step) {
    const deck = currentDeck();
    ui.cardIndex = (ui.cardIndex + step + deck.length) % deck.length;
    ui.cardFlipped = false;
    renderPage();
  }

  function renderGrammar() {
    const lesson = LESSONS[ui.lessonIndex];
    const quiz = ui.quizStates[lesson.id] || {};
    const done = state.progress.completedLessons.includes(lesson.id);
    return `${pageIntro('LEARN THE BASICS', 'සිංහලෙන් ජපන් ව්‍යාකරණ', 'සරල පැහැදිලි කිරීම්, සැබෑ උදාහරණ සහ කුඩා ප්‍රශ්න සමඟ ඉගෙන ගන්න.')}
      <div class="grammar-layout"><aside class="lesson-list card"><h2>Beginner · N5 පාඩම්</h2><div>${LESSONS.map((item, index) => `<button class="lesson-link ${index === ui.lessonIndex ? 'active' : ''} ${state.progress.completedLessons.includes(item.id) ? 'done' : ''}" type="button" data-action="lesson" data-index="${index}"><span class="lesson-number">${state.progress.completedLessons.includes(item.id) ? icon('check') : String(index + 1).padStart(2, '0')}</span><span class="lesson-link-copy"><strong>${escapeHTML(item.title)}</strong><small>${escapeHTML(item.subtitle)}</small></span>${state.progress.completedLessons.includes(item.id) ? icon('check') : ''}</button>`).join('')}</div><p class="lesson-progress-note">${state.progress.completedLessons.length} / ${LESSONS.length} පාඩම් අවසන්</p><div class="progress-track"><span style="width:${state.progress.completedLessons.length / LESSONS.length * 100}%"></span></div></aside>
      <article class="lesson-content card"><div class="lesson-head"><div><span class="tag">පාඩම ${String(ui.lessonIndex + 1).padStart(2, '0')} · Beginner</span><h2>${escapeHTML(lesson.title)}</h2><span class="lesson-subtitle">${escapeHTML(lesson.subtitle)}</span></div>${done ? '<span class="tag tag-mint">✓ අවසන්</span>' : ''}</div><p class="lesson-description">${escapeHTML(lesson.description)}</p><div class="rule-box">${icon('sparkles')}<div><strong>මතක තබා ගන්න</strong><p>${escapeHTML(lesson.rule)}</p></div></div><h3>උදාහරණ බලමු</h3><div class="example-list">${lesson.examples.map((example) => `<div class="example-row"><div><span class="jp" lang="ja">${escapeHTML(example[0])}</span>${state.settings.romaji ? `<span class="romaji">${escapeHTML(example[1])}</span>` : ''}<span class="meaning">${escapeHTML(example[2])}</span></div><button class="icon-button" type="button" data-action="speak" data-text="${escapeHTML(example[0])}" aria-label="උදාහරණය අසන්න">${icon('volume')}</button></div>`).join('')}</div>
      <div class="quiz-box"><h3>✎ පොඩි පරීක්ෂණයක්</h3><p>${escapeHTML(lesson.question)}</p><div class="quiz-options">${lesson.options.map((option, index) => `<button type="button" class="quiz-option ${quiz.selected === index ? (index === lesson.answer ? 'correct' : 'wrong') : quiz.solved && index === lesson.answer ? 'correct' : ''}" data-action="quiz-answer" data-index="${index}" ${quiz.solved ? 'disabled' : ''}>${escapeHTML(option)}</button>`).join('')}</div>${quiz.selected !== undefined ? `<p class="quiz-result ${quiz.solved ? 'success' : 'error'}">${quiz.solved ? 'හරිම හොඳයි! ' + escapeHTML(lesson.explanation) : 'තව වරක් උත්සාහ කරමු. ඉහළ නීතිය සහ උදාහරණ බලන්න.'}</p>` : ''}</div><div class="lesson-footer"><button type="button" class="button ${done ? 'button-soft' : 'button-primary'}" data-action="complete-lesson" ${!quiz.solved && !done ? 'disabled title="පළමුව කුඩා ප්‍රශ්නයට නිවැරදි පිළිතුර දෙන්න"' : ''}>${icon('check')} ${done ? 'පාඩම අවසන් කළා' : 'පාඩම අවසන් කරන්න'}</button><button type="button" class="button button-outline" data-action="next-lesson">${ui.lessonIndex === LESSONS.length - 1 ? 'පළමු පාඩමට' : 'ඊළඟ පාඩම'} ${icon('arrow-right')}</button></div></article></div>`;
  }

  function renderListening() {
    const item = LISTENING[ui.listenIndex];
    const answered = ui.listenAnswer !== null;
    const revealed = answered || ui.listenRevealed;
    const score = state.progress.listeningAttempts ? Math.round(state.progress.listeningCorrect / state.progress.listeningAttempts * 100) : 0;
    return `${pageIntro('LISTEN & LEARN', 'අසාගෙන ජපන් තේරුම් ගමු', 'හඬ අසන්න, තේරුම තෝරන්න, එතැනින් ජපන් වාක්‍යයත් බලන්න.')}
      <div class="listening-layout"><section class="listening-card card"><div class="listening-topline"><span>සවන්දීමේ අභ්‍යාසය</span><strong>${ui.listenIndex + 1} / ${LISTENING.length}</strong></div><div id="audio-stage" class="audio-stage"><div class="waveform" aria-hidden="true">${[10,20,31,17,36,23,13,28,36,19,11].map((h, i) => `<span style="--h:${h}px;--i:${i}"></span>`).join('')}</div><button class="audio-play" type="button" data-action="play-listening" aria-label="ජපන් හඬ අසන්න" ${speechSupported ? '' : 'disabled'}>${icon('play')}</button><small>${speechSupported ? 'හඬ අසන්න මෙතැන තට්ටු කරන්න' : 'මෙම බ්‍රවුසරයේ හඬ පහසුකම නොමැත'}</small></div><h2>ඔබට ඇසුණු වාක්‍යයේ තේරුම කුමක්ද?</h2><div class="listen-options">${item.options.map((option, index) => `<button class="listen-option ${answered && index === item.answer ? 'correct' : answered && index === ui.listenAnswer ? 'wrong' : ''}" type="button" data-action="listen-answer" data-index="${index}" ${answered || !speechSupported ? 'disabled' : ''}><span class="option-letter">${'ABC'[index]}</span><span>${escapeHTML(option)}</span></button>`).join('')}</div>${revealed ? `<div class="transcript-box"><small>${answered ? (ui.listenAnswer === item.answer ? '✓ නිවැරදියි! අසුණු වාක්‍යය' : '↗ හරි පිළිතුර මෙන්න') : 'ජපන් පෙළ · හඬ නොමැති කියවීම'}</small><strong lang="ja">${escapeHTML(item.jp)}</strong>${state.settings.romaji ? `<em>${escapeHTML(item.romaji)}</em>` : ''}<p>${escapeHTML(item.si)}</p></div>` : ''}<div class="listen-footer"><span>හඬ ඔබේ බ්‍රවුසරයේ ජපන් text-to-speech මඟින් ලැබේ.</span>${answered ? `<button class="button button-primary" type="button" data-action="next-listening">ඊළඟට ${icon('arrow-right')}</button>` : speechSupported ? `<button class="button button-soft" type="button" data-action="slow-listening">${icon('volume')} සෙමින් අසන්න</button>` : `<button class="button button-soft" type="button" data-action="reveal-listening">පෙළ බලන්න</button>`}</div></section>
      <aside class="listening-side"><div class="card"><h3>ඔබේ සවන්දීමේ ප්‍රගතිය</h3><div class="score-big">${score}% <small>නිවැරදි</small></div><div class="progress-track"><span style="width:${score}%"></span></div><p>නිවැරදි ${state.progress.listeningCorrect} / උත්සාහ ${state.progress.listeningAttempts} · මේ බ්‍රවුසරයේ සුරැකේ.</p></div><div class="card"><h3>හොඳින් සවන් දෙන්න ${icon('headphones')}</h3><p>පළමුව සාමාන්‍ය වේගයෙන් අසන්න. අමාරු නම් “සෙමින් අසන්න” බොත්තම භාවිත කරන්න. පිළිතුරෙන් පසු පෙළ පෙන්වයි.</p>${!speechSupported ? '<div class="speech-warning">හඬ සහාය නැති නිසා මෙම උපාංගයේ සවන්දීමේ ලකුණු නොගණන් ගනී. පෙළ කියවීමට හැක.</div>' : ''}</div></aside></div>`;
  }

  function renderChallenges() {
    const count = completedChallenges();
    return `${pageIntro('A LITTLE EVERY DAY', 'අදට ඔබේ පුංචි අභියෝග', 'දිනපතා කතාබහක්, වචන කිහිපයක්, සවන්දීමක් — ඉගෙනීම පුරුද්දක් කරගන්න.')}
      <div class="challenge-banner"><div><small>✦ අද දවසේ ප්‍රගතිය</small><h2>ඔබ අදත් ඉදිරියට යනවා! 🌷</h2><p>සම්පූර්ණ අභියෝගවල ත්‍යාගය ලබාගෙන ඔබේ XP වැඩි කරගන්න.</p></div><strong>${count}<span> / 3</span></strong></div><div class="challenges-grid">${CHALLENGES.map((challenge) => { const value = challenge.metric(state.progress.daily); const done = value >= challenge.goal; const claimed = state.progress.daily.claimed.includes(challenge.id); return `<article class="challenge-card card"><span class="challenge-card-icon">${icon(challenge.icon)}</span><h3>${challenge.title}</h3><p>${challenge.description}</p><div class="progress-track"><span style="width:${Math.min(value / challenge.goal, 1) * 100}%"></span></div><div class="challenge-card-bottom"><span>${Math.min(value, challenge.goal)} / ${challenge.goal} · +${challenge.reward} XP</span>${claimed ? '<span class="claimed-label">✓ ත්‍යාගය ලැබුණා</span>' : done ? `<button type="button" class="button button-primary" data-action="claim" data-id="${challenge.id}">ත්‍යාගය ගන්න</button>` : `<button type="button" class="button button-outline" data-page="${challenge.page}">අරඹන්න ${icon('arrow-right')}</button>`}</div></article>`; }).join('')}</div><div class="challenge-note card">${icon('info')}<p>අභියෝග සෑම දිනකම ඔබේ උපාංගයේ දේශීය වේලාව අනුව නැවත ආරම්භ වේ. XP සහ දිගටම ඉගෙන ගත් දින ඔබේ බ්‍රවුසරයේ පමණක් සුරැකේ.</p></div>`;
  }

  function renderSettings() {
    const dark = state.settings.theme === 'dark';
    return `${pageIntro('MAKE IT YOURS', 'ඔබේ ඉගෙනුම් සැකසුම්', 'ඔබට පහසු විදිහට Yuki සකසාගෙන ඉගෙන ගන්න.')}
      <div class="settings-layout"><section class="settings-main card"><h2>සාමාන්‍ය සැකසුම්</h2><p>මෙම උපාංගයේ බ්‍රවුසරය තුළ ඔබේ තේරීම් සුරැකේ.</p><div class="setting-row"><div><strong>ඔබේ නම</strong><small>${state.settings.name ? `Yuki ඔබට “${escapeHTML(state.settings.name)}” ලෙස කතා කරයි.` : 'කැමති නම් ඔබේ නම එක් කරන්න.'}</small></div><button class="button button-outline" type="button" data-action="edit-name">වෙනස් කරන්න</button></div><div class="setting-row"><div><strong>ඉගෙනුම් මට්ටම</strong><small>දැනට සරල Beginner · N5 පාඩම් ඇත.</small></div><button class="button button-outline" type="button" data-action="open-level">Beginner ${icon('chevron-down')}</button></div><div class="setting-row"><div><strong>Romaji පෙන්වන්න</strong><small>ජපන් අකුරු යටින් ඉංග්‍රීසි අක්ෂරයෙන් උච්චාරණය පෙන්වන්න.</small></div><button class="switch ${state.settings.romaji ? 'on' : ''}" type="button" role="switch" aria-checked="${state.settings.romaji}" aria-label="Romaji පෙන්වන්න" data-action="toggle-romaji"><span></span></button></div><div class="setting-row"><div><strong>හඬ කියවීමේ වේගය</strong><small>ජපන් වාක්‍ය කියවන වේගය සකසන්න.</small></div><div class="speed-control"><input id="speed-range" type="range" min="0.7" max="1.2" step="0.1" value="${state.settings.ttsSpeed}" aria-label="කියවීමේ වේගය"><strong id="speed-value">${state.settings.ttsSpeed.toFixed(1)}×</strong></div></div><div class="setting-row"><div><strong>අඳුරු තේමාව</strong><small>රාත්‍රී ඉගෙනීමට මෘදු අඳුරු වර්ණ.</small></div><button class="switch ${dark ? 'on' : ''}" type="button" role="switch" aria-checked="${dark}" aria-label="අඳුරු තේමාව" data-action="toggle-theme"><span></span></button></div><div class="setting-row"><div><strong>හඬ පරීක්ෂා කරන්න</strong><small>ඔබේ තෝරාගත් වේගයෙන් ජපන් වාක්‍යයක් අසන්න.</small></div><button class="button button-soft" type="button" data-action="speak" data-text="こんにちは、ユキです。">${icon('volume')} අසන්න</button></div></section><aside class="settings-side"><div class="card profile-card"><span class="profile-avatar">🌸</span><h2>${state.settings.name ? escapeHTML(state.settings.name) : 'ඔබේ ජපන් ගමන'}</h2><p>Beginner · N5 · ඔබේම වේගයෙන් ඉගෙන ගන්න</p><div class="profile-numbers"><span><strong>${visibleStreak()}</strong>දින පෙළ</span><span><strong>${state.progress.xp}</strong>XP ලකුණු</span><span><strong>${state.progress.completedLessons.length}</strong>පාඩම්</span></div></div><div class="card mode-explainer"><span class="tag ${ui.mode === 'ai' ? 'tag-mint' : ''}">${ui.mode === 'ai' ? 'AI MODE' : 'DEMO MODE'}</span><h2>ඉගෙනුම් මාදිලිය</h2><p>${ui.mode === 'ai' ? 'සජීවී AI පිළිතුරු ඔබේ server එක හරහා ලැබේ. API key එක browser එකට නොයවයි.' : 'දැනට පෙර සකස් කළ සංවාද ධාවනය වේ. සජීවී AI පිළිතුරු සඳහා server එකේ OPENAI_API_KEY පරිසර විචල්‍යය සකසන්න.'}</p><button class="reset-link" type="button" data-action="confirm-reset">සුරකින ලද ප්‍රගතිය සහ සැකසුම් මකන්න</button></div></aside></div>`;
  }

  function openModal(type) {
    const root = $('#modal-root');
    let content = '';
    if (type === 'level') content = `<div class="modal-head"><h2>ඔබේ ජපන් මට්ටම</h2><button class="icon-button" data-action="close-modal" aria-label="වසන්න">${icon('close')}</button></div><p>දැනට Beginner පාඩම් පමණක් ලබා ගත හැක. අනෙක් මට්ටම් පසුව එක් කිරීමට සැලසුම් කර ඇත.</p><button type="button" class="level-option selected" data-action="select-level"><span>🌱</span><span><strong>Beginner · N5</strong><small>මුල සිට සරලව ඉගෙන ගන්න</small></span>${icon('check')}</button><div class="level-option" aria-disabled="true"><span>🌿</span><span><strong>Intermediate</strong><small>ඉදිරියේදී</small></span><span class="soon">තවම නැහැ</span></div><div class="level-option" aria-disabled="true"><span>🌳</span><span><strong>Advanced</strong><small>ඉදිරියේදී</small></span><span class="soon">තවම නැහැ</span></div>`;
    if (type === 'mode') content = `<div class="modal-head"><h2>Demo සහ AI mode</h2><button class="icon-button" data-action="close-modal" aria-label="වසන්න">${icon('close')}</button></div><p><strong>Demo:</strong> පෙර ලියූ ජපන් සංවාද හා සීමිත නීති-පදනම් ව්‍යාකරණ ඉඟි. ඔබ ලියන ඕනෑම වාක්‍යයකට ගැලපෙන AI පිළිතුරක් යැයි නොසලකන්න.</p><p><strong>AI:</strong> README අනුව server එකේ පරිසර විචල්‍යයක API key සකසන විට පමණක් සක්‍රිය වේ. Key එක කිසිවිටක browser එකට නොයයි.</p><div class="modal-actions"><button class="button button-outline" type="button" data-action="check-mode">සම්බන්ධතාව යළි බලන්න</button><button class="button button-primary" type="button" data-action="close-modal">හරි</button></div>`;
    if (type === 'name') content = `<div class="modal-head"><h2>ඔබේ නම වෙනස් කරන්න</h2><button class="icon-button" data-action="close-modal" aria-label="වසන්න">${icon('close')}</button></div><p>Yuki ඔබව පිළිගන්න නම ලියන්න. හිස්ව තැබිය හැක.</p><input id="modal-name" type="text" maxlength="30" value="${escapeHTML(state.settings.name)}" placeholder="ඔබේ නම" style="width:100%;height:44px;padding:0 13px;border:1px solid var(--line);border-radius:11px;color:var(--text);background:var(--surface);font-family:var(--font-si);font-size:12px"><div class="modal-actions"><button class="button button-outline" type="button" data-action="close-modal">ඉවතට</button><button class="button button-primary" type="button" data-action="save-name">සුරකින්න</button></div>`;
    if (type === 'reset') content = `<div class="modal-head"><h2>සියලු දත්ත මකන්නද?</h2><button class="icon-button" data-action="close-modal" aria-label="වසන්න">${icon('close')}</button></div><p>වචන ප්‍රගතිය, පාඩම්, සංවාද, XP සහ සැකසුම් මෙම බ්‍රවුසරයෙන් ස්ථිරව මැකේ. මෙය නැවත ලබා ගත නොහැක.</p><div class="modal-actions"><button class="button button-outline" type="button" data-action="close-modal">අවලංගු කරන්න</button><button class="button button-danger" type="button" data-action="reset-all">ඔව්, මකන්න</button></div>`;
    root.innerHTML = `<div class="modal-backdrop" data-action="modal-backdrop"><div class="modal-card" role="dialog" aria-modal="true" aria-label="${type === 'level' ? 'මට්ටම' : type === 'reset' ? 'දත්ත මකන්න' : 'සැකසුම්'}">${content}</div></div>`;
    document.body.style.overflow = 'hidden';
    setTimeout(() => $('#modal-name')?.focus() || $('.modal-card .icon-button')?.focus(), 0);
  }
  function closeModal() { $('#modal-root').innerHTML = ''; document.body.style.overflow = ''; }

  function stopSpeech() {
    if (speechSupported) window.speechSynthesis.cancel();
    ui.utterance = null;
    $('#audio-stage')?.classList.remove('is-playing');
  }
  function speak(text, overrideRate) {
    if (!speechSupported) { toast('මෙම බ්‍රවුසරයේ හඬ කියවීම නොමැත. Chrome හෝ Edge භාවිත කරන්න.', 'error'); return; }
    stopSpeech();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = overrideRate || state.settings.ttsSpeed;
    utterance.pitch = 1.05;
    const voices = window.speechSynthesis.getVoices();
    const japaneseVoice = voices.find((voice) => voice.lang.toLowerCase().startsWith('ja'));
    if (japaneseVoice) utterance.voice = japaneseVoice;
    utterance.onstart = () => { if (ui.utterance === utterance) $('#audio-stage')?.classList.add('is-playing'); };
    utterance.onend = () => { if (ui.utterance === utterance) { $('#audio-stage')?.classList.remove('is-playing'); ui.utterance = null; } };
    utterance.onerror = (event) => {
      if (ui.utterance === utterance) {
        $('#audio-stage')?.classList.remove('is-playing'); ui.utterance = null;
        if (event.error !== 'canceled' && event.error !== 'interrupted') toast('හඬ වාදනය කළ නොහැක. උපාංගයේ ජපන් හඬ සැකසුම් බලන්න.', 'error');
      }
    };
    ui.utterance = utterance;
    window.speechSynthesis.speak(utterance);
  }
  function stopRecognition() {
    if (ui.recognition) { try { ui.recognition.abort(); } catch (_) {} }
    ui.recognition = null; ui.micListening = false;
  }
  function toggleMicrophone() {
    if (!Recognition) { toast('හඬ හඳුනාගැනීම මෙම බ්‍රවුසරයේ නොමැත.', 'error'); return; }
    if (ui.micListening) { ui.recognition?.stop(); return; }
    const recognition = new Recognition();
    recognition.lang = 'ja-JP';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    ui.recognition = recognition;
    recognition.onstart = () => { ui.micListening = true; $('.mic-button')?.classList.add('is-listening'); toast('දැන් ජපන් භාෂාවෙන් කතා කරන්න. නවත්වන්න මයික් නැවත තට්ටු කරන්න.'); };
    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript || '';
      if (transcript) { ui.chatDraft = transcript; const input = $('#chat-input'); if (input) { input.value = transcript; input.focus(); } toast('හඬ පෙළ බවට පත් වුණා. යවීමට පෙර පරීක්ෂා කරන්න.'); }
    };
    recognition.onerror = (event) => {
      const messages = { 'not-allowed': 'මයික් අවසරය ලබා දී නැහැ. බ්‍රවුසරයේ අවසර පරීක්ෂා කරන්න.', 'no-speech': 'හඬක් ඇසුණේ නැහැ. නැවත උත්සාහ කරන්න.', network: 'හඬ හඳුනාගැනීමට ජාල සම්බන්ධතාව අවශ්‍ය විය හැක.' };
      if (event.error !== 'aborted') toast(messages[event.error] || 'හඬ හඳුනාගැනීම අසාර්ථකයි. ලිවීමෙන් උත්සාහ කරන්න.', 'error');
    };
    recognition.onend = () => { if (ui.recognition === recognition) { ui.recognition = null; ui.micListening = false; $('.mic-button')?.classList.remove('is-listening'); } };
    try { recognition.start(); } catch (_) { toast('මයික් ආරම්භ කළ නොහැක. ආරක්ෂිත localhost/HTTPS පිටුවක උත්සාහ කරන්න.', 'error'); }
  }

  async function checkBackend(notify = false) {
    if (location.protocol === 'file:') { ui.mode = 'demo'; if (notify) toast('file:// පිටුවේ Demo mode පමණයි. AI සඳහා server.js ධාවනය කරන්න.'); return; }
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3500);
      let response;
      try { response = await fetch('/api/status', { cache: 'no-store', signal: controller.signal }); }
      finally { clearTimeout(timeout); }
      const data = response.ok ? await response.json() : null;
      ui.serverAvailable = Boolean(data && data.server);
      ui.mode = data?.aiEnabled && !ui.forceDemo ? 'ai' : 'demo';
      if (notify) toast(ui.mode === 'ai' ? 'AI key එක සකසා ඇත. පණිවිඩයක් යවා සේවාව පරීක්ෂා කරන්න.' : 'Demo mode ක්‍රියාත්මකයි. AI සඳහා server එකේ key සකසන්න.');
    } catch (_) { ui.mode = 'demo'; ui.serverAvailable = false; if (notify) toast('Backend හමු නොවුණා. ආදර්ශ Demo mode ක්‍රියාත්මකයි.'); }
    refreshSharedUI();
    if (state.onboarded && ['chat', 'settings'].includes(ui.page) && !ui.chatBusy) renderPage();
  }

  document.addEventListener('click', (event) => {
    const pageButton = event.target.closest('[data-page]');
    if (pageButton) { navigate(pageButton.dataset.page); return; }
    const button = event.target.closest('[data-action]');
    if (!button) return;
    const action = button.dataset.action;
    if (action === 'enter-app') enterApp(false);
    if (action === 'start-learning') enterApp(true);
    if (action === 'open-menu') $('#app-shell').classList.add('menu-open');
    if (action === 'close-menu') $('#app-shell').classList.remove('menu-open');
    if (action === 'toggle-theme') { state.settings.theme = state.settings.theme === 'dark' ? 'light' : 'dark'; saveState(); renderPage(); }
    if (action === 'toggle-romaji') { state.settings.romaji = !state.settings.romaji; saveState(); renderPage(); }
    if (action === 'open-level') openModal('level');
    if (action === 'mode-info') openModal('mode');
    if (action === 'edit-name') openModal('name');
    if (action === 'confirm-reset') openModal('reset');
    if (action === 'close-modal') closeModal();
    if (action === 'modal-backdrop' && event.target === button) closeModal();
    if (action === 'select-level') { closeModal(); toast('Beginner · N5 මට්ටම තෝරා ඇත.'); }
    if (action === 'save-name') { state.settings.name = ($('#modal-name')?.value || '').trim().slice(0, 30); saveState(); closeModal(); renderPage(); toast('නම සුරැකුණා.'); }
    if (action === 'check-mode') { closeModal(); ui.forceDemo = false; checkBackend(true); }
    if (action === 'reset-all') {
      stopSpeech(); stopRecognition(); ui.chatRequestId += 1;
      state = defaultState(); ui.page = 'dashboard'; ui.chatBusy = false; ui.chatError = false; ui.deckOrder = WORDS.map((word) => word.id);
      try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
      closeModal(); applyTheme(); $('#app-shell').hidden = true; $('#welcome-screen').hidden = false;
      window.scrollTo(0, 0); toast('ප්‍රගතිය සහ සැකසුම් මැකුණා. අලුතින් පටන් ගමු!');
    }
    if (action === 'speak') speak(button.dataset.text || '');
    if (action === 'send-chat') sendChat();
    if (action === 'retry-chat') retryChat();
    if (action === 'switch-demo') { ui.mode = 'demo'; ui.forceDemo = true; refreshSharedUI(); if (ui.page === 'chat') renderPage(); retryChat(); toast('Demo mode වෙත මාරු වුණා. මෙය පෙර සකස් කළ ආදර්ශ පිළිතුරකි.'); }
    if (action === 'reset-chat') { ui.chatRequestId += 1; ui.chatBusy = false; ui.chatError = false; ui.chatDraft = ''; ui.demoSteps = {}; state.chatHistory = [{ ...INITIAL_MESSAGE }]; saveState(); renderPage(); toast('සංවාදය නැවත ආරම්භ කළා.'); }
    if (action === 'prefill') { ui.chatDraft = button.dataset.text || ''; const input = $('#chat-input'); if (input) { input.value = ui.chatDraft; input.focus(); } }
    if (action === 'topic') { ui.topic = button.dataset.id; ui.demoSteps[ui.topic] = 0; renderPage(); toast(`${currentTopic().si} මාතෘකාව තෝරා ඇත.`); }
    if (action === 'microphone') toggleMicrophone();
    if (action === 'category') { ui.category = button.dataset.id; ui.cardIndex = 0; ui.cardFlipped = false; renderPage(); }
    if (action === 'shuffle') { for (let i = ui.deckOrder.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [ui.deckOrder[i], ui.deckOrder[j]] = [ui.deckOrder[j], ui.deckOrder[i]]; } ui.cardIndex = 0; ui.cardFlipped = false; renderPage(); toast('කාඩ්පත් කලවම් කළා!'); }
    if (action === 'flip-card') { ui.cardFlipped = !ui.cardFlipped; button.classList.toggle('is-flipped', ui.cardFlipped); button.setAttribute('aria-pressed', String(ui.cardFlipped)); }
    if (action === 'previous-word') updateWord(-1);
    if (action === 'next-word') updateWord(1);
    if (action === 'toggle-learned') {
      const id = button.dataset.id;
      if (state.progress.learnedWords.includes(id)) { state.progress.learnedWords = state.progress.learnedWords.filter((wordId) => wordId !== id); saveState(); toast('ඉගෙන ගත් ලැයිස්තුවෙන් ඉවත් කළා.'); }
      else { state.progress.learnedWords.push(id); recordActivity('word', id); toast('හරිම හොඳයි! වචනය ඔබේ ප්‍රගතියට එක් වුණා.'); }
      renderPage();
    }
    if (action === 'lesson') { ui.lessonIndex = clamp(Number(button.dataset.index), 0, LESSONS.length - 1); renderPage(); }
    if (action === 'next-lesson') { ui.lessonIndex = (ui.lessonIndex + 1) % LESSONS.length; renderPage(); }
    if (action === 'quiz-answer') {
      const lesson = LESSONS[ui.lessonIndex];
      const index = Number(button.dataset.index);
      const current = ui.quizStates[lesson.id] || {};
      if (!current.solved) { ui.quizStates[lesson.id] = { selected: index, solved: index === lesson.answer }; renderPage(); if (index === lesson.answer) toast('නිවැරදියි! දැන් පාඩම අවසන් කරන්න පුළුවන්.'); }
    }
    if (action === 'complete-lesson') {
      const lesson = LESSONS[ui.lessonIndex];
      if (!state.progress.completedLessons.includes(lesson.id) && ui.quizStates[lesson.id]?.solved) { state.progress.completedLessons.push(lesson.id); recordActivity('lesson'); renderPage(); toast('පාඩම අවසන්! +10 XP 🌸'); }
    }
    if (action === 'play-listening') speak(LISTENING[ui.listenIndex].jp);
    if (action === 'slow-listening') speak(LISTENING[ui.listenIndex].jp, .8);
    if (action === 'reveal-listening') { ui.listenRevealed = true; renderPage(); }
    if (action === 'listen-answer' && speechSupported && ui.listenAnswer === null) {
      const index = Number(button.dataset.index);
      ui.listenAnswer = index;
      const correct = index === LISTENING[ui.listenIndex].answer;
      recordActivity('listening', correct); renderPage(); toast(correct ? 'නිවැරදියි! හොඳින් අසාගෙන තිබෙනවා. ✨' : 'කමක් නැහැ, පහළ පෙළ බලලා නැවත ඉගෙන ගමු.');
    }
    if (action === 'next-listening') { stopSpeech(); ui.listenIndex = (ui.listenIndex + 1) % LISTENING.length; ui.listenAnswer = null; ui.listenRevealed = false; renderPage(); }
    if (action === 'claim') {
      const challenge = CHALLENGES.find((item) => item.id === button.dataset.id);
      ensureDaily();
      if (challenge && challenge.metric(state.progress.daily) >= challenge.goal && !state.progress.daily.claimed.includes(challenge.id)) {
        state.progress.daily.claimed.push(challenge.id); state.progress.xp += challenge.reward; saveState(); renderPage(); toast(`සුබ පැතුම්! +${challenge.reward} XP ලබාගත්තා. 🌸`);
      }
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') { if ($('#modal-root').children.length) closeModal(); else $('#app-shell')?.classList.remove('menu-open'); }
    if (event.key === 'Enter' && event.target?.id === 'welcome-name') { event.preventDefault(); enterApp(true); }
    if (event.key === 'Enter' && event.target?.id === 'modal-name') { event.preventDefault(); $('[data-action="save-name"]')?.click(); }
    if (event.key === 'Enter' && !event.shiftKey && event.target?.id === 'chat-input' && !event.isComposing) { event.preventDefault(); sendChat(); }
  });
  document.addEventListener('input', (event) => {
    if (event.target?.id === 'chat-input') ui.chatDraft = event.target.value;
    if (event.target?.id === 'speed-range') {
      state.settings.ttsSpeed = Number(event.target.value);
      $('#speed-value').textContent = `${state.settings.ttsSpeed.toFixed(1)}×`;
      saveState();
    }
  });

  applyTheme();
  if (state.onboarded) showApp();
  checkBackend();
})();
