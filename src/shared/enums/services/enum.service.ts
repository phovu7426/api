import { Injectable } from '@nestjs/common';
import { BasicStatus, BasicStatusLabels } from '../basic-status.enum';
import { Gender } from '../gender.enum';
import { UserStatus, UserStatusLabels } from '../user-status.enum';
import { ReviewStatus, ReviewStatusLabels } from '../review-status.enum';
import { PostStatus, PostStatusLabels } from '../post-status.enum';
import { PostType, PostTypeLabels } from '../post-type.enum';
import { ContactStatus, ContactStatusLabels } from '../contact-status.enum';

@Injectable()
export class EnumService {
  // Cấu hình cho từng loại enum - chỉ giữ lại value và label
  private readonly enumConfigs: Record<string, any> = {
    basic_status: {
      enum: BasicStatus,
      labels: BasicStatusLabels
    },
    gender: {
      enum: Gender,
      labels: {
        [Gender.Male]: 'Nam',
        [Gender.Female]: 'Nữ',
        [Gender.Other]: 'Khác'
      }
    },
    user_status: {
      enum: UserStatus,
      labels: UserStatusLabels
    },
    review_status: {
      enum: ReviewStatus,
      labels: ReviewStatusLabels
    },
    post_status: {
      enum: PostStatus,
      labels: PostStatusLabels
    },
    post_type: {
      enum: PostType,
      labels: PostTypeLabels
    },
    contact_status: {
      enum: ContactStatus,
      labels: ContactStatusLabels
    }
  };

  /**
   * Lấy tất cả enums với value và label
   */
  getAllEnums() {
    const result: Record<string, { value: string; label: string }[]> = {};
    for (const [key, config] of Object.entries(this.enumConfigs)) {
      result[key] = this.buildEnumValues(config);
    }
    return result;
  }

  /**
   * Lấy enum theo tên với value và label
   */
  getEnumByName(name: string): { name: string; values: { value: string; label: string }[] } | null {
    const config = this.enumConfigs[name.toLowerCase()];
    if (!config) return null;

    return {
      name: this.getEnumName(name),
      values: this.buildEnumValues(config)
    };
  }

  /**
   * Xây dựng giá trị enum chỉ với value và label
   */
  private buildEnumValues(config: any): { value: string; label: string }[] {
    return Object.values(config.enum).map((value: string | number) => {
      const stringValue = String(value);
      return {
        id: stringValue,
        value: stringValue,
        name: config.labels?.[value as keyof typeof config.labels] || stringValue,
        label: config.labels?.[value as keyof typeof config.labels] || stringValue
      };
    });
  }

  /**
   * Lấy tên enum từ key
   */
  private getEnumName(key: string): string {
    const nameMap: Record<string, string> = {
      basic_status: 'BasicStatus',
      gender: 'Gender',
      user_status: 'UserStatus',
      review_status: 'ReviewStatus',
      post_status: 'PostStatus',
      post_type: 'PostType',
      contact_status: 'ContactStatus'
    };
    return nameMap[key] || key;
  }

  /**
   * Danh sách các enum key đang được hỗ trợ
   */
  getAvailableEnumKeys(): string[] {
    return Object.keys(this.enumConfigs);
  }
}