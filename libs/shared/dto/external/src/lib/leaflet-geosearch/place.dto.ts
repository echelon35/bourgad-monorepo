import * as L from 'leaflet';
import { PlaceTypeDto } from './placeType.dto';
import { City } from '@bourgad-monorepo/model';
const dec = new TextDecoder("utf-8");

export class PlaceDto {
    name?: string;
    label!: string;
    //Id identifying the place in provider
    id!: string;
    providerId?: string;
    type: PlaceTypeDto = new PlaceTypeDto();
    providerTypeId?: string;
    state?: string;
    department?: string;
    country?: string;
    //Country code is two letters used for picture
    countryCode?: string;
    longitude!: number;
    latitude!: number;
    wikilink?: string;
    cover?: string;

    boundingbox!: L.LatLngBounds;
    surface!: L.GeoJSON;
    marker!: L.Marker;

    copyFromGeoApiProvider(obj:any){
        console.log(obj);
        if(obj && obj.x && obj.y){
            this.longitude = (obj.x) || null;
            this.latitude = (obj.y) || null;
            this.marker = new L.Marker([this.latitude,this.longitude]);
            this.label = (obj.label) || null;
            this.name = this.label?.split(',')[0];

            if(obj.raw){
                if(obj.raw.properties){
                    this.providerId = (obj.raw.properties.id) || null;
                    this.providerTypeId = (obj.raw.properties.type) || null;
                    const splitContext = obj.raw.properties.context?.split(',');
                    this.state = splitContext.length > 2 ? splitContext[2].trim() : null;
                    this.department = splitContext.length > 1 ? splitContext[1].trim() : null;
                    this.country = 'France';
                    this.countryCode = 'fr';
                }
            }

            if(obj.bounds){
                const boundingbox = obj.bounds;
                this.boundingbox = L.latLngBounds(L.latLng(boundingbox[0],boundingbox[2]),L.latLng(boundingbox[1],boundingbox[3]));
            }
        }
    }

    /**
     * Make a place object from openstreetmap
     * @param obj 
     */
    copyFromOpenStreetmapProvider(obj:any){
        //La recherche doit contenir au minimum lat et lon, et un label
        if(obj && obj.x && obj.y && obj.label){
            this.label = (obj.label) || null;
            this.name = this.label?.split(',')[0];
            this.longitude = (obj.x) || null;
            this.latitude = (obj.y) || null;
            this.marker = new L.Marker([this.latitude,this.longitude]);

            if(obj.raw){
                this.providerId = (obj.raw.place_id) || null;
                this.providerTypeId = (obj.raw.type) || null;
                if(obj.raw.address){
                    this.state = (obj.raw.address.state) || null;
                    this.country = (obj.raw.address.country) || null;
                    this.countryCode = (obj.raw.address.country_code) || null;
                }

                if(obj.raw.extratags){
                    this.wikilink = (obj.raw.extratags.wikipedia);
                }

                if(obj.raw.boundingbox){
                    const boundingbox = obj.raw.boundingbox;
                    this.boundingbox = L.latLngBounds(L.latLng(boundingbox[0],boundingbox[2]),L.latLng(boundingbox[1],boundingbox[3]));
                }
            }

            
        }
    }

    copyFromBourgad(obj: City){
        this.id = obj.cityId || null;
        this.label = obj.name || null;
        this.name = obj.name || null;
        // this.longitude = obj.surface.bbox[0] || null;
        // this.latitude = obj.surface.bbox[1] || null;
        // this.state = obj.department.name || null;
        // this.department = obj.department.name || null;
        this.country = 'France';
        this.countryCode = 'fr';

        if(obj.surface){
            this.boundingbox = L.geoJSON(obj.surface).getBounds();
            this.surface = L.geoJSON(obj.surface);
        }
    }

    copyInto(obj:any){
        if(obj){
            this.id = obj.id || null;
            this.label = obj.label || null;
            this.name = obj.name || null;
            try{
                if(obj.zone){
                    this.boundingbox = L.geoJSON(obj.zone).getBounds();
                }
            }
            catch{ /* empty */ }
            this.country = obj.country || null;
            this.countryCode = obj.countryCode || null;
            if(obj.place_type){
                this.type.copyInto(obj.place_type);
            }
            // this.type.id = obj.placeTypeId || null;
            this.providerId = obj.providerId || null;
            this.providerTypeId = obj.providerPlaceType || null;
            if(obj.cover){
                this.cover = dec.decode(new Uint8Array(obj.cover.data));
            }
        }
    }

    coverPicturePath(){
        return `data:image/png;base64,${this.cover}`;
    }

    getIcon(){
        switch(this.providerTypeId){
            case 'ocean':
                return '/assets/icons/ocean.svg';
            case 'sea':
                return '/assets/icons/sea.svg';
            case 'volcano':
                return '/assets/icons/volcano.svg';
            case 'river':
                return '/assets/icons/river.svg';
            case 'house':
                return '/assets/icons/house.svg';
            case 'mountain_range':
            case 'peak':
                return '/assets/icons/mountains.svg';
            default:
                return `https://flagcdn.com/${this.countryCode?.toLowerCase()}.svg`;
        }
    }
}