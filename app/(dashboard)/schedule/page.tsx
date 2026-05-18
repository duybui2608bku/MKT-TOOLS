import { Header } from "@/components/layout/header";
import { ScheduleCalendar } from "@/components/schedule/schedule-calendar";

export default function SchedulePage() {
  return (
    <>
      <Header title="Lịch trình" />
      <div className="space-y-5 p-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold tracking-normal text-foreground">
            Lịch đăng bài theo tuần
          </h2>
          <p className="text-sm text-muted-foreground">
            Theo dõi từng ngày, loại nội dung cần đăng và đánh dấu khi đã hoàn thành.
          </p>
        </div>
        <ScheduleCalendar />
      </div>
    </>
  );
}
