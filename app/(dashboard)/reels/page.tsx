import { Header } from "@/components/layout/header";
import { ReelsForm } from "@/components/tools/reels-form";

export default function ReelsPage() {
  return (
    <>
      <Header title="Reels" />
      <div className="space-y-5 p-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold tracking-normal text-foreground">
            Đăng Reels tự động
          </h2>
          <p className="text-sm text-muted-foreground">
            Tạo nội dung, tải video và gửi webhook đăng Reels từ một màn hình.
          </p>
        </div>
        <ReelsForm />
      </div>
    </>
  );
}
