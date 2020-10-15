export const Logger = ({ logLevel }) => {
  return {
    debug: (context, ...msg) => {
      if (logLevel.includes("debug")) console.log(`[${context}]`, ...msg);
    },
  };
};
