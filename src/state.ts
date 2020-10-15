export const State = (initalState = {}) => {
  let state = initalState;
  return {
    set: (update) => {
      state = { ...state, ...update };
      return state;
    },
    get: (): any => state,
  };
};
