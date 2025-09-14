# API Specification

Based on our tech stack selection of REST API for future cloud sync, I'm designing a REST API specification that will support the future Phase 2 cloud synchronization features while maintaining the client-first architecture priority.

**Important Note:** The MVP operates entirely client-side with no API dependencies. This specification defines the future cloud sync endpoints that will enhance but not replace the offline-first functionality.

## REST API Specification

```yaml
openapi: 3.0.0
info:
  title: Match Manager Cloud Sync API
  version: 1.0.0
  description: REST API for Match Manager cloud synchronization and multi-device support
servers:
  - url: https://api.matchmanager.app/v1
    description: Production API server
  - url: https://staging-api.matchmanager.app/v1
    description: Staging API server

components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  schemas:
    Team:
      type: object
      properties:
        id:
          type: string
          format: uuid
        name:
          type: string
          maxLength: 100
        settings:
          $ref: '#/components/schemas/TeamSettings'
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time
      required: [id, name, settings]

    Player:
      type: object
      properties:
        id:
          type: string
          format: uuid
        teamId:
          type: string
          format: uuid
        name:
          type: string
          maxLength: 100
        jerseyNumber:
          type: integer
          minimum: 1
          maximum: 99
        positions:
          type: array
          items:
            type: string
            enum: [goalkeeper, defender, midfielder, forward]
        isActive:
          type: boolean
      required: [id, teamId, name, jerseyNumber, positions]

    Game:
      type: object
      properties:
        id:
          type: string
          format: uuid
        teamId:
          type: string
          format: uuid
        date:
          type: string
          format: date-time
        opponent:
          type: string
          maxLength: 100
        status:
          type: string
          enum: [setup, first-half, halftime, second-half, completed]
        currentFormation:
          $ref: '#/components/schemas/Formation'
        strategy:
          $ref: '#/components/schemas/SubstitutionStrategy'
      required: [id, teamId, date, status]

paths:
  /teams:
    get:
      summary: List user's teams
      security:
        - BearerAuth: []
      responses:
        '200':
          description: List of teams
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Team'

    post:
      summary: Create new team
      security:
        - BearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Team'
      responses:
        '201':
          description: Team created successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Team'

  /teams/{teamId}/players:
    get:
      summary: Get team roster
      parameters:
        - name: teamId
          in: path
          required: true
          schema:
            type: string
            format: uuid
      security:
        - BearerAuth: []
      responses:
        '200':
          description: Team roster
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Player'

  /teams/{teamId}/games:
    get:
      summary: Get team's games
      parameters:
        - name: teamId
          in: path
          required: true
          schema:
            type: string
            format: uuid
        - name: limit
          in: query
          schema:
            type: integer
            default: 20
        - name: status
          in: query
          schema:
            type: string
            enum: [setup, first-half, halftime, second-half, completed]
      security:
        - BearerAuth: []
      responses:
        '200':
          description: List of games
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Game'

  /sync/upload:
    post:
      summary: Upload local game data for cloud backup
      security:
        - BearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                games:
                  type: array
                  items:
                    $ref: '#/components/schemas/Game'
                lastSyncTimestamp:
                  type: string
                  format: date-time
      responses:
        '200':
          description: Data synced successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  syncedCount:
                    type: integer
                  conflicts:
                    type: array
                    items:
                      type: object

  /sync/download:
    get:
      summary: Download updates from cloud for local sync
      parameters:
        - name: since
          in: query
          required: true
          schema:
            type: string
            format: date-time
      security:
        - BearerAuth: []
      responses:
        '200':
          description: Cloud updates
          content:
            application/json:
              schema:
                type: object
                properties:
                  teams:
                    type: array
                    items:
                      $ref: '#/components/schemas/Team'
                  players:
                    type: array
                    items:
                      $ref: '#/components/schemas/Player'
                  games:
                    type: array
                    items:
                      $ref: '#/components/schemas/Game'

security:
  - BearerAuth: []
```
