// Independent reviewer reproduction. Local allowlisted test databases only.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {randomUUID}=require('node:crypto');
const repo=path.dirname(__dirname),sourceServer=path.join(repo,'server'),reviewServer=path.join(__dirname,'review83','server');
const cfg=require(path.join(sourceServer,'node_modules','dotenv')).parse(fs.readFileSync(path.join(sourceServer,'.env.test')));
const url=new URL(cfg.DATABASE_URL);
if(!['localhost','127.0.0.1','[::1]'].includes(url.hostname)||url.pathname!='/classpulse_test'||url.searchParams.has('host'))throw Error('LOCAL_REVIEW_TARGET_REQUIRED');
require(require.resolve('tsx/cjs',{paths:[sourceServer]}));
const {PrismaClient}=require(path.join(sourceServer,'node_modules','@prisma/client'));
const {readSnapshot,provisionUsers,assertLocalTestTarget}=require(path.join(reviewServer,'src/lib/uat6Provisioner.ts'));
url.pathname='/classpulse_fixture_test';url.search='';assertLocalTestTarget(url.toString());
function deferred(){let resolve;const promise=new Promise(r=>resolve=r);return {promise,resolve};}
const root=new PrismaClient({datasources:{db:{url:url.toString()}},log:[]});
(async()=>{
 const [target]=await root.$queryRawUnsafe('SELECT current_database() AS database,host(inet_server_addr()) AS address');
 assert.equal(target.database,'classpulse_fixture_test');assert.ok(['127.0.0.1','::1'].includes(target.address));
 const schema='review83_race_'+randomUUID().replaceAll('-','');
 await root.$executeRawUnsafe('CREATE SCHEMA "'+schema+'"');
 url.searchParams.set('schema',schema);url.searchParams.set('application_name',schema);
 const db=new PrismaClient({datasources:{db:{url:url.toString()}},log:[]});
 const writer=new PrismaClient({datasources:{db:{url:url.toString()}},log:[]});
 const ready=deferred(),commitWriter=deferred(),firstSelectDone=deferred();
 try{
  await db.$executeRawUnsafe('CREATE TYPE "Role" AS ENUM (\'OWNER\',\'RESPONDENT\')');
  await db.$executeRawUnsafe('CREATE TABLE "User" (id SERIAL PRIMARY KEY,email TEXT UNIQUE NOT NULL,"fullName" TEXT NOT NULL,role "Role" NOT NULL,"isActive" BOOLEAN NOT NULL DEFAULT TRUE,"passwordHash" TEXT NOT NULL,"createdAt" TIMESTAMP NOT NULL DEFAULT now())');
  await db.$executeRawUnsafe('CREATE TABLE "Course" (id SERIAL PRIMARY KEY,code TEXT UNIQUE NOT NULL,title TEXT NOT NULL,"ownerId" INTEGER NOT NULL REFERENCES "User"(id))');
  await db.$executeRawUnsafe('CREATE TABLE "Enrollment" (id SERIAL PRIMARY KEY,"userId" INTEGER NOT NULL REFERENCES "User"(id),"courseId" INTEGER NOT NULL REFERENCES "Course"(id),UNIQUE("courseId","userId"))');
  for(const [email,role] of [['ann.lee@classpulse.test','OWNER'],['ben.kim@classpulse.test','OWNER'],['student1@classpulse.test','RESPONDENT'],['student2@classpulse.test','RESPONDENT'],['student3@classpulse.test','RESPONDENT']])await db.user.create({data:{email,role,fullName:'Local reviewer fixture',passwordHash:'synthetic-local-review-only'}});
  await db.course.create({data:{code:'CPE334',title:'Synthetic334',ownerId:1}});
  await db.course.create({data:{code:'CPE231',title:'Synthetic231',ownerId:2}});
  await db.enrollment.createMany({data:[{userId:3,courseId:1},{userId:4,courseId:1},{userId:5,courseId:2}]});
  const approved=await readSnapshot(db);
  const pendingWriter=writer.$transaction(async tx=>{
    await tx.user.create({data:{email:' UAT6.EXTRA@classpulse.test ',fullName:'Concurrent case variant',role:'RESPONDENT',passwordHash:'synthetic-local-review-only'}});
    ready.resolve();await commitWriter.promise;
  },{timeout:10000});
  await ready.promise;
  const applying=provisionUsers(db,{approved,confirmed:true,targetConfirmation:'LOCAL_TEST_ONLY',testUrl:url.toString(),passwords:['Synthetic-review-A','Synthetic-review-B']}).then(value=>({status:'fulfilled',addedUsers:value.users.length}),error=>({status:'rejected',code:error.message}));
  let waiting=false;
  try{
   for(let attempt=0;attempt<100;attempt++){
    const rows=await root.$queryRawUnsafe('SELECT pid FROM pg_stat_activity WHERE application_name=$1 AND wait_event_type=\'Lock\' AND query LIKE \'LOCK TABLE%\'',schema);
    if(rows.length){waiting=true;break;}
    await new Promise(resolve=>setTimeout(resolve,20));
   }
   assert.equal(waiting,true,'Provisioner must actually wait for competing writer lock');
  }finally{commitWriter.resolve();}
  await pendingWriter;const outcome=await applying;
  const [normalized]=await db.$queryRawUnsafe('SELECT count(*)::int AS n FROM "User" WHERE lower(btrim(email))=\'uat6.extra@classpulse.test\'');
  const result={head:'d51ef87cb5c9015401de2ed0c229d30b2254b87a',localTestDatabase:target.database,schema,outcome,normalizedExtraCount:normalized.n,userCount:await db.user.count(),enrollmentCount:await db.enrollment.count(),expected:'Abort before inserts after concurrent normalized collision becomes committed; one existing variant only',productionConnectionUsed:false};
  fs.writeFileSync(path.join(__dirname,'review83-fixed-normalized-race-result.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
  assert.equal(outcome.status,'rejected','A committed normalized collision must not pass the guarded apply');assert.equal(outcome.code,'EMAIL_COLLISION');assert.equal(normalized.n,1);assert.equal(result.userCount,6);assert.equal(result.enrollmentCount,3);
 }finally{commitWriter.resolve();await writer.$disconnect();await db.$disconnect();}
})().finally(()=>root.$disconnect()).catch(error=>{console.error(error.code==='ERR_ASSERTION'?error.message:'LOCAL_RACE_REVIEW_STOPPED');process.exitCode=1;});
