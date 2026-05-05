import { assetUrl } from "../lib/upload.js";

export function withPublicationAssetUrl<T extends { file: string | null }>(
  publication: T,
): T & { fileUrl: string | null } {
  return Object.assign({}, publication, { fileUrl: assetUrl(publication.file) });
}

export function withMemberPhotoUrl<T extends { photo: string | null }>(member: T): T & { photoUrl: string | null } {
  return Object.assign({}, member, { photoUrl: assetUrl(member.photo) });
}

export function withNewsPhotoUrl<T extends { photo: string | null }>(news: T): T & { photoUrl: string | null } {
  return Object.assign({}, news, { photoUrl: assetUrl(news.photo) });
}
