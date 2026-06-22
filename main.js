const defaultVocab = [
  { english: 'apple', vietnamese: 'táo', category: 'Danh từ', topic: 'Trái cây' },
  { english: 'book', vietnamese: 'sách', category: 'Danh từ', topic: 'Giáo dục' },
  { english: 'cat', vietnamese: 'mèo', category: 'Danh từ', topic: 'Động vật' },
  { english: 'house', vietnamese: 'ngôi nhà', category: 'Danh từ', topic: 'Nhà cửa' },
  { english: 'water', vietnamese: 'nước', category: 'Danh từ', topic: 'Thiên nhiên' },
  { english: 'teacher', vietnamese: 'giáo viên', category: 'Danh từ', topic: 'Giáo dục' },
  { english: 'dog', vietnamese: 'chó', category: 'Danh từ', topic: 'Động vật' },
  { english: 'run', vietnamese: 'chạy', category: 'Động từ', topic: 'Hoạt động' },
  { english: 'orange', vietnamese: 'cam', category: 'Danh từ', topic: 'Trái cây' },
  { english: 'pencil', vietnamese: 'bút chì', category: 'Danh từ', topic: 'Học tập' },
  { english: 'happy', vietnamese: 'vui vẻ', category: 'Tính từ', topic: 'Tính cách' },
  { english: 'quickly', vietnamese: 'nhanh chóng', category: 'Trạng từ', topic: 'Chuyển động' },
];

