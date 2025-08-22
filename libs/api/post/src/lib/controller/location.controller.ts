import { Body, Controller, Post } from "@nestjs/common";
import { LocationService } from "../application/location.service";
import { CreateLocationDto } from "@bourgad-monorepo/internal";
import { Location } from "@bourgad-monorepo/model";

@Controller('location')
export class LocationController {
    constructor(private locationService: LocationService) {}

    @Post('/')
    async createLocation(@Body() locationData: CreateLocationDto): Promise<Location> {
        console.log('createLocation called with:', locationData);
        const location = await this.locationService.findByLabel(locationData.label);
        return (location ? location : this.locationService.create(locationData));
    }

}