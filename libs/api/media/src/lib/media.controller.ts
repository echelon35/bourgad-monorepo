import { Controller, Post, Get, Request, UploadedFiles, UseInterceptors } from "@nestjs/common";
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

    @Get('/imported')
    async getImported(@Request() req: any): Promise<Media[]> {
        const userId = req.user?.user?.userId;
        if (!userId) {
            throw new Error('User not found');
        }
        return this.mediaService.findOrphanMediasByUser(userId);
    }

    @Post('/upload')
    @UseInterceptors(FilesInterceptor('medias'))
    async uploadFiles(@Request() req: any, @UploadedFiles() files: Array<Express.Multer.File>): Promise<Media[]> {
        const userId = req.user?.user?.userId;
        const medias: Media[] = [];
        for(const file of files){
            const url = await this.storageService.uploadFile(file);
            const media = await this.mediaService.create({ 
                url: url.url,
                name: file.originalname,
                size: file.size,
                type: file.mimetype,
                thumbnailUrl: url.url,
                userId: userId
            } as MediaDto);
            medias.push(media);
        }
        return medias;
    }

}