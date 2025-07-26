import { Controller, HttpException, HttpStatus, Post, Query, Request } from "@nestjs/common";
import { UserService } from "./user.service";
import * as Express from 'express';
import { Public } from '@bourgad-monorepo/api/core';

@Controller('user')
export class UserController {

    constructor(private userService: UserService){

    }

    @Post('change-town')
    @Public()
    async changeTown(@Request() req: Express.Request, @Query('cityId') cityId: number) {
        try {
            const userId = req.user?.id;
            if(userId == null || cityId == null){
                throw new Error('Une erreur est survenue lors du changement de ville de l\'utilisateur');
            }
            return await this.userService.changeTown(cityId, userId);
        } catch (error: any) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
    }

}