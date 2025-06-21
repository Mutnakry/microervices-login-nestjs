import {
  Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe,
} from '@nestjs/common';
import { SeoService } from './seo.service';
import { CreateSeoDto } from './dto/create-seo.dto';
import { UpdateSeoDto } from './dto/update-seo.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('seo')
@Controller('seo')
export class SeoController {
  constructor(private readonly seoService: SeoService) {}

  @Post()
  @ApiOperation({ summary: 'Create SEO configuration' })
  create(@Body() dto: CreateSeoDto) {
    return this.seoService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all SEO configurations' })
  findAll() {
    return this.seoService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one SEO configuration by ID' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.seoService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update SEO configuration by ID' })
  update(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: UpdateSeoDto) {
    return this.seoService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete SEO configuration by ID' })
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.seoService.remove(id);
  }
}
