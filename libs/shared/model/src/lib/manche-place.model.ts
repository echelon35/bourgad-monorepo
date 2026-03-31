export interface ManchePlace {
  id: number;
  name: string;
  slug: string;
  category: string;
  lat: number | null;
  lng: number | null;
  wikimanchePageId: number;
  enrichedAt: Date | null;
  createdAt: Date;
}
