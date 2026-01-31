interface IPlace{
            PlaceId:number,
            Mode: "emInsert"
}
interface IRoleAction{
        ActionId: number,
        AccessLevel?: number,
        Mode: "Add"|"Delete"|"Update",
        Places?: IPlace[]

}
export interface IBody{
    ReturnInsertedRow?: boolean,
    RoleId: number,
    RoleActions:IRoleAction[]
    Places?: IPlace[]
  
}

export interface IProps{
    isLoading?:boolean
    saveHandler ?: (e?:IBody)=>void
    body:IBody
    disable?:boolean
}
