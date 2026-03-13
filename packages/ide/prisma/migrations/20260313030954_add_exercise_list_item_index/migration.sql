-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ClassExerciseList" (
    "exerciseListId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "deadline" DATETIME NOT NULL,
    "totalGrade" REAL NOT NULL,
    "minRequired" INTEGER NOT NULL,
    "publishedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,

    PRIMARY KEY ("exerciseListId", "classId"),
    CONSTRAINT "ClassExerciseList_exerciseListId_fkey" FOREIGN KEY ("exerciseListId") REFERENCES "ExerciseList" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ClassExerciseList_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ClassExerciseList" ("classId", "deadline", "exerciseListId", "minRequired", "publishedAt", "totalGrade", "updatedAt") SELECT "classId", "deadline", "exerciseListId", "minRequired", "publishedAt", "totalGrade", "updatedAt" FROM "ClassExerciseList";
DROP TABLE "ClassExerciseList";
ALTER TABLE "new_ClassExerciseList" RENAME TO "ClassExerciseList";
CREATE INDEX "ClassExerciseList_classId_idx" ON "ClassExerciseList"("classId");
CREATE INDEX "ClassExerciseList_deadline_idx" ON "ClassExerciseList"("deadline");
CREATE TABLE "new_Exercise" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teacherId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "attachments" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Exercise_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Exercise" ("attachments", "createdAt", "description", "id", "status", "teacherId", "title", "updatedAt") SELECT "attachments", "createdAt", "description", "id", "status", "teacherId", "title", "updatedAt" FROM "Exercise";
DROP TABLE "Exercise";
ALTER TABLE "new_Exercise" RENAME TO "Exercise";
CREATE INDEX "Exercise_teacherId_idx" ON "Exercise"("teacherId");
CREATE TABLE "new_ExerciseList" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teacherId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ExerciseList_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ExerciseList" ("createdAt", "description", "id", "status", "teacherId", "title", "updatedAt") SELECT "createdAt", "description", "id", "status", "teacherId", "title", "updatedAt" FROM "ExerciseList";
DROP TABLE "ExerciseList";
ALTER TABLE "new_ExerciseList" RENAME TO "ExerciseList";
CREATE INDEX "ExerciseList_teacherId_idx" ON "ExerciseList"("teacherId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "ExerciseListItem_exerciseId_idx" ON "ExerciseListItem"("exerciseId");
