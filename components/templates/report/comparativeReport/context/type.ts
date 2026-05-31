export interface OfficeReportTableProps {
    data: {
        columns:any
        Data:any,
        TotalCount:number
    }
    isLoading: boolean
    PageRecordCount: number
    PageNumber: number
    handlePaginationChange:(e:number)=>void
    handlePageSizeChange:(e:number)=>void
}