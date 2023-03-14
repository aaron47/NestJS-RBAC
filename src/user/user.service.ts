import { Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { CreateUserDto } from 'src/dto/createUser.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async createUser(createUserDto: CreateUserDto) {
    const { email, name, role } = createUserDto;
    return this.prisma.user.create({
      data: {
        email,
        name,
        role,
      },
    });
  }

  async login(email: string) {
    const user = await this.validateUser(email);
    console.log(user);

    const token = await this.jwtService.signAsync(
      {
        sub: user.id,
        email,
        role: user.role,
      },
      {
        secret: 'secret',
        expiresIn: '60m',
      },
    );

    return {
      token,
    };
  }

  private async validateUser(email: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
