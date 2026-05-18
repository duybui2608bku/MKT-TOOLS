import { Header } from "@/components/layout/header";
import { PostsForm } from "@/components/tools/posts-form";

export default function PostsPage() {
  return (
    <>
      <Header title="Bài viết" />
      <div className="space-y-5 p-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold tracking-normal text-foreground">
            Đăng bài viết tự động
          </h2>
          <p className="text-sm text-muted-foreground">
            Tạo nội dung, upload ảnh lấy link và gửi webhook đăng bài viết.
          </p>
        </div>
        <PostsForm />
      </div>
    </>
  );
}
