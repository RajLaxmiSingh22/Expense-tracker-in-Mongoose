const CASHFREE_BASE_URL = "https://sandbox.cashfree.com/pg"; // use https://api.cashfree.com/pg in production
const CASHFREE_API_VERSION = "2023-08-01";

class PaymentService {
  getHeaders() {
    return {
      "Content-Type": "application/json",
      "x-api-version": CASHFREE_API_VERSION,
      "x-client-id": process.env.Cashfree_ID,
      "x-client-secret": process.env.Cashfree_Secret_Key,
    };
  }

  async createOrder(amount, currency = "INR", orderId, customer) {
    const body = {
      order_id: orderId,
      order_amount: amount, // amount in rupees
      order_currency: currency,
      customer_details: {
        customer_id: customer.id,
        customer_name: customer.name,
        customer_email: customer.email,
        customer_phone: customer.phone,
      },
    };

    const response = await fetch(`${CASHFREE_BASE_URL}/orders`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });
    const data = await response.json();
    if (!response.ok) {
      console.error("Error creating Cashfree order:", data.message);
      throw new Error(data.message);
    }
    return data;
  }

  async getOrder(orderId) {
    const response = await fetch(`${CASHFREE_BASE_URL}/orders/${orderId}`, {
      headers: this.getHeaders(),
    });
    const data = await response.json();
    if (!response.ok) {
      console.error("Error fetching Cashfree order:", data.message);
      throw new Error(data.message);
    }
    return data;
  }
}

export default new PaymentService();
