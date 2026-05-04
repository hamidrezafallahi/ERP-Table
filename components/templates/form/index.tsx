import FormGenerator from '@components/organisms/formGenerator';

import type { IProps } from './type';

export default function Form<T, K>({
  caption,
  pageIcon,
  url,
  listUrl,
  fieldKey,
  titleKey,
  conditionalActions,
  isModal = false,
  parentPageId,
  mutationSystemId,
  conditionalFields,
  setConditionalFields,
  extraFunction,
  withImage,
  submitCaption,
  withSubmitButton = true,
  hasShorthandFormToolbar,
  Component
}: IProps) {
  return (
    <FormGenerator<T, K>
      caption={caption}
      fieldKey={fieldKey}
      listUrl={listUrl}
      url={url}
      titleKey={titleKey}
      pageIcon={pageIcon}
      conditionalActions={conditionalActions}
      isModal={isModal}
      parentPageId={parentPageId}
      mutationSystemId={mutationSystemId}
      conditionalFields={conditionalFields}
      setConditionalFields={setConditionalFields}
      extraFunction={extraFunction}
      withImage={withImage}
      submitCaption={submitCaption}
      withSubmitButton={withSubmitButton}
      hasShorthandFormToolbar={hasShorthandFormToolbar}
      Component={Component}
    />
  );
}
