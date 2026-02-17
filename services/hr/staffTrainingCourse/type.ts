import type { IBaseDto } from '@services/base/type';

export interface IStaffTrainingCourse extends IBaseDto {
  StaffTrainingCourseId: number;
  PersonId: number;
  TrainingCourseId: number;
  EducationalInstitutionId: number;
  StartDate: string;
  EndDate: string;
  Score: number;
  TrainingHours: string;
  EffectiveDate: string;
  CancellationDate: string;
  Grade: number;
  FromGrade: number;
  IsAccepted: boolean;
  ApprovedTime: string;
  CourseContent: string;
}

export interface IRequest {
  config: string;
}
