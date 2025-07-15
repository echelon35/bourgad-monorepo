export interface MediaDto {
    id?: number;
    name: string;
    type: string;
    size: number;
    url: string;
    createdAt?: Date;
    updatedAt?: Date;
}