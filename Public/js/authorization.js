document.addEventListener("DOMContentLoaded", () => {
  const element = document.querySelector('#auth-form')
  if (element)
    element.addEventListener('submit', handleAuthorization);
})

async function handleAuthorization(event) {
  event.preventDefault();
  const username = document.getElementById("username")?.value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    let token
    if (username) {
      token = await singIn({ username, email, password });
    } else {
      token = await login({ email, password });
    }
    success(token);
  } catch (err) {
    const message = err.message;
    messenger(message, false);
  }
}

function success(token) {
  localStorage.setItem("token", JSON.stringify(token));
  window.location.href = "../views/home.html";
}

function logout() {
  localStorage.clear();
  window.location.href = "../views/login.html";
}
