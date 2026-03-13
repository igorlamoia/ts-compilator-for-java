-- Drop existing data that cannot be migrated (dev database only)
DELETE FROM "Submission";
DELETE FROM "TestCase";
DELETE FROM "Exercise";

-- RedefineTables (SQLite does not support DROP COLUMN)
PRAGMA foreign_keys=OFF;

-- Recreate Exercise table with new columns (teacherId instead of classId, added createdAt/updatedAt)
CREATE TABLE "new_Exercise" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teacherId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "attachments" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Exercise_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

DROP TABLE "Exercise";
ALTER TABLE "new_Exercise" RENAME TO "Exercise";

-- Recreate Submission table with new columns (exerciseListId + classId references)
CREATE TABLE "new_Submission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "exerciseId" TEXT NOT NULL,
    "exerciseListId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "codeSnapshot" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "score" REAL,
    "teacherFeedback" TEXT,
    "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Submission_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Submission_exerciseListId_classId_fkey" FOREIGN KEY ("exerciseListId", "classId") REFERENCES "ClassExerciseList" ("exerciseListId", "classId") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Submission_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

DROP TABLE "Submission";
ALTER TABLE "new_Submission" RENAME TO "Submission";

PRAGMA foreign_keys=ON;

-- Remove exercises relation from Class (drop the exercises column - handled by redefinition above)

-- Add password column to User if it doesn't exist (already exists from prior migration, skip)

-- CreateTable ExerciseList
CREATE TABLE "ExerciseList" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teacherId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ExerciseList_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable ExerciseListItem
CREATE TABLE "ExerciseListItem" (
    "exerciseListId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "gradeWeight" REAL NOT NULL,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY ("exerciseListId", "exerciseId"),
    CONSTRAINT "ExerciseListItem_exerciseListId_fkey" FOREIGN KEY ("exerciseListId") REFERENCES "ExerciseList" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ExerciseListItem_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable ClassExerciseList
CREATE TABLE "ClassExerciseList" (
    "exerciseListId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "deadline" DATETIME NOT NULL,
    "totalGrade" REAL NOT NULL,
    "minRequired" INTEGER NOT NULL,
    "publishedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("exerciseListId", "classId"),
    CONSTRAINT "ClassExerciseList_exerciseListId_fkey" FOREIGN KEY ("exerciseListId") REFERENCES "ExerciseList" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ClassExerciseList_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Exercise_teacherId_idx" ON "Exercise"("teacherId");

-- CreateIndex
CREATE INDEX "ExerciseList_teacherId_idx" ON "ExerciseList"("teacherId");

-- CreateIndex
CREATE INDEX "ClassExerciseList_classId_idx" ON "ClassExerciseList"("classId");

-- CreateIndex
CREATE INDEX "ClassExerciseList_deadline_idx" ON "ClassExerciseList"("deadline");

-- CreateIndex
CREATE INDEX "Submission_exerciseListId_classId_idx" ON "Submission"("exerciseListId", "classId");

-- CreateIndex
CREATE INDEX "Submission_studentId_idx" ON "Submission"("studentId");
