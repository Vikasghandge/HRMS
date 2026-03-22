-- MySQL dump 10.13  Distrib 8.0.45, for Linux (x86_64)
--
-- Host: localhost    Database: hrms_db
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `attendance`
--

DROP TABLE IF EXISTS `attendance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attendance` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` int NOT NULL,
  `date` date NOT NULL,
  `check_in` time DEFAULT NULL,
  `check_out` time DEFAULT NULL,
  `working_hours` decimal(5,2) DEFAULT '0.00',
  `status` enum('present','absent','half_day','leave') COLLATE utf8mb4_unicode_ci DEFAULT 'present',
  `remarks` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_attendance` (`employee_id`,`date`),
  KEY `idx_employee_date` (`employee_id`,`date`),
  KEY `idx_date` (`date`),
  KEY `idx_status` (`status`),
  CONSTRAINT `attendance_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attendance`
--

LOCK TABLES `attendance` WRITE;
/*!40000 ALTER TABLE `attendance` DISABLE KEYS */;
INSERT INTO `attendance` VALUES (1,1,'2026-03-22','13:55:52',NULL,0.00,'present',NULL,'2026-03-22 12:17:17','2026-03-22 13:55:52'),(2,2,'2026-03-22','09:15:00','18:15:00',9.00,'present',NULL,'2026-03-22 12:17:17','2026-03-22 12:17:17'),(3,3,'2026-03-22','09:30:00',NULL,0.00,'present',NULL,'2026-03-22 12:17:17','2026-03-22 12:17:17'),(4,1,'2026-03-21','09:00:00','18:00:00',9.00,'present',NULL,'2026-03-22 12:17:17','2026-03-22 12:17:17'),(5,2,'2026-03-21','09:00:00','17:45:00',8.75,'present',NULL,'2026-03-22 12:17:17','2026-03-22 12:17:17'),(6,3,'2026-03-21','09:30:00','18:30:00',9.00,'present',NULL,'2026-03-22 12:17:17','2026-03-22 12:17:17'),(7,4,'2026-03-22','14:08:44',NULL,0.00,'present',NULL,'2026-03-22 14:08:44','2026-03-22 14:08:44');
/*!40000 ALTER TABLE `attendance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employee_documents`
--

DROP TABLE IF EXISTS `employee_documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee_documents` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` int NOT NULL,
  `document_type` enum('resume','aadhar','pan','passport','driving_license','degree','certificate','other') NOT NULL,
  `document_name` varchar(200) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `file_size` int DEFAULT NULL,
  `uploaded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `employee_id` (`employee_id`),
  CONSTRAINT `employee_documents_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employee_documents`
--

LOCK TABLES `employee_documents` WRITE;
/*!40000 ALTER TABLE `employee_documents` DISABLE KEYS */;
/*!40000 ALTER TABLE `employee_documents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employee_education`
--

DROP TABLE IF EXISTS `employee_education`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee_education` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` int NOT NULL,
  `degree` varchar(100) NOT NULL,
  `institution` varchar(200) NOT NULL,
  `field_of_study` varchar(100) DEFAULT NULL,
  `start_year` year DEFAULT NULL,
  `end_year` year DEFAULT NULL,
  `grade` varchar(20) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `employee_id` (`employee_id`),
  CONSTRAINT `employee_education_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employee_education`
--

LOCK TABLES `employee_education` WRITE;
/*!40000 ALTER TABLE `employee_education` DISABLE KEYS */;
/*!40000 ALTER TABLE `employee_education` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employee_experience`
--

DROP TABLE IF EXISTS `employee_experience`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee_experience` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` int NOT NULL,
  `company_name` varchar(200) NOT NULL,
  `job_title` varchar(100) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date DEFAULT NULL,
  `is_current` tinyint(1) DEFAULT '0',
  `description` text,
  `location` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `employee_id` (`employee_id`),
  CONSTRAINT `employee_experience_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employee_experience`
--

LOCK TABLES `employee_experience` WRITE;
/*!40000 ALTER TABLE `employee_experience` DISABLE KEYS */;
INSERT INTO `employee_experience` VALUES (1,1,'arcon techsolutions','devops enginner','2025-07-07','2026-01-20',0,NULL,'mumbai','2026-03-22 14:04:06');
/*!40000 ALTER TABLE `employee_experience` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employee_skills`
--

DROP TABLE IF EXISTS `employee_skills`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee_skills` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` int NOT NULL,
  `skill_name` varchar(100) NOT NULL,
  `proficiency` enum('beginner','intermediate','advanced','expert') DEFAULT 'intermediate',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `employee_id` (`employee_id`),
  CONSTRAINT `employee_skills_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employee_skills`
--

LOCK TABLES `employee_skills` WRITE;
/*!40000 ALTER TABLE `employee_skills` DISABLE KEYS */;
/*!40000 ALTER TABLE `employee_skills` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employees`
--

DROP TABLE IF EXISTS `employees`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employees` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` int NOT NULL,
  `first_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `department` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `designation` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `joining_date` date DEFAULT NULL,
  `salary` decimal(10,2) DEFAULT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `date_of_birth` date DEFAULT NULL,
  `gender` enum('male','female','other') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `blood_group` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `emergency_contact_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `emergency_contact_phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `emergency_contact_relation` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `current_address` text COLLATE utf8mb4_unicode_ci,
  `permanent_address` text COLLATE utf8mb4_unicode_ci,
  `city` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `state` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `country` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'India',
  `postal_code` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nationality` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'Indian',
  `marital_status` enum('single','married','divorced','widowed') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `profile_photo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `employee_id` (`employee_id`),
  KEY `idx_employee_id` (`employee_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_department` (`department`),
  CONSTRAINT `employees_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employees`
--

LOCK TABLES `employees` WRITE;
/*!40000 ALTER TABLE `employees` DISABLE KEYS */;
INSERT INTO `employees` VALUES (1,'EMP001',2,'John','Doe','+91-7798834281','IT','Software Engineer','2024-01-15',50000.00,'Pune, Maharashtra','2026-03-22 12:17:17','2026-03-22 14:06:17','2000-04-05','male','b+',NULL,NULL,NULL,'kakade palace road audumber building 3rd floor',NULL,'pune','Maharashtra','India','411001','Indian','single',NULL),(2,'EMP002',3,'Jane','Smith','+91-9876543211','HR','HR Manager','2024-02-01',55000.00,'Mumbai, Maharashtra','2026-03-22 12:17:17','2026-03-22 12:17:17',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'India',NULL,'Indian',NULL,NULL),(3,'EMP003',4,'Mike','Johnson','+91-9876543212','Finance','Accountant','2024-03-10',48000.00,'Pune, Maharashtra','2026-03-22 12:17:17','2026-03-22 12:17:17',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'India',NULL,'Indian',NULL,NULL),(4,'EMP004',5,'vik','patil','7798834281','IT','Cloud','2026-03-22',1200000.00,'kakade palace road audumber building 3rd floor','2026-03-22 14:08:28','2026-03-22 14:08:28',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'India',NULL,'Indian',NULL,NULL);
/*!40000 ALTER TABLE `employees` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `leave_balance`
--

DROP TABLE IF EXISTS `leave_balance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `leave_balance` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` int NOT NULL,
  `year` int NOT NULL,
  `sick_leave` int DEFAULT '12',
  `casual_leave` int DEFAULT '10',
  `paid_leave` int DEFAULT '15',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_employee_year` (`employee_id`,`year`),
  KEY `idx_employee_year` (`employee_id`,`year`),
  CONSTRAINT `leave_balance_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leave_balance`
--

LOCK TABLES `leave_balance` WRITE;
/*!40000 ALTER TABLE `leave_balance` DISABLE KEYS */;
INSERT INTO `leave_balance` VALUES (1,1,2024,12,10,15,'2026-03-22 12:17:17','2026-03-22 12:17:17'),(2,2,2024,12,10,15,'2026-03-22 12:17:17','2026-03-22 12:17:17'),(3,3,2024,12,10,15,'2026-03-22 12:17:17','2026-03-22 12:17:17'),(4,1,2026,12,3,15,'2026-03-22 12:35:45','2026-03-22 13:55:33'),(5,4,2026,12,10,15,'2026-03-22 14:08:28','2026-03-22 14:08:28');
/*!40000 ALTER TABLE `leave_balance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `leaves`
--

DROP TABLE IF EXISTS `leaves`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `leaves` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` int NOT NULL,
  `leave_type` enum('sick','casual','paid') COLLATE utf8mb4_unicode_ci NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `days` int NOT NULL,
  `reason` text COLLATE utf8mb4_unicode_ci,
  `status` enum('pending','approved','rejected') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `admin_remarks` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_employee_id` (`employee_id`),
  KEY `idx_status` (`status`),
  KEY `idx_dates` (`start_date`,`end_date`),
  KEY `idx_leave_type` (`leave_type`),
  CONSTRAINT `leaves_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leaves`
--

LOCK TABLES `leaves` WRITE;
/*!40000 ALTER TABLE `leaves` DISABLE KEYS */;
INSERT INTO `leaves` VALUES (1,1,'casual','2026-03-27','2026-03-28',2,'Family function','approved','Approved','2026-03-22 12:17:17','2026-03-22 13:55:33'),(2,2,'sick','2026-03-25','2026-03-25',1,'Medical checkup','approved',NULL,'2026-03-22 12:17:17','2026-03-22 12:17:17'),(3,3,'paid','2026-04-01','2026-04-05',5,'Vacation','pending',NULL,'2026-03-22 12:17:17','2026-03-22 12:17:17'),(4,1,'casual','2026-03-23','2026-03-27',5,'my health is down so for that i need to take medical leave','approved','Approved','2026-03-22 12:35:45','2026-03-22 12:45:10');
/*!40000 ALTER TABLE `leaves` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_is_read` (`is_read`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,2,'Welcome to HRMS','Your account has been created successfully.',0,'2026-03-22 12:17:17'),(2,3,'Leave Request Approved','Your leave request from 2024-03-25 to 2024-03-25 has been approved',1,'2026-03-22 12:17:17'),(3,4,'Welcome to HRMS','Your account has been created successfully.',0,'2026-03-22 12:17:17'),(4,2,'Leave Request Approved','Your leave request from Mon Mar 23 2026 00:00:00 GMT+0000 (Coordinated Universal Time) to Fri Mar 27 2026 00:00:00 GMT+0000 (Coordinated Universal Time) has been approved',0,'2026-03-22 12:45:10'),(5,2,'Leave Request Approved','Your leave request from Fri Mar 27 2026 00:00:00 GMT+0000 (Coordinated Universal Time) to Sat Mar 28 2026 00:00:00 GMT+0000 (Coordinated Universal Time) has been approved',0,'2026-03-22 13:55:33');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('admin','employee') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'employee',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_email` (`email`),
  KEY `idx_role` (`role`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin@hrms.com','admin123','admin',1,'2026-03-22 12:17:17','2026-03-22 12:17:17'),(2,'john.doe@hrms.com','password123','employee',1,'2026-03-22 12:17:17','2026-03-22 12:17:17'),(3,'jane.smith@hrms.com','password123','employee',1,'2026-03-22 12:17:17','2026-03-22 12:17:17'),(4,'mike.johnson@hrms.com','password123','employee',1,'2026-03-22 12:17:17','2026-03-22 12:17:17'),(5,'ghandgevikas12@gmail.com','pass@123','employee',1,'2026-03-22 14:08:28','2026-03-22 14:08:28');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-22 14:10:35