const categorySelect = document.getElementById('categorySelect');
const topicSelect = document.getElementById('topicSelect');
const tagSelect = document.getElementById('tagSelect');
const reviewModeSelect = document.getElementById('reviewModeSelect');
const quizTypeSelect = document.getElementById('quizTypeSelect');
const directionSelect = document.getElementById('directionSelect');
const quizCountSelect = document.getElementById('quizCountSelect');
const darkModeToggle = document.getElementById('darkModeToggle');
const learnModeBtn = document.getElementById('learnModeBtn');
const quizModeBtn = document.getElementById('quizModeBtn');
const learnPanel = document.getElementById('learnPanel');
const quizPanel = document.getElementById('quizPanel');
const flashFront = document.getElementById('flashFront');
const flashBack = document.getElementById('flashBack');
const flashCategory = document.getElementById('flashCategory');
const flashSpeakBtn = document.getElementById('flashSpeakBtn');
const flipBtn = document.getElementById('flipBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const questionNumber = document.getElementById('questionNumber');
const scoreDisplay = document.getElementById('scoreDisplay');
const questionText = document.getElementById('questionText');
const answersContainer = document.getElementById('answersContainer');
const typingContainer = document.getElementById('typingContainer');
const matchContainer = document.getElementById('matchContainer');
const matchEnglishColumn = document.getElementById('matchEnglishColumn');
const matchVietnameseColumn = document.getElementById('matchVietnameseColumn');
const matchMessage = document.getElementById('matchMessage');
const listenContainer = document.getElementById('listenContainer');
const listenButton = document.getElementById('listenButton');
const listenInput = document.getElementById('listenInput');
const submitListen = document.getElementById('submitListen');
const typingInput = document.getElementById('typingInput');
const submitTyping = document.getElementById('submitTyping');
const nextQuizBtn = document.getElementById('nextQuizBtn');
const restartBtn = document.getElementById('restartBtn');
const addWordBtn = document.getElementById('addWordBtn');
const newWordEng = document.getElementById('newWordEng');
const newWordVn = document.getElementById('newWordVn');
const newWordCategory = document.getElementById('newWordCategory');
const newWordTopic = document.getElementById('newWordTopic');
const newWordTags = document.getElementById('newWordTags');
const searchInput = document.getElementById('searchInput');
const vocabList = document.getElementById('vocabList');
const editModal = document.getElementById('editModal');
const closeEditModal = document.getElementById('closeEditModal');
const editWordEng = document.getElementById('editWordEng');
const editWordVn = document.getElementById('editWordVn');
const editWordCategory = document.getElementById('editWordCategory');
const editWordTopic = document.getElementById('editWordTopic');
const editWordTags = document.getElementById('editWordTags');
const editWordStats = document.getElementById('editWordStats');
const saveEditWord = document.getElementById('saveEditWord');
const cancelEditWord = document.getElementById('cancelEditWord');
const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const importFileInput = document.getElementById('importFileInput');
const statsSummary = document.getElementById('statsSummary');
const deviceModal = document.getElementById('deviceModal');
const deviceMobileBtn = document.getElementById('deviceMobileBtn');
const deviceDesktopBtn = document.getElementById('deviceDesktopBtn');
const deviceToggleBtn = document.getElementById('deviceToggleBtn');
const closeDeviceModal = document.getElementById('closeDeviceModal');

const statsKey = 'openquizStats';
let vocab = [];
let filteredVocab = [];
let wordStats = {};
let currentFlashcard = null;
let currentIndex = 0;
let isFlipped = false;
let score = 0;
let currentQuestion = null;
let questions = [];
let currentMatchSelection = { english: null, vietnamese: null };
let currentMatchItems = [];
let editingWordIndex = null;
let editingWordId = null;
let isDarkMode = localStorage.getItem('darkMode') === 'true';
const dataKey = 'openquizVocab';
const latestExportVersion = 1;

function makeWordId(item) {
  return `${item.english}|${item.vietnamese}|${item.category}|${item.topic || ''}`;
}

function normalizeTags(tagsText) {
  if (!tagsText) return [];
  return tagsText
    .split(/[;,\n]+/)
    .map(tag => tag.trim())
    .filter(Boolean)
    .map(tag => tag.charAt(0).toUpperCase() + tag.slice(1).toLowerCase());
}

function getTagsDisplay(item) {
  return Array.isArray(item.tags) ? item.tags.join(', ') : '';
}

function ensureReviewFields(item) {
  return {
    correct: 0,
    wrong: 0,
    starred: false,
    due: null,
    intervalDays: 1,
    lastReviewed: null,
    ...item,
  };
}

function normalizeText(value) {
  return (value || '')
    .trim()
    .toLowerCase()
    .replace(/[.,!?;:/\\]+/g, '')
    .replace(/\s+/g, ' ');
}

function getEnglishVariants(item) {
  const raw = item.english || '';
  return raw
    .split(/[,;|\/]+/)
    .map(variant => normalizeText(variant))
    .filter(Boolean);
}

function loadStats() {
  const saved = localStorage.getItem(statsKey);
  if (!saved) {
    wordStats = {};
    return;
  }
  try {
    const parsed = JSON.parse(saved) || {};
    wordStats = Object.fromEntries(Object.entries(parsed).map(([key, value]) => [key, ensureReviewFields(value)]));
  } catch {
    wordStats = {};
  }
}

function saveStats() {
  localStorage.setItem(statsKey, JSON.stringify(wordStats));
}

function normalizeCategory(category) {
  if (!category) return 'Tự tạo';
  return category
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function normalizeTopic(topic) {
  if (!topic) return 'Tổng hợp';
  return topic
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function toggleDarkMode() {
  isDarkMode = !isDarkMode;
  localStorage.setItem('darkMode', isDarkMode);
  document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  darkModeToggle.textContent = isDarkMode ? '☀️' : '🌙';
}

function applyDevice(device) {
  if (!device) return;
  document.documentElement.setAttribute('data-device', device);
  localStorage.setItem('deviceType', device);
  // small layout adjustments might require rerender
  populateCategoryOptions();
  renderVocabList();
  renderStats();
}

function showDeviceModal() {
  if (!deviceModal) return;
  deviceModal.classList.remove('hidden');
}

function closeDeviceModalWindow() {
  if (!deviceModal) return;
  deviceModal.classList.add('hidden');
}

function initDevicePreference() {
  const pref = localStorage.getItem('deviceType');
  if (pref) {
    applyDevice(pref);
  } else {
    // show modal to ask
    showDeviceModal();
  }
}

function initDarkMode() {
  document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  darkModeToggle.textContent = isDarkMode ? '☀️' : '🌙';
}

function loadVocab() {
  loadStats();
  const saved = localStorage.getItem(dataKey);
  if (saved) {
    try {
      const items = JSON.parse(saved);
      vocab = Array.isArray(items) ? [...defaultVocab, ...items] : defaultVocab;
    } catch {
      vocab = [...defaultVocab];
    }
  } else {
    vocab = [...defaultVocab];
  }
  vocab = vocab.map(item => ({
    ...item,
    category: normalizeCategory(item.category),
    topic: normalizeTopic(item.topic),
    tags: normalizeTags(Array.isArray(item.tags) ? item.tags.join(', ') : item.tags || ''),
  }));
}

function saveVocab() {
  const customWords = vocab.filter(word => !defaultVocab.some(item => item.english === word.english && item.vietnamese === word.vietnamese));
  localStorage.setItem(dataKey, JSON.stringify(customWords));
}

function exportData() {
  const payload = {
    version: latestExportVersion,
    defaultVocab,
    customVocab: vocab.filter(word => !defaultVocab.some(item => item.english === word.english && item.vietnamese === word.vietnamese)),
    stats: wordStats,
    exportedAt: new Date().toISOString(),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `vocab-export-${new Date().toISOString().slice(0,10)}.json`;
  link.click();
}

function importData(file) {
  const reader = new FileReader();
  reader.onload = event => {
    try {
      const payload = JSON.parse(event.target.result);
      if (!payload || !payload.customVocab || !payload.stats) {
        throw new Error('File không đúng định dạng');
      }
      const importedWords = Array.isArray(payload.customVocab) ? payload.customVocab : [];
      importedWords.forEach(item => {
        const existed = vocab.some(word =>
          word.english === item.english &&
          word.vietnamese === item.vietnamese &&
          word.category === normalizeCategory(item.category) &&
          word.topic === normalizeTopic(item.topic)
        );
        if (!existed) {
          vocab.push({
            english: item.english,
            vietnamese: item.vietnamese,
            category: normalizeCategory(item.category),
            topic: normalizeTopic(item.topic),
            tags: normalizeTags(item.tags),
          });
        }
      });
      wordStats = { ...wordStats, ...payload.stats };
      saveVocab();
      saveStats();
      populateCategoryOptions();
      renderVocabList();
      resetLearning();
      renderStats();
      alert('Nhập dữ liệu thành công');
    } catch (error) {
      alert('Không thể nhập dữ liệu: ' + error.message);
    }
  };
  reader.readAsText(file);
}

function getCategories() {
  const categories = new Set(vocab.map(item => item.category));
  return ['Tất cả', ...categories];
}

function getTopics() {
  const topics = new Set(vocab.map(item => item.topic || 'Tổng hợp'));
  return ['Tất cả', ...topics];
}

function getTags() {
  const tags = new Set(vocab.flatMap(item => item.tags || []));
  return ['Tất cả', ...tags];
}

function getReviewStatus(item) {
  const stats = wordStats[makeWordId(item)] || { correct: 0, wrong: 0, starred: false };
  if (stats.due && new Date(stats.due) <= new Date()) {
    return 'due';
  }
  if (stats.correct === 0 && stats.wrong === 0) {
    return 'new';
  }
  if (stats.wrong > 0) {
    return 'incorrect';
  }
  if (stats.starred) {
    return 'starred';
  }
  return 'reviewed';
}

function calculateNextDue(item, correct) {
  const id = makeWordId(item);
  const stats = wordStats[id] || ensureReviewFields({});
  const newStats = { ...stats };
  if (correct) {
    newStats.correct += 1;
    newStats.intervalDays = Math.min(30, Math.max(1, Math.round(newStats.intervalDays * 1.4)));
  } else {
    newStats.wrong += 1;
    newStats.intervalDays = 1;
  }
  const nextDue = new Date();
  nextDue.setDate(nextDue.getDate() + newStats.intervalDays);
  newStats.due = nextDue.toISOString();
  newStats.lastReviewed = new Date().toISOString();
  wordStats[id] = newStats;
  saveStats();
}

function getWordWeight(item) {
  const stats = wordStats[makeWordId(item)] || { correct: 0, wrong: 0, starred: false };
  const score = stats.correct - stats.wrong;
  let weight;
  if (score < 0) {
    weight = Math.min(5, 1 + Math.abs(score) * 1.5);
  } else {
    weight = Math.max(0.2, 1 / (1 + score * 0.6));
  }
  if (stats.starred) {
    weight *= 2.5;
  }
  return weight;
}

function weightedRandomItem(items) {
  const weights = items.map(item => getWordWeight(item));
  const total = weights.reduce((sum, w) => sum + w, 0);
  let random = Math.random() * total;
  for (let i = 0; i < items.length; i += 1) {
    random -= weights[i];
    if (random <= 0) {
      return items[i];
    }
  }
  return items[items.length - 1];
}

function updateWordStats(item, isCorrect) {
  const id = makeWordId(item);
  const current = ensureReviewFields(wordStats[id] || {});
  if (isCorrect) {
    current.correct += 1;
    current.intervalDays = Math.min(30, Math.max(1, Math.round(current.intervalDays * 1.4)));
  } else {
    current.wrong += 1;
    current.intervalDays = 1;
  }
  const nextDue = new Date();
  nextDue.setDate(nextDue.getDate() + current.intervalDays);
  current.due = nextDue.toISOString();
  current.lastReviewed = new Date().toISOString();
  wordStats[id] = current;
  saveStats();
  renderStats();
}

function toggleWordStar(item) {
  const id = makeWordId(item);
  if (!wordStats[id]) {
    wordStats[id] = { correct: 0, wrong: 0, starred: false };
  }
  wordStats[id].starred = !wordStats[id].starred;
  saveStats();
  renderVocabList();
}

function populateCategoryOptions() {
  const categories = getCategories();
  const topics = getTopics();
  const tags = getTags();
  categorySelect.innerHTML = categories
    .map(category => `<option value="${category}">${category}</option>`)
    .join('');
  topicSelect.innerHTML = topics
    .map(topic => `<option value="${topic}">${topic}</option>`)
    .join('');
  const tagSelect = document.getElementById('tagSelect');
  if (tagSelect) {
    tagSelect.innerHTML = tags
      .map(tag => `<option value="${tag}">${tag}</option>`)
      .join('');
  }
}

function filterVocab() {
  const category = categorySelect.value;
  const topic = topicSelect.value;
  const tag = document.getElementById('tagSelect')?.value;
  const reviewMode = reviewModeSelect.value;
  let filtered = vocab;
  
  if (category !== 'Tất cả') {
    filtered = filtered.filter(item => item.category === category);
  }
  
  const topicValue = topic === 'Tất cả' ? null : topic;
  if (topicValue) {
    filtered = filtered.filter(item => (item.topic || 'Tổng hợp') === topicValue);
  }

  if (tag && tag !== 'Tất cả') {
    filtered = filtered.filter(item => (item.tags || []).includes(tag));
  }
  
  // Áp dụng review mode
  if (reviewMode !== 'all') {
    filtered = filtered.filter(item => {
      const stats = wordStats[makeWordId(item)] || { correct: 0, wrong: 0, starred: false, due: null };
      if (reviewMode === 'incorrect') {
        return stats.wrong > 0;
      } else if (reviewMode === 'starred') {
        return stats.starred;
      } else if (reviewMode === 'new') {
        return stats.correct === 0 && stats.wrong === 0;
      } else if (reviewMode === 'due') {
        return stats.due && new Date(stats.due) <= new Date();
      }
      return true;
    });
  }
  
  filteredVocab = filtered;
}

function getFilteredVocabItems() {
  const query = searchInput?.value.trim().toLowerCase();
  const category = categorySelect.value;
  const topic = topicSelect.value;
  const tag = tagSelect?.value;
  return vocab.filter(item => {
    if (category !== 'Tất cả' && item.category !== category) {
      return false;
    }
    if (topic !== 'Tất cả' && (item.topic || 'Tổng hợp') !== topic) {
      return false;
    }
    if (tag && tag !== 'Tất cả' && !(item.tags || []).includes(tag)) {
      return false;
    }
    if (!query) return true;
    return (
      item.english.toLowerCase().includes(query) ||
      item.vietnamese.toLowerCase().includes(query) ||
      (item.category || '').toLowerCase().includes(query) ||
      (item.topic || '').toLowerCase().includes(query) ||
      getTagsDisplay(item).toLowerCase().includes(query)
    );
  });
}

function getTotalWords() {
  return vocab.length;
}

function getCorrectCount() {
  return Object.values(wordStats).reduce((sum, stats) => sum + (stats.correct || 0), 0);
}

function getWrongCount() {
  return Object.values(wordStats).reduce((sum, stats) => sum + (stats.wrong || 0), 0);
}

function getMostDifficultWords(limit = 5) {
  const entries = Object.entries(wordStats)
    .map(([id, stats]) => ({ id, ...stats }))
    .filter(item => item.wrong > 0)
    .sort((a, b) => (b.wrong - b.correct) - (a.wrong - a.correct));
  return entries.slice(0, limit).map(entry => {
    const [english, vietnamese, category, topic] = entry.id.split('|');
    return {
      english,
      vietnamese,
      category,
      topic,
      correct: entry.correct,
      wrong: entry.wrong,
    };
  });
}

function getStarredCount() {
  return Object.values(wordStats).filter(stats => stats.starred).length;
}

function getDueWordCount() {
  return Object.values(wordStats).filter(stats => stats.due && new Date(stats.due) <= new Date()).length;
}

function getNewWordCount() {
  return vocab.filter(item => {
    const stats = wordStats[makeWordId(item)] || { correct: 0, wrong: 0 };
    return stats.correct === 0 && stats.wrong === 0;
  }).length;
}

function renderStats() {
  if (!statsSummary) return;
  const totalWords = getTotalWords();
  const correctCount = getCorrectCount();
  const wrongCount = getWrongCount();
  const starredCount = getStarredCount();
  const newWordCount = getNewWordCount();
  const difficultWords = getMostDifficultWords(3);

  statsSummary.innerHTML = `
    <div class="stats-row"><strong>Tổng số từ:</strong> ${totalWords}</div>
    <div class="stats-row"><strong>Đã đúng:</strong> ${correctCount}</div>
    <div class="stats-row"><strong>Đã sai:</strong> ${wrongCount}</div>
    <div class="stats-row"><strong>Từ sao:</strong> ${starredCount}</div>
    <div class="stats-row"><strong>Đến hạn:</strong> ${getDueWordCount()}</div>
    <div class="stats-row"><strong>Từ mới:</strong> ${newWordCount}</div>
    <div class="stats-row stats-title">Từ khó nhất:</div>
    ${difficultWords.length > 0 ? difficultWords.map(word => `
      <div class="stats-word">
        ${word.english} - ${word.vietnamese} (${word.category}, ${word.topic})
        <span class="stats-count">Sai: ${word.wrong}, Đúng: ${word.correct}</span>
      </div>
    `).join('') : '<div class="stats-row">Chưa có từ khó.</div>'}
  `;
}

function renderVocabList() {
  if (!vocabList) return;
  const listItems = getFilteredVocabItems();
  vocabList.innerHTML = listItems
    .map((item, index) => {
      const stats = wordStats[makeWordId(item)] || { starred: false };
      const starClass = stats.starred ? 'star-btn starred' : 'star-btn';
      return `
      <div class="vocab-item">
        <div class="vocab-detail">
          <span class="vocab-word">${item.english}</span>
          <span class="vocab-meaning">${item.vietnamese}</span>
        </div>
        <div class="vocab-meta">
          <button class="${starClass}" data-index="${index}" aria-label="Gắn sao từ">★</button>
          <span class="vocab-category">${item.category || 'Tự tạo'}</span>
          <span class="vocab-topic">${item.topic || 'Tổng hợp'}</span>
          <span class="vocab-tags">${getTagsDisplay(item)}</span>
          <button class="edit-btn" data-index="${index}" aria-label="Chỉnh sửa từ">✏️</button>
          <button class="delete-btn" data-index="${index}" aria-label="Xóa từ">×</button>
        </div>
      </div>
    `;
    })
    .join('');

  vocabList.querySelectorAll('.star-btn').forEach(btn => {
    btn.addEventListener('click', event => {
      const index = Number(event.currentTarget.dataset.index);
      const listItems = getFilteredVocabItems();
      const target = listItems[index];
      toggleWordStar(target);
    });
  });

  vocabList.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', event => {
      const index = Number(event.currentTarget.dataset.index);
      const listItems = getFilteredVocabItems();
      const target = listItems[index];
      openEditModal(target);
    });
  });

  vocabList.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', event => {
      const index = Number(event.currentTarget.dataset.index);
      const listItems = getFilteredVocabItems();
      const target = listItems[index];
      const deleteIndex = vocab.findIndex(item => item.english === target.english && item.vietnamese === target.vietnamese && item.category === target.category);
      if (deleteIndex !== -1) {
        vocab.splice(deleteIndex, 1);
      }
      saveVocab();
      populateCategoryOptions();
      renderVocabList();
      resetLearning();
    });
  });
}

