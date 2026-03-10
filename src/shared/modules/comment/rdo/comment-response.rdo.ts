// src/shared/modules/comment/dto/comment-response.dto.ts
import { Expose } from 'class-transformer';

export class CommentResponseDto {
  @Expose()
  public id!: string;

  @Expose()
  public text!: string;

  @Expose()
  public rating!: number;

  @Expose()
  public postDate!: Date;

  @Expose()
  public userId!: string;

  @Expose()
  public userName?: string;

  @Expose()
  public userAvatar?: string;

  @Expose()
  public userType?: string;
}
