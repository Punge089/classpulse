export type Snapshot={
 users:{id:number;email:string;role:string;isActive:boolean}[];
 courses:{id:number;code:string;ownerId:number}[];
 enrollments:{id:number;userId:number;courseId:number}[];
 collisions:{email:string}[];
};
export const TARGET_EMAILS=["uat6.extra@classpulse.test","uat6.inactive@classpulse.test"] as const;
const normalize=(s:string)=>s.trim().toLowerCase();
const mismatch=():never=>{throw new Error("BASELINE_MISMATCH");};
function canonical(s:Snapshot):string{
 return JSON.stringify({
 users:[...s.users].sort((a,b)=>a.id-b.id),
 courses:[...s.courses].sort((a,b)=>a.id-b.id),
 enrollments:[...s.enrollments].sort((a,b)=>a.id-b.id)
 });
}
export function validateBaseline(actual:Snapshot,approved:Snapshot):{courseId:number}{
 if(actual.collisions.some(u=>TARGET_EMAILS.some(e=>e===normalize(u.email))))throw new Error("EMAIL_COLLISION");
 if(actual.users.length!==5||actual.courses.length!==2||actual.enrollments.length!==3)mismatch();
 const ownerEmails=["ann.lee@classpulse.test","ben.kim@classpulse.test"];
 const ownerIds=ownerEmails.map(email=>{
 const u=actual.users.filter(u=>u.email===email);
 if(u.length!==1||u[0].role!=="OWNER"||!u[0].isActive)mismatch();
 return u[0].id;});
 if(new Set(actual.users.map(u=>u.id)).size!==5)mismatch();
 const courses=["CPE334","CPE231"].map((code,i)=>{
 const rows=actual.courses.filter(c=>c.code===code);
 if(rows.length!==1||rows[0].ownerId!==ownerIds[i])mismatch();
 return rows[0];
 });
 if(courses[0].id===courses[1].id)mismatch();
 for(const n of [1,2,3]){
 const users=actual.users.filter(u=>u.email==="student"+n+"@classpulse.test");
 if(users.length!==1||users[0].role!=="RESPONDENT"||!users[0].isActive)mismatch();
 const e=actual.enrollments.filter(e=>e.userId===users[0].id);
 if(e.length!==1||e[0].courseId!==courses[n===3?1:0].id)mismatch();
 }
 if(new Set(actual.enrollments.map(e=>e.id)).size!==3||canonical(actual)!==canonical(approved))mismatch();
 return {courseId:courses[0].id};
}
export function assertLocalTestTarget(raw:string):void{
 try{
 const u=new URL(raw);
 if(!["postgres:","postgresql:"].includes(u.protocol)||!["localhost","127.0.0.1","[::1]"].includes(u.hostname)||u.pathname!=="/classpulse_fixture_test")throw new Error();
 }catch{throw new Error("TEST_TARGET_REJECTED");}
}

import type {PrismaClient} from "@prisma/client";
export async function readSnapshot(_db:PrismaClient):Promise<Snapshot>{throw new Error("NOT_IMPLEMENTED");}
export type ApplyOptions={approved:Snapshot;confirmed:boolean;targetConfirmation:string;testUrl?:string;passwords:[string,string];testFailure?:"first-user"|"second-user"|"enrollment"};
export async function provisionUsers(_db:PrismaClient,_options:ApplyOptions):Promise<unknown>{throw new Error("NOT_IMPLEMENTED");}

