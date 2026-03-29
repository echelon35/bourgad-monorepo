export interface MediaDto {
    id?: number;
    name: string;
    type: string;
    size: number;
    url: string;
    userId?: number | null;
    createdAt?: Date;
    updatedAt?: Date;
}