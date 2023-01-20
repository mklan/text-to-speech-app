import { Logger } from './logger';
import { fetchPosts } from './services/reddit';
import { State } from './state';
import { removeLinks } from './utils/removeLinks';

const getLogLevel = () => {
  const debugMode =
    process.env.NODE_ENV === 'development' || localStorage.getItem('debug');
  if (debugMode) {
    return ['debug'];
  }
  return [];
};

const logger = Logger({ logLevel: getLogLevel() });

(async () => {
  const textEl = document.getElementById('text') as HTMLInputElement;

  textEl.value = 'loading reddit post...';

  const posts = await fetchPosts({
    subreddit: 'BestofRedditorUpdates',
    filter: 'top',
    time: 'day',
    limit: 1,
  });

  if (posts.length) {
    textEl.value = removeLinks(posts[0].data.selftext);
  }

  const synth = window.speechSynthesis;
  const state = State();

  const handleVoiceSelect = (voice) => {
    logger.debug('voice selected', voice);
    state.set({ voice });
  };

  const handleSpeakButtonClick = () => {
    if (!textEl.value) return;
    const { voice } = state.get();
    if (!voice) return;
    speak(voice, textEl.value);
  };

  const handlePauseButtonClick = () => {
    synth.pause();
  };

  const handleResumeButtonClick = () => {
    synth.resume();
  };

  const handleReloadButtonClick = () => {
    logger.debug('voice options', 'render start');
    renderVoiceOptions({
      onSelect: handleVoiceSelect,
      onError: handleError,
      initial: 0,
    });
  };

  const handleError = (err) => {
    renderErrorMessage(err.message);
  };

  document.getElementById('speak-btn').onclick = () => handleSpeakButtonClick();
  document.getElementById('pause-btn').onclick = () => handlePauseButtonClick();
  document.getElementById('resume-btn').onclick = () =>
    handleResumeButtonClick();
  document.getElementById('reload-btn').onclick = () =>
    handleReloadButtonClick();

  window.speechSynthesis.onvoiceschanged = () => {
    logger.debug('voice options', 'render start');
    renderVoiceOptions({
      onSelect: handleVoiceSelect,
      onError: handleError,
      initial: 0,
    });
  };

  function speak(voice: SpeechSynthesisVoice, text: string) {
    logger.debug('speak', { text, voice });
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = voice;
    synth.speak(utterance);
  }

  function renderVoiceOptions({ onSelect, onError, initial }) {
    const voices = synth.getVoices();
    if (!voices.length) {
      return onError({ message: 'no voices available' });
    }

    const englishVoices = voices.filter((voice) => voice.lang.startsWith('en'));
    console.log(englishVoices);
    const options = englishVoices.map((voice) => ({
      text: voice.name,
      value: voice.name,
    }));

    const selectEl = document.getElementById('voices');

    setSelectOptions(selectEl, options);

    selectEl.onchange = (e) => {
      onSelect(englishVoices.find((voice) => voice.name === e.target['value']));
    };

    if (initial !== undefined) {
      logger.debug('initial voice', englishVoices[initial]);
      onSelect(englishVoices[initial]);
    }
  }

  function setSelectOptions(selectEl, options) {
    selectEl.innerHTML = '';
    options.forEach((option) => {
      const optionEl = document.createElement('option');
      optionEl.value = option.value;
      optionEl.text = option.text;
      selectEl.appendChild(optionEl);
    });
  }

  function renderErrorMessage(message: string) {
    alert(message);
  }
})();
