"use client";

import ViewList from "@components/templates/viewList";
import type { IPlace, IRequest } from "@services/mng/place/type";

export default function PlaceList() {
  // const placeConfig: INestedListConfig = {
  //   pageIcon: "ConfiguringCompanyDefinitionsIcon",
  //   getUrl: "/api/mng/select/place",
  //   createUrl: "/api/mng/insert/place",
  //   updateUrl: "/api/mng/update/place",
  //   deleteUrl: "/api/mng/delete/place",
  //   repoViewId: null,
  //   uniqueKey: "PlaceId",
  //   descriptionKey: "PlaceDesc",
  //   nestedKey: "SubUnits",
  //   formType: "placeDefinition",
  //   fatherKey: "FatherId",
  //   levelKey: null,
  //   formConfig: null,
  //   tooltips: null,
  //   staticValues: {
  //     Factor: 1,
  //     MeasureUnitDesc: undefined,
  //   },
  // };

  const staticCondition = ({ id, fatherId }) => {
    if (!fatherId && !id) return true;
  };

  return (
    <ViewList<IPlace, IRequest>
      caption="title.place"
      url="/api/mng/select/place"
      isNested
      rowFieldKey="PlaceId"
      nestedListAddChildCondition={staticCondition}
      titleKey={["PlaceCode", "PlaceDesc"]}
      pageIcon="PlaceIcon"
    />
  );
}
