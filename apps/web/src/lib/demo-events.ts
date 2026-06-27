export const demoEvents = [
  {
    label: "Signup",
    endpoint: "/events/signup",
    payload: {
      customerName: "John Doe",
      email: "john.doe@example.com",
      city: "Bengaluru",
    },
  },
  {
    label: "Order placed",
    endpoint: "/events/order",
    payload: {
      orderId: "ORD-2048",
      customerName: "John Doe",
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
      customerName: "John Doe",
      paymentMethod: "upi",
      amount: 799,
    },
  },
] as const;
