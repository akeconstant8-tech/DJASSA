import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

export interface JwtPayload {
  sub: string;       // userId
  sellerId?: string;
  role: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: dto.identifier },
          { phone: dto.identifier },
        ],
      },
      include: { seller: true },
    });

    if (!user) throw new UnauthorizedException('Identifiants incorrects.');

    const valid = await argon2.verify(user.passwordHash, dto.password);
    if (!valid) throw new UnauthorizedException('Identifiants incorrects.');

    if (user.status === 'SUSPENDED') {
      throw new UnauthorizedException('Compte suspendu. Contactez le support.');
    }

    const payload: JwtPayload = {
      sub: user.id,
      role: user.role,
      sellerId: user.seller?.id,
    };

    return {
      accessToken: this.jwt.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        seller: user.seller
          ? {
              id: user.seller.id,
              shopName: user.seller.shopName,
              status: user.seller.status,
            }
          : null,
      },
    };
  }

  async me(userId: string) {
    return this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        seller: {
          select: {
            id: true,
            shopName: true,
            description: true,
            city: true,
            logoUrl: true,
            commissionRate: true,
            status: true,
          },
        },
      },
    });
  }
}