function setMode(mode) {
  const isLearn = mode === 'learn';
  learnModeBtn.classList.toggle('active', isLearn);
  quizModeBtn.classList.toggle('active', !isLearn);
  learnPanel.classList.toggle('hidden', !isLearn);
  quizPanel.classList.toggle('hidden', isLearn);
  if (isLearn) {
    resetLearning();
  } else {
    startQuiz();
  }
}

function resetLearning() {
  filterVocab();
  currentFlashcard = filteredVocab.length > 0 ? weightedRandomItem(filteredVocab) : null;
  isFlipped = false;
  renderFlashcard();
}

function renderFlashcard() {
  if (!currentFlashcard) {
    flashCategory.textContent = 'Loại từ: - | Chủ đề: -';
    flashFront.textContent = 'Không có từ nào';
    flashBack.textContent = '';
    return;
  }
  flashCategory.textContent = `Loại từ: ${currentFlashcard.category || 'Tự tạo'} | Chủ đề: ${currentFlashcard.topic || 'Tổng hợp'}`;
  // Chỉ hiển thị một ngôn ngữ tại một thời điểm.
  // Mặc định (chưa lật): hiển thị từ tiếng Anh. Khi lật: hiển thị nghĩa tiếng Việt.
  flashFront.textContent = isFlipped ? currentFlashcard.vietnamese : currentFlashcard.english;
  // Giữ vùng phụ (flashBack) ẩn vì không cần hiển thị song song cả hai ngôn ngữ.
  if (flashBack) {
    flashBack.textContent = '';
    flashBack.classList.add('hidden');
  }
}

