import { Form } from '@components/templates/form';
import type {
  IProject,
  IRequest,
} from '@services/com/project/type';

export default function ProjectFormPage() {
  return (
    <Form<IProject, IRequest>
      caption={"title.project"}
      fieldKey="ProjectId"
      url="/api/com/select/project"
      listUrl="com/projectList"
      titleKey="ProjectDesc"
    />
  );
}
