"use client";

import ViewList from "@components/templates/viewList";
import type {
  IRequest,
  IUnitOfMeasurement,
} from "@services/com/unitOfMeasurement/type";

export default function UnitOfMeasurement() {
  // const measurementUnitConfig: INestedListConfig = {
  //   caption: "title.unitOfMeasurement",
  //   pageIcon: "UnitOfMeasurementIcon",
  //   getUrl: "api/com/select/measureUnit",
  //   createUrl: "api/com/insert/measureUnit",
  //   updateUrl: "api/com/update/measureUnit",
  //   deleteUrl: "api/com/delete/measureUnit",
  //   repoViewId: null,
  //   uniqueKey: "MeasureUnitId",
  //   descriptionKey: "MeasureUnitDesc",
  //   nestedKey: "SubUnits",
  //   fatherKey: "FatherId",
  //   levelKey: null,
  //   tooltips: null,
  //   staticValues: {
  //     Factor: 1,
  //     MeasureUnitDesc: undefined,
  //   },
  //   formConfig: [
  //     {
  //       caption: t("general.title"),
  //       name: "MeasureUnitDesc",
  //       type: "text",
  //       rules: [
  //         {
  //           required: true,
  //           message: t("general.enter-", {
  //             field: t("general.title"),
  //           }),
  //         },
  //       ],
  //       order: 1,
  //     },
  //     {
  //       caption: t("general.factor"),
  //       name: "Factor",
  //       type: "number",
  //       rules: [
  //         {
  //           required: true,
  //           message: t("general.enter-", {
  //             field: t("general.factor"),
  //           }),
  //         },
  //       ],
  //       order: 2,
  //     },
  //   ],
  // };

  const staticCondition = ({ id, fatherId }) => {
    if (!fatherId && !id) return true;
  };

  return (
    <ViewList<IUnitOfMeasurement, IRequest>
      caption="title.unitOfMeasurement"
      url="api/com/select/measureUnit"
      isNested
      rowFieldKey="MeasureUnitId"
      nestedListAddChildCondition={staticCondition}
      titleKey={["MeasureUnitDesc", "Factor"]}
      pageIcon="UnitOfMeasurementIcon"
    />
  );
}
