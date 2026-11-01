document.addEventListener("DOMContentLoaded", async () => {
  //todo: load events
  document
    .querySelector("#expenseForm")
    .addEventListener("submit", handleFormSubmit);
  document.querySelector("#logout").addEventListener("click", logout);
  document
    .querySelector("#suggest-category")
    .addEventListener("click", handleSuggestCategory);
  document.querySelector("#buyPremium").addEventListener("click", buyPremium);
  document
    .querySelector("#number-of-page")
    .addEventListener("change", numberOfPages);

  // todo: load pages limit
  const storedValue = localStorage.getItem("numberOfPages");
  if (storedValue) {
    document.getElementById("number-of-page").value = storedValue;
  }

  const token = JSON.parse(localStorage.getItem("token"));

  if (!token) {
    window.location.href = "../views/login.html";
    return;
  }

  try {
    const { username, isPremium } = await protected();

    premiumButton(isPremium);
    PremiumHandler(isPremium);

    // Set the welcome message
    const message = isPremium
      ? "<p>Thank you for being a Premium Member!</p>"
      : "";
    document.getElementById(
      "welcome"
    ).innerHTML = `<h4>Welcome, ${username}!</h4> ${message}`;

    loadExpenses(currentPage);
  } catch (err) {
    messenger(err.message, false);
  }
});

// todo: AI - fill the category dropdown from the description
async function handleSuggestCategory() {
  const description = document.getElementById("description").value.trim();
  if (!description) return messenger("Write a description first", false);

  const button = document.getElementById("suggest-category");
  button.disabled = true;
  button.textContent = "Thinking...";

  try {
    const token = JSON.parse(localStorage.getItem("token"));
    document.getElementById("category").value = await suggestCategory(token, description);
  } catch (err) {
    messenger(err.message, false);
  } finally {
    button.disabled = false;
    button.textContent = "✨ Suggest category";
  }
}

async function handleFormSubmit(event) {
  event.preventDefault();

  const { amount, category, description } = event.target;

  const data = {
    amount: amount.value,
    category: category.value,
    description: description.value,
  };

  const token = JSON.parse(localStorage.getItem("token"));

  try {
    await createExpense(token, data);
    await loadExpenses();

    document.querySelector("#expenseForm").reset();
  } catch (err) {
    messenger(err.message, false);
  }
}

// TODO: Pagination
let currentPage = 1;
let totalPages = 1; // Total number of pages, initially set to 1
// Number of items per page
const limit = localStorage.getItem("numberOfPages") || 5;

async function numberOfPages() {
  const selectElement = document.getElementById("number-of-page");
  const selectedValue = selectElement.value;
  localStorage.setItem("numberOfPages", selectedValue);
  console.log("object: " + selectedValue);
  await loadExpenses();
}

async function loadExpenses(page) {
  
  const token = JSON.parse(localStorage.getItem("token"));
  try {
    const { expenses, pagination } = await fetchUserExpenses(
      token,
      page,
      limit
    );
    displayExpenses(expenses);

    currentPage = pagination.currentPage;
    totalPages = pagination.totalPages;

    // Update pagination controls
    updatePaginationControls();
  } catch (error) {
    messenger(error.message, false);
  }
}

function displayExpenses(expenses) {
  const table = document.getElementById("expensesTableBody");
  //todo: Reset the table
  table.innerHTML = ""

  let rows = "";
  if (expenses?.length === 0) {
    rows = "<tr><td colspan='5'>No Expenses</td></tr>";
    table.innerHTML = rows;
    return; // exit the function early if no expenses found to avoid potential error
  }

  expenses.forEach((expense) => {
    rows += `
    <tr>
      <td>${expense.amount}</td>
      <td>${expense.category}</td>
      <td>${expense.description}</td>
      <td>${new Date(expense.createdAt).toLocaleString()}</td>
      <td><button class="btn btn-delete" data-id="${
        expense._id
      }">Delete</button></td>
    </tr>
    `;
  });

  table.innerHTML = rows;

  // Add event listeners to all delete buttons
  const deleteButtons = document.querySelectorAll(".btn-delete");
  deleteButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      const id = event.target.getAttribute("data-id");
      deleteExpense(id);
    });
  });
}

function updatePaginationControls() {
  const pageNumbersContainer = document.getElementById("page-numbers");
  pageNumbersContainer.innerHTML = "";

  const range = 2; // Number of page links to show before and after the current page
  const startPage = Math.max(1, currentPage - range);
  const endPage = Math.min(totalPages, currentPage + range);

  if (currentPage > 1) {
    pageNumbersContainer.innerHTML += `<button class="pagination-button" data-page="${
      currentPage - 1
    }">Previous</button>`;
  }

  if (startPage > 1) {
    pageNumbersContainer.innerHTML += `<button class="pagination-button" data-page="1">1</button>`;
    if (startPage > 2) {
      pageNumbersContainer.innerHTML += `<span>...</span>`;
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbersContainer.innerHTML += `<button class="pagination-button" data-page="${i}" ${
      i === currentPage ? 'class="active"' : ""
    }>${i}</button>`;
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      pageNumbersContainer.innerHTML += `<span>...</span>`;
    }
    pageNumbersContainer.innerHTML += `<button class="pagination-button" data-page="${totalPages}">${totalPages}</button>`;
  }

  if (currentPage < totalPages) {
    pageNumbersContainer.innerHTML += `<button class="pagination-button" data-page="${
      currentPage + 1
    }">Next</button>`;
  }

  // Add event listeners to pagination buttons
  const paginationButtons = document.querySelectorAll(".pagination-button");
  paginationButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      const page = parseInt(event.target.getAttribute("data-page"), 10);
      loadExpenses(page);
    });
  });
}

async function deleteExpense(id) {
  const token = JSON.parse(localStorage.getItem("token"));
  try {
    await deletingExpense(token, id);
    loadExpenses(); // TODO: Reload expenses
  } catch (err) {
    messenger(err.message, false);
  }
}

async function premiumButton(isPremium) {
  if (isPremium) {
    document.getElementById("premiumButton").style.display = "none";
    document.body.style.backgroundImage =
      "linear-gradient(111.4deg, rgba(238,113,113,1) 1%, rgba(246,215,148,1) 58%)";

    // Enable premium features
    PremiumHandler(isPremium);
  } else {
    document.getElementById("premiumButton").style.display = "block";
  }
}