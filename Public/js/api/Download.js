async function downloadingReportApi(token) {
  try {
    const response = await axios.get("/expense/download", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.fileUrl;
  } catch (err) {
    throw new Error(
      err?.response?.data?.message ||
        "Failed to download report. Please try again."
    );
  }
}

async function downloadHistoryApi(token) {
  try {
    await axios.get("/user/download-history", {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (err) {
    throw new Error(
      err?.response?.data?.message ||
        "Failed to load download history. Please try again."
    );
  }
}
