async function handleResetPassword(event) {
  event.preventDefault();
  const password = event.target.password.value;
  const token = JSON.parse(localStorage.getItem("token"));

  try {
    await resetPassword(token, password);
  } catch (err) {
    messenger(err.message, false)
  }
}
