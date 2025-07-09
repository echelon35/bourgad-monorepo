import { Audited } from "./audited.model";

export interface Media extends Audited {
  mediaId: number;
  url: string;
  type: string;
  size?: number;
  format?: string;
  duration?: number;
  thumbnailUrl?: string;
  title?: string;
  description?: string;
}