import { Form } from '@components/templates/form';
import type {
  ILanguage,
  IRequest,
} from '@services/management/language/type';

export default function LanguageFormPage() {
  return (
    <Form<ILanguage, IRequest>
      fieldKey="LanguageId"
      caption={"title.language"}
      url="/api/mng/select/language"
      listUrl="mng/languageList"
      titleKey="LanguageDesc"
      pageIcon="LanguageIcon"
    />
  );
}
