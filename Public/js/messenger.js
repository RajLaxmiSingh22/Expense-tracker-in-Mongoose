
function messenger(message, state = false) {
    const alertMessageDiv = document.getElementById("alert-box");
  
    const color = state ? "#4CAF50" : "#f44336";
  
    alertMessageDiv.innerHTML = `<div style="background:${color}">${message}<button onclick="closeAlert()">×</sub></div>`;
  
    setTimeout(() => {
      alertMessageDiv.innerHTML = "";
    }, 4000);
  }
  
  function closeAlert() {
    const alertBoxDiv = document.getElementById("alert-box");
    alertBoxDiv.style.display = "none";
  }
  