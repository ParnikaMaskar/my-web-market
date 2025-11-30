import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, User as UserIcon, LogOut } from "lucide-react";
import { toast } from "sonner";

import { getCurrentUser, logoutUser } from "@/utils/auth";
import { api } from "@/services/api"; // ⭐ USING API SERVICE HERE

export default function Profile() {
  const [user, setUser] = useState(getCurrentUser());
  const [orders, setOrders] = useState<any[]>([]);
  const [editing, setEditing] = useState(false);

  // ---------------------------
  // FETCH USER + ORDERS
  // ---------------------------
  useEffect(() => {
    if (!user || user.role === "admin") {
      window.location.href = "/login";
      return;
    }

    api.getUserOrders(user.id).then((data) => setOrders(data || []));
  }, []);

  // ---------------------------
  // SAVE PROFILE
  // ---------------------------
  const handleSaveProfile = () => {
    toast.success("Profile updated (frontend only)");
    setEditing(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">My Account</h1>
          <Button variant="destructive" onClick={logoutUser} className="flex gap-2">
            <LogOut className="h-4 w-4" /> Logout
          </Button>
        </div>

        {/* TABS */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile" className="gap-2">
              <UserIcon className="h-4 w-4" /> Profile
            </TabsTrigger>

            <TabsTrigger value="orders" className="gap-2">
              <Package className="h-4 w-4" /> Orders
            </TabsTrigger>
          </TabsList>

          {/* -------------------------
              PROFILE TAB
          -------------------------- */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Name */}
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={user.name}
                    disabled={!editing}
                    onChange={(e) => setUser({ ...user, name: e.target.value })}
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    value={user.email}
                    disabled={!editing}
                    onChange={(e) => setUser({ ...user, email: e.target.value })}
                  />
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={user.phone}
                    disabled={!editing}
                    onChange={(e) => setUser({ ...user, phone: e.target.value })}
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                  {editing ? (
                    <>
                      <Button onClick={handleSaveProfile}>Save</Button>
                      <Button variant="outline" onClick={() => setEditing(false)}>
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button onClick={() => setEditing(true)}>Edit Profile</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* -------------------------
              ORDERS TAB
          -------------------------- */}
          <TabsContent value="orders">
            <div className="space-y-4">
              {orders.length === 0 ? (
                <p className="text-muted-foreground">You have no orders yet.</p>
              ) : (
                orders.map((order) => (
                  <Card key={order.id}>
                    <CardContent className="p-6">
                      {/* Header */}
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Order #{order.id}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {order.date}
                          </p>
                        </div>

                        {/* STATUS BADGE */}
                        <span
                          className={`px-3 py-1 text-sm rounded-full
                          ${
                            order.status === "Delivered"
                              ? "bg-green-100 text-green-700"
                              : order.status === "Shipped"
                              ? "bg-blue-100 text-blue-700"
                              : order.status === "Cancelled"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>

                      {/* Items */}
                      <div className="space-y-2">
                        {order.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between text-sm py-1 border-b last:border-b-0"
                          >
                            <span>
                              {item.name} × {item.quantity}
                            </span>
                            <span className="font-semibold">
                              ₹{(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Total */}
                      <div className="flex justify-between font-bold text-lg pt-4">
                        <span>Total</span>
                        <span className="text-primary">
                          ₹{order.total.toFixed(2)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
