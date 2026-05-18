import { Header } from "@/components/layout/header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <>
      <Header title="Tổng quan" />
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Chào mừng đến MKT Tools</CardTitle>
            <CardDescription>
              Chọn một tool từ thanh điều hướng bên trái để bắt đầu.
            </CardDescription>
          </CardHeader>
          <CardContent />
        </Card>
      </div>
    </>
  );
}
