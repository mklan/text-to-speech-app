const synth = window.speechSynthesis;

const State = (initalState = {}) => {
  let state = initalState;
  return {
    set: (update) => {
      state = { ...state, ...update };
      return state;
    },
    get: (): any => state,
  };
};

(() => {
  const state = State();

  const handleVoiceSelect = (voice) => {
    console.log("voice selected", voice);
    state.set({ voice });
  };

  const handleSpeakButtonClick = () => {
    const textEl = document.getElementById("text") as any;
    if (!textEl.value) return;
    const { voice } = state.get();
    if (!voice) return;
    speak(voice, textEl.value);
  };
  const handleInitButtonClick = () => {
    renderVoiceOptions({ onSelect: handleVoiceSelect, initial: 0 });
  };

  document.getElementById("speak-btn").onclick = () => handleSpeakButtonClick();
  document.getElementById("init-btn").onclick = () => handleInitButtonClick();
})();

function speak(voice, text) {
  console.log("speak", { text, voice });
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = voice;
  synth.speak(utterance);
}

function renderVoiceOptions({ onSelect, initial }) {
  const voices = synth.getVoices();
  const options = voices.map((voice, i) => ({ text: voice.name, value: i }));

  const selectEl = document.getElementById("voices");

  setSelectOptions(selectEl, options);

  selectEl.onchange = (e) => {
    onSelect(voices[e.target["value"]]);
  };

  if (initial) {
    onSelect(voices[initial]);
  }
}

function setSelectOptions(selectEl, options) {
  options.forEach((option) => {
    const optionEl = document.createElement("option");
    optionEl.value = option.value;
    optionEl.text = option.text;
    selectEl.appendChild(optionEl);
  });
}
