# ClassPulse component and deployment view

```mermaid
flowchart LR
    people[Survey Owner / Respondent]

    subgraph Local[Local development]
        vite[Vite :5173<br/>serves React SPA<br/>proxies /api]
        api[Express API :3000]
    end

    subgraph App[Application components]
        spa[React 18 SPA<br/>Router + Bootstrap<br/>presentation and UX validation]
        middleware[Auth middleware<br/>role and session checks]
        routes[Route handlers<br/>ownership + business rules<br/>validation + transactions]
        prisma[Prisma client]
    end

    subgraph Data[Durable data]
        postgres[(PostgreSQL 16<br/>constraints + migrations)]
    end

    people --> browser[Browser]
    browser -->|development page| vite
    vite --> spa
    browser -->|JSON /api + cp_session cookie| vite
    vite -->|development proxy| api
    api --> middleware
    middleware --> routes
    routes --> prisma
    prisma --> postgres

    browser -.->|production: same-origin page and /api| cloudrun[Cloud Run<br/>Express + client/dist]
    cloudrun --> middleware
    cloudrun -->|serves static SPA| browser
    cloudrun -.->|Lab 5 target| cloudsql[(Cloud SQL for PostgreSQL)]
    secrets[Secret Manager] -.->|runtime secrets| cloudrun
    registry[Artifact Registry] -.->|container image| cloudrun
```

The dashed production links are the planned Lab 5 deployment. In production the browser uses the Cloud Run origin for both the static SPA and `/api`; the Vite proxy exists only during development. The route handler and database paths shown are the designed Sprint 1 responsibilities, with API routes added by the feature Issues.
