async function protected() {
  const token = JSON.parse(localStorage.getItem("token"));

  try {
    const response = await axios.post(
      "/user/protected-route",
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (err) {
    throw new Error(
      err?.response?.data?.message ||
        "Something want wrong! Please try again later."
    );
  }
}

async function createExpense(token, data) {
  try {
    await axios.post(`/expense/createExpense`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (err) {
    throw new Error(
      err?.response?.data?.message ||
        "Failed to create expense. Please try again later."
    );
  }
}

async function suggestCategory(token, description) {
  try {
    const response = await axios.post(
      `/expense/suggest-category`,
      { description },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data.category;
  } catch (err) {
    throw new Error(
      err?.response?.data?.message ||
        "Failed to suggest a category. Please try again later."
    );
  }
}

async function fetchUserExpenses(token, page = 1, limit = 10) {
  try {
    const response = await axios.get(
      `/expense/getExpenses`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          page,
          limit,
        },
      }
    );
    return response.data;
  } catch (err) {
    throw new Error(
      err?.response?.data?.message ||
        "Failed to fetch user expenses. Please try again later."
    );
  }
}

async function deletingExpense(token, id) {
  try {
    await axios.delete(`/expense/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`, // Include the token in the headers
      },
    });
  } catch (err) {
    throw new Error(
      err?.response?.data?.message ||
        "Failed to delete expense. Please try again later."
    );
  }
}