function changeCard(step = null) {
  if (step !== null) {
    currentIndex = (currentIndex + step + filteredVocab.length) % filteredVocab.length;
    currentFlashcard = filteredVocab[currentIndex];
  } else {
    currentFlashcard = filteredVocab.length > 0 ? weightedRandomItem(filteredVocab) : null;
    currentIndex = filteredVocab.indexOf(currentFlashcard);
  }
  isFlipped = false;
  renderFlashcard();
}

function startQuiz() {
  filterVocab();
  score = 0;
  questions = generateQuestions();
  currentIndex = 0;
  updateScore();
  showQuestion();
}

function generateQuestions() {
  const source = filteredVocab.length > 0 ? filteredVocab : vocab;
  const mode = quizTypeSelect.value;
  const maxCount = parseInt(quizCountSelect.value) || 10;
  
  if (mode === 'match') {
    const count = Math.min(Math.floor(source.length / 4), Math.floor(maxCount / 4)) || 1;
    const selected = [];
    const pool = [...source];
    for (let i = 0; i < count; i += 1) {
      const questionSet = [];
      const temp = [...pool];
      while (questionSet.length < 4 && temp.length > 0) {
        const idx = Math.floor(Math.random() * temp.length);
        questionSet.push(temp.splice(idx, 1)[0]);
      }
      selected.push(questionSet);
    }
    return selected;
  }
  const count = Math.min(source.length, maxCount);
  const selected = [];
  const pool = [...source];
  while (selected.length < count && pool.length > 0) {
    const idx = Math.floor(Math.random() * pool.length);
    selected.push(pool.splice(idx, 1)[0]);
  }
  return selected;
}

