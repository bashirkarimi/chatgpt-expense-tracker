const hasWindow = typeof window !== "undefined";

const getOpenAIObject = () => {
  if (!hasWindow) return null;
  return window.openai ?? null;
};

export const isOpenAIEnvironment = () => Boolean(getOpenAIObject());

export const readExpensesFromOpenAI = () => {
  const openai = getOpenAIObject();
  if (!openai?.toolOutput?.expenses) return null;
  return Array.isArray(openai.toolOutput.expenses)
    ? [...openai.toolOutput.expenses]
    : null;
};

export const subscribeToOpenAIGlobals = (callback) => {
  if (!isOpenAIEnvironment()) return () => {};
  const handler = (event) => {
    const nextExpenses = event.detail?.globals?.toolOutput?.expenses;
    if (!Array.isArray(nextExpenses)) return;
    callback(nextExpenses);
  };

  window.addEventListener("openai:set_globals", handler, { passive: true });
  return () => window.removeEventListener("openai:set_globals", handler);
};

export const callExpenseTool = async (name, payload) => {
  const openai = getOpenAIObject();
  if (!openai?.callTool) return null;
  const response = await openai.callTool(name, payload);
  const expenses = response?.structuredContent?.expenses;
  return Array.isArray(expenses) ? expenses : null;
};
