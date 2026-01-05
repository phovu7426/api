import { Injectable, Inject, Optional } from '@nestjs/common';
import { DeepPartial, Repository, ObjectLiteral } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { ListService } from '@/common/base/services/list.service';
import { StringUtil } from '@/core/utils/string.util';
import { ResponseRef, handleResponseRef } from '@/common/base/utils/response-ref.helper';

/**
 * CRUD Service
 * Kế thừa từ ListService và thêm các phương thức Create, Update, Delete
 */
@Injectable()
export abstract class CrudService<T extends ObjectLiteral> extends ListService<T> {
  constructor(
    protected readonly repository: Repository<T>,
    @Optional() @Inject(ConfigService) private readonly configService?: ConfigService,
  ) {
    super(repository);
  }

  /**
   * Sanitize error message để không lộ chi tiết ở production
   */
  private sanitizeErrorMessage(error: any, genericMessage: string): string {
    const isProduction = this.configService?.get('app.environment') === 'production';
    if (isProduction) {
      return genericMessage;
    }
    return error?.message || genericMessage;
  }

  /**
   * Tạo mới một entity
   */
  async create(
    createDto: DeepPartial<T>,
    createdBy?: number,
  ) {
    try {
      // 1️⃣ Chuẩn bị dữ liệu đầu vào
      const dto = { ...createDto } as any;
      const entity = this.repository.create({} as DeepPartial<T>);
      const responseRef: ResponseRef<T | null> = {};

      // 2️⃣ Gọi hook trước khi tạo (cho phép validate hoặc sửa DTO)
      const allowCreate = await this.beforeCreate(entity, dto, responseRef);
      if (!allowCreate) return handleResponseRef(responseRef);

      // 3️⃣ Làm sạch DTO và thêm thông tin audit
      const filteredDto = this.filterDtoByColumns(dto);
      const auditedDto = this.applyAuditFields(filteredDto, createdBy, 'create');

      // 4️⃣ Tạo và lưu vào DB
      const newEntity = this.repository.create(auditedDto as DeepPartial<T>);
      const savedEntity = await this.repository.save(newEntity);

      // 5️⃣ Gọi hook sau khi tạo
      await this.afterCreate(savedEntity, createDto);

      // 6️⃣ Trả kết quả thành công
      return savedEntity;

    } catch (error) {
      throw new Error(this.sanitizeErrorMessage(error, 'Tạo mới thất bại'));
    }
  }

  /**
   * Cập nhật một entity
   */
  async update(
    id: number,
    updateDto: DeepPartial<T>,
    updatedBy?: number,
  ) {
    try {
      // 1️⃣ Tìm entity cần cập nhật
      const entity = await this.repository.findOne({ where: { id } as any });
      if (!entity) {
        throw new Error(`Entity with ID ${id} not found`);
      }

      // 2️⃣ Chuẩn bị dữ liệu và gọi hook trước update
      const dto = { ...updateDto } as any;
      const responseRef: ResponseRef<T | null> = {};
      const allowUpdate = await this.beforeUpdate(entity, dto, responseRef);
      if (!allowUpdate) return handleResponseRef(responseRef);

      // 3️⃣ Làm sạch DTO và thêm thông tin audit
      const filteredDto = this.filterDtoByColumns(dto);
      const auditedDto = this.applyAuditFields(filteredDto, updatedBy, 'update');

      // 4️⃣ Áp dụng thay đổi và lưu DB
      Object.assign(entity, auditedDto);
      const updatedEntity = await this.repository.save(entity);

      // 5️⃣ Gọi hook sau khi cập nhật
      await this.afterUpdate(updatedEntity, updateDto);

      // 6️⃣ Trả kết quả thành công
      return updatedEntity;

    } catch (error) {
      throw new Error(this.sanitizeErrorMessage(error, 'Cập nhật thất bại'));
    }
  }

  /**
   * Xóa cứng (hard delete) một entity
   */
  async delete(
    id: number,
  ) {
    try {
      const entity = await this.repository.findOne({ where: { id } as any });
      if (!entity) {
        throw new Error(`Entity with ID ${id} not found`);
      }

      // Hook before delete (must return true to proceed)
      const responseRef: ResponseRef<null> = {};
      const canProceed = await this.beforeDelete(entity, responseRef);
      if (!canProceed) {
        return handleResponseRef(responseRef);
      }
      
      await this.repository.remove(entity);
      await this.afterDelete(entity);
      return { deleted: true };

    } catch (error) {
      throw new Error(this.sanitizeErrorMessage(error, 'Xóa thất bại'));
    }
  }

  /**
   * Hook được gọi trước khi tạo entity
   * Override method này để thêm validation hoặc logic tùy chỉnh
   * @param entity - Entity tạm
   * @param createDto - DTO để tạo (có thể mutate để xử lý dữ liệu)
   * @param response - Object tham chiếu để set response tùy chỉnh
   * @returns true để tiếp tục, false để dừng
   */
  protected async beforeCreate(
    entity: T,
    createDto: DeepPartial<T>,
    response?: ResponseRef<T | null>
  ): Promise<boolean> {
    return true;
  }

  /**
   * Hook được gọi sau khi tạo entity
   * Override method này để thêm logic sau khi tạo
   */
  protected async afterCreate(entity: T, createDto: DeepPartial<T>): Promise<void> {
    // Override trong service con
  }

