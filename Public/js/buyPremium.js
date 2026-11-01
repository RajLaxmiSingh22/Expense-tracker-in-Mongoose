async function buyPremium() {
  const premiumPurchase = new PremiumPurchase();
  await premiumPurchase.buyPremium();
}
class PremiumPurchase {
  constructor() {
    this.token = JSON.parse(localStorage.getItem("token"));
    this.cashfree = Cashfree({ mode: "sandbox" }); // use "production" with live keys
  }

  async buyPremium() {
    try {
      const { order_id, payment_session_id } = await this.initiatePayment();
      await this.openCashfreeCheckout(order_id, payment_session_id);
    } catch (err) {
      this.showMessage("Something want wrong! Please try again later.", false);
    }
  }

  async initiatePayment() {
    return await Buy(this.token); //* API call
  }

  async openCashfreeCheckout(orderId, paymentSessionId) {
    const result = await this.cashfree.checkout({
      paymentSessionId,
      redirectTarget: "_modal",
    });

    if (result.error) {
      await this.paymentFailureHandler(orderId);
    } else {
      await this.verifyPayment(orderId);
    }
  }

  async verifyPayment(orderId) {
    const { status } = await this.handleOrder({ order_id: orderId });
    if (status === "successful") {
      this.showMessage("Payment Successful", true);
      this.setPremiumUser(true);
    } else {
      this.showMessage("Transaction failed", false);
    }
  }

  async paymentFailureHandler(orderId) {
    await this.handleOrder({ order_id: orderId });
    this.showMessage("Transaction failed", false);
  }

  async handleOrder(data) {
    return await orderHandler(data, this.token); //* API call
  }

  setPremiumUser(isPremium) {
    premiumButton(isPremium);
  }

  showMessage(message, success) {
    messenger(message, success);
  }
}
