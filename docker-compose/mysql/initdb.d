CREATE DATABASE IF NOT EXISTS `node-onborder` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
CREATE USER IF NOT EXISTS 'node-onborder'@'localhost' IDENTIFIED BY 'Q&re`X';
GRANT ALL PRIVILEGES ON *node-onborder.* TO 'node-onborder'@'localhost' WITH GRANT OPTION;
FLUSH PRIVILEGES;