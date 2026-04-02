-- F1 Bot Migration: Add 'tentative' to attendance status ENUM
-- This allows drivers to mark as tentative for attendance

ALTER TABLE `attendance` 
MODIFY `status` ENUM('attending','absent','tentative','reserve','retired') DEFAULT 'attending';
