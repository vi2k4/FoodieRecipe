import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { Public } from '../../common/decorators/public.decorator';

@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Public()
  @Get()
  findAll() {
    return this.tagsService.findAll();
  }

  // TODO: Add JwtAuthGuard when AuthModule is ready
  @Post()
  create(@Body() createTagDto: CreateTagDto) {
    return this.tagsService.create(createTagDto);
  }

  // TODO: Add JwtAuthGuard and RolesGuard(Admin) when AuthModule is ready
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tagsService.remove(BigInt(id));
  }
}