function updateScore() {
  scoreDisplay.textContent = `Điểm: ${score}`;
}

function showQuestion() {
  if (questions.length === 0) {
    questionText.textContent = 'Không có câu hỏi. Vui lòng thêm từ mới.';
    answersContainer.innerHTML = '';
    typingContainer.classList.add('hidden');
    matchContainer.classList.add('hidden');
    listenContainer.classList.add('hidden');
    return;
  }

  currentQuestion = questions[currentIndex];
  questionNumber.textContent = `Câu ${currentIndex + 1}/${questions.length}`;
  const mode = quizTypeSelect.value;
  const direction = directionSelect.value;

  if (mode === 'multiple') {
    typingContainer.classList.add('hidden');
    matchContainer.classList.add('hidden');
    listenContainer.classList.add('hidden');
    answersContainer.classList.remove('hidden');
    answersContainer.innerHTML = '';
    const askField = direction === 'enToVn' ? 'english' : 'vietnamese';
    const answerField = direction === 'enToVn' ? 'vietnamese' : 'english';
    const options = createOptions(currentQuestion, answerField);
    questionText.textContent = direction === 'enToVn'
      ? `Tiếng Anh: ${currentQuestion.english}`
      : `Tiếng Việt: ${currentQuestion.vietnamese}`;
    options.forEach(option => {
      const btn = document.createElement('button');
      btn.className = 'answer-btn';
      btn.textContent = option[answerField];
      btn.addEventListener('click', () => handleAnswer(option[answerField], answerField));
      answersContainer.appendChild(btn);
    });
  } else if (mode === 'typing') {
    answersContainer.innerHTML = '';
    answersContainer.classList.add('hidden');
    matchContainer.classList.add('hidden');
    listenContainer.classList.add('hidden');
    typingContainer.classList.remove('hidden');
    if (direction === 'enToVn') {
      questionText.textContent = `Tiếng Anh: ${currentQuestion.english}`;
    } else {
      questionText.textContent = `Tiếng Việt: ${currentQuestion.vietnamese}`;
    }
    typingInput.value = '';
    typingInput.disabled = false;
    typingInput.focus();
  } else if (mode === 'listen') {
    answersContainer.innerHTML = '';
    answersContainer.classList.add('hidden');
    matchContainer.classList.add('hidden');
    listenContainer.classList.remove('hidden');
    typingContainer.classList.add('hidden');
    questionText.textContent = 'Nghe từ tiếng Anh và viết lại chính xác';
    listenInput.value = '';
    listenInput.disabled = false;
    playListenWord(currentQuestion.english);
  } else if (mode === 'match') {
    answersContainer.innerHTML = '';
    answersContainer.classList.add('hidden');
    matchContainer.classList.remove('hidden');
    listenContainer.classList.add('hidden');
    typingContainer.classList.add('hidden');
    currentMatchItems = questions[currentIndex];
    questionText.textContent = direction === 'enToVn'
      ? 'Nối tiếng Anh với nghĩa tiếng Việt'
      : 'Nối tiếng Việt với từ tiếng Anh';
    buildMatchGame(currentMatchItems, direction);
  }
}

