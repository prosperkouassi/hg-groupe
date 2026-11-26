const publicImage = /^\/images\/(?:[\w-]+\/)*[\w-]+\.(?:avif|jpe?g|png|webp)$/i;
const publicAttachment = /^\/(?:documents|uploads|images)\/(?:[\w-]+\/)*[\w-]+\.(?:pdf|docx?|xlsx)$/i;

export function isPublicOfferAsset(value: unknown, image: boolean): value is string {
  return typeof value === "string" && value.length <= 500 && (image ? publicImage : publicAttachment).test(value);
}
