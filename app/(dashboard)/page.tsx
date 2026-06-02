import { Header } from "@/components/layout/header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  Users, 
  Video, 
  Calendar, 
  TrendingUp,
  ArrowUpRight 
} from "lucide-react";

export default function DashboardPage() {
  const stats = [
    { label: "Tổng người dùng", value: "1,234", icon: Users, trend: "+12%", color: "text-blue-500" },
    { label: "Reels đã đăng", value: "456", icon: Video, trend: "+5%", color: "text-purple-500" },
    { label: "Lịch trình tuần này", value: "12", icon: Calendar, trend: "Bình thường", color: "text-amber-500" },
    { label: "Tỷ lệ tăng trưởng", value: "24%", icon: TrendingUp, trend: "+2.4%", color: "text-emerald-500" },
  ];

  return (
    <div className="relative min-h-screen">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] rounded-full bg-indigo-500/5 blur-[100px]" />
      </div>

      <Header title="Tổng quan" />
      
      <div className="relative z-10 p-6 space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Chào buổi chiều, Admin! 👋</h2>
          <p className="text-muted-foreground">Đây là những gì đang diễn ra với các công cụ marketing của bạn ngày hôm nay.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <Card key={i} className="overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-md transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <div className={`p-2 rounded-lg bg-background shadow-inner ${stat.color}`}>
                  <stat.icon size={18} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-xs font-medium text-emerald-500 flex items-center">
                    {stat.trend}
                    {stat.trend.startsWith("+") && <ArrowUpRight size={12} />}
                  </span>
                  <span className="text-xs text-muted-foreground">so với tháng trước</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="grid gap-6 md:grid-cols-7">
          <Card className="md:col-span-4 border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Hoạt động gần đây</CardTitle>
              <CardDescription>
                Các tác vụ mới nhất đã được thực hiện trong hệ thống.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] flex items-center justify-center text-muted-foreground border-2 border-dashed border-border/50 rounded-xl">
                Dữ liệu hoạt động sẽ hiển thị tại đây
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-3 border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Truy cập nhanh</CardTitle>
              <CardDescription>Các công cụ bạn thường xuyên sử dụng.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {["Tạo Reels tự động", "Lên lịch bài viết", "Quản lý khách hàng"].map((tool, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-background/50 border border-border/50 hover:bg-accent/50 cursor-pointer transition-colors group">
                  <span className="text-sm font-medium">{tool}</span>
                  <ArrowUpRight size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
