import type { IBaseDto } from "@services/base/type";

export interface ITrainingCourse extends IBaseDto {
  TrainingCourseId: number;
  TrainingCourseDesc: string;
}

export interface IRequest {
  config: string;
}
