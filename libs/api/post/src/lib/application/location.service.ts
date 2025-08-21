import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";
import { LocationEntity } from "../infrastructure/location.entity";
import { Location } from "@bourgad-monorepo/model";

@Injectable()
export class LocationService {
  constructor(
    private dataSource: DataSource
  ) {}

  create(locationData: Partial<Location>): Promise<Location> {
    return this.dataSource.getRepository(LocationEntity).manager.transaction(async (manager) => {
      return manager.save(LocationEntity, locationData);
    });
  }
}