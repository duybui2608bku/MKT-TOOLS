export const serviceOptions = ["TẤT CẢ", "CHUNG", "PX", "GB", "HN"] as const;

export type ServiceOption = (typeof serviceOptions)[number];

export const toolEndpoints = {
  reelsWebhookUrl: "https://dhsyccqor.datadex.vn/webhook/reels-auto",
  postsWebhookUrl: "https://dhsyccqor.datadex.vn/webhook/posts-auto",
  imageUploadUrl: "https://www.upanhnhanh.com/api/v1/upload",
  imageUploadApiKey: "upanh_c3jG5bT282yX2AzLaPIwoBEbnukwbrWKqiquqHkVcCsFedxr",
} as const;
