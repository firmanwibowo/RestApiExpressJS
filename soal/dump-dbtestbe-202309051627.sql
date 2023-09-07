-- MySQL dump 10.13  Distrib 5.5.62, for Win64 (AMD64)
--
-- Host: localhost    Database: dbtestbe
-- ------------------------------------------------------
-- Server version	5.5.5-10.4.28-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `msuser`
--

DROP TABLE IF EXISTS `msuser`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `msuser` (
  `usr_username` varchar(191) NOT NULL,
  `usr_fullname` text NOT NULL,
  `usr_pswd` text NOT NULL,
  `usr_foto` text DEFAULT NULL,
  `usr_tgllahir` date DEFAULT NULL,
  `usr_datacreated` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`usr_username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `msuser`
--

LOCK TABLES `msuser` WRITE;
/*!40000 ALTER TABLE `msuser` DISABLE KEYS */;
INSERT INTO `msuser` VALUES ('US01','Syarifudin','$2y$10$j/3BpsScPEDSdDSBEVjS3eRAVN3JCT.475/RO.2FHrcjMuww9Ugtq',NULL,NULL,'2023-09-05 16:16:22'),('US02','Alexandra','$2y$10$mMx70OxQKYudpX6a3sfi7.6LAS2Q6hHgXGlPu1W6KwwbmSWBMVXnG',NULL,NULL,'2023-09-05 16:16:22'),('US05','Samuel','$2y$10$QpFqCfaZWfGtO/6D1996HOqn9nSx8B9E.nADrCpVTXeo0FVyzkYGq',NULL,NULL,'2023-09-05 16:16:22');
/*!40000 ALTER TABLE `msuser` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `trpinjamanbuku`
--

DROP TABLE IF EXISTS `trpinjamanbuku`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `trpinjamanbuku` (
  `pjm_no` varchar(191) NOT NULL,
  `pjm_tglpinjam` date NOT NULL,
  `pjm_tglkembali` date DEFAULT NULL,
  `pjm_judulbuku` text NOT NULL,
  `pjm_jumlah` int(11) NOT NULL,
  `pjm_usr_id` varchar(191) NOT NULL,
  PRIMARY KEY (`pjm_no`),
  KEY `TrPinjamanBuku_pjm_usr_id_fkey` (`pjm_usr_id`),
  CONSTRAINT `TrPinjamanBuku_pjm_usr_id_fkey` FOREIGN KEY (`pjm_usr_id`) REFERENCES `msuser` (`usr_username`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `trpinjamanbuku`
--

LOCK TABLES `trpinjamanbuku` WRITE;
/*!40000 ALTER TABLE `trpinjamanbuku` DISABLE KEYS */;
INSERT INTO `trpinjamanbuku` VALUES ('P015','2023-08-12',NULL,'The hobbit',1,'US05'),('P016','2023-08-12','2023-09-03','Harry Potter 1',1,'US02'),('P017','2023-08-14',NULL,'Donald Duck 5',2,'US02'),('P018','2023-08-16','2023-09-04','Teknik Instalasi AC',1,'US05'),('P019','2023-08-16','2023-08-16','Cara membaca cepat',1,'US01'),('P020','2023-08-18',NULL,'Donald Duck 5',2,'US02'),('P021','2023-09-03',NULL,'Pemrogaman untuk anak',2,'US01'),('P022','2023-09-04',NULL,'Dracula',3,'US02');
/*!40000 ALTER TABLE `trpinjamanbuku` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-09-05 16:27:56
