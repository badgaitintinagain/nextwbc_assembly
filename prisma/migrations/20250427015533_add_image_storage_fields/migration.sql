/*
  Warnings:

  - You are about to drop the column `annotatedImageUrl` on the `PredictionImage` table. All the data in the column will be lost.
  - You are about to drop the column `originalImageUrl` on the `PredictionImage` table. All the data in the column will be lost.
  - Added the required column `filename` to the `PredictionImage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mimeType` to the `PredictionImage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `originalImage` to the `PredictionImage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PredictionImage" DROP COLUMN "annotatedImageUrl",
DROP COLUMN "originalImageUrl",
ADD COLUMN     "annotatedImage" BYTEA,
ADD COLUMN     "filename" TEXT NOT NULL,
ADD COLUMN     "mimeType" TEXT NOT NULL,
ADD COLUMN     "originalImage" BYTEA NOT NULL;

-- CreateTable
CREATE TABLE "UserImage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "imageData" BYTEA NOT NULL,
    "mimeType" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "isProfile" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserImage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserImage" ADD CONSTRAINT "UserImage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
