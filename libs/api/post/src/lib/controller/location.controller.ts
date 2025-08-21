import { Body, Controller, Post } from "@nestjs/common";
import { LocationService } from "../application/location.service";
import { CreateLocationDto } from "@bourgad-monorepo/internal";
import { Location } from "@bourgad-monorepo/model";

@Controller('location')
export class LocationController {
    constructor(private locationService: LocationService) {}

    @Post('/')
    createLocation(@Body() locationData: CreateLocationDto): Promise<Location> {
        console.log('createLocation called with:', locationData);
        return this.locationService.create(locationData);
    }
}