import Form from "@components/templates/form";
import type {
  IRequest,
  ITrainingCourse,
} from "@services/hr/trainingCourse/type";

export default function TrainingCourseFormPage() {
  return (
    <Form<ITrainingCourse, IRequest>
      fieldKey="TrainingCourseId"
      caption={"title.trainingCourse"}
      url="/api/hr/select/trainingCourse"
      listUrl="hr/trainingCourseList"
      titleKey="TrainingCourseDesc"
      pageIcon="TrainingCourseIcon"
    />
  );
}
