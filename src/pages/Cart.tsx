import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/contexts/CartContext";
import { Minus, Plus, Trash2, ShoppingBag, Loader2, CheckCircle2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { api } from "@/services/api";

export default function Cart() {
  const { items, removeFromCart, updateQuantity, total, clearCart } = useCart();
  const navigate = useNavigate();

  // PAYMENT POPUP STATE
  const [showPayment, setShowPayment] = useState(false);
  const [step, setStep] = useState(1); // 1 method, 2 details, 3 otp, 4 processing, 5 success
  const [method, setMethod] = useState("upi");
  const [upi, setUpi] = useState("");
  const [card, setCard] = useState({ number: "", expiry: "", cvv: "" });
  const [otp, setOtp] = useState("");

  // ORDER CREATION
  const handleCheckout = async () => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
    toast.error("Please login before placing an order");
    navigate("/login");
    return;
  }

  try {
    await api.createOrder({
      userId: user.user_id || user.id,
      total,
      items,
      paymentMethod: method,
    });

    clearCart();
    // NO redirect, we handle it from Pay Now callback
    return true;

  } catch (err) {
    toast.error("Payment failed");
    setShowPayment(false);
  }
};


  // EMPTY CART UI
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center space-y-6">
            <ShoppingBag className="h-24 w-24 mx-auto text-muted-foreground" />
            <h1 className="text-3xl font-bold">Your cart is empty</h1>
            <p className="text-muted-foreground">Add some products to get started</p>
            <Link to="/">
              <Button size="lg">Browse Products</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Shopping Cart</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* LEFT SIDE */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded" />

                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
                      <p className="text-primary font-bold mb-3">₹{item.price.toFixed(2)}</p>

                      <div className="flex items-center gap-3">
                        <Button variant="outline" size="icon" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                          <Minus className="h-4 w-4" />
                        </Button>

                        <span className="font-semibold w-8 text-center">{item.quantity}</span>

                        <Button variant="outline" size="icon" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                          <Plus className="h-4 w-4" />
                        </Button>

                        <Button variant="ghost" size="icon" className="ml-auto text-destructive" onClick={() => removeFromCart(item.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* RIGHT SIDE */}
          <div>
            <Card className="sticky top-20">
              <CardContent className="p-6 space-y-4">
                <h2 className="text-2xl font-bold">Order Summary</h2>

                <div className="space-y-2 py-4 border-y border-border">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                </div>

                <div className="flex justify-between text-xl font-bold">
                  <span>Total</span>
                  <span className="text-primary">₹{total.toFixed(2)}</span>
                </div>

                <Button className="w-full" size="lg" onClick={() => { setShowPayment(true); setStep(1); }}>
                  Proceed to Payment
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

              {/* PAYMENT POPUP */}
        {showPayment && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
            <div className="bg-white w-full max-w-md rounded-xl shadow-2xl p-6 space-y-6 animate-scaleIn">

              {/* STEP 1 — METHOD */}
              {step === 1 && (
                <>
                  <h2 className="text-2xl font-bold mb-2">Choose Payment Method</h2>
                  <p className="text-muted-foreground mb-4">Select how you'd like to pay</p>

                  <div className="space-y-3">
                    <label className="flex items-center gap-3 border p-3 rounded-lg cursor-pointer hover:bg-muted">
                      <input type="radio" checked={method === "upi"} onChange={() => setMethod("upi")} />
                      <span className="font-medium">UPI / QR</span>
                    </label>

                    <label className="flex items-center gap-3 border p-3 rounded-lg cursor-pointer hover:bg-muted">
                      <input type="radio" checked={method === "card"} onChange={() => setMethod("card")} />
                      <span className="font-medium">Credit / Debit Card</span>
                    </label>
                  </div>

                  <div className="text-xl font-bold mt-4">
                    Amount: <span className="text-primary">₹{total.toFixed(2)}</span>
                  </div>

                  <Button className="w-full mt-4" onClick={() => setStep(2)}>Continue</Button>
                  <Button variant="ghost" className="w-full" onClick={() => setShowPayment(false)}>Cancel</Button>
                </>
              )}

              {/* STEP 2 — PAYMENT DETAILS */}
              {step === 2 && (
                <>
                  <h2 className="text-2xl font-bold">Complete Payment</h2>

                  {method === "upi" && (
                    <div className="space-y-4">
                      <p className="text-muted-foreground">Scan the QR code using any UPI app</p>

                      {/* Realistic QR LOOK */}
                      <div className="flex justify-center">
                        <div className="bg-white p-4 rounded-xl shadow-md border">
                          <img
                            src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=fake@upi"
                            className="rounded-md"
                          />
                        </div>
                      </div>

                      <p className="text-center text-muted-foreground text-sm">UPI ID: <b>fake@upi</b></p>
                    </div>
                  )}

                  {method === "card" && (
                    <div className="space-y-3">
                      <input
                        className="border p-2 rounded w-full"
                        placeholder="Card Number"
                        value={card.number}
                        onChange={(e) => setCard({ ...card, number: e.target.value })}
                      />
                      <div className="flex gap-2">
                        <input
                          className="border p-2 rounded w-full"
                          placeholder="MM/YY"
                          value={card.expiry}
                          onChange={(e) => setCard({ ...card, expiry: e.target.value })}
                        />
                        <input
                          className="border p-2 rounded w-full"
                          placeholder="CVV"
                          value={card.cvv}
                          onChange={(e) => setCard({ ...card, cvv: e.target.value })}
                        />
                      </div>
                    </div>
                  )}

                  <Button
                    className="w-full mt-4"
                    onClick={() => {
                      setStep(3);

                        setTimeout(async () => {
                          await handleCheckout();
                          toast.success("Payment Successful!");
                          setStep(4);

                          // redirect after animation plays
                          setTimeout(() => navigate("/"), 2000);
                        }, 1500);
                    }}
                  >
                    Pay Now
                  </Button>

                  <Button variant="ghost" className="w-full" onClick={() => setStep(1)}>Back</Button>
                </>
              )}

              {/* STEP 3 — PROCESSING */}
              {step === 3 && (
                <div className="flex flex-col items-center gap-3 py-10 animate-fadeIn">
                  <Loader2 className="animate-spin h-10 w-10 text-primary" />
                  <p className="text-lg font-medium">Processing your payment...</p>
                  <p className="text-muted-foreground text-sm">Do not refresh this page</p>
                </div>
              )}

              {/* STEP 4 — SUCCESS */}
              {step === 4 && (
                <div className="flex flex-col items-center gap-4 py-10 animate-fadeIn">

                  {/* SUCCESS TICK */}
                  <div className="checkmark-container">
                    <svg className="checkmark" viewBox="0 0 52 52">
                      <circle className="checkmark-circle" cx="26" cy="26" r="25" />
                      <path className="checkmark-check" fill="none" d="M14 27l7 7 16-16" />
                    </svg>
                  </div>

                  <h2 className="text-2xl font-bold text-green-600">Payment Successful!</h2>
                  <p className="text-muted-foreground">Redirecting...</p>
                </div>
              )}

            </div>
          </div>
        )}

    </div>
  );
}
