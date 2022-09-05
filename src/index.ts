import { Logger } from './logger';
import { State } from './state';

const getLogLevel = () => {
  const debugMode = localStorage.getItem('debug');
  if (debugMode || process.env.NODE_ENV === 'development') {
    return ['debug'];
  }
  return [];
};

const logger = Logger({ logLevel: getLogLevel() });

(() => {
  const synth = window.speechSynthesis;
  const state = State();

  const handleVoiceSelect = (voice) => {
    logger.debug('voice selected', voice);
    state.set({ voice });
  };

  const handleSpeakButtonClick = () => {
    const textEl = document.getElementById('text') as any;
    if (!textEl.value) return;
    const { voice } = state.get();
    if (!voice) return;
    speak(voice, textEl.value);
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
    renderErrorMessage('try this app in chrome');
  };

  document.getElementById('speak-btn').onclick = () => handleSpeakButtonClick();
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
    const options = voices.map((voice, i) => ({ text: voice.name, value: i }));

    const selectEl = document.getElementById('voices');

    setSelectOptions(selectEl, options);

    selectEl.onchange = (e) => {
      onSelect(voices[e.target['value']]);
    };

    if (initial !== undefined) {
      logger.debug('initial voice', voices[initial]);
      onSelect(voices[initial]);
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
