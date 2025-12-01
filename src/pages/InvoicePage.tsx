import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";

type OrderItem = {
  name: string;
  quantity: number;
  price: number;
};

type Order = {
  id: number;
  total: number;
  status: string;
  date: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
  items: OrderItem[];
};

export default function InvoicePage() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const { data: order, isLoading, error } = useQuery<Order>({
    queryKey: ["invoice-order", orderId],
    queryFn: () => api.getOrderById(Number(orderId)),
    enabled: !!orderId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <p>Loading invoice...</p>
        </main>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <p className="text-red-500">Failed to load invoice.</p>
          <Button className="mt-4" onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </main>
      </div>
    );
  }

  const tax = order.total * 0.18; // 18% GST just for demo
  const grandTotal = order.total + tax;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {/* Action buttons */}
        <div className="flex justify-between mb-4">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Back
          </Button>
          <Button onClick={() => window.print()}>
            Download / Print Invoice
          </Button>
        </div>

        {/* INVOICE CONTENT (what gets printed) */}
        <div className="bg-white shadow-lg rounded-xl p-8 max-w-3xl mx-auto print:w-full print:shadow-none print:rounded-none">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold">ShopHub</h1>
              <p className="text-sm text-muted-foreground">
                Decentralized Electronics Marketplace
              </p>
              <p className="text-sm text-muted-foreground">
                Pune, Maharashtra, India
              </p>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-semibold">INVOICE</h2>
              <p className="text-sm">Invoice #: {order.id}</p>
              <p className="text-sm">
                Date: {order.date?.slice(0, 10) || "N/A"}
              </p>
            </div>
          </div>

          {/* Bill To + Order Info */}
          <div className="flex justify-between mb-6 text-sm">
            <div>
              <h3 className="font-semibold mb-1">Bill To:</h3>
              <p>{order.user?.name}</p>
              <p className="text-muted-foreground">{order.user?.email}</p>
            </div>
            <div className="text-right">
              <h3 className="font-semibold mb-1">Order Details:</h3>
              <p>Status: {order.status}</p>
              <p>Order ID: #{order.id}</p>
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full text-sm border-t border-b mb-6">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="py-2 text-left">Item</th>
                <th className="py-2 text-right">Qty</th>
                <th className="py-2 text-right">Price</th>
                <th className="py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, idx) => (
                <tr key={idx} className="border-b last:border-b-0">
                  <td className="py-2">{item.name}</td>
                  <td className="py-2 text-right">{item.quantity}</td>
                  <td className="py-2 text-right">
                    ₹{item.price.toFixed(2)}
                  </td>
                  <td className="py-2 text-right">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end mb-6">
            <div className="w-full max-w-xs space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{order.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (18%)</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg mt-2 border-t pt-2">
                <span>Grand Total</span>
                <span>₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="text-xs text-muted-foreground text-center border-t pt-4">
            This is a system-generated invoice for academic project purposes.
            <br />
            Thank you for shopping with ShopHub!
          </div>
        </div>
      </main>
    </div>
  );
}