function createOptions(question, field = 'english') {
  const options = [question];
  const others = vocab.filter(item => item.english !== question.english);
  while (options.length < 4 && others.length > 0) {
    const randomIndex = Math.floor(Math.random() * others.length);
    options.push(others.splice(randomIndex, 1)[0]);
  }
  return options.sort(() => Math.random() - 0.5);
}

function isTypingAnswerCorrect(answer, item) {
  const normalized = normalizeText(answer);
  if (directionSelect.value === 'vnToEn') {
    const variants = getEnglishVariants(item);
    return variants.some(variant => normalized === variant);
  }
  return normalized === normalizeText(item.vietnamese);
}

function handleAnswer(answer, answerField = 'english') {
  const buttons = document.querySelectorAll('.answer-btn');
  const correctValue = currentQuestion[answerField];
  buttons.forEach(btn => {
    btn.disabled = true;
    if (btn.textContent === correctValue) {
      btn.classList.add('correct');
    }
    if (btn.textContent === answer && answer !== correctValue) {
      btn.classList.add('wrong');
    }
  });
  const isCorrect = answer === correctValue;
  updateWordStats(currentQuestion, isCorrect);
  if (isCorrect) {
    score += 1;
    updateScore();
  }
}

function playListenWord(text) {
  if (!window.speechSynthesis) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

function buildMatchGame(items, direction = 'enToVn') {
  currentMatchSelection = { left: null, right: null };
  matchMessage.textContent = '';
  matchEnglishColumn.innerHTML = '';
  matchVietnameseColumn.innerHTML = '';
  const leftItems = [...items].sort(() => Math.random() - 0.5);
  const rightItems = [...items].sort(() => Math.random() - 0.5);
  const leftType = direction === 'enToVn' ? 'english' : 'vietnamese';
  const rightType = direction === 'enToVn' ? 'vietnamese' : 'english';

  leftItems.forEach(item => {
    const btn = document.createElement('button');
    btn.className = 'match-btn';
    btn.textContent = item[leftType];
    btn.dataset.matchId = makeWordId(item);
    btn.addEventListener('click', () => selectMatchOption('left', item, btn));
    matchEnglishColumn.appendChild(btn);
  });
  rightItems.forEach(item => {
    const btn = document.createElement('button');
    btn.className = 'match-btn';
    btn.textContent = item[rightType];
    btn.dataset.matchId = makeWordId(item);
    btn.addEventListener('click', () => selectMatchOption('right', item, btn));
    matchVietnameseColumn.appendChild(btn);
  });

  if (matchEnglishColumn.previousElementSibling) {
    matchEnglishColumn.previousElementSibling.textContent = direction === 'enToVn' ? 'Tiếng Anh' : 'Tiếng Việt';
  }
  if (matchVietnameseColumn.previousElementSibling) {
    matchVietnameseColumn.previousElementSibling.textContent = direction === 'enToVn' ? 'Tiếng Việt' : 'Tiếng Anh';
  }
}

function selectMatchOption(side, item, btn) {
  if (btn.disabled) return;
  if (side === 'left') {
    if (currentMatchSelection.left && currentMatchSelection.left.button) {
      currentMatchSelection.left.button.classList.remove('selected');
    }
    currentMatchSelection.left = { item, button: btn };
    btn.classList.add('selected');
  } else {
    if (currentMatchSelection.right && currentMatchSelection.right.button) {
      currentMatchSelection.right.button.classList.remove('selected');
    }
    currentMatchSelection.right = { item, button: btn };
    btn.classList.add('selected');
  }
  if (currentMatchSelection.left && currentMatchSelection.right) {
    checkMatchPair();
  }
}

function checkMatchPair() {
  const leftItem = currentMatchSelection.left.item;
  const rightItem = currentMatchSelection.right.item;
  const leftBtn = currentMatchSelection.left.button;
  const rightBtn = currentMatchSelection.right.button;
  const isMatch = makeWordId(leftItem) === makeWordId(rightItem);

  if (isMatch) {
    leftBtn.classList.add('correct');
    rightBtn.classList.add('correct');
    leftBtn.disabled = true;
    rightBtn.disabled = true;
    matchMessage.textContent = 'Ghép đúng!';
    updateWordStats(leftItem, true);
    score += 1;
    updateScore();
    currentMatchSelection = { left: null, right: null };
    if (document.querySelectorAll('.match-btn:not(:disabled)').length === 0) {
      matchMessage.textContent = 'Hoàn thành! Nhấn Câu tiếp để tiếp tục.';
    }
  } else {
    const activeButtons = Array.from(document.querySelectorAll('.match-btn:not(:disabled)'));
    leftBtn.classList.add('wrong');
    rightBtn.classList.add('wrong');
    matchMessage.textContent = 'Sai rồi, thử lại.';
    updateWordStats(leftItem, false);
    activeButtons.forEach(button => {
      button.disabled = true;
    });
    setTimeout(() => {
      leftBtn.classList.remove('wrong', 'selected');
      rightBtn.classList.remove('wrong', 'selected');
      activeButtons.forEach(button => {
        if (!button.classList.contains('correct')) {
          button.disabled = false;
        }
      });
      currentMatchSelection = { left: null, right: null };
      matchMessage.textContent = '';
    }, 600);
  }
}

function submitTypingAnswer() {
  const value = typingInput.value.trim();
  if (!value) return;
  const direction = directionSelect.value;
  const isCorrect = isTypingAnswerCorrect(value, currentQuestion);
  updateWordStats(currentQuestion, isCorrect);
  let accepted;
  if (direction === 'vnToEn') {
    accepted = getEnglishVariants(currentQuestion).join(', ');
  } else {
    accepted = currentQuestion.vietnamese;
  }
  if (isCorrect) {
    score += 1;
    updateScore();
    questionText.textContent = direction === 'vnToEn'
      ? `Đúng! Từ: ${currentQuestion.english}`
      : `Đúng! Nghĩa: ${currentQuestion.vietnamese}`;
    playListenWord(currentQuestion.english);
  } else {
    questionText.textContent = `Sai! Đáp án đúng: ${accepted}`;
    playListenWord(currentQuestion.english);
  }
  typingInput.disabled = true;
}

function submitListenAnswer() {
  const value = listenInput.value.trim().toLowerCase();
  if (!value) return;
  const isCorrect = value === currentQuestion.english.toLowerCase();
  updateWordStats(currentQuestion, isCorrect);
  if (isCorrect) {
    score += 1;
    updateScore();
    questionText.textContent = `Đúng! Từ: ${currentQuestion.english}`;
  } else {
    questionText.textContent = `Sai! Từ cần nghe: ${currentQuestion.english}`;
  }
  listenInput.disabled = true;
}

function nextQuizQuestion() {
  if (questions.length === 0) return;
  if (quizTypeSelect.value === 'typing') {
    typingInput.disabled = false;
  }
  currentIndex = (currentIndex + 1) % questions.length;
  showQuestion();
}

function addNewWord() {
  const english = newWordEng.value.trim();
  const vietnamese = newWordVn.value.trim();
  if (!english || !vietnamese) {
    alert('Vui lòng nhập đủ cả tiếng Anh và tiếng Việt');
    return;
  }
  vocab.push({ 
    english, 
    vietnamese, 
    category: normalizeCategory(newWordCategory.value.trim()),
    topic: normalizeTopic(newWordTopic.value.trim()),
    tags: normalizeTags(newWordTags.value.trim()),
  });
  saveVocab();
  populateCategoryOptions();
  renderVocabList();
  renderStats();
  newWordEng.value = '';
  newWordVn.value = '';
  newWordCategory.value = '';
  newWordTopic.value = '';
  newWordTags.value = '';
  resetLearning();
}

function openEditModal(item) {
  editingWordIndex = vocab.findIndex(w => makeWordId(w) === makeWordId(item));
  editingWordId = makeWordId(item);
  editWordEng.value = item.english;
  editWordVn.value = item.vietnamese;
  editWordCategory.value = item.category || 'Tự tạo';
  editWordTopic.value = item.topic || 'Tổng hợp';
  editWordTags.value = getTagsDisplay(item);
  
  const stats = wordStats[editingWordId] || { correct: 0, wrong: 0 };
  editWordStats.textContent = `Đúng: ${stats.correct} | Sai: ${stats.wrong}`;
  
  editModal.classList.remove('hidden');
}

function closeEditModalWindow() {
  editModal.classList.add('hidden');
  editingWordIndex = null;
}

function saveEditWordChanges() {
  if (editingWordIndex === null || editingWordIndex === -1) return;
  
  const oldId = editingWordId;
  vocab[editingWordIndex].vietnamese = editWordVn.value.trim();
  vocab[editingWordIndex].category = normalizeCategory(editWordCategory.value.trim());
  vocab[editingWordIndex].topic = normalizeTopic(editWordTopic.value.trim());
  vocab[editingWordIndex].tags = normalizeTags(editWordTags.value.trim());
  const newId = makeWordId(vocab[editingWordIndex]);
  if (oldId && oldId !== newId) {
    wordStats[newId] = wordStats[oldId] || ensureReviewFields({});
    delete wordStats[oldId];
    saveStats();
  }
  
  saveVocab();
  populateCategoryOptions();
  renderVocabList();
  renderStats();
  closeEditModalWindow();
  resetLearning();
}

function addEventListeners() {
  learnModeBtn.addEventListener('click', () => setMode('learn'));
  quizModeBtn.addEventListener('click', () => setMode('quiz'));
  darkModeToggle.addEventListener('click', toggleDarkMode);
  
  categorySelect.addEventListener('change', () => {
    resetLearning();
    if (!quizPanel.classList.contains('hidden')) startQuiz();
  });
  topicSelect.addEventListener('change', () => {
    resetLearning();
    if (!quizPanel.classList.contains('hidden')) startQuiz();
  });
  tagSelect.addEventListener('change', () => {
    resetLearning();
    if (!quizPanel.classList.contains('hidden')) startQuiz();
  });
  reviewModeSelect.addEventListener('change', () => {
    resetLearning();
    if (!quizPanel.classList.contains('hidden')) startQuiz();
  });
  directionSelect.addEventListener('change', () => {
    if (!quizPanel.classList.contains('hidden')) startQuiz();
  });
  quizCountSelect.addEventListener('change', () => {
    if (!quizPanel.classList.contains('hidden')) startQuiz();
  });
  
  searchInput?.addEventListener('input', renderVocabList);
  quizTypeSelect.addEventListener('change', showQuestion);
  flipBtn.addEventListener('click', () => {
    isFlipped = !isFlipped;
    renderFlashcard();
  });
  flashSpeakBtn.addEventListener('click', () => {
    if (currentFlashcard) {
      playListenWord(currentFlashcard.english);
    }
  });
  prevBtn.addEventListener('click', () => changeCard(-1));
  nextBtn.addEventListener('click', () => changeCard(1));
  submitTyping.addEventListener('click', submitTypingAnswer);
  listenButton.addEventListener('click', () => playListenWord(currentQuestion.english));
  submitListen.addEventListener('click', submitListenAnswer);
  nextQuizBtn.addEventListener('click', nextQuizQuestion);
  restartBtn.addEventListener('click', startQuiz);
  addWordBtn.addEventListener('click', addNewWord);
  exportBtn.addEventListener('click', exportData);
  importBtn.addEventListener('click', () => importFileInput.click());
  importFileInput.addEventListener('change', event => {
    const file = event.target.files?.[0];
    if (file) importData(file);
    importFileInput.value = '';
  });

  // Device modal events
  deviceToggleBtn?.addEventListener('click', showDeviceModal);
  deviceMobileBtn?.addEventListener('click', () => { applyDevice('mobile'); closeDeviceModalWindow(); });
  deviceDesktopBtn?.addEventListener('click', () => { applyDevice('desktop'); closeDeviceModalWindow(); });
  closeDeviceModal?.addEventListener('click', closeDeviceModalWindow);
  deviceModal?.addEventListener('click', event => { if (event.target === deviceModal) closeDeviceModalWindow(); });
  
  // Modal events
  closeEditModal.addEventListener('click', closeEditModalWindow);
  cancelEditWord.addEventListener('click', closeEditModalWindow);
  saveEditWord.addEventListener('click', saveEditWordChanges);
  editModal.addEventListener('click', event => {
    if (event.target === editModal) closeEditModalWindow();
  });
  
  typingInput.addEventListener('keydown', event => {
    if (event.key === 'Enter') submitTypingAnswer();
  });
  listenInput.addEventListener('keydown', event => {
    if (event.key === 'Enter') submitListenAnswer();
  });
}

function init() {
  initDarkMode();
  initDevicePreference();
  loadVocab();
  populateCategoryOptions();
  renderVocabList();
  renderStats();
  setMode('learn');
  addEventListeners();
}

init();
