import { Point } from "geojson";

export class FeedPostDto {
    id: number;
    userAvatarUrl: string;
    userFirstname: string;
    userLastname: string;
    mediasUrls: string[];
    title: string;
    content: string;
    createdAt: Date;
    point: Point;
    addressLabel: string;
    subcategory: {
        id: number;
        name: string;
        tagClass: string;
        markerIconUrl: string;
    };
}