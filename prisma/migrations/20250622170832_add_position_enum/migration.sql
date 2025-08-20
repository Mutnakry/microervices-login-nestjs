-- CreateEnum
CREATE TYPE "BannerPosition" AS ENUM ('TOP', 'LEFT', 'RIGHT', 'BOTTOM', 'SIDEBAR');

-- AlterTable
ALTER TABLE "Banner" ADD COLUMN     "position" "BannerPosition" NOT NULL DEFAULT 'TOP';
