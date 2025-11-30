import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { login } from "@/utils/auth";
import { toast } from "sonner";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    const user = login(email, password);

    if (!user) {
      toast.error("Invalid email or password");
      return;
    }

    localStorage.setItem("user", JSON.stringify(user));

    toast.success(`Welcome back, ${user.name}!`);

    if (user.role === "admin") {
      window.location.href = "/admin";
    } else {
      window.location.href = "/";
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Card className="w-full max-w-md shadow-lg border">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Login to Your Account
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input 
              type="email" 
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Password</Label>
            <Input 
              type="password" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button className="w-full" onClick={handleLogin}>
            Login
          </Button>

          <p className="text-sm text-center text-muted-foreground">
            Demo Credentials: <br />
            <strong>User:</strong> john@example.com / john123 <br />
            <strong>Admin:</strong> admin@shop.com / admin123
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
