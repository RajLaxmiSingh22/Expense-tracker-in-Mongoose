async function handleForgotPassword(event) {
  event.preventDefault();
  const email = event.target.email.value;
  try {
    //todo: backend will send email for password reset
    await forgotPassword(email);
    
    // todo: disable submit button
    document.querySelector("#submit").disabled = true;
    messenger("Password reset link has been sent to your email", true);
  } catch (err) {
    const message = err?.message || "Please try again later.";
    messenger(message, false);
  }
}