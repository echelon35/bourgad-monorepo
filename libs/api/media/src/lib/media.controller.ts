import { Controller, Post, UploadedFiles, UseInterceptors } from "@nestjs/common";
import 'multer';
import { StorageService } from './storage.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Media } from "@bourgad-monorepo/model";
import { MediaService } from "./media.service";
import { MediaDto } from "@bourgad-monorepo/internal";

@Controller('media')
export class MediaController {
    constructor(private readonly storageService: StorageService,
        private readonly mediaService: MediaService
    ) {}

    @Post('/upload')
    @UseInterceptors(FilesInterceptor('medias'))
    async uploadFiles(@UploadedFiles() files: Array<Express.Multer.File>): Promise<Media[]> {
        const medias: Media[] = [];
        for(const file of files){
            const url = await this.storageService.uploadFile(file);
            const media = await this.mediaService.create({ 
                url: url.url,
                name: file.originalname,
                size: file.size,
                type: file.mimetype,
                thumbnailUrl: url.url
            } as MediaDto);
            medias.push(media);
        }
        return medias;
    }

}