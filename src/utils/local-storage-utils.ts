export const getObjectFromLocalStorage = (name: string) => {
  const jsonString = localStorage.getItem(name);
  return jsonString ? JSON.parse(jsonString) : null;
};
