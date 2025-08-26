import { ConflictException, Injectable } from '@nestjs/common';
import { UserEntity } from './user.entity';
import { RoleEntity } from './role/role.entity';
import { DataSource } from 'typeorm';
import { EmailerService } from '@bourgad-monorepo/api/mail';
import { City, User } from '@bourgad-monorepo/model';
import { ConfigService } from '@nestjs/config';
import { GetProfileDto, SignUpDto } from '@bourgad-monorepo/internal';
import { CityService } from '@bourgad-monorepo/api/territory';

@Injectable()
export class UserService {
  constructor(
    private configService: ConfigService,
    private dataSource: DataSource,
    private emailerService: EmailerService,
    private cityService: CityService
  ) {}

  async findAll(): Promise<User[]> {
    return await this.dataSource.getRepository(UserEntity).find();
  }

  async getSummaryInfos(userId: number): Promise<User> {
    const user = await this.dataSource.getRepository(UserEntity).findOne({
      where: { userId: userId },
      select: { avatar: true, firstname: true, lastname: true, cityId: true },
    });
    return user;
  }

  async getUserCity(userId: number): Promise<City> {
    const user = await this.dataSource.getRepository(UserEntity).findOne({
      where: { userId: userId },
      relations: ['city'],
    });
    return user?.city;
  }

  async updatePassword(userId: number, hashedPassword: string) {
    await this.dataSource.getRepository(UserEntity).update(
      { userId: userId },
      { password: hashedPassword },
    );
  }

  async findOne(
    mail: string,
    verified = true,
    checkVerification = true,
  ): Promise<User> {
      const user = checkVerification
        ? await this.dataSource.getRepository(UserEntity)
            .createQueryBuilder('user')
            .where({
              mail: `${mail}`,
              verifiedMail: verified,
            })
            .leftJoinAndSelect('user.roles', 'roles')
            .getOne()
        : await this.dataSource.getRepository(UserEntity)
            .createQueryBuilder('user')
            .where({
              mail: `${mail}`,
            })
            .leftJoinAndSelect('user.roles', 'roles')
            .getOne();
      return user;
  }

  async findMe(id: number): Promise<GetProfileDto> {
    const users = await this.dataSource.query(`
      SELECT users.mail, users.firstname, users.lastname, medias.url as avatar, users.city_id as "cityId"
      FROM users
      LEFT JOIN medias
      ON medias.media_id = users.avatar_id 
      WHERE users.user_id = ${id};`)
    return users[0];
  }

  async findOneByPk(id: number): Promise<User> {
    return await this.dataSource.getRepository(UserEntity).findOneBy({ userId: id });
  }

  /**
   * Update last connexion field
   * @param user User connected
   */
  async updateConnectionTime(userId: number): Promise<void> {
    try {
      const propertyToUpdate = {
        updatedAt: new Date(),
      };
      await this.dataSource.getRepository(UserEntity).update({ userId: userId }, propertyToUpdate);
    } catch (e) {
      console.error(
        "Une erreur est survenue lors de l'update : " + e.message.toString(),
      );
    }
  }

  async logout(user: User): Promise<boolean> {
    this.updateConnectionTime(user.userId);
    const updatedUser = await this.dataSource.getRepository(UserEntity).update({ userId: user.userId }, user);
    return updatedUser.affected > 0;
  }

  async saveUser(user: User) {
    return await this.dataSource.getRepository(UserEntity).save(user);
  }

  async updateOrCreate(user: SignUpDto): Promise<User> {
    await this.dataSource.getRepository(UserEntity).upsert(user, {
      skipUpdateIfNoValuesChanged: true,
      conflictPaths: ['mail'],
    });

    const userCreated = await this.dataSource.getRepository(UserEntity).findOneBy({
      mail: user.mail,
    });

    return userCreated;
  }

  async changeTown(cityId: string, userId: number): Promise<City>{
    const city = await this.cityService.getCityById(cityId);
    if(city == null){
      throw new Error(`Ville id ${cityId} non trouvée`)
    }

    await this.dataSource.getRepository(UserEntity).update(userId, { city: city});
    return city;

  }

  async createUser(createUserDto: Partial<User>): Promise<User> {

    const userExists = await this.dataSource.getRepository(UserEntity).findOne({
      where: [{ mail: createUserDto.mail }],
    });
    if (userExists) {
      throw new ConflictException('Adresse email déjà utilisée');
    }

    createUserDto.roles = [];
    //Ajouter le rôle par défaut à l'utilisateur
    const defaultRole = await this.dataSource.getRepository(RoleEntity).findOneBy({
      name: 'basic',
    });
    if (defaultRole != null) {
      createUserDto.roles.push(defaultRole);
    }
    
    createUserDto.typeUtilisateur = 'particulier';

    try {
      await this.emailerService.sendEmail(
        `${createUserDto.mail}`,
        "Un nouvel utilisateur vient de s'inscrire",
        `
        L'utilisateur ${createUserDto.firstname} ${createUserDto.lastname} vient de s'inscrire sur Bourgad.
      `,
      );
    } catch (e) {
      console.error("Erreur lors de l'envoi de l'email d'inscription :", e);
    }

    const user = await this.dataSource.getRepository(UserEntity).save(createUserDto);

    return user;
  }
}
