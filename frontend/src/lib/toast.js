export const toast = ({ type = "success", title, message }) => {
  window.dispatchEvent(new CustomEvent("app:toast", { detail: { type, title, message } }));
};

export const toastSuccess = (title, message) => toast({ type: "success", title, message });
export const toastError = (title, message) => toast({ type: "error", title, message });