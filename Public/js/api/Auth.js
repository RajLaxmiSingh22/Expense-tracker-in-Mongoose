async function singIn(data) {
  try {
    const response = await axios.post(
      "/user/sing-in",
      data
    );
    return response.data.token;
  } catch (err) {   
    throw new Error(
        err?.response?.data?.message ||
        "Something went wrong! Please try again later."
      );
  }
}

async function login(data) {
  try {
    const response = await axios.post(
      "/user/login",
      data
    );
    return response.data.token;
  } catch (err) {
    throw new Error(
        err?.response?.data?.message ||
        "Something went wrong! Please try again later."
      );
  }
}
