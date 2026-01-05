import { Controller, Get, Param, HttpStatus, HttpException } from '@nestjs/common';
import { EnumService } from '../services/enum.service';
import { EnumValueMetadata } from '../interfaces/enum-metadata.interface';
import { Permission } from '@/common/decorators/rbac.decorators';

@Controller('enums')
export class EnumController {
  constructor(private readonly enumService: EnumService) {}

  @Permission('public')
  @Get()
  getAllEnums() {
    return this.enumService.getAllEnums();
  }

  @Permission('public')
  @Get(':name')
  getEnumByName(@Param('name') name: string): EnumValueMetadata[] {
    const enumData = this.enumService.getEnumByName(name);
    
    if (!enumData) {
      const availableEnums = this.enumService.getAvailableEnumKeys().join(', ');
      throw new HttpException(
        `Enum with name '${name}' not found. Available enums: ${availableEnums}`,
        HttpStatus.NOT_FOUND,
      );
    }
    
    return enumData.values;
  }
}