/** Compileable fail-closed contract scaffold for RED; no provisioner behavior implemented. */
export type Snapshot={
 users:{id:number;email:string;role:string;isActive:boolean}[];
 courses:{id:number;code:string;ownerId:number}[];
 enrollments:{id:number;userId:number;courseId:number}[];
 collisions:{email:string}[];
};
export function validateBaseline(_actual:Snapshot,_approved:Snapshot):{courseId:number}{throw new Error("NOT_IMPLEMENTED");}
export function assertLocalTestTarget(_url:string):void{throw new Error("NOT_IMPLEMENTED");}
