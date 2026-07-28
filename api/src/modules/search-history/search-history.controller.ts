import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CreateSearchHistoryDto } from './dto/create-search-history.dto';
import { SearchHistoryService } from './search-history.service';

@Controller('search-history')
@UseGuards(AuthGuard)
export class SearchHistoryController {
  constructor(private readonly searchHistoryService: SearchHistoryService) {}

  @Post()
  create(
    @CurrentUser() user: { id: bigint },
    @Body() dto: CreateSearchHistoryDto,
  ) {
    return this.searchHistoryService.create(user.id, dto.keyword);
  }

  @Get()
  findAll(
    @CurrentUser() user: { id: bigint },
    @Query('limit') limit?: string,
  ) {
    return this.searchHistoryService.findAll(user.id, limit);
  }

  @Delete()
  clear(@CurrentUser() user: { id: bigint }) {
    return this.searchHistoryService.clear(user.id);
  }

  @Delete(':id')
  remove(@CurrentUser() user: { id: bigint }, @Param('id') id: string) {
    return this.searchHistoryService.remove(user.id, BigInt(id));
  }
}
