import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, X, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/services/api";

// --------------------------------------------------
// TYPES
// --------------------------------------------------
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

type User = {
  user_id: number;
  name: string;
  email: string;
};

// --------------------------------------------------

export default function Admin() {
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<"Products" | "Orders">("Products");

  const categories = [
    "Audio",
    "Electronics",
    "Accessories",
    "Computers",
    "Gaming",
    "Other",
  ];

  const [isOpen, setIsOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    image_main: "",
    images: [] as string[],
    features: [] as string[],
    specs: [] as { key: string; value: string }[],
    description: "",
    category: "Other",
    rating: "",
    reviews: "",
  });

  const [newImage, setNewImage] = useState("");
  const [newFeature, setNewFeature] = useState("");
  const [newSpecKey, setNewSpecKey] = useState("");
  const [newSpecValue, setNewSpecValue] = useState("");

  // --------------------------------------------------
  // PRODUCT QUERIES
  // --------------------------------------------------

  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: api.getProducts,
  });

  const createMutation = useMutation({
    mutationFn: (payload: any) => api.createProduct(payload),
    onSuccess: () => {
      toast.success("Product created!");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      resetForm();
      setIsOpen(false);
    },
    onError: () => toast.error("Failed to create product"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: any) => api.updateProduct(id, payload),
    onSuccess: () => {
      toast.success("Product updated!");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      resetForm();
      setEditingProduct(null);
      setIsOpen(false);
    },
    onError: () => toast.error("Failed to update product"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.deleteProduct(id),
    onSuccess: () => {
      toast.success("Product deleted!");
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: () => toast.error("Failed to delete product"),
  });

  function resetForm() {
    setFormData({
      name: "",
      price: "",
      image_main: "",
      images: [],
      features: [],
      specs: [],
      description: "",
      category: "Other",
      rating: "",
      reviews: "",
    });
  }

  function handleEdit(product: any) {
    setEditingProduct(product);

    setFormData({
      name: product.name,
      price: product.price,
      image_main: product.image,
      images: product.images || [],
      features: product.features || [],
      specs: product.specifications
        ? Object.entries(product.specifications).map(([k, v]) => ({
            key: k,
            value: String(v),
          }))
        : [],
      description: product.description,
      category: product.category,
      rating: product.rating,
      reviews: product.reviews,
    });

    setIsOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const payload = {
      name: formData.name,
      price: Number(formData.price),
      image_main: formData.image_main,
      description: formData.description,
      category: formData.category,
      rating: Number(formData.rating),
      reviews: Number(formData.reviews),
      images: formData.images,
      features: formData.features,
      specifications: formData.specs.reduce((acc, s) => {
        acc[s.key] = s.value;
        return acc;
      }, {} as Record<string, string>),
    };

    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  }

  // --------------------------------------------------
  // ORDER QUERIES
  // --------------------------------------------------

  const { data: allOrders = [] } = useQuery<Order[]>({
    queryKey: ["admin-orders"],
    queryFn: api.getAllOrders,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      api.updateOrderStatus(id, status),
    onSuccess: () => {
      toast.success("Order updated");
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    },
    onError: () => toast.error("Failed to update order"),
  });

  // --------------------------------------------------
  // FILTERS
  // --------------------------------------------------
  const [statusFilter, setStatusFilter] = useState("All");
  const [userFilter, setUserFilter] = useState("All");
  const [search, setSearch] = useState("");

  function applyFilters() {
    let filtered = allOrders;

    if (statusFilter !== "All") {
      filtered = filtered.filter((o) => o.status === statusFilter);
    }
    if (userFilter !== "All") {
      filtered = filtered.filter((o) => String(o.user.id) === userFilter);
    }
    if (search.trim() !== "") {
      filtered = filtered.filter((o) =>
        String(o.id).includes(search.trim())
      );
    }

    return filtered;
  }

  const filteredOrders = applyFilters();

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">

        {/* TABS */}
        <div className="flex gap-6 mb-6">
          <Button
            variant={activeTab === "Products" ? "default" : "outline"}
            onClick={() => setActiveTab("Products")}
          >
            Products
          </Button>

          <Button
            variant={activeTab === "Orders" ? "default" : "outline"}
            onClick={() => setActiveTab("Orders")}
          >
            Orders
          </Button>
        </div>

        {/* -------------------------------------------------- */}
        {/* PRODUCTS TAB */}
        {/* -------------------------------------------------- */}
        {activeTab === "Products" && (
          <>
            <div className="flex justify-between mb-6">
              <h1 className="text-3xl font-bold">Product Management</h1>

              <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" /> Add Product
                  </Button>
                </DialogTrigger>

                {/* PRODUCT MODAL */}
                <DialogContent className="max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingProduct ? "Edit Product" : "Add Product"}
                    </DialogTitle>
                  </DialogHeader>

                  {/* FORM */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name */}
                    <div>
                      <Label>Name</Label>
                      <Input
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        required
                      />
                    </div>

                    {/* Price */}
                    <div>
                      <Label>Price</Label>
                      <Input
                        type="number"
                        value={formData.price}
                        onChange={(e) =>
                          setFormData({ ...formData, price: e.target.value })
                        }
                        required
                      />
                    </div>

                    {/* Main Image */}
                    <div>
                      <Label>Main Image</Label>
                      <Input
                        value={formData.image_main}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            image_main: e.target.value,
                          })
                        }
                      />
                    </div>

                    {/* Images */}
                    <div>
                      <Label>Images</Label>
                      <div className="flex gap-2">
                        <Input
                          value={newImage}
                          onChange={(e) => setNewImage(e.target.value)}
                          placeholder="https://..."
                        />
                        <Button
                          type="button"
                          onClick={() => {
                            if (!newImage) return;
                            setFormData((p) => ({
                              ...p,
                              images: [...p.images, newImage],
                            }));
                            setNewImage("");
                          }}
                        >
                          Add
                        </Button>
                      </div>

                      <div className="flex gap-2 flex-wrap mt-2">
                        {formData.images.map((img, idx) => (
                          <div key={idx} className="relative">
                            <img
                              src={img}
                              className="w-24 h-24 object-cover rounded"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setFormData((p) => ({
                                  ...p,
                                  images: p.images.filter((_, i) => i !== idx),
                                }))
                              }
                              className="absolute top-0 right-0 bg-white p-1 rounded-full"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Features */}
                    <div>
                      <Label>Features</Label>
                      <div className="flex gap-2">
                        <Input
                          value={newFeature}
                          onChange={(e) => setNewFeature(e.target.value)}
                          placeholder="Bluetooth 5.0"
                        />
                        <Button
                          type="button"
                          onClick={() => {
                            if (!newFeature) return;
                            setFormData((p) => ({
                              ...p,
                              features: [...p.features, newFeature],
                            }));
                            setNewFeature("");
                          }}
                        >
                          Add
                        </Button>
                      </div>

                      <ul className="mt-2 space-y-1">
                        {formData.features.map((f, idx) => (
                          <li
                            key={idx}
                            className="flex justify-between p-2 bg-muted rounded"
                          >
                            {f}
                            <button
                              type="button"
                              onClick={() =>
                                setFormData((p) => ({
                                  ...p,
                                  features: p.features.filter(
                                    (_, i) => i !== idx
                                  ),
                                }))
                              }
                              className="text-destructive"
                            >
                              <Trash2 />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Specs */}
                    <div>
                      <Label>Specifications</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Key"
                          value={newSpecKey}
                          onChange={(e) => setNewSpecKey(e.target.value)}
                        />
                        <Input
                          placeholder="Value"
                          value={newSpecValue}
                          onChange={(e) => setNewSpecValue(e.target.value)}
                        />
                        <Button
                          type="button"
                          onClick={() => {
                            if (!newSpecKey) return;
                            setFormData((p) => ({
                              ...p,
                              specs: [
                                ...p.specs,
                                { key: newSpecKey, value: newSpecValue },
                              ],
                            }));
                            setNewSpecKey("");
                            setNewSpecValue("");
                          }}
                        >
                          Add
                        </Button>
                      </div>

                      <ul className="mt-2 space-y-1">
                        {formData.specs.map((s, idx) => (
                          <li
                            key={idx}
                            className="flex justify-between p-2 bg-muted rounded"
                          >
                            <span>
                              {s.key}: {s.value}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setFormData((p) => ({
                                  ...p,
                                  specs: p.specs.filter((_, i) => i !== idx),
                                }))
                              }
                            >
                              <Trash2 />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Category */}
                    <div>
                      <Label>Category</Label>
                      <select
                        className="border p-2 rounded w-full"
                        value={formData.category}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            category: e.target.value,
                          })
                        }
                      >
                        {categories.map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    {/* Rating */}
                    <div>
                      <Label>Rating</Label>
                      <Input
                        type="number"
                        value={formData.rating}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            rating: e.target.value,
                          })
                        }
                      />
                    </div>

                    {/* Reviews */}
                    <div>
                      <Label>Reviews</Label>
                      <Input
                        type="number"
                        value={formData.reviews}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            reviews: e.target.value,
                          })
                        }
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                      />
                    </div>

                    <Button type="submit">
                      {editingProduct ? "Save Changes" : "Create Product"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* PRODUCT LIST */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products?.map((p: any) => (
                <Card key={p.id}>
                  <CardContent className="p-4">
                    <img
                      src={p.image}
                      className="w-full aspect-square object-cover rounded"
                    />

                    <h3 className="font-semibold mt-2">{p.name}</h3>
                    <p className="text-primary font-bold">₹{p.price}</p>

                    <div className="flex gap-2 mt-3">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleEdit(p)}
                      >
                        <Pencil className="mr-2 h-4 w-4" /> Edit
                      </Button>

                      <Button
                        variant="destructive"
                        onClick={() => deleteMutation.mutate(p.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* -------------------------------------------------- */}
        {/* ORDERS TAB */}
        {/* -------------------------------------------------- */}
        {activeTab === "Orders" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <ShoppingBag /> Manage Orders
            </h2>

            {/* FILTER BAR */}
            <div className="flex flex-wrap gap-4 items-end bg-muted p-4 rounded-lg">
              {/* Status Filter */}
              <div>
                <Label>Status</Label>
                <select
                  className="border p-2 rounded w-[180px]"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All">All</option>
                  <option value="Pending">Pending</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              {/* Search */}
              <div>
                <Label>Search Order ID</Label>
                <Input
                  placeholder="e.g. 1003"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-[180px]"
                />
              </div>
            </div>

            {/* ORDER CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {filteredOrders.length === 0 && (
                <p className="text-muted-foreground">No matching orders found.</p>
              )}

              {filteredOrders.map((order) => (
                <Card key={order.id}>
                  <CardContent className="p-6 space-y-3">
                    <h3 className="text-xl font-semibold">Order #{order.id}</h3>

                    <p className="text-sm text-muted-foreground">
                      <b>User:</b> {order.user.name} ({order.user.email})
                    </p>

                    <p className="text-sm">
                      <b>Date:</b> {order.date}
                    </p>

                    {/* Items */}
                    <ul className="mt-3 bg-muted p-3 rounded space-y-1">
                      {order.items.map((item, idx) => (
                        <li key={idx} className="flex justify-between text-sm">
                          <span>{item.name}</span>
                          <span>
                            {item.quantity} × ₹{item.price}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <p className="text-lg font-bold mt-2">
                      Total: ₹{order.total}
                    </p>

                    {/* Status Dropdown */}
                    <select
                      className="w-full mt-2 border rounded p-2"
                      value={order.status}
                      onChange={(e) =>
                        statusMutation.mutate({
                          id: order.id,
                          status: e.target.value,
                        })
                      }
                    >
                      <option value="Pending">Pending</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
