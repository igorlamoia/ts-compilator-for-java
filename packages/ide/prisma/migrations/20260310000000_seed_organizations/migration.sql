-- Insert CEFET-MG and UFJF if they don't exist yet
INSERT OR IGNORE INTO "Organization" ("id", "name", "createdAt")
VALUES ('org-cefet-mg', 'CEFET-MG', CURRENT_TIMESTAMP);

INSERT OR IGNORE INTO "Organization" ("id", "name", "createdAt")
VALUES ('org-ufjf', 'UFJF', CURRENT_TIMESTAMP);

-- Reassign all users from "Default Organization" to CEFET-MG
UPDATE "User"
SET "organizationId" = 'org-cefet-mg'
WHERE "organizationId" IN (
  SELECT "id" FROM "Organization" WHERE "name" = 'Default Organization'
);

-- Reassign all classes from "Default Organization" to CEFET-MG
UPDATE "Class"
SET "organizationId" = 'org-cefet-mg'
WHERE "organizationId" IN (
  SELECT "id" FROM "Organization" WHERE "name" = 'Default Organization'
);

-- Delete "Default Organization" if it no longer has any references
DELETE FROM "Organization"
WHERE "name" = 'Default Organization'
  AND NOT EXISTS (SELECT 1 FROM "User" WHERE "organizationId" = "Organization"."id")
  AND NOT EXISTS (SELECT 1 FROM "Class" WHERE "organizationId" = "Organization"."id");
