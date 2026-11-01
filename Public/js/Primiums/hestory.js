async function downloadReport() {
    const token = JSON.parse(localStorage.getItem("token"));
    if (!token) {
      window.location.href = "../views/auth/login.html";
      return;
    }
  
    try {
      const fileUrl = await downloadingReportApi(token)
      const a = document.createElement("a");
      a.href = fileUrl;
      a.download = "my_expense.csv";
      a.click();
      
      closeModal();
    } catch (err) {
      messenger("Failed to download report. Please try again.", false);
    }
  }
  
  async function downloadHistory() {
    const token = JSON.parse(localStorage.getItem("token"));
    if (!token) {
      window.location.href = "../views/auth/login.html";
      return;
    }
    
    try {
      await downloadHistoryApi(token);
    } catch (err){
      console.log(err);
      messenger("Failed to load download history. Please try again.", false);
    }
  }