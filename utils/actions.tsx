'use server'
import { cookies } from 'next/headers'
 
export async function setcookieserveraction(data:any) {
    // console.log("miyaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaad")
  cookies().set('forminfo', data)
}
// import { NextRouter } from 'next/router'
// import { NextPageContext } from 'next'
// import {userAgent} from 'next/server'

// export function useUserAgent(router:NextRouter|null){
//   const {device} = (router && userAgent())
// }