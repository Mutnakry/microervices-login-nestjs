import {
    Controller, Get, Post, Body, Patch, Param, Delete,
} from '@nestjs/common';
import { AnnouncementService } from './announcement.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('announcements')
@Controller('announcements')
export class AnnouncementController {
    constructor(private readonly announcementService: AnnouncementService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new announcement' })
    create(@Body() dto: CreateAnnouncementDto) {
        return this.announcementService.create(dto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all announcements' })
    findAll() {
        return this.announcementService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get an announcement by ID' })
    findOne(@Param('id') id: string) {
        return this.announcementService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update an announcement' })
    update(@Param('id') id: string, @Body() dto: UpdateAnnouncementDto) {
        return this.announcementService.update(id, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete an announcement' })
    remove(@Param('id') id: string) {
        return this.announcementService.remove(id);
    }
}
