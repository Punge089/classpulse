# ClassPulse Sprint 1 ER diagram

```mermaid
erDiagram
    USER {
        int id PK
        string email UK
        string fullName
        enum role
        string passwordHash
        boolean isActive
        datetime createdAt
    }
    SESSION {
        int id PK
        string tokenHash UK
        int userId FK
        datetime createdAt
        datetime expiresAt
    }
    COURSE {
        int id PK
        string code UK
        string title
        int ownerId FK
    }
    ENROLLMENT {
        int id PK
        int courseId FK
        int userId FK
    }
    SURVEY {
        int id PK
        int courseId FK
        int ownerId FK
        string title
        string description
        enum mode
        enum status
        datetime publishedAt
        datetime closedAt
        datetime createdAt
        datetime updatedAt
    }
    QUESTION {
        int id PK
        int surveyId FK
        int position
        string prompt
        enum type
        boolean required
    }
    QUESTION_OPTION {
        int id PK
        int questionId FK
        int position
        string label
    }
    RESPONSE {
        int id PK
        int surveyId FK
        int respondentId FK
        datetime submittedAt
    }
    ANSWER {
        int id PK
        int responseId FK
        int questionId FK
        int rating_value
        int optionId FK
    }

    USER ||--o{ SESSION : has
    USER ||--o{ COURSE : owns
    USER ||--o{ ENROLLMENT : enrolls
    COURSE ||--o{ ENROLLMENT : includes
    COURSE ||--o{ SURVEY : contains
    USER ||--o{ SURVEY : owns
    SURVEY ||--o{ QUESTION : contains
    QUESTION ||--o{ QUESTION_OPTION : offers
    SURVEY ||--o{ RESPONSE : receives
    USER ||--o{ RESPONSE : submits
    RESPONSE ||--o{ ANSWER : contains
    QUESTION ||--o{ ANSWER : answered_by
    QUESTION_OPTION o|--o{ ANSWER : selected_for
```

Sprint 1 ownership is explicit in both `SURVEY.ownerId` and `COURSE.ownerId`; the API checks they identify the same owner. `RESPONSE.respondentId` keeps responses identified. Composite unique constraints are `ENROLLMENT(courseId, userId)`, `QUESTION(surveyId, position)`, `QUESTION_OPTION(questionId, position)`, `RESPONSE(surveyId, respondentId)` and `ANSWER(responseId, questionId)`. PostgreSQL also has `CHECK (rating_value IS NULL OR rating_value BETWEEN 1 AND 5)` on `ANSWER`; its migration name is `answer_rating_range`. Sprint 2/3 planned entities (`Section`, `ParticipationRecord`, `AnonymousResponse`) are intentionally omitted from this Sprint 1 ER diagram; `AnonymousResponse` is planned without a user foreign key.
