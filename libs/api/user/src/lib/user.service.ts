import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { RoleEntity } from './role/role.entity';
import { Repository } from 'typeorm';
import { EmailerService } from '@bourgad-monorepo/api/mail';
import { User } from '@bourgad-monorepo/model';
import { ConfigService } from '@nestjs/config';
import { SignUpDto } from '@bourgad-monorepo/internal';
import { CityService } from '@bourgad-monorepo/api/territory';

@Injectable()
export class UserService {
  constructor(
    private configService: ConfigService,
    @InjectRepository(UserEntity) private userRepository: Repository<UserEntity>,
    @InjectRepository(RoleEntity) private roleRepository: Repository<RoleEntity>,
    private emailerService: EmailerService,
    private cityService: CityService
  ) {}

  async findAll(): Promise<UserEntity[]> {
    return await this.userRepository.find();
  }

  async getSummaryInfos(userId: number): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      where: { userId: userId },
      select: { avatar: true, firstname: true, lastname: true },
    });
    return user;
  }

  async updatePassword(userId: number, hashedPassword: string) {
    await this.userRepository.update(
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
        ? await this.userRepository
            .createQueryBuilder('user')
            .where({
              mail: `${mail}`,
              isEmailVerified: verified,
            })
            .leftJoinAndSelect('user.roles', 'roles')
            .getOne()
        : await this.userRepository
            .createQueryBuilder('user')
            .where({
              mail: `${mail}`,
            })
            .leftJoinAndSelect('user.roles', 'roles')
            .getOne();
      return user;
  }

  async findMe(id: number): Promise<User> {
    return await this.userRepository.findOne({
      where: { userId: id },
      select: {
        mail: true,
        firstname: true,
        lastname: true,
        avatar: true,
      },
    });
  }

  async findOneByPk(id: number): Promise<User> {
    return await this.userRepository.findOneBy({ userId: id });
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
      await this.userRepository.update({ userId: userId }, propertyToUpdate);
    } catch (e) {
      console.error(
        "Une erreur est survenue lors de l'update : " + e.message.toString(),
      );
    }
  }

  async logout(user: User): Promise<boolean> {
    this.updateConnectionTime(user.userId);
    const updatedUser = await this.userRepository.update({ userId: user.userId }, user);
    return updatedUser.affected > 0;
  }

  async saveUser(user: User) {
    return await this.userRepository.save(user);
  }

  async updateOrCreate(user: SignUpDto): Promise<User> {
    await this.userRepository.upsert(user, {
      skipUpdateIfNoValuesChanged: true,
      conflictPaths: ['mail'],
    });

    const userCreated = await this.userRepository.findOneBy({
      mail: user.mail,
    });

    return userCreated;
  }

  async changeTown(cityId: number, userId: number): Promise<boolean>{
    const city = await this.cityService.getCityById(cityId);
    if(city == null){
      throw new Error(`Ville id ${cityId} non trouvée`)
    }

    const result = await this.userRepository.update(userId, { city: city});
    return result.affected > 0;

  }

  async createUser(createUserDto: Partial<User>): Promise<User> {

    const userExists = await this.userRepository.findOne({
      where: [{ mail: createUserDto.mail }],
    });
    if (userExists) {
      throw new ConflictException('Adresse email déjà utilisée');
    }

    createUserDto.roles = [];
    //Ajouter le rôle par défaut à l'utilisateur
    const defaultRole = await this.roleRepository.findOneBy({
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

    const user = this.userRepository.save(createUserDto);

    return user;
  }
}
