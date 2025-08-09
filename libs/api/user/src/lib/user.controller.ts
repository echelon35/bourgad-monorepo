import { Controller, Get, HttpException, HttpStatus, NotFoundException, Post, Query, Request, Response, UnauthorizedException } from "@nestjs/common";
import { UserService } from "./user.service";
import * as Express from 'express';
import { Public } from '@bourgad-monorepo/api/core';
import { GetProfileDto } from "@bourgad-monorepo/internal";

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

    @Get('summary')
    async getInfos(@Request() req, @Response() res): Promise<string> {
        const userId = req.user?.user?.userId;
        if (userId === undefined) {
        throw new UnauthorizedException(
            'Un erreur est survenue : token incorrect',
        );
        }
        try {
        const path = await this.userService.getSummaryInfos(userId);
        return res.status(HttpStatus.OK).json(path);
        } catch (e) {
        return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json(
            'Une erreur est survenue lors de la récupération des informations : ' +
                e,
            );
        }
    }

    @Get('profile')
    async findMe(@Request() req): Promise<GetProfileDto> {
        if (req.user != null) {
        const me = await this.userService.findMe(req?.user?.user?.userId);
        return me;
        } else {
        throw new NotFoundException();
        }
    }
}