  /**
   * Hook được gọi trước khi cập nhật entity
   * @param entity - Entity hiện tại
   * @param updateDto - DTO để cập nhật (có thể mutate để xử lý dữ liệu)
   * @param response - Object tham chiếu để set response tùy chỉnh
   * @returns true để tiếp tục, false để dừng
   */
  protected async beforeUpdate(
    entity: T,
    updateDto: DeepPartial<T>,
    response?: ResponseRef<T | null>
  ): Promise<boolean> {
    return true;
  }

  /**
   * Hook được gọi sau khi cập nhật entity
   */
  protected async afterUpdate(
    entity: T,
    updateDto: DeepPartial<T>,
  ): Promise<void> {
    // Override trong service con
  }

  /**
   * Hook được gọi trước khi xóa cứng entity
   * @param entity - Entity cần xóa
   * @param response - Object tham chiếu để set response tùy chỉnh
   * @returns true để tiếp tục, false để dừng
   */
  protected async beforeDelete(
    entity: T,
    response?: ResponseRef<null>
  ): Promise<boolean> {
    return true;
  }

  /**
   * Hook được gọi sau khi xóa cứng entity
   */
  protected async afterDelete(entity: T): Promise<void> {
    // Override trong service con
  }

  /**
   * Soft delete nếu entity có deleteDateColumn, ngược lại fallback remove
   */
  async softDelete(id: number) {
    try {
      const entity = await this.repository.findOne({ where: { id } as any });
      if (!entity) {
        throw new Error(`Entity with ID ${id} not found`);
      }
      if (this.repository.metadata.deleteDateColumn) {
        await (this.repository as any).softDelete(id as any);
      } else {
        await this.repository.remove(entity);
      }
      return { deleted: true };
    } catch (error) {
      throw new Error(this.sanitizeErrorMessage(error, 'Xóa thất bại'));
    }
  }

  /**
   * Khôi phục nếu entity có deleteDateColumn
   */
  async restore(id: number) {
    if (!this.repository.metadata.deleteDateColumn) {
      throw new Error('Entity không hỗ trợ restore');
    }
    try {
      await (this.repository as any).restore(id as any);
      return { restored: true };
    } catch (error) {
      throw new Error(this.sanitizeErrorMessage(error, 'Khôi phục thất bại'));
    }
  }

  /**
   * Chỉ giữ lại các thuộc tính thuộc về entity columns
   */
  protected filterDtoByColumns(input: DeepPartial<T>): DeepPartial<T> {
    const allowed = new Set(this.repository.metadata.columns.map(c => c.propertyName));
    const output: any = {};
    for (const key of Object.keys(input || {})) {
      if (allowed.has(key)) {
        output[key] = (input as any)[key];
      }
    }
    return output as DeepPartial<T>;
  }

  /**
   * Gắn createdBy/updatedBy nếu entity có các cột này
   */
  protected applyAuditFields(
    input: DeepPartial<T>,
    userId: number | undefined,
    type: 'create' | 'update'
  ): DeepPartial<T> {
    if (!userId) return input;
    const hasCreatedBy = !!this.repository.metadata.findColumnWithPropertyName('created_user_id');
    const hasUpdatedBy = !!this.repository.metadata.findColumnWithPropertyName('updated_user_id');
    const output: any = { ...input };
    if (type === 'create' && hasCreatedBy) {
      output.created_user_id = userId as any;
    }
    if (type === 'update' && hasUpdatedBy) {
      output.updated_user_id = userId as any;
    }
    return output as DeepPartial<T>;
  }

  /**
   * Đảm bảo slug được tạo từ name nếu chưa có
   * @param data - Data object chứa name hoặc slug
   * @param excludeId - ID của record cần loại trừ khi check (dùng khi update)
   * @param currentSlug - Slug hiện tại của entity (khi update, để so sánh trực tiếp)
   * @returns Data object đã được xử lý slug
   */
  protected async ensureSlug(data: any, excludeId?: number, currentSlug?: string): Promise<any> {
    // Nếu chưa có slug → tạo từ name
    if (data.name && !data.slug) {
      data.slug = StringUtil.toSlug(data.name);
      return data;
    }
    // Nếu có slug → kiểm tra có trùng với chính nó không (khi update)
    if (data.slug && excludeId) {
      const normalizedSlug = StringUtil.toSlug(data.slug);
      const normalizedCurrentSlug = currentSlug ? StringUtil.toSlug(currentSlug) : null;
      // So sánh trực tiếp với slug hiện tại (nhanh hơn, không cần query)
      if (normalizedCurrentSlug && normalizedSlug === normalizedCurrentSlug) {
        // Đảm bảo xóa slug khỏi data
        delete data.slug;
        // Kiểm tra lại để chắc chắn
        if ('slug' in data) {
          delete data.slug;
        }
        return data;
      }
      // Nếu không có currentSlug, query để check (fallback)
      if (!normalizedCurrentSlug) {
        const existing = await this.repository.findOne({
          where: { slug: normalizedSlug } as any
        });
        // Nếu trùng với chính nó → unset slug (không cập nhật slug)
        if (existing && (existing as any).id === excludeId) {
          delete data.slug;
          if ('slug' in data) {
            delete data.slug;
          }
          return data;
        }
      }
    }
    // Nếu có slug, normalize nó
    if (data.slug) {
      data.slug = StringUtil.toSlug(data.slug);
    }
    return data;
  }
}

