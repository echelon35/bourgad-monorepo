export class PlaceTypeDto {
    name?: string;
    label?: string;
    cover?:  string | ArrayBuffer;
    id?: number;

    constructor(){}

    copyInto(obj: any){
        if(obj){
            this.id = obj.id;
            this.name = obj.name;
            this.label = obj.label;
            this.cover = obj.cover;
        }
    }

    coverPicturePath(){
        return `data:image/png;base64,${this.cover}`;
    }

}