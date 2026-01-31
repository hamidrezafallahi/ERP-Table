import { shallowEqual, useDispatch } from "react-redux";
import MainTable from "../../partials/Table"
import useFetchDataForReport from "../hook/useFetchDataForReport";
import { setLevelFromTable } from "@slice/pages";
import { useAppSelector } from "@redux/index";

function AccountingTable() {

    const { data, isLoading, PageRecordCount, PageNumber, childIsLoading } = useFetchDataForReport();
    const { activePage } = useAppSelector((state) => ({activePage: state?.withPersist?.pages?.find((item) => item.isActive === true),}),shallowEqual);
    const dispatch = useDispatch();
    const handleRowClick = (record:any) => {
      dispatch(setLevelFromTable({ Level: activePage?.viewData?.Level, item: record }));

    };

  return (
    <MainTable 
    data={data}
    isLoading={isLoading}
    PageRecordCount={PageRecordCount}
    PageNumber={PageNumber}
    childIsLoading={childIsLoading}
    handleRowClick={handleRowClick}
    active />
  )
}

export default AccountingTable