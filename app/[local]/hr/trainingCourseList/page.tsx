import { useTranslations } from "next-intl";

import ViewList from "@components/templates/viewList";
import type {
  IRequest,
  ITrainingCourse,
} from "@services/hr/trainingCourse/type";

export default function TrainingCourseList() {
  const t = useTranslations();

  return (
    <ViewList<ITrainingCourse, IRequest>
      url="/api/hr/select/trainingCourse"
      deleteUrl="/api/hr/delete/trainingCourse"
      staticKey="TrainingCourseId"
      rowFieldKey="TrainingCourseId"
      formUrl="hr/trainingCourse"
      addCaption={t("general.addNew")}
      caption={"title.trainingCourseList"}
      baseRepoId={9007}
      pageIcon="TrainingCourseIcon"
      EditField="TrainingCourseDesc"
      additionalFieldKey="TrainingCourseId"
    />
  );
}
