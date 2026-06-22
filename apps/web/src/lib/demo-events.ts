export const demoEvents = [
  {
    label: "Signup",
    endpoint: "/events/signup",
    payload: {
      customerName: "Aarav Sharma",
      email: "aarav.sharma@example.com",
      city: "Bengaluru",
    },
  },
  {
    label: "Order placed",
    endpoint: "/events/order",
    payload: {
      orderId: "ORD-2048",
      customerName: "Aarav Sharma",
      restaurantName: "Spice Route Kitchen",
      itemCount: 3,
      totalAmount: 799,
    },
  },
  {
    label: "Payment done",
    endpoint: "/events/payment",
    payload: {
      orderId: "ORD-2048",
      customerName: "Aarav Sharma",
      paymentMethod: "upi",
      amount: 799,
    },
  },
] as const;
