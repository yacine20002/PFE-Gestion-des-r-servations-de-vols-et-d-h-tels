# Deployment Diagram — FlightHotel Platform Architecture

```mermaid
graph TB
    subgraph Client["🖥️ Client Device (Browser)"]
        Browser[Next.js CSR App\nport :3000\nReact + shadcn/ui + Tailwind]
    end

    subgraph DevServer["🖥️ Development Machine"]
        subgraph Frontend["Frontend Server"]
            NextJS[Next.js Dev Server\nport :3000]
        end

        subgraph Backend["Backend API Server"]
            Express[Express.js Server\nNode.js v22\nport :5000]
            JWT[JWT Auth\nMiddleware]
            Prisma[Prisma ORM\nClient]
            PDFKit[PDFKit\nPDF Generator]
        end

        subgraph Docker["🐳 Docker Containers"]
            MySQL[(MySQL 8.0\nport :3306\npfe_booking DB)]
            phpMyAdmin[phpMyAdmin\nport :8080]
        end
    end

    subgraph External["☁️ External Services"]
        Ethereal[Ethereal Email\nSMTP Dev Server]
        ProductionSMTP[Production SMTP\nex: Gmail/SendGrid]
    end

    Browser -->|HTTP/HTTPS| NextJS
    NextJS -->|REST API calls\nHTTP :5000| Express
    Express --> JWT
    JWT --> Express
    Express --> Prisma
    Express --> PDFKit
    Prisma -->|TCP :3306| MySQL
    MySQL --- phpMyAdmin
    Express -->|SMTP| Ethereal
    Express -.->|SMTP Production| ProductionSMTP

    subgraph APIEndpoints["📋 REST API Endpoints"]
        direction LR
        EP1["/api/auth/*\nAuthentication"]
        EP2["/api/flights/*\nFlight CRUD"]
        EP3["/api/hotels/*\nHotel CRUD"]
        EP4["/api/reservations/*\nBookings"]
        EP5["/api/payments\nSimulated Payment"]
        EP6["/api/dashboard/*\nBI Stats"]
        EP7["/api/pdf/*\nPDF Generation"]
    end

    Express --- APIEndpoints

    subgraph FrontendPages["📄 Frontend Pages"]
        direction LR
        P1["/auth/* - Login/Register"]
        P2["/flights/search"]
        P3["/hotels/search"]
        P4["/reservations"]
        P5["/dashboard - Admin BI"]
        P6["/admin/* - Management"]
    end

    NextJS --- FrontendPages

    style Client fill:#1e40af,color:#fff
    style Backend fill:#065f46,color:#fff
    style Frontend fill:#1e3a5f,color:#fff
    style Docker fill:#374151,color:#fff
    style External fill:#4c1d95,color:#fff
```

## Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend Framework | Next.js | 15.x |
| UI Library | shadcn/ui + Tailwind CSS | Latest |
| State Management | Zustand | 5.x |
| HTTP Client | Axios | 1.x |
| Backend Framework | Express.js | 4.x |
| Runtime | Node.js | 22.x |
| Language | TypeScript | 5.x |
| ORM | Prisma | 5.x |
| Database | MySQL | 8.0 |
| Authentication | JSON Web Tokens (JWT) | - |
| Email | Nodemailer | 6.x |
| PDF Generation | PDFKit | 0.16 |
| Charts | Recharts | 2.x |
| Containerization | Docker + Docker Compose | - |
