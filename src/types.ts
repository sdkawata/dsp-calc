export type TargetProducts = {id: string; rate: number}[]
export type Factory = {products:{id:string; rate:number}[],machine: string, machineCount: number, ingredients:{id:string; rate:number}[], recipe: string}
export type Factories = {factories: Factory[]}
export type Recipe = {id: string;name:string;in?:{[k:string]:number|undefined};time:number;producers:string[];out?:{[k:string]:number|undefined}}
export type Item = {id: string; factory?:{speed?:number | undefined}}