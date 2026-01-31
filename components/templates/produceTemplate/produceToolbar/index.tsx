import CloseButton from '@components/molecules/closeButton';
import ExpandedButton from '@components/molecules/expandedButton';
import { useAppSelector } from '@redux/index';

import FormulaMaker from './formulaMaker';

export default function ProduceToolbar() {
  const hasOpc = useAppSelector((state) =>
    Boolean(
      state.withPersist.pages
        .find((p) => p.isActive)
        ?.pageData?.find((i) => i.name === "hasOpc")?.value
    )
  );
  const hasMoreSPlan = useAppSelector((state) =>
    Boolean(
      state.withPersist.pages
        .find((p) => p.isActive)
        ?.pageData?.find((i) => i.name === "hasMoreSPlan")?.value
    )
  );
  const hasBase = useAppSelector((state) =>
    Boolean(
      state.withPersist.pages
        .find((p) => p.isActive)
        ?.pageData?.find((i) => i.name === "hasBase")?.value
    )
  );

  return (
    <div className="-top-14 absolute flex gap-4 end-0">
      <FormulaMaker disabled={!(hasOpc && hasMoreSPlan && hasBase)} />
      <CloseButton />
      <ExpandedButton />
    </div>
  );
}
