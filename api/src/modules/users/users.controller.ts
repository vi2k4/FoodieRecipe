import { Controller, Get, Param } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  @Get(':idOrUsername')
  async findOne(@Param('idOrUsername') idOrUsername: string) {
    return this.usersService.findOne(idOrUsername);
  }
}
