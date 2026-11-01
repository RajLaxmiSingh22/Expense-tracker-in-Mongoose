function PremiumHandler(isPremium) {
  if (!isPremium) return;

  const modalBoard = document.querySelector("#modal-board");
  modalBoard.innerHTML = `
    <button class="btn btn-first" id="show-leaderboard-btn">Show Leader board</button>
    <button class="btn btn-second" id="download-report-btn">Download Report</button>
  `;

  // Add event listeners after updating the inner HTML
  document.getElementById("show-leaderboard-btn").addEventListener('click', showLeaderBoard);
  document.getElementById("download-report-btn").addEventListener('click', downloadReportBoard);
}

const modalHtml = (title, heads, rows, btn = "") => {
  // Generate HTML for table headers
  const headsHtml = heads.map((head) => `<th>${head}</th>`).join("");

  // Generate HTML for table rows
  const rowsHtml = rows
    .map(
      (row) => `
    <tr>
      ${Object.values(row)
        .map((cell) => `<td>${cell || "No data"}</td>`)
        .join("")}
    </tr>
  `
    )
    .join("");

  return `
  <div class="modal">
    <dialog id="modal">
      <button class="close-btn" id="close-modal-btn">×</button>
      ${btn}
      <h4>${title}</h4>
      <div class="modal-table">
        <table>
          <thead>
            <tr>
              ${headsHtml}
            </tr>
          </thead>
          <tbody id="leader-board-table">
            ${rowsHtml}
          </tbody>
        </table>
      </div>
    </dialog>
  </div>
  `;
};

async function fetchModalTable() {
  // Fetch and display leaderboard data
  const token = JSON.parse(localStorage.getItem("token"));
  try {
    const res = await fetchLeaderBoard(token);

    const leaderBoard = res.map((user) => ({
      username: user.username,
      totalExpense: user.totalExpense,
    }));

    // Update the leader board section in the DOM
    const heads = ["User", "Total Expense"];
    const leaderBoardModal = modalHtml("Leader Board", heads, leaderBoard);

    document.querySelector("#modal-table").innerHTML = leaderBoardModal;

    // Add event listener for the close button
    document.getElementById("close-modal-btn").addEventListener('click', closeModal);
  } catch (err) {
    messenger(err.message, false);
  }
}

async function showLeaderBoard() {
  await fetchModalTable();
  const dialog = document.querySelector("#modal");
  dialog.showModal();
}

function closeModal() {
  const dialog = document.querySelector("#modal");
  dialog.close();
}

async function downloadReportBoard() {
  const token = JSON.parse(localStorage.getItem("token"));
  try {
    const files = await fetchDownloadHistory(token); // API
    files.forEach((file) => {
      file.url = `<a class="btn btn-download" href="${file.url}" download>Download</a>`;
    });
    const heads = ["Filename", "Date", "Download"];
    const btn = `<button class="btn btn-download" id="new-report-btn">New Report</button>`;

    let modal = modalHtml("Download history", heads, files, btn);

    document.querySelector("#modal-table").innerHTML = modal;
    
    const dialog = document.querySelector("#modal");
    dialog.showModal();

    // Add event listeners
    document.getElementById("close-modal-btn").addEventListener('click', closeModal);
    document.getElementById("new-report-btn").addEventListener('click', downloadReport);
  } catch (err) {
    messenger(err.message, false);
  }
}